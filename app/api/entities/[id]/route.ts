import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Una entidad → `GET|PUT|DELETE /admin/entities/:id`.
 *
 * `PUT` exige alcance de plataforma para `categoryId`, `isVerified` e
 * `isActive`; `DELETE` comprueba dependencias y responde **409** con el motivo
 * en vez de desenganchar PQRSD y personal en silencio.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/entities/${encodeURIComponent(id)}`);
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/entities/${encodeURIComponent(id)}`);
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/entities/${encodeURIComponent(id)}`);
}
