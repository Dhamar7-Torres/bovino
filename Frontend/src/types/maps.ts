// Tipos avanzados para gestión de mapas en la aplicación de gestión ganadera
// Complementa los tipos base definidos en constants/mapDefaults.ts

// Definición de tipos base que también están en mapDefaults.ts
export interface MapCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  timestamp?: number;
}

// Restricciones de viewport
export interface ViewportRestrictions {
  allowedArea?: MapBounds;
  forbiddenAreas?: MapBounds[];
  centerLocked?: boolean;
  zoomLocked?: boolean;
  bearingLocked?: boolean;
}

// Configuración de interacción básica
export interface MapInteractionConfig {
  // Navegación básica
  dragging: boolean;
  touchZoom: boolean;
  scrollWheelZoom: boolean;
  doubleClickZoom: boolean;
  boxZoom: boolean;
  keyboard: boolean;

  // Controles
  zoomControl: boolean;
  attributionControl: boolean;
  scaleControl: boolean;
  fullscreenControl: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: MapCoordinates;
}

// Enums base que complementan los de mapDefaults.ts
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

export enum MapProvider {
  OPENSTREETMAP = "openstreetmap",
  GOOGLE_MAPS = "google_maps",
  MAPBOX = "mapbox",
  ESRI = "esri",
}

export enum MapTheme {
  LIGHT = "light",
  DARK = "dark",
  SATELLITE = "satellite",
  TERRAIN = "terrain",
  HYBRID = "hybrid",
}

// Estados avanzados del mapa
export enum MapStatus {
  LOADING = "loading",
  READY = "ready",
  ERROR = "error",
  OFFLINE = "offline",
  SYNCING = "syncing",
  UPDATING = "updating",
}

// Tipos de capas de mapa
export enum LayerType {
  MARKER = "marker",
  HEATMAP = "heatmap",
  CLUSTER = "cluster",
  POLYGON = "polygon",
  POLYLINE = "polyline",
  CIRCLE = "circle",
  RECTANGLE = "rectangle",
  GEOFENCE = "geofence",
  RASTER = "raster",
  VECTOR = "vector",
  TILE = "tile",
  WMS = "wms",
  OVERLAY = "overlay",
}

// Tipos de análisis geoespacial
export enum SpatialAnalysisType {
  DENSITY = "density",
  HOT_SPOTS = "hot_spots",
  COLD_SPOTS = "cold_spots",
  CLUSTERING = "clustering",
  PROXIMITY = "proximity",
  INTERPOLATION = "interpolation",
  BUFFER = "buffer",
  INTERSECTION = "intersection",
  UNION = "union",
  CONTAINMENT = "containment",
  DISTANCE_MATRIX = "distance_matrix",
  ROUTE_OPTIMIZATION = "route_optimization",
}

// Tipos de geofencing
export enum GeofenceEventType {
  ENTER = "enter",
  EXIT = "exit",
  DWELL = "dwell",
  BREACH = "breach",
}

// Estados de conectividad del mapa
export enum MapConnectivityStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  LIMITED = "limited",
  SYNC_PENDING = "sync_pending",
}

// Tipos de datos de tracking
export enum TrackingDataType {
  REAL_TIME = "real_time",
  HISTORICAL = "historical",
  PREDICTED = "predicted",
  AGGREGATED = "aggregated",
}

// Precisión de ubicación
export enum LocationAccuracy {
  HIGH = "high", // < 5 metros
  MEDIUM = "medium", // 5-15 metros
  LOW = "low", // > 15 metros
  UNKNOWN = "unknown",
}

// Configuración de viewport extendida
export interface MapViewportConfig {
  // Configuración básica
  center: MapCoordinates;
  zoom: number;
  bearing?: number; // rotación en grados
  pitch?: number; // inclinación en grados

  // Límites de navegación
  bounds?: MapBounds;
  maxBounds?: MapBounds;
  minZoom?: number;
  maxZoom?: number;

  // Configuración de transiciones
  enableTransitions: boolean;
  transitionDuration: number; // en milisegundos

  // Configuración de restricciones
  restrictions?: ViewportRestrictions;
}

// Configuración avanzada de mapa
export interface AdvancedMapConfig {
  // Configuración base
  id: string;
  name: string;
  description?: string;

  // Estado y conectividad
  state: MapStatus;
  connectivity: MapConnectivityStatus;

