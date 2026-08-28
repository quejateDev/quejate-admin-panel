import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Catálogo de entidades **de administración** → `GET|POST /admin/entities`.
 *
 * Cambia respecto de lo que servía esta ruta: acota por entidad (un `ADMIN` ve
 * la suya; sin entidad, lista vacía), el municipio y el departamento llegan
 * resueltos y planos, `POST` responde **201** y no acepta `isVerified`.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/entities");
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/admin/entities");
}
