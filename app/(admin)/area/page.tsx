"use client";
import { DeparmentsTable } from "@/components/DeparmentsTable";
import { Building2 } from "lucide-react";
import MetricCard from "@/components/charts/pqr/MetricCard";
import useOrganizationStore from "@/store/useOrganizationStore";
import { useDepartments } from "@/hooks/useDeparments";

export default function AreasPage() {
  const { entity } = useOrganizationStore();

  const { data: departments, isLoading } = useDepartments({
    entityId: entity?.id ?? "",
  });

  const stats = {
    total: departments?.length ?? 0,
    departments: departments?.length ?? 0,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Áreas"
          value={stats.total}
          description="Total de áreas en la entidad"
          isLoading={isLoading}
          icon={<Building2 className="h-4 w-4 text-primary/80" />}
        />
      </div>

      <DeparmentsTable departments={departments ?? []} />
    </div>
  );
}
