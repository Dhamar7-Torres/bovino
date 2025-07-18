import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

// Tipos para el DatePicker
interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  highlightDates?: HighlightDate[];
  showTime?: boolean;
  format?: "date" | "datetime" | "time";
  size?: "small" | "medium" | "large";
  variant?: "default" | "bordered" | "filled";
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  closeOnSelect?: boolean;
  disabledDates?: Date[];
  vaccinationContext?: boolean; // Contexto específico para vacunación
  onValidationChange?: (isValid: boolean) => void;
}

// Tipo para fechas destacadas (vacunaciones, eventos importantes)
interface HighlightDate {
  date: Date;
  type: "vaccination" | "illness" | "birth" | "event" | "warning" | "success";
  label?: string;
  description?: string;
}

// Configuraciones de estilo por tamaño
const sizeConfigs = {
  small: {
    input: "px-3 py-2 text-sm",
    calendar: "text-sm",
    daySize: "w-8 h-8 text-xs",
  },
  medium: {
    input: "px-4 py-3 text-base",
    calendar: "text-base",
    daySize: "w-10 h-10 text-sm",
  },
  large: {
    input: "px-5 py-4 text-lg",
    calendar: "text-lg",
    daySize: "w-12 h-12 text-base",
  },
};

// Configuraciones de variante
const variantConfigs = {
  default: {
    input:
      "border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
    calendar: "bg-white border border-gray-200 shadow-lg",
  },
  bordered: {
    input: "border-2 border-gray-300 bg-white focus:border-blue-500",
    calendar: "bg-white border-2 border-gray-300 shadow-xl",
  },
  filled: {
    input:
      "border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500",
    calendar: "bg-white border border-gray-200 shadow-lg",
  },
};

