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
  organizationId: z.string(),
  departmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => val as PQRSStatus),
  type: z
    .string()
    .optional()
    .transform((val) => val as PQRSType),
});

export type getPQRParams = z.infer<typeof GETPQRSchema>;
