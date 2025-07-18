// Archivo de índice para exportar todas las utilidades

// Importar funciones específicas para el objeto utils
import { calculateAge, calculateDistance } from "./calculations";
import { formatDate } from "./dateUtils";
import { formatCurrency, formatWeight } from "./formatters";
import { validateEarTag, validateEmail } from "./validators";
import { generateId, copyToClipboard, debounce } from "./helpers";

// Exportar todas las funciones de cálculo
export * from "./calculations";

// Exportar todas las utilidades de fechas
export * from "./dateUtils";

// Exportar todas las funciones de formateo
export * from "./formatters";

// Exportar todas las funciones de validación
export * from "./validators";

// Exportar todas las funciones helper
export * from "./helpers";

// Re-exportar tipos e interfaces principales para facilitar importaciones
export type {
  HealthStats,
  VaccinationStats,
  LocationStats,
} from "./calculations";

export type { DateRange, FormattedDate } from "./dateUtils";

export type { ValidationResult, ValidationErrors } from "./validators";

// Funciones helper combinadas más utilizadas
export const utils = {
  // Cálculos más comunes
  calculateAge,
  calculateDistance,

  // Formateo más común
  formatDate,
  formatCurrency,
  formatWeight,

  // Validaciones más comunes
  validateEarTag,
  validateEmail,

  // Helpers más útiles
  generateId,
  copyToClipboard,
  debounce,
} as const;

// Constantes útiles compartidas
export const UTILS_CONSTANTS = {
  // Límites comunes
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB

  // Formatos de archivo permitidos
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  // Expresiones regulares comunes
  REGEX: {
    EAR_TAG: /^[A-Z0-9]{3,20}$/i,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_MX: /^(\+52\s?)?1?\s?\(?[0-9]{3}\)?\s?[0-9]{3}\s?[0-9]{4}$/,
    DECIMAL_POSITIVE: /^\d+(\.\d{1,2})?$/,
    INTEGER_POSITIVE: /^\d+$/,
    COORDINATES: /^-?\d+\.?\d*$/,
  },

  // Rangos de valores válidos para ganado
  CATTLE_RANGES: {
    WEIGHT: { min: 10, max: 2000 }, // kg
    AGE: { min: 0, max: 300 }, // meses
    TEMPERATURE: { min: 35, max: 42 }, // °C
    HEART_RATE: { min: 40, max: 120 }, // ppm
    RESPIRATORY_RATE: { min: 10, max: 40 }, // rpm
  },

  // Distancias en metros
  DISTANCES: {
    QUARANTINE_RADIUS: 1000, // 1km
    OUTBREAK_RADIUS: 5000, // 5km
    FARM_BOUNDARY: 10000, // 10km
    MAX_TRACKING_DISTANCE: 50000, // 50km
  },

  // Intervalos de tiempo en días
  TIME_INTERVALS: {
    VACCINATION_REMINDER: 7, // días antes
    HEALTH_CHECK_FREQUENCY: 30, // días
    QUARANTINE_PERIOD: 21, // días
    ILLNESS_RECOVERY_TIMEOUT: 90, // días
  },
} as const;

// Funciones de conversión comunes
export const conversions = {
  // Conversiones de peso
  poundsToKg: (pounds: number): number => pounds * 0.453592,
  kgToPounds: (kg: number): number => kg * 2.20462,

  // Conversiones de temperatura
  fahrenheitToCelsius: (fahrenheit: number): number =>
    ((fahrenheit - 32) * 5) / 9,
  celsiusToFahrenheit: (celsius: number): number => (celsius * 9) / 5 + 32,

  // Conversiones de distancia
  milesToKm: (miles: number): number => miles * 1.60934,
  kmToMiles: (km: number): number => km * 0.621371,
  feetToMeters: (feet: number): number => feet * 0.3048,
  metersToFeet: (meters: number): number => meters * 3.28084,

  // Conversiones de área
  acresToHectares: (acres: number): number => acres * 0.404686,
  hectaresToAcres: (hectares: number): number => hectares * 2.47105,

  // Conversiones de coordenadas
  degreesToRadians: (degrees: number): number => degrees * (Math.PI / 180),
  radiansToDegrees: (radians: number): number => radians * (180 / Math.PI),
} as const;

// Helpers para trabajar con arrays de datos ganaderos
export const arrayHelpers = {
  // Agrupar por campo
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Obtener valores únicos
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  // Ordenar por campo
  sortBy: <T, K extends keyof T>(
    array: T[],
    key: K,
    order: "asc" | "desc" = "asc"
  ): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  },

  // Paginar array
  paginate: <T>(
    array: T[],
    page: number,
    pageSize: number
  ): { data: T[]; total: number; pages: number } => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      data: array.slice(startIndex, endIndex),
      total: array.length,
      pages: Math.ceil(array.length / pageSize),
    };
  },

  // Buscar en array por múltiples campos
  search: <T>(array: T[], query: string, fields: (keyof T)[]): T[] => {
    const lowerQuery = query.toLowerCase();

    return array.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(lowerQuery);
      })
    );
  },
} as const;

// Helpers para trabajar con coordenadas y mapas
export const mapHelpers = {
  // Verificar si las coordenadas son válidas
  isValidCoordinate: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  // Obtener bounds para un conjunto de coordenadas
  getBounds: (coordinates: { latitude: number; longitude: number }[]) => {
    if (coordinates.length === 0) return null;

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach((coord) => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
      center: {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
      },
    };
  },

  // Generar color aleatorio para marcadores
  getRandomMarkerColor: (): string => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
} as const;

// Funciones para debugging y desarrollo
export const devHelpers = {
  // Generar datos de prueba
  generateMockCoordinates: (
    centerLat: number,
    centerLng: number,
    count: number,
    radiusKm: number = 5
  ) => {
    const coordinates = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm * 1000; // en metros

      const lat = centerLat + (distance * Math.cos(angle)) / 111000;
      const lng =
        centerLng +
        (distance * Math.sin(angle)) /
          (111000 * Math.cos((centerLat * Math.PI) / 180));

      coordinates.push({ latitude: lat, longitude: lng });
    }

    return coordinates;
  },

  // Log con timestamp
  logWithTime: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || "");
  },

  // Medir tiempo de ejecución
  measureTime: <T>(fn: () => T, label: string = "Operation"): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
    return result;
  },
} as const;
