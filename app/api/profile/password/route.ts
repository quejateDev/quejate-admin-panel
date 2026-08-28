import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Cambio de la contraseña **propia** → `PATCH /users/:id` del backend.
 *
 * 🔴 **Por qué es una ruta aparte y por qué el id no viene del cliente.**
 *
 * Antes, cambiar la contraseña era `PATCH /api/users/:id` con `{ password }` y
 * sin pedir la actual. Esa es exactamente la primitiva de **C-01**: con una
 * sesión cualquiera —que obtenía cualquiera con cuenta en Quéjate— se ponía la
 * contraseña de **cualquier** identificador, incluido el de mayor privilegio.
 *
 * El backend cerró esa puerta: `PATCH /admin/users/:id` **no acepta
 * `password`**. La contraseña propia se cambia en `PATCH /users/:id`, que
 * exige la actual antes de cambiarla.
 *
 * Aquí el identificador sale de **la sesión**, nunca de la URL ni del cuerpo,
 * así que esta ruta no puede tocar la cuenta de otra persona ni por error ni a
 * propósito. Es el patrón que el resto del backend ya aplica (A-08, A-09).
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return proxyToBackend(
    request,
    `/users/${encodeURIComponent(session.user.id)}`,
  );
}
