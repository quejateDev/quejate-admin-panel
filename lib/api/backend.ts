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

/** Cabeceras a reenviar de la petición del navegador hacia el backend. */
export function forwardableHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  return headers;
}
