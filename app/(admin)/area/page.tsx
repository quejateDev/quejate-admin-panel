import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeparmentsTable } from "@/components/DeparmentsTable";
import prisma from "@/lib/prisma";
import { getCookie, verifyToken } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MetricCard from "@/components/charts/pqr/MetricCard";
export const dynamic = "force-dynamic";

export default async function AreasPage() {
  const token = await getCookie("token");
  if (!token) {
    return redirect("/login");
  }
  const decoded = await verifyToken(token);
  if (!decoded) {
    return redirect("/login");
  }
  const departments = await prisma.department.findMany({
    include: {
      entity: true,
    },
    where: {
      entity: {
        id: decoded.entityId,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const stats = {
    total: departments.length,
    departments: departments.length,
    entities: new Set(departments.map((d) => d.entityId)).size,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Áreas"
          value={stats.total}
          description="Total de áreas en la entidad"
          isLoading={false}
          icon={<Building2 className="h-4 w-4 text-primary/80" />}
        />
        <MetricCard
          title="Total Entidades"
          value={stats.entities}
          description="Total de entidades en la entidad"
          isLoading={false}
          icon={<Building2 className="h-4 w-4 text-primary/80" />}
        />
      </div>

      <DeparmentsTable departments={departments} />
    </div>
  );
}
