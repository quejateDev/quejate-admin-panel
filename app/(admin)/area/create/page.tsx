// app/dashboard/area/create/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { EntitySelectField } from "@/components/EntitySelectField";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDepartments } from "@/hooks/useDeparments";

function NewAreaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  // Pre-selecciona la entidad si viene desde /area (?entityId=...).
  const [entityId, setEntityId] = useState(
    searchParams.get("entityId") ?? ""
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
  });

  const { createDepartment } = useDepartments({ entityId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entityId) {
      toast({
        title: "Selecciona una entidad",
        description: "Debes elegir la entidad a la que pertenece el área",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await createDepartment.mutateAsync({
        ...formData,
        entityId,
      });
      toast({
        title: "Área creada",
        description: "El área ha sido creada exitosamente",
      });
      router.push("/area");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al crear el área",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Área</CardTitle>
          <CardDescription>Ingrese los datos del área</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <EntitySelectField value={entityId} onChange={setEntityId} />
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/area")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Área"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewAreaPage() {
  return (
    <Suspense fallback={null}>
      <NewAreaForm />
    </Suspense>
  );
}
