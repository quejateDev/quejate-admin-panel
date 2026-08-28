import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Asignar una PQRSD → `PATCH /admin/pqr/:id/assign`.
 *
 * 🔴 Dos cosas que no hacía. Primera: comprobar la entidad — un empleado de una
 * entidad podía asignar una PQRSD de otra con solo conocer su identificador.
 * Segunda: **validar a quién se asigna**, que en el panel está literalmente
 * comentado, así que `assignedToId` aceptaba cualquier identificador de
 * usuario, incluido el de un ciudadano cualquiera, y dejaba la PQRSD asignada a
 * quien no puede atenderla y ya en `IN_PROGRESS`.
 */
export async function PATCH(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/pqr/${encodeURIComponent(id)}/assign`,
  );
}
