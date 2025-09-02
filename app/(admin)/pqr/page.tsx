"use client";
import { PqrFilters } from "@/components/pqr/pqr-filters";
import { PQRTable } from "@/components/pqr/pqr-table";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { usePQRS } from "@/hooks/pqr/usePQRs";
import { useState, Suspense, useEffect } from "react";
import { parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import OrganizationSelector from "@/components/OrganizationSelector";
import { useUserWithEntity } from "@/hooks/use-user-with-entity";
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
  const { userWithEntity: user, isLoading: userLoading } = useUserWithEntity();

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>();

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      setSelectedOrganizationId(entity?.id);
    } else {
      setSelectedOrganizationId(user?.Entity?.id);
    }
  }, [user, entity]);

  const { pqrs, assignPQR, isLoading } = usePQRS({
    departmentId: departmentId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    organizationId: selectedOrganizationId,
  });

  if (userLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-center items-center p-8">
          <div className="text-muted-foreground">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (user?.role === UserRole.SUPER_ADMIN && !selectedOrganizationId) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de PQRSD
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra y monitorea las PQRSD de tu entidad
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seleccionar Organización</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Selecciona una organización para ver su dashboard de PQRSD.
            </p>
            <OrganizationSelector userOrganizationId={user?.Entity?.id || ""} />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      {/* Header with title and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de PQRSD
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra y monitorea las PQRSD de tu entidad
            </p>
          </div>
        </div>

        {user?.role === UserRole.SUPER_ADMIN && selectedOrganizationId && (
          <div className="mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organización Seleccionada</CardTitle>
              </CardHeader>
              <CardContent>
                <OrganizationSelector userOrganizationId={user?.Entity?.id || ""} />
              </CardContent>
            </Card>
          </div>
        )}

          <PqrFilters 
            dateRange={dateRange} 
            setDateRange={setDateRange}
            organizationId={selectedOrganizationId}
          />
        
      </div>

      
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
