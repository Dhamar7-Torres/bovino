import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

// Tipos e interfaces para el contexto de bovinos
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Vaccination {
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

interface Illness {
  id: string;
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  treatment?: string;
  veterinarianName: string;
  recoveryDate?: Date;
  location: Location;
  notes?: string;
  isContagious: boolean;
  createdAt: Date;
}

interface Bovine {
  id: string;
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
  vaccinations: Vaccination[];
  illnesses: Illness[];
  createdAt: Date;
  updatedAt: Date;
}

// Estados para el contexto
interface BovinesState {
  bovines: Bovine[];
  selectedBovine: Bovine | null;
  loading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    type: string;
    breed: string;
    gender: string;
    healthStatus: string;
    locationRadius?: number;
    centerLocation?: Location;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  mapState: {
    selectedLocations: Location[];
    showVaccinations: boolean;
    showIllnesses: boolean;
    zoomLevel: number;
    centerPoint: Location;
  };
}

// Tipos de acciones para el reducer
type BovinesAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_BOVINES"; payload: Bovine[] }
  | { type: "ADD_BOVINE"; payload: Bovine }
  | { type: "UPDATE_BOVINE"; payload: Bovine }
  | { type: "DELETE_BOVINE"; payload: string }
  | { type: "SELECT_BOVINE"; payload: Bovine | null }
  | { type: "SET_FILTERS"; payload: Partial<BovinesState["filters"]> }
  | { type: "SET_PAGINATION"; payload: Partial<BovinesState["pagination"]> }
  | { type: "SET_MAP_STATE"; payload: Partial<BovinesState["mapState"]> }
  | {
      type: "ADD_VACCINATION";
      payload: { bovineId: string; vaccination: Vaccination };
    }
  | { type: "ADD_ILLNESS"; payload: { bovineId: string; illness: Illness } }
  | {
      type: "UPDATE_LOCATION";
      payload: { bovineId: string; location: Location };
    }
  | { type: "RESET_FILTERS" };

// Estado inicial
const initialState: BovinesState = {
  bovines: [],
  selectedBovine: null,
  loading: false,
  error: null,
  filters: {
    searchTerm: "",
    type: "",
    breed: "",
    gender: "",
    healthStatus: "",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  mapState: {
    selectedLocations: [],
    showVaccinations: true,
    showIllnesses: true,
    zoomLevel: 10,
    centerPoint: {
      latitude: 20.5888, // Coordenadas de Querétaro como centro por defecto
      longitude: -100.3899,
    },
  },
};

// Reducer para manejar las acciones
const bovinesReducer = (
  state: BovinesState,
  action: BovinesAction
): BovinesState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_BOVINES":
      return { ...state, bovines: action.payload, loading: false, error: null };

    case "ADD_BOVINE":
      return {
        ...state,
        bovines: [...state.bovines, action.payload],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
      };

    case "UPDATE_BOVINE":
      return {
        ...state,
        bovines: state.bovines.map((bovine) =>
          bovine.id === action.payload.id ? action.payload : bovine
        ),
        selectedBovine:
          state.selectedBovine?.id === action.payload.id
            ? action.payload
            : state.selectedBovine,
      };

    case "DELETE_BOVINE":
      return {
        ...state,
        bovines: state.bovines.filter((bovine) => bovine.id !== action.payload),
        selectedBovine:
          state.selectedBovine?.id === action.payload
            ? null
            : state.selectedBovine,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
      };

    case "SELECT_BOVINE":
      return { ...state, selectedBovine: action.payload };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Reset página al filtrar
      };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };

    case "SET_MAP_STATE":
      return {
        ...state,
        mapState: { ...state.mapState, ...action.payload },
      };

    case "ADD_VACCINATION":
      return {
        ...state,
        bovines: state.bovines.map((bovine) =>
          bovine.id === action.payload.bovineId
            ? {
                ...bovine,
                vaccinations: [
                  ...bovine.vaccinations,
                  action.payload.vaccination,
                ],
              }
            : bovine
        ),
        selectedBovine:
          state.selectedBovine?.id === action.payload.bovineId
            ? {
                ...state.selectedBovine,
                vaccinations: [
                  ...state.selectedBovine.vaccinations,
                  action.payload.vaccination,
                ],
              }
            : state.selectedBovine,
      };

    case "ADD_ILLNESS":
      return {
        ...state,
        bovines: state.bovines.map((bovine) =>
          bovine.id === action.payload.bovineId
            ? {
                ...bovine,
                illnesses: [...bovine.illnesses, action.payload.illness],
              }
            : bovine
        ),
        selectedBovine:
          state.selectedBovine?.id === action.payload.bovineId
            ? {
                ...state.selectedBovine,
                illnesses: [
                  ...state.selectedBovine.illnesses,
                  action.payload.illness,
                ],
              }
            : state.selectedBovine,
      };

    case "UPDATE_LOCATION":
      return {
        ...state,
        bovines: state.bovines.map((bovine) =>
          bovine.id === action.payload.bovineId
            ? { ...bovine, location: action.payload.location }
            : bovine
        ),
        selectedBovine:
          state.selectedBovine?.id === action.payload.bovineId
            ? { ...state.selectedBovine, location: action.payload.location }
            : state.selectedBovine,
      };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: initialState.filters,
        pagination: { ...initialState.pagination },
      };

    default:
      return state;
  }
};

