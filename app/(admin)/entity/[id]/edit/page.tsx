import { EntityForm } from '@/components/entities/entity-form'
import prisma from '@/lib/prisma'
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

export default async function EditEntityPage({ params }: EditEntityPageProps) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id }
  })

  if (!entity) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-end mb-4">
        <Link href={`/entity/${id}/pqr-config`}>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar PQR
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