  // Configuración de viewport
  viewport: MapViewportConfig;

  // Configuración de capas
  layers: LayerConfig[];
  activeLayers: string[];

  // Configuración de interacción
  interaction: MapInteractionConfig;

  // Configuración de datos
  dataSource: MapDataSourceConfig;

  // Configuración de rendimiento
  performance: MapPerformanceConfig;

  // Configuración de geolocalización
  geolocation: GeolocationConfig;

  // Configuración de sincronización
  sync: MapSyncConfig;

  // Configuración específica para ganado
  cattleConfig: CattleMapConfig;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
  lastSyncAt?: Date;
}

// Configuración de viewport extendida
export interface MapViewportConfig {
  // Configuración básica
  center: MapCoordinates;
  zoom: number;
  bearing?: number; // rotación en grados
  pitch?: number; // inclinación en grados

  // Límites de navegación
  bounds?: MapBounds;
  maxBounds?: MapBounds;
  minZoom?: number;
  maxZoom?: number;

  // Configuración de transiciones
  enableTransitions: boolean;
  transitionDuration: number; // en milisegundos

  // Configuración de restricciones
  restrictions?: ViewportRestrictions;
}

// Restricciones de viewport
export interface ViewportRestrictions {
  allowedArea?: MapBounds;
  forbiddenAreas?: MapBounds[];
  centerLocked?: boolean;
  zoomLocked?: boolean;
  bearingLocked?: boolean;
}

// Configuración de capas
export interface LayerConfig {
  // Identificación
  id: string;
  name: string;
  type: LayerType;

  // Estado
  visible: boolean;
  interactive: boolean;
  zIndex: number;
  opacity: number;

  // Configuración específica por tipo
  config: LayerSpecificConfig;

  // Filtros y estilos
  filters?: LayerFilter[];
  style?: LayerStyle;

  // Configuración de datos
  dataSource?: string;
  refreshInterval?: number; // en segundos

  // Configuración de rendimiento
  clustering?: ClusterConfig;
  simplification?: SimplificationConfig;

  // Metadatos
  metadata?: Record<string, any>;
}

// Configuración específica por tipo de capa
export type LayerSpecificConfig =
  | MarkerLayerConfig
  | HeatmapLayerConfig
  | PolygonLayerConfig
  | GeofenceLayerConfig
  | TrackingLayerConfig;

// Configuración de capa de marcadores
export interface MarkerLayerConfig {
  type: LayerType.MARKER;

  // Configuración de iconos
  defaultIcon: string;
  iconMapping?: Record<string, string>;
  iconSize: number[];

  // Configuración de clusters
  enableClustering: boolean;
  clusterConfig?: ClusterConfig;

  // Configuración de popup
  enablePopup: boolean;
  popupTemplate?: string;

  // Configuración de tooltip
  enableTooltip: boolean;
  tooltipTemplate?: string;
}

// Configuración de capa de mapa de calor
export interface HeatmapLayerConfig {
  type: LayerType.HEATMAP;

  // Configuración de intensidad
  radius: number;
  intensity: number;

  // Configuración de colores
  gradient: HeatmapGradient;

  // Configuración de datos
  weightProperty?: string;
  maxZoom: number;

  // Configuración de animación
  animated: boolean;
  animationDuration?: number;
}

// Gradiente para mapa de calor
export interface HeatmapGradient {
  [key: number]: string; // 0.0 to 1.0 -> color
}

// Configuración de capa de polígonos
export interface PolygonLayerConfig {
  type: LayerType.POLYGON;

  // Configuración de estilo
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;

  // Configuración de interacción
  highlightOnHover: boolean;
  highlightStyle?: PolygonStyle;

  // Configuración de etiquetas
  showLabels: boolean;
  labelProperty?: string;
  labelStyle?: LabelStyle;
}

// Estilo de polígono
export interface PolygonStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: number[];
}

// Estilo de etiquetas
export interface LabelStyle {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor?: string;
  padding?: number[];
  borderRadius?: number;
}

// Configuración de geofencing
export interface GeofenceLayerConfig {
  type: LayerType.GEOFENCE;

  // Configuración de alertas
  enableAlerts: boolean;
  alertEvents: GeofenceEventType[];

  // Configuración de notificaciones
  notificationConfig?: GeofenceNotificationConfig;

