import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Sugerencias de entidad → `GET /admin/entity-suggestions` y
 * `PATCH /admin/entity-suggestions/:id`.
 *
 * 🔴 **Cambio de contrato deliberado en el `PATCH`:** el identificador pasa de
 * la query (`?id=`) al **path**. La ruta del panel se conserva porque es la que
 * llama `SuggestionsTable`, pero el id se traslada aquí; el estado se valida
 * contra el enum y una sugerencia inexistente responde 404, no 500.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, "/admin/entity-suggestions");
}

export async function PATCH(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  return proxyToBackend(
    request,
    `/admin/entity-suggestions/${encodeURIComponent(id)}`,
    // El id ya viajó al path: reenviar además `?id=` sería ruido que el
    // `whitelist: true` del backend descartaría igualmente.
    { searchParams: "drop" },
  );
}
