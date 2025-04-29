"use client";

import { assignPQRS, getPQRS } from "@/services/api/pqr.service";
import { getPQRParams, GetPQRsDTO } from "@/dto/pqr.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PQRS } from "@prisma/client";

export function usePQRS(params: Partial<getPQRParams>) {
  const queryClient = useQueryClient();

  const pqrsQuery = useQuery({
    queryKey: ["pqrs", params],
    queryFn: () => getPQRS(params),
    // refetch the data every minute
    refetchInterval: 1000 * 60 * 1,
    refetchIntervalInBackground: true,
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
      await queryClient.cancelQueries({ queryKey: ["pqrs", params] });

      const previousPQRS = queryClient.getQueryData<GetPQRsDTO[]>(["pqrs", params]);

      queryClient.setQueryData(["pqrs", params], (old: GetPQRsDTO[] = []) =>
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
