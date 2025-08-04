// URLs y endpoints para la API del sistema de gestión ganadera

// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  VERSION: import.meta.env.VITE_API_VERSION || "v1",

  // Timeout para peticiones HTTP
  TIMEOUT: 30000, // 30 segundos

  // Headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`;
  return `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  CHANGE_PASSWORD: "/auth/change-password",
  PROFILE: "/auth/profile",
} as const;

// Endpoints para gestión de ganado bovino
export const CATTLE_ENDPOINTS = {
  // CRUD básico
  LIST: "/cattle",
  CREATE: "/cattle",
  GET_BY_ID: (id: string) => `/cattle/${id}`,
  UPDATE: (id: string) => `/cattle/${id}`,
  DELETE: (id: string) => `/cattle/${id}`,

  // Búsquedas específicas
  SEARCH: "/cattle/search",
  BY_EAR_TAG: (earTag: string) => `/cattle/ear-tag/${earTag}`,
  BY_TYPE: (type: string) => `/cattle/type/${type}`,
  BY_BREED: (breed: string) => `/cattle/breed/${breed}`,
  BY_GENDER: (gender: string) => `/cattle/gender/${gender}`,
  BY_HEALTH_STATUS: (status: string) => `/cattle/health-status/${status}`,

  // Operaciones especiales
  BULK_UPDATE: "/cattle/bulk-update",
  EXPORT: "/cattle/export",
  IMPORT: "/cattle/import",
  GENEALOGY: (id: string) => `/cattle/${id}/genealogy`,
  OFFSPRING: (id: string) => `/cattle/${id}/offspring`,

  // Estadísticas
  STATS: "/cattle/stats",
  COUNT_BY_TYPE: "/cattle/stats/by-type",
  COUNT_BY_HEALTH: "/cattle/stats/by-health",
  AGE_DISTRIBUTION: "/cattle/stats/age-distribution",
} as const;

// Endpoints para vacunaciones
export const VACCINATION_ENDPOINTS = {
  // CRUD básico
  LIST: "/vaccinations",
  CREATE: "/vaccinations",
  GET_BY_ID: (id: string) => `/vaccinations/${id}`,
  UPDATE: (id: string) => `/vaccinations/${id}`,
  DELETE: (id: string) => `/vaccinations/${id}`,

  // Por animal
  BY_CATTLE: (cattleId: string) => `/vaccinations/cattle/${cattleId}`,
  BY_EAR_TAG: (earTag: string) => `/vaccinations/ear-tag/${earTag}`,

  // Programación
  SCHEDULE: "/vaccinations/schedule",
  UPCOMING: "/vaccinations/upcoming",
  OVERDUE: "/vaccinations/overdue",
  DUE_TODAY: "/vaccinations/due-today",
  DUE_THIS_WEEK: "/vaccinations/due-this-week",

  // Reportes
  HISTORY: "/vaccinations/history",
  COVERAGE: "/vaccinations/coverage",
  BY_VACCINE_TYPE: (type: string) => `/vaccinations/vaccine-type/${type}`,
  BY_DATE_RANGE: "/vaccinations/date-range",

  // Operaciones masivas
  BULK_CREATE: "/vaccinations/bulk-create",
  BULK_UPDATE: "/vaccinations/bulk-update",
  EXPORT: "/vaccinations/export",
} as const;

// Endpoints para enfermedades
export const ILLNESS_ENDPOINTS = {
  // CRUD básico
  LIST: "/illnesses",
  CREATE: "/illnesses",
  GET_BY_ID: (id: string) => `/illnesses/${id}`,
  UPDATE: (id: string) => `/illnesses/${id}`,
  DELETE: (id: string) => `/illnesses/${id}`,

  // Por animal
  BY_CATTLE: (cattleId: string) => `/illnesses/cattle/${cattleId}`,
  BY_EAR_TAG: (earTag: string) => `/illnesses/ear-tag/${earTag}`,

  // Por características
  BY_DISEASE: (disease: string) => `/illnesses/disease/${disease}`,
  BY_SEVERITY: (severity: string) => `/illnesses/severity/${severity}`,
  CONTAGIOUS: "/illnesses/contagious",
  ACTIVE: "/illnesses/active",
  RECOVERED: "/illnesses/recovered",

  // Análisis epidemiológico
  OUTBREAK_ANALYSIS: "/illnesses/outbreak-analysis",
  TRANSMISSION_MAP: "/illnesses/transmission-map",
  RISK_AREAS: "/illnesses/risk-areas",

  // Reportes
  BY_DATE_RANGE: "/illnesses/date-range",
  STATISTICS: "/illnesses/statistics",
  TRENDS: "/illnesses/trends",
  EXPORT: "/illnesses/export",
} as const;

// Endpoints para mapas y geolocalización
export const MAP_ENDPOINTS = {
  // Ubicaciones de ganado
  CATTLE_LOCATIONS: "/maps/cattle-locations",
  CATTLE_BY_AREA: "/maps/cattle-by-area",

  // Ubicaciones de eventos
  VACCINATION_LOCATIONS: "/maps/vaccination-locations",
  ILLNESS_LOCATIONS: "/maps/illness-locations",

  // Análisis geoespacial
  DENSITY_MAP: "/maps/density",
  HEAT_MAP: "/maps/heat-map",
  CLUSTER_ANALYSIS: "/maps/clusters",

  // Geocodificación
  GEOCODE: "/maps/geocode",
  REVERSE_GEOCODE: "/maps/reverse-geocode",

  // Zonas y áreas
  RISK_ZONES: "/maps/risk-zones",
  PASTURE_AREAS: "/maps/pasture-areas",
  BOUNDARIES: "/maps/boundaries",
} as const;

// Endpoints para reportes
export const REPORT_ENDPOINTS = {
  // Reportes de salud
  HEALTH_OVERVIEW: "/reports/health/overview",
  HEALTH_TRENDS: "/reports/health/trends",
  DISEASE_ANALYSIS: "/reports/health/disease-analysis",

  // Reportes de vacunación
  VACCINATION_COVERAGE: "/reports/vaccinations/coverage",
  VACCINATION_SCHEDULE: "/reports/vaccinations/schedule",
  VACCINATION_EFFICACY: "/reports/vaccinations/efficacy",

  // Reportes reproductivos
  BREEDING_REPORT: "/reports/breeding/overview",
  PREGNANCY_STATUS: "/reports/breeding/pregnancy",
  BIRTH_RECORDS: "/reports/breeding/births",

  // Reportes financieros
  VETERINARY_COSTS: "/reports/financial/veterinary-costs",
  MEDICATION_EXPENSES: "/reports/financial/medications",
  ROI_ANALYSIS: "/reports/financial/roi",

  // Exportar reportes
  EXPORT_PDF: (reportType: string) => `/reports/export/pdf/${reportType}`,
  EXPORT_EXCEL: (reportType: string) => `/reports/export/excel/${reportType}`,
  EXPORT_CSV: (reportType: string) => `/reports/export/csv/${reportType}`,
} as const;

// Endpoints para archivos y multimedia
export const FILE_ENDPOINTS = {
  UPLOAD: "/files/upload",
  UPLOAD_MULTIPLE: "/files/upload-multiple",
  DELETE: (fileId: string) => `/files/${fileId}`,
  GET_URL: (fileId: string) => `/files/${fileId}/url`,

  // Imágenes de ganado
  CATTLE_PHOTOS: "/files/cattle-photos",
  CATTLE_PHOTO_UPLOAD: (cattleId: string) => `/files/cattle/${cattleId}/photos`,

  // Documentos veterinarios
  VETERINARY_DOCS: "/files/veterinary-docs",
  VACCINATION_CERTIFICATES: "/files/vaccination-certificates",
  HEALTH_CERTIFICATES: "/files/health-certificates",
} as const;

// Endpoints para notificaciones
export const NOTIFICATION_ENDPOINTS = {
  LIST: "/notifications",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/mark-all-read",
  DELETE: (id: string) => `/notifications/${id}`,
  SETTINGS: "/notifications/settings",

  // Tipos específicos
  VACCINATION_REMINDERS: "/notifications/vaccination-reminders",
  HEALTH_ALERTS: "/notifications/health-alerts",
  SYSTEM_NOTIFICATIONS: "/notifications/system",
} as const;

// Endpoints para configuración del usuario
export const USER_ENDPOINTS = {
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
  PREFERENCES: "/user/preferences",
  FARM_SETTINGS: "/user/farm-settings",
  SUBSCRIPTION: "/user/subscription",
  USAGE_STATS: "/user/usage-stats",
} as const;

// URLs externas y servicios de terceros
export const EXTERNAL_URLS = {
  // Servicios de mapas
  OPENSTREETMAP_TILE: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  OPENSTREETMAP_ATTRIBUTION: "© OpenStreetMap contributors",

  // APIs de geolocalización
  NOMINATIM_API: "https://nominatim.openstreetmap.org",

  // Servicios de clima (opcional)
  WEATHER_API: "https://api.openweathermap.org/data/2.5",

  // Documentación y ayuda
  DOCUMENTATION: "https://docs.bovinecare.com",
  SUPPORT: "https://support.bovinecare.com",
  TERMS_OF_SERVICE: "https://bovinecare.com/terms",
  PRIVACY_POLICY: "https://bovinecare.com/privacy",
} as const;

// Parámetros de consulta comunes
export const QUERY_PARAMS = {
  // Paginación
  PAGE: "page",
  LIMIT: "limit",
  OFFSET: "offset",

  // Ordenamiento
  SORT_BY: "sortBy",
  SORT_ORDER: "sortOrder",

  // Filtros
  SEARCH: "search",
  FILTER: "filter",
  DATE_FROM: "dateFrom",
  DATE_TO: "dateTo",

  // Ubicación
  LATITUDE: "lat",
  LONGITUDE: "lng",
  RADIUS: "radius",

  // Formato de respuesta
  FORMAT: "format",
  INCLUDE: "include",
  EXCLUDE: "exclude",
} as const;

// Funciones helper para construir URLs con parámetros
export const buildUrlWithParams = (
  url: string,
  params: Record<string, any>
): string => {
  const urlObj = new URL(url, API_CONFIG.BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      urlObj.searchParams.append(key, String(value));
    }
  });

  return urlObj.toString();
};

// Función para construir URLs de API completas
export const getApiUrl = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  const fullUrl = buildApiUrl(endpoint);
  return params ? buildUrlWithParams(fullUrl, params) : fullUrl;
};
