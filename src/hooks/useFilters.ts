import { useState, useCallback, useMemo } from "react";

// Tipos para el estado de filtros
export interface FilterState {
  searchTerm: string;
  type: string;
  breed: string;
  gender: string;
  healthStatus: string;
  ageRange: {
    min: number;
    max: number;
  };
  weightRange: {
    min: number;
    max: number;
  };
  vaccinationStatus: string;
  lastVaccinationDays: number | null;
  hasIllnesses: boolean | null;
  location: {
    enabled: boolean;
    latitude: number | null;
    longitude: number | null;
    radius: number;
  };
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    field: "birthDate" | "createdAt" | "lastVaccination" | "lastIllness";
  };
}

// Tipos para acciones de filtros
export interface FilterActions {
  setSearchTerm: (term: string) => void;
  setType: (type: string) => void;
  setBreed: (breed: string) => void;
  setGender: (gender: string) => void;
  setHealthStatus: (status: string) => void;
  setAgeRange: (min: number, max: number) => void;
  setWeightRange: (min: number, max: number) => void;
  setVaccinationStatus: (status: string) => void;
  setLastVaccinationDays: (days: number | null) => void;
  setHasIllnesses: (hasIllnesses: boolean | null) => void;
  setLocationFilter: (lat: number, lng: number, radius: number) => void;
  setDateRange: (
    startDate: Date | null,
    endDate: Date | null,
    field: FilterState["dateRange"]["field"]
  ) => void;
  resetFilters: () => void;
  resetLocationFilter: () => void;
  applyPreset: (preset: FilterPreset) => void;
}

// Opciones disponibles para filtros
export interface FilterOptions {
  types: Array<{ value: string; label: string }>;
  breeds: Array<{ value: string; label: string }>;
  genders: Array<{ value: string; label: string }>;
  healthStatuses: Array<{ value: string; label: string; color: string }>;
  vaccinationStatuses: Array<{ value: string; label: string }>;
}

// Filtros para búsquedas
export interface SearchFilters {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Presets de filtros predefinidos
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterState>;
}

// Estado inicial de filtros
const initialFilterState: FilterState = {
  searchTerm: "",
  type: "",
  breed: "",
  gender: "",
  healthStatus: "",
  ageRange: {
    min: 0,
    max: 15, // años
  },
  weightRange: {
    min: 0,
    max: 1500, // kg
  },
  vaccinationStatus: "",
  lastVaccinationDays: null,
  hasIllnesses: null,
  location: {
    enabled: false,
    latitude: null,
    longitude: null,
    radius: 5, // km
  },
  dateRange: {
    startDate: null,
    endDate: null,
    field: "birthDate",
  },
};

// Presets predefinidos para filtros comunes
const filterPresets: FilterPreset[] = [
  {
    id: "healthy-adults",
    name: "Adultos Saludables",
    description: "Bovinos adultos en estado saludable",
    filters: {
      healthStatus: "HEALTHY",
      ageRange: { min: 2, max: 15 },
    },
  },
  {
    id: "need-vaccination",
    name: "Requieren Vacunación",
    description: "Bovinos que necesitan vacunación próximamente",
    filters: {
      lastVaccinationDays: 90,
      healthStatus: "HEALTHY",
    },
  },
  {
    id: "sick-or-recovering",
    name: "Enfermos o en Recuperación",
    description: "Bovinos que requieren atención médica",
    filters: {
      healthStatus: "SICK",
    },
  },
  {
    id: "young-calves",
    name: "Terneros Jóvenes",
    description: "Terneros menores a 6 meses",
    filters: {
      type: "CALF",
      ageRange: { min: 0, max: 0.5 },
    },
  },
  {
    id: "quarantine",
    name: "En Cuarentena",
    description: "Bovinos en cuarentena",
    filters: {
      healthStatus: "QUARANTINE",
    },
  },
  {
    id: "breeding-females",
    name: "Hembras Reproductoras",
    description: "Vacas en edad reproductiva",
    filters: {
      gender: "FEMALE",
      type: "COW",
      ageRange: { min: 2, max: 12 },
      healthStatus: "HEALTHY",
    },
  },
];

