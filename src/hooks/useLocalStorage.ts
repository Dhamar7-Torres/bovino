import { useState, useEffect, useCallback, useRef } from "react";

// Tipo para el hook de localStorage
export interface LocalStorageHook<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  loading: boolean;
  error: string | null;
}

// Opciones para el hook
export interface LocalStorageOptions<T> {
  defaultValue: T;
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  syncAcrossTabs?: boolean;
  prefix?: string;
  expiration?: number; // en milisegundos
  onError?: (error: Error) => void;
}

// Serializador por defecto
const defaultSerializer = {
  read: <T>(value: string): T => {
    try {
      return JSON.parse(value);
    } catch {
      // Si no es JSON válido, devolver como string
      return value as unknown as T;
    }
  },
  write: <T>(value: T): string => {
    try {
      return JSON.stringify(value);
    } catch {
      // Si no se puede serializar, convertir a string
      return String(value);
    }
  },
};

// Interfaz para datos con expiración
interface StorageData<T> {
  value: T;
  timestamp: number;
  expiration?: number;
}

// Hook principal para localStorage
export const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  options: Partial<LocalStorageOptions<T>> = {}
): LocalStorageHook<T> => {
  const {
    serializer = defaultSerializer,
    syncAcrossTabs = false,
    prefix = "bovine_app_",
    expiration,
    onError,
  } = options;

  // Clave completa con prefijo
  const fullKey = `${prefix}${key}`;

  // Referencias para evitar re-renders innecesarios
  const serializerRef = useRef(serializer);
  const onErrorRef = useRef(onError);

  // Estado interno
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para leer del localStorage
  const readFromStorage = useCallback((): T => {
    try {
      if (typeof window === "undefined") {
        return defaultValue;
      }

      const item = localStorage.getItem(fullKey);

      if (item === null) {
        return defaultValue;
      }

      // Si hay expiración configurada, verificar si el dato ha expirado
      if (expiration) {
        try {
          const parsed: StorageData<T> = JSON.parse(item);
          const now = Date.now();

          if (parsed.timestamp && parsed.expiration) {
            if (now - parsed.timestamp > parsed.expiration) {
              // Dato expirado, eliminar y devolver valor por defecto
              localStorage.removeItem(fullKey);
              return defaultValue;
            }
            return parsed.value;
          }
        } catch {
          // Si no tiene el formato esperado, intentar leer normalmente
        }
      }

      return serializerRef.current.read(item);
    } catch (err) {
      const error = err as Error;
      setError(`Error al leer del localStorage: ${error.message}`);
      onErrorRef.current?.(error);
      return defaultValue;
    }
  }, [fullKey, defaultValue, expiration]);

  // Función para escribir al localStorage
  const writeToStorage = useCallback(
    (value: T): void => {
      try {
        if (typeof window === "undefined") {
          return;
        }

        let dataToStore: string;

        if (expiration) {
          // Guardar con metadatos de expiración
          const storageData: StorageData<T> = {
            value,
            timestamp: Date.now(),
            expiration,
          };
          dataToStore = JSON.stringify(storageData);
        } else {
          dataToStore = serializerRef.current.write(value);
        }

        localStorage.setItem(fullKey, dataToStore);

        // Disparar evento personalizado para sincronización
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent(`localStorage-${fullKey}`, {
              detail: { value, timestamp: Date.now() },
            })
          );
        }

        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(`Error al escribir al localStorage: ${error.message}`);
        onErrorRef.current?.(error);
      }
    },
    [fullKey, expiration, syncAcrossTabs]
  );

  // Función para eliminar del localStorage
  const removeFromStorage = useCallback((): void => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      localStorage.removeItem(fullKey);

      // Disparar evento personalizado para sincronización
      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent(`localStorage-${fullKey}`, {
            detail: { value: null, removed: true, timestamp: Date.now() },
          })
        );
      }

      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(`Error al eliminar del localStorage: ${error.message}`);
      onErrorRef.current?.(error);
    }
  }, [fullKey, syncAcrossTabs]);

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: T | ((prev: T) => T)): void => {
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        setStoredValue(newValue);
        writeToStorage(newValue);
      } catch (err) {
        const error = err as Error;
        setError(`Error al actualizar valor: ${error.message}`);
        onErrorRef.current?.(error);
      }
    },
    [storedValue, writeToStorage]
  );

  // Función para eliminar el valor
  const removeValue = useCallback((): void => {
    setStoredValue(defaultValue);
    removeFromStorage();
  }, [defaultValue, removeFromStorage]);

  // Cargar valor inicial
  useEffect(() => {
    setLoading(true);
    const initialValue = readFromStorage();
    setStoredValue(initialValue);
    setLoading(false);
  }, [readFromStorage]);

  // Sincronización entre pestañas
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === fullKey && e.newValue !== null) {
        try {
          const newValue = serializerRef.current.read(e.newValue);
          setStoredValue(newValue);
        } catch (err) {
          const error = err as Error;
          setError(`Error en sincronización: ${error.message}`);
          onErrorRef.current?.(error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.removed) {
        setStoredValue(defaultValue);
      } else {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      `localStorage-${fullKey}`,
      handleCustomEvent as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        `localStorage-${fullKey}`,
        handleCustomEvent as EventListener
      );
    };
  }, [fullKey, defaultValue, syncAcrossTabs]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
    error,
  };
};

