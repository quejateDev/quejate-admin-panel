import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    updateEmployeeService, getEmployeeService
} from "@/services/api/Employee.service";
import { User } from "@prisma/client";

export function useEmployee(id: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployeeService(id),
    enabled: !!id,
  });

  const { mutate: updateEmployee, error: updateEmployeeError } = useMutation({
    mutationFn: (employee: Partial<User> & { id: string }) =>
      updateEmployeeService(employee.id, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    updateEmployee,
  };
}
