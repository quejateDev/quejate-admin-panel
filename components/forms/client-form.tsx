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
import { Loader2 } from "lucide-react";
import { ChangePasswordDialog } from "./change-password-dialog";
import useAuthStore from "@/store/useAuthStore";
import { useEmployee } from "@/hooks/useEmployee";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

interface ClientFormProps {
  initialData?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  mode: "create" | "edit";
}

export function ClientForm({ initialData, mode }: ClientFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createEmployee, updateEmployee, isLoading } = useEmployee();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (mode === "create") {
        if (!user?.entity?.id) {
          throw new Error("Entity ID is required");
        }
        await createEmployee({
          ...values,
          role: "CLIENT",
          entityId: user.entity.id,
          phone: values.phone || "",
        });
      } else {
        if (!initialData?.id) {
          throw new Error("Employee ID is required for update");
        }
        await updateEmployee({
          id: initialData.id,
          ...values,
          role: "CLIENT",
          phone: values.phone || "",
        });
      }

      toast.success(
        mode === "create"
          ? "Empleado creado exitosamente"
          : "Empleado actualizado exitosamente"
      );
      router.push("/users");
      router.refresh();
    } catch (error) {
      toast.error("Error al guardar el empleado");
      console.error(error);
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
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
