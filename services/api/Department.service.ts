import type { AdminArea, AdminAreaDetail } from "@/types/api";
import axios from "axios";

const Client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * 🔴 El listado ya **no** trae `employees`, `forms`, `pqrs` ni `entity`
 * enteros. Ese `include` era H-11: arrastraba el resumen bcrypt de la
 * contraseña, el correo, el teléfono y el token de push de cada persona del
 * área, y las PQRSD **privadas** completas. Lo que queda es lo que la tabla
 * pinta más un `_count` con las dos cifras que las relaciones se usaban para
 * conocer.
 */
type DepartmentWithRelations = AdminArea;

export type CreateDepartmentDTO = {
  name: string;
  email: string;
  description?: string;
  entityId: string;
};

export type UpdateDepartmentDTO = {
  name?: string;
  email?: string;
  description?: string;
  entityId?: string;
};

export type DeleteDepartmentDTO = {
  id: string;
};

export type GetDepartmentDTO = {
  id: string;
};

export type GetDepartmentsDTO = {
  entityId: string;
};

export async function getDepartmentsService(data: GetDepartmentsDTO): Promise<DepartmentWithRelations[]> {
  const response = await Client.get("/area", { params: data });
  return response.data;
}

export async function getDepartmentService(data: GetDepartmentDTO): Promise<AdminAreaDetail> {
  const response = await Client.get(`/area/${data.id}`);
  return response.data;
}

export async function createDepartmentService(data: CreateDepartmentDTO): Promise<AdminArea> {
  const response = await Client.post("/area", data);
  return response.data;
}

export async function deleteDepartmentService(data: DeleteDepartmentDTO): Promise<void> {
  await Client.delete(`/area/${data.id}`);
}

export async function updateDepartmentService(id: string, data: UpdateDepartmentDTO): Promise<AdminArea> {
  // /api/area/[id] implementa PATCH (no PUT) -> usar PATCH para evitar 405.
  const response = await Client.patch(`/area/${id}`, data);
  return response.data;
}
