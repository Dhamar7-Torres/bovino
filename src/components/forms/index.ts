// ============================================================================
// EXPORTACIONES DE COMPONENTES DE FORMULARIOS
// ============================================================================
// Este archivo centraliza todas las exportaciones de componentes de formularios
// específicos para la aplicación de gestión de ganado con geolocalización.

// Componentes principales de formularios
export { default as DatePicker } from "./DatePicker";
export { default as FilterPanel } from "./FilterPanel";
export { default as FormField } from "./FormField";
export { default as SearchBar } from "./SearchBar";

// ============================================================================
// EXPORTACIONES DE TIPOS E INTERFACES
// ============================================================================

// Tipos para DatePicker
export interface HighlightDate {
  date: Date;
  type: "vaccination" | "illness" | "birth" | "event" | "warning" | "success";
  label?: string;
  description?: string;
}

export type DatePickerFormat = "date" | "datetime" | "time";

// Tipos para FormField
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "search"
  | "textarea"
  | "select"
  | "multiselect"
  | "ear-tag" // Específico para arete de bovino
  | "weight" // Específico para peso
  | "age" // Específico para edad
  | "breed" // Específico para raza
  | "veterinarian" // Específico para veterinario
  | "vaccine" // Específico para vacuna
  | "disease"; // Específico para enfermedad

export type ValidationState = "idle" | "validating" | "valid" | "invalid";