  // Configuración visual
  activeStyle: PolygonStyle;
  inactiveStyle: PolygonStyle;
  breachStyle: PolygonStyle;
}

// Configuración de notificaciones de geofence
export interface GeofenceNotificationConfig {
  channels: ("email" | "sms" | "push" | "webhook")[];
  recipients: string[];
  debounceTime: number; // segundos
  template?: string;
}

// Configuración de capa de tracking
export interface TrackingLayerConfig {
  type: LayerType.MARKER | LayerType.POLYLINE;

  // Configuración de tiempo real
  realTimeUpdates: boolean;
  updateInterval: number; // segundos

  // Configuración de historial
  showHistory: boolean;
  historyDuration: number; // horas
  historyStyle: PolylineStyle;

  // Configuración de predicción
  showPrediction: boolean;
  predictionDuration: number; // minutos
  predictionStyle: PolylineStyle;

  // Configuración de animación
  animateMovement: boolean;
  animationSpeed: number;
}

// Estilo de polilínea
export interface PolylineStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: number[];
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
}

// Configuración de clustering
export interface ClusterConfig {
  enabled: boolean;
  radius: number;
  maxZoom: number;
  minPoints: number;

  // Configuración visual
  showCoverageOnHover: boolean;
  iconSize: number[];
  iconColorMapping?: Record<number, string>;

  // Configuración de comportamiento
  spiderfyOnMaxZoom: boolean;
  zoomToBoundsOnClick: boolean;
  removeOutsideVisibleBounds: boolean;
}

// Configuración de simplificación
export interface SimplificationConfig {
  enabled: boolean;
  tolerance: number;
  highQuality: boolean;
  adaptiveThreshold: boolean;
}

// Filtros de capa
export interface LayerFilter {
  field: string;
  operator:
    | "="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "in"
    | "not_in"
    | "contains"
    | "starts_with";
  value: any;
  caseSensitive?: boolean;
}

// Estilo general de capa
export interface LayerStyle {
  // Estilos condicionales
  conditionalStyles?: ConditionalStyle[];

  // Configuración de zoom
  minZoomVisibility?: number;
  maxZoomVisibility?: number;

  // Configuración de selección
  selectable: boolean;
  selectedStyle?: any;

  // Configuración de hover
  hoverable: boolean;
  hoverStyle?: any;
}

// Estilo condicional
export interface ConditionalStyle {
  condition: LayerFilter;
  style: any;
  priority: number;
}

// Configuración de interacción extendida
export interface MapInteractionConfig {
  // Navegación básica
  dragging: boolean;
  touchZoom: boolean;
  scrollWheelZoom: boolean;
  doubleClickZoom: boolean;
  boxZoom: boolean;
  keyboard: boolean;

  // Controles
  zoomControl: boolean;
  attributionControl: boolean;
  scaleControl: boolean;
  fullscreenControl: boolean;

  // Selección
  enableSelection: boolean;
  selectionMode: "single" | "multiple" | "rectangle" | "polygon";

  // Medición
  enableMeasurement: boolean;
  measurementUnits: "metric" | "imperial";

  // Dibujo
  enableDrawing: boolean;
  drawingTools: DrawingTool[];

  // Edición
  enableEditing: boolean;
  editableFeatures: string[];

  // Configuración de cursor
  cursorConfig: CursorConfig;
}

// Herramientas de dibujo
export enum DrawingTool {
  MARKER = "marker",
  POLYLINE = "polyline",
  POLYGON = "polygon",
  RECTANGLE = "rectangle",
  CIRCLE = "circle",
  TEXT = "text",
}

// Configuración de cursor
export interface CursorConfig {
  default: string;
  dragging: string;
  crosshair: string;
  drawing: string;
  measuring: string;
}

// Configuración de fuente de datos
export interface MapDataSourceConfig {
  // Fuentes principales
  primarySource: DataSource;
  fallbackSources?: DataSource[];

  // Configuración de cache
  cacheConfig: CacheConfig;

  // Configuración de sincronización
  syncConfig: SyncConfig;

  // Configuración de calidad de datos
  dataQuality: DataQualityConfig;
}

// Fuente de datos
export interface DataSource {
  type: "api" | "websocket" | "file" | "database" | "cache";
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  authentication?: AuthConfig;
  timeout?: number;
  retryConfig?: RetryConfig;
}

