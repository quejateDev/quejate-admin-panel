"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LawyersTable } from "@/components/LawyersTable";
import { LawyersPagination } from "@/components/LawyersPagination";
import { useLawyers } from "@/hooks/useLawyers";
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Scale
} from "lucide-react";

interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  variant?: "default" | "success" | "warning" | "destructive";
}

function StatsCard({ icon: Icon, title, value, variant = "default" }: StatsCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    destructive: "text-red-600",
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-md">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LawyersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { data, isLoading, error, verifyLawyer } = useLawyers(currentPage, itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleVerifyLawyer = async (lawyerId: string, isVerified: boolean) => {
    await verifyLawyer(lawyerId, isVerified);
  };

  const stats = React.useMemo(() => {
    if (!data?.data) {
      return {
        total: 0,
        verified: 0,
        pending: 0,
      };
    }

    return {
      total: data.pagination.totalItems,
      verified: data.data.filter(lawyer => lawyer.isVerified).length,
      pending: data.data.filter(lawyer => !lawyer.isVerified).length,
    };
  }, [data]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-destructive">
                Error al cargar los abogados: {error}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Gestión de Abogados</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          icon={Users}
          title="Total Abogados"
          value={stats.total}
          variant="default"
        />
        <StatsCard
          icon={UserCheck}
          title="Verificados"
          value={stats.verified}
          variant="success"
        />
        <StatsCard
          icon={UserX}
          title="Pendientes"
          value={stats.pending}
          variant="warning"
        />
      </div>

      {data && (
        <>
          <LawyersTable
            lawyers={data.data}
            onVerify={handleVerifyLawyer}
            isLoading={false}
          />
          

          <LawyersPagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}


      {data && data.data.length === 0 && (
        <Card className="border-none shadow-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay abogados registrados</h3>
              <p className="text-muted-foreground">
                Cuando los abogados se registren en el sistema, aparecerán aquí para su verificación.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
