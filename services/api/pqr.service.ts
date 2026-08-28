import type { PqrDetail } from "@/types/api";
import { getPQRParams, PaginatedPQRsDTO } from "@/dto/pqr.dto";
import axios from "axios";

const Client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});



export async function createPQRS(formData: FormData) {
  const response = await axios.post("/api/pqr", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds for file uploads
  });
  return response.data;
}

export async function getAllPQRS() {
  const response = await Client.get("/pqr");
  return response.data;
}

export async function getPQRS(params: Partial<getPQRParams>): Promise<PaginatedPQRsDTO> {
  const response = await Client.get(`/pqr`, { params });
  return response.data;
}

export async function getPQRSById(id: string): Promise<PqrDetail> {
  const response = await Client.get(`/pqr/${id}`);
  return response.data;
}

export async function getPQRSByUser(userId: string) {
  const response = await Client.get(`/pqr/user/${userId}`);
  return response.data;
}

export async function updatePQRS(id: string, pqrs: Partial<PqrDetail>) {
  const response = await Client.patch(`/pqr/${id}`, pqrs);
  return response.data;
}

export async function toggleLike(pqrId: string, userId: string) {
  const response = await Client.post(`/pqr/${pqrId}/like`, { userId });
  return response.data;
}

export async function createCommentService(comment: {text: string; userId: string; pqrId: string; }) {
  const response = await Client.post(`/pqr/${comment.pqrId}/comments`, comment);
  return response.data;
}

export async function assignPQRS(id: string, assignedToId: string | null) {
  const response = await Client.patch(`/pqr/${id}/assign`, { assignedToId });
  return response.data;
}


