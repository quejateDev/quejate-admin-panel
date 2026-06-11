"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmployeeForm } from "@/components/forms/employee-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/useDeparments";
import { EntitySelectField } from "@/components/EntitySelectField";

function NewEmployeeContent() {
  const searchParams = useSearchParams();
  // Pre-selecciona la entidad si viene desde /users (?entityId=...).
  const [entityId, setEntityId] = useState(searchParams.get("entityId") ?? "");
  const { data: departments } = useDepartments({ entityId });

  return (
    <div className="py-6 px-4 md:px-6 flex flex-col gap-6">
      <Link href="/users">
        <Button variant="ghost" size="sm" className="gap-2 bg-white">
          <ArrowLeft className="h-4 w-4" />
          Volver a Empleados
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Nuevo Empleado</h1>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-muted-foreground">
            Complete la información del empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EntitySelectField value={entityId} onChange={setEntityId} />
          <EmployeeForm
            mode="create"
            departments={departments || []}
            entityId={entityId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewEmployeePage() {
  return (
    <Suspense fallback={null}>
      <NewEmployeeContent />
    </Suspense>
  );
}
