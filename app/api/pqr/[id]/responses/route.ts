import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Respuestas oficiales de la entidad →
 * `GET|POST /admin/pqr/:id/responses`.
 *
 * Comprueban la entidad (una PQRSD ajena responde **403**, no una lista vacía:
 * la pregunta es por *esta* PQRSD y decir que no tiene respuestas sería falso).
 * El `POST` va acotado por usuario —60 cada 15 minutos— porque cada llamada
 * manda un correo y dispara un push, y se cuenta por usuario y no por IP porque
 * el personal de una entidad comparte oficina y NAT (A-18).
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/pqr/${encodeURIComponent(id)}/responses`,
  );
}

export async function POST(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/pqr/${encodeURIComponent(id)}/responses`,
  );
}
