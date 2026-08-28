export const dynamic = 'force-dynamic';

import { SuggestionsTable } from "@/components/SuggestionsTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { backendJson } from "@/lib/api/backend";
import type { EntitySuggestionsPage } from "@/types/api";

/**
 * Sugerencias de entidad que mandan los ciudadanos.
 *
 * Antes leía la tabla con Prisma sin comprobar nada y resolvía los nombres de
 * departamento y municipio en la propia página, recorriendo `colombia-geo.json`
 * y construyendo dos mapas en cada petición. Ahora los resuelve el backend, que
 * ya tiene el catálogo cargado en memoria, y la ruta exige **alcance de
 * plataforma**: estas sugerencias son de toda Quéjate, no de una entidad.
 */
export default async function EntitySuggestionsPage() {
  const data = await backendJson<EntitySuggestionsPage>(
    "/admin/entity-suggestions",
    { searchParams: { page: "1", limit: "10" } },
  );

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold pt-10 mb-8">Entidades Sugeridas</h1>
      <Card>
        <CardHeader />
        <CardContent>
          <SuggestionsTable
            initialSuggestions={data.suggestions}
            initialPagination={data.pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
