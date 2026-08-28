import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Catálogo **público** de categorías → `GET /category`.
 *
 * 🔴 **Por qué hace falta una ruta más de la que había.** `/api/category` pasó
 * a `GET /admin/categories`, que exige **alcance de plataforma**: solo un
 * `SUPER_ADMIN`. Pero el desplegable de categorías no sale solo en la pantalla
 * de administrar categorías — también en el formulario de entidad y en el
 * filtro del listado, que un `ADMIN` de entidad usa. Repuntar los dos usos a la
 * ruta de administración le habría dejado un **403 en un desplegable**.
 *
 * El catálogo público (Tarea 04) es exactamente la fuente correcta para eso:
 * existe para que alguien elija una categoría, y es la misma lista que ve el
 * ciudadano. Trae solo las **activas**, que además es lo que un desplegable de
 * selección debe ofrecer.
 *
 * ⚠️ Next resuelve los segmentos estáticos antes que los dinámicos, así que
 * `/api/category/catalog` no lo atrapa `/api/category/[id]`.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/category");
}
