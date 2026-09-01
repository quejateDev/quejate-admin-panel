import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Historial y cambio de estado → `GET|PATCH /admin/pqr/:id/status`.
 *
 * Con alcance por entidad, la transacción que impide un cambio de estado sin su
 * rastro, y el rechazo del cambio al estado que la PQRSD ya tiene.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/pqr/${encodeURIComponent(id)}/status`,
  );
}

export async function PATCH(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/pqr/${encodeURIComponent(id)}/status`,
  );
}
