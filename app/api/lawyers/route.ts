import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Directorio de abogados para verificación → `GET /admin/lawyers`.
 *
 * 🔴 La ruta del panel **no comprobaba sesión ni rol** y devolvía el documento
 * de identidad y las fotos de la cédula y la tarjeta profesional de cada
 * abogado (H-09). La nueva exige sesión y rol, y la identidad vive aparte, en
 * `GET /lawyer/:id/identity`, para el titular y para `ADMIN`/`SUPER_ADMIN`.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/lawyers");
}
