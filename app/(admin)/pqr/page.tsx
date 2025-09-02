"use client";
import { PqrFilters } from "@/components/pqr/pqr-filters";
import { PQRTable } from "@/components/pqr/pqr-table";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePQRS } from "@/hooks/pqr/usePQRs";
import { useState, Suspense } from "react";
import { parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import useOrganizationStore from "@/store/useOrganizationStore";

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

  const { entity } = useOrganizationStore();

  const { pqrs, assignPQR, isLoading } = usePQRS({
    departmentId: departmentId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    organizationId: entity?.id,
  });

  // Ensure pqrs is always an array to prevent filter errors
  const pqrsList = Array.isArray(pqrs) ? pqrs : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de PQRSD
          </h1>
          
        </div>
        <PqrFilters dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {/* Table section */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de PQRSD</CardTitle>
        </CardHeader>
        <CardContent>
          <PQRTable pqrs={pqrsList} assignPQR={assignPQR.mutateAsync} isLoading={isLoading} />
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