import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Catálogo de departamentos → `GET /regional-departments`.
 *
 * Catálogo público: mismo array pelado, mismos 33 departamentos con sus
 * municipios anidados y ordenados. El backend lo sirve del catálogo en memoria
 * y no de la base de datos (R-03: el JSON y las tablas son idénticos).
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/regional-departments");
}
