import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Bandeja de PQRSD de la entidad → `GET /admin/pqr`; radicación → `POST /pqr`.
 *
 * 🔴 **La única ruta del panel que no tenía equivalente construido.** El
 * destino aparente, `GET /pqr`, es el **muro público**: filtra `private:
 * false`, no acota por entidad y no trae ni los filtros de área y fecha ni el
 * `totalCount` que el paginador de la pantalla necesita.
 *
 * Medido sobre el branch de desarrollo el 28/08/2026: de las 58 PQRSD con
 * creador, **37 son privadas**. Repuntar la bandeja al muro habría dejado la
 * pantalla en 21 filas de 58 sin ningún error visible, escondiéndole a la
 * entidad trámites con un plazo de la Ley 1755 corriendo. Se construyó
 * `GET /admin/pqr` en el backend (Tarea 15).
 *
 * El `POST` sí va al muro: radicar es la operación del ciudadano, y el backend
 * la sirve con el número de radicado sin condición de carrera (A-10), el
 * reCAPTCHA por interruptor propio (A-03) y los correos por `MAIL_SINK`.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/pqr");
}

export async function POST(request: Request) {
  return proxyToBackend(request, "/pqr");
}
