import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteEmployeeService,
  getEmployeesService,
  updateEmployeeService,
  createEmployeeService,
  getEmployeeService,
} from "@/services/api/Employee.service";
import { User } from "@prisma/client";

export function useEmployees(employeeId?: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployeesService(),
  });

  const { data: employee, isLoading: isEmployeeLoading, error: employeeError } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => getEmployeeService(employeeId || ""),
    enabled: !!employeeId,
  });

  const { mutate: deleteEmployee, error: deleteEmployeeError } = useMutation({
    mutationFn: (id: string) => deleteEmployeeService(id),
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
    createEmployee,
    employee,
    isEmployeeLoading,
    employeeError,
  };
}

export function useEmployeeById(id: string) {
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