// Configuración de autenticación
export interface AuthConfig {
  type: "none" | "basic" | "bearer" | "api_key" | "oauth";
  credentials?: Record<string, string>;
}

// Configuración de reintentos
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milisegundos
  backoffMultiplier: number;
  maxRetryDelay: number;
}

// Configuración de cache
export interface CacheConfig {
  enabled: boolean;
  strategy: "memory" | "localStorage" | "indexedDB" | "service_worker";
  maxSize: number; // en MB
  ttl: number; // tiempo de vida en segundos

  // Configuración de invalidación
  invalidationRules: CacheInvalidationRule[];

  // Configuración de precarga
  preloadConfig?: PreloadConfig;
}

// Reglas de invalidación de cache
export interface CacheInvalidationRule {
  trigger: "time" | "data_change" | "user_action" | "system_event";
  condition?: any;
  action: "invalidate" | "refresh" | "partial_update";
}

// Configuración de precarga
export interface PreloadConfig {
  enabled: boolean;
  areas: MapBounds[];
  zoomLevels: number[];
  priority: "high" | "medium" | "low";
}

// Configuración de sincronización
export interface SyncConfig {
  enabled: boolean;
  mode: "manual" | "automatic" | "scheduled";
  interval?: number; // segundos para modo automático
  schedule?: string; // cron expression para modo programado

  // Configuración de conflictos
  conflictResolution:
    | "server_wins"
    | "client_wins"
    | "timestamp"
    | "user_choice";

  // Configuración de banderas
  enableOptimisticSync: boolean;
  enableDeltaSync: boolean;
  enableCompressionSync: boolean;
}

// Configuración de calidad de datos
export interface DataQualityConfig {
  // Validación de coordenadas
  validateCoordinates: boolean;
  coordinateBounds?: MapBounds;

  // Filtrado de precisión
  minAccuracy?: number; // metros
  maxAccuracy?: number;

  // Filtrado temporal
  maxAge?: number; // segundos

  // Filtrado de duplicados
  enableDeduplication: boolean;
  deduplicationThreshold?: number; // metros
}

// Configuración de rendimiento
export interface MapPerformanceConfig {
  // Configuración de renderizado
  renderingOptimization: RenderingOptimization;

  // Configuración de memoria
  memoryManagement: MemoryManagementConfig;

  // Configuración de red
  networkOptimization: NetworkOptimizationConfig;

  // Configuración de batching
  batchingConfig: BatchingConfig;
}

// Optimización de renderizado
export interface RenderingOptimization {
  enableVirtualization: boolean;
  maxVisibleFeatures: number;
  levelOfDetail: boolean;
  frustumCulling: boolean;
  occlusion: boolean;

  // Configuración de FPS
  targetFPS: number;
  adaptiveQuality: boolean;
}

// Configuración de gestión de memoria
export interface MemoryManagementConfig {
  maxMemoryUsage: number; // MB
  enableGarbageCollection: boolean;
  gcThreshold: number; // porcentaje de uso de memoria

  // Configuración de pooling
  enableObjectPooling: boolean;
  poolSizes: Record<string, number>;
}

// Optimización de red
export interface NetworkOptimizationConfig {
  enableCompression: boolean;
  compressionLevel: number;
  enableCDN: boolean;
  cdnUrls?: string[];

  // Configuración de streaming
  enableStreaming: boolean;
  chunkSize: number; // bytes

  // Configuración de prioridades
  requestPriorities: Record<string, number>;
}

// Configuración de batching
export interface BatchingConfig {
  enableRequestBatching: boolean;
  maxBatchSize: number;
  batchTimeout: number; // milisegundos

  enableUpdateBatching: boolean;
  updateBatchSize: number;
  updateBatchTimeout: number;
}

// Configuración de geolocalización extendida
export interface GeolocationConfig {
  // Configuración básica
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;

  // Configuración de seguimiento
  enableTracking: boolean;
  trackingInterval: number; // milisegundos

  // Configuración de filtrado
  enableFiltering: boolean;
  filterConfig: LocationFilterConfig;

  // Configuración de predicción
  enablePrediction: boolean;
  predictionConfig: LocationPredictionConfig;

  // Configuración de fallback
  enableFallback: boolean;
  fallbackMethods: LocationFallbackMethod[];
}

