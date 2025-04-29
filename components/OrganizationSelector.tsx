"use client";

import { Entity } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useOrganizationStore from "@/store/useOrganizationStore";

export default function OrganizationSelector({
  entities,
  userOrganizationId,
}: {
  entities: Entity[];
  userOrganizationId: string;
}) {
  const { entity, setEntity } = useOrganizationStore();

  return (
    <div className="w-full py-2">
      <Select
        value={entity?.id ?? userOrganizationId}
        onValueChange={(value) =>
          setEntity(entities.find((e) => e.id === value)!)
        }
      >
        <SelectTrigger className="w-full bg-white text-black border rounded-sm shadow-md">
          <SelectValue placeholder="Selecciona una organización" />
        </SelectTrigger>
        <SelectContent>
          {entities.map((entity) => (
            <SelectItem key={entity.id} value={entity.id}>
              {entity.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
