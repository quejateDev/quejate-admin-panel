import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Configuración de PQRSD de una entidad →
 * `GET|PUT /admin/entities/:id/pqr-config`.
 *
 * 🔴 Aquí vive **H-12**: `maxResponseTime` es el número de días hábiles del que
 * sale la fecha límite de cada PQRSD nueva, un término de la **Ley 1755 de
 * 2015**, y esta ruta no comprobaba sesión, ni rol, ni entidad. Ahora comprueba
 * la entidad, valida el rango 1–15 y deja rastro de cada cambio en el log.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/pqr-config`,
  );
}

export async function PUT(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/pqr-config`,
  );
}