// Colores para tipos de fechas destacadas
const highlightColors = {
  vaccination: "bg-green-100 text-green-800 border-green-300",
  illness: "bg-red-100 text-red-800 border-red-300",
  birth: "bg-blue-100 text-blue-800 border-blue-300",
  event: "bg-purple-100 text-purple-800 border-purple-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  success: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

// Nombres de meses en español
const MONTHS = [
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

// Nombres de días en español
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Animaciones
const calendarVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
};

const dayVariants = {
  hover: {
    scale: 1.1,
    backgroundColor: "#EBF8FF",
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Componente DatePicker personalizado para la aplicación de ganado
 * Incluye funcionalidades específicas para fechas de vacunación y eventos veterinarios
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  minDate,
  maxDate,
  highlightDates = [],
  showTime = false,
  format = "date",
  size = "medium",
  variant = "default",
  className = "",
  error,
  label,
  required = false,
  clearable = true,
  closeOnSelect = true,
  disabledDates = [],
  vaccinationContext = false,
  onValidationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => value || new Date());
  const [selectedTime, setSelectedTime] = useState(() => ({
    hours: value?.getHours() ?? 12,
    minutes: value?.getMinutes() ?? 0,
  }));

  const sizeConfig = sizeConfigs[size];
  const variantConfig = variantConfigs[variant];

  // Validación de fecha
  const validateDate = useCallback(
    (date: Date | null): boolean => {
      if (!date) return !required;

      if (minDate && date < minDate) return false;
      if (maxDate && date > maxDate) return false;

      // Verificar fechas deshabilitadas
      if (
        disabledDates.some(
          (disabledDate) => disabledDate.toDateString() === date.toDateString()
        )
      ) {
        return false;
      }

      // Validación específica para contexto de vacunación
      if (vaccinationContext) {
        const now = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(now.getFullYear() + 1); // Máximo 1 año en el futuro

        if (date > maxFutureDate) return false;
      }

      return true;
    },
    [minDate, maxDate, disabledDates, required, vaccinationContext]
  );

  // Efecto para notificar cambios de validación
  useEffect(() => {
    const isValid = validateDate(value ?? null);
    onValidationChange?.(isValid);
  }, [value, validateDate, onValidationChange]);

  // Formatear fecha para mostrar
  const formatDate = useCallback(
    (date: Date | null): string => {
      if (!date) return "";

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      if (showTime || format === "datetime") {
        options.hour = "2-digit";
        options.minute = "2-digit";
      }

      return date.toLocaleDateString("es-ES", options);
    },
    [showTime, format]
  );

  // Obtener días del mes actual
  const getDaysInMonth = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  // Verificar si una fecha está destacada
  const getHighlightInfo = useCallback(
    (date: Date): HighlightDate | null => {
      return (
        highlightDates.find(
          (highlight) => highlight.date.toDateString() === date.toDateString()
        ) || null
      );
    },
    [highlightDates]
  );

  // Manejar selección de fecha
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (!validateDate(date)) return;

      let finalDate = new Date(date);

      if (showTime || format === "datetime") {
        finalDate.setHours(selectedTime.hours);
        finalDate.setMinutes(selectedTime.minutes);
      }

      onChange(finalDate);

      if (closeOnSelect && !showTime) {
        setIsOpen(false);
      }
    },
    [validateDate, showTime, format, selectedTime, onChange, closeOnSelect]
  );

  // Manejar cambio de tiempo
  const handleTimeChange = useCallback(
    (field: "hours" | "minutes", newValue: number) => {
      const newTime = { ...selectedTime, [field]: newValue };
      setSelectedTime(newTime);

      if (value) {
        const newDate = new Date(value.getTime()); // Crear nueva instancia para evitar mutación
        newDate.setHours(newTime.hours);
        newDate.setMinutes(newTime.minutes);
        onChange(newDate);
      }
    },
    [selectedTime, value, onChange]
  );

  // Limpiar fecha
  const handleClear = useCallback(() => {
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  // Navegar meses
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  }, []);

  const days = getDaysInMonth();
  const isValid = validateDate(value ?? null);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <motion.label
          className="block text-sm font-medium text-gray-700 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}

      {/* Input */}
      <motion.div
        className={`relative ${sizeConfig.input} ${
          variantConfig.input
        } rounded-lg cursor-pointer transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          error || !isValid
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center justify-between">
          <span className={`${value ? "text-gray-900" : "text-gray-500"}`}>
            {value ? formatDate(value) : placeholder}
          </span>

          <div className="flex items-center space-x-2">
            {clearable && value && !disabled && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {/* Error o estado de validación */}
      {(error || !isValid) && (
        <motion.div
          className="flex items-center mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          {error || "Fecha no válida"}
        </motion.div>
      )}

      {/* Contexto de vacunación - información adicional */}
      {vaccinationContext && value && isValid && (
        <motion.div
          className="flex items-center mt-2 text-sm text-green-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Fecha válida para registro de vacunación
        </motion.div>
      )}

      {/* Calendario */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-full left-0 mt-2 z-50 ${variantConfig.calendar} rounded-lg overflow-hidden ${sizeConfig.calendar}`}
            variants={calendarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Header del calendario */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <motion.button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <h3 className="font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>

              <motion.button
                type="button"
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-100">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-gray-500 font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className={sizeConfig.daySize} />;
                }

                const isSelected =
                  value && day.toDateString() === value.toDateString();
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isDisabled = !validateDate(day);
                const highlightInfo = getHighlightInfo(day);

                return (
                  <motion.button
                    key={day.toDateString()}
                    type="button"
                    className={`
                      ${
                        sizeConfig.daySize
                      } rounded-lg font-medium transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isToday
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                      ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${
                        highlightInfo
                          ? `${highlightColors[highlightInfo.type]} border`
                          : ""
                      }
                    `}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled}
                    variants={dayVariants}
                    whileHover={!isDisabled ? "hover" : {}}
                    whileTap={!isDisabled ? "tap" : {}}
                    title={highlightInfo?.description}
                  >
                    {day.getDate()}
                    {/* Indicador para fechas destacadas */}
                    {highlightInfo && (
                      <div className="w-1 h-1 bg-current rounded-full mx-auto mt-1" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selector de tiempo */}
            {(showTime || format === "datetime") && (
              <motion.div
                className="border-t border-gray-200 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className="flex items-center space-x-4">
                  <Clock className="w-4 h-4 text-gray-500" />

                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTime.hours}
                      onChange={(e) =>
                        handleTimeChange("hours", parseInt(e.target.value))
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>

                    <span>:</span>

                    <select
                      value={selectedTime.minutes}
                      onChange={(e) =>
                        handleTimeChange("minutes", parseInt(e.target.value))
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar el calendario */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default DatePicker;
