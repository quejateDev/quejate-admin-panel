"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { SUGGESTION_STATUS_TRANSLATIONS } from "@/constants/suggestion-status";
import { formatText } from "@/utils/formatText";
import { SuggestionStatus } from "@prisma/client";

interface EntitySuggestion {
  id: string;
  entityName: string;
  regionalDepartmentId: string;
  municipalityId: string | null;
  status: SuggestionStatus; 
  createdAt: Date;
  updatedAt: Date;
  departmentName: string | null;
  municipalityName: string | null;
}

interface SuggestionsTableProps {
  initialSuggestions: EntitySuggestion[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function SuggestionsTable({ initialSuggestions, initialPagination }: SuggestionsTableProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSuggestions = async (page = 1, status = selectedStatus, search = searchTerm) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (status !== "all") {
        params.append("status", status);
      }

      const response = await axios.get(`/api/entity-suggestions?${params}`);
      setSuggestions(response.data.suggestions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al cargar las sugerencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(currentPage, selectedStatus, searchTerm);
  }, [currentPage, selectedStatus, searchTerm]);

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    try {
      const response = await axios.patch(`/api/entity-suggestions?id=${suggestionId}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        setSuggestions(suggestions.map((s) =>
          s.id === suggestionId ? { ...s, status: newStatus as keyof typeof SUGGESTION_STATUS_TRANSLATIONS } : s
        ));

        toast({
          title: "Estado actualizado",
          description: "El estado de la sugerencia ha sido actualizado correctamente",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado de la sugerencia",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre de entidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border border-muted"
          />
        </div>
        <div className="w-[200px]">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(SUGGESTION_STATUS_TRANSLATIONS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de Entidad</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : suggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron sugerencias
                </TableCell>
              </TableRow>
            ) : (
              suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="font-medium">{suggestion.entityName}</TableCell>
                  <TableCell>{formatText(suggestion.departmentName || "Sin departamento")}</TableCell>
                  <TableCell>{formatText(suggestion.municipalityName || "Sin municipio")}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      suggestion.status === 'IMPLEMENTED' ? 'bg-green-100 text-green-800' :
                      suggestion.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {SUGGESTION_STATUS_TRANSLATIONS[suggestion.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(suggestion.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={suggestion.status}
                      onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUGGESTION_STATUS_TRANSLATIONS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
          {pagination.total} resultados
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-3 text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
