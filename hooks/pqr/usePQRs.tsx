"use client";

import { assignPQRS, getPQRS } from "@/services/api/pqr.service";
import { getPQRParams, GetPQRsDTO, PaginatedPQRsDTO } from "@/dto/pqr.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function usePQRS(params: Partial<getPQRParams>) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const pqrsQuery = useQuery<PaginatedPQRsDTO>({
    queryKey: ["pqrs", params, page],
    queryFn: () => getPQRS({ ...params, page, limit: pageSize }),
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });

  const assignPQR = useMutation({
    mutationFn: ({ pqrId, assignedToId }: { pqrId: string; assignedToId: string | null }) =>
      assignPQRS(pqrId, assignedToId),
    onMutate: async ({ pqrId, assignedToId }) => {
      await queryClient.cancelQueries({ queryKey: ["pqrs", params, page] });
      const previous = queryClient.getQueryData<PaginatedPQRsDTO>(["pqrs", params, page]);
      queryClient.setQueryData<PaginatedPQRsDTO>(["pqrs", params, page], (old) => {
        if (!old) return old!;
        return {
          ...old,
          pqrs: old.pqrs.map((p) => (p.id === pqrId ? { ...p, assignedToId } : p)),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pqrs", params, page], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pqrs", params, page] });
    },
  });

  const pqrs: GetPQRsDTO[] = pqrsQuery.data?.pqrs ?? [];
  const totalCount = pqrsQuery.data?.totalCount ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;

  return {
    pqrs,
    hasMore: pqrsQuery.data?.hasMore ?? false,
    totalPages,
    totalCount,
    page,
    setPage,
    pageSize,
    isLoading: pqrsQuery.isLoading,
    isError: pqrsQuery.isError,
    error: pqrsQuery.error,
    assignPQR,
  };
}