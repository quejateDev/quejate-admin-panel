"use client";
import { useState } from "react";
import { DeparmentsTable } from "@/components/DeparmentsTable";
import { Building2 } from "lucide-react";
import MetricCard from "@/components/charts/pqr/MetricCard";
import { useDepartments } from "@/hooks/useDeparments";
import { EntitySelectField } from "@/components/EntitySelectField";

export default function AreasPage() {
  const [entityId, setEntityId] = useState("");

  const { data: departments, isLoading } = useDepartments({ entityId });

  const stats = {
    total: departments?.length ?? 0,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md">
        <EntitySelectField
          value={entityId}
          onChange={setEntityId}
          label="Entidad"
        />
      </div>

      {entityId ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Áreas"
              value={stats.total}
              description="Total de áreas en la entidad"
              isLoading={isLoading}
              icon={<Building2 className="h-4 w-4 text-primary/80" />}
            />
          </div>

          <DeparmentsTable
            departments={departments ?? []}
            entityId={entityId}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecciona una entidad para ver y gestionar sus áreas.
        </p>
      )}
    </div>
  );
}
