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

export default function OrganizationSelector({
  userOrganizationId,
}: {
  userOrganizationId: string;
}) {
  const { entity, setEntity } = useOrganizationStore();
  const { data: organizations } = useOrganizations();
  return (
    <div className="w-full py-2">
      <Select
        value={entity?.id ?? userOrganizationId}
        onValueChange={(value) => {
          const organization = organizations?.find((e) => e.id === value);
          if (organization) {
            setEntity(organization);
          }
        }}
      >
        <SelectTrigger className="w-full bg-white text-black border rounded-sm shad">
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