// Hook para configuraciones de la aplicación
export const useAppSettings = () => {
  const settingsDefaults = {
    theme: "light" as "light" | "dark",
    language: "es" as "es" | "en",
    notifications: true,
    autoSave: true,
    mapDefaultZoom: 10,
    defaultLocation: {
      latitude: 20.5888, // Querétaro
      longitude: -100.3899,
    },
    measurementUnit: "metric" as "metric" | "imperial",
    dateFormat: "dd/MM/yyyy",
    currency: "MXN",
  };

  return useLocalStorage("app_settings", settingsDefaults, {
    syncAcrossTabs: true,
    expiration: 30 * 24 * 60 * 60 * 1000, // 30 días
  });
};

// Hook para filtros guardados del usuario
export const useSavedFilters = () => {
  const filtersDefaults: Record<string, any> = {};

  return useLocalStorage("saved_filters", filtersDefaults, {
    syncAcrossTabs: true,
    expiration: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
};

// Hook para historial de búsquedas
export const useSearchHistory = () => {
  const searchDefaults: string[] = [];

  const { value, setValue, ...rest } = useLocalStorage(
    "search_history",
    searchDefaults,
    {
      expiration: 24 * 60 * 60 * 1000, // 24 horas
    }
  );

  const addSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const normalizedQuery = query.trim().toLowerCase();
      const newHistory = [
        normalizedQuery,
        ...value.filter((item) => item !== normalizedQuery),
      ].slice(0, 10);
      setValue(newHistory);
    },
    [value, setValue]
  );

  const clearHistory = useCallback(() => {
    setValue([]);
  }, [setValue]);

  const removeSearch = useCallback(
    (query: string) => {
      setValue((prev) => prev.filter((item) => item !== query));
    },
    [setValue]
  );

  return {
    history: value,
    addSearch,
    clearHistory,
    removeSearch,
    ...rest,
  };
};

// Hook para datos de autenticación persistente
export const useAuthStorage = () => {
  const authDefaults = {
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as any,
    rememberMe: false,
    lastLogin: null as string | null,
  };

  return useLocalStorage("auth_data", authDefaults, {
    syncAcrossTabs: true,
    // Sin expiración para que persista hasta logout manual
  });
};

// Hook para datos temporales de sesión
export const useSessionData = () => {
  const sessionDefaults = {
    currentView: "dashboard",
    selectedBovine: null as string | null,
    mapCenter: null as { lat: number; lng: number } | null,
    activeFilters: {},
    lastActivity: Date.now(),
  };

  return useLocalStorage("session_data", sessionDefaults, {
    expiration: 2 * 60 * 60 * 1000, // 2 horas de inactividad
  });
};

// Hook para caché de datos de bovinos
export const useBovineCache = () => {
  const cacheDefaults = {
    bovines: [] as any[],
    lastFetch: null as number | null,
    version: 1,
  };

  return useLocalStorage("bovine_cache", cacheDefaults, {
    expiration: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para configuraciones de notificaciones
export const useNotificationSettings = () => {
  const notificationDefaults = {
    enabled: true,
    sound: true,
    desktop: false,
    email: true,
    vaccinations: {
      enabled: true,
      daysAdvance: 7,
    },
    illnesses: {
      enabled: true,
      severity: ["HIGH", "CRITICAL"],
    },
    system: {
      enabled: true,
      maintenance: false,
    },
  };

  return useLocalStorage("notification_settings", notificationDefaults, {
    syncAcrossTabs: true,
  });
};

// Hook para backup de datos locales
export const useLocalBackup = () => {
  const backupDefaults = {
    lastBackup: null as string | null,
    autoBackup: true,
    backupFrequency: "weekly" as "daily" | "weekly" | "monthly",
    includeImages: false,
  };

  const { value, setValue, ...rest } = useLocalStorage(
    "backup_settings",
    backupDefaults
  );

  const createBackup = useCallback(() => {
    try {
      const backupData = {
        settings: localStorage.getItem("bovine_app_app_settings"),
        filters: localStorage.getItem("bovine_app_saved_filters"),
        cache: localStorage.getItem("bovine_app_bovine_cache"),
        notifications: localStorage.getItem("bovine_app_notification_settings"),
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `bovine-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setValue((prev) => ({
        ...prev,
        lastBackup: new Date().toISOString(),
      }));

      return true;
    } catch (error) {
      console.error("Error creando backup:", error);
      return false;
    }
  }, [setValue]);

  const restoreBackup = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);

          // Restaurar cada configuración
          if (backupData.settings) {
            localStorage.setItem(
              "bovine_app_app_settings",
              backupData.settings
            );
          }
          if (backupData.filters) {
            localStorage.setItem(
              "bovine_app_saved_filters",
              backupData.filters
            );
          }
          if (backupData.notifications) {
            localStorage.setItem(
              "bovine_app_notification_settings",
              backupData.notifications
            );
          }

          // No restaurar caché ya que puede estar desactualizado

          resolve(true);
        } catch (error) {
          console.error("Error restaurando backup:", error);
          resolve(false);
        }
      };

      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, []);

  return {
    settings: value,
    createBackup,
    restoreBackup,
    ...rest,
  };
};

// Utilidades para gestión masiva de localStorage
export const localStorageUtils = {
  // Limpiar todos los datos de la aplicación
  clearAppData: () => {
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith("bovine_app_")
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },

  // Obtener tamaño usado por la aplicación
  getStorageSize: (): number => {
    let total = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("bovine_app_")) {
        total += localStorage.getItem(key)?.length || 0;
      }
    });
    return total;
  },

  // Formatear tamaño en KB/MB
  formatStorageSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Verificar si localStorage está disponible
  isAvailable: (): boolean => {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Migrar datos de versiones anteriores
  migrateData: (fromVersion: string, toVersion: string) => {
    // Implementar lógica de migración según sea necesario
    console.log(`Migrando datos de versión ${fromVersion} a ${toVersion}`);
  },
};

export default useLocalStorage;
