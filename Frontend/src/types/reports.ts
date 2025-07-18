// Tipos para sistema de reportes, gráficas, estadísticas y datos exportables
// Incluye análisis de salud, financieros, productivos y operativos

import { BaseEntity, Coordinates } from "./common";

// Interfaz principal del reporte
export interface Report extends BaseEntity {
  // Información básica
  title: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;

  // Configuración del reporte
  config: ReportConfig;

  // Filtros aplicados
  filters: ReportFilter[];

  // Período de datos
  period: ReportPeriod;

  // Datos del reporte
  data: ReportData;

  // Visualizaciones
  visualizations: Visualization[];

  // Estadísticas resumen
  summary: ReportSummary;

  // Análisis y insights
  analysis: ReportAnalysis;

  // Metadatos y configuración
  metadata: ReportMetadata;

  // Estado del reporte
  status: ReportStatus;

  // Programación automática
  schedule?: ReportSchedule;
}

// Configuración del reporte
export interface ReportConfig {
  // Formato de salida
  outputFormat: ExportFormat[];

  // Configuración de visualización
  includeCharts: boolean;
  includeStatistics: boolean;
  includeMap: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;

  // Configuración de página
  pageSettings: PageSettings;

  // Configuración de marca
  branding: BrandingConfig;

  // Configuración de calidad de datos
  dataQuality: DataQualityConfig;

  // Configuración de comparación
  comparison: ComparisonConfig;
}

// Período del reporte
export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  granularity: TimeGranularity;
  timeZone: string;

  // Períodos de comparación
  comparisonPeriods?: ComparisonPeriod[];

  // Configuración específica
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  businessHoursOnly?: boolean;
}

// Período de comparación
export interface ComparisonPeriod {
  label: string;
  startDate: Date;
  endDate: Date;
  type: ComparisonType;
}

// Filtro del reporte
export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label: string;
  isRequired: boolean;
  validation?: FilterValidation;
}

// Validación de filtro
export interface FilterValidation {
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
  pattern?: string;
  customValidator?: string;
}

// Datos del reporte
export interface ReportData {
  // Datos principales
  primaryData: DataSet[];

  // Datos de comparación
  comparisonData?: DataSet[];

  // Datos agregados
  aggregatedData: AggregatedData;

  // Datos geoespaciales
  geospatialData?: GeospatialData[];

  // Métricas calculadas
  calculatedMetrics: CalculatedMetric[];

  // Tendencias
  trends: TrendData[];

  // Proyecciones
  forecasts?: ForecastData[];
}

// Conjunto de datos
export interface DataSet {
  id: string;
  name: string;
  description?: string;
  source: DataSource;

  // Datos estructurados
  columns: DataColumn[];
  rows: DataRow[];

  // Metadatos
  recordCount: number;
  lastUpdated: Date;
  quality: DataQualityMetrics;
}

// Columna de datos
export interface DataColumn {
  name: string;
  displayName: string;
  type: DataType;
  format?: string;
  unit?: string;
  description?: string;

  // Configuración de visualización
  isVisible: boolean;
  sortable: boolean;
  filterable: boolean;
  aggregatable: boolean;

  // Validación
  nullable: boolean;
  minValue?: number;
  maxValue?: number;
}

// Fila de datos
export interface DataRow {
  cells: DataCell[];
  metadata?: RowMetadata;
}

// Celda de datos
export interface DataCell {
  value: any;
  formattedValue?: string;

  // Indicadores visuales
  color?: string;
  backgroundColor?: string;
  icon?: string;

  // Metadatos
  tooltip?: string;
  confidence?: number;
  isCalculated: boolean;

  // Enlaces y acciones
  link?: string;
  actionable?: boolean;
}

// Metadatos de fila
export interface RowMetadata {
  id: string;
  tags: string[];
  annotations: string[];
  confidence: number;
  dataSource: string;
}

// Datos agregados
export interface AggregatedData {
  // Totales
  totals: Record<string, number>;

  // Promedios
  averages: Record<string, number>;

  // Conteos
  counts: Record<string, number>;

  // Porcentajes
  percentages: Record<string, number>;

  // Rangos
  ranges: Record<string, DataRange>;

  // Distribuciones
  distributions: Record<string, Distribution>;

  // Correlaciones
  correlations?: CorrelationMatrix;
}

// Rango de datos
export interface DataRange {
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
  standardDeviation: number;
  variance: number;
}

// Distribución de datos
export interface Distribution {
  bins: DistributionBin[];
  type: DistributionType;
  parameters: Record<string, number>;
}

// Bin de distribución
export interface DistributionBin {
  start: number;
  end: number;
  count: number;
  percentage: number;
}

// Matriz de correlación
export interface CorrelationMatrix {
  variables: string[];
  correlations: number[][];
  significance: number[][];
}

// Datos geoespaciales
export interface GeospatialData {
  id: string;
  coordinates: Coordinates;

  // Datos asociados
  properties: Record<string, any>;

  // Geometría
  geometry?: GeoGeometry;

  // Clustering
  clusterId?: string;
  clusterSize?: number;

  // Análisis espacial
  density?: number;
  proximity?: ProximityData;
}

// Geometría geoespacial
export interface GeoGeometry {
  type: GeometryType;
  coordinates: number[] | number[][] | number[][][];
  properties?: Record<string, any>;
}

// Datos de proximidad
export interface ProximityData {
  nearestNeighbors: string[];
  distances: number[];
  spatialIndex: number;
}

// Métrica calculada
export interface CalculatedMetric {
  name: string;
  displayName: string;
  value: number;
  unit?: string;

  // Cálculo
  formula: string;
  inputs: string[];

  // Comparación
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: TrendDirection;

  // Benchmarks
  target?: number;
  benchmark?: number;

  // Visualización
  format: MetricFormat;
  thresholds: MetricThreshold[];
}

// Umbral de métrica
export interface MetricThreshold {
  value: number;
  color: string;
  label: string;
  type: ThresholdType;
}

// Datos de tendencia
export interface TrendData {
  metric: string;
  dataPoints: TrendPoint[];

