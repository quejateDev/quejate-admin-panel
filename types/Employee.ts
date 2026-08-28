
/**
 * Personal de una entidad.
 *
 * ⚠️ **Sin `phone`**: el listado del backend no lo devuelve. Es dato personal
 * de un compañero y no hace falta ni para asignar una PQRSD ni para ver la
 * plantilla; quien administra la cuenta sí lo tiene, en `GET /admin/users/:id`.
 */
export type Employee = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  departmentId?: string | null;
};

/**
 * `GET /admin/entities/:id/employees` devuelve del área solo su nombre: es lo
 * que la tabla pinta, y el listado lo lee también un `EMPLOYEE`.
 */
export type EmployeeWithDepartment = Employee & {
  department: { name: string } | null;
};
