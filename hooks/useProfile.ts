"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminProfile } from "@/types/api";

/**
 * Perfil propio, contra `GET|PATCH /admin/profile`.
 *
 * 🔴 Sustituye al uso de `useUser(session.user.id)`, que pasaba por
 * `/api/users/:id` — la ruta que aceptaba `password` y por la que se podía
 * tomar el control de cualquier cuenta (C-01). `/api/profile` ya existía, era
 * la única ruta bien hecha del grupo, y no la usaba nadie.
 *
 * El `PATCH` acepta **solo `name`**. La contraseña propia va por
 * `/api/profile/password`, que exige la actual.
 */
export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AdminProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("No se pudo cargar el perfil");
      return response.json();
    },
  });

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async (values: { name: string }) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el perfil");
      return response.json() as Promise<AdminProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return { data, isLoading, error, updateProfile };
}