  // Análisis de tendencia
  direction: TrendDirection;
  strength: TrendStrength;
  seasonality: SeasonalityData;

  // Modelos estadísticos
  regression?: RegressionModel;
  movingAverage?: MovingAverageData;

  // Detección de anomalías
  anomalies: AnomalyPoint[];

  // Proyecciones
  forecast?: ForecastModel;
}

// Punto de tendencia
export interface TrendPoint {
  timestamp: Date;
  value: number;

  // Metadatos
  confidence?: number;
  isAnomaly?: boolean;
  isProjected?: boolean;

  // Componentes de serie temporal
  trend?: number;
  seasonal?: number;
  residual?: number;
}

// Datos de estacionalidad
export interface SeasonalityData {
  hasSeasonality: boolean;
  seasonalPeriod?: number;
  seasonalStrength?: number;
  seasonalPattern?: SeasonalPattern[];
}

// Patrón estacional
export interface SeasonalPattern {
  period: string;
  amplitude: number;
  phase: number;
  significance: number;
}

// Modelo de regresión
export interface RegressionModel {
  type: RegressionType;
  coefficients: number[];
  rSquared: number;
  adjustedRSquared: number;
  pValue: number;
  standardError: number;
  confidence: number;
}

// Datos de media móvil
export interface MovingAverageData {
  window: number;
  type: MovingAverageType;
  values: number[];
  smoothingFactor?: number;
}

// Punto de anomalía
export interface AnomalyPoint {
  timestamp: Date;
  actualValue: number;
  expectedValue: number;
  anomalyScore: number;
  type: AnomalyType;
  description?: string;
}

// Datos de pronóstico
export interface ForecastData {
  metric: string;
  model: ForecastModel;
  projections: ForecastProjection[];

  // Métricas de calidad
  accuracy: ForecastAccuracy;

  // Configuración
  horizon: number;
  confidenceLevel: number;
}

// Modelo de pronóstico
export interface ForecastModel {
  type: ForecastModelType;
  parameters: Record<string, any>;
  trainingPeriod: ReportPeriod;

  // Métricas de rendimiento
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
}

// Proyección de pronóstico
export interface ForecastProjection {
  timestamp: Date;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

// Precisión del pronóstico
export interface ForecastAccuracy {
  overall: number;
  byPeriod: Record<string, number>;
  reliability: number;
  stability: number;
}

// Visualización
export interface Visualization {
  id: string;
  type: VisualizationType;
  title: string;
  description?: string;

  // Configuración
  config: VisualizationConfig;

  // Datos
  dataSource: string;
  data: VisualizationData;

  // Interactividad
  interactions: VisualizationInteraction[];

  // Exportación
  exportable: boolean;
  formats: ExportFormat[];
}

// Configuración de visualización
export interface VisualizationConfig {
  // Dimensiones
  width: number;
  height: number;
  responsive: boolean;

  // Colores y estilo
  colorScheme: ColorScheme;
  theme: VisualizationTheme;

  // Ejes y etiquetas
  axes: AxisConfig[];
  labels: LabelConfig;
  legend: LegendConfig;

  // Animaciones
  animated: boolean;
  animationDuration: number;

  // Configuración específica por tipo
  specificConfig: Record<string, any>;
}

// Esquema de colores
export interface ColorScheme {
  type: ColorSchemeType;
  colors: string[];
  gradients?: GradientConfig[];
}

// Configuración de gradiente
export interface GradientConfig {
  start: string;
  end: string;
  direction: GradientDirection;
}

// Configuración de eje
export interface AxisConfig {
  name: string;
  position: AxisPosition;
  scale: ScaleType;

  // Formato
  format?: string;
  unit?: string;

  // Rango
  min?: number;
  max?: number;
  autoScale: boolean;

  // Estilo
  visible: boolean;
  gridLines: boolean;
  tickMarks: boolean;
}

// Configuración de etiquetas
export interface LabelConfig {
  showDataLabels: boolean;
  labelFormat: string;
  labelPosition: LabelPosition;

  // Títulos
  title?: string;
  subtitle?: string;

  // Fuente
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
}

// Configuración de leyenda
export interface LegendConfig {
  visible: boolean;
  position: LegendPosition;
  orientation: LegendOrientation;

  // Estilo
  backgroundColor?: string;
  borderColor?: string;
  fontColor: string;
}

// Datos de visualización
export interface VisualizationData {
  series: DataSeries[];
  categories?: string[];

  // Metadatos
  total?: number;
  filtered?: number;

  // Anotaciones
  annotations?: VisualizationAnnotation[];

  // Referencias
  references?: VisualizationReference[];
}

// Serie de datos
export interface DataSeries {
  name: string;
  data: DataPoint[];

  // Estilo
  color?: string;
  style?: SeriesStyle;

  // Comportamiento
  visible: boolean;
  selectable: boolean;

  // Metadatos
  unit?: string;
  format?: string;
}

// Punto de datos
export interface DataPoint {
  x: any;
  y: number;

  // Metadatos adicionales
  label?: string;
  color?: string;
  size?: number;

  // Información contextual
  tooltip?: string;
  metadata?: Record<string, any>;
}

// Anotación de visualización
export interface VisualizationAnnotation {
  type: AnnotationType;
  position: AnnotationPosition;
  text: string;
  style: AnnotationStyle;
}

// Posición de anotación
export interface AnnotationPosition {
  x?: number;
  y?: number;
  anchor: AnchorPoint;
}

// Estilo de anotación
export interface AnnotationStyle {
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
}

// Referencia de visualización
export interface VisualizationReference {
  type: ReferenceType;
  value: number;
  label: string;
  style: ReferenceStyle;
}

// Estilo de referencia
export interface ReferenceStyle {
  lineColor: string;
  lineStyle: LineStyle;
  lineWidth: number;
  labelPosition: LabelPosition;
}

// Interacción de visualización
export interface VisualizationInteraction {
  type: InteractionType;
  trigger: InteractionTrigger;
  action: InteractionAction;
  enabled: boolean;
}

// Acción de interacción
export interface InteractionAction {
  type: ActionType;
  target?: string;
  parameters?: Record<string, any>;
}

// Resumen del reporte
export interface ReportSummary {
  // Métricas clave
  keyMetrics: KeyMetric[];

