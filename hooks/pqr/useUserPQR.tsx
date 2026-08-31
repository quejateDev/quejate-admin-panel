"use client";

import {
    getPQRSByUser
} from "@/services/api/pqr.service";
import { useQuery } from "@tanstack/react-query";


/**
 * PQRSD creadas por un usuario.
 *
 * 🔴 **`GET /pqr/user/:id` cambió de forma con el repunte**: la ruta vieja
 * devolvía un **array pelado** y la nueva una envoltura paginada
 * `{ pqrs, totalCount, hasMore, nextPage }`. Este hook devolvía
 * `userPQRSQuery.data ?? []`, así que entregaba **el objeto** donde quien lo
 * llamara esperaba una lista, y el primer `.map` habría reventado.
 *
 * No rompió nada porque **ninguna pantalla del panel monta este hook** hoy
 * (verificado con un barrido del repositorio, no solo por el nombre de la
 * función). Era un defecto latente, y se arregla aquí en vez de disfrazar la
 * respuesta en el proxy: la envoltura es el contrato, y esconderla sería la
 * copia que envejece de A-16.
 */
export function useUserPQRS(userId?: string) {
  const userPQRSQuery = useQuery({
    queryKey: ["user-pqrs", userId],
    queryFn: () => getPQRSByUser(userId!),
    enabled: !!userId,
  });

  return {
    pqrs: userPQRSQuery.data?.pqrs ?? [],
    totalCount: userPQRSQuery.data?.totalCount ?? 0,
    hasMore: userPQRSQuery.data?.hasMore ?? false,
    nextPage: userPQRSQuery.data?.nextPage ?? null,
    isLoading: userPQRSQuery.isLoading,
    isError: userPQRSQuery.isError,
    error: userPQRSQuery.error,
  };
}
