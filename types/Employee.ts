import { Department } from "@prisma/client";

export type Employee = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type EmployeeWithDepartment = Employee & {
  department: Department;
};
