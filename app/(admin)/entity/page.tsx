import { Button } from "@/components/ui/button";
import { EntitiesTable } from "@/components/EntitiesTable";
import { backendJson } from "@/lib/api/backend";
import type { AdminEntityListItem, PublicCategory } from "@/types/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Listado de entidades.
 *
 * 🔴 **Antes consultaba Prisma directamente y sin comprobar nada**, así que
 * cualquiera con sesión veía **las 254 entidades de la plataforma**, fuera o no
 * de la suya. Ahora pregunta al backend con la identidad de quien mira, y el
 * `EntityScopeGuard` decide: un `SUPER_ADMIN` las ve todas y un `ADMIN` ve la
 * suya.
 *
 * Las categorías salen del **catálogo público** y no de `/admin/categories`,
 * que es solo para alcance de plataforma: aquí se usan para llenar un filtro,
 * no para administrarlas, y un `ADMIN` recibiría 403 de la otra.
 */
export default async function EntitiesPage() {
  const [entities, categories] = await Promise.all([
    backendJson<AdminEntityListItem[]>("/admin/entities"),
    backendJson<PublicCategory[]>("/category"),
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Entidades</h1>
        <Link href="/entity/create">
          <Button>Crear Entidad</Button>
        </Link>
      </div>
      <EntitiesTable entities={entities} categories={categories} />
    </div>
  );
}
