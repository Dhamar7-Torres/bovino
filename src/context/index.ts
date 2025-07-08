// Exportaciones centralizadas de contextos para la aplicación de gestión ganadera

// Contexto principal de bovinos
export {
  BovinesProvider,
  useBovines,
  default as BovinesContext,
} from "./BovinesContext";

// Definición de tipos principales (duplicados aquí para evitar errores de importación circular)
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type BovineType = "CATTLE" | "BULL" | "COW" | "CALF";
export type BovineGender = "MALE" | "FEMALE";
export type HealthStatus =
  | "HEALTHY"
  | "SICK"
  | "RECOVERING"
  | "QUARANTINE"
  | "DECEASED";
export type IllnessSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Vaccination {
  id: string;
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  batchNumber: string;
  manufacturer: string;
  location: Location;
  notes?: string;
  sideEffects?: string[];
  createdAt: Date;
}

export interface Illness {
  id: string;
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  treatment?: string;
  veterinarianName: string;
  recoveryDate?: Date;
  location: Location;
  notes?: string;
  isContagious: boolean;
  createdAt: Date;
}

export interface Bovine {
  id: string;
  earTag: string;
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: HealthStatus;
  vaccinations: Vaccination[];
  illnesses: Illness[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para estados del contexto
export interface BovineFilters {
  searchTerm: string;
  type: string;
  breed: string;
  gender: string;
  healthStatus: string;
  locationRadius?: number;
  centerLocation?: Location;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MapState {
  selectedLocations: Location[];
  showVaccinations: boolean;
  showIllnesses: boolean;
  zoomLevel: number;
  centerPoint: Location;
}

// Tipos adicionales para el contexto
export interface BovineContextState {
  bovines: Bovine[];
  selectedBovine: Bovine | null;
  loading: boolean;
  error: string | null;
}

// Interfaces para formularios y componentes
export interface BovineFormData {
  earTag: string;
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: HealthStatus;
}

export interface VaccinationFormData {
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  batchNumber: string;
  manufacturer: string;
  location: Location;
  notes?: string;
}

export interface IllnessFormData {
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  treatment?: string;
  veterinarianName: string;
  location: Location;
  notes?: string;
  isContagious: boolean;
}

// Interfaces para filtros avanzados
export interface LocationFilter {
  centerLocation: Location;
  radiusKm: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface HealthFilter {
  healthStatus: HealthStatus[];
  hasVaccinations: boolean;
  hasIllnesses: boolean;
  lastVaccinationDays?: number;
  lastIllnessDays?: number;
}

// Constantes para uso en la aplicación
export const BOVINE_TYPES = {
  CATTLE: "CATTLE",
  BULL: "BULL",
  COW: "COW",
  CALF: "CALF",
} as const;

export const BOVINE_GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const HEALTH_STATUSES = {
  HEALTHY: "HEALTHY",
  SICK: "SICK",
  RECOVERING: "RECOVERING",
  QUARANTINE: "QUARANTINE",
  DECEASED: "DECEASED",
} as const;

export const ILLNESS_SEVERITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

// Funciones utilitarias exportadas
export const createEmptyBovine = (): Partial<BovineFormData> => ({
  earTag: "",
  name: "",
  type: "CATTLE" as BovineType,
  breed: "",
  gender: "FEMALE" as BovineGender,
  birthDate: new Date(),
  weight: 0,
  location: {
    latitude: 20.5888, // Coordenadas por defecto de Querétaro
    longitude: -100.3899,
  },
  healthStatus: "HEALTHY" as HealthStatus,
});

export const createEmptyVaccination = (): Partial<VaccinationFormData> => ({
  bovineId: "",
  vaccineType: "",
  vaccineName: "",
  dose: "",
  applicationDate: new Date(),
  veterinarianName: "",
  batchNumber: "",
  manufacturer: "",
  location: {
    latitude: 20.5888,
    longitude: -100.3899,
  },
});

export const createEmptyIllness = (): Partial<IllnessFormData> => ({
  bovineId: "",
  diseaseName: "",
  diagnosisDate: new Date(),
  symptoms: [],
  severity: "LOW" as IllnessSeverity,
  veterinarianName: "",
  location: {
    latitude: 20.5888,
    longitude: -100.3899,
  },
  isContagious: false,
});

// Validadores para formularios
export const validateEarTag = (earTag: string): boolean => {
  // Valida formato de arete mexicano (ej: MX001, QRO123)
  const earTagRegex = /^[A-Z]{2,3}\d{3,6}$/;
  return earTagRegex.test(earTag.toUpperCase());
};

export const validateWeight = (weight: number): boolean => {
  // Peso válido entre 20kg (ternero) y 1200kg (toro adulto)
  return weight >= 20 && weight <= 1200;
};

export const validateLocation = (location: Location): boolean => {
  // Valida coordenadas dentro de rangos razonables para México
  const { latitude, longitude } = location;
  return (
    latitude >= 14.5 &&
    latitude <= 32.7 && // Latitudes de México
    longitude >= -118.4 &&
    longitude <= -86.7 // Longitudes de México
  );
};

// Funciones de cálculo y utilidades
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInMilliseconds = today.getTime() - birth.getTime();
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(ageInYears);
};

export const calculateAgeInMonths = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInMilliseconds = today.getTime() - birth.getTime();
  const ageInMonths = ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44); // Promedio de días por mes
  return Math.floor(ageInMonths);
};

export const formatEarTag = (earTag: string): string => {
  // Formatea el arete a mayúsculas y elimina espacios
  return earTag.toUpperCase().replace(/\s+/g, "");
};

export const getAgeCategory = (birthDate: Date): string => {
  const ageInMonths = calculateAgeInMonths(birthDate);

  if (ageInMonths < 6) return "Ternero/a";
  if (ageInMonths < 12) return "Becerro/a";
  if (ageInMonths < 24) return "Novillo/a";
  return "Adulto/a";
};

// Funciones de distancia y geolocalización
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

// Funciones para manejo de estados de salud
export const getHealthStatusColor = (status: HealthStatus): string => {
  const colors = {
    HEALTHY: "green",
    SICK: "red",
    RECOVERING: "yellow",
    QUARANTINE: "orange",
    DECEASED: "gray",
  };
  return colors[status] || "gray";
};

export const getHealthStatusLabel = (status: HealthStatus): string => {
  const labels = {
    HEALTHY: "Saludable",
    SICK: "Enfermo",
    RECOVERING: "Recuperándose",
    QUARANTINE: "Cuarentena",
    DECEASED: "Fallecido",
  };
  return labels[status] || "Desconocido";
};

export const getSeverityColor = (severity: IllnessSeverity): string => {
  const colors = {
    LOW: "green",
    MEDIUM: "yellow",
    HIGH: "orange",
    CRITICAL: "red",
  };
  return colors[severity] || "gray";
};

export const getSeverityLabel = (severity: IllnessSeverity): string => {
  const labels = {
    LOW: "Leve",
    MEDIUM: "Moderado",
    HIGH: "Alto",
    CRITICAL: "Crítico",
  };
  return labels[severity] || "Desconocido";
};

// Funciones para exportación de datos
export const exportBovineToCSV = (bovines: Bovine[]): string => {
  const headers = [
    "ID",
    "Arete",
    "Nombre",
    "Tipo",
    "Raza",
    "Género",
    "Fecha Nacimiento",
    "Peso",
    "Estado Salud",
    "Latitud",
    "Longitud",
    "Dirección",
  ];

  const rows = bovines.map((bovine) => [
    bovine.id,
    bovine.earTag,
    bovine.name || "",
    bovine.type,
    bovine.breed,
    bovine.gender,
    bovine.birthDate.toISOString().split("T")[0],
    bovine.weight.toString(),
    bovine.healthStatus,
    bovine.location.latitude.toString(),
    bovine.location.longitude.toString(),
    bovine.location.address || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};

// Funciones utilitarias para estadísticas (sin hooks para evitar dependencias circulares)
export const calculateBovineStats = (bovines: Bovine[]) => {
  const stats = {
    total: bovines.length,
    healthy: bovines.filter((b: Bovine) => b.healthStatus === "HEALTHY").length,
    sick: bovines.filter((b: Bovine) => b.healthStatus === "SICK").length,
    recovering: bovines.filter((b: Bovine) => b.healthStatus === "RECOVERING")
      .length,
    quarantine: bovines.filter((b: Bovine) => b.healthStatus === "QUARANTINE")
      .length,
    totalVaccinations: bovines.reduce(
      (acc: number, b: Bovine) => acc + b.vaccinations.length,
      0
    ),
    totalIllnesses: bovines.reduce(
      (acc: number, b: Bovine) => acc + b.illnesses.length,
      0
    ),
    avgWeight:
      bovines.length > 0
        ? bovines.reduce((acc: number, b: Bovine) => acc + b.weight, 0) /
          bovines.length
        : 0,
  };

  return stats;
};

// Función para verificar errores
export const checkContextError = (error: string | null, loading: boolean) => {
  return {
    hasError: !!error,
    error: error,
    isLoading: loading,
  };
};
