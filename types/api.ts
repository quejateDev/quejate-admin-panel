/**
 * Contrato del panel con el backend unificado.
 *
 * 🔴 **Por qué existe este fichero.** Hasta la Tarea 15, el panel tipaba sus
 * pantallas con los tipos que Prisma genera del esquema (`Entity`, `PQRS`,
 * `User`…). Eso ataba la interfaz a la **forma de las tablas**, no a la forma
 * de las respuestas, y tenía tres consecuencias que se pagaron:
 *
 * - Un `include` sin `select` pasaba la fila entera al navegador y el tipo lo
 *   bendecía: así viajaron el resumen bcrypt de las contraseñas (H-11) y el
 *   contacto de los denunciantes invitados.
 * - Los tipos afirmaban campos que la ruta no devolvía. `GetPQRsDTO` declaraba
 *   `assignedTo`, la tabla lo pintaba, y la ruta no lo seleccionaba nunca: la
 *   columna «Asignado a» decía «Sin asignar» siempre, y el compilador no tenía
 *   nada que objetar.
 * - Obligaba a mantener aquí una copia del esquema, que es el incidente A-01.
 *
 * Desde el repunte, estas interfaces describen **lo que el backend responde**.
 * Son una copia declarada de un contrato ajeno, así que envejecen (A-16): la
 * fuente viva es el Swagger del backend, y cuando una respuesta cambie de forma
 * hay que actualizarlas aquí a la vez.
 */

/** Rol de una cuenta. Espejo del enum del backend. */
export type UserRoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EMPLOYEE"
  | "CLIENT"
  | "LAWYER";

/** Estado de una PQRSD. Son los cuatro del enum del backend, no más. */
export type PqrStatusName = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

/** Tipo de una PQRSD. */
export type PqrTypeName =
  | "PETITION"
  | "COMPLAINT"
  | "CLAIM"
  | "SUGGESTION"
  | "REPORT";

/** Estado de una sugerencia de entidad. */
export type SuggestionStatusName =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "IMPLEMENTED";

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

/** Categoría, en la forma reducida en la que se anida. */
export interface CategoryRef {
  id: string;
  name: string;
}

/** Categoría del catálogo público (`GET /category`). */
export interface PublicCategory extends CategoryRef {
  description?: string | null;
}

/** Categoría en la pantalla de administración (`GET /admin/categories`). */
export interface AdminCategory extends CategoryRef {
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Sustituye a la lista completa de entidades que devolvía el original. */
  _count: { entities: number };
}

/**
 * Entidad en el listado de administración (`GET /admin/entities`).
 *
 * `municipality` y `department` llegan **resueltos y planos** —el nombre, ya
 * buscado en el catálogo geográfico— en vez de anidados como
 * `Municipality.RegionalDepartment.name`.
 */
export interface AdminEntityListItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  email: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  municipalityId: string | null;
  regionalDepartmentId: string | null;
  category: CategoryRef;
  municipality: string | null;
  department: string | null;
}