  // Hallazgos principales
  keyFindings: Finding[];

  // Tendencias importantes
  significantTrends: SignificantTrend[];

  // Alertas y advertencias
  alerts: ReportAlert[];

  // Recomendaciones
  recommendations: Recommendation[];

  // Resumen ejecutivo
  executiveSummary?: string;
}

// Métrica clave
export interface KeyMetric {
  name: string;
  value: number;
  unit?: string;

  // Comparación
  previousValue?: number;
  change: number;
  changeType: ChangeType;

  // Significancia
  isSignificant: boolean;
  significance: number;

  // Visualización
  displayFormat: MetricDisplayFormat;
  color: string;
}

// Hallazgo
export interface Finding {
  title: string;
  description: string;
  importance: ImportanceLevel;

  // Evidencia
  evidence: Evidence[];

  // Implicaciones
  implications: string[];

  // Acciones sugeridas
  suggestedActions: string[];
}

// Evidencia
export interface Evidence {
  type: EvidenceType;
  description: string;
  data: any;
  confidence: number;
}

// Tendencia significativa
export interface SignificantTrend {
  metric: string;
  direction: TrendDirection;
  strength: TrendStrength;
  duration: number; // días

  // Estadísticas
  slope: number;
  correlation: number;
  pValue: number;

  // Descripción
  description: string;
  impact: ImpactLevel;
}

// Alerta del reporte
export interface ReportAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;

  // Datos de contexto
  affectedEntities: string[];
  triggeredBy: string;

  // Acciones
  recommendedActions: string[];
  escalationRequired: boolean;
}

// Recomendación
export interface Recommendation {
  title: string;
  description: string;
  priority: RecommendationPriority;

  // Implementación
  implementationSteps: ImplementationStep[];
  estimatedEffort: EffortLevel;
  expectedBenefit: BenefitLevel;

  // Seguimiento
  measurableOutcomes: string[];
  timeframe: string;

  // Categorización
  category: RecommendationCategory;
  applicability: ApplicabilityLevel;
}

// Paso de implementación
export interface ImplementationStep {
  order: number;
  description: string;
  estimatedTime: number; // horas

  // Recursos requeridos
  resources: string[];

  // Dependencias
  dependencies: string[];

  // Criterio de éxito
  successCriteria: string[];
}

// Análisis del reporte
export interface ReportAnalysis {
  // Análisis estadístico
  statisticalAnalysis: StatisticalAnalysis;

  // Análisis de correlación
  correlationAnalysis?: CorrelationAnalysis;

  // Análisis de varianza
  varianceAnalysis?: VarianceAnalysis;

  // Análisis de outliers
  outlierAnalysis?: OutlierAnalysis;

  // Análisis predictivo
  predictiveAnalysis?: PredictiveAnalysis;

  // Análisis de sensibilidad
  sensitivityAnalysis?: SensitivityAnalysis;
}

// Análisis estadístico
export interface StatisticalAnalysis {
  descriptiveStats: DescriptiveStatistics;
  distributionTests: DistributionTest[];
  hypothesisTests: HypothesisTest[];
  confidenceIntervals: ConfidenceInterval[];
}

// Estadísticas descriptivas
export interface DescriptiveStatistics {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  range: number;
  quartiles: [number, number, number];
}

// Test de distribución
export interface DistributionTest {
  test: DistributionTestType;
  statistic: number;
  pValue: number;
  hypothesis: string;
  conclusion: string;
}

// Test de hipótesis
export interface HypothesisTest {
  test: HypothesisTestType;
  nullHypothesis: string;
  alternativeHypothesis: string;
  statistic: number;
  pValue: number;
  alpha: number;
  result: TestResult;
  interpretation: string;
}

// Intervalo de confianza
export interface ConfidenceInterval {
  parameter: string;
  level: number;
  lowerBound: number;
  upperBound: number;
  margin: number;
}

// Análisis de correlación
export interface CorrelationAnalysis {
  method: CorrelationMethod;
  correlations: CorrelationResult[];
  significantCorrelations: CorrelationResult[];
  networkAnalysis?: NetworkAnalysisResult;
}

// Resultado de correlación
export interface CorrelationResult {
  variable1: string;
  variable2: string;
  coefficient: number;
  pValue: number;
  significance: SignificanceLevel;
  interpretation: string;
}

// Resultado de análisis de red
export interface NetworkAnalysisResult {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metrics: NetworkMetrics;
}

// Nodo de red
export interface NetworkNode {
  id: string;
  label: string;
  centrality: number;
  clustering: number;
  degree: number;
}

// Arista de red
export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  type: EdgeType;
}

// Métricas de red
export interface NetworkMetrics {
  density: number;
  transitivity: number;
  modularity: number;
  diameter: number;
  averagePathLength: number;
}

// Análisis de varianza
export interface VarianceAnalysis {
  method: VarianceAnalysisMethod;
  factors: VarianceFactor[];
  interactions: VarianceInteraction[];
  results: VarianceResult[];
}

// Factor de varianza
export interface VarianceFactor {
  name: string;
  levels: string[];
  type: FactorType;
}

// Interacción de varianza
export interface VarianceInteraction {
  factors: string[];
  significant: boolean;
  effect: number;
}

// Resultado de varianza
export interface VarianceResult {
  source: string;
  sumOfSquares: number;
  degreesOfFreedom: number;
  meanSquare: number;
  fStatistic: number;
  pValue: number;
  significant: boolean;
}

// Análisis de outliers
export interface OutlierAnalysis {
  method: OutlierDetectionMethod;
  outliers: OutlierPoint[];
  threshold: number;
  summary: OutlierSummary;
}

// Punto outlier
export interface OutlierPoint {
  index: number;
  value: number;
  score: number;
  method: OutlierDetectionMethod;
  isExtreme: boolean;
}