// Opciones de filtro
const filterOptions: FilterOptions = {
  types: [
    { value: "CATTLE", label: "Ganado" },
    { value: "BULL", label: "Toro" },
    { value: "COW", label: "Vaca" },
    { value: "CALF", label: "Ternero" },
  ],
  breeds: [
    { value: "Holstein", label: "Holstein" },
    { value: "Angus", label: "Angus" },
    { value: "Hereford", label: "Hereford" },
    { value: "Charolais", label: "Charolais" },
    { value: "Brahman", label: "Brahman" },
    { value: "Simmental", label: "Simmental" },
    { value: "Limousin", label: "Limousin" },
    { value: "Gelbvieh", label: "Gelbvieh" },
    { value: "Beefmaster", label: "Beefmaster" },
    { value: "Santa Gertrudis", label: "Santa Gertrudis" },
  ],
  genders: [
    { value: "MALE", label: "Macho" },
    { value: "FEMALE", label: "Hembra" },
  ],
  healthStatuses: [
    { value: "HEALTHY", label: "Saludable", color: "green" },
    { value: "SICK", label: "Enfermo", color: "red" },
    { value: "RECOVERING", label: "Recuperándose", color: "yellow" },
    { value: "QUARANTINE", label: "Cuarentena", color: "orange" },
    { value: "DECEASED", label: "Fallecido", color: "gray" },
  ],
  vaccinationStatuses: [
    { value: "up-to-date", label: "Al día" },
    { value: "due-soon", label: "Próximo a vencer" },
    { value: "overdue", label: "Vencido" },
    { value: "never-vaccinated", label: "Nunca vacunado" },
  ],
};

