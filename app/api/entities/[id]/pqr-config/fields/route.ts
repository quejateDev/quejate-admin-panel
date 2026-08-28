import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Campos personalizados del formulario de una entidad →
 * `GET|PUT /admin/entities/:id/pqr-config/fields`.
 *
 * El `PUT` valida los tipos, pone un techo de 50 campos y exige nombres únicos;
 * el reemplazo es transaccional y ya no fija `allowAnonymous: true` al crear la
 * configuración.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/pqr-config/fields`,
  );
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/pqr-config/fields`,
  );
}
