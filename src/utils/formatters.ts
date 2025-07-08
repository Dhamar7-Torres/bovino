// Funciones de formateo para la aplicación ganadera

import {
  BovineType,
  BovineGender,
  HealthStatus,
  IllnessSeverity,
  BOVINE_TYPE_LABELS,
  BOVINE_GENDER_LABELS,
  HEALTH_STATUS_LABELS,
  ILLNESS_SEVERITY_LABELS,
} from "../constants/bovineTypes";

// Formatear números con separadores de miles
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-MX").format(num);
};

// Formatear moneda en pesos mexicanos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

// Formatear peso en kilogramos
export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)} kg`;
};

// Formatear porcentaje
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// Formatear distancia en metros/kilómetros
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

// Formatear área en hectáreas
export const formatArea = (squareMeters: number): string => {
  const hectares = squareMeters / 10000;
  if (hectares < 1) {
    return `${squareMeters.toFixed(0)} m²`;
  } else {
    return `${hectares.toFixed(2)} ha`;
  }
};

// Formatear densidad de ganado
export const formatDensity = (animalsPerHectare: number): string => {
  return `${animalsPerHectare.toFixed(1)} animales/ha`;
};

// Formatear coordenadas geográficas
export const formatCoordinates = (lat: number, lng: number): string => {
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "O";

  return `${Math.abs(lat).toFixed(6)}°${latDirection}, ${Math.abs(lng).toFixed(
    6
  )}°${lngDirection}`;
};

// Formatear número de arete (agregar padding si es necesario)
export const formatEarTag = (earTag: string): string => {
  // Si es un número, agregar ceros a la izquierda hasta 6 dígitos
  if (/^\d+$/.test(earTag)) {
    return earTag.padStart(6, "0");
  }
  return earTag.toUpperCase();
};

// Formatear nombre de animal (capitalizar)
export const formatAnimalName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Formatear tipo de ganado bovino
export const formatBovineType = (type: BovineType): string => {
  return BOVINE_TYPE_LABELS[type] || type;
};

// Formatear género
export const formatGender = (gender: BovineGender): string => {
  return BOVINE_GENDER_LABELS[gender] || gender;
};

// Formatear estado de salud
export const formatHealthStatus = (status: HealthStatus): string => {
  return HEALTH_STATUS_LABELS[status] || status;
};

// Formatear severidad de enfermedad
export const formatIllnessSeverity = (severity: IllnessSeverity): string => {
  return ILLNESS_SEVERITY_LABELS[severity] || severity;
};

// Formatear edad en formato legible
export const formatAge = (
  years: number,
  months: number,
  days: number
): string => {
  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "mes" : "meses"}`);
  }
  if (days > 0 && years === 0) {
    // Solo mostrar días si no hay años
    parts.push(`${days} ${days === 1 ? "día" : "días"}`);
  }

  return parts.length > 0 ? parts.join(", ") : "Recién nacido";
};

// Formatear duración en días/semanas/meses
export const formatDuration = (days: number): string => {
  if (days < 7) {
    return `${days} ${days === 1 ? "día" : "días"}`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "año" : "años"}`;
  }
};

// Formatear número de teléfono mexicano
export const formatPhoneNumber = (phone: string): string => {
  // Eliminar todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Formatear según la longitud
  if (cleaned.length === 10) {
    // Formato: (442) 123-4567
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    // Formato con código de país: +52 1 (442) 123-4567
    return `+52 1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
      4,
      7
    )}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("52")) {
    // Formato internacional: +52 (442) 123-4567
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 5)}) ${cleaned.slice(
      5,
      8
    )}-${cleaned.slice(8)}`;
  }

  return phone; // Devolver sin formato si no coincide
};

// Formatear texto largo con truncamiento
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

// Formatear lista de elementos con separadores
export const formatList = (
  items: string[],
  separator: string = ", "
): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(" y ");

  const lastItem = items.pop();
  return items.join(separator) + " y " + lastItem;
};

// Formatear estado de vacunación
export const formatVaccinationStatus = (nextDueDate?: Date): string => {
  if (!nextDueDate) return "No programada";

  const now = new Date();
  const dueDate = new Date(nextDueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Vencida (${Math.abs(diffDays)} días)`;
  } else if (diffDays === 0) {
    return "Vence hoy";
  } else if (diffDays <= 7) {
    return `Vence en ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  } else {
    return "Al día";
  }
};

// Formatear prioridad con colores
export const formatPriority = (
  priority: string
): { text: string; color: string } => {
  const priorities = {
    low: { text: "Baja", color: "#10b981" },
    medium: { text: "Media", color: "#f59e0b" },
    high: { text: "Alta", color: "#ef4444" },
    urgent: { text: "Urgente", color: "#dc2626" },
  };

  return (
    priorities[priority as keyof typeof priorities] || {
      text: priority,
      color: "#6b7280",
    }
  );
};

// Formatear temperatura
export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`;
};

// Formatear humedad
export const formatHumidity = (percentage: number): string => {
  return `${percentage.toFixed(0)}%`;
};

// Formatear velocidad del viento
export const formatWindSpeed = (kmh: number): string => {
  return `${kmh.toFixed(1)} km/h`;
};

// Formatear precipitación
export const formatPrecipitation = (mm: number): string => {
  return `${mm.toFixed(1)} mm`;
};

// Formatear capacidad/volumen
export const formatVolume = (liters: number): string => {
  if (liters < 1000) {
    return `${liters.toFixed(1)} L`;
  } else {
    return `${(liters / 1000).toFixed(2)} m³`;
  }
};

// Formatear dosis de medicamento
export const formatDose = (amount: number, unit: string): string => {
  return `${amount} ${unit}`;
};

// Formatear intervalo de tiempo
export const formatInterval = (
  value: number,
  unit: "days" | "weeks" | "months" | "years"
): string => {
  const units = {
    days: value === 1 ? "día" : "días",
    weeks: value === 1 ? "semana" : "semanas",
    months: value === 1 ? "mes" : "meses",
    years: value === 1 ? "año" : "años",
  };

  return `${value} ${units[unit]}`;
};

// Formatear rango de fechas
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString("es-MX");
  const end = endDate.toLocaleDateString("es-MX");

  if (start === end) {
    return start;
  }

  return `${start} - ${end}`;
};

// Formatear estado binario (activo/inactivo)
export const formatStatus = (active: boolean): string => {
  return active ? "Activo" : "Inactivo";
};

// Formatear género con icono de texto
export const formatGenderWithIcon = (gender: BovineGender): string => {
  const icons = {
    male: "♂",
    female: "♀",
  };

  return `${icons[gender]} ${formatGender(gender)}`;
};

// Formatear resultado de búsqueda con highlight
export const formatSearchResult = (
  text: string,
  searchTerm: string
): string => {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

// Formatear riesgo sanitario
export const formatHealthRisk = (
  riskPercentage: number
): { text: string; color: string; level: string } => {
  if (riskPercentage <= 20) {
    return { text: "Bajo", color: "#10b981", level: "low" };
  } else if (riskPercentage <= 50) {
    return { text: "Medio", color: "#f59e0b", level: "medium" };
  } else if (riskPercentage <= 80) {
    return { text: "Alto", color: "#ef4444", level: "high" };
  } else {
    return { text: "Crítico", color: "#dc2626", level: "critical" };
  }
};

// Formatear estadísticas con unidades
export const formatStat = (
  value: number,
  unit: string,
  decimals: number = 0
): string => {
  return `${formatNumber(Number(value.toFixed(decimals)))} ${unit}`;
};

// Formatear número con sufijos (K, M, B)
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};
