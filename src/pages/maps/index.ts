// ============================================================================
// ARCHIVO INDEX.TS - MÓDULO DE MAPAS Y GEOLOCALIZACIÓN
// ============================================================================
// Este archivo centraliza las exportaciones del módulo de mapas para facilitar
// las importaciones en otras partes de la aplicación

// ============================================================================
// COMPONENTE PRINCIPAL DEL MÓDULO
// ============================================================================

// Página principal del módulo con routing interno
export { default as MapsPage } from "./MapsPage";

// ============================================================================
// COMPONENTES ESPECIALIZADOS DE MAPAS
// ============================================================================

// Mapa general del rancho con instalaciones y zonas
export { default as RanchMap } from "./RanchMap";

// Mapa especializado para gestión de potreros y rotación
export { default as PastureMap } from "./PastureMap";

// Mapa de tracking GPS en tiempo real del ganado
export { default as LivestockLocation } from "./LivestockLocation";

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

// Exportar la página principal como default para facilitar importación
export { default } from "./MapsPage";

// ============================================================================
// INTERFACES Y TIPOS (para uso externo)
// ============================================================================

// Interfaces principales para integración con otros módulos
export interface MapLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
  altitude?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  position: MapLocation;
  title: string;
  description?: string;
  type: "animal" | "facility" | "zone" | "alert" | "custom";
  color?: string;
  icon?: string;
}

export interface GeofenceArea {
  id: string;
  name: string;
  center: MapLocation;
  radius: number; // en metros
  type: "safe_zone" | "restricted" | "feeding" | "watering" | "medical";
  isActive: boolean;
  alertsEnabled: boolean;
}

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

// Coordenadas del centro del rancho (Villahermosa, Tabasco)
export const RANCH_CENTER: MapLocation = {
  latitude: 17.989,
  longitude: -92.9465,
  accuracy: 1.0,
  timestamp: new Date(),
};

// Configuración de zoom por defecto para diferentes vistas
export const MAP_ZOOM_LEVELS = {
  RANCH_OVERVIEW: 15, // Vista general del rancho
  PASTURE_DETAIL: 17, // Vista detallada de potreros
  LIVESTOCK_TRACKING: 18, // Tracking individual de animales
  FACILITY_VIEW: 19, // Vista de instalaciones específicas
} as const;

// Colores estándar para diferentes elementos del mapa
export const MAP_COLORS = {
  // Estados de potreros
  PASTURE_OCCUPIED: "#ef4444", // Rojo - Ocupado
  PASTURE_RESTING: "#f59e0b", // Amarillo - Descansando
  PASTURE_AVAILABLE: "#22c55e", // Verde - Disponible
  PASTURE_MAINTENANCE: "#6b7280", // Gris - Mantenimiento

  // Condiciones de pasto
  GRASS_EXCELLENT: "#10b981", // Verde oscuro
  GRASS_GOOD: "#22c55e", // Verde
  GRASS_FAIR: "#f59e0b", // Amarillo
  GRASS_POOR: "#ef4444", // Rojo
  GRASS_DEPLETED: "#7f1d1d", // Rojo oscuro

  // Estados de animales
  ANIMAL_HEALTHY: "#22c55e", // Verde - Saludable
  ANIMAL_ALERT: "#f59e0b", // Amarillo - Alerta
  ANIMAL_CRITICAL: "#ef4444", // Rojo - Crítico
  ANIMAL_OFFLINE: "#6b7280", // Gris - Sin conexión

  // Instalaciones
  FACILITY_ACTIVE: "#3b82f6", // Azul - Activa
  FACILITY_INACTIVE: "#9ca3af", // Gris - Inactiva
  FACILITY_MAINTENANCE: "#f59e0b", // Amarillo - Mantenimiento

  // Geocercas
  GEOFENCE_SAFE: "#22c55e", // Verde - Zona segura
  GEOFENCE_RESTRICTED: "#ef4444", // Rojo - Restringida
  GEOFENCE_WATER: "#3b82f6", // Azul - Agua
  GEOFENCE_FEEDING: "#f59e0b", // Amarillo - Alimentación
  GEOFENCE_MEDICAL: "#8b5cf6", // Púrpura - Médica
} as const;

// Configuración de iconos para diferentes elementos
export const MAP_ICONS = {
  // Animales
  COW: "🐄",
  BULL: "🐂",
  CALF: "🐃",

  // Instalaciones
  BARN: "🏚️",
  WATER_SOURCE: "💧",
  FEEDING_STATION: "🥛",
  VETERINARY: "🏥",
  OFFICE: "🏢",
  STORAGE: "📦",

  // Alertas
  WARNING: "⚠️",
  CRITICAL: "🚨",
  INFO: "ℹ️",
  SUCCESS: "✅",
} as const;

// ============================================================================
// UTILIDADES PARA MAPAS
// ============================================================================

