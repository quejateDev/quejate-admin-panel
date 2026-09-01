import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Reacción a una PQRSD → `POST /pqr/:id/like`.
 *
 * El autor sale de la sesión, no del cuerpo (A-09).
 */
export async function POST(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/pqr/${encodeURIComponent(id)}/like`);
}
