import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Verificar (o rechazar) a un abogado → `PATCH /admin/lawyers/verify`.
 *
 * Exige sesión y rol: era un trámite abierto.
 */
export async function PATCH(request: Request) {
  return proxyToBackend(request, "/admin/lawyers/verify");
}
