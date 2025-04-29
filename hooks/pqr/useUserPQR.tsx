"use client";

import {
    getPQRSByUser
} from "@/services/api/pqr.service";
import { useQuery } from "@tanstack/react-query";


export function useUserPQRS(userId?: string) {
  const userPQRSQuery = useQuery({
    queryKey: ["user-pqrs", userId],
    queryFn: () => getPQRSByUser(userId!),
    enabled: !!userId,
  });

  return {
    pqrs: userPQRSQuery.data ?? [],
    isLoading: userPQRSQuery.isLoading,
    isError: userPQRSQuery.isError,
    error: userPQRSQuery.error,
  };
}
