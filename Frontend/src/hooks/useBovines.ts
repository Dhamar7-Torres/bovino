import { useCallback, useMemo, useState } from "react";
import { useBovines as useBovinesContext } from "../context";

// Tipos específicos para este hook
export interface BovinesHookReturn {
  // Estado del contexto
  bovines: any[];
  selectedBovine: any | null;
  loading: boolean;
  error: string | null;
  filters: any;
  pagination: any;
  mapState: any;

  // Funciones CRUD
  fetchBovines: () => Promise<void>;
  createBovine: (bovine: any) => Promise<void>;
  updateBovine: (id: string, updates: any) => Promise<void>;
  deleteBovine: (id: string) => Promise<void>;

  // Funciones de utilidad
  searchBovines: (term: string) => void;
  filterByHealth: (status: string) => void;
  filterByType: (type: string) => void;
  resetFilters: () => void;

  // Estadísticas
  stats: {
    total: number;
    healthy: number;
    sick: number;
    vaccinated: number;
    recentIllnesses: number;
  };

  // Funciones avanzadas
  getVaccinationHistory: (bovineId: string) => any[];
  getIllnessHistory: (bovineId: string) => any[];
  getUpcomingVaccinations: () => any[];
  getNearbyBovines: (
    location: { lat: number; lng: number },
    radius: number
  ) => any[];

  // Funciones adicionales
  calculateAge: (birthDate: Date) => string;
  getHealthStatusWithColor: (status: string) => {
    value: string;
    label: string;
    color: string;
  };
  validateBovineData: (bovineData: any) => {
    isValid: boolean;
    errors: string[];
  };
  exportBovinesData: (format?: "csv" | "json") => string;

  // Re-exportadas del contexto
  addVaccination: any;
  addIllness: any;
  getCurrentLocation: any;
  getFilteredBovines: () => any[];
}

// Estados de salud para filtros
export const HEALTH_STATUSES = [
  { value: "HEALTHY", label: "Saludable", color: "green" },
  { value: "SICK", label: "Enfermo", color: "red" },
  { value: "RECOVERING", label: "Recuperándose", color: "yellow" },
  { value: "QUARANTINE", label: "Cuarentena", color: "orange" },
  { value: "DECEASED", label: "Fallecido", color: "gray" },
] as const;

// Tipos de bovinos para filtros
export const BOVINE_TYPES = [
  { value: "CATTLE", label: "Ganado" },
  { value: "BULL", label: "Toro" },
  { value: "COW", label: "Vaca" },
  { value: "CALF", label: "Ternero" },
] as const;

// Razas comunes en México
export const COMMON_BREEDS = [
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
] as const;

