import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Campos personalizados del formulario de un área →
 * `GET|PUT /admin/areas/:id/pqr-config/fields`.
 *
 * El `GET` es **nuevo** en el backend (el panel solo tenía `PUT`), por simetría
 * con la entidad. El `PUT` deja además de reventar con `P2025` sobre un área
 * que todavía no tiene configuración.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/areas/${encodeURIComponent(id)}/pqr-config/fields`,
  );
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/areas/${encodeURIComponent(id)}/pqr-config/fields`,
  );
}
