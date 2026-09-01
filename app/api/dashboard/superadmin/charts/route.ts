import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Tablero → `GET /admin/dashboard/platform/charts`.
 *
 * 🔴 **Los tableros ahora comprueban el rol.** En el panel ninguno de los
 * cuatro lo hacía en su manejador, así que los de plataforma —los números de
 * toda Quéjate— los servía cualquier cuenta con sesión. Los de `platform` son
 * ahora solo para `SUPER_ADMIN`; los de entidad, para su `ADMIN` y su
 * `EMPLOYEE`, y un `SUPER_ADMIN` debe indicar `?entityId=`.
 *
 * Se llaman `platform` y no `superadmin` porque nombrar una ruta por el rol
 * que la consume envejece mal: la ruta dice de **qué** habla, y quién entra lo
 * deciden los guards.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/dashboard/platform/charts");
}
