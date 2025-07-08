// Exportaciones centralizadas de hooks personalizados para la gestión ganadera

// Tipos para hooks que se crearán
export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface BovinesHookReturn {
  // Se definirá cuando se cree el archivo
}

export interface FilterState {
  searchTerm: string;
  type: string;
  breed: string;
  gender: string;
  healthStatus: string;
}

export interface FilterActions {
  setSearchTerm: (term: string) => void;
  setType: (type: string) => void;
  setBreed: (breed: string) => void;
  setGender: (gender: string) => void;
  setHealthStatus: (status: string) => void;
  resetFilters: () => void;
}

export interface FilterOptions {
  types: string[];
  breeds: string[];
  genders: string[];
  healthStatuses: string[];
}

export interface SearchFilters {
  query: string;
  filters: Record<string, any>;
}

export interface GeolocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocalStorageHook<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: any;
}

export interface ModalActions {
  openModal: (title?: string, content?: any) => void;
  closeModal: () => void;
  toggleModal: () => void;
}

// Tipos utilitarios para hooks
export interface HookError {
  code: string;
  message: string;
  details?: any;
}

export interface AsyncHookState<T> {
  data: T | null;
  loading: boolean;
  error: HookError | null;
}

// Estados comunes para hooks async
export const createAsyncState = <T>(): AsyncHookState<T> => ({
  data: null,
  loading: false,
  error: null,
});

// Función helper para manejo de errores en hooks
export const createHookError = (
  code: string,
  message: string,
  details?: any
): HookError => ({
  code,
  message,
  details,
});

// Constantes para códigos de error comunes
export const ERROR_CODES = {
  // Errores de red
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",

  // Errores de autenticación
  AUTH_ERROR: "AUTH_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Errores de validación
  VALIDATION_ERROR: "VALIDATION_ERROR",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Errores de geolocalización
  GEOLOCATION_ERROR: "GEOLOCATION_ERROR",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  POSITION_UNAVAILABLE: "POSITION_UNAVAILABLE",
  GEOLOCATION_TIMEOUT: "GEOLOCATION_TIMEOUT",

  // Errores de datos
  DATA_NOT_FOUND: "DATA_NOT_FOUND",
  INVALID_DATA: "INVALID_DATA",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",

  // Errores del sistema
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  CLIENT_ERROR: "CLIENT_ERROR",
} as const;

// Mensajes de error en español
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: "Error de conexión de red",
  [ERROR_CODES.TIMEOUT_ERROR]: "Tiempo de espera agotado",
  [ERROR_CODES.CONNECTION_ERROR]: "Error de conexión",

  [ERROR_CODES.AUTH_ERROR]: "Error de autenticación",
  [ERROR_CODES.UNAUTHORIZED]: "No autorizado",
  [ERROR_CODES.TOKEN_EXPIRED]: "Sesión expirada",
  [ERROR_CODES.INVALID_CREDENTIALS]: "Credenciales inválidas",

  [ERROR_CODES.VALIDATION_ERROR]: "Error de validación",
  [ERROR_CODES.REQUIRED_FIELD]: "Campo requerido",
  [ERROR_CODES.INVALID_FORMAT]: "Formato inválido",

  [ERROR_CODES.GEOLOCATION_ERROR]: "Error de geolocalización",
  [ERROR_CODES.PERMISSION_DENIED]: "Permiso de ubicación denegado",
  [ERROR_CODES.POSITION_UNAVAILABLE]: "Ubicación no disponible",
  [ERROR_CODES.GEOLOCATION_TIMEOUT]: "Tiempo de geolocalización agotado",

  [ERROR_CODES.DATA_NOT_FOUND]: "Datos no encontrados",
  [ERROR_CODES.INVALID_DATA]: "Datos inválidos",
  [ERROR_CODES.DUPLICATE_ENTRY]: "Entrada duplicada",

  [ERROR_CODES.UNKNOWN_ERROR]: "Error desconocido",
  [ERROR_CODES.SERVER_ERROR]: "Error del servidor",
  [ERROR_CODES.CLIENT_ERROR]: "Error del cliente",
} as const;

// Función helper para obtener mensaje de error
export const getErrorMessage = (code: string): string => {
  return (
    ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ||
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  );
};

// Hook compuesto para manejo de estado async con retry
export interface UseAsyncOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: HookError) => void;
}

// Tipos para el hook de debounce
export interface DebounceOptions {
  delay?: number;
  immediate?: boolean;
}

// Tipos para hooks de validación
export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Constantes para configuración de hooks
export const HOOK_DEFAULTS = {
  // Configuración de API
  API_TIMEOUT: 30000, // 30 segundos
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 segundo

  // Configuración de geolocalización
  GEOLOCATION_TIMEOUT: 10000, // 10 segundos
  GEOLOCATION_MAX_AGE: 300000, // 5 minutos
  HIGH_ACCURACY: true,

  // Configuración de debounce
  DEBOUNCE_DELAY: 500, // 500ms
  SEARCH_DEBOUNCE: 300, // 300ms para búsquedas

  // Configuración de paginación
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Configuración de caché
  CACHE_EXPIRY: 300000, // 5 minutos
  MAX_CACHE_SIZE: 100,
} as const;

// Funciones utilitarias para hooks
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = HOOK_DEFAULTS.RETRY_COUNT,
  delayMs: number = HOOK_DEFAULTS.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs);
    }
    throw error;
  }
};

// Función para validar formato de arete
export const validateEarTag = (earTag: string): ValidationResult => {
  const errors: string[] = [];

  if (!earTag) {
    errors.push("El arete es requerido");
  } else {
    if (earTag.length < 3) {
      errors.push("El arete debe tener al menos 3 caracteres");
    }
    if (earTag.length > 10) {
      errors.push("El arete no puede tener más de 10 caracteres");
    }
    if (!/^[A-Z0-9]+$/i.test(earTag)) {
      errors.push("El arete solo puede contener letras y números");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para validar coordenadas
export const validateCoordinates = (
  lat: number,
  lng: number
): ValidationResult => {
  const errors: string[] = [];

  if (lat < -90 || lat > 90) {
    errors.push("La latitud debe estar entre -90 y 90 grados");
  }

  if (lng < -180 || lng > 180) {
    errors.push("La longitud debe estar entre -180 y 180 grados");
  }

  // Validación específica para México
  if (lat < 14.5 || lat > 32.7) {
    errors.push("Las coordenadas parecen estar fuera de México");
  }

  if (lng < -118.4 || lng > -86.7) {
    errors.push("Las coordenadas parecen estar fuera de México");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para formatear fecha en español
export const formatDateSpanish = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Mexico_City",
  };

  return date.toLocaleDateString("es-MX", options);
};

// Función para calcular edad en texto
export const getAgeText = (birthDate: Date): string => {
  const now = new Date();
  const ageInMs = now.getTime() - birthDate.getTime();
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
};

// Funciones para manejo de localStorage con tipos seguros
export const safeLocalStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// Exportación por defecto con utilitarios (los hooks se exportarán cuando se creen)
export default {
  // Utilitarios
  createAsyncState,
  createHookError,
  getErrorMessage,
  delay,
  retry,
  validateEarTag,
  validateCoordinates,
  formatDateSpanish,
  getAgeText,
  safeLocalStorage,

  // Constantes
  ERROR_CODES,
  ERROR_MESSAGES,
  HOOK_DEFAULTS,
};
