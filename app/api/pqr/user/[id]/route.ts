import { proxyToBackend } from "@/lib/api/proxy";

/**
 * PQRSD creadas por un usuario → `GET /pqr/user/:id`.
 *
 * Autenticación opcional: el dueño del perfil ve también las suyas privadas.
 * Ya no devuelve `creator.email`, que era cosechable conociendo un `userId`
 * (H-05).
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/pqr/user/${encodeURIComponent(id)}`);
}
