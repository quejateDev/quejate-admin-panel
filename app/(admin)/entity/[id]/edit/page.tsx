import { EntityForm } from '@/components/entities/entity-form'
import { backendJsonOrNull } from '@/lib/api/backend'
import type { AdminEntityDetail } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"
import { notFound } from 'next/navigation'

interface EditEntityPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Edición de una entidad.
 *
 * Antes leía la fila con Prisma sin comprobar de quién era; ahora la pide al
 * backend con la identidad de quien edita. Una entidad ajena responde **403**,
 * que sube como error de la página en vez de mostrar el formulario relleno con
 * los datos de otra entidad.
 */
export default async function EditEntityPage({ params }: EditEntityPageProps) {
  const { id } = await params;
  const entity = await backendJsonOrNull<AdminEntityDetail>(
    `/admin/entities/${encodeURIComponent(id)}`,
  );

  if (!entity) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <Link href={`/entity/${id}/pqr-config`}>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar PQRSD
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Entidad</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm entity={entity} />
        </CardContent>
      </Card>
    </div>
  )
}
