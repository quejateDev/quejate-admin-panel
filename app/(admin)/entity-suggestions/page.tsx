export const dynamic = 'force-dynamic';

import { SuggestionsTable } from "@/components/SuggestionsTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import geoData from "@/data/colombia-geo.json";

async function getEntitySuggestions() {
  const page = 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const departmentMap = new Map<string, string>();
  const municipalityMap = new Map<string, string>();

  geoData.departments.forEach((dept) => {
    departmentMap.set(dept.id, dept.name);
    dept.municipalities.forEach((mun) => {
      municipalityMap.set(mun.id, mun.name);
    });
  });

  const [suggestions, total] = await Promise.all([
    prisma.entitySuggestion.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.entitySuggestion.count(),
  ]);

  const result = suggestions.map((suggestion) => ({
    ...suggestion,
    departmentName: departmentMap.get(suggestion.regionalDepartmentId) || null,
    municipalityName: suggestion.municipalityId
      ? municipalityMap.get(suggestion.municipalityId) || null
      : null,
  }));

  return {
    suggestions: result,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export default async function EntitySuggestionsPage() {
  const data = await getEntitySuggestions();

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