export interface ValidationRule {
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "custom"
    | "earTag"
    | "weight"
    | "age";
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

// Tipos para FilterPanel
export type CattleType = "CATTLE" | "BULL" | "COW" | "CALF";
export type Gender = "MALE" | "FEMALE";
export type HealthStatus =
  | "HEALTHY"
  | "SICK"
  | "RECOVERING"
  | "QUARANTINE"
  | "DECEASED";
export type VaccinationStatus = "UP_TO_DATE" | "PENDING" | "OVERDUE" | "NONE";

export interface FilterOptions {
  searchTerm: string;
  type: CattleType[];
  breed: string[];
  gender: Gender[];
  healthStatus: HealthStatus[];
  ageRange: {
    min: number | null;
    max: number | null;
  };
  weightRange: {
    min: number | null;
    max: number | null;
  };
  vaccinationStatus: VaccinationStatus[];
  locationRadius: number | null;
  centerLocation: Location | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Tipos para SearchBar
export type SearchType =
  | "all"
  | "ear-tag"
  | "name"
  | "breed"
  | "location"
  | "vaccination"
  | "health";

export interface SearchResult {
  id: string;
  type: "bovine" | "vaccination" | "illness" | "location" | "veterinarian";
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  icon?: React.ReactNode;
  url?: string;
  metadata?: Record<string, any>;
  relevance?: number;
  highlighted?: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: SearchType;
  count?: number;
  recent?: boolean;
  popular?: boolean;
}

export interface SearchFilter {
  id: string;
  label: string;
  type: SearchType;
  icon: React.ReactNode;
  active: boolean;
  count?: number;
}

// ============================================================================
// UTILIDADES Y HELPERS ESPECÍFICOS PARA GANADERÍA
// ============================================================================

// Validadores específicos para campos de ganado
export const cattleValidators = {
  /**
   * Valida formato de arete bovino
   * Formato estándar: 2-4 letras seguidas de 3-6 números
   */
  earTag: (value: string): boolean => {
    const earTagPattern = /^[A-Z]{2,4}[0-9]{3,6}$/i;
    return earTagPattern.test(value);
  },

  /**
   * Valida peso razonable para bovinos (0-2000 kg)
   */
  weight: (value: string): boolean => {
    const weight = parseFloat(value);
    return weight > 0 && weight <= 2000;
  },

  /**
   * Valida edad razonable para bovinos (0-30 años)
   */
  age: (value: string): boolean => {
    const age = parseInt(value);
    return age >= 0 && age <= 30;
  },

  /**
   * Valida email de veterinario
   */
  veterinarianEmail: (value: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  },

  /**
   * Valida código de vacuna
   */
  vaccineCode: (value: string): boolean => {
    // Formato típico: 3 letras seguidas de números
    const vaccinePattern = /^[A-Z]{3}[0-9]+$/i;
    return vaccinePattern.test(value);
  },
};

// Sugerencias por tipo de campo ganadero
export const cattleSuggestions = {
  breed: [
    "Holstein",
    "Jersey",
    "Angus",
    "Hereford",
    "Simmental",
    "Charolais",
    "Brahman",
    "Limousin",
    "Gelbvieh",
    "Red Angus",
    "Brown Swiss",
    "Shorthorn",
    "Devon",
    "Galloway",
    "Highland",
    "Dexter",
    "Belted Galloway",
  ],
  vaccine: [
    "Brucelosis",
    "Fiebre Aftosa",
    "Carbunco",
    "Clostridiosis",
    "Leptospirosis",
    "Rinotraqueítis",
    "Diarrea Viral Bovina",
    "Parainfluenza",
    "Rabia",
    "Pasteurelosis",
    "Haemophilus",
    "Rotavirus",
    "Coronavirus",
  ],
  disease: [
    "Mastitis",
    "Neumonía",
    "Diarrea",
    "Cojera",
    "Infección Uterina",
    "Problemas Digestivos",
    "Infección Respiratoria",
    "Lesiones",
    "Acidosis",
    "Timpanismo",
    "Retención Placentaria",
    "Hipocalcemia",
  ],
  veterinarian: [
    "Dr. García López",
    "Dra. Martínez Silva",
    "Dr. Rodríguez Pérez",
    "Dra. Hernández Torres",
    "Dr. González Morales",
    "Dra. López Jiménez",
    "Dr. Sánchez Ruiz",
    "Dra. Fernández Castro",
  ],
  location: [
    "Establo Principal",
    "Corral Norte",
    "Corral Sur",
    "Pastizal A",
    "Pastizal B",
    "Clínica Veterinaria",
    "Área de Cuarentena",
    "Ordeño",
  ],
};

// Helper para crear reglas de validación específicas para ganado
export const createCattleValidationRules = (
  fieldType: FieldType
): ValidationRule[] => {
  const baseRules: ValidationRule[] = [
    {
      type: "required",
      message: "Este campo es obligatorio",
    },
  ];

  switch (fieldType) {
    case "ear-tag":
      return [
        ...baseRules,
        {
          type: "earTag",
          message: "Formato de arete inválido (ej: ABC123, FARM001)",
          validator: cattleValidators.earTag,
        },
        {
          type: "minLength",
          value: 5,
          message: "El arete debe tener al menos 5 caracteres",
        },
        {
          type: "maxLength",
          value: 10,
          message: "El arete no puede tener más de 10 caracteres",
        },
      ];

    case "weight":
      return [
        ...baseRules,
        {
          type: "weight",
          message: "El peso debe estar entre 1 y 2000 kg",
          validator: cattleValidators.weight,
        },
      ];

    case "age":
      return [
        ...baseRules,
        {
          type: "age",
          message: "La edad debe estar entre 0 y 30 años",
          validator: cattleValidators.age,
        },
      ];

    case "email":
      return [
        ...baseRules,
        {
          type: "pattern",
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Formato de email inválido",
        },
      ];

    case "breed":
      return [
        {
          type: "required",
          message: "La raza es obligatoria",
        },
        {
          type: "minLength",
          value: 2,
          message: "La raza debe tener al menos 2 caracteres",
        },
      ];

    default:
      return baseRules;
  }
};

// Helper para crear opciones de filtro específicas para ganado
export const createCattleFilterOptions = (): FilterOptions => ({
  searchTerm: "",
  type: [],
  breed: [],
  gender: [],
  healthStatus: [],
  ageRange: { min: null, max: null },
  weightRange: { min: null, max: null },
  vaccinationStatus: [],
  locationRadius: null,
  centerLocation: null,
  dateRange: { from: null, to: null },
});

// Helper para formatear fechas para el DatePicker
export const formatDateForPicker = (
  date: Date | null,
  includeTime = false
): string => {
  if (!date) return "";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return date.toLocaleDateString("es-ES", options);
};

// Helper para generar fechas destacadas para vacunaciones
export const generateVaccinationHighlights = (
  vaccinations: Array<{ date: Date; type: string; status: string }>
): HighlightDate[] => {
  return vaccinations.map((vaccination) => ({
    date: vaccination.date,
    type: vaccination.status === "completed" ? "vaccination" : "warning",
    label: vaccination.type,
    description: `${vaccination.type} - ${
      vaccination.status === "completed" ? "Completada" : "Pendiente"
    }`,
  }));
};

// Helper para formatear resultados de búsqueda de bovinos
export const formatBovineSearchResult = (bovine: {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  healthStatus: string;
  location?: { address?: string };
}): SearchResult => ({
  id: bovine.id,
  type: "bovine",
  title: `${bovine.earTag}${bovine.name ? ` - ${bovine.name}` : ""}`,
  subtitle: bovine.breed,
  description: bovine.location?.address,
  tags: [bovine.healthStatus],
  metadata: { bovine },
});

// ============================================================================
// CONSTANTES ÚTILES
// ============================================================================

// Tamaños estándar para componentes de formulario
export const FORM_SIZES = {
  small: "small",
  medium: "medium",
  large: "large",
} as const;

// Variantes de estilo para formularios
export const FORM_VARIANTS = {
  default: "default",
  filled: "filled",
  bordered: "bordered",
} as const;

// Tipos de ganado disponibles
export const CATTLE_TYPES = {
  CATTLE: "CATTLE",
  BULL: "BULL",
  COW: "COW",
  CALF: "CALF",
} as const;

// Estados de salud disponibles
export const HEALTH_STATUSES = {
  HEALTHY: "HEALTHY",
  SICK: "SICK",
  RECOVERING: "RECOVERING",
  QUARANTINE: "QUARANTINE",
  DECEASED: "DECEASED",
} as const;

// Estados de vacunación disponibles
export const VACCINATION_STATUSES = {
  UP_TO_DATE: "UP_TO_DATE",
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  NONE: "NONE",
} as const;

// Etiquetas en español para los estados
export const CATTLE_TYPE_LABELS = {
  [CATTLE_TYPES.CATTLE]: "Ganado General",
  [CATTLE_TYPES.BULL]: "Toro",
  [CATTLE_TYPES.COW]: "Vaca",
  [CATTLE_TYPES.CALF]: "Ternero",
} as const;

export const HEALTH_STATUS_LABELS = {
  [HEALTH_STATUSES.HEALTHY]: "Saludable",
  [HEALTH_STATUSES.SICK]: "Enfermo",
  [HEALTH_STATUSES.RECOVERING]: "Recuperándose",
  [HEALTH_STATUSES.QUARANTINE]: "Cuarentena",
  [HEALTH_STATUSES.DECEASED]: "Fallecido",
} as const;

export const VACCINATION_STATUS_LABELS = {
  [VACCINATION_STATUSES.UP_TO_DATE]: "Al día",
  [VACCINATION_STATUSES.PENDING]: "Pendiente",
  [VACCINATION_STATUSES.OVERDUE]: "Vencida",
  [VACCINATION_STATUSES.NONE]: "Sin vacunas",
} as const;

// ============================================================================
// FUNCIONES DE UTILIDAD AVANZADAS
// ============================================================================

/**
 * Valida un conjunto completo de filtros de ganado
 */
export const validateFilterOptions = (filters: FilterOptions): boolean => {
  // Validar rangos de edad
  if (filters.ageRange.min !== null && filters.ageRange.max !== null) {
    if (filters.ageRange.min > filters.ageRange.max) return false;
  }

  // Validar rangos de peso
  if (filters.weightRange.min !== null && filters.weightRange.max !== null) {
    if (filters.weightRange.min > filters.weightRange.max) return false;
  }

  // Validar rango de fechas
  if (filters.dateRange.from && filters.dateRange.to) {
    if (filters.dateRange.from > filters.dateRange.to) return false;
  }

  // Validar radio de ubicación
  if (filters.locationRadius !== null) {
    if (filters.locationRadius <= 0 || filters.locationRadius > 1000)
      return false;
  }

  return true;
};

/**
 * Cuenta los filtros activos en un objeto FilterOptions
 */
export const countActiveFilters = (filters: FilterOptions): number => {
  let count = 0;

  if (filters.searchTerm.trim()) count++;
  if (filters.type.length > 0) count++;
  if (filters.breed.length > 0) count++;
  if (filters.gender.length > 0) count++;
  if (filters.healthStatus.length > 0) count++;
  if (filters.vaccinationStatus.length > 0) count++;
  if (filters.ageRange.min !== null || filters.ageRange.max !== null) count++;
  if (filters.weightRange.min !== null || filters.weightRange.max !== null)
    count++;
  if (filters.locationRadius !== null) count++;
  if (filters.dateRange.from || filters.dateRange.to) count++;

  return count;
};

/**
 * Limpia todos los filtros a sus valores por defecto
 */
export const resetFilterOptions = (): FilterOptions =>
  createCattleFilterOptions();

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/*
// Ejemplo de uso de DatePicker para registrar vacunación
<DatePicker
  value={vaccinationDate}
  onChange={setVaccinationDate}
  vaccinationContext={true}
  highlightDates={vaccinationHighlights}
  minDate={new Date()}
  label="Fecha de Vacunación"
  required
/>

// Ejemplo de uso de FormField para arete
<FormField
  type="ear-tag"
  name="earTag"
  label="Número de Arete"
  value={earTag}
  onChange={(value) => setEarTag(value)}
  cattleContext={true}
  enableSuggestions={true}
  validationRules={createCattleValidationRules("ear-tag")}
  required
/>

// Ejemplo de uso de SearchBar para buscar bovinos
<SearchBar
  placeholder="Buscar por arete, raza, ubicación..."
  cattleContext={true}
  showFilters={true}
  onSearch={handleSearch}
  onResultSelect={handleResultSelect}
  results={searchResults}
  suggestions={searchSuggestions}
/>

// Ejemplo de uso de FilterPanel
<FilterPanel
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  filters={currentFilters}
  onFiltersChange={setCurrentFilters}
  onApplyFilters={handleApplyFilters}
  onResetFilters={handleResetFilters}
  cattleCount={totalCattle}
  filteredCount={filteredCattle}
/>
*/
