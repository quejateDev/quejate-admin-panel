import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { typeMap } from "@/constants/pqrMaps";
import { notFound } from "next/navigation";
import { PQRResponses } from "@/components/pqr/pqr-responses";
import { PQRStatus } from "@/components/pqr/pqr-status";

export default async function PQRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pqr = await prisma.pQRS.findUnique({
    where: {
      id,
    },
    include: {
      department: true,
      creator: true,
      customFieldValues: true,
      attachments: true,
      comments: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!pqr) {
    notFound();
  }

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
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre</span>
                  <span>
                    {pqr.creator?.firstName} {pqr.creator?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correo</span>
                  <span>{pqr.creator?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono</span>
                  <span>{pqr.creator?.phone}</span>
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

          <Separator className="my-6" />

          {/* Custom Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Adicional</h3>
            <div className="grid gap-4">
              {pqr.customFieldValues.map((field) => (
                <div key={field.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{field.name}</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {field.value || "No especificado"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses Section */}
      <PQRResponses pqrId={pqr.id} initialResponses={pqr.comments} />
    </div>
  );
}
