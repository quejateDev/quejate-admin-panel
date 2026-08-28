import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Entidad a la que pertenece un usuario → `GET /admin/users/:id/entity`.
 *
 * Forma intacta, clave `Entity` en mayúscula incluida. Preguntar por uno mismo
 * siempre pasa, que es el uso real (`useUserWithEntity`).
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/users/${encodeURIComponent(id)}/entity`,
  );
}
