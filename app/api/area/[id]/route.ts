import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Un área → `GET|PATCH|DELETE /admin/areas/:id`.
 *
 * El `PATCH` va contra un DTO cerrado y **no acepta `entityId`**: antes era
 * asignación masiva y se podía mover un área a otra entidad (H-03). El `DELETE`
 * comprueba dependencias y responde 409 con el motivo.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/areas/${encodeURIComponent(id)}`);
}

export async function PATCH(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/areas/${encodeURIComponent(id)}`);
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/areas/${encodeURIComponent(id)}`);
}
