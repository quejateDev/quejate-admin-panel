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
import { useDepartments } from "@/hooks/useDeparments";
import { useState } from "react";
import { parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

export default function PQRPage() {
  const searchParams = useSearchParams();
  const { departmentId, entityId, startDate, endDate } = Object.fromEntries(
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

  const { pqrs, assignPQR } = usePQRS({
    departmentId: departmentId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
  });

  const { data: departments } = useDepartments({ entityId: entityId ?? "" });

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
        <PqrFilters
          departments={departments ?? []}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total PQRSD</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPqrs}</div>
            <p className="text-xs text-muted-foreground">
              Solicitudes en el período seleccionado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPqrs}</div>
            <p className="text-xs text-muted-foreground">
              PQRSD dentro del plazo de respuesta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overduePqrs}
            </div>
            <p className="text-xs text-muted-foreground">
              PQRSD fuera del plazo de respuesta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {completedPqrs}
            </div>
            <p className="text-xs text-muted-foreground">
              PQRSD resueltas exitosamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PqrVsTimeChart
          pqrs={pqrs.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          className="col-span-2"
        />

        <PqrVsDepartmentChart pqrs={pqrs} />
        <PqrVsTypeChart pqrs={pqrs} />
      </div>

      {/* Table section */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de PQRSD</CardTitle>
        </CardHeader>
        <CardContent>
          <PQRTable pqrs={pqrs} assignPQR={assignPQR.mutateAsync} />
        </CardContent>
      </Card>
    </div>
  );
}
