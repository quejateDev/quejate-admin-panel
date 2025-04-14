import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteEmployeeService,
  getEmployeesService,
  updateEmployeeService,
  createEmployeeService,
} from "@/services/api/Employee.service";
import { User } from "@prisma/client";

export function useEmployee() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployeesService(),
  });

  const { mutate: deleteEmployee, error: deleteEmployeeError } = useMutation({
    mutationFn: (id: string) => deleteEmployeeService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const { mutate: updateEmployee, error: updateEmployeeError } = useMutation({
    mutationFn: (employee: Partial<User> & { id: string }) =>
      updateEmployeeService(employee.id, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const { mutate: createEmployee, error: createEmployeeError } = useMutation({
    mutationFn: (employee: {
      password: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: string;
      entityId: string;
    }) => createEmployeeService(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    data,
    isLoading,
    error,
    deleteEmployee,
    updateEmployee,
    createEmployee,
  };
}
