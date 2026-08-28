import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Comentarios de una PQRSD → `GET|POST /pqr/:id/comments`.
 *
 * Interacción social del ciudadano, no del panel, así que va a la superficie
 * pública. El `POST` toma el autor **de la sesión** y no del cuerpo: en el
 * original se podía comentar en nombre de otra persona (A-09).
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/pqr/${encodeURIComponent(id)}/comments`);
}

export async function POST(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/pqr/${encodeURIComponent(id)}/comments`);
}
