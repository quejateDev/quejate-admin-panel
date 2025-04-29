import { CreateDepartmentDTO, createDepartmentService, deleteDepartmentService, getDepartmentsService } from "@/services/api/Department.service";
import { Department } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDepartments({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["departments", entityId],
    queryFn: () => getDepartmentsService({ entityId }),
    enabled: !!entityId,
  });

  // delete
  const deleteDepartment = useMutation({
    mutationFn: (id: string) => deleteDepartmentService({ id }),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["departments", entityId] });
      const previousDepartments = queryClient.getQueryData<Department[]>([
        "departments",
        entityId,
      ]);
      queryClient.setQueryData(["departments", entityId], (old: Department[]) =>
        old.filter((department) => department.id !== id)
      );
      return previousDepartments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", entityId] });
    },
  });

  const createDepartment = useMutation({
    mutationFn: (department: CreateDepartmentDTO) =>
      createDepartmentService(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", entityId] });
    },
  });

  return {
    data,
    isLoading,
    error,
    deleteDepartment,
    createDepartment,
  };
}
