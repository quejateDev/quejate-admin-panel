import { Department, Prisma } from "@prisma/client";
import axios from "axios";

const Client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Define the extended Department type with relations
type DepartmentWithRelations = Prisma.DepartmentGetPayload<{
  include: {
    employees: true;
    forms: true;
    pqrs: true;
    entity: true
  };
}> 

export type CreateDepartmentDTO = {
  name: string;
  description?: string;
  entityId: string;
};

export type UpdateDepartmentDTO = {
  name?: string;
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

// return departments with all employees, forms and pqrs
export async function getDepartmentsService(data: GetDepartmentsDTO): Promise<DepartmentWithRelations[]> {
  const response = await Client.get("/area", { params: data });
  return response.data;
}

export async function getDepartmentService(data: GetDepartmentDTO): Promise<DepartmentWithRelations> {
  const response = await Client.get(`/area/${data.id}`);
  return response.data;
}

export async function createDepartmentService(data: CreateDepartmentDTO): Promise<Department> {
  const response = await Client.post("/area", data);
  return response.data;
}

export async function deleteDepartmentService(data: DeleteDepartmentDTO): Promise<void> {
  await Client.delete(`/area/${data.id}`);
}

export async function updateDepartmentService(id: string, data: UpdateDepartmentDTO): Promise<Department> {
  const response = await Client.put(`/area/${id}`, data);
  return response.data;
}
