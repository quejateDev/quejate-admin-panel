import { cookies } from "next/headers";

/**
 * Cliente **de servidor** contra el backend unificado (`quejate-backend`).
 *
 * Todo el panel pasa por aquí: las rutas de `app/api/*`, que dejaron de hablar
 * con Prisma y ahora reenvían al backend, y los componentes de servidor, que
 * hacían lo mismo desde la propia página.
 *
 * ## Cómo viaja la identidad, que es lo único que importa de este fichero
 *
 * El backend valida **el mismo JWE** que emite el Auth.js del panel: comparten
 * `AUTH_SECRET`, y `JweAuthGuard` lee primero la cookie de sesión —cuyo nombre
 * es el `AUTH_SALT`— y luego el `Authorization: Bearer`. Así que basta con
 * **reenviar la cookie de la petición entrante**, tal cual, sin traducir nada:
 *
 * - En una ruta de `app/api/*` la cookie llega en la petición del navegador.
 * - En un componente de servidor llega igual, y `cookies()` la expone.
 *
 * 🔴 **No hay credencial de servicio, y es deliberado.** Si el panel se
 * autenticara con una cuenta técnica, todas las peticiones llegarían al backend
 * como el mismo usuario y `EntityScopeGuard` dejaría de poder distinguir quién
 * pregunta: se caería el aislamiento por entidad entero (12b y 12c), que es
 * justo lo que el repunte viene a poner en vigor. Cada petición llega con el
 * usuario real, y el guard relee su rol y su entidad frescos de la base.
 *
 * ## Por qué se reenvía la cabecera `Cookie` entera y no se compone
 *
 * El nombre de la cookie **cambia con el esquema**: Auth.js antepone
 * `__Secure-` solo sobre HTTPS, así que en producción es
 * `__Secure-authjs.session-token` y en local `authjs.session-token`. Reenviando
 * lo que el navegador mandó, el panel no tiene que saber en cuál de los dos
 * entornos corre — y el backend, que sí lo sabe por su `AUTH_SALT`, escoge.
 * Adivinar el nombre aquí sería reintroducir A-02 por tercera vez.
 */

/** Base del backend unificado. En local, el `PORT` por defecto de Nest. */
const BACKEND_URL = (
  process.env.BACKEND_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

/**
 * Prefijo global del backend. `configureApp` monta todo bajo `/api`, así que
 * `/admin/pqr` se sirve en `/api/admin/pqr`.
 */
const BACKEND_PREFIX = "/api";

/** Cabeceras que NO se reenvían al backend aunque vengan en la petición. */
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
]);

/**
 * Cabecera con la que este proxy le declara al backend la IP del ciudadano, y
 * la que autentica esa declaración (**R-36**, salida A).
 *
 * 🔴 **La clave no es opcional para el backend**: sin ella —o con una que no
 * cuadre— descarta la IP declarada y baja de escalón. Por eso las dos se
 * emiten juntas o no se emite ninguna: media declaración solo produce un aviso
 * en el log del backend y ningún efecto.
 *
 * Por qué una cabecera propia y no `X-Forwarded-For`: a `api.quejate.com.co`
 * se llega por dos caminos de distinta longitud —por aquí son tres saltos,
 * directo son dos— y Cloudflare **añade** a `X-Forwarded-For` en vez de
 * reemplazarla, así que no hay ningún `TRUST_PROXY_HOPS` correcto para los
 * dos. Un nombre propio y un secreto no dependen de contar saltos.
 */
const CLIENT_IP_HEADER = "x-quejate-client-ip";
const PROXY_KEY_HEADER = "x-quejate-proxy-key";

/**
 * Secreto compartido con el backend (`TRUSTED_PROXY_SECRET`, el **mismo** valor
 * en Render y en los dos proyectos de Vercel).
 *
 * Se lee del entorno del servidor y **nunca** llega al navegador: no lleva
 * prefijo `NEXT_PUBLIC_`, y esta función solo corre en el servidor.
 */
const TRUSTED_PROXY_SECRET = process.env.TRUSTED_PROXY_SECRET;

/** Un solo aviso por instancia, igual que el de la IP ausente. */
let warnedAboutMissingSecret = false;

/**
 * Cabeceras de reenvío que **nunca** se dejan pasar tal cual, aunque vengan en
 * la petición. Se sustituyen por el valor de confianza (ver
 * {@link trustedClientIp}) o no se envían.
 *
 * 🔴 **Es la mitad del arreglo de R-36 que puede convertirlo en algo peor.**
 * El backend acota por IP y, para saber cuál es, lee `X-Forwarded-For`. Si esta
 * ruta reenviara la cabecera que mandó el cliente, cualquiera con una cuenta
 * podría escribir en ella la IP que quisiera —una distinta en cada petición— y
 * **saltarse el limitador entero**. Un cubo compartido es un problema de
 * disponibilidad; un limitador que se puede evadir a voluntad es un problema de
 * seguridad.
 *
 * `forwardableHeaders` copiaba todo lo que no fuera salto-a-salto, y
 * `x-forwarded-for` no figuraba en esa lista: la que mandara el navegador
 * llegaba entera al backend.
 */
