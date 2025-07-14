"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PQRConfigForm } from "@/components/forms/pqr-config-form";
import PqrFieldsForm from "@/components/forms/pqr-fields-form";
import { toast } from "@/hooks/use-toast";

export default function EntityPQRConfigPage() {
  const params = useParams();
  const entityId = params.id as string;
  const [pqrConfig, setPqrConfig] = useState<any>(null);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const configResponse = await fetch(`/api/entities/${entityId}/pqr-config`);
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setPqrConfig(configData);
        }

        const fieldsResponse = await fetch(`/api/entities/${entityId}/pqr-config/fields`);
        if (fieldsResponse.ok) {
          const fieldsData = await fieldsResponse.json();
          setCustomFields(fieldsData.customFields || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Error al cargar la configuración",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (entityId) {
      fetchData();
    }
  }, [entityId]);

  if (isLoading) {
    return (
      <div className="py-6 px-4 md:px-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const configInitialData = {
    allowAnonymous: pqrConfig?.allowAnonymous ?? false,
    requireEvidence: pqrConfig?.requireEvidence ?? false,
    maxResponseTime: pqrConfig?.maxResponseTime?.toString() ?? "15",
    notifyEmail: pqrConfig?.notifyEmail ?? true,
    autoAssign: pqrConfig?.autoAssign ?? false,
  };

  const fieldsInitialData = {
    customFields: customFields ?? [],
  };

  return (
    <div className="py-6 px-4 md:px-6 flex flex-col gap-6">
      <Link href={`/entity/${entityId}/edit`}>
        <Button variant="ghost" size="sm" className="gap-2 bg-white">
          <ArrowLeft className="h-4 w-4" />
          Volver a Entidad
        </Button>
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Configuración de PQR para Entidad</h1>
      </div>

      <div className="grid gap-6">
        {!isLoading && (
          <>
            <PQRConfigForm 
              areaId={entityId} 
              initialData={configInitialData}
              isEntity={true}
            />
            
            <PqrFieldsForm 
              areaId={entityId} 
              initialData={fieldsInitialData}
              isEntity={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
