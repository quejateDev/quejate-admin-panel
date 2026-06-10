import { SuggestionStatus } from "@prisma/client";

export const SUGGESTION_STATUS_TRANSLATIONS: Record<SuggestionStatus, string> = {
  PENDING: "Pendiente",
  UNDER_REVIEW: "En revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  IMPLEMENTED: "Implementado",
};