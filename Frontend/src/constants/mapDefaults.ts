// Configuraciones y valores por defecto para mapas y geolocalización

export interface MapCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  timestamp?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: MapCoordinates;
}

export interface MapViewport {
  center: MapCoordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface MapMarkerConfig {
  id: string;
  position: MapCoordinates;
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  category?: MarkerCategory;
  clusterable?: boolean;
  clickable?: boolean;
}

export interface MapClusterConfig {
  enabled: boolean;
  maxZoom: number;
  radius: number;
  minPoints: number;
  showCoverageOnHover: boolean;
}

export interface MapStyleConfig {
  provider: MapProvider;
  theme: MapTheme;
  customStyle?: string;
  showAttribution: boolean;
  showScale: boolean;
  showZoomControl: boolean;
  showFullscreenControl: boolean;
}

export interface MapInteractionConfig {
  dragging: boolean;
  touchZoom: boolean;
  scrollWheelZoom: boolean;
  doubleClickZoom: boolean;
  boxZoom: boolean;
  keyboard: boolean;
  zoomControl: boolean;
  attributionControl: boolean;
}

// Enums para categorías de marcadores
export enum MarkerCategory {
  CATTLE = "cattle",
  VACCINATION = "vaccination",
  ILLNESS = "illness",
  FEED_POINT = "feed_point",
  WATER_POINT = "water_point",
  FACILITY = "facility",
  VETERINARY = "veterinary",
  BOUNDARY = "boundary",
  PASTURE = "pasture",
  EQUIPMENT = "equipment",
}

// Proveedores de mapas disponibles
export enum MapProvider {
  OPENSTREETMAP = "openstreetmap",
  GOOGLE_MAPS = "google_maps",
  MAPBOX = "mapbox",
  ESRI = "esri",
}

// Temas de mapas
export enum MapTheme {
  LIGHT = "light",
  DARK = "dark",
  SATELLITE = "satellite",
  TERRAIN = "terrain",
  HYBRID = "hybrid",
}

// Coordenadas por defecto para México
export const MEXICO_DEFAULT_COORDS: MapCoordinates = {
  latitude: 23.6345,
  longitude: -102.5528,
  accuracy: 1000,
  timestamp: Date.now(),
};

// Coordenadas específicas de Querétaro (ubicación del usuario)
export const QUERETARO_COORDS: MapCoordinates = {
  latitude: 20.5888,
  longitude: -100.3899,
  accuracy: 500,
  timestamp: Date.now(),
};

// Coordenadas específicas de Santiago de Querétaro
export const SANTIAGO_QUERETARO_COORDS: MapCoordinates = {
  latitude: 20.5931,
  longitude: -100.3931,
  accuracy: 100,
  timestamp: Date.now(),
};

// Límites geográficos de México para validación
export const MEXICO_BOUNDS: MapBounds = {
  north: 32.7186,
  south: 14.5388,
  east: -86.7104,
  west: -118.4662,
  center: MEXICO_DEFAULT_COORDS,
};

// Límites específicos del estado de Querétaro
export const QUERETARO_STATE_BOUNDS: MapBounds = {
  north: 21.7199,
  south: 20.0117,
  east: -99.0264,
  west: -100.5194,
  center: QUERETARO_COORDS,
};

// Configuración por defecto del viewport del mapa
export const DEFAULT_MAP_VIEWPORT: MapViewport = {
  center: QUERETARO_COORDS,
  zoom: 13,
  bounds: QUERETARO_STATE_BOUNDS,
};

// Niveles de zoom para diferentes vistas
export const ZOOM_LEVELS = {
  COUNTRY: 5, // Vista de todo México
  STATE: 8, // Vista del estado
  CITY: 13, // Vista de la ciudad
  FARM: 16, // Vista de la granja/rancho
  PADDOCK: 18, // Vista de potreros específicos
  DETAILED: 20, // Vista detallada de instalaciones
} as const;

// Configuración de clusterización de marcadores
export const DEFAULT_CLUSTER_CONFIG: MapClusterConfig = {
  enabled: true,
  maxZoom: 15,
  radius: 50,
  minPoints: 3,
  showCoverageOnHover: true,
};

// Configuración de estilo del mapa
export const DEFAULT_MAP_STYLE: MapStyleConfig = {
  provider: MapProvider.OPENSTREETMAP,
  theme: MapTheme.LIGHT,
  showAttribution: true,
  showScale: true,
  showZoomControl: true,
  showFullscreenControl: true,
};

// Configuración de interacción del mapa
export const DEFAULT_MAP_INTERACTION: MapInteractionConfig = {
  dragging: true,
  touchZoom: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  boxZoom: false,
  keyboard: true,
  zoomControl: true,
  attributionControl: true,
};

// Colores para diferentes categorías de marcadores
export const MARKER_COLORS = {
  [MarkerCategory.CATTLE]: "#3b82f6", // Azul
  [MarkerCategory.VACCINATION]: "#22c55e", // Verde
  [MarkerCategory.ILLNESS]: "#ef4444", // Rojo
  [MarkerCategory.FEED_POINT]: "#f59e0b", // Amarillo
  [MarkerCategory.WATER_POINT]: "#06b6d4", // Cian
  [MarkerCategory.FACILITY]: "#6b7280", // Gris
  [MarkerCategory.VETERINARY]: "#8b5cf6", // Púrpura
  [MarkerCategory.BOUNDARY]: "#f97316", // Naranja
  [MarkerCategory.PASTURE]: "#84cc16", // Verde lima
  [MarkerCategory.EQUIPMENT]: "#64748b", // Gris azulado
} as const;

// Iconos para diferentes categorías de marcadores (Lucide icons)
export const MARKER_ICONS = {
  [MarkerCategory.CATTLE]: "beef",
  [MarkerCategory.VACCINATION]: "syringe",
  [MarkerCategory.ILLNESS]: "heart-pulse",
  [MarkerCategory.FEED_POINT]: "wheat",
  [MarkerCategory.WATER_POINT]: "droplets",
  [MarkerCategory.FACILITY]: "building",
  [MarkerCategory.VETERINARY]: "stethoscope",
  [MarkerCategory.BOUNDARY]: "map",
  [MarkerCategory.PASTURE]: "trees",
  [MarkerCategory.EQUIPMENT]: "wrench",
} as const;

// Etiquetas en español para categorías de marcadores
export const MARKER_CATEGORY_LABELS = {
  [MarkerCategory.CATTLE]: "Ganado",
  [MarkerCategory.VACCINATION]: "Vacunación",
  [MarkerCategory.ILLNESS]: "Enfermedad",
  [MarkerCategory.FEED_POINT]: "Punto de Alimentación",
  [MarkerCategory.WATER_POINT]: "Punto de Agua",
  [MarkerCategory.FACILITY]: "Instalación",
  [MarkerCategory.VETERINARY]: "Veterinario",
  [MarkerCategory.BOUNDARY]: "Límite",
  [MarkerCategory.PASTURE]: "Potrero",
  [MarkerCategory.EQUIPMENT]: "Equipo",
} as const;

// URLs de tiles para diferentes proveedores de mapas
export const MAP_TILE_URLS = {
  [MapProvider.OPENSTREETMAP]: {
    [MapTheme.LIGHT]: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    [MapTheme.DARK]:
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    [MapTheme.SATELLITE]:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    [MapTheme.TERRAIN]: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  },
} as const;

// Atribuciones para diferentes proveedores
export const MAP_ATTRIBUTIONS = {
  [MapProvider.OPENSTREETMAP]: "© OpenStreetMap contributors",
  [MapProvider.GOOGLE_MAPS]: "© Google Maps",
  [MapProvider.MAPBOX]: "© Mapbox",
  [MapProvider.ESRI]: "© Esri",
} as const;

// Configuración para diferentes tipos de eventos
export const EVENT_MAP_CONFIGS = {
  vaccination: {
    defaultZoom: ZOOM_LEVELS.FARM,
    markerColor: MARKER_COLORS[MarkerCategory.VACCINATION],
    showRadius: true,
    radiusMeters: 100,
    clustering: true,
  },
  illness: {
    defaultZoom: ZOOM_LEVELS.FARM,
    markerColor: MARKER_COLORS[MarkerCategory.ILLNESS],
    showRadius: true,
    radiusMeters: 200,
    clustering: true,
  },
  management: {
    defaultZoom: ZOOM_LEVELS.PADDOCK,
    markerColor: MARKER_COLORS[MarkerCategory.FACILITY],
    showRadius: false,
    clustering: false,
  },
} as const;

// Configuración de geolocalización
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 segundos
  maximumAge: 300000, // 5 minutos
  distanceFilter: 10, // Mínimo 10 metros de movimiento para actualizar
} as const;

