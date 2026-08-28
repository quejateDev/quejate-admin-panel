import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Una categoría → `GET|PUT|DELETE /admin/categories/:id`.
 *
 * El `PUT` acepta además `isActive`; el `DELETE` comprueba que no queden
 * entidades colgando y responde 409 con el motivo.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/categories/${encodeURIComponent(id)}`);
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/categories/${encodeURIComponent(id)}`);
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/categories/${encodeURIComponent(id)}`);
}
