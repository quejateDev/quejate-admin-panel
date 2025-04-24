"use client";

import { useState, useEffect } from "react";
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
import { PQRS, PQRSStatus } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { assignPQRS } from "@/services/api/pqr.service";
import { EntityService } from "@/services/api/entity.service";

interface PQRTableProps {
  pqrs: (PQRS & {
    department: {
      id: string;
      name: string;
      entity: {
        id: string;
        name: string;
      };
    };
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    assignedTo: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  })[];
}

type PQRTableItem = PQRTableProps["pqrs"][number];

interface ColumnVisibility {
  [key: string]: boolean;
}

export function PQRTable({ pqrs }: PQRTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [employees, setEmployees] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string | null;
  }>>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Asumimos que todos los PQRs son de la misma entidad y tomamos el ID del primero
        if (pqrs.length > 0) {
          const entityId = pqrs[0].department.entity.id;
          const employeesList = await EntityService.getEmployees(entityId);
          setEmployees(employeesList);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [pqrs]);

  function getRemainingTimeBadge(createdAt: Date) {
    const RESPONSE_LIMIT_DAYS = 15;
    const remainingTime =
      new Date(createdAt).getTime() + RESPONSE_LIMIT_DAYS * 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const remaining = Math.floor(
      (remainingTime - currentTime) / (1000 * 60 * 60 * 24)
    );

    if (remaining > 5) {
      return <Badge variant="success">{remaining} días</Badge>;
    } else if (remaining > 0) {
      return <Badge variant="warning">{remaining} días</Badge>;
    } else {
      return <Badge variant="destructive">Vencido</Badge>;
    }
  }

  // Get unique departments for filter
  const departments = Array.from(
    new Set(pqrs.map((pqr) => pqr.department?.name).filter(Boolean))
  );

  const handleAssignment = async (pqrId: string, assignedToId: string | null) => {
    try {
      await assignPQRS(pqrId, assignedToId);
      // Refresh the table data
      window.location.reload();
    } catch (error) {
      console.error("Error assigning PQR:", error);
    }
  };

  const columns: ColumnDef<PQRTableItem>[] = [
    {
      id: "consecutiveCode",
      header: "Consecutivo",
      accessorFn: (row) => row.consecutiveCode,
      enableSorting: true,
    },
    {
      id: "type",
      header: "Tipo",
      accessorFn: (row) => row.type,
      cell: ({ row }) => typeMap[row.original.type as keyof typeof typeMap].label,
      enableSorting: true,
    },
    {
      id: "status",
      header: "Estado",
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <Badge variant={statusMap[row.original.status as PQRSStatus].variant as any}>
          {statusMap[row.original.status as PQRSStatus].label}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      id: "department",
      header: "Departamento",
      accessorFn: (row) => row.department?.name,
      cell: ({ row }) => row.original.department?.name || "No asignado",
      enableSorting: true,
    },
    {
      id: "subject",
      header: "Asunto",
      accessorFn: (row) => row.subject,
      enableSorting: true,
    },
    {
      id: "creator",
      header: "Creador",
      accessorFn: (row) => row.creator?.email,
      cell: ({ row }) => row.original.creator?.email || "Anónimo",
      enableSorting: true,
    },
    {
      id: "remainingTime",
      header: "Tiempo para responder",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => getRemainingTimeBadge(row.original.createdAt),
      enableSorting: true,
    },
    {
      id: "assignedTo",
      header: "Asignado a",
      accessorFn: (row) => row.assignedTo,
      cell: ({ row }) => {
        const pqr = row.original;
        
        // Filter employees by department
        const departmentEmployees = employees

        return (
          <Select
            value={pqr.assignedTo?.id || "unassigned"}
            onValueChange={(value) => handleAssignment(pqr.id, value === "unassigned" ? null : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar empleado">
                {pqr.assignedTo ? `${pqr.assignedTo.firstName} ${pqr.assignedTo.lastName}` : "Sin asignar"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {departmentEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const actions = {
    custom: [
      {
        icon: EyeIcon,
        label: "Ver PQRSD",
        onClick: (item: PQRS) => {
          window.location.href = `/pqr/${item.id}`;
        },
        variant: "outline" as const,
      },
    ],
  };

  // Filter function
  const filterData = (data: PQRTableItem[]) => {
    return data.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "all" || item.department?.name === departmentFilter;
      const matchesGlobal =
        !globalFilter ||
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(globalFilter.toLowerCase())
        );

      return matchesType && matchesStatus && matchesDepartment && matchesGlobal;
    });
  };

  const filteredData = filterData(pqrs);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset page index when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [globalFilter, typeFilter, statusFilter, departmentFilter]);

  // Get paginated data
  const paginatedData = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  return (
    <div className="space-y-4">
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

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
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

      <DataTable
        data={paginatedData}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron PQRSD"
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        pageCount={totalPages}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPageIndex(0);
        }}
        enableSorting={true}
      />
    </div>
  );
} 