// Resumen de outliers
export interface OutlierSummary {
  totalOutliers: number;
  extremeOutliers: number;
  percentageOutliers: number;
  impact: OutlierImpact;
}

// Impacto de outliers
export interface OutlierImpact {
  onMean: number;
  onStdDev: number;
  onDistribution: string;
  recommendations: string[];
}

// Análisis predictivo
export interface PredictiveAnalysis {
  models: PredictiveModel[];
  ensembleResults?: EnsembleResults;
  featureImportance: FeatureImportance[];
  predictions: PredictionResult[];
}

// Modelo predictivo
export interface PredictiveModel {
  name: string;
  type: ModelType;
  parameters: Record<string, any>;

  // Métricas de rendimiento
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;

  // Validación
  crossValidation: CrossValidationResult;

  // Interpretabilidad
  explainability: ModelExplainability;
}

// Resultado de validación cruzada
export interface CrossValidationResult {
  folds: number;
  meanScore: number;
  standardDeviation: number;
  scores: number[];
}

// Explicabilidad del modelo
export interface ModelExplainability {
  globalExplanations: GlobalExplanation[];
  localExplanations?: LocalExplanation[];
  shap?: ShapValues;
}

// Explicación global
export interface GlobalExplanation {
  feature: string;
  importance: number;
  direction: EffectDirection;
  description: string;
}

// Explicación local
export interface LocalExplanation {
  instanceId: string;
  prediction: number;
  explanations: FeatureContribution[];
}

// Contribución de característica
export interface FeatureContribution {
  feature: string;
  contribution: number;
  value: any;
}

// Valores SHAP
export interface ShapValues {
  baseValue: number;
  values: number[][];
  features: string[];
}

// Resultados de ensemble
export interface EnsembleResults {
  method: EnsembleMethod;
  models: string[];
  weights: number[];
  performance: ModelPerformance;
}

// Rendimiento del modelo
export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

// Importancia de característica
export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  pValue?: number;
  confidenceInterval?: [number, number];
}

// Resultado de predicción
export interface PredictionResult {
  id: string;
  predictedValue: number;
  confidence: number;

  // Intervalos
  predictionInterval?: [number, number];
  confidenceInterval?: [number, number];

  // Explicación
  explanation?: LocalExplanation;
}

// Análisis de sensibilidad
export interface SensitivityAnalysis {
  method: SensitivityMethod;
  parameters: SensitivityParameter[];
  results: SensitivityResult[];
  summary: SensitivitySummary;
}

// Parámetro de sensibilidad
export interface SensitivityParameter {
  name: string;
  baseValue: number;
  testValues: number[];
  type: ParameterType;
}

// Resultado de sensibilidad
export interface SensitivityResult {
  parameter: string;
  testValue: number;
  outputChange: number;
  percentageChange: number;
  elasticity: number;
}

// Resumen de sensibilidad
export interface SensitivitySummary {
  mostSensitiveParameters: string[];
  leastSensitiveParameters: string[];
  nonLinearEffects: string[];
  interactions: string[];
}

// Metadatos del reporte
export interface ReportMetadata {
  // Información básica
  version: string;
  generatedAt: Date;
  generatedBy: string;

  // Origen de datos
  dataSources: DataSource[];
  dataFreshness: DataFreshness;

  // Calidad
  dataQuality: DataQualityMetrics;

  // Procesamiento
  processingInfo: ProcessingInfo;

  // Validación
  validation: ValidationResults;

  // Configuración de exportación
  exportInfo?: ExportInfo;
}

// Fuente de datos
export interface DataSource {
  name: string;
  type: DataSourceType;
  connection: string;
  lastUpdate: Date;
  recordCount: number;
  reliability: number;
}

// Frescura de datos
export interface DataFreshness {
  overall: FreshnessLevel;
  bySource: Record<string, FreshnessLevel>;
  oldestRecord: Date;
  newestRecord: Date;
}

// Estado del reporte
export interface ReportStatus {
  current: ReportState;
  progress: number; // 0-100

  // Historial de estados
  history: StatusHistoryEntry[];

  // Información de error
  error?: ReportError;

  // Estimaciones
  estimatedCompletion?: Date;
  estimatedDuration?: number; // minutos
}

// Entrada de historial de estado
export interface StatusHistoryEntry {
  state: ReportState;
  timestamp: Date;
  message?: string;
  user?: string;
}

// Error del reporte
export interface ReportError {
  code: string;
  message: string;
  details?: string;
  stack?: string;

  // Contexto
  component?: string;
  operation?: string;

  // Resolución
  isRetryable: boolean;
  suggestedAction?: string;
}

// Programación del reporte
export interface ReportSchedule {
  // Configuración básica
  enabled: boolean;
  frequency: ScheduleFrequency;

  // Tiempo específico
  timeOfDay?: string; // HH:mm
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31

  // Configuración avanzada
  timezone: string;
  retryPolicy: RetryPolicy;

  // Distribución
  distribution: DistributionConfig;

  // Próximas ejecuciones
  nextRun: Date;
  lastRun?: Date;

  // Historial
  history: ScheduleHistoryEntry[];

  // Estado
  isActive: boolean;
  recipients: string[];
  parameters: ReportParametersConfig;
}

// Configuración de parámetros del reporte
export interface ReportParametersConfig {
  includeCharts: boolean;
  includeDetailedData: boolean;
  includeRecommendations: boolean;
  includeGeolocation: boolean;
  groupBy: GroupByOption[];
  sortBy: SortOption;
  customFields: CustomField[];
  outputSettings: OutputSettings;
}

// Opción de agrupación
export interface GroupByOption {
  field: string;
  order: "asc" | "desc";
}

// Opción de ordenamiento
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

// Campo personalizado
export interface CustomField {
  name: string;
  expression: string;
  type: DataType;
  format?: string;
}

// Configuraciones de salida
export interface OutputSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  includeWatermark: boolean;
  includePageNumbers: boolean;
  includeTimestamp: boolean;
  customHeader?: string;
  customFooter?: string;
}

