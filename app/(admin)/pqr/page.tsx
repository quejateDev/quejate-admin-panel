"use client";
import { PqrFilters } from "@/components/pqr/pqr-filters";
import { PQRTable } from "@/components/pqr/pqr-table";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePQRS } from "@/hooks/pqr/usePQRs";
import { useState, Suspense } from "react";
import { parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { EntitySelectField } from "@/components/EntitySelectField";

function PQRPageContent() {
  const searchParams = useSearchParams();
  const { departmentId, startDate, endDate } = Object.fromEntries(
    searchParams.entries()
  );

  // Por defecto, últimos 12 meses (no solo "hoy") para que el listado no salga vacío.
  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 12);
  defaultFrom.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate ? parseISO(startDate) : defaultFrom,
    to: endDate ? parseISO(endDate) : endOfToday,
  });

  // Entidad seleccionada. Vacío = todas (para SUPER_ADMIN); ADMIN queda fijo a la suya.
  const [entityId, setEntityId] = useState("");

  const { pqrs, assignPQR, isLoading, page, setPage, pageSize, totalPages } = usePQRS({
    departmentId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    entityId: entityId || undefined,
  });

  // Ensure pqrs is always an array to prevent filter errors
  const pqrsList = Array.isArray(pqrs) ? pqrs : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de PQRSD
          </h1>
          <div className="w-72">
            <EntitySelectField
              value={entityId}
              onChange={setEntityId}
              label="Entidad"
            />
          </div>
        </div>
        <PqrFilters dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {/* Table section */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de PQRSD</CardTitle>
        </CardHeader>
        <CardContent>
          <PQRTable
            pqrs={Array.isArray(pqrs) ? pqrs : []}
            assignPQR={assignPQR.mutateAsync}
            isLoading={isLoading}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            totalPages={totalPages}
            entityId={entityId}
          />
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