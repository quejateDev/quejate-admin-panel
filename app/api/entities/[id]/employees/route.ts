import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Personal de una entidad → `GET|POST /admin/entities/:id/employees`.
 *
 * `POST` es el alta que antes vivía en `POST /api/users` con el `entityId` en
 * el cuerpo. Dos cambios que se notan: la respuesta **ya no incluye el resumen
 * de la contraseña** (H-02) y el `role` está sujeto a la matriz de quién puede
 * conceder qué — nadie se concede administrador a sí mismo.
 */
export async function GET(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/employees`,
  );
}

export async function POST(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(id)}/employees`,
  );
}
