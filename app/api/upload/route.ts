import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Subida directa de un fichero → `POST /upload`.
 *
 * 🔴 Cierra **H-07** para el panel: la ruta vieja no comprobaba sesión, la
 * validación de tipo estaba comentada, el `folder` salía del cuerpo —quien
 * llamaba elegía dónde escribir dentro del bucket— y no había límite de tamaño
 * ni de cantidad. La nueva exige sesión, tiene listas blancas de tipo y de
 * destino, sanea el nombre y pone un techo de 20 MB.
 *
 * El cuerpo va como stream: un fichero de 20 MB no se materializa en memoria
 * del servidor de Next solo para reenviarlo.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, "/upload");
}
