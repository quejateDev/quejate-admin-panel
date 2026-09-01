import { AreaForm } from "@/components/forms/area-form"
import { PQRConfigForm } from "@/components/forms/pqr-config-form"
import PqrFieldsForm from "@/components/forms/pqr-fields-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { backendJsonOrNull } from "@/lib/api/backend"
import type { AdminAreaDetail, PqrCustomField } from "@/types/api"
import { notFound } from "next/navigation"

interface AreaPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Edición de un área, con su configuración de PQRSD y sus campos.
 *
 * 🔴 Esta pantalla es la que escribe el **plazo legal de respuesta** del área
 * (`maxResponseTime`, Ley 1755). Antes leía y guardaba sin comprobar ni sesión
 * ni entidad — **H-12**. Ahora el área se pide al backend con la identidad de
 * quien edita, y una de otra entidad responde 403.
 *
 * Los campos personalizados se piden aparte, a
 * `GET /admin/areas/:id/pqr-config/fields`, que es una ruta **nueva** del
 * backend: el panel solo tenía el `PUT`, y aquí los sacaba de un `include`
 * anidado en la propia área.
 */
export default async function AreaPage({ params }: AreaPageProps) {
  const { id } = await params;
  const path = `/admin/areas/${encodeURIComponent(id)}`;

  const area = await backendJsonOrNull<AdminAreaDetail>(path);
  if (!area) {
    notFound()
  }

  const fields = await backendJsonOrNull<{ customFields: PqrCustomField[] }>(
    `${path}/pqr-config/fields`,
  );

  return (
    <div className="flex flex-col gap-4 mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editar Área</CardTitle>
          <CardDescription>
            Edita la información de un área existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaForm
            initialData={{
              id: area.id,
              name: area.name,
              email: area.email,
              description: area.description || "",
            }}
            isEditing={true}
          />
        </CardContent>
      </Card>

      <PQRConfigForm 
        areaId={area.id} 
        initialData={{
          allowAnonymous: area.pqrConfig?.allowAnonymous || false,
          requireEvidence: area.pqrConfig?.requireEvidence || false,
          maxResponseTime: area.pqrConfig?.maxResponseTime ? area.pqrConfig.maxResponseTime.toString() : "15",
          notifyEmail: area.pqrConfig?.notifyEmail || true,
          autoAssign: area.pqrConfig?.autoAssign || false,
        }} 
      />

      <PqrFieldsForm 
        areaId={area.id} 
        initialData={{
          customFields: (fields?.customFields ?? []).map((field) => ({
            name: field.name,
            required: field.required,
            type: field.type,
            isForAnonymous: field.isForAnonymous,
          })),
        }} 
      />
    </div>
  )
}