// Configuración de filtrado de ubicación
export interface LocationFilterConfig {
  minAccuracy: number; // metros
  maxSpeed: number; // m/s
  minDistance: number; // metros mínimos entre puntos
  kalmanFilter: boolean;
  outlierDetection: boolean;
}

// Configuración de predicción de ubicación
export interface LocationPredictionConfig {
  algorithm: "linear" | "kalman" | "particle_filter";
  predictionWindow: number; // segundos
  confidence: number; // 0-1
}

// Métodos de fallback para ubicación
export enum LocationFallbackMethod {
  IP_GEOLOCATION = "ip_geolocation",
  CELL_TOWER = "cell_tower",
  WIFI = "wifi",
  MANUAL_INPUT = "manual_input",
  LAST_KNOWN = "last_known",
}

// Configuración de sincronización de mapa
export interface MapSyncConfig {
  // Configuración general
  enabled: boolean;
  syncOnStartup: boolean;
  syncOnBackground: boolean;

  // Configuración de datos
  syncLayers: string[];
  syncSettings: boolean;
  syncUserData: boolean;

  // Configuración de conflictos
  conflictStrategy: SyncConflictStrategy;

  // Configuración de red
  networkStrategy: NetworkStrategy;

  // Configuración de notificaciones
  notifyOnSync: boolean;
  notifyOnConflict: boolean;
}

// Estrategias de resolución de conflictos
export enum SyncConflictStrategy {
  SERVER_WINS = "server_wins",
  CLIENT_WINS = "client_wins",
  MERGE = "merge",
  ASK_USER = "ask_user",
  TIMESTAMP = "timestamp",
}

// Estrategias de red
export enum NetworkStrategy {
  WIFI_ONLY = "wifi_only",
  CELLULAR_AND_WIFI = "cellular_and_wifi",
  OFFLINE_FIRST = "offline_first",
  ONLINE_FIRST = "online_first",
}

// Configuración específica para ganado
export interface CattleMapConfig {
  // Configuración de visualización
  showAnimalPositions: boolean;
  showAnimalHistory: boolean;
  showAnimalPredictions: boolean;

  // Configuración de agrupación
  groupByPasture: boolean;
  groupByHerd: boolean;
  groupByHealthStatus: boolean;

  // Configuración de eventos
  showVaccinations: boolean;
  showIllnesses: boolean;
  showBreeding: boolean;
  showMovements: boolean;

  // Configuración de análisis
  enableHealthAnalysis: boolean;
  enableMovementAnalysis: boolean;
  enablePastureAnalysis: boolean;

  // Configuración de alertas
  enableProximityAlerts: boolean;
  enableHealthAlerts: boolean;
  enableMovementAlerts: boolean;

  // Configuración de geofencing
  pastureGeofences: GeofenceConfig[];
  quarantineZones: GeofenceConfig[];
  restrictedAreas: GeofenceConfig[];
}

// Configuración de geofence
export interface GeofenceConfig {
  id: string;
  name: string;
  description?: string;

  // Geometría
  geometry: GeofenceGeometry;

  // Configuración de eventos
  events: GeofenceEventType[];

  // Configuración de animales
  applicableAnimals: string[]; // IDs de animales o 'all'

  // Configuración de horarios
  schedule?: GeofenceSchedule;

  // Estado
  isActive: boolean;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Geometría de geofence
export type GeofenceGeometry =
  | CircleGeometry
  | PolygonGeometry
  | RectangleGeometry;

// Geometría circular
export interface CircleGeometry {
  type: "circle";
  center: MapCoordinates;
  radius: number; // metros
}

// Geometría poligonal
export interface PolygonGeometry {
  type: "polygon";
  coordinates: MapCoordinates[][];
}

// Geometría rectangular
export interface RectangleGeometry {
  type: "rectangle";
  bounds: MapBounds;
}

// Programación de geofence
export interface GeofenceSchedule {
  timezone: string;
  rules: ScheduleRule[];
}

// Regla de programación
export interface ScheduleRule {
  days: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isActive: boolean;
}

// Estado completo del mapa
export interface MapCompleteState {
  // Configuración activa
  config: AdvancedMapConfig;

  // Estado de conexión
  connectivity: MapConnectivityStatus;

  // Viewport actual
  viewport: MapViewportConfig;

  // Capas activas
  activeLayers: Map<string, LayerConfig>;

