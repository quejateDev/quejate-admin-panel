"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import useOrganizations from "@/hooks/useOrganizations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";

interface EntitySelectFieldProps {
  value: string;
  onChange: (entityId: string) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Selector de entidad con gating por rol, resuelto desde el SERVIDOR
 * (GET /api/users/{id}/entity devuelve `role` + `Entity`), no desde el `role`
 * del `useSession()` client-side (que puede no estar hidratado a tiempo).
 *
 * - SUPER_ADMIN: elige cualquier entidad (lista de GET /api/entities).
 * - ADMIN / EMPLOYEE: queda fijado (read-only) a su propia entidad.
 * - Mientras se resuelve (o si no hay sesión fiable): se muestra el selector
 *   abierto. La autorización real la refuerza el servidor en POST /api/area.
 */
export function EntitySelectField({
  value,
  onChange,
  disabled,
  label = "Entidad",
}: EntitySelectFieldProps) {
  const user = useCurrentUser();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  const [role, setRole] = useState<string | null>(null);
  const [ownEntity, setOwnEntity] = useState<{ id: string; name: string } | null>(
    null
  );
  const [resolved, setResolved] = useState(false);

  // Fuente de verdad de rol + entidad propia: el servidor.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    axios
      .get(`/api/users/${user.id}/entity`)
      .then((res) => {
        if (!active) return;
        setRole(res.data?.role ?? null);
        setOwnEntity(res.data?.Entity ?? null);
      })
      .catch(() => {
        /* sin datos: se queda con el selector abierto y el server valida */
      })
      .finally(() => {
        if (active) setResolved(true);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const isSuperAdmin = role === "SUPER_ADMIN";

  // ADMIN/EMPLOYEE: auto-seleccionar su propia entidad.
  useEffect(() => {
    if (resolved && !isSuperAdmin && ownEntity?.id && value !== ownEntity.id) {
      onChange(ownEntity.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, isSuperAdmin, ownEntity?.id]);

  // No-superadmin ya resuelto: campo fijo a su entidad.
  if (resolved && !isSuperAdmin) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input value={ownEntity?.name ?? "Sin entidad asignada"} disabled />
      </div>
    );
  }

  // SUPER_ADMIN, o aún resolviendo: selector con buscador.
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Combobox
        options={(organizations ?? []).map((org) => ({
          value: org.id,
          label: org.name,
        }))}
        value={value}
        onValueChange={onChange}
        placeholder={
          orgsLoading ? "Cargando entidades..." : "Selecciona una entidad"
        }
        searchPlaceholder="Buscar entidad..."
        emptyText="No se encontraron entidades."
        disabled={disabled || orgsLoading}
      />
    </div>
  );
}