// Política de reintento
export interface RetryPolicy {
  maxRetries: number;
  retryInterval: number; // minutos
  exponentialBackoff: boolean;

  // Condiciones de fallo
  failureThreshold: number;
  alertOnFailure: boolean;
}

// Configuración de distribución
export interface DistributionConfig {
  // Destinatarios
  emailRecipients: string[];

  // Formato de entrega
  deliveryFormat: ExportFormat[];

  // Configuración de email
  emailSubject?: string;
  emailBody?: string;

  // Almacenamiento
  saveToStorage: boolean;
  storageLocation?: string;

  // Notificaciones
  notifyOnCompletion: boolean;
  notifyOnFailure: boolean;
}

// Entrada de historial de programación
export interface ScheduleHistoryEntry {
  executionTime: Date;
  duration: number; // minutos
  status: ReportExecutionStatus;
  error?: string;

  // Metadatos
  triggeredBy: ReportTriggerType;
  version: string;
  recipients: string[];
}

// Información de exportación
export interface ExportInfo {
  format: ExportFormat;
  fileName: string;
  fileSize: number;
  downloadUrl?: string;
  expiresAt?: Date;
}

// Configuración de página
export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;

  // Encabezado y pie de página
  header?: PageSection;
  footer?: PageSection;

  // Marca de agua
  watermark?: WatermarkConfig;
}

// Sección de página
export interface PageSection {
  content: string;
  alignment: TextAlignment;
  fontSize: number;
  includePageNumber: boolean;
  includeTimestamp: boolean;
}

// Márgenes de página
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: LengthUnit;
}

// Configuración de marca de agua
export interface WatermarkConfig {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
}

// Configuración de marca
export interface BrandingConfig {
  // Logo
  logo?: LogoConfig;

  // Colores corporativos
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Tipografía
  fontFamily: string;

  // Información de la empresa
  companyName: string;
  companyAddress?: string;
  companyContact?: string;
}

// Configuración de logo
export interface LogoConfig {
  url: string;
  width: number;
  height: number;
  position: LogoPosition;
}

// Configuración de calidad de datos
export interface DataQualityConfig {
  // Umbrales de calidad
  minimumCompleteness: number;
  minimumAccuracy: number;
  maximumAge: number; // días

  // Validaciones
  enableValidation: boolean;
  strictMode: boolean;

  // Manejo de datos faltantes
  missingDataStrategy: MissingDataStrategy;
}

// Configuración de comparación
export interface ComparisonConfig {
  // Períodos automáticos
  includePreviousPeriod: boolean;
  includePreviousYear: boolean;
  includeYearToDate: boolean;

  // Benchmarks
  includeBenchmarks: boolean;
  benchmarkSource?: string;

  // Objetivos
  includeTargets: boolean;
  targetSource?: string;
}

// Métricas de calidad de datos
export interface DataQualityMetrics {
  // Completitud
  completeness: number; // 0-1

  // Precisión
  accuracy: number; // 0-1

  // Consistencia
  consistency: number; // 0-1

  // Validez
  validity: number; // 0-1

  // Puntualidad
  timeliness: number; // 0-1

  // Singularidad
  uniqueness: number; // 0-1

  // Score general
  overallScore: number; // 0-1

  // Detalles
  issues: DataQualityIssue[];
}

// Problema de calidad de datos
export interface DataQualityIssue {
  type: QualityIssueType;
  field: string;
  description: string;
  severity: IssueSeverity;
  count: number;
  percentage: number;

  // Ejemplos
  examples: string[];

  // Recomendaciones
  recommendations: string[];
}

// Información de procesamiento
export interface ProcessingInfo {
  // Tiempo
  startTime: Date;
  endTime?: Date;
  duration?: number; // milisegundos

  // Recursos
  cpuUsage: number;
  memoryUsage: number;

  // Estadísticas
  recordsProcessed: number;
  recordsFiltered: number;
  recordsAggregated: number;

  // Pasos de procesamiento
  steps: ProcessingStep[];
}

// Paso de procesamiento
export interface ProcessingStep {
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: StepStatus;

  // Detalles
  inputRecords: number;
  outputRecords: number;

  // Métricas
  metrics: Record<string, number>;

  // Logs
  logs: string[];
}

// Resultados de validación
export interface ValidationResults {
  isValid: boolean;
  validations: ValidationResult[];

  // Resumen
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;

  // Score
  validationScore: number; // 0-1
}

// Resultado de validación
export interface ValidationResult {
  rule: string;
  description: string;
  status: ValidationStatus;

  // Detalles
  expectedValue?: any;
  actualValue?: any;
  tolerance?: number;

  // Mensaje
  message: string;
  severity: ValidationSeverity;
}

// Enums principales

export enum ReportType {
  HEALTH_OVERVIEW = "health_overview",
  VACCINATION_COVERAGE = "vaccination_coverage",
  DISEASE_ANALYSIS = "disease_analysis",
  PRODUCTION_METRICS = "production_metrics",
  FINANCIAL_SUMMARY = "financial_summary",
  BREEDING_PERFORMANCE = "breeding_performance",
  FEED_EFFICIENCY = "feed_efficiency",
  GROWTH_ANALYSIS = "growth_analysis",
  MORTALITY_ANALYSIS = "mortality_analysis",
  GEOGRAPHIC_DISTRIBUTION = "geographic_distribution",
  OPERATIONAL_EFFICIENCY = "operational_efficiency",
  COMPLIANCE_REPORT = "compliance_report",
  CUSTOM = "custom",
}

export enum ReportCategory {
  HEALTH = "health",
  PRODUCTION = "production",
  FINANCIAL = "financial",
  OPERATIONAL = "operational",
  COMPLIANCE = "compliance",
  ANALYTICS = "analytics",
}

export enum ExportFormat {
  PDF = "pdf",
  EXCEL = "excel",
  CSV = "csv",
  JSON = "json",
  XML = "xml",
  HTML = "html",
  POWERPOINT = "powerpoint",
  WORD = "word",
}

