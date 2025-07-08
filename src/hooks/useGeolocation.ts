import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// Tipos para el estado de geolocalización
export interface GeolocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
  permission: PermissionState | null;
}

// Coordenadas de ubicación
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

// Opciones para geolocalización
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  requestPermission?: boolean;
}

// Errores de geolocalización
export interface GeolocationError {
  code: number;
  message: string;
  type:
    | "PERMISSION_DENIED"
    | "POSITION_UNAVAILABLE"
    | "TIMEOUT"
    | "NOT_SUPPORTED"
    | "UNKNOWN";
}

// Configuración por defecto
const DEFAULT_OPTIONS: Required<
  Omit<GeolocationOptions, "watch" | "requestPermission">
> = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 segundos
  maximumAge: 300000, // 5 minutos
};

// Coordenadas de Querétaro como fallback
const QUERETARO_COORDS: LocationCoordinates = {
  latitude: 20.5888,
  longitude: -100.3899,
  accuracy: 1000,
  timestamp: Date.now(),
};

// Límites geográficos de México para validación
const MEXICO_BOUNDS = {
  north: 32.7186,
  south: 14.5388,
  east: -86.7104,
  west: -118.4662,
};

// Hook principal de geolocalización
export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    supported: "geolocation" in navigator,
    permission: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });

  // Actualizar opciones cuando cambien
  useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, ...options };
  }, [options]);

  // Función para crear error personalizado
  const createGeolocationError = useCallback((error: any): GeolocationError => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: error.code,
          message: "Permiso de ubicación denegado por el usuario",
          type: "PERMISSION_DENIED",
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: error.code,
          message: "Información de ubicación no disponible",
          type: "POSITION_UNAVAILABLE",
        };
      case error.TIMEOUT:
        return {
          code: error.code,
          message: "Tiempo de espera agotado para obtener ubicación",
          type: "TIMEOUT",
        };
      default:
        return {
          code: error.code || 0,
          message: error.message || "Error desconocido de geolocalización",
          type: "UNKNOWN",
        };
    }
  }, []);

  // Función para validar coordenadas dentro de México
  const validateCoordinatesInMexico = useCallback(
    (coords: LocationCoordinates): boolean => {
      const { latitude, longitude } = coords;
      return (
        latitude >= MEXICO_BOUNDS.south &&
        latitude <= MEXICO_BOUNDS.north &&
        longitude >= MEXICO_BOUNDS.west &&
        longitude <= MEXICO_BOUNDS.east
      );
    },
    []
  );

  // Función para convertir Position a LocationCoordinates
  const convertPosition = useCallback(
    (position: GeolocationPosition): LocationCoordinates => {
      const { coords, timestamp } = position;
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
        timestamp,
      };
    },
    []
  );

  // Función para manejar éxito en obtener ubicación
  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const coordinates = convertPosition(position);

      // Validar si las coordenadas están en México
      if (!validateCoordinatesInMexico(coordinates)) {
        console.warn(
          "Las coordenadas obtenidas parecen estar fuera de México:",
          coordinates
        );
      }

      setState((prev) => ({
        ...prev,
        coordinates,
        loading: false,
        error: null,
      }));
    },
    [convertPosition, validateCoordinatesInMexico]
  );

  // Función para manejar errores
  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      const geoError = createGeolocationError(error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: geoError.message,
      }));
    },
    [createGeolocationError]
  );

  // Función para obtener ubicación actual
  const getCurrentPosition =
    useCallback(async (): Promise<LocationCoordinates | null> => {
      if (!state.supported) {
        setState((prev) => ({
          ...prev,
          error: "Geolocalización no soportada por este navegador",
        }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coordinates = convertPosition(position);
            handleSuccess(position);
            resolve(coordinates);
          },
          (error) => {
            handleError(error);
            reject(createGeolocationError(error));
          },
          optionsRef.current
        );
      });
    }, [
      state.supported,
      convertPosition,
      handleSuccess,
      handleError,
      createGeolocationError,
    ]);

  // Función para iniciar seguimiento de ubicación
  const startWatching = useCallback(() => {
    if (!state.supported) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalización no soportada por este navegador",
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      // Ya está observando
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      optionsRef.current
    );
  }, [state.supported, handleSuccess, handleError]);

  // Función para detener seguimiento de ubicación
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Función para verificar permisos de geolocalización
  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    if (!("permissions" in navigator)) {
      return "prompt"; // Asumir que se puede solicitar
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setState((prev) => ({ ...prev, permission: permission.state }));
      return permission.state;
    } catch (error) {
      console.warn("Error al verificar permisos de geolocalización:", error);
      return "prompt";
    }
  }, []);

  // Función para solicitar permisos
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await checkPermission();

      if (permission === "granted") {
        return true;
      }

      if (permission === "denied") {
        setState((prev) => ({
          ...prev,
          error:
            "Permisos de ubicación denegados. Habilita la ubicación en la configuración del navegador.",
        }));
        return false;
      }

      // Si es 'prompt', intentar obtener ubicación para activar el prompt
      try {
        await getCurrentPosition();
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  }, [checkPermission, getCurrentPosition]);

  // Función para obtener ubicación con fallback a Querétaro
  const getLocationWithFallback =
    useCallback(async (): Promise<LocationCoordinates> => {
      try {
        const coordinates = await getCurrentPosition();
        return coordinates || QUERETARO_COORDS;
      } catch (error) {
        console.warn(
          "Error al obtener ubicación, usando coordenadas de Querétaro:",
          error
        );
        return QUERETARO_COORDS;
      }
    }, [getCurrentPosition]);

  // Función para calcular distancia entre dos puntos
  const calculateDistance = useCallback(
    (coords1: LocationCoordinates, coords2: LocationCoordinates): number => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
      const dLon = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((coords1.latitude * Math.PI) / 180) *
          Math.cos((coords2.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Función para obtener dirección aproximada desde coordenadas (geocodificación inversa)
  const getAddressFromCoordinates = useCallback(
    async (coordinates: LocationCoordinates): Promise<string | null> => {
      try {
        // Usar OpenStreetMap Nominatim como servicio gratuito
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&accept-language=es`
        );

        if (!response.ok) {
          throw new Error("Error en la geocodificación inversa");
        }

        const data = await response.json();
        return data.display_name || null;
      } catch (error) {
        console.warn("Error al obtener dirección:", error);
        return null;
      }
    },
    []
  );

  // Función para obtener coordenadas desde dirección (geocodificación)
  const getCoordinatesFromAddress = useCallback(
    async (address: string): Promise<LocationCoordinates | null> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}&countrycodes=mx&limit=1&accept-language=es`
        );

        if (!response.ok) {
          throw new Error("Error en la geocodificación");
        }

        const data = await response.json();

        if (data.length === 0) {
          return null;
        }

        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          accuracy: 1000, // Aproximación para direcciones
          timestamp: Date.now(),
        };
      } catch (error) {
        console.warn("Error al obtener coordenadas desde dirección:", error);
        return null;
      }
    },
    []
  );

  // Función para formatear coordenadas para mostrar
  const formatCoordinates = useCallback(
    (coordinates: LocationCoordinates): string => {
      const lat = coordinates.latitude.toFixed(6);
      const lng = coordinates.longitude.toFixed(6);
      return `${lat}, ${lng}`;
    },
    []
  );

  // Función para verificar si está en área rural (simplificada)
  const isRuralArea = useCallback(
    (coordinates: LocationCoordinates): boolean => {
      // Lógica simplificada: si la precisión es baja, probablemente es rural
      // En una implementación real, se usaría una API de clasificación de áreas
      return (coordinates.accuracy || 0) > 100;
    },
    []
  );

  // Verificar permisos al montar el componente
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Iniciar seguimiento automático si se especifica en las opciones
  useEffect(() => {
    if (options.watch && state.supported) {
      startWatching();
    }

    return () => {
      if (options.watch) {
        stopWatching();
      }
    };
  }, [options.watch, state.supported, startWatching, stopWatching]);

  // Obtener ubicación automáticamente si se solicita permiso
  useEffect(() => {
    if (
      options.requestPermission &&
      state.supported &&
      !state.coordinates &&
      !state.loading
    ) {
      requestPermission();
    }
  }, [
    options.requestPermission,
    state.supported,
    state.coordinates,
    state.loading,
    requestPermission,
  ]);

  // Limpiar observador al desmontar
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    // Estado
    ...state,
    isWatching: watchIdRef.current !== null,

    // Funciones principales
    getCurrentPosition,
    startWatching,
    stopWatching,

    // Gestión de permisos
    checkPermission,
    requestPermission,

    // Utilidades
    getLocationWithFallback,
    calculateDistance,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    formatCoordinates,
    validateCoordinatesInMexico,
    isRuralArea,

    // Constantes útiles
    QUERETARO_COORDS,
    MEXICO_BOUNDS,
  };
};

// Hook simplificado para obtener ubicación una sola vez
export const useCurrentLocation = (autoRequest: boolean = false) => {
  const {
    coordinates,
    loading,
    error,
    supported,
    getCurrentPosition,
    getLocationWithFallback,
  } = useGeolocation({ requestPermission: autoRequest });

  const getLocation = useCallback(
    async (withFallback: boolean = true) => {
      return withFallback ? getLocationWithFallback() : getCurrentPosition();
    },
    [getLocationWithFallback, getCurrentPosition]
  );

  return {
    coordinates,
    loading,
    error,
    supported,
    getLocation,
  };
};

// Hook para seguimiento de ubicación en tiempo real
export const useLocationTracking = (options: GeolocationOptions = {}) => {
  const geolocation = useGeolocation({ ...options, watch: true });

  return {
    ...geolocation,
    // Agregar funciones específicas para seguimiento
    isTracking: geolocation.isWatching,
    startTracking: geolocation.startWatching,
    stopTracking: geolocation.stopWatching,
  };
};

// Hook para distancia en tiempo real entre dos puntos
export const useDistanceTracker = (
  targetCoordinates: LocationCoordinates | null
) => {
  const { coordinates, ...rest } = useLocationTracking();

  const distance = useMemo(() => {
    if (!coordinates || !targetCoordinates) return null;

    const R = 6371; // Radio de la Tierra en km
    const dLat =
      ((targetCoordinates.latitude - coordinates.latitude) * Math.PI) / 180;
    const dLon =
      ((targetCoordinates.longitude - coordinates.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coordinates.latitude * Math.PI) / 180) *
        Math.cos((targetCoordinates.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [coordinates, targetCoordinates]);

  const formattedDistance = useMemo(() => {
    if (distance === null) return null;

    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }, [distance]);

  return {
    ...rest,
    coordinates,
    targetCoordinates,
    distance,
    formattedDistance,
  };
};

export default useGeolocation;
