import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Perfil propio → `GET|PATCH /admin/profile`.
 *
 * 🔴 **Esta es la ruta que arregla «Mi Perfil».** La pantalla mandaba
 * `lastName`, un campo que **no existe en el modelo `User`**, así que guardar
 * devolvía 500 siempre. El `PATCH` nuevo acepta solo `name`, como el original
 * pretendía, y la pantalla ya no manda el campo inexistente.
 *
 * De paso, el perfil propio deja de pasar por `/api/users/:id`: esta ruta
 * existía, estaba bien hecha y no la usaba nadie.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/profile");
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, "/admin/profile");
}