const CLIENT_CONTROLLED_FORWARDING = new Set([
  "forwarded",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "x-client-ip",
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "true-client-ip",
  // 🔴 Las dos de R-36 salida A, y son las que hacen inútil todo lo demás si
  // se olvidan. Este proxy las EMITE, así que si además copiara las entrantes,
  // el cliente podría mandar su propio par —IP inventada y una clave a
  // probar— y el backend recibiría dos valores para cada nombre. Se descartan
  // aquí, antes de que se pongan los nuestros.
  CLIENT_IP_HEADER,
  PROXY_KEY_HEADER,
]);

/**
 * La **única** cabecera cuyo valor se acepta como IP del cliente: la que
 * escribe Vercel en el borde, descartando la que traiga el cliente con ese
 * mismo nombre.
 *
 * 🔴 **Una sola, y no una lista de respaldos.** `x-forwarded-for` y `x-real-ip`
 * también las pone Vercel, pero son nombres genéricos que cualquier proxy usa
 * y que un cliente intentaría falsificar; aceptarlas «por si acaso» significa
 * confiar en ellas justo el día en que la primera falte, que es exactamente
 * cuando algo raro está pasando. Con una sola fuente, equivocarse degrada a
 * cubo compartido —un problema de disponibilidad, el mismo que había antes— y
 * **nunca** a límite evadible, que es un problema de seguridad. De los dos
 * modos de fallo, este es el que se elige.
 *
 * Si el despliegue dejara de estar en Vercel, esta constante es la línea que
 * hay que cambiar, y el aviso de {@link trustedClientIp} avisa de que hace
 * falta.
 */
const PLATFORM_CLIENT_IP_HEADER = "x-vercel-forwarded-for";

/** Un solo aviso por instancia: sin esto sería una línea de log por petición. */
let warnedAboutMissingClientIp = false;

/**
 * IP del cliente **según la plataforma**, o `null` si no la hay.
 *
 * `null` no es un fallo en local: no hay proxy delante y el backend usa la IP
 * del socket, que es la correcta. Pero en producción significaría que el
 * limitador del backend ha vuelto a ver a todo el panel como un solo cliente
 * (**R-36**), así que se avisa una vez por instancia para que quede en los logs
 * de Vercel en lugar de degradarse en silencio — que es el patrón que costó
 * **A-21**.
 */
export function trustedClientIp(request: Request): string | null {
  // Vercel manda una sola IP; si algún día llegara una lista, la primera
  // entrada es la del cliente y las siguientes los saltos intermedios.
  const value = request.headers
    .get(PLATFORM_CLIENT_IP_HEADER)
    ?.split(",")[0]
    ?.trim();
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production" && !warnedAboutMissingClientIp) {
    warnedAboutMissingClientIp = true;
    console.warn(
      "[proxy] sin cabecera de IP de cliente de la plataforma: el backend " +
        "contará el rate limit por la IP de salida de este servidor (R-36).",
    );
  }
  return null;
}

/**
 * Cabecera `Cookie` de la petición en curso.
 *
 * Sirve tanto en una ruta de `app/api/*` como en un componente de servidor: en
 * los dos casos `cookies()` devuelve el tarro de la petición entrante.
 */
export async function sessionCookieHeader(): Promise<string> {
  return (await cookies()).toString();
}

/** Opciones de {@link backendFetch}. */
export interface BackendFetchOptions {
  method?: string;
  /** Cuerpo ya serializado, o un `FormData`/stream para multipart. */
  body?: BodyInit | null;
  /** Query a añadir. Los valores `undefined` o vacíos se omiten. */
  searchParams?: URLSearchParams | Record<string, string | undefined>;
  /**
   * Cabecera `Cookie` a reenviar. Por defecto, la de la petición en curso.
   * Las rutas de `app/api/*` pasan la del `Request` que reciben.
   */
  cookie?: string;
  /** Cabeceras extra (`content-type`, típicamente). */
  headers?: Record<string, string>;
  /** `no-store` por defecto: son datos de gestión, nunca cacheables. */
  cache?: RequestCache;
}

/**
 * Llama al backend unificado con la identidad del usuario de la petición.
 *
 * @param path - Ruta **sin** el prefijo `/api` (p. ej. `/admin/pqr`). Siempre
 *   una constante del código; nunca un valor que venga del cliente, para que no
 *   haya forma de apuntar el panel a otro host (SSRF, OWASP API7). Los
 *   segmentos variables van codificados por quien llama.
 */