export enum TimeGranularity {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

export enum ComparisonType {
  PREVIOUS_PERIOD = "previous_period",
  SAME_PERIOD_LAST_YEAR = "same_period_last_year",
  YEAR_TO_DATE = "year_to_date",
  BENCHMARK = "benchmark",
  TARGET = "target",
  CUSTOM_COMPARISON = "custom_comparison",
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  GREATER_THAN_OR_EQUAL = "greater_than_or_equal",
  LESS_THAN = "less_than",
  LESS_THAN_OR_EQUAL = "less_than_or_equal",
  BETWEEN = "between",
  IN = "in",
  NOT_IN = "not_in",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

export enum DataType {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
  DATE = "date",
  DATETIME = "datetime",
  TIME = "time",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  ENUM = "enum",
  ARRAY = "array",
  OBJECT = "object",
}

export enum DataSourceType {
  DATABASE = "database",
  API = "api",
  FILE = "file",
  STREAM = "stream",
  MANUAL = "manual",
  CALCULATED = "calculated",
  EXTERNAL = "external",
}

export enum DistributionType {
  NORMAL = "normal",
  UNIFORM = "uniform",
  EXPONENTIAL = "exponential",
  POISSON = "poisson",
  BINOMIAL = "binomial",
  CHI_SQUARE = "chi_square",
  CUSTOM_DISTRIBUTION = "custom_distribution",
}

export enum GeometryType {
  POINT = "point",
  LINE = "line",
  POLYGON = "polygon",
  MULTIPOINT = "multipoint",
  MULTILINE = "multiline",
  MULTIPOLYGON = "multipolygon",
}

export enum MetricFormat {
  NUMBER = "number",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  RATIO = "ratio",
  COUNT = "count",
  DURATION = "duration",
  RATE = "rate",
}

export enum ThresholdType {
  MINIMUM = "minimum",
  MAXIMUM = "maximum",
  TARGET = "target",
  WARNING = "warning",
  CRITICAL = "critical",
}

export enum TrendDirection {
  INCREASING = "increasing",
  DECREASING = "decreasing",
  STABLE = "stable",
  VOLATILE = "volatile",
  UNKNOWN = "unknown",
}

export enum TrendStrength {
  VERY_WEAK = "very_weak",
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

export enum RegressionType {
  LINEAR = "linear",
  POLYNOMIAL = "polynomial",
  EXPONENTIAL = "exponential",
  LOGARITHMIC = "logarithmic",
  LOGISTIC = "logistic",
}

export enum MovingAverageType {
  SIMPLE = "simple",
  EXPONENTIAL = "exponential",
  WEIGHTED = "weighted",
  HULL = "hull",
}

export enum AnomalyType {
  OUTLIER = "outlier",
  CHANGE_POINT = "change_point",
  SEASONAL_ANOMALY = "seasonal_anomaly",
  TREND_ANOMALY = "trend_anomaly",
  PATTERN_ANOMALY = "pattern_anomaly",
}

export enum ForecastModelType {
  ARIMA = "arima",
  EXPONENTIAL_SMOOTHING = "exponential_smoothing",
  LINEAR_REGRESSION_FORECAST = "linear_regression_forecast",
  NEURAL_NETWORK_FORECAST = "neural_network_forecast",
  RANDOM_FOREST_FORECAST = "random_forest_forecast",
  PROPHET = "prophet",
}

export enum VisualizationType {
  LINE_CHART = "line_chart",
  BAR_CHART = "bar_chart",
  COLUMN_CHART = "column_chart",
  PIE_CHART = "pie_chart",
  DONUT_CHART = "donut_chart",
  AREA_CHART = "area_chart",
  SCATTER_PLOT = "scatter_plot",
  BUBBLE_CHART = "bubble_chart",
  HISTOGRAM = "histogram",
  BOX_PLOT = "box_plot",
  HEAT_MAP = "heat_map",
  TREEMAP = "treemap",
  SUNBURST = "sunburst",
  RADAR_CHART = "radar_chart",
  GAUGE_CHART = "gauge_chart",
  FUNNEL_CHART = "funnel_chart",
  WATERFALL_CHART = "waterfall_chart",
  GEOGRAPHIC_MAP = "geographic_map",
  SANKEY_DIAGRAM = "sankey_diagram",
  NETWORK_DIAGRAM = "network_diagram",
  TIMELINE = "timeline",
  GANTT_CHART = "gantt_chart",
  CALENDAR_HEAT_MAP = "calendar_heat_map",
}

export enum ColorSchemeType {
  CATEGORICAL = "categorical",
  SEQUENTIAL = "sequential",
  DIVERGING = "diverging",
  QUALITATIVE = "qualitative",
  MONOCHROMATIC = "monochromatic",
  CUSTOM_COLOR = "custom_color",
}

export enum VisualizationTheme {
  LIGHT = "light",
  DARK = "dark",
  HIGH_CONTRAST = "high_contrast",
  CORPORATE = "corporate",
  MINIMAL = "minimal",
  COLORFUL = "colorful",
}

export enum GradientDirection {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
  DIAGONAL = "diagonal",
  RADIAL = "radial",
}

export enum AxisPosition {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom",
}

export enum ScaleType {
  LINEAR = "linear",
  LOG = "log",
  TIME = "time",
  ORDINAL = "ordinal",
  QUANTILE = "quantile",
}

export enum LabelPosition {
  INSIDE = "inside",
  OUTSIDE = "outside",
  CENTER = "center",
  AUTO = "auto",
}

export enum FontWeight {
  NORMAL = "normal",
  BOLD = "bold",
  LIGHT = "light",
  MEDIUM = "medium",
}

export enum LegendPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  INSIDE = "inside",
}

export enum LegendOrientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum SeriesStyle {
  SOLID = "solid",
  DASHED = "dashed",
  DOTTED = "dotted",
  GRADIENT = "gradient",
  PATTERN = "pattern",
}

export enum AnnotationType {
  TEXT = "text",
  ARROW = "arrow",
  SHAPE = "shape",
  LINE = "line",
  HIGHLIGHT = "highlight",
}

export enum AnchorPoint {
  TOP_LEFT = "top_left",
  TOP_CENTER = "top_center",
  TOP_RIGHT = "top_right",
  CENTER_LEFT = "center_left",
  CENTER = "center",
  CENTER_RIGHT = "center_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_CENTER = "bottom_center",
  BOTTOM_RIGHT = "bottom_right",
}

export enum ReferenceType {
  HORIZONTAL_LINE = "horizontal_line",
  VERTICAL_LINE = "vertical_line",
  TREND_LINE = "trend_line",
  AREA = "area",
}

export enum LineStyle {
  SOLID = "solid",
  DASHED = "dashed",
  DOTTED = "dotted",
  DOT_DASH = "dot_dash",
}

export enum InteractionType {
  HOVER = "hover",
  CLICK = "click",
  ZOOM = "zoom",
  PAN = "pan",
  SELECT = "select",
  BRUSH = "brush",
}

export enum InteractionTrigger {
  MOUSE_ENTER = "mouse_enter",
  MOUSE_LEAVE = "mouse_leave",
  MOUSE_CLICK = "mouse_click",
  MOUSE_DOUBLE_CLICK = "mouse_double_click",
  TOUCH = "touch",
  KEY_PRESS = "key_press",
}

export enum ActionType {
  FILTER = "filter",
  DRILL_DOWN = "drill_down",
  NAVIGATE = "navigate",
  EXPORT = "export",
  REFRESH = "refresh",
  TOOLTIP = "tooltip",
  HIGHLIGHT = "highlight",
}

export enum ChangeType {
  INCREASE = "increase",
  DECREASE = "decrease",
  NO_CHANGE = "no_change",
}

export enum MetricDisplayFormat {
  SIMPLE = "simple",
  WITH_CHANGE = "with_change",
  WITH_TREND = "with_trend",
  WITH_SPARKLINE = "with_sparkline",
  GAUGE = "gauge",
  PROGRESS_BAR = "progress_bar",
}

export enum ImportanceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum EvidenceType {
  STATISTICAL = "statistical",
  OBSERVATIONAL = "observational",
  COMPARATIVE = "comparative",
  HISTORICAL = "historical",
  EXPERT = "expert",
}

export enum ImpactLevel {
  MINIMAL = "minimal",
  LOW_IMPACT = "low_impact",
  MODERATE = "moderate",
  HIGH_IMPACT = "high_impact",
  SEVERE = "severe",
}

export enum AlertType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS_ALERT = "success_alert",
}

export enum AlertSeverity {
  LOW_SEVERITY = "low_severity",
  MEDIUM_SEVERITY = "medium_severity",
  HIGH_SEVERITY = "high_severity",
  CRITICAL_SEVERITY = "critical_severity",
}

export enum RecommendationPriority {
  LOW_PRIORITY = "low_priority",
  MEDIUM_PRIORITY = "medium_priority",
  HIGH_PRIORITY = "high_priority",
  URGENT = "urgent",
}

export enum EffortLevel {
  MINIMAL_EFFORT = "minimal_effort",
  LOW_EFFORT = "low_effort",
  MEDIUM_EFFORT = "medium_effort",
  HIGH_EFFORT = "high_effort",
  EXTENSIVE = "extensive",
}

export enum BenefitLevel {
  MINIMAL_BENEFIT = "minimal_benefit",
  LOW_BENEFIT = "low_benefit",
  MEDIUM_BENEFIT = "medium_benefit",
  HIGH_BENEFIT = "high_benefit",
  TRANSFORMATIONAL = "transformational",
}

export enum RecommendationCategory {
  OPERATIONAL = "operational",
  STRATEGIC = "strategic",
  TECHNICAL = "technical",
  FINANCIAL_REC = "financial_rec",
  HEALTH_REC = "health_rec",
  SAFETY = "safety",
}

export enum ApplicabilityLevel {
  SPECIFIC = "specific",
  DEPARTMENTAL = "departmental",
  ORGANIZATIONAL = "organizational",
  INDUSTRY_WIDE = "industry_wide",
}

export enum DistributionTestType {
  SHAPIRO_WILK = "shapiro_wilk",
  KOLMOGOROV_SMIRNOV = "kolmogorov_smirnov",
  ANDERSON_DARLING = "anderson_darling",
  JARQUE_BERA = "jarque_bera",
}

export enum HypothesisTestType {
  T_TEST = "t_test",
  CHI_SQUARE_TEST = "chi_square_test",
  ANOVA = "anova",
  MANN_WHITNEY = "mann_whitney",
  WILCOXON = "wilcoxon",
  KRUSKAL_WALLIS = "kruskal_wallis",
}

export enum TestResult {
  REJECT_NULL = "reject_null",
  FAIL_TO_REJECT_NULL = "fail_to_reject_null",
  INCONCLUSIVE = "inconclusive",
}

export enum CorrelationMethod {
  PEARSON = "pearson",
  SPEARMAN = "spearman",
  KENDALL = "kendall",
  PARTIAL = "partial",
}

export enum SignificanceLevel {
  NOT_SIGNIFICANT = "not_significant",
  MARGINALLY_SIGNIFICANT = "marginally_significant",
  SIGNIFICANT = "significant",
  HIGHLY_SIGNIFICANT = "highly_significant",
}

export enum EdgeType {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
}

export enum VarianceAnalysisMethod {
  ONE_WAY_ANOVA = "one_way_anova",
  TWO_WAY_ANOVA = "two_way_anova",
  REPEATED_MEASURES = "repeated_measures",
  MIXED_EFFECTS = "mixed_effects",
}

export enum FactorType {
  FIXED = "fixed",
  RANDOM = "random",
  MIXED = "mixed",
}

export enum OutlierDetectionMethod {
  Z_SCORE = "z_score",
  IQR = "iqr",
  ISOLATION_FOREST = "isolation_forest",
  LOCAL_OUTLIER_FACTOR = "local_outlier_factor",
  DBSCAN = "dbscan",
}

export enum ModelType {
  LINEAR_REGRESSION = "linear_regression",
  LOGISTIC_REGRESSION = "logistic_regression",
  DECISION_TREE = "decision_tree",
  RANDOM_FOREST = "random_forest",
  GRADIENT_BOOSTING = "gradient_boosting",
  NEURAL_NETWORK = "neural_network",
  SVM = "svm",
  NAIVE_BAYES = "naive_bayes",
}

export enum EffectDirection {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
  NON_LINEAR = "non_linear",
}

export enum EnsembleMethod {
  AVERAGING = "averaging",
  VOTING = "voting",
  STACKING = "stacking",
  BOOSTING = "boosting",
  BAGGING = "bagging",
}

export enum SensitivityMethod {
  ONE_AT_A_TIME = "one_at_a_time",
  MORRIS = "morris",
  SOBOL = "sobol",
  FAST = "fast",
}

export enum ParameterType {
  CONTINUOUS = "continuous",
  DISCRETE = "discrete",
  CATEGORICAL = "categorical",
  BINARY = "binary",
}

export enum FreshnessLevel {
  FRESH = "fresh",
  ACCEPTABLE = "acceptable",
  STALE = "stale",
  EXPIRED = "expired",
}

export enum ReportState {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PAUSED = "paused",
}

export enum ScheduleFrequency {
  ONCE = "once",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM_SCHEDULE = "custom_schedule",
}

export enum ReportExecutionStatus {
  SUCCESS = "success",
  FAILURE = "failure",
  PARTIAL_SUCCESS = "partial_success",
  TIMEOUT = "timeout",
  CANCELLED = "cancelled",
}

export enum ReportTriggerType {
  SCHEDULED = "scheduled",
  MANUAL = "manual",
  API = "api",
  EVENT = "event",
}

export enum QualityIssueType {
  MISSING_VALUES = "missing_values",
  INVALID_FORMAT = "invalid_format",
  OUT_OF_RANGE = "out_of_range",
  DUPLICATE_VALUES = "duplicate_values",
  INCONSISTENT_DATA = "inconsistent_data",
  OUTDATED_DATA = "outdated_data",
}

export enum IssueSeverity {
  LOW_ISSUE = "low_issue",
  MEDIUM_ISSUE = "medium_issue",
  HIGH_ISSUE = "high_issue",
  CRITICAL_ISSUE = "critical_issue",
}

export enum StepStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped",
}

