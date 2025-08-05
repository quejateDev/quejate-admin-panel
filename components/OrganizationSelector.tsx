"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useOrganizationStore from "@/store/useOrganizationStore";
import useOrganizations from "@/hooks/useOrganizations";
import { Skeleton } from "./ui/skeleton";
import { useEffect } from "react";

export default function OrganizationSelector({
  userOrganizationId,
}: {
  userOrganizationId: string;
}) {
  const { entity, setEntity } = useOrganizationStore();
  const { data: organizations, isLoading } = useOrganizations();

  useEffect(() => {
    if (!entity && organizations && organizations.length > 0) {
      setEntity(organizations[0]);
    }
  }, [entity, organizations, setEntity]);

  if (isLoading) {
    return (
      <div className="w-full py-2">
        <Skeleton className="w-full h-10" />
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="w-full py-2">
        <p className="text-muted-foreground text-sm">No hay organizaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <Select
        value={entity?.id ?? organizations[0]?.id}
        onValueChange={(value) => {
          const organization = organizations?.find((e) => e.id === value);
          if (organization) {
            setEntity(organization);
          }
        }}
      >
        <SelectTrigger className="w-full bg-white text-black border rounded-sm shadow-sm">
          <SelectValue placeholder="Selecciona una organización" />
        </SelectTrigger>
        <SelectContent>
          {organizations?.map((organization) => (
            <SelectItem key={organization.id} value={organization.id}>
              {organization.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