export async function backendFetch(
  path: string,
  options: BackendFetchOptions = {},
): Promise<Response> {
  const url = new URL(`${BACKEND_URL}${BACKEND_PREFIX}${path}`);

  if (options.searchParams instanceof URLSearchParams) {
    url.search = options.searchParams.toString();
  } else if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers = new Headers(options.headers);
  const cookie = options.cookie ?? (await sessionCookieHeader());
  if (cookie) {
    headers.set("cookie", cookie);
  }

  return fetch(url, {
    method: options.method ?? "GET",
    body: options.body ?? undefined,
    headers,
    cache: options.cache ?? "no-store",
    // Necesario cuando `body` es un stream (la subida de ficheros).
    ...(options.body instanceof ReadableStream ? { duplex: "half" } : {}),
  } as RequestInit);
}

/**
 * Lo mismo, devolviendo ya el JSON tipado.
 *
 * @throws {BackendError} si el backend no responde 2xx. Los componentes de
 *   servidor lo dejan subir: un fallo de datos debe romper la página, no
 *   pintarla a medias (el modo de fallo de A-12).
 */
export async function backendJson<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const response = await backendFetch(path, options);
  if (!response.ok) {
    throw await BackendError.from(response, path);
  }
  return (await response.json()) as T;
}

/**
 * Igual que {@link backendJson}, pero devuelve `null` en un 404 en vez de
 * lanzar. Para las páginas que responden `notFound()` a un recurso ausente.
 */
export async function backendJsonOrNull<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T | null> {
  const response = await backendFetch(path, options);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw await BackendError.from(response, path);
  }
  return (await response.json()) as T;
}

/** Error del backend con su estado, para que quien llama decida qué pintar. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }

  static async from(response: Response, path: string): Promise<BackendError> {
    // El contrato de error del backend es `{ error, details?, code? }`.
    const detail = await response
      .clone()
      .json()
      .then((body: unknown) =>
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : response.statusText,
      )
      .catch(() => response.statusText);

    return new BackendError(
      response.status,
      path,
      `${response.status} en ${path}: ${detail}`,
    );
  }
}

/**
 * Cabeceras a reenviar de la petición del navegador hacia el backend.
 *
 * 🔴 **Las cabeceras de reenvío no se copian: se reescriben** (R-36). Se
 * descarta lo que trajera el cliente en {@link CLIENT_CONTROLLED_FORWARDING} y
 * se emite un único `X-Forwarded-For` con la IP que puso la plataforma. Así el
 * backend puede contar por funcionario y no por «el panel entero», y nadie
 * puede elegir en qué cubo cae.
 *
 * 🔑 **Y la IP va en una cabecera propia, firmada** (R-36, salida A). Contar
 * saltos de proxy no puede funcionar aquí: a `api.quejate.com.co` se llega por
 * dos caminos de distinta longitud —por este proxy son tres saltos, directo son
 * dos— y Cloudflare añade a `X-Forwarded-For` en vez de reemplazarla, así que
 * el `TRUST_PROXY_HOPS` que arregla el camino largo hace **evadible** el corto.
 * Con {@link CLIENT_IP_HEADER} y {@link PROXY_KEY_HEADER} el backend no cuenta
 * saltos: comprueba un secreto que un cliente no tiene.
 *
 * ⚠️ Sin `TRUSTED_PROXY_SECRET` en el entorno esto no está activo, y el
 * síntoma es el de siempre —el cubo compartido de todo el panel— con un aviso
 * por instancia en el log de Vercel, nunca en silencio (A-21).
 */
export function forwardableHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (HOP_BY_HOP.has(name) || CLIENT_CONTROLLED_FORWARDING.has(name)) {
      return;
    }
    headers[key] = value;
  });

  const clientIp = trustedClientIp(request);
  if (clientIp) {
    // Se sigue emitiendo, aunque ya no sea de donde el backend saca al
    // ciudadano: es lo que alimenta su último escalón de respaldo y quitarla
    // sería un cambio de comportamiento gratuito.
    headers["x-forwarded-for"] = clientIp;

    // R-36 salida A: la IP va además en una cabecera propia, firmada. Las dos
    // juntas o ninguna — la IP sin la clave el backend la descarta.
    if (TRUSTED_PROXY_SECRET) {
      headers[CLIENT_IP_HEADER] = clientIp;
      headers[PROXY_KEY_HEADER] = TRUSTED_PROXY_SECRET;
    } else if (
      process.env.NODE_ENV === "production" &&
      !warnedAboutMissingSecret
    ) {
      warnedAboutMissingSecret = true;
      console.warn(
        "[proxy] sin TRUSTED_PROXY_SECRET: el backend no puede creerse la IP " +
          "de cliente y contará el rate limit por la IP de salida de este " +
          "servidor (R-36).",
      );
    }
  }

  return headers;
}
