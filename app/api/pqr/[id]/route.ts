import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Detalle de una PQRSD → `GET /pqr/:id`.
 *
 * Va a la superficie del ciudadano y no a `/admin`, porque es la misma lectura:
 * autenticación opcional, y si la PQRSD es privada pasan su dueño y los roles
 * `EMPLOYEE`/`ADMIN`/`SUPER_ADMIN`. La respuesta ya no arrastra la fila `User`
 * completa del creador —con su resumen de contraseña— como hacía el
 * `include: { creator: true }` original (H-06).
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/pqr/${encodeURIComponent(id)}`);
}
