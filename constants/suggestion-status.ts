export const SUGGESTION_STATUS_TRANSLATIONS = {
  PENDING: "Pendiente por revisar",
  REJECTED: "Rechazada",
  IMPLEMENTED: "Implementada",
} as const;

export type SuggestionStatus = keyof typeof SUGGESTION_STATUS_TRANSLATIONS;
