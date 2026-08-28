"use client";

import {
    assignPQRS, getPQRSById, updatePQRS
} from "@/services/api/pqr.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PqrDetail } from "@/types/api";

export function usePQR(id?: string) {
  const queryClient = useQueryClient();

  const pqrQuery = useQuery({
    queryKey: ["pqr", id],
    queryFn: () => getPQRSById(id!),
    enabled: !!id,
    refetchInterval: 1000 * 60 * 5,
  });

  // implement a function to update the pqr
  const updatePQR = useMutation({
    mutationFn: (pqr: Partial<PqrDetail>) => updatePQRS(pqr.id!, pqr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pqr", id] });
    },
  });

  const assignPQR = useMutation({
    mutationFn: (pqr: Partial<PqrDetail> & { assignedToId?: string | null }) =>
      assignPQRS(pqr.id!, pqr.assignedToId ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pqr", id] });
    },
  });

  return {
    pqr: pqrQuery.data,
    isLoading: pqrQuery.isLoading,
    isError: pqrQuery.isError,
    error: pqrQuery.error,
    updatePQR,
    assignPQR,
  };
}
