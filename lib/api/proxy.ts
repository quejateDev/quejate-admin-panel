import { NextResponse } from "next/server";
import { backendFetch, forwardableHeaders } from "./backend";

/**
 * Reenvío de una ruta `app/api/*` del panel al backend unificado.
 *
 * ## Por qué el panel conserva su superficie `/api/*` en vez de que el
 * navegador llame al backend directamente
 *
 * 1. **La cookie de sesión no viaja entre sitios.** Auth.js la emite con
 *    `SameSite=Lax`, así que el navegador **no** la adjunta a una petición
 *    `fetch` hacia otro sitio. El panel está en Vercel y el backend en Render
 *    (`api.quejate.com.co`): llamar directo exigiría bajar la cookie a
 *    `SameSite=None`, que es debilitar la defensa contra CSRF de toda la
 *    plataforma —móvil incluido, que comparte el emisor— para ahorrarse un
 *    salto.
 * 2. **Los componentes de servidor no tienen navegador.** Hacen falta de todos
 *    modos llamadas servidor→backend (Problema 2 del brief); con este camino
 *    son el **mismo** mecanismo que las del navegador, y no dos.
 * 3. **La reversión es de una línea por ruta.** El contrato que el navegador ve
 *    no cambia, así que volver a Prisma en una ruta concreta —si algo saliera
 *    mal en el despliegue— es restaurar ese fichero, sin tocar la interfaz.
 *
 * ## Qué NO hace este proxy
 *
 * No traduce respuestas. Donde el contrato nuevo cambió a propósito —`403`
 * donde había lista vacía, `_count` donde había la colección entera, un `id`
 * que pasa de la query al path— **se adapta la pantalla**, no se disfraza la
 * respuesta. Un adaptador que finge la forma vieja es una copia que envejece,
 * y esa es exactamente la figura de A-16.
 */

/** Métodos que llevan cuerpo. */
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Opciones de {@link proxyToBackend}. */
export interface ProxyOptions {
  /**
   * Qué hacer con la query de la petición entrante:
   * - `"forward"` (por defecto) — se reenvía tal cual.
   * - `"drop"` — no se reenvía (el valor ya viajó al path).
   * - Un `URLSearchParams` — se reenvía ese, ya compuesto por quien llama.
   */
  searchParams?: "forward" | "drop" | URLSearchParams;
}

/**
 * Reenvía la petición al backend conservando la identidad del usuario.
 *
 * @param request - La petición que recibió la ruta del panel.
 * @param path - Ruta del backend **sin** el prefijo `/api`. Es siempre una
 *   constante del código: los segmentos variables se interpolan ya codificados
 *   por quien llama, nunca se toma un host ni una ruta del cliente (API7).
 */
export async function proxyToBackend(
  request: Request,
  path: string,
  options: ProxyOptions = {},
): Promise<NextResponse> {
  const method = request.method.toUpperCase();

  const searchParams =
    options.searchParams instanceof URLSearchParams
      ? options.searchParams
      : options.searchParams === "drop"
        ? new URLSearchParams()
        : new URL(request.url).searchParams;

  const response = await backendFetch(path, {
    method,
    searchParams,
    // La cookie de ESTA petición: es la sesión del funcionario que está
    // usando el panel, no una credencial del servidor.
    cookie: request.headers.get("cookie") ?? "",
    headers: forwardableHeaders(request),
    // El cuerpo se pasa como stream: una subida de 20 MB no se materializa en
    // memoria del servidor de Next solo para volver a enviarla.
    body: METHODS_WITH_BODY.has(method) ? request.body : null,
  });

  return mirror(response);
}

/**
 * Devuelve al navegador la respuesta del backend con su estado y su cuerpo.
 *
 * Se copia el estado tal cual —incluidos `403`, `409` y `429`, que el panel
 * antes no producía— para que la interfaz pueda distinguirlos. `Set-Cookie` no
 * se propaga: la sesión la gobierna el Auth.js del panel y ninguna de estas
 * rutas emite cookies.
 */
async function mirror(response: Response): Promise<NextResponse> {
  const body = await response.arrayBuffer();
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  return new NextResponse(body.byteLength > 0 ? body : null, {
    status: response.status,
    headers,
  });
}
