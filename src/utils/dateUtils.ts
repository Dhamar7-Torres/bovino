// Utilidades para manejo de fechas en la aplicación ganadera

// Interfaz para rangos de fechas
export interface DateRange {
  start: Date;
  end: Date;
}

// Interfaz para fechas formateadas
export interface FormattedDate {
  short: string; // DD/MM/YY
  medium: string; // DD/MM/YYYY
  long: string; // DD de MMMM de YYYY
  time: string; // HH:mm
  dateTime: string; // DD/MM/YYYY HH:mm
  iso: string; // ISO 8601
  relative: string; // hace 2 días, en 3 semanas, etc.
}

// Meses en español
const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Días de la semana en español
const DAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

// Días de la semana abreviados
const DAYS_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Formatear fecha con padding de ceros
const pad = (num: number): string => num.toString().padStart(2, "0");

// Obtener fecha actual de México
export const getCurrentMexicoDate = (): Date => {
  const now = new Date();
  // Convertir a zona horaria de México (UTC-6)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const mexicoTime = new Date(utc + -6 * 3600000);
  return mexicoTime;
};

// Formatear fecha según diferentes formatos
export const formatDate = (date: Date): FormattedDate => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return {
    short: `${pad(day)}/${pad(month + 1)}/${year.toString().slice(-2)}`,
    medium: `${pad(day)}/${pad(month + 1)}/${year}`,
    long: `${day} de ${MONTHS_ES[month]} de ${year}`,
    time: `${pad(hours)}:${pad(minutes)}`,
    dateTime: `${pad(day)}/${pad(month + 1)}/${year} ${pad(hours)}:${pad(
      minutes
    )}`,
    iso: date.toISOString(),
    relative: getRelativeTime(date),
  };
};

// Obtener tiempo relativo en español
export const getRelativeTime = (date: Date): string => {
  const now = getCurrentMexicoDate();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Futuro
  if (diffMs < 0) {
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);
    const absDiffWeeks = Math.abs(diffWeeks);
    const absDiffMonths = Math.abs(diffMonths);
    const absDiffYears = Math.abs(diffYears);

    if (absDiffMinutes < 60) {
      return absDiffMinutes <= 1
        ? "en 1 minuto"
        : `en ${absDiffMinutes} minutos`;
    } else if (absDiffHours < 24) {
      return absDiffHours === 1 ? "en 1 hora" : `en ${absDiffHours} horas`;
    } else if (absDiffDays < 7) {
      return absDiffDays === 1 ? "mañana" : `en ${absDiffDays} días`;
    } else if (absDiffWeeks < 4) {
      return absDiffWeeks === 1 ? "en 1 semana" : `en ${absDiffWeeks} semanas`;
    } else if (absDiffMonths < 12) {
      return absDiffMonths === 1 ? "en 1 mes" : `en ${absDiffMonths} meses`;
    } else {
      return absDiffYears === 1 ? "en 1 año" : `en ${absDiffYears} años`;
    }
  }

  // Pasado
  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "hace 1 minuto" : `hace ${diffMinutes} minutos`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "hace 1 hora" : `hace ${diffHours} horas`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "ayer" : `hace ${diffDays} días`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? "hace 1 semana" : `hace ${diffWeeks} semanas`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? "hace 1 mes" : `hace ${diffMonths} meses`;
  } else {
    return diffYears === 1 ? "hace 1 año" : `hace ${diffYears} años`;
  }
};

