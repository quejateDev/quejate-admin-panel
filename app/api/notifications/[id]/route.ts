import { proxyToBackend } from "@/lib/api/proxy";

/** Borrar una notificación → `DELETE /notifications/:id`. */
export async function DELETE(request: Request, { params }: any) {
  const { id } = await params;
  return proxyToBackend(request, `/notifications/${encodeURIComponent(id)}`);
}