  // Datos cargados
  loadedData: Map<string, any>;

  // Estado de selección
  selectedFeatures: SelectedFeature[];

  // Estado de interacción
  interactionState: InteractionState;

  // Estado de sincronización
  syncState: SyncState;

  // Errores y alertas
  errors: MapError[];
  alerts: MapAlert[];

  // Métricas de rendimiento
  performance: PerformanceMetrics;
}

// Característica seleccionada
export interface SelectedFeature {
  layerId: string;
  featureId: string;
  geometry: any;
  properties: Record<string, any>;
  selectedAt: Date;
}

// Estado de interacción
export interface InteractionState {
  mode: "view" | "select" | "draw" | "edit" | "measure";
  tool?: DrawingTool;
  isDrawing: boolean;
  isEditing: boolean;
  isMeasuring: boolean;
  currentDrawing?: any;
  measurements: Measurement[];
}

// Medición
export interface Measurement {
  id: string;
  type: "distance" | "area" | "bearing";
  value: number;
  unit: string;
  geometry: any;
  createdAt: Date;
}

// Estado de sincronización
export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  syncErrors: SyncError[];
}

// Error de sincronización
export interface SyncError {
  id: string;
  type: "network" | "data" | "conflict" | "permission";
  message: string;
  data?: any;
  timestamp: Date;
  resolved: boolean;
}

// Error de mapa
export interface MapError {
  id: string;
  type: "rendering" | "data" | "network" | "permission" | "performance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details?: any;
  timestamp: Date;
  resolved: boolean;
}

// Alerta de mapa
export interface MapAlert {
  id: string;
  type: "geofence" | "proximity" | "performance" | "data_quality";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  acknowledged: boolean;
}

// Métricas de rendimiento
export interface PerformanceMetrics {
  // Renderizado
  fps: number;
  frameTime: number; // milisegundos
  renderTime: number;

  // Memoria
  memoryUsage: number; // MB
  cacheHitRate: number; // porcentaje

  // Red
  networkLatency: number; // milisegundos
  bandwidth: number; // bytes/segundo

  // Datos
  featuresRendered: number;
  layersActive: number;

  // Actualización
  lastUpdated: Date;
}

// Análisis geoespacial
export interface SpatialAnalysisRequest {
  id: string;
  type: SpatialAnalysisType;

  // Datos de entrada
  inputLayers: string[];
  inputFeatures?: any[];

  // Parámetros
  parameters: Record<string, any>;

  // Configuración de salida
  outputConfig: AnalysisOutputConfig;

  // Estado
  status: "pending" | "running" | "completed" | "failed";
  progress?: number; // 0-100

  // Resultados
  result?: AnalysisResult;
  error?: string;

  // Metadatos
  createdAt: Date;
  completedAt?: Date;
}

// Configuración de salida de análisis
export interface AnalysisOutputConfig {
  format: "geojson" | "shapefile" | "kml" | "layer";
  layerName?: string;
  style?: LayerStyle;
  addToMap: boolean;
}

// Resultado de análisis
export interface AnalysisResult {
  data: any;
  metadata: AnalysisMetadata;
  visualization?: VisualizationConfig;
}

// Metadatos de análisis
export interface AnalysisMetadata {
  processingTime: number; // milisegundos
  inputFeatureCount: number;
  outputFeatureCount: number;
  parameters: Record<string, any>;
  statistics?: Record<string, number>;
}

// Configuración de visualización
export interface VisualizationConfig {
  type: "choropleth" | "graduated_symbols" | "heatmap" | "contour";
  colorScheme: string;
  classification:
    | "equal_interval"
    | "quantile"
    | "natural_breaks"
    | "standard_deviation";
  classes: number;
  style: any;
}

// Configuración de datos offline
export interface OfflineMapConfig {
  // Configuración general
  enabled: boolean;
  storageQuota: number; // MB

  // Áreas descargadas
  downloadedAreas: OfflineArea[];

  // Configuración de descarga
  downloadConfig: OfflineDownloadConfig;

  // Configuración de sincronización
  syncConfig: OfflineSyncConfig;
}

// Área offline
export interface OfflineArea {
  id: string;
  name: string;
  bounds: MapBounds;
  zoomLevels: number[];

  // Estado
  status: "downloading" | "available" | "expired" | "error";
  progress?: number; // 0-100

