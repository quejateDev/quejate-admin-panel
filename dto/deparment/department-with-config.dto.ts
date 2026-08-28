import type { AdminAreaDetail } from "@/types/api";

/**
 * Un área con su configuración de PQRSD.
 *
 * Antes era un `Prisma.DepartmentGetPayload<...>` con `customFields` anidados.
 * El backend devuelve la configuración en `GET /admin/areas/:id` y los campos
 * personalizados en su propia ruta, `.../pqr-config/fields`.
 */
export type DepartmentWithConfig = AdminAreaDetail;
