import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Configuración de PQRSD de un área → `GET|PUT /admin/areas/:id/pqr-config`.
 *
 * ⚠️ **No confundir con `GET /area/:id/pqr-config` del backend**, que es la
 * ruta **pública** del formulario del ciudadano y sigue sin guards. Esta es la
 * de administración, y es la otra mitad de **H-12**: el plazo legal del área
 * tampoco se comprobaba.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/areas/${encodeURIComponent(id)}/pqr-config`,
  );
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/areas/${encodeURIComponent(id)}/pqr-config`,
  );
}
