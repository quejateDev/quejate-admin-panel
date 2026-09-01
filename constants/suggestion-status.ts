import type { SuggestionStatusName } from "@/types/api";

export const SUGGESTION_STATUS_TRANSLATIONS: Record<SuggestionStatusName, string> = {
  PENDING: "Pendiente",
  UNDER_REVIEW: "En revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  IMPLEMENTED: "Implementado",
};