// Hook principal que extiende el contexto de bovinos
export const useBovines = (): BovinesHookReturn => {
  // Usar el contexto de bovinos
  const contextValue = useBovinesContext();

  const {
    state,
    fetchBovines,
    createBovine,
    updateBovine,
    deleteBovine,
    setFilters,
    resetFilters,
    getFilteredBovines,
    addVaccination,
    addIllness,
    getCurrentLocation,
    getBovinesByLocation,
  } = contextValue;

  // Función para buscar bovinos por término
  const searchBovines = useCallback(
    (term: string) => {
      setFilters({ searchTerm: term });
    },
    [setFilters]
  );

  // Función para filtrar por estado de salud
  const filterByHealth = useCallback(
    (status: string) => {
      setFilters({ healthStatus: status });
    },
    [setFilters]
  );

  // Función para filtrar por tipo
  const filterByType = useCallback(
    (type: string) => {
      setFilters({ type });
    },
    [setFilters]
  );

  // Estadísticas calculadas en tiempo real
  const stats = useMemo(() => {
    const bovines = getFilteredBovines();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: bovines.length,
      healthy: bovines.filter((b) => b.healthStatus === "HEALTHY").length,
      sick: bovines.filter((b) => b.healthStatus === "SICK").length,
      vaccinated: bovines.filter(
        (b) => b.vaccinations && b.vaccinations.length > 0
      ).length,
      recentIllnesses: bovines.filter(
        (b) =>
          b.illnesses &&
          b.illnesses.some(
            (illness: any) => new Date(illness.diagnosisDate) >= thirtyDaysAgo
          )
      ).length,
    };
  }, [getFilteredBovines]);

  // Función para obtener historial de vacunaciones de un bovino
  const getVaccinationHistory = useCallback(
    (bovineId: string) => {
      const bovine = state.bovines.find((b) => b.id === bovineId);
      if (!bovine || !bovine.vaccinations) return [];

      return bovine.vaccinations.sort(
        (a: any, b: any) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      );
    },
    [state.bovines]
  );

  // Función para obtener historial de enfermedades de un bovino
  const getIllnessHistory = useCallback(
    (bovineId: string) => {
      const bovine = state.bovines.find((b) => b.id === bovineId);
      if (!bovine || !bovine.illnesses) return [];

      return bovine.illnesses.sort(
        (a: any, b: any) =>
          new Date(b.diagnosisDate).getTime() -
          new Date(a.diagnosisDate).getTime()
      );
    },
    [state.bovines]
  );

  // Función para obtener próximas vacunaciones
  const getUpcomingVaccinations = useCallback(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const upcomingVaccinations: any[] = [];

    state.bovines.forEach((bovine) => {
      if (bovine.vaccinations) {
        bovine.vaccinations.forEach((vaccination: any) => {
          if (vaccination.nextDueDate) {
            const dueDate = new Date(vaccination.nextDueDate);
            if (dueDate >= now && dueDate <= thirtyDaysFromNow) {
              upcomingVaccinations.push({
                ...vaccination,
                bovine: {
                  id: bovine.id,
                  earTag: bovine.earTag,
                  name: bovine.name,
                },
                daysUntilDue: Math.ceil(
                  (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                ),
              });
            }
          }
        });
      }
    });

    return upcomingVaccinations.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [state.bovines]);

  // Función para obtener bovinos cercanos a una ubicación
  const getNearbyBovines = useCallback(
    (location: { lat: number; lng: number }, radius: number) => {
      return getBovinesByLocation(
        { latitude: location.lat, longitude: location.lng },
        radius
      );
    },
    [getBovinesByLocation]
  );

  // Función para calcular edad de un bovino
  const calculateAge = useCallback((birthDate: Date) => {
    const now = new Date();
    const birth = new Date(birthDate);
    const ageInMs = now.getTime() - birth.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    const ageInMonths = Math.floor(ageInDays / 30.44);
    const ageInYears = Math.floor(ageInDays / 365.25);

    if (ageInYears >= 1) {
      return `${ageInYears} año${ageInYears > 1 ? "s" : ""}`;
    } else if (ageInMonths >= 1) {
      return `${ageInMonths} mes${ageInMonths > 1 ? "es" : ""}`;
    } else {
      return `${ageInDays} día${ageInDays > 1 ? "s" : ""}`;
    }
  }, []);

  // Función para obtener el estado de salud con color
  const getHealthStatusWithColor = useCallback((status: string) => {
    const healthStatus = HEALTH_STATUSES.find((h) => h.value === status);
    return healthStatus || { value: status, label: status, color: "gray" };
  }, []);

  // Función para validar datos de bovino antes de crear/actualizar
  const validateBovineData = useCallback((bovineData: any) => {
    const errors: string[] = [];

    if (!bovineData.earTag) {
      errors.push("El número de arete es requerido");
    } else if (!/^[A-Z0-9]+$/i.test(bovineData.earTag)) {
      errors.push("El arete solo puede contener letras y números");
    }

    if (!bovineData.type) {
      errors.push("El tipo de bovino es requerido");
    }

    if (!bovineData.breed) {
      errors.push("La raza es requerida");
    }

    if (!bovineData.gender) {
      errors.push("El género es requerido");
    }

    if (!bovineData.birthDate) {
      errors.push("La fecha de nacimiento es requerida");
    } else {
      const birthDate = new Date(bovineData.birthDate);
      const now = new Date();
      if (birthDate > now) {
        errors.push("La fecha de nacimiento no puede ser futura");
      }
    }

    if (!bovineData.weight || bovineData.weight <= 0) {
      errors.push("El peso debe ser mayor a 0");
    } else if (bovineData.weight > 1500) {
      errors.push("El peso parece demasiado alto");
    }

    if (
      !bovineData.location ||
      !bovineData.location.latitude ||
      !bovineData.location.longitude
    ) {
      errors.push("La ubicación es requerida");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Función para crear bovino con validación
  const createBovineWithValidation = useCallback(
    async (bovineData: any) => {
      const validation = validateBovineData(bovineData);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      return createBovine(bovineData);
    },
    [createBovine, validateBovineData]
  );

  // Función para actualizar bovino con validación
  const updateBovineWithValidation = useCallback(
    async (id: string, updates: any) => {
      // Obtener datos actuales del bovino
      const currentBovine = state.bovines.find((b) => b.id === id);
      if (!currentBovine) {
        throw new Error("Bovino no encontrado");
      }

      // Combinar datos actuales con actualizaciones
      const updatedData = { ...currentBovine, ...updates };
      const validation = validateBovineData(updatedData);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      return updateBovine(id, updates);
    },
    [updateBovine, validateBovineData, state.bovines]
  );

  // Función para exportar datos de bovinos
  const exportBovinesData = useCallback(
    (format: "csv" | "json" = "csv") => {
      const bovines = getFilteredBovines();

      if (format === "json") {
        return JSON.stringify(bovines, null, 2);
      }

      // Formato CSV
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
      ];

      const rows = bovines.map((bovine) => [
        bovine.id,
        bovine.earTag,
        bovine.name || "",
        bovine.type,
        bovine.breed,
        bovine.gender,
        new Date(bovine.birthDate).toLocaleDateString("es-MX"),
        bovine.weight.toString(),
        bovine.healthStatus,
        bovine.location.latitude.toString(),
        bovine.location.longitude.toString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return csvContent;
    },
    [getFilteredBovines]
  );

  return {
    // Estado del contexto
    bovines: state.bovines,
    selectedBovine: state.selectedBovine,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    mapState: state.mapState,

    // Funciones CRUD básicas
    fetchBovines,
    createBovine: createBovineWithValidation,
    updateBovine: updateBovineWithValidation,
    deleteBovine,

    // Funciones de filtrado y búsqueda
    searchBovines,
    filterByHealth,
    filterByType,
    resetFilters,

    // Estadísticas
    stats,

    // Funciones avanzadas
    getVaccinationHistory,
    getIllnessHistory,
    getUpcomingVaccinations,
    getNearbyBovines,

    // Utilidades adicionales
    calculateAge,
    getHealthStatusWithColor,
    validateBovineData,
    exportBovinesData,

    // Re-exportar funciones del contexto
    addVaccination,
    addIllness,
    getCurrentLocation,
    getFilteredBovines,
  };
};

// Hook para estadísticas específicas del dashboard
export const useBovinesDashboard = () => {
  const { stats, bovines, getUpcomingVaccinations } = useBovines();

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Bovinos agregados esta semana
    const newThisWeek = bovines.filter(
      (bovine) => new Date(bovine.createdAt) >= lastWeek
    ).length;

    // Vacunaciones próximas (próximos 7 días)
    const upcomingVaccinations = getUpcomingVaccinations().filter(
      (v) => v.daysUntilDue <= 7
    );

    // Animales en cuarentena
    const inQuarantine = bovines.filter(
      (bovine) => bovine.healthStatus === "QUARANTINE"
    ).length;

    // Promedio de peso por tipo
    const weightByType = BOVINE_TYPES.map((type) => {
      const bovinesOfType = bovines.filter((b) => b.type === type.value);
      const avgWeight =
        bovinesOfType.length > 0
          ? bovinesOfType.reduce((sum, b) => sum + b.weight, 0) /
            bovinesOfType.length
          : 0;

      return {
        type: type.label,
        count: bovinesOfType.length,
        avgWeight: Math.round(avgWeight),
      };
    });

    return {
      ...stats,
      newThisWeek,
      upcomingVaccinations: upcomingVaccinations.length,
      inQuarantine,
      weightByType,
      urgentVaccinations: upcomingVaccinations.filter(
        (v) => v.daysUntilDue <= 3
      ).length,
    };
  }, [stats, bovines, getUpcomingVaccinations]);

  return dashboardStats;
};

// Hook para manejo de selección múltiple
export const useBovinesSelection = () => {
  const { bovines } = useBovines();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectBovine = useCallback((id: string) => {
    setSelectedIds((prev) => [...prev, id]);
  }, []);

  const deselectBovine = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }, []);

  const toggleBovine = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(bovines.map((bovine) => bovine.id));
  }, [bovines]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectedBovines = useMemo(
    () => bovines.filter((bovine) => selectedIds.includes(bovine.id)),
    [bovines, selectedIds]
  );

  return {
    selectedIds,
    selectedBovines,
    selectBovine,
    deselectBovine,
    toggleBovine,
    selectAll,
    clearSelection,
    hasSelection: selectedIds.length > 0,
    selectionCount: selectedIds.length,
  };
};

export default useBovines;
