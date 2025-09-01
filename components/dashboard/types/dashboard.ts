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