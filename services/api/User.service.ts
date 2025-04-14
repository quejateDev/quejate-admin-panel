import axios from "axios";

export const Client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

export async function getUsersService() {
  const response = await Client.get("/users");
  return response.data;
}

export async function getUserService(id: string) {
  const response = await Client.get(`/users/${id}`);
  return response.data;
}
