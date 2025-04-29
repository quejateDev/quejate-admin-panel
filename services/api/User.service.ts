import axios from "axios";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
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

export async function updateUserService(id: string, user: Partial<UserProfile>) {
  const response = await Client.patch(`/users/${id}`, user);
  return response.data;
}