export enum ValidationStatus {
  PASSED = "passed",
  FAILED = "failed",
  WARNING = "warning",
  SKIPPED = "skipped",
}

export enum ValidationSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum PageSize {
  A4 = "a4",
  LETTER = "letter",
  LEGAL = "legal",
  A3 = "a3",
  TABLOID = "tabloid",
}

export enum PageOrientation {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape",
}

export enum TextAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
  JUSTIFY = "justify",
}

export enum LengthUnit {
  PIXELS = "px",
  POINTS = "pt",
  INCHES = "in",
  CENTIMETERS = "cm",
  MILLIMETERS = "mm",
}

export enum LogoPosition {
  TOP_LEFT = "top_left",
  TOP_CENTER = "top_center",
  TOP_RIGHT = "top_right",
  HEADER = "header",
  FOOTER = "footer",
}

export enum MissingDataStrategy {
  EXCLUDE = "exclude",
  INTERPOLATE = "interpolate",
  FILL_FORWARD = "fill_forward",
  FILL_BACKWARD = "fill_backward",
  MEAN_IMPUTATION = "mean_imputation",
  MEDIAN_IMPUTATION = "median_imputation",
  MODE_IMPUTATION = "mode_imputation",
}

// Etiquetas en español para la interfaz

export const REPORT_TYPE_LABELS = {
  [ReportType.HEALTH_OVERVIEW]: "Resumen de Salud",
  [ReportType.VACCINATION_COVERAGE]: "Cobertura de Vacunación",
  [ReportType.DISEASE_ANALYSIS]: "Análisis de Enfermedades",
  [ReportType.PRODUCTION_METRICS]: "Métricas de Producción",
  [ReportType.FINANCIAL_SUMMARY]: "Resumen Financiero",
  [ReportType.BREEDING_PERFORMANCE]: "Rendimiento Reproductivo",
  [ReportType.FEED_EFFICIENCY]: "Eficiencia Alimentaria",
  [ReportType.GROWTH_ANALYSIS]: "Análisis de Crecimiento",
  [ReportType.MORTALITY_ANALYSIS]: "Análisis de Mortalidad",
  [ReportType.GEOGRAPHIC_DISTRIBUTION]: "Distribución Geográfica",
  [ReportType.OPERATIONAL_EFFICIENCY]: "Eficiencia Operativa",
  [ReportType.COMPLIANCE_REPORT]: "Reporte de Cumplimiento",
  [ReportType.CUSTOM]: "Personalizado",
} as const;

export const EXPORT_FORMAT_LABELS = {
  [ExportFormat.PDF]: "PDF",
  [ExportFormat.EXCEL]: "Excel",
  [ExportFormat.CSV]: "CSV",
  [ExportFormat.JSON]: "JSON",
  [ExportFormat.XML]: "XML",
  [ExportFormat.HTML]: "HTML",
  [ExportFormat.POWERPOINT]: "PowerPoint",
  [ExportFormat.WORD]: "Word",
} as const;

export const VISUALIZATION_TYPE_LABELS = {
  [VisualizationType.LINE_CHART]: "Gráfico de Líneas",
  [VisualizationType.BAR_CHART]: "Gráfico de Barras",
  [VisualizationType.PIE_CHART]: "Gráfico Circular",
  [VisualizationType.AREA_CHART]: "Gráfico de Área",
  [VisualizationType.SCATTER_PLOT]: "Diagrama de Dispersión",
  [VisualizationType.HEAT_MAP]: "Mapa de Calor",
  [VisualizationType.GEOGRAPHIC_MAP]: "Mapa Geográfico",
  // ... más etiquetas según sea necesario
} as const;
