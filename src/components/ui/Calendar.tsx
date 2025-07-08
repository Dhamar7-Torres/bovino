import React, { useState, useMemo } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para eventos del calendario
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type:
    | "vaccination"
    | "breeding"
    | "health"
    | "feeding"
    | "general"
    | "veterinary";
  color?: string;
  time?: string;
  description?: string;
}

// Props del componente Calendar
export interface CalendarProps {
  // Fecha seleccionada actualmente
  selectedDate?: Date;
  // Callback cuando se selecciona una fecha
  onDateSelect?: (date: Date) => void;
  // Eventos a mostrar en el calendario
  events?: CalendarEvent[];
  // Callback cuando se hace click en un evento
  onEventClick?: (event: CalendarEvent) => void;
  // Modo del calendario
  mode?: "single" | "multiple" | "range";
  // Fechas múltiples seleccionadas (para modo multiple)
  selectedDates?: Date[];
  // Rango de fechas seleccionado (para modo range)
  selectedRange?: { from: Date; to?: Date };
  // Callback para fechas múltiples
  onMultipleDatesSelect?: (dates: Date[]) => void;
  // Callback para rango de fechas
  onRangeSelect?: (range: { from: Date; to?: Date }) => void;
  // Deshabilitar fechas específicas
  disabledDates?: Date[];
  // Fecha mínima seleccionable
  minDate?: Date;
  // Fecha máxima seleccionable
  maxDate?: Date;
  // Idioma del calendario
  locale?: "es" | "en";
  // Clases CSS adicionales
  className?: string;
}

// Nombres de meses y días en español
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Nombres de meses y días en inglés
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Función para obtener el color del tipo de evento
const getEventTypeColor = (type: CalendarEvent["type"]): string => {
  const colors = {
    vaccination: "bg-blue-500",
    breeding: "bg-purple-500",
    health: "bg-red-500",
    feeding: "bg-green-500",
    veterinary: "bg-orange-500",
    general: "bg-gray-500",
  };
  return colors[type];
};

// Función para verificar si dos fechas son del mismo día
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Función para verificar si una fecha está deshabilitada
const isDateDisabled = (
  date: Date,
  disabledDates?: Date[],
  minDate?: Date,
  maxDate?: Date
): boolean => {
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disabledDates?.some((disabled) => isSameDay(date, disabled))) return true;
  return false;
};

// Componente principal Calendar
const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  events = [],
  onEventClick,
  mode = "single",
  selectedDates = [],
  selectedRange,
  onMultipleDatesSelect,
  onRangeSelect,
  disabledDates,
  minDate,
  maxDate,
  locale = "es",
  className,
}) => {
  // Estado para el mes y año actual mostrado
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener nombres según el idioma
  const months = locale === "es" ? MONTHS_ES : MONTHS_EN;
  const days = locale === "es" ? DAYS_ES : DAYS_EN;

  // Generar días del calendario para el mes actual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Día de la semana del primer día (0 = domingo)
    const startDayOfWeek = firstDay.getDay();

    // Generar array de días
    const days = [];

    // Días del mes anterior (para completar la primera semana)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del siguiente mes (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Manejar selección de fecha
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date, disabledDates, minDate, maxDate)) return;

    switch (mode) {
      case "single":
        onDateSelect?.(date);
        break;
      case "multiple":
        const newSelectedDates = selectedDates.some((d) => isSameDay(d, date))
          ? selectedDates.filter((d) => !isSameDay(d, date))
          : [...selectedDates, date];
        onMultipleDatesSelect?.(newSelectedDates);
        break;
      case "range":
        if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
          onRangeSelect?.({ from: date });
        } else {
          const from = selectedRange.from;
          const to = date;
          onRangeSelect?.({
            from: from < to ? from : to,
            to: from < to ? to : from,
          });
        }
        break;
    }
  };

  // Verificar si una fecha está seleccionada
  const isDateSelected = (date: Date): boolean => {
    switch (mode) {
      case "single":
        return selectedDate ? isSameDay(date, selectedDate) : false;
      case "multiple":
        return selectedDates.some((d) => isSameDay(d, date));
      case "range":
        if (!selectedRange?.from) return false;
        if (!selectedRange.to) return isSameDay(date, selectedRange.from);
        return date >= selectedRange.from && date <= selectedRange.to;
      default:
        return false;
    }
  };

  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-6", className)}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mes anterior"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mes siguiente"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const isSelected = isDateSelected(date);
          const isDisabled = isDateDisabled(
            date,
            disabledDates,
            minDate,
            maxDate
          );
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={index}
              className={cn(
                "relative p-2 min-h-[40px] cursor-pointer transition-all duration-200 rounded-lg",
                "hover:bg-gray-100",
                isCurrentMonth ? "text-gray-900" : "text-gray-400",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                isDisabled && "cursor-not-allowed opacity-50",
                isToday &&
                  !isSelected &&
                  "bg-blue-100 text-blue-600 font-semibold"
              )}
              onClick={() => !isDisabled && handleDateClick(date)}
            >
              {/* Número del día */}
              <div className="text-center text-sm">{date.getDate()}</div>

              {/* Eventos del día */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        event.color || getEventTypeColor(event.type)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda de tipos de eventos */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {locale === "es" ? "Tipos de eventos:" : "Event types:"}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              {
                type: "vaccination" as const,
                label: locale === "es" ? "Vacunación" : "Vaccination",
              },
              {
                type: "breeding" as const,
                label: locale === "es" ? "Reproducción" : "Breeding",
              },
              {
                type: "health" as const,
                label: locale === "es" ? "Salud" : "Health",
              },
              {
                type: "feeding" as const,
                label: locale === "es" ? "Alimentación" : "Feeding",
              },
              {
                type: "veterinary" as const,
                label: locale === "es" ? "Veterinario" : "Veterinary",
              },
              {
                type: "general" as const,
                label: locale === "es" ? "General" : "General",
              },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    getEventTypeColor(type)
                  )}
                />
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Calendar };
