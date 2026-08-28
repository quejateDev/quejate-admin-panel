import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Áreas de una entidad → `GET|POST /admin/areas`.
 *
 * 🔴 Aquí vive **H-11**, el hallazgo más grave del panel. El `GET` respondía
 * `include: { entity, employees, pqrs }`, y en Prisma un `include` sobre una
 * relación trae **todas** las columnas escalares del modelo relacionado: de
 * cada empleado salían `password` (el resumen bcrypt), `email`, `phone` y
 * `pushToken`, y de cada PQRSD la fila entera, **incluidas las privadas**. No
 * comprobaba nada y `entityId` era un parámetro de consulta, así que servía las
 * de cualquier entidad.
 *
 * La ruta nueva comprueba la entidad (**403**, no lista vacía), y en lugar del
 * personal y las PQRSD devuelve `_count`.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/areas");
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/admin/areas");
}
