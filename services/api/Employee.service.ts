import { Employee } from "@/types/Employee";
import { User } from "@prisma/client";
import axios from "axios";

const Client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

export async function createEmployeeService(employee: {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}) {
  const response = await Client.post("/users", employee);
  return response.data;
}

export async function getEmployeesService(): Promise<Employee[]> {
  const response = await Client.get("/users");
  return response.data;
}

export async function deleteEmployeeService(id: string) {
  const response = await Client.delete(`/users/${id}`);
  return response.data;
}

export async function updateEmployeeService(id: string, employee: Partial<User>) {
  const response = await Client.patch(`/users/${id}`, employee);
  return response.data;
}

export async function getEmployeeService(id: string) {
  const response = await Client.get(`/users/${id}`);
  return response.data;
}