// Configuración de precisión de ubicación
export const LOCATION_ACCURACY = {
  EXCELLENT: 5, // Menos de 5 metros
  GOOD: 20, // 5-20 metros
  FAIR: 100, // 20-100 metros
  POOR: 500, // Más de 100 metros
} as const;

// Configuración de áreas de interés predefinidas
export const PREDEFINED_AREAS = {
  bajio: {
    name: "Región del Bajío",
    center: { latitude: 20.8, longitude: -101.2 },
    bounds: {
      north: 22.0,
      south: 19.5,
      east: -99.5,
      west: -103.0,
      center: { latitude: 20.8, longitude: -101.2 },
    },
    zoom: ZOOM_LEVELS.STATE,
  },
  queretaro_metropolitana: {
    name: "Zona Metropolitana de Querétaro",
    center: SANTIAGO_QUERETARO_COORDS,
    bounds: {
      north: 20.8,
      south: 20.4,
      east: -100.1,
      west: -100.6,
      center: SANTIAGO_QUERETARO_COORDS,
    },
    zoom: ZOOM_LEVELS.CITY,
  },
} as const;

// Funciones helper para trabajar con mapas
export const mapHelpers = {
  // Verificar si las coordenadas son válidas
  isValidCoordinate: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  // Verificar si las coordenadas están dentro de México
  isWithinMexico: (coords: MapCoordinates): boolean => {
    return (
      coords.latitude >= MEXICO_BOUNDS.south &&
      coords.latitude <= MEXICO_BOUNDS.north &&
      coords.longitude >= MEXICO_BOUNDS.west &&
      coords.longitude <= MEXICO_BOUNDS.east
    );
  },

  // Verificar si las coordenadas están dentro de Querétaro
  isWithinQueretaro: (coords: MapCoordinates): boolean => {
    return (
      coords.latitude >= QUERETARO_STATE_BOUNDS.south &&
      coords.latitude <= QUERETARO_STATE_BOUNDS.north &&
      coords.longitude >= QUERETARO_STATE_BOUNDS.west &&
      coords.longitude <= QUERETARO_STATE_BOUNDS.east
    );
  },

  // Calcular distancia entre dos puntos (en kilómetros)
  calculateDistance: (
    coord1: MapCoordinates,
    coord2: MapCoordinates
  ): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Formatear distancia para mostrar
  formatDistance: (distanceInKm: number): string => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    }
    return `${distanceInKm.toFixed(1)}km`;
  },

  // Obtener bounds para un conjunto de coordenadas
  getBoundsFromCoordinates: (
    coordinates: MapCoordinates[]
  ): MapBounds | null => {
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

  // Determinar el zoom apropiado basado en la distancia
  getAppropriateZoom: (distanceInKm: number): number => {
    if (distanceInKm < 0.5) return ZOOM_LEVELS.DETAILED;
    if (distanceInKm < 2) return ZOOM_LEVELS.PADDOCK;
    if (distanceInKm < 10) return ZOOM_LEVELS.FARM;
    if (distanceInKm < 50) return ZOOM_LEVELS.CITY;
    if (distanceInKm < 200) return ZOOM_LEVELS.STATE;
    return ZOOM_LEVELS.COUNTRY;
  },

  // Generar marcador con configuración por defecto
  createDefaultMarker: (
    position: MapCoordinates,
    category: MarkerCategory,
    title?: string
  ): MapMarkerConfig => {
    return {
      id: Math.random().toString(36).substring(7),
      position,
      title: title || MARKER_CATEGORY_LABELS[category],
      color: MARKER_COLORS[category],
      icon: MARKER_ICONS[category],
      category,
      clusterable: true,
      clickable: true,
    };
  },

  // Evaluar precisión de ubicación
  evaluateLocationAccuracy: (accuracy?: number): string => {
    if (!accuracy) return "Desconocida";

    if (accuracy <= LOCATION_ACCURACY.EXCELLENT) return "Excelente";
    if (accuracy <= LOCATION_ACCURACY.GOOD) return "Buena";
    if (accuracy <= LOCATION_ACCURACY.FAIR) return "Regular";
    return "Pobre";
  },
} as const;

// Configuración para modo offline
export const OFFLINE_MAP_CONFIG = {
  enableCaching: true,
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  defaultTilesCacheTime: 7 * 24 * 60 * 60 * 1000, // 7 días
  fallbackProvider: MapProvider.OPENSTREETMAP,
  showOfflineIndicator: true,
} as const;

// Configuración de rendimiento
export const PERFORMANCE_CONFIG = {
  maxMarkersBeforeClustering: 100,
  markerUpdateThrottle: 1000, // 1 segundo
  locationUpdateThrottle: 5000, // 5 segundos
  tileLoadTimeout: 10000, // 10 segundos
  enableWebGL: true,
  enableRetina: true,
} as const;