/** Personal de la entidad, tal como lo pinta su ficha. */
export interface AdminEntityStaff {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRoleName;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Detalle de una entidad (`GET /admin/entities/:id`). */
export interface AdminEntityDetail extends AdminEntityListItem {
  categoryId: string;
  users: AdminEntityStaff[];
}

/** Área de una entidad (`GET /admin/areas`). */
export interface AdminArea {
  id: string;
  name: string;
  description: string | null;
  email: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Sustituye a `employees` y `pqrs`, que el original devolvía **enteros** —con
   * el resumen de contraseña del personal y las PQRSD privadas dentro (H-11).
   */
  _count: { pqrs: number; employees: number };
}

/** Campo personalizado del formulario de PQRSD. */
export interface PqrCustomField {
  id?: string;
  name: string;
  required: boolean;
  type: "text" | "email" | "phone";
  isForAnonymous: boolean;
}

/** Configuración de PQRSD de una entidad o de un área. */
export interface PqrConfig {
  id: string;
  allowAnonymous: boolean;
  requireEvidence: boolean;
  /** Días **hábiles** del plazo legal (Ley 1755). Rango válido: 1–15. */
  maxResponseTime: number;
  notifyEmail: boolean;
  autoAssign: boolean;
  customFields?: PqrCustomField[];
}

/** Detalle de un área con su configuración (`GET /admin/areas/:id`). */
export interface AdminAreaDetail extends AdminArea {
  pqrConfig: PqrConfig | null;
}

/** Sugerencia de entidad (`GET /admin/entity-suggestions`). */
export interface EntitySuggestion {
  id: string;
  entityName: string;
  regionalDepartmentId: string;
  municipalityId: string | null;
  status: SuggestionStatusName;
  createdAt: string;
  updatedAt: string;
  departmentName: string | null;
  municipalityName: string | null;
}

/** Envoltura paginada de las sugerencias. */
export interface EntitySuggestionsPage {
  suggestions: EntitySuggestion[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Departamento del catálogo geográfico, con sus municipios. */
export interface RegionalDepartment {
  id: string;
  name: string;
  municipalities?: { id: string; name: string }[];
  Municipality?: { name: string }[];
}

/** Municipio del catálogo geográfico. */
export interface Municipality {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Personal
// ---------------------------------------------------------------------------

/** Una persona del personal (`GET /admin/entities/:id/employees`). */
export interface Employee {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRoleName;
  isActive: boolean;
  departmentId: string | null;
  department: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Perfil propio (`GET /admin/profile`). */
export interface AdminProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRoleName;
}

// ---------------------------------------------------------------------------
// PQRSD
// ---------------------------------------------------------------------------

/** Autor de una PQRSD o de un comentario. */
export interface PqrCreator {
  id: string;
  name: string | null;
  image: string | null;
}

/** Adjunto de una PQRSD o de una respuesta. */
export interface PqrAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  thumbnailUrl?: string | null;
}

/** Valor de un campo personalizado, tal como se guardó. */
export interface PqrCustomFieldValue {
  id?: string;
  name: string;
  value: string;
}

/**
 * Un elemento de la bandeja de la entidad (`GET /admin/pqr`).
 *
 * 🔴 `isOverdue`, `businessDaysOverdue` y `hasLegalDeadline` los calcula **el
 * servidor**, en días **hábiles** y con los festivos colombianos derivados de
 * la regla legal. La pantalla los pinta; no vuelve a calcularlos. El badge
 * «Vencido» del panel contaba 15 días **calendario** desde `createdAt`, lo que
 * le decía a la entidad que estaba vencida unos cuatro días antes de estarlo.
 */
export interface AdminPqrListItem {
  id: string;
  consecutiveCode: string | null;
  type: PqrTypeName;
  status: PqrStatusName;
  subject: string | null;
  description: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  private: boolean;
  anonymous: boolean;
  entityId: string;
  departmentId: string | null;
  assignedToId: string | null;
  creator: PqrCreator | null;
  assignedTo: { id: string; name: string | null } | null;
  entity: { id: string; name: string } | null;
  department: { name: string; entity: { id: string; name: string } } | null;
  likes: { id: string; userId: string }[];
  customFieldValues: PqrCustomFieldValue[];
  attachments: PqrAttachment[];
  _count: { likes: number; comments: number };
  isOverdue: boolean;
  businessDaysOverdue: number;
  hasLegalDeadline: boolean;
}

/** Respuesta de `GET /admin/pqr`. */
export interface AdminPqrPage {
  pqrs: AdminPqrListItem[];
  hasMore: boolean;
  nextPage: number | null;
  totalCount: number;
}

/**
 * Detalle de una PQRSD (`GET /pqr/:id`).
 *
 * ⚠️ **`creator` ya no trae `email` ni `phone`.** El original hacía
 * `include: { creator: true }`, que devuelve la fila `User` entera —resumen de
 * contraseña incluido— en un endpoint que además es público para las PQRSD no
 * privadas (H-06). El contacto con el ciudadano va por el correo de
 * notificación de la PQRSD, que sale del servidor.
 */
export interface PqrDetail {
  id: string;
  consecutiveCode: string | null;
  type: PqrTypeName;
  status: PqrStatusName;
  subject: string | null;
  description: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  private: boolean;
  anonymous: boolean;
  creator: PqrCreator | null;
  department: { id: string; name: string; email: string } | null;
  entity: { id: string; name: string; email: string | null } | null;
  attachments: PqrAttachment[];
  customFieldValues: PqrCustomFieldValue[];
  isOverdue: boolean;
  businessDaysOverdue: number;
  hasLegalDeadline: boolean;
}

/** Respuesta oficial de la entidad (`GET /admin/pqr/:id/responses`). */
export interface EntityResponse {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: PqrCreator | null;
  attachments: PqrAttachment[];
}