  // Información de almacenamiento
  sizeEstimate: number; // MB
  downloadedSize: number; // MB

  // Fechas
  downloadedAt?: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
}

// Configuración de descarga offline
export interface OfflineDownloadConfig {
  maxConcurrentDownloads: number;
  retryAttempts: number;
  chunkSize: number; // tiles por chunk

  // Configuración de red
  wifiOnly: boolean;
  pauseOnLowBattery: boolean;

  // Configuración de calidad
  imageQuality: "low" | "medium" | "high";
  compression: boolean;
}

// Configuración de sincronización offline
export interface OfflineSyncConfig {
  autoSync: boolean;
  syncOnWifi: boolean;
  syncInterval: number; // horas

  // Configuración de datos
  syncUserData: boolean;
  syncSettings: boolean;
  syncCache: boolean;

  // Configuración de conflictos
  conflictResolution: SyncConflictStrategy;
}

// Eventos de mapa
export interface MapEvent {
  type: string;
  timestamp: Date;
  data?: any;
}

// Handlers de eventos de mapa
export interface MapEventHandlers {
  // Eventos de viewport
  onViewportChange?: (viewport: MapViewportConfig) => void;
  onZoomChange?: (zoom: number) => void;
  onCenterChange?: (center: MapCoordinates) => void;

  // Eventos de interacción
  onClick?: (event: MapEvent) => void;
  onDoubleClick?: (event: MapEvent) => void;
  onRightClick?: (event: MapEvent) => void;
  onMouseMove?: (event: MapEvent) => void;

  // Eventos de características
  onFeatureClick?: (feature: any, layer: string) => void;
  onFeatureHover?: (feature: any, layer: string) => void;
  onFeatureSelect?: (features: SelectedFeature[]) => void;

  // Eventos de capas
  onLayerAdd?: (layer: LayerConfig) => void;
  onLayerRemove?: (layerId: string) => void;
  onLayerToggle?: (layerId: string, visible: boolean) => void;

  // Eventos de geofencing
  onGeofenceEnter?: (animalId: string, geofenceId: string) => void;
  onGeofenceExit?: (animalId: string, geofenceId: string) => void;
  onGeofenceBreach?: (animalId: string, geofenceId: string) => void;

  // Eventos de error
  onError?: (error: MapError) => void;
  onAlert?: (alert: MapAlert) => void;

  // Eventos de estado
  onStateChange?: (state: MapCompleteState) => void;
  onConnectivityChange?: (status: MapConnectivityStatus) => void;
}

// Utilidades de mapa
export interface MapUtilities {
  // Cálculos de distancia
  calculateDistance: (coord1: MapCoordinates, coord2: MapCoordinates) => number;
  calculateBearing: (coord1: MapCoordinates, coord2: MapCoordinates) => number;
  calculateArea: (coordinates: MapCoordinates[]) => number;

  // Conversiones
  convertCoordinates: (
    coords: MapCoordinates,
    fromCRS: string,
    toCRS: string
  ) => MapCoordinates;
  convertBounds: (
    bounds: MapBounds,
    fromCRS: string,
    toCRS: string
  ) => MapBounds;

  // Validaciones
  validateCoordinates: (coords: MapCoordinates) => boolean;
  validateBounds: (bounds: MapBounds) => boolean;

  // Formateo
  formatCoordinates: (
    coords: MapCoordinates,
    format: "dd" | "dms" | "utm"
  ) => string;
  formatDistance: (distance: number, unit: "metric" | "imperial") => string;
  formatArea: (area: number, unit: "metric" | "imperial") => string;

  // Análisis espacial básico
  isPointInBounds: (point: MapCoordinates, bounds: MapBounds) => boolean;
  isPointInPolygon: (
    point: MapCoordinates,
    polygon: MapCoordinates[]
  ) => boolean;
  getPolygonCenter: (polygon: MapCoordinates[]) => MapCoordinates;
  getBoundsFromPoints: (points: MapCoordinates[]) => MapBounds;
}

// Tipos auxiliares para facilitar el uso
export type MapLayerFilter = Record<string, any>;
export type MapFeatureCollection = any; // GeoJSON FeatureCollection
export type MapGeometry = any; // GeoJSON Geometry
export type MapEventCallback = (event: MapEvent) => void;
export type LayerDataCallback = (data: any) => void;
