import { SuggestionsTable } from "@/components/SuggestionsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getEntitySuggestions() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entity-suggestions?page=1&limit=10`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching entity suggestions:', error);
    return {
      suggestions: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  }
}

export default async function EntitySuggestionsPage() {
  const data = await getEntitySuggestions();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold pt-10 mb-8">Entidades Sugeridas</h1>
      <Card>
        <CardHeader>
        </CardHeader>
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
