"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";
import { ChangePasswordDialog } from "@/components/forms/change-password-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useProfile } from "@/hooks/useProfile";


/**
 * «Mi Perfil».
 *
 * 🔴 **Esta pantalla devolvía 500 siempre al guardar.** Mandaba `lastName`, un
 * campo que **no existe en el modelo `User`** —el nombre va entero en `name`—,
 * y lo mandaba además a `PATCH /api/users/:id`, la ruta insegura, en vez de a
 * `/api/profile`, que existía, estaba bien hecha y no la usaba nadie.
 *
 * Ahora el campo «Apellido» no está (no tenía dónde guardarse) y el guardado va
 * por `PATCH /admin/profile`, que acepta exactamente `name`.
 */
export default function ProfilePage() {
  const { toast } = useToast();
  const user = useCurrentUser();
  const { data: userData, updateProfile, isLoading } = useProfile();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
  });

  useEffect(() => {
    setFormData({
      name: userData?.name || "",
      email: userData?.email || "",
    });
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Solo `name`: el correo es la identidad de la cuenta y no se cambia
      // desde aquí (el backend tampoco lo acepta).
      await updateProfile({ name: formData.name });

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData?.image || undefined} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cambiar Contraseña</Label>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
                {user?.id && <ChangePasswordDialog />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
