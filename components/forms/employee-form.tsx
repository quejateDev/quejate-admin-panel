"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEmployeeById, useEmployees } from "@/hooks/employee/useEmployees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFormProps {
  initialData?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: "EMPLOYEE" | "ADMIN";
    departmentId: string;
  };
  mode: "create" | "edit";
  departments: any[];
  entityId?: string;
}

export function EmployeeForm({
  initialData,
  mode,
  departments,
  entityId,
}: EmployeeFormProps) {
  const router = useRouter();

  const { createEmployee, isLoading } = useEmployees(entityId ?? "");
  const { updateEmployee, isLoading: isUpdating } = useEmployeeById(
    initialData?.id || ""
  );

  const formSchema = z.object({
    email: z.string().email("Email inválido"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().optional(),
    password:
      mode === "create"
        ? z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
        : z.string().optional(),
    role: z.enum(["EMPLOYEE", "ADMIN"]),
    departmentId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      password: mode === "create" ? "" : undefined,
      role: initialData?.role || "EMPLOYEE",
      departmentId: initialData?.departmentId || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (mode === "create") {
        if (!entityId) {
          toast.error("Selecciona una entidad para el empleado");
          return;
        }
        await createEmployee({
          ...values,
          name: values.name,
          email: values.email,
          role: values.role,
          phone: values.phone || "",
          password: values.password || "",
          departmentId: values.departmentId || "",
        });
      } else {
        if (!initialData?.id) throw new Error("Employee ID is required for update");

        const updateData = {
          id: initialData.id,
          ...values,
          name: values.name,
          email: values.email,
          role: values.role,
          phone: values.phone || "",
          departmentId: values.departmentId || "",
        };

        await updateEmployee(updateData);
      }

      toast.success(
        mode === "create"
          ? "Empleado creado exitosamente"
          : "Empleado actualizado exitosamente"
      );
      router.push("/users");
      router.refresh();
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      const serverMessage = error?.response?.data?.error;
      toast.error(serverMessage || "Error al guardar el empleado");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ingrese el email"
                  {...field}
                  disabled={mode === "edit"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el departamento del empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "create" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Ingrese la contraseña"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/users")}
            disabled={isLoading || isUpdating}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || isUpdating}>
            {mode === "create" ? "Crear" : "Actualizar"}
          </Button>
        </div>

        {/*
          🔴 Aquí había un «Cambiar contraseña» que ponía la contraseña de
          ESTE empleado sin pedir la suya actual. Es la primitiva de C-01 y el
          backend ya no la ofrece: `PATCH /admin/users/:id` no acepta
          `password`. Quien olvida su contraseña la restablece por correo; el
          resto se cambia la propia desde «Mi Perfil».
        */}
      </form>
    </Form>
  );
}
