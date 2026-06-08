import { PQRSStatus, PQRSType, Prisma } from "@prisma/client";
import { z } from "zod";

export type GetPQRsDTO = Prisma.PQRSGetPayload<{
  include: {
    department: {
      include: {
        entity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    creator: true,
    assignedTo: true,
  };
}>;

export const GETPQRSchema = z.object({
  organizationId: z.string().optional(),
  departmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional().transform((val) => val as PQRSStatus),
  type: z.string().optional().transform((val) => val as PQRSType),
});

export type getPQRParams = z.infer<typeof GETPQRSchema>;

export type PaginatedPQRsDTO = {
  pqrs: GetPQRsDTO[];
  hasMore: boolean;
  nextPage: number | null;
  totalCount: number;
};