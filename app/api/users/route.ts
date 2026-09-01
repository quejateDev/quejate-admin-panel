import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

/**
 * Personal de una entidad → `GET|POST /admin/entities/:entityId/employees`.
 *
 * 🔴 **La entidad pasa de la query al path.** Era `?entityId=` en el `GET` y un
 * campo del cuerpo en el `POST`; ahora es un segmento de la ruta, y el backend
 * comprueba que quien pregunta pertenece a ella. Sin `entityId` no hay a quién
 * preguntar, así que se responde 400 en vez de listar a todo el mundo.
 *
 * Lo que cambia además: la respuesta del alta **ya no trae el resumen de la
 * contraseña** (H-02), el listado no trae `phone`, ordena por nombre y por
 * defecto solo devuelve personal activo (`?includeInactive=true` para la tabla
 * de gestión).
 */
function entityIdFrom(request: Request): string | null {
  return new URL(request.url).searchParams.get("entityId");
}

export async function GET(request: Request) {
  const entityId = entityIdFrom(request);
  if (!entityId) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 });
  }
  const searchParams = new URL(request.url).searchParams;
  searchParams.delete("entityId");
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(entityId)}/employees`,
    { searchParams },
  );
}

export async function POST(request: Request) {
  const entityId = entityIdFrom(request);
  if (!entityId) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 });
  }
  return proxyToBackend(
    request,
    `/admin/entities/${encodeURIComponent(entityId)}/employees`,
    { searchParams: "drop" },
  );
}
