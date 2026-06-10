"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import useOrganizations from "@/hooks/useOrganizations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EntitySelectFieldProps {
  value: string;
  onChange: (entityId: string) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Selector de entidad con gating por rol:
 * - SUPER_ADMIN: puede elegir cualquier entidad (lista de GET /api/entities).
 * - ADMIN / EMPLOYEE: queda fijado (read-only) a su propia entidad, que se
 *   resuelve vía GET /api/users/{id}/entity y se auto-selecciona.
 *
 * Reemplaza la dependencia del store huérfano `useOrganizationStore` para
 * decidir bajo qué entidad se crea un área o un usuario.
 */
export function EntitySelectField({
  value,
  onChange,
  disabled,
  label = "Entidad",
}: EntitySelectFieldProps) {
  const user = useCurrentUser();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const { data: organizations, isLoading } = useOrganizations();
  const [lockedEntity, setLockedEntity] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  // ADMIN/EMPLOYEE: fijar a su propia entidad y auto-seleccionarla.
  useEffect(() => {
    if (isSuperAdmin || !user?.id) return;
    let active = true;
    setResolving(true);
    axios
      .get(`/api/users/${user.id}/entity`)
      .then((res) => {
        const entity = res.data?.Entity;
        if (active && entity?.id) {
          setLockedEntity(entity);
          onChange(entity.id);
        }
      })
      .catch(() => {
        /* sin entidad asociada: el campo queda vacío y el submit lo validará */
      })
      .finally(() => {
        if (active) setResolving(false);
      });
    return () => {
      active = false;
    };
    // onChange se omite a propósito: solo debe dispararse al resolver la entidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, user?.id]);

  if (!isSuperAdmin) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          value={
            lockedEntity?.name ??
            (resolving ? "Cargando entidad..." : "Sin entidad asignada")
          }
          disabled
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isLoading ? "Cargando entidades..." : "Selecciona una entidad"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {organizations?.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
