import type {
  AdminEntityDetail,
  AdminEntityListItem,
  PublicCategory,
} from "@/types/api";
import axios from "axios";

const Client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    "cache-control": "no-store",
  },
  timeout: 10000,
});

export type CreateEntityDTO = {
  name: string;
  description: string;
  categoryId: string;
  imageUrl?: string;
  email: string;
  regionalDepartmentId: string;
  municipalityId?: string;
};

type UpdateEntityDTO = {
  name: string;
  description: string;
  categoryId: string;
  imageUrl?: string;
  email: string;
  regionalDepartmentId: string;
  municipalityId: string;
};

export async function getOrganizationsService(params?: {
  departmentId?: string;
  municipalityId?: string;
}): Promise<AdminEntityListItem[]> {
  const queryParams = new URLSearchParams();

  if (params?.municipalityId) {
    queryParams.append("municipalityId", params.municipalityId);
  } else if (params?.departmentId) {
    queryParams.append("departmentId", params.departmentId);
  }

  const url = queryParams.toString()
    ? `/entities?${queryParams.toString()}`
    : "/entities";

  const response = await Client.get(url);
  return response.data;
}

/**
 * Catálogo de categorías para elegir una.
 *
 * Va al **catálogo público** y no a `/admin/categories`, que exige alcance de
 * plataforma: esto llena desplegables que un `ADMIN` de entidad también usa.
 */
export async function getCategories(): Promise<PublicCategory[]> {
  const response = await Client.get("/category/catalog");
  return response.data;
}

export async function createOrganizationService(data: CreateEntityDTO): Promise<AdminEntityDetail> {
  const response = await Client.post("/entities", data);
  return response.data;
}

export async function updateEntity(
  id: string,
  data: UpdateEntityDTO
): Promise<AdminEntityDetail> {
  const response = await Client.put(`/entities/${id}`, data);
  return response.data;
}

import type { Employee } from "@/types/api";

export const EntityService = {
  /**
   * 🔴 Iba a `/entity/:id/employees` — **`entity` en singular**, una carpeta
   * que no existe bajo `app/api/`. Era una de las cinco rutas muertas del
   * panel: respondía 404 desde siempre. No tenía consumidores, así que nunca
   * llegó a ejecutarse; ahora apunta a la ruta real.
   */
  getEmployees: async (entityId: string): Promise<Employee[]> => {
    const response = await Client.get(`/entities/${entityId}/employees`);
    return response.data;
  },
};
