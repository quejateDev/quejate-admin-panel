"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Prisma } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import { useDepartments } from "@/hooks/useDeparments";
import { Skeleton } from "../ui/skeleton";

type PqrFiltersProps = {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
};

export function PqrFilters({
  dateRange,
  setDateRange,
}: PqrFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(dateRange);

  const { data: departments, isLoading: isDepartmentsLoading  } =
    useDepartments({ entityId: "" });

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

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    setDateRange(range);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={searchParams.get("departmentId") || ""}
        onValueChange={(value) => updateFilters("departmentId", value)}
      >
        {isDepartmentsLoading ? (
          <Skeleton className="w-[200px] h-[38px]" />
        ) : (
          <>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
        <SelectContent>
          {departments?.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </>
      )}
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date?.to ? (
                <>
                  {format(date.from, "P", { locale: es })} -{" "}
                  {format(date.to, "P", { locale: es })}
                </>
              ) : (
                format(date.from, "P", { locale: es })
              )
            ) : (
              <span>Filtrar por fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
    </div>
  );
}
