"use client";
import PqrVsDepartmentChart from "@/components/charts/pqr/pqr-vs-deparment";
import { PqrVsTimeChart } from "@/components/charts/pqr/pqr-vs-time";
import { PqrVsTypeChart } from "@/components/charts/pqr/pqr-vs-type";
import { PqrFilters } from "@/components/pqr/pqr-filters";
import { PQRTable } from "@/components/pqr/pqr-table";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { PQRSStatus } from "@prisma/client";
import { usePQRS } from "@/hooks/pqr/usePQRs";
import { useState, Suspense } from "react";
import { parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import MetricCard from "@/components/charts/pqr/MetricCard";

function PQRPageContent() {
  const searchParams = useSearchParams();
  const { departmentId, startDate, endDate } = Object.fromEntries(
    searchParams.entries()
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate ? parseISO(startDate) : startOfToday,
    to: endDate ? parseISO(endDate) : endOfToday,
  });

  const { pqrs, assignPQR, isLoading } = usePQRS({
    departmentId: departmentId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
  });

  // Calculate statistics
  const totalPqrs = pqrs.length;
  const pendingPqrs = pqrs.filter((pqr) => {
    const dueDate = new Date(pqr.createdAt);
    dueDate.setDate(dueDate.getDate() + 15);
    return new Date() < dueDate;
  }).length;
  const overduePqrs = pqrs.filter((pqr) => {
    const dueDate = new Date(pqr.createdAt);
    dueDate.setDate(dueDate.getDate() + 15);
    return new Date() >= dueDate;
  }).length;
  const completedPqrs = pqrs.filter(
    (pqr) => pqr.status === PQRSStatus.RESOLVED
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de PQRSD
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra y monitorea las PQRSD de tu entidad
          </p>
        </div>
        <PqrFilters dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total PQRSD"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          value={totalPqrs}
          description="Solicitudes en el período seleccionado"
          isLoading={isLoading}
        />
        <MetricCard
          title="Pendientes"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          value={pendingPqrs}
          description="PQRSD dentro del plazo de respuesta"
          isLoading={isLoading}
        />

        <MetricCard
          title="Vencidas"
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          value={overduePqrs}
          description="PQRSD fuera del plazo de respuesta"
          isLoading={isLoading}
        />

        <MetricCard
          title="Completadas"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          value={completedPqrs}
          description="PQRSD resueltas exitosamente"
          isLoading={isLoading}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PqrVsTimeChart
          pqrs={pqrs.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          className="col-span-2"
          isLoading={isLoading}
        />

        <PqrVsDepartmentChart pqrs={pqrs} isLoading={isLoading} />
        <PqrVsTypeChart pqrs={pqrs} isLoading={isLoading} />
      </div>

      {/* Table section */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de PQRSD</CardTitle>
        </CardHeader>
        <CardContent>
          <PQRTable pqrs={pqrs} assignPQR={assignPQR.mutateAsync} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PQRPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PQRPageContent />
    </Suspense>
  );
}
