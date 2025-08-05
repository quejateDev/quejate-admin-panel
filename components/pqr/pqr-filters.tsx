"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import { useDepartments } from "@/hooks/useDeparments";
import { Skeleton } from "../ui/skeleton";
import { 
  datePresets, 
  getCurrentPreset, 
  getDateDisplayText 
} from "@/constants/datePresets";

type PqrFiltersProps = {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  organizationId?: string;
};

export function PqrFilters({
  dateRange,
  setDateRange,
  organizationId,
}: PqrFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(dateRange);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const { data: departments, isLoading: isDepartmentsLoading  } =
    useDepartments({ entityId: organizationId || "" });

  // Inicializar el preset seleccionado
  useEffect(() => {
    setSelectedPreset(getCurrentPreset(dateRange));
  }, [dateRange]);

  function updateFilters(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // If entity changes, clear department
    if (key === "entityId") {
      params.delete("departmentId");
    }

    const newUrl = `?${params.toString()}`;

    router.push(newUrl);
  }

  const handleDatePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    
    if (presetValue === "custom") {
      setIsCalendarOpen(true);
      return;
    }

    const preset = datePresets.find(p => p.value === presetValue);
    if (preset) {
      const range = preset.range();
      if (range) {
        setDate(range);
        setDateRange(range);
      }
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    setDateRange(range);
    setIsCalendarOpen(false);
    
    // Actualizar el preset después de selección manual
    setSelectedPreset(getCurrentPreset(range));
  };

  return (
    <div className="flex flex-wrap gap-4">
      {organizationId && departments && departments.length > 0 && (
        <Select
          value={searchParams.get("departmentId") || "all"}
          onValueChange={(value) => updateFilters("departmentId", value === "all" ? null : value)}
        >
          {isDepartmentsLoading ? (
            <Skeleton className="w-[200px] h-[38px]" />
          ) : (
            <>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {departments?.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </>
          )}
        </Select>
      )}

      {/* Filtro de fechas rediseñado */}
      <div className="flex gap-2">
        {/* Selector de presets de fecha */}
        <Select
          value={selectedPreset}
          onValueChange={handleDatePresetChange}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por fecha" />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Popover del calendario para fechas personalizadas */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
                selectedPreset !== "custom" && "hidden"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateDisplayText(selectedPreset, date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm text-muted-foreground">
                Seleccionar rango personalizado
              </h4>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from ? date.from : undefined}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        {/* Mostrar el rango seleccionado cuando no es personalizado */}
        {selectedPreset && selectedPreset !== "custom" && (
          <div className="flex items-center px-3 py-2 bg-muted/50 rounded-md text-sm text-muted-foreground">
            {getDateDisplayText(selectedPreset, date)}
          </div>
        )}
      </div>
    </div>
  );
}
