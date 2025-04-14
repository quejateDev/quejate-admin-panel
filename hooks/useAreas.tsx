import { useQuery } from "@tanstack/react-query";
import { getDepartmentsService } from "@/services/api/Department.service";

export function useAreas(entityId?: string) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["departments", entityId],
        queryFn: () => getDepartmentsService({ entityId: entityId || "" }),
    });
}