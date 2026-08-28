import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Paperclip } from "lucide-react";
import { backendJson, backendJsonOrNull } from "@/lib/api/backend";
import type { EntityResponse, PqrDetail } from "@/types/api";
import { typeMap } from "@/constants/pqrMaps";
import { notFound } from "next/navigation";
import { PQRResponses } from "@/components/pqr/pqr-responses";
import { PQRStatus } from "@/components/pqr/pqr-status";

/**
 * Detalle de una PQRSD para el personal de la entidad.
 *
 * Dos llamadas en vez de una consulta con `include`: el detalle va a
 * `GET /pqr/:id` —la misma lectura del ciudadano, con autenticación opcional y
 * el gate de privadas— y las respuestas oficiales a
 * `GET /admin/pqr/:id/responses`, que sí comprueba la entidad.
 *
 * 🔴 **Lo que esta pantalla deja de mostrar: el correo y el teléfono del
 * ciudadano.** El original los sacaba de un `include: { creator: true }`, que
 * devuelve la fila `User` entera —con su resumen bcrypt de contraseña— en un
 * endpoint que además es público para las PQRSD no privadas (H-06). El backend
 * publica del autor solo `id`, `name` e `image`, y no se le pide que haga una
 * excepción aquí: el contacto entidad↔ciudadano no depende de esta pantalla,
 * va por el correo de notificación de la PQRSD, que sale del servidor. Queda
 * anotado en el informe de cierre por si la entidad echa en falta el dato.
 */
export default async function PQRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pqr = await backendJsonOrNull<PqrDetail>(
    `/pqr/${encodeURIComponent(id)}`,
  );

  if (!pqr) {
    notFound();
  }

  const responses = await backendJson<EntityResponse[]>(
    `/admin/pqr/${encodeURIComponent(id)}/responses`,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Detalles de la PQRSD</CardTitle>
            <CardDescription>
              Ver información detallada sobre esta solicitud PQRSD
            </CardDescription>
          </div>
          <PQRStatus pqrId={pqr.id} initialStatus={pqr.status} />
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span>{pqr.consecutiveCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span>{typeMap[pqr.type as keyof typeof typeMap].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado</span>
                  <span>{new Date(pqr.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha límite</span>
                  <span>
                    {pqr.hasLegalDeadline
                      ? new Date(pqr.dueDate).toLocaleDateString()
                      : "Sin plazo legal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre</span>
                  <span>
                    {pqr.anonymous ? "Anónimo" : (pqr.creator?.name ?? "Anónimo")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área</span>
                  <span>{pqr.department?.name ?? "Sin área"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de la PQRSD</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Asunto</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {pqr.subject || "No especificado"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Descripción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {pqr.description || "No especificado"}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {pqr.customFieldValues.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Adicional</h3>
                <div className="grid gap-4">
                  {pqr.customFieldValues.map((field) => (
                    <div key={field.id ?? field.name} className="space-y-2">
                      <h4 className="font-medium text-sm">{field.name}</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {field.value || "No especificado"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Attachments */}
          {pqr.attachments.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Archivos Adjuntos</h3>
                <div className="grid gap-3">
                  {pqr.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {attachment.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Responses Section */}
      <PQRResponses pqrId={pqr.id} initialResponses={responses} />
    </div>
  );
}
