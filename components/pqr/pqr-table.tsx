"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EyeIcon, SlidersHorizontal } from "lucide-react";
import { typeMap, statusMap } from "@/constants/pqrMaps";
import type { AdminPqrListItem, PqrStatusName } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { useEmployees } from "@/hooks/employee/useEmployees";

import { useCurrentUser } from "@/hooks/use-current-user";

interface PQRTableProps {
  assignPQR: any;
  pqrs: AdminPqrListItem[];
  isLoading?: boolean;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  entityId: string;
}

type PQRTableItem = PQRTableProps["pqrs"][number];

interface ColumnVisibility {
  [key: string]: boolean;
}

export function PQRTable({
  pqrs,
  assignPQR,
  isLoading,
  page,
  setPage,
  pageSize,
  totalPages,
  entityId,
}: PQRTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});

  const user = useCurrentUser();
  const { data: employees } = useEmployees(entityId);

  /**
   * Badge de plazo. **Lo decide el servidor, no esta función.**
   *
   * 🔴 Antes se calculaba aquí: 15 días **calendario** contados desde
   * `createdAt`. Estaban mal las tres cosas. El plazo de la Ley 1755 se cuenta
   * en días **hábiles** —sin fines de semana ni festivos colombianos—, no
   * siempre son 15 (cada entidad y cada área tienen el suyo, entre 1 y 15), y
   * el punto de partida es `dueDate`, que el backend calcula al radicar y que
   * además descuenta la jornada si la PQRSD entra pasadas las 18:00.
   *
   * Consecuencia medida: la entidad veía «Vencido» unos **cuatro días antes**
   * de que el plazo venciera de verdad, sobre un trámite regulado.
   *
   * Ahora se pintan los tres campos que `GET /admin/pqr` ya trae calculados:
   * `hasLegalDeadline`, `isOverdue` y `businessDaysOverdue`. Los días que
   * faltan se derivan de `dueDate` para el aviso, pero quién está vencida y por
   * cuánto lo dice el servidor — que es el mismo `getOverdueInfo` con el que se
   * generan los avisos de vencimiento y se pinta el muro público. Una cuarta
   * definición de «vencida» en el cliente es justo lo que la Tarea 22 vino a
   * quitar.
   */
  function getRemainingTimeBadge(pqr: PQRTableItem) {
    if (pqr.status === "RESOLVED" || pqr.status === "CLOSED") {
      const s = statusMap[pqr.status];
      return <Badge variant={s.variant as any}>{s.label}</Badge>;
    }

    // Una sugerencia no tiene término legal de respuesta: no se le pinta
    // ninguna etiqueta de plazo, ni «vence en» ni «vencida».
    if (!pqr.hasLegalDeadline) {
      return <Badge variant="secondary">Sin plazo</Badge>;
    }

    if (pqr.isOverdue) {
      const days = pqr.businessDaysOverdue;
      return (
        <Badge variant="destructive">
          {days > 0 ? `Vencido (${days} d. hábiles)` : "Vencido"}
        </Badge>
      );
    }

    const remaining = Math.ceil(
      (new Date(pqr.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return (
      <Badge variant={remaining > 5 ? "success" : "warning"}>
        {remaining} días
      </Badge>
    );
  }

  const handleAssignment = async (
    pqrId: string,
    assignedToId: string | null
  ) => {
    try {
      await assignPQR({ pqrId, assignedToId });
    } catch (error) {
      console.error("Error assigning PQR:", error);
    }
  };

  const columns: ColumnDef<PQRTableItem>[] = [
    {
      id: "consecutiveCode",
      header: "Consecutivo",
      accessorKey: "consecutiveCode",
      enableSorting: true,
    },
    {
      id: "type",
      header: "Tipo",
      accessorKey: "type",
      accessorFn: (row) => typeMap[row.type as keyof typeof typeMap].label,
      enableSorting: true,
    },
    {
      id: "status",
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          variant={statusMap[row.original.status as PqrStatusName].variant as any}
        >
          {statusMap[row.original.status as PqrStatusName].label}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      id: "subject",
      header: "Asunto",
      accessorKey: "subject",
      enableSorting: true,
    },
    {
      id: "creator",
      header: "Creador",
      // Leía `creator.email`, que ni la ruta vieja ni la nueva devuelven: la
      // columna decía «Anónimo» para todo el mundo. El backend publica del
      // autor `id`, `name` e `image`, y el nombre es lo que esta columna
      // quiere decir.
      accessorKey: "creator.name",
      accessorFn: (row) => (row.anonymous ? "Anónimo" : row.creator?.name || "Anónimo"),
      enableSorting: true,
    },
    {
      id: "remainingTime",
      header: "Tiempo para responder",
      accessorKey: "dueDate",
      cell: ({ row }) => getRemainingTimeBadge(row.original),
      enableSorting: true,
    },
    ...(user?.role !== "EMPLOYEE"
      ? [
          {
            id: "assignedTo",
            header: "Asignado a",
            accessorFn: (row: PQRTableItem) => row.assignedTo,
            cell: ({ row }: { row: { original: PQRTableItem } }) => {
              const pqr = row.original;
              const assignedTo = employees?.find(
                (e) => e.id === pqr.assignedTo?.id
              );

              return (
                <Select
                  value={pqr.assignedTo?.id || "unassigned"}
                  onValueChange={(value) =>
                    handleAssignment(
                      pqr.id,
                      value === "unassigned" ? null : value
                    )
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar empleado">
                      {assignedTo?.name ? `${assignedTo?.name}` : "Sin asignar"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            },
          },
        ]
      : []),
  ];

  const actions = {
    custom: [
      {
        icon: EyeIcon,
        label: "Ver PQRSD",
        onClick: (item: { id: string }) => {
          window.location.href = `/pqr/${item.id}`;
        },
        variant: "outline" as const,
      },
    ],
  };

  const filteredData = pqrs.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesGlobal =
      !globalFilter ||
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(globalFilter.toLowerCase())
      );
    return matchesType && matchesStatus && matchesGlobal;
  });

  return (
    <div className="space-y-4">
      <Filters />
      <DataTable
        isLoading={isLoading}
        data={filteredData}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron PQRSD"
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPageIndexChange={(newIndex) => setPage(newIndex + 1)}
        enableSorting={true}
      />
    </div>
  );

  function Filters() {
    return (
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar PQRSD..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(typeMap).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(statusMap).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => {
                if (!column.id) return null;
                const columnId = String(column.id);
                return (
                  <DropdownMenuCheckboxItem
                    key={columnId}
                    className="capitalize"
                    checked={columnVisibility[columnId] !== false}
                    onCheckedChange={(value) =>
                      setColumnVisibility({
                        ...columnVisibility,
                        [columnId]: value,
                      })
                    }
                  >
                    {column.header as string}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
}