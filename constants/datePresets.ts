import { 
  subDays, 
  subMonths, 
  startOfDay, 
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from "date-fns";
import { DateRange } from "react-day-picker";

export interface DatePreset {
  label: string;
  value: string;
  description?: string;
  range: () => DateRange | undefined;
}

export const datePresets: DatePreset[] = [
  { 
    label: "Hoy", 
    value: "today",
    description: "Solo el día actual",
    range: () => ({ 
      from: startOfDay(new Date()), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Ayer", 
    value: "yesterday",
    description: "Solo el día anterior",
    range: () => ({ 
      from: startOfDay(subDays(new Date(), 1)), 
      to: endOfDay(subDays(new Date(), 1)) 
    })
  },
  { 
    label: "Últimos 7 días", 
    value: "7days",
    description: "Los últimos 7 días incluyendo hoy",
    range: () => ({ 
      from: startOfDay(subDays(new Date(), 6)), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Últimos 30 días", 
    value: "30days",
    description: "Los últimos 30 días desde hoy hacia atrás",
    range: () => ({ 
      from: startOfDay(subDays(new Date(), 29)), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Este mes", 
    value: "thismonth",
    description: "Desde el 1° del mes actual hasta hoy",
    range: () => ({ 
      from: startOfMonth(new Date()), 
      to: endOfMonth(new Date()) 
    })
  },
  { 
    label: "Mes pasado", 
    value: "lastmonth",
    description: "El mes calendario anterior completo",
    range: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth), 
        to: endOfMonth(lastMonth)
      };
    }
  },
  { 
    label: "Este año", 
    value: "thisyear",
    description: "Desde el 1° de enero hasta hoy",
    range: () => ({ 
      from: startOfYear(new Date()), 
      to: endOfYear(new Date()) 
    })
  },
  { 
    label: "Personalizado", 
    value: "custom",
    description: "Seleccionar fechas manualmente",
    range: () => undefined
  }
];

export const getCurrentPreset = (currentRange: DateRange | undefined): string => {
  if (!currentRange?.from || !currentRange?.to) return "";
  
  for (const preset of datePresets) {
    if (preset.value === "custom") continue;
    
    const presetRange = preset.range();
    if (presetRange && 
        presetRange.from?.getTime() === currentRange.from.getTime() &&
        presetRange.to?.getTime() === currentRange.to.getTime()) {
      return preset.value;
    }
  }
  
  return "custom";
};

export const getDateDisplayText = (
  selectedPreset: string, 
  date: DateRange | undefined
): string => {
  if (selectedPreset && selectedPreset !== "custom") {
    const preset = datePresets.find(p => p.value === selectedPreset);
    return preset?.label || "Filtrar por fecha";
  }

  if (date?.from) {
    if (date?.to) {
      return `${date.from.toLocaleDateString('es-ES')} - ${date.to.toLocaleDateString('es-ES')}`;
    } else {
      return date.from.toLocaleDateString('es-ES');
    }
  }

  return "Filtrar por fecha";
};
