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
import { ChangePasswordDialog } from "./change-password-dialog";
import useAuthStore from "@/store/useAuthStore";
import { useEmployeeById, useEmployees } from "@/hooks/useEmployees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFormProps {
  initialData?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "EMPLOYEE" | "ADMIN";
  };
  mode: "create" | "edit";
}

export function ClientForm({ initialData, mode }: ClientFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createEmployee, isLoading } = useEmployees();
  const { updateEmployee, isLoading: isUpdating } = useEmployeeById(
    initialData?.id || ""
  );

  const formSchema = z.object({
    email: z.string().email("Email inválido"),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    phone: z.string().optional(),
    password:
      mode === "create"
        ? z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
        : z.string().optional(),
    role: z.enum(["EMPLOYEE", "ADMIN"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      password: mode === "create" ? "" : undefined,
      role: initialData?.role || "EMPLOYEE",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (mode === "create") {
        if (!user?.entity?.id) {
          throw new Error("Entity ID is required");
        }
        console.log("Creating employee with:", {
          ...values,
          role: values.role,
          entityId: user.entity.id,
          phone: values.phone || "",
        });
        await createEmployee({
          ...values,
          role: values.role,
          entityId: user.entity.id,
          phone: values.phone || "",
          password: values.password || "",
        });
      } else {
        if (!initialData?.id) {
          throw new Error("Employee ID is required for update");
        }
        const updateData = {
          id: initialData.id,
          ...values,
          role: values.role,
          phone: values.phone || "",
        };
        console.log("Updating employee with:", updateData);
        await updateEmployee(updateData);
      }

      toast.success(
        mode === "create"
          ? "Empleado creado exitosamente"
          : "Empleado actualizado exitosamente"
      );
      router.push("/users");
      router.refresh();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Error al guardar el empleado");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el apellido" {...field} />
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
            disabled={false}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={false}>
            {mode === "create" ? "Crear" : "Actualizar"}
          </Button>
        </div>

        {mode !== "create" && initialData?.id && (
          <ChangePasswordDialog userId={initialData.id} />
        )}
      </form>
    </Form>
  );
}