// Hook principal para manejo de filtros
export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Función para actualizar término de búsqueda
  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
    setActivePreset(null);
  }, []);

  // Función para actualizar tipo
  const setType = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, type }));
    setActivePreset(null);
  }, []);

  // Función para actualizar raza
  const setBreed = useCallback((breed: string) => {
    setFilters((prev) => ({ ...prev, breed }));
    setActivePreset(null);
  }, []);

  // Función para actualizar género
  const setGender = useCallback((gender: string) => {
    setFilters((prev) => ({ ...prev, gender }));
    setActivePreset(null);
  }, []);

  // Función para actualizar estado de salud
  const setHealthStatus = useCallback((healthStatus: string) => {
    setFilters((prev) => ({ ...prev, healthStatus }));
    setActivePreset(null);
  }, []);

  // Función para actualizar rango de edad
  const setAgeRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      ageRange: { min, max },
    }));
    setActivePreset(null);
  }, []);

  // Función para actualizar rango de peso
  const setWeightRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      weightRange: { min, max },
    }));
    setActivePreset(null);
  }, []);

  // Función para actualizar estado de vacunación
  const setVaccinationStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, vaccinationStatus: status }));
    setActivePreset(null);
  }, []);

  // Función para actualizar días desde última vacunación
  const setLastVaccinationDays = useCallback((days: number | null) => {
    setFilters((prev) => ({ ...prev, lastVaccinationDays: days }));
    setActivePreset(null);
  }, []);

  // Función para actualizar filtro de enfermedades
  const setHasIllnesses = useCallback((hasIllnesses: boolean | null) => {
    setFilters((prev) => ({ ...prev, hasIllnesses }));
    setActivePreset(null);
  }, []);

  // Función para actualizar filtro de ubicación
  const setLocationFilter = useCallback(
    (lat: number, lng: number, radius: number) => {
      setFilters((prev) => ({
        ...prev,
        location: {
          enabled: true,
          latitude: lat,
          longitude: lng,
          radius,
        },
      }));
      setActivePreset(null);
    },
    []
  );

  // Función para actualizar rango de fechas
  const setDateRange = useCallback(
    (
      startDate: Date | null,
      endDate: Date | null,
      field: FilterState["dateRange"]["field"]
    ) => {
      setFilters((prev) => ({
        ...prev,
        dateRange: { startDate, endDate, field },
      }));
      setActivePreset(null);
    },
    []
  );

  // Función para resetear todos los filtros
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
    setActivePreset(null);
  }, []);

  // Función para resetear solo el filtro de ubicación
  const resetLocationFilter = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      location: {
        enabled: false,
        latitude: null,
        longitude: null,
        radius: 5,
      },
    }));
    setActivePreset(null);
  }, []);

  // Función para aplicar un preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters((prev) => ({
      ...prev,
      ...preset.filters,
    }));
    setActivePreset(preset.id);
  }, []);

  // Función para obtener filtros activos (no vacíos)
  const getActiveFilters = useCallback(() => {
    const active: Record<string, any> = {};

    if (filters.searchTerm) active.searchTerm = filters.searchTerm;
    if (filters.type) active.type = filters.type;
    if (filters.breed) active.breed = filters.breed;
    if (filters.gender) active.gender = filters.gender;
    if (filters.healthStatus) active.healthStatus = filters.healthStatus;
    if (filters.vaccinationStatus)
      active.vaccinationStatus = filters.vaccinationStatus;
    if (filters.lastVaccinationDays)
      active.lastVaccinationDays = filters.lastVaccinationDays;
    if (filters.hasIllnesses !== null)
      active.hasIllnesses = filters.hasIllnesses;
    if (filters.location.enabled) active.location = filters.location;
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      active.dateRange = filters.dateRange;
    }

    // Rangos solo si no son los valores por defecto
    if (filters.ageRange.min !== 0 || filters.ageRange.max !== 15) {
      active.ageRange = filters.ageRange;
    }
    if (filters.weightRange.min !== 0 || filters.weightRange.max !== 1500) {
      active.weightRange = filters.weightRange;
    }

    return active;
  }, [filters]);

  // Función para contar filtros activos
  const activeFilterCount = useMemo(() => {
    return Object.keys(getActiveFilters()).length;
  }, [getActiveFilters]);

  // Función para verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  // Función para aplicar filtros a una lista de bovinos
  const applyFilters = useCallback(
    (bovines: any[]) => {
      let filtered = [...bovines];

      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (bovine) =>
            bovine.earTag.toLowerCase().includes(term) ||
            (bovine.name && bovine.name.toLowerCase().includes(term)) ||
            bovine.breed.toLowerCase().includes(term)
        );
      }

      // Filtro por tipo
      if (filters.type) {
        filtered = filtered.filter((bovine) => bovine.type === filters.type);
      }

      // Filtro por raza
      if (filters.breed) {
        filtered = filtered.filter((bovine) => bovine.breed === filters.breed);
      }

      // Filtro por género
      if (filters.gender) {
        filtered = filtered.filter(
          (bovine) => bovine.gender === filters.gender
        );
      }

      // Filtro por estado de salud
      if (filters.healthStatus) {
        filtered = filtered.filter(
          (bovine) => bovine.healthStatus === filters.healthStatus
        );
      }

      // Filtro por rango de edad
      if (filters.ageRange.min > 0 || filters.ageRange.max < 15) {
        filtered = filtered.filter((bovine) => {
          const age = calculateAgeInYears(new Date(bovine.birthDate));
          return age >= filters.ageRange.min && age <= filters.ageRange.max;
        });
      }

      // Filtro por rango de peso
      if (filters.weightRange.min > 0 || filters.weightRange.max < 1500) {
        filtered = filtered.filter(
          (bovine) =>
            bovine.weight >= filters.weightRange.min &&
            bovine.weight <= filters.weightRange.max
        );
      }

      // Filtro por estado de vacunación
      if (filters.vaccinationStatus) {
        filtered = filtered.filter((bovine) => {
          const now = new Date();
          const vaccinations = bovine.vaccinations || [];

          switch (filters.vaccinationStatus) {
            case "up-to-date":
              return vaccinations.some((v: any) => {
                const nextDue = new Date(v.nextDueDate);
                return nextDue > now;
              });
            case "due-soon":
              return vaccinations.some((v: any) => {
                const nextDue = new Date(v.nextDueDate);
                const daysUntilDue = Math.ceil(
                  (nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysUntilDue <= 30 && daysUntilDue > 0;
              });
            case "overdue":
              return vaccinations.some((v: any) => {
                const nextDue = new Date(v.nextDueDate);
                return nextDue < now;
              });
            case "never-vaccinated":
              return vaccinations.length === 0;
            default:
              return true;
          }
        });
      }

      // Filtro por días desde última vacunación
      if (filters.lastVaccinationDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.lastVaccinationDays);

        filtered = filtered.filter((bovine) => {
          const vaccinations = bovine.vaccinations || [];
          if (vaccinations.length === 0) return true;

          const lastVaccination = vaccinations.reduce(
            (latest: any, current: any) => {
              return new Date(current.applicationDate) >
                new Date(latest.applicationDate)
                ? current
                : latest;
            }
          );

          return new Date(lastVaccination.applicationDate) < cutoffDate;
        });
      }

      // Filtro por presencia de enfermedades
      if (filters.hasIllnesses !== null) {
        filtered = filtered.filter((bovine) => {
          const hasIllnesses = bovine.illnesses && bovine.illnesses.length > 0;
          return filters.hasIllnesses ? hasIllnesses : !hasIllnesses;
        });
      }

      // Filtro por ubicación
      if (
        filters.location.enabled &&
        filters.location.latitude &&
        filters.location.longitude
      ) {
        filtered = filtered.filter((bovine) => {
          const distance = calculateDistance(
            filters.location.latitude!,
            filters.location.longitude!,
            bovine.location.latitude,
            bovine.location.longitude
          );
          return distance <= filters.location.radius;
        });
      }

      // Filtro por rango de fechas
      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        filtered = filtered.filter((bovine) => {
          let dateToCheck: Date;

          switch (filters.dateRange.field) {
            case "birthDate":
              dateToCheck = new Date(bovine.birthDate);
              break;
            case "createdAt":
              dateToCheck = new Date(bovine.createdAt);
              break;
            case "lastVaccination":
              const vaccinations = bovine.vaccinations || [];
              if (vaccinations.length === 0) return false;
              const lastVacc = vaccinations.reduce(
                (latest: any, current: any) => {
                  return new Date(current.applicationDate) >
                    new Date(latest.applicationDate)
                    ? current
                    : latest;
                }
              );
              dateToCheck = new Date(lastVacc.applicationDate);
              break;
            case "lastIllness":
              const illnesses = bovine.illnesses || [];
              if (illnesses.length === 0) return false;
              const lastIll = illnesses.reduce((latest: any, current: any) => {
                return new Date(current.diagnosisDate) >
                  new Date(latest.diagnosisDate)
                  ? current
                  : latest;
              });
              dateToCheck = new Date(lastIll.diagnosisDate);
              break;
            default:
              return true;
          }

          const start = filters.dateRange.startDate;
          const end = filters.dateRange.endDate;

          if (start && end) {
            return dateToCheck >= start && dateToCheck <= end;
          } else if (start) {
            return dateToCheck >= start;
          } else if (end) {
            return dateToCheck <= end;
          }

          return true;
        });
      }

      return filtered;
    },
    [filters]
  );

  // Función para exportar configuración de filtros
  const exportFilterConfig = useCallback(() => {
    return {
      filters,
      activePreset,
      timestamp: new Date().toISOString(),
    };
  }, [filters, activePreset]);

  // Función para importar configuración de filtros
  const importFilterConfig = useCallback((config: any) => {
    if (config.filters) {
      setFilters(config.filters);
      setActivePreset(config.activePreset || null);
    }
  }, []);

  // Funciones de utilidad
  const calculateAgeInYears = (birthDate: Date): number => {
    const now = new Date();
    const ageInMs = now.getTime() - birthDate.getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radio de la Tierra en km
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

  return {
    // Estado de filtros
    filters,
    activePreset,

    // Opciones de filtros
    filterOptions,
    filterPresets,

    // Acciones básicas
    setSearchTerm,
    setType,
    setBreed,
    setGender,
    setHealthStatus,
    setAgeRange,
    setWeightRange,
    setVaccinationStatus,
    setLastVaccinationDays,
    setHasIllnesses,
    setLocationFilter,
    setDateRange,
    resetFilters,
    resetLocationFilter,
    applyPreset,

    // Funciones de utilidad
    getActiveFilters,
    activeFilterCount,
    hasActiveFilters,
    applyFilters,
    exportFilterConfig,
    importFilterConfig,
  };
};

// Hook para filtros rápidos (búsqueda simple)
export const useQuickFilters = () => {
  const [quickSearch, setQuickSearch] = useState("");
  const [sortBy, setSortBy] = useState("earTag");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const applyQuickFilters = useCallback(
    (bovines: any[]) => {
      let filtered = [...bovines];

      // Búsqueda rápida
      if (quickSearch) {
        const term = quickSearch.toLowerCase();
        filtered = filtered.filter(
          (bovine) =>
            bovine.earTag.toLowerCase().includes(term) ||
            (bovine.name && bovine.name.toLowerCase().includes(term))
        );
      }

      // Ordenamiento
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Manejar fechas
        if (sortBy === "birthDate" || sortBy === "createdAt") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Manejar números
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Manejar strings
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortOrder === "asc" ? comparison : -comparison;
      });

      return filtered;
    },
    [quickSearch, sortBy, sortOrder]
  );

  return {
    quickSearch,
    setQuickSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    applyQuickFilters,
  };
};

export default useFilters;