// Verificar si una fecha es hoy
export const isToday = (date: Date): boolean => {
  const today = getCurrentMexicoDate();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Verificar si una fecha fue ayer
export const isYesterday = (date: Date): boolean => {
  const yesterday = getCurrentMexicoDate();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

// Verificar si una fecha es mañana
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = getCurrentMexicoDate();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

// Verificar si una fecha está en esta semana
export const isThisWeek = (date: Date): boolean => {
  const now = getCurrentMexicoDate();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
};

// Verificar si una fecha está en este mes
export const isThisMonth = (date: Date): boolean => {
  const now = getCurrentMexicoDate();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

// Agregar días a una fecha
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Agregar meses a una fecha
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Agregar años a una fecha
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Obtener inicio del día
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Obtener final del día
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Obtener inicio de la semana (domingo)
export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  result.setDate(result.getDate() - dayOfWeek);
  return startOfDay(result);
};

// Obtener final de la semana (sábado)
export const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
};

// Obtener inicio del mes
export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  return startOfDay(result);
};

// Obtener final del mes
export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  return endOfDay(result);
};

// Crear rango de fechas para diferentes períodos
export const getDateRange = (
  period: "today" | "week" | "month" | "quarter" | "year" | "custom",
  customStart?: Date,
  customEnd?: Date
): DateRange => {
  const now = getCurrentMexicoDate();

  switch (period) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    case "week":
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      };

    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };

    case "quarter":
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
      const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
      return {
        start: startOfDay(quarterStart),
        end: endOfDay(quarterEnd),
      };

    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };

    case "custom":
      if (!customStart || !customEnd) {
        throw new Error("Fechas personalizadas requeridas para período custom");
      }
      return {
        start: startOfDay(customStart),
        end: endOfDay(customEnd),
      };

    default:
      return getDateRange("today");
  }
};

// Calcular diferencia en días entre dos fechas
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Verificar si una fecha está vencida
export const isOverdue = (date: Date): boolean => {
  return date < getCurrentMexicoDate();
};

// Verificar si una fecha está próxima (dentro de X días)
export const isUpcoming = (date: Date, days: number = 7): boolean => {
  const now = getCurrentMexicoDate();
  const futureDate = addDays(now, days);
  return date >= now && date <= futureDate;
};

// Convertir string a fecha con validación
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Generar fechas para calendario de vacunación
export const generateVaccinationSchedule = (
  startDate: Date,
  intervalInMonths: number,
  numberOfDoses: number
): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numberOfDoses; i++) {
    dates.push(new Date(currentDate));
    currentDate = addMonths(currentDate, intervalInMonths);
  }

  return dates;
};

// Obtener días de la semana para calendario
export const getWeekDays = (startFromMonday: boolean = false): string[] => {
  return startFromMonday
    ? DAYS_SHORT_ES.slice(1).concat(DAYS_SHORT_ES.slice(0, 1))
    : DAYS_SHORT_ES;
};

// Obtener nombre del mes
export const getMonthName = (monthIndex: number): string => {
  return MONTHS_ES[monthIndex] || "";
};

// Obtener nombre del día
export const getDayName = (dayIndex: number): string => {
  return DAYS_ES[dayIndex] || "";
};

// Validar que una fecha no sea futura (útil para fechas de nacimiento)
export const isValidBirthDate = (date: Date): boolean => {
  const now = getCurrentMexicoDate();
  return date <= now;
};

// Validar que una fecha de vacunación no sea muy futura
export const isValidVaccinationDate = (
  date: Date,
  maxDaysInFuture: number = 30
): boolean => {
  const now = getCurrentMexicoDate();
  const maxFutureDate = addDays(now, maxDaysInFuture);
  return date <= maxFutureDate;
};

// Calcular próxima fecha de refuerzo de vacuna
export const calculateNextBoosterDate = (
  lastVaccinationDate: Date,
  intervalInMonths: number
): Date => {
  return addMonths(lastVaccinationDate, intervalInMonths);
};

// Obtener fechas importantes para dashboard
export const getImportantDates = () => {
  const now = getCurrentMexicoDate();

  return {
    today: now,
    tomorrow: addDays(now, 1),
    nextWeek: addDays(now, 7),
    nextMonth: addMonths(now, 1),
    startOfWeek: startOfWeek(now),
    endOfWeek: endOfWeek(now),
    startOfMonth: startOfMonth(now),
    endOfMonth: endOfMonth(now),
  };
};
