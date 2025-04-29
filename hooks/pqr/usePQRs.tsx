"use client";

import { assignPQRS, getPQRS } from "@/services/api/pqr.service";
import { getPQRParams } from "@/dto/pqr.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PQRS } from "@prisma/client";

export function usePQRS(params: Partial<getPQRParams>) {
  const queryClient = useQueryClient();

  const pqrsQuery = useQuery({
    queryKey: ["pqrs", params],
    queryFn: () => getPQRS(params),
  });

  const assignPQR = useMutation({
    mutationFn: ({
      pqrId,
      assignedToId,
    }: {
      pqrId: string;
      assignedToId: string | null;
    }) => assignPQRS(pqrId, assignedToId),
    onMutate: async ({ pqrId, assignedToId }) => {
      console.log("pqrId", pqrId);
      console.log("assignedToId", assignedToId);
      await queryClient.cancelQueries({ queryKey: ["pqrs", params] });

      const previousPQRS = queryClient.getQueryData<PQRS[]>(["pqrs", params]);

      queryClient.setQueryData(["pqrs", params], (old: PQRS[] = []) =>
        old.map((p) => (p.id === pqrId ? { ...p, assignedToId } : p))
      );

      return { previousPQRS };
    },
    onError: (error, variables, context) => {
      if (context?.previousPQRS) {
        queryClient.setQueryData(["pqrs", params], context.previousPQRS);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pqrs", params] });
    },
  });

  return {
    pqrs: pqrsQuery.data ?? [],
    isLoading: pqrsQuery.isLoading,
    isError: pqrsQuery.isError,
    error: pqrsQuery.error,
    assignPQR,
  };
}
