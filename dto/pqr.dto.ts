import { z } from "zod";
import type { AdminPqrListItem, PqrStatusName, PqrTypeName } from "@/types/api";

/**
 * Un elemento de la bandeja, tal como lo devuelve `GET /admin/pqr`.
 *
 * Antes era un `Prisma.PQRSGetPayload<...>` derivado del esquema, que declaraba
 * `creator: true` y `assignedTo: true` — es decir, la fila `User` **entera**
 * del ciudadano en el tipo, y un `assignedTo` que la ruta nunca devolvió. El
 * tipo describía la consulta que alguien imaginó, no la respuesta que llegaba.
 */
export type GetPQRsDTO = AdminPqrListItem;

/** Filtros de la pantalla de gestión. */
export const GETPQRSchema = z.object({
  /**
   * Antes `organizationId`. Se renombra al nombre que usa el backend, que es el
   * mismo en todas sus rutas de administración (`?entityId=` en los tableros).
   * Un alias en el proxy habría sido una traducción más que mantener.
   */
  entityId: z.string().optional(),
  departmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional().transform((val) => val as PqrStatusName),
  type: z.string().optional().transform((val) => val as PqrTypeName),
});

export type getPQRParams = z.infer<typeof GETPQRSchema>;

export type PaginatedPQRsDTO = {
  pqrs: GetPQRsDTO[];
  hasMore: boolean;
  nextPage: number | null;
  totalCount: number;
};
