import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Un miembro del personal → `GET|PATCH|DELETE /admin/users/:id`.
 *
 * 🔴 Es la ruta de **C-01**: aceptaba un campo `password`, así que con una
 * sesión cualquiera —que obtenía cualquiera con cuenta en Quéjate— se podía
 * tomar el control de cualquier cuenta, incluida la de mayor privilegio.
 *
 * La ruta nueva **no acepta `password`, `email` ni `entityId`**, solo alcanza a
 * personal de la propia entidad y aplica la matriz de roles. El `GET` añade
 * `entityId`, `isActive`, `departmentId` y `department`, que la pantalla de
 * edición necesitaba y el original no devolvía.
 *
 * La contraseña **propia** se cambia en `PATCH /users/:id` del backend, que
 * verifica la actual.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/users/${encodeURIComponent(id)}`);
}

export async function PATCH(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/users/${encodeURIComponent(id)}`);
}

export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/admin/users/${encodeURIComponent(id)}`);
}
