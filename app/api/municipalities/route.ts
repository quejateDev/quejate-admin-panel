import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Municipios de un departamento → `GET /municipalities?departmentId=`.
 *
 * Mismo parámetro y misma forma. Sin `departmentId` responde 400 (como antes) y
 * con un departamento inexistente, 404 en vez de una lista vacía.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/municipalities");
}
