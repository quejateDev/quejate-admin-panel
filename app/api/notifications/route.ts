import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Notificaciones del usuario → `GET|PATCH|DELETE /notifications`.
 *
 * El `GET` es además el que **genera** los avisos de vencimiento de plazo: al
 * pedir la lista busca las PQRSD del usuario con el plazo pasado y crea el
 * aviso si no existe (no lo hace ningún proceso programado, B-06).
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/notifications");
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, "/notifications");
}

export async function DELETE(request: Request) {
  return proxyToBackend(request, "/notifications");
}
