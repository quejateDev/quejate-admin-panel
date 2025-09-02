export interface SuperAdminKPI {
  totalPQRDS: number;
  totalEntities: number;
  totalUsers: number;
  totalLawyers: number;
  trends?: {
    pqrsTrend: number;
    entitiesTrend: number;
    usersTrend: number;
    lawyersTrend: number;
  };
}

export interface AdminKPI {
  totalPQRDS: number;
  totalEmployees: number;
  totalDepartments: number;
  trends?: {
    pqrsTrend: number;
    employeesTrend: number;
    departmentsTrend: number;
  };
}

export interface SuperAdminCharts {
  usersByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  pqrsByType: Array<{
    type: string;
    count: number;
  }>;
  pqrsByStatus: Array<{
    status: string;
    count: number;
  }>;
  topEntities: Array<{
    entityId: string;
    entityName: string;
    count: number;
  }>;
  pqrsByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
}

export interface AdminCharts {
  pqrsByMonth: Array<{
    month: number;
    monthName: string;
    count: number;
  }>;
  pqrsByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;
  pqrsByType: Array<{
    type: string;
    count: number;
  }>;
  pqrsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface KPICardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: string | React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}