// Función para calcular distancia entre dos puntos geográficos
export const calculateDistance = (
  point1: MapLocation,
  point2: MapLocation
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

// Función para determinar si un punto está dentro de una geocerca circular
export const isPointInGeofence = (
  point: MapLocation,
  geofence: GeofenceArea
): boolean => {
  const distance = calculateDistance(point, geofence.center);
  return distance <= geofence.radius / 1000; // Convertir metros a kilómetros
};

// Función para calcular el centro geográfico de múltiples puntos
export const calculateCenter = (points: MapLocation[]): MapLocation => {
  if (points.length === 0) return RANCH_CENTER;

  const sum = points.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
    accuracy: 1.0,
    timestamp: new Date(),
  };
};

// Función para calcular los límites geográficos de un conjunto de puntos
export const calculateBounds = (points: MapLocation[]): MapBounds => {
  if (points.length === 0) {
    return {
      north: RANCH_CENTER.latitude + 0.01,
      south: RANCH_CENTER.latitude - 0.01,
      east: RANCH_CENTER.longitude + 0.01,
      west: RANCH_CENTER.longitude - 0.01,
    };
  }

  const latitudes = points.map((p) => p.latitude);
  const longitudes = points.map((p) => p.longitude);

  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes),
  };
};

// Función para formatear coordenadas para visualización
export const formatCoordinates = (location: MapLocation): string => {
  const lat = location.latitude.toFixed(6);
  const lng = location.longitude.toFixed(6);
  return `${lat}, ${lng}`;
};

// Función para validar coordenadas
export const isValidLocation = (location: MapLocation): boolean => {
  return (
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

// ============================================================================
// HOOKS PERSONALIZADOS PARA MAPAS
// ============================================================================

// Hook para gestionar el estado de geolocalización
export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationState {
  location: MapLocation | null;
  error: string | null;
  isLoading: boolean;
}

// ============================================================================
// CONFIGURACIÓN DEL MÓDULO
// ============================================================================

// Información del módulo para integración con el sistema
export const MAPS_MODULE_INFO = {
  id: "maps",
  name: "Mapas y Geolocalización",
  description:
    "Sistema integral de mapas para gestión de ubicaciones, potreros y tracking GPS",
  version: "1.0.0",
  author: "UJAT - Universidad Juárez Autónoma de Tabasco",
  lastUpdated: "2025-01-06",
  features: [
    "Vista general del rancho",
    "Gestión de potreros con rotación",
    "Tracking GPS en tiempo real",
    "Sistema de geocercas",
    "Alertas de ubicación",
    "Análisis de patrones de movimiento",
  ],
  dependencies: ["leaflet@1.9.4", "framer-motion", "react-router-dom"],
} as const;

// ============================================================================
// VALIDACIÓN Y TIPOS DE EXPORTACIÓN
// ============================================================================

// Verificar que todas las exportaciones estén disponibles
export type MapsModuleExports = {
  // Componentes principales
  MapsPage: React.ComponentType<any>;
  RanchMap: React.ComponentType<any>;
  PastureMap: React.ComponentType<any>;
  LivestockLocation: React.ComponentType<any>;

  // Interfaces
  MapLocation: MapLocation;
  MapBounds: MapBounds;
  MapMarker: MapMarker;
  GeofenceArea: GeofenceArea;

  // Constantes
  RANCH_CENTER: MapLocation;
  MAP_ZOOM_LEVELS: typeof MAP_ZOOM_LEVELS;
  MAP_COLORS: typeof MAP_COLORS;
  MAP_ICONS: typeof MAP_ICONS;

  // Utilidades
  calculateDistance: typeof calculateDistance;
  isPointInGeofence: typeof isPointInGeofence;
  calculateCenter: typeof calculateCenter;
  calculateBounds: typeof calculateBounds;
  formatCoordinates: typeof formatCoordinates;
  isValidLocation: typeof isValidLocation;

  // Información del módulo
  MAPS_MODULE_INFO: typeof MAPS_MODULE_INFO;
};

// ============================================================================
// NOTAS DE DESARROLLO
// ============================================================================

/**
 * NOTAS IMPORTANTES:
 *
 * 1. COORDENADAS: Todas las coordenadas están configuradas para Villahermosa, Tabasco, México
 * 2. LEAFLET: Se incluye soporte para Leaflet con fallback a mapas simulados
 * 3. ANIMACIONES: Todos los componentes incluyen animaciones con Framer Motion
 * 4. RESPONSIVE: Los mapas se adaptan a diferentes tamaños de pantalla
 * 5. REAL-TIME: Soporte para actualizaciones GPS en tiempo real
 *
 * PRÓXIMOS DESARROLLOS:
 * - Integración con backend para datos reales
 * - Notificaciones push para alertas críticas
 * - Exportación de datos de ubicación
 * - Machine learning para predicción de patrones
 * - Integración con sistemas de climatología
 */
