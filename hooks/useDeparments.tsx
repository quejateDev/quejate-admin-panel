import { getDepartmentsService } from "@/services/api/Department.service";
import { useQuery } from "@tanstack/react-query";

export function useDepartments({
  entityId,
}: {
  entityId: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsService({ entityId }),
  });

  return {
    data,
    isLoading,
    error,
  };
}
