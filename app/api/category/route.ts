import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Categorías de entidad → `GET|POST /admin/categories`.
 *
 * Exige alcance de plataforma. El `GET` trae también las inactivas y, en vez de
 * la lista completa de entidades de cada categoría, un `_count`. Un nombre
 * repetido en el `POST` responde **409**, no 500.
 *
 * De paso desaparece un problema de infraestructura: los manejadores de
 * `category` abrían `new PrismaClient()` por petición, que agota las conexiones
 * de Neon (H-03).
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/categories");
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/admin/categories");
}
