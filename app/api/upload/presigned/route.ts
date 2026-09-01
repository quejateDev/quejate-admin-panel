import { proxyToBackend } from "@/lib/api/proxy";

/**
 * URL prefirmada de subida → `POST /upload/presigned`.
 *
 * Misma corrección que la subida directa (H-07): sesión obligatoria, tipo y
 * destino contra lista blanca, nombre saneado y límite propio.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, "/upload/presigned");
}