// Tipos para el contexto
interface BovinesContextType {
  // Estado
  state: BovinesState;

  // Acciones CRUD
  fetchBovines: () => Promise<void>;
  createBovine: (
    bovine: Omit<Bovine, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateBovine: (id: string, updates: Partial<Bovine>) => Promise<void>;
  deleteBovine: (id: string) => Promise<void>;

  // Selección y navegación
  selectBovine: (bovine: Bovine | null) => void;

  // Filtros y búsqueda
  setFilters: (filters: Partial<BovinesState["filters"]>) => void;
  resetFilters: () => void;

  // Paginación
  setPagination: (pagination: Partial<BovinesState["pagination"]>) => void;
  goToPage: (page: number) => void;

  // Funciones de mapa
  setMapState: (mapState: Partial<BovinesState["mapState"]>) => void;
  updateLocation: (bovineId: string, location: Location) => void;

  // Funciones de salud
  addVaccination: (
    bovineId: string,
    vaccination: Omit<Vaccination, "id" | "createdAt">
  ) => Promise<void>;
  addIllness: (
    bovineId: string,
    illness: Omit<Illness, "id" | "createdAt">
  ) => Promise<void>;

  // Geolocalización
  getCurrentLocation: () => Promise<Location | null>;

  // Utilidades
  getFilteredBovines: () => Bovine[];
  getBovineByEarTag: (earTag: string) => Bovine | undefined;
  getBovinesByLocation: (
    centerLocation: Location,
    radiusKm: number
  ) => Bovine[];
}

// Crear el contexto
const BovinesContext = createContext<BovinesContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useBovines = (): BovinesContextType => {
  const context = useContext(BovinesContext);
  if (!context) {
    throw new Error("useBovines debe ser usado dentro de un BovinesProvider");
  }
  return context;
};

// Props del proveedor
interface BovinesProviderProps {
  children: React.ReactNode;
}

// Proveedor del contexto
export const BovinesProvider: React.FC<BovinesProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bovinesReducer, initialState);

  // Funciones para interactuar con la API (simuladas por ahora)
  const fetchBovines = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // TODO: Implementar llamada real a la API
      // const response = await api.get('/cattle');
      // dispatch({ type: 'SET_BOVINES', payload: response.data });

      // Datos de ejemplo por ahora
      const mockBovines: Bovine[] = [
        {
          id: "1",
          earTag: "MX001",
          name: "Esperanza",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          birthDate: new Date("2020-03-15"),
          weight: 450,
          location: {
            latitude: 20.5888,
            longitude: -100.3899,
            address: "Rancho San José, Querétaro",
          },
          healthStatus: "HEALTHY",
          vaccinations: [],
          illnesses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      dispatch({ type: "SET_BOVINES", payload: mockBovines });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar los bovinos" });
      console.error("Error al obtener bovinos:", error);
    }
  }, []);

  const createBovine = useCallback(
    async (bovineData: Omit<Bovine, "id" | "createdAt" | "updatedAt">) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // TODO: Implementar llamada real a la API
        const newBovine: Bovine = {
          ...bovineData,
          id: Date.now().toString(), // ID temporal
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        dispatch({ type: "ADD_BOVINE", payload: newBovine });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Error al crear el bovino" });
        console.error("Error al crear bovino:", error);
      }
    },
    []
  );

  const updateBovine = useCallback(
    async (id: string, updates: Partial<Bovine>) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // TODO: Implementar llamada real a la API
        const currentBovine = state.bovines.find((b) => b.id === id);
        if (currentBovine) {
          const updatedBovine: Bovine = {
            ...currentBovine,
            ...updates,
            updatedAt: new Date(),
          };

          dispatch({ type: "UPDATE_BOVINE", payload: updatedBovine });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Error al actualizar el bovino",
        });
        console.error("Error al actualizar bovino:", error);
      }
    },
    [state.bovines]
  );

  const deleteBovine = useCallback(async (id: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // TODO: Implementar llamada real a la API
      dispatch({ type: "DELETE_BOVINE", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al eliminar el bovino" });
      console.error("Error al eliminar bovino:", error);
    }
  }, []);

  // Funciones de navegación y selección
  const selectBovine = useCallback((bovine: Bovine | null) => {
    dispatch({ type: "SELECT_BOVINE", payload: bovine });
  }, []);

  // Funciones de filtros
  const setFilters = useCallback(
    (filters: Partial<BovinesState["filters"]>) => {
      dispatch({ type: "SET_FILTERS", payload: filters });
    },
    []
  );

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  // Funciones de paginación
  const setPagination = useCallback(
    (pagination: Partial<BovinesState["pagination"]>) => {
      dispatch({ type: "SET_PAGINATION", payload: pagination });
    },
    []
  );

  const goToPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGINATION", payload: { page } });
  }, []);

  // Funciones de mapa
  const setMapState = useCallback(
    (mapState: Partial<BovinesState["mapState"]>) => {
      dispatch({ type: "SET_MAP_STATE", payload: mapState });
    },
    []
  );

  const updateLocation = useCallback((bovineId: string, location: Location) => {
    dispatch({ type: "UPDATE_LOCATION", payload: { bovineId, location } });
  }, []);

  // Funciones de salud
  const addVaccination = useCallback(
    async (
      bovineId: string,
      vaccinationData: Omit<Vaccination, "id" | "createdAt">
    ) => {
      try {
        const vaccination: Vaccination = {
          ...vaccinationData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };

        dispatch({
          type: "ADD_VACCINATION",
          payload: { bovineId, vaccination },
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Error al registrar la vacunación",
        });
        console.error("Error al agregar vacunación:", error);
      }
    },
    []
  );

  const addIllness = useCallback(
    async (
      bovineId: string,
      illnessData: Omit<Illness, "id" | "createdAt">
    ) => {
      try {
        const illness: Illness = {
          ...illnessData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };

        dispatch({ type: "ADD_ILLNESS", payload: { bovineId, illness } });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Error al registrar la enfermedad",
        });
        console.error("Error al agregar enfermedad:", error);
      }
    },
    []
  );

  // Función de geolocalización
  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocalización no soportada");
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error de geolocalización:", error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutos
          }
        );
      });
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      return null;
    }
  }, []);

  // Funciones de utilidad
  const getFilteredBovines = useCallback((): Bovine[] => {
    let filtered = state.bovines;

    // Filtro por término de búsqueda (nombre o arete)
    if (state.filters.searchTerm) {
      const term = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bovine) =>
          bovine.earTag.toLowerCase().includes(term) ||
          bovine.name?.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (state.filters.type) {
      filtered = filtered.filter(
        (bovine) => bovine.type === state.filters.type
      );
    }

    // Filtro por raza
    if (state.filters.breed) {
      filtered = filtered.filter(
        (bovine) => bovine.breed === state.filters.breed
      );
    }

    // Filtro por género
    if (state.filters.gender) {
      filtered = filtered.filter(
        (bovine) => bovine.gender === state.filters.gender
      );
    }

    // Filtro por estado de salud
    if (state.filters.healthStatus) {
      filtered = filtered.filter(
        (bovine) => bovine.healthStatus === state.filters.healthStatus
      );
    }

    // Filtro por ubicación (radio)
    if (state.filters.centerLocation && state.filters.locationRadius) {
      filtered = getBovinesByLocation(
        state.filters.centerLocation,
        state.filters.locationRadius
      );
    }

    return filtered;
  }, [state.bovines, state.filters]);

  const getBovineByEarTag = useCallback(
    (earTag: string): Bovine | undefined => {
      return state.bovines.find((bovine) => bovine.earTag === earTag);
    },
    [state.bovines]
  );

  const getBovinesByLocation = useCallback(
    (centerLocation: Location, radiusKm: number): Bovine[] => {
      // Función para calcular distancia usando fórmula de Haversine
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

      return state.bovines.filter((bovine) => {
        const distance = calculateDistance(
          centerLocation.latitude,
          centerLocation.longitude,
          bovine.location.latitude,
          bovine.location.longitude
        );
        return distance <= radiusKm;
      });
    },
    [state.bovines]
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchBovines();
  }, [fetchBovines]);

  // Valor del contexto
  const contextValue: BovinesContextType = {
    state,
    fetchBovines,
    createBovine,
    updateBovine,
    deleteBovine,
    selectBovine,
    setFilters,
    resetFilters,
    setPagination,
    goToPage,
    setMapState,
    updateLocation,
    addVaccination,
    addIllness,
    getCurrentLocation,
    getFilteredBovines,
    getBovineByEarTag,
    getBovinesByLocation,
  };

  return (
    <BovinesContext.Provider value={contextValue}>
      {children}
    </BovinesContext.Provider>
  );
};

export default BovinesContext;
