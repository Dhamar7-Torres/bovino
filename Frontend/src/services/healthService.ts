import { api, apiClient } from "./api";
import {
  ILLNESS_ENDPOINTS,
  MAP_ENDPOINTS,
  REPORT_ENDPOINTS,
} from "../constants/urls";

// Interfaces principales para análisis de salud
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface HealthRecord extends BaseEntity {
  bovineId: string;
  recordType: HealthRecordType;
  date: Date;
  location: Location;
  veterinarianId?: string;
  temperature?: number;
  weight?: number;
  bodyConditionScore?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressure?: string;
  observations: string[];
  abnormalFindings: string[];
  followUpRequired: boolean;
  nextCheckupDate?: Date;
  tags?: string[];
  photos?: string[];
  labResults?: LabResult[];
}

interface LabResult {
  id: string;
  testType: LabTestType;
  parameter: string;
  value: number | string;
  unit?: string;
  referenceRange: string;
  status: LabResultStatus;
  laboratory: string;
  testDate: Date;
  resultDate: Date;
  notes?: string;
}

interface Illness extends BaseEntity {
  bovineId: string;
  diseaseName: string;
  diseaseCode?: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  stage: DiseaseStage;
  isContagious: boolean;
  transmissionRoute?: TransmissionRoute[];
  incubationPeriod?: number;
  diagnosisMethod: DiagnosisMethod;
  confirmationTests?: string[];
  treatment?: Treatment;
  quarantineRequired: boolean;
  quarantineStartDate?: Date;
  quarantineEndDate?: Date;
  expectedRecoveryDate?: Date;
  actualRecoveryDate?: Date;
  location: Location;
  environmentalFactors?: EnvironmentalFactor[];
  riskFactors?: RiskFactor[];
  complications?: Complication[];
  prevention?: PreventiveMeasure[];
  cost?: number;
  veterinarianId?: string;
  photos?: string[];
  labResults?: LabResult[];
}

interface Treatment {
  id: string;
  protocol: string;
  medications: Medication[];
  procedures: Procedure[];
  duration: number; // días
  startDate: Date;
  endDate?: Date;
  effectiveness: number; // 0-100%
  sideEffects?: string[];
  cost?: number;
  notes?: string;
}

interface Medication {
  name: string;
  activeIngredient: string;
  dosage: string;
  frequency: string;
  route: AdministrationRoute;
  duration: string;
  prescribedBy: string;
  cost?: number;
  manufacturer?: string;
  batchNumber?: string;
}

interface Procedure {
  name: string;
  description: string;
  duration: number; // minutos
  performedBy: string;
  cost?: number;
  anesthesiaRequired: boolean;
  complications?: string[];
}

interface HealthAlert extends BaseEntity {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location?: Location;
  bovineIds?: string[];
  affectedCount: number;
  estimatedRisk: number; // 0-100%
  recommendations: string[];
  actionRequired: boolean;
  dueDate?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  tags?: string[];
}

interface EpidemiologicalAnalysis {
  diseaseId: string;
  diseaseName: string;
  analysisDate: Date;
  timeFrame: {
    startDate: Date;
    endDate: Date;
  };
  geographicScope: {
    center: Location;
    radius: number; // en kilómetros
  };
  caseCount: number;
  incidenceRate: number; // por 1000 animales
  prevalenceRate: number; // por 1000 animales
  mortalityRate: number; // porcentaje
  transmissionPattern: TransmissionPattern;
  riskFactors: RiskFactorAnalysis[];
  spatialDistribution: SpatialCluster[];
  temporalTrends: TemporalTrend[];
  recommendations: EpiRecommendation[];
  confidence: number; // 0-100%
}

interface TransmissionPattern {
  type: "endemic" | "epidemic" | "pandemic" | "sporadic";
  reproductionNumber: number; // R0
  serialInterval: number; // días
  incubationPeriod: number; // días
  infectiousPeriod: number; // días
  peakTransmission?: Date;
  vectorInvolved: boolean;
  vectorSpecies?: string[];
}

interface RiskFactorAnalysis {
  factor: string;
  category: RiskFactorCategory;
  relativeRisk: number;
  confidenceInterval: [number, number];
  pValue: number;
  attributableRisk: number;
  description: string;
}

interface SpatialCluster {
  center: Location;
  radius: number; // metros
  caseCount: number;
  expectedCases: number;
  relativeRisk: number;
  pValue: number;
  isSignificant: boolean;
}

interface TemporalTrend {
  period: string;
  caseCount: number;
  rate: number;
  trend: "increasing" | "decreasing" | "stable";
  changeRate: number; // porcentaje
  significance: number; // p-value
}

interface EpiRecommendation {
  priority: "high" | "medium" | "low";
  category: "prevention" | "control" | "surveillance" | "treatment";
  action: string;
  rationale: string;
  expectedImpact: number; // 0-100%
  timeframe: string;
  resources: string[];
  cost?: number;
}

interface HealthPrediction {
  bovineId: string;
  predictionType: PredictionType;
  predictedCondition: string;
  probability: number; // 0-100%
  timeframe: number; // días hasta evento predicho
  confidenceLevel: number; // 0-100%
  riskFactors: string[];
  preventiveMeasures: string[];
  earlyWarningSignals: string[];
  modelUsed: string;
  lastUpdated: Date;
  nextUpdate: Date;
}

interface HerdHealthMetrics {
  totalAnimals: number;
  healthyCount: number;
  sickCount: number;
  quarantinedCount: number;
  recoveryCount: number;
  mortalityCount: number;
  healthPercentage: number;
  morbidityRate: number;
  mortalityRate: number;
  vaccinationCoverage: number;
  averageBodyCondition: number;
  reproductiveHealth: {
    pregnancyRate: number;
    calvingRate: number;
    fertilityIndex: number;
  };
  environmentalRisks: EnvironmentalRisk[];
  trends: HealthTrend[];
}

interface HealthTrend {
  metric: string;
  period: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: "improving" | "declining" | "stable";
  significance: number;
}

interface EnvironmentalRisk {
  factor: string;
  level: "low" | "medium" | "high" | "critical";
  impact: string;
  affectedAnimals: number;
  mitigation: string[];
  monitoring: boolean;
}

interface QuarantineZone extends BaseEntity {
  name: string;
  reason: string;
  diseaseType: string;
  center: Location;
  radius: number; // metros
  boundaries?: Location[];
  startDate: Date;
  endDate?: Date;
  status: QuarantineStatus;
  restrictions: QuarantineRestriction[];
  affectedAnimals: string[];
  monitoringSchedule: MonitoringSchedule;
  exitCriteria: string[];
  cost?: number;
  veterinarianId: string;
  approvedBy: string;
}

interface QuarantineRestriction {
  type: "movement" | "contact" | "feeding" | "breeding" | "medical";
  description: string;
  severity: "mandatory" | "recommended" | "optional";
  duration?: number; // días
  exceptions?: string[];
}

interface MonitoringSchedule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  tests: string[];
  checkpoints: Location[];
  personnel: string[];
  equipment: string[];
  reportingInterval: number; // horas
}

// Enums
enum HealthRecordType {
  ROUTINE_CHECKUP = "routine_checkup",
  ILLNESS_DIAGNOSIS = "illness_diagnosis",
  VACCINATION = "vaccination",
  INJURY_ASSESSMENT = "injury_assessment",
  REPRODUCTIVE_EXAM = "reproductive_exam",
  NUTRITIONAL_ASSESSMENT = "nutritional_assessment",
  BEHAVIORAL_OBSERVATION = "behavioral_observation",
  LABORATORY_FOLLOWUP = "laboratory_followup",
  EMERGENCY_EVALUATION = "emergency_evaluation",
}

enum LabTestType {
  BLOOD_CHEMISTRY = "blood_chemistry",
  COMPLETE_BLOOD_COUNT = "complete_blood_count",
  SEROLOGY = "serology",
  MICROBIOLOGY = "microbiology",
  PARASITOLOGY = "parasitology",
  PATHOLOGY = "pathology",
  GENETICS = "genetics",
  TOXICOLOGY = "toxicology",
  IMMUNOLOGY = "immunology",
  ENDOCRINOLOGY = "endocrinology",
}

enum LabResultStatus {
  NORMAL = "normal",
  ABNORMAL = "abnormal",
  CRITICAL = "critical",
  PENDING = "pending",
  INVALID = "invalid",
}

enum IllnessSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
  TERMINAL = "terminal",
}

enum DiseaseStage {
  INCUBATION = "incubation",
  PRODROMAL = "prodromal",
  ACUTE = "acute",
  CHRONIC = "chronic",
  RECOVERY = "recovery",
  CONVALESCENCE = "convalescence",
}

enum TransmissionRoute {
  DIRECT_CONTACT = "direct_contact",
  AIRBORNE = "airborne",
  FOODBORNE = "foodborne",
  WATERBORNE = "waterborne",
  VECTOR_BORNE = "vector_borne",
  FOMITE = "fomite",
  VERTICAL = "vertical",
  SEXUAL = "sexual",
}

enum DiagnosisMethod {
  CLINICAL_EXAMINATION = "clinical_examination",
  LABORATORY_CONFIRMATION = "laboratory_confirmation",
  IMAGING = "imaging",
  NECROPSY = "necropsy",
  FIELD_TEST = "field_test",
  DIFFERENTIAL_DIAGNOSIS = "differential_diagnosis",
}

enum AdministrationRoute {
  ORAL = "oral",
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  TOPICAL = "topical",
  INTRANASAL = "intranasal",
  INTRAOCULAR = "intraocular",
  INTRAMAMMARY = "intramammary",
}

enum AlertType {
  DISEASE_OUTBREAK = "disease_outbreak",
  VACCINATION_DUE = "vaccination_due",
  QUARANTINE_VIOLATION = "quarantine_violation",
  ABNORMAL_MORTALITY = "abnormal_mortality",
  ENVIRONMENTAL_RISK = "environmental_risk",
  TREATMENT_FAILURE = "treatment_failure",
  REGULATORY_COMPLIANCE = "regulatory_compliance",
  BIOSECURITY_BREACH = "biosecurity_breach",
}

enum AlertSeverity {
  INFO = "info",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
  EMERGENCY = "emergency",
}

enum PredictionType {
  DISEASE_RISK = "disease_risk",
  TREATMENT_OUTCOME = "treatment_outcome",
  RECOVERY_TIME = "recovery_time",
  MORTALITY_RISK = "mortality_risk",
  REPRODUCTIVE_SUCCESS = "reproductive_success",
  WEIGHT_GAIN = "weight_gain",
  MILK_PRODUCTION = "milk_production",
}

enum RiskFactorCategory {
  ENVIRONMENTAL = "environmental",
  GENETIC = "genetic",
  NUTRITIONAL = "nutritional",
  BEHAVIORAL = "behavioral",
  MANAGEMENT = "management",
  INFECTIOUS = "infectious",
  METABOLIC = "metabolic",
}

enum QuarantineStatus {
  ACTIVE = "active",
  PENDING_APPROVAL = "pending_approval",
  SUSPENDED = "suspended",
  COMPLETED = "completed",
  VIOLATED = "violated",
  EMERGENCY = "emergency",
}

enum EnvironmentalFactor {
  TEMPERATURE = "temperature",
  HUMIDITY = "humidity",
  AIR_QUALITY = "air_quality",
  WATER_QUALITY = "water_quality",
  FEED_QUALITY = "feed_quality",
  OVERCROWDING = "overcrowding",
  STRESS = "stress",
  SEASONAL_CHANGES = "seasonal_changes",
}

enum RiskFactor {
  AGE = "age",
  BREED = "breed",
  GENDER = "gender",
  PREGNANCY = "pregnancy",
  LACTATION = "lactation",
  IMMUNE_STATUS = "immune_status",
  NUTRITION = "nutrition",
  PREVIOUS_ILLNESS = "previous_illness",
  GENETIC_PREDISPOSITION = "genetic_predisposition",
  STRESS_LEVEL = "stress_level",
}

enum Complication {
  SECONDARY_INFECTION = "secondary_infection",
  ORGAN_FAILURE = "organ_failure",
  CHRONIC_CONDITION = "chronic_condition",
  REPRODUCTIVE_ISSUES = "reproductive_issues",
  NEUROLOGICAL_DAMAGE = "neurological_damage",
  METABOLIC_DISORDER = "metabolic_disorder",
}

enum PreventiveMeasure {
  VACCINATION = "vaccination",
  BIOSECURITY = "biosecurity",
  NUTRITION_OPTIMIZATION = "nutrition_optimization",
  STRESS_REDUCTION = "stress_reduction",
  ENVIRONMENTAL_CONTROL = "environmental_control",
  REGULAR_MONITORING = "regular_monitoring",
  QUARANTINE = "quarantine",
  VECTOR_CONTROL = "vector_control",
}

// Configuración del servicio de salud
const HEALTH_CONFIG = {
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutos
  PREDICTION_UPDATE_INTERVAL: 6 * 60 * 60 * 1000, // 6 horas
  ALERT_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos
  SYNC_INTERVAL: 2 * 60 * 1000, // 2 minutos
  EPIDEMIC_THRESHOLD: 0.15, // 15% de incidencia para considerar epidemia
  QUARANTINE_BUFFER_DISTANCE: 500, // metros adicionales para zona de seguridad
  MAX_PREDICTION_DAYS: 90, // máximo días hacia adelante para predicciones
  AI_CONFIDENCE_THRESHOLD: 0.75, // umbral mínimo de confianza para predicciones AI
  TEMPERATURE_NORMAL_RANGE: [38.0, 39.5], // rango normal de temperatura en °C
  HEART_RATE_NORMAL_RANGE: [40, 80], // latidos por minuto
  RESPIRATORY_RATE_NORMAL_RANGE: [10, 30], // respiraciones por minuto
} as const;

// Etiquetas en español
const ILLNESS_SEVERITY_LABELS = {
  [IllnessSeverity.MILD]: "Leve",
  [IllnessSeverity.MODERATE]: "Moderada",
  [IllnessSeverity.SEVERE]: "Severa",
  [IllnessSeverity.CRITICAL]: "Crítica",
  [IllnessSeverity.TERMINAL]: "Terminal",
} as const;

const ALERT_SEVERITY_LABELS = {
  [AlertSeverity.INFO]: "Información",
  [AlertSeverity.LOW]: "Baja",
  [AlertSeverity.MEDIUM]: "Media",
  [AlertSeverity.HIGH]: "Alta",
  [AlertSeverity.CRITICAL]: "Crítica",
  [AlertSeverity.EMERGENCY]: "Emergencia",
} as const;

// Clase principal del servicio de salud
class HealthService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncTimer: number | null = null;
  private alertTimer: number | null = null;
  private predictionTimer: number | null = null;
  private pendingOperations: any[] = [];
  private activeAlerts: HealthAlert[] = [];

  constructor() {
    this.startAutoSync();
    this.startAlertMonitoring();
    this.startPredictionUpdates();
    this.setupEventListeners();
  }

  // MÉTODOS DE CACHE Y SINCRONIZACIÓN

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > HEALTH_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private startAutoSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = window.setInterval(async () => {
      if (navigator.onLine && this.pendingOperations.length > 0) {
        await this.syncPendingOperations();
      }
    }, HEALTH_CONFIG.SYNC_INTERVAL);
  }

  private startAlertMonitoring(): void {
    if (this.alertTimer) clearInterval(this.alertTimer);

    this.alertTimer = window.setInterval(async () => {
      if (navigator.onLine) {
        await this.checkHealthAlerts();
      }
    }, HEALTH_CONFIG.ALERT_CHECK_INTERVAL);
  }

  private startPredictionUpdates(): void {
    if (this.predictionTimer) clearInterval(this.predictionTimer);

    this.predictionTimer = window.setInterval(async () => {
      if (navigator.onLine) {
        await this.updateHealthPredictions();
      }
    }, HEALTH_CONFIG.PREDICTION_UPDATE_INTERVAL);
  }

  private setupEventListeners(): void {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    console.log("🌐 Conexión restaurada - Sincronizando datos de salud...");
    await this.syncPendingOperations();
    await this.checkHealthAlerts();
  }

  private handleOffline(): void {
    console.log(
      "📱 Modo offline - Los datos de salud se guardarán para sincronización"
    );
  }

  private async syncPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      console.log(
        `🔄 Sincronizando ${this.pendingOperations.length} operaciones de salud...`
      );

      for (const operation of this.pendingOperations) {
        await this.executePendingOperation(operation);
      }

      this.pendingOperations = [];
      console.log("✅ Sincronización de salud completada");
    } catch (error) {
      console.error("❌ Error en sincronización de salud:", error);
    }
  }

  private async executePendingOperation(operation: any): Promise<void> {
    try {
      switch (operation.type) {
        case "create_health_record":
          await this.createHealthRecord(operation.data, false);
          break;
        case "diagnose_illness":
          await this.diagnoseIllness(operation.data, false);
          break;
        case "create_quarantine":
          await this.createQuarantineZone(operation.data, false);
          break;
        case "update_treatment":
          await this.updateTreatment(operation.id, operation.data, false);
          break;
      }
    } catch (error) {
      console.error("❌ Error ejecutando operación de salud pendiente:", error);
    }
  }

  // MÉTODOS DE GEOLOCALIZACIÓN

  private async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          reject(new Error("Error obteniendo ubicación: " + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // MÉTODOS DE REGISTROS DE SALUD

  // Crear registro de salud
  public async createHealthRecord(
    recordData: Omit<
      HealthRecord,
      "id" | "createdAt" | "updatedAt" | "createdBy"
    >,
    sync: boolean = true
  ): Promise<HealthRecord> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!recordData.location.latitude || !recordData.location.longitude) {
        recordData.location = await this.getCurrentLocation();
      }

      // Validar signos vitales
      this.validateVitalSigns(recordData);

      console.log(
        `🏥 Creando registro de salud para bovino: ${recordData.bovineId}`
      );

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_health_record",
          data: recordData,
          timestamp: Date.now(),
        });

        console.log(
          "📱 Registro de salud guardado para sincronización offline"
        );
        throw new Error(
          "Registro guardado para cuando se restaure la conexión"
        );
      }

      const response = await api.post<HealthRecord>(
        "/health/records",
        recordData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando registro de salud");
      }

      // Analizar automáticamente para alertas
      await this.analyzeHealthRecord(response.data);

      this.clearCache();
      console.log("✅ Registro de salud creado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error creando registro de salud:", error);
      throw error;
    }
  }

  // Validar signos vitales
  private validateVitalSigns(record: Partial<HealthRecord>): void {
    if (record.temperature) {
      const [minTemp, maxTemp] = HEALTH_CONFIG.TEMPERATURE_NORMAL_RANGE;
      if (
        record.temperature < minTemp - 2 ||
        record.temperature > maxTemp + 2
      ) {
        console.warn(
          `⚠️ Temperatura anormal detectada: ${record.temperature}°C`
        );
      }
    }

    if (record.heartRate) {
      const [minHR, maxHR] = HEALTH_CONFIG.HEART_RATE_NORMAL_RANGE;
      if (record.heartRate < minHR - 10 || record.heartRate > maxHR + 20) {
        console.warn(
          `⚠️ Frecuencia cardíaca anormal detectada: ${record.heartRate} bpm`
        );
      }
    }

    if (record.respiratoryRate) {
      const [minRR, maxRR] = HEALTH_CONFIG.RESPIRATORY_RATE_NORMAL_RANGE;
      if (
        record.respiratoryRate < minRR - 5 ||
        record.respiratoryRate > maxRR + 10
      ) {
        console.warn(
          `⚠️ Frecuencia respiratoria anormal detectada: ${record.respiratoryRate} rpm`
        );
      }
    }
  }

  // Analizar registro de salud para alertas automáticas
  private async analyzeHealthRecord(record: HealthRecord): Promise<void> {
    try {
      // Detectar anomalías en signos vitales
      const anomalies = this.detectVitalSignAnomalies(record);

      if (anomalies.length > 0) {
        await this.createHealthAlert({
          type: AlertType.ABNORMAL_MORTALITY,
          severity: this.determineAlertSeverity(anomalies),
          title: "Anomalías en Signos Vitales Detectadas",
          description: `Se detectaron anomalías en: ${anomalies.join(", ")}`,
          bovineIds: [record.bovineId],
          affectedCount: 1,
          estimatedRisk: this.calculateRiskScore(anomalies),
          recommendations: this.generateRecommendations(anomalies),
          actionRequired: true,
          location: record.location,
        });
      }
    } catch (error) {
      console.error("❌ Error analizando registro de salud:", error);
    }
  }

  // Detectar anomalías en signos vitales
  private detectVitalSignAnomalies(record: HealthRecord): string[] {
    const anomalies: string[] = [];

    if (record.temperature) {
      const [minTemp, maxTemp] = HEALTH_CONFIG.TEMPERATURE_NORMAL_RANGE;
      if (record.temperature < minTemp || record.temperature > maxTemp) {
        anomalies.push("temperatura");
      }
    }

    if (record.heartRate) {
      const [minHR, maxHR] = HEALTH_CONFIG.HEART_RATE_NORMAL_RANGE;
      if (record.heartRate < minHR || record.heartRate > maxHR) {
        anomalies.push("frecuencia cardíaca");
      }
    }

    if (record.respiratoryRate) {
      const [minRR, maxRR] = HEALTH_CONFIG.RESPIRATORY_RATE_NORMAL_RANGE;
      if (record.respiratoryRate < minRR || record.respiratoryRate > maxRR) {
        anomalies.push("frecuencia respiratoria");
      }
    }

    if (
      record.bodyConditionScore &&
      (record.bodyConditionScore < 2 || record.bodyConditionScore > 4)
    ) {
      anomalies.push("condición corporal");
    }

    return anomalies;
  }

  // Determinar severidad de alerta basada en anomalías
  private determineAlertSeverity(anomalies: string[]): AlertSeverity {
    if (anomalies.includes("temperatura") && anomalies.length > 2) {
      return AlertSeverity.HIGH;
    }
    if (anomalies.length > 1) {
      return AlertSeverity.MEDIUM;
    }
    return AlertSeverity.LOW;
  }

  // Calcular puntaje de riesgo
  private calculateRiskScore(anomalies: string[]): number {
    const riskWeights: Record<string, number> = {
      temperatura: 30,
      "frecuencia cardíaca": 20,
      "frecuencia respiratoria": 15,
      "condición corporal": 25,
    };

    let totalRisk = 0;
    anomalies.forEach((anomaly) => {
      totalRisk += riskWeights[anomaly] || 10;
    });

    return Math.min(totalRisk, 100);
  }

  // Generar recomendaciones automáticas
  private generateRecommendations(anomalies: string[]): string[] {
    const recommendations: string[] = [];

    if (anomalies.includes("temperatura")) {
      recommendations.push("Monitorear temperatura cada 4 horas");
      recommendations.push("Considerar examen veterinario urgente");
    }

    if (anomalies.includes("frecuencia cardíaca")) {
      recommendations.push("Evaluar estrés y actividad física");
      recommendations.push("Revisar medicamentos actuales");
    }

    if (anomalies.includes("frecuencia respiratoria")) {
      recommendations.push("Examinar vías respiratorias");
      recommendations.push("Verificar calidad del aire");
    }

    if (anomalies.includes("condición corporal")) {
      recommendations.push("Revisar plan nutricional");
      recommendations.push("Evaluar parasitosis");
    }

    return recommendations;
  }

  // MÉTODOS DE DIAGNÓSTICO Y ENFERMEDADES

  // Diagnosticar enfermedad
  public async diagnoseIllness(
    illnessData: Omit<Illness, "id" | "createdAt" | "updatedAt" | "createdBy">,
    sync: boolean = true
  ): Promise<Illness> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!illnessData.location.latitude || !illnessData.location.longitude) {
        illnessData.location = await this.getCurrentLocation();
      }

      console.log(
        `🦠 Diagnosticando enfermedad: ${illnessData.diseaseName} en bovino: ${illnessData.bovineId}`
      );

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "diagnose_illness",
          data: illnessData,
          timestamp: Date.now(),
        });

        console.log("📱 Diagnóstico guardado para sincronización offline");
        throw new Error(
          "Diagnóstico guardado para cuando se restaure la conexión"
        );
      }

      const response = await api.post<Illness>(
        ILLNESS_ENDPOINTS.CREATE,
        illnessData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando diagnóstico");
      }

      // Análisis automático para brotes epidemiológicos
      if (illnessData.isContagious) {
        await this.analyzeOutbreakRisk(response.data);
      }

      // Evaluar necesidad de cuarentena
      if (illnessData.quarantineRequired) {
        await this.evaluateQuarantineNeed(response.data);
      }

      this.clearCache();
      console.log("✅ Diagnóstico registrado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error diagnosticando enfermedad:", error);
      throw error;
    }
  }

  // Analizar riesgo de brote epidemiológico
  private async analyzeOutbreakRisk(illness: Illness): Promise<void> {
    try {
      console.log(`🔬 Analizando riesgo de brote para: ${illness.diseaseName}`);

      const response = await api.post("/health/outbreak-analysis", {
        illnessId: illness.id,
        location: illness.location,
        radius: 5000, // 5km de radio
      });

      if (response.success && response.data?.riskLevel === "high") {
        await this.createHealthAlert({
          type: AlertType.DISEASE_OUTBREAK,
          severity: AlertSeverity.HIGH,
          title: `Posible Brote de ${illness.diseaseName}`,
          description:
            "Se ha detectado un patrón que sugiere un posible brote epidemiológico",
          location: illness.location,
          bovineIds: [illness.bovineId],
          affectedCount: response.data.affectedCount || 1,
          estimatedRisk: response.data.riskScore || 75,
          recommendations: [
            "Activar protocolo de emergencia sanitaria",
            "Implementar medidas de bioseguridad estrictas",
            "Notificar a autoridades sanitarias",
            "Expandir vigilancia epidemiológica",
          ],
          actionRequired: true,
        });
      }
    } catch (error) {
      console.error("❌ Error analizando riesgo de brote:", error);
    }
  }

  // Evaluar necesidad de cuarentena
  private async evaluateQuarantineNeed(illness: Illness): Promise<void> {
    try {
      if (!illness.quarantineRequired || !illness.isContagious) return;

      console.log(
        `🔒 Evaluando necesidad de cuarentena para: ${illness.diseaseName}`
      );

      // Calcular radio de cuarentena basado en severidad y contagiosidad
      let quarantineRadius = 500; // metros base

      switch (illness.severity) {
        case IllnessSeverity.CRITICAL:
        case IllnessSeverity.TERMINAL:
          quarantineRadius = 2000;
          break;
        case IllnessSeverity.SEVERE:
          quarantineRadius = 1500;
          break;
        case IllnessSeverity.MODERATE:
          quarantineRadius = 1000;
          break;
      }

      await this.createHealthAlert({
        type: AlertType.QUARANTINE_VIOLATION,
        severity: AlertSeverity.HIGH,
        title: "Cuarentena Requerida",
        description: `Se requiere establecer cuarentena por ${illness.diseaseName}`,
        location: illness.location,
        bovineIds: [illness.bovineId],
        affectedCount: 1,
        estimatedRisk: 80,
        recommendations: [
          `Establecer zona de cuarentena de ${quarantineRadius}m de radio`,
          "Restringir movimiento de animales",
          "Implementar protocolo de desinfección",
          "Programar monitoreo diario",
        ],
        actionRequired: true,
      });
    } catch (error) {
      console.error("❌ Error evaluando cuarentena:", error);
    }
  }

  // MÉTODOS DE ANÁLISIS EPIDEMIOLÓGICO

  // Realizar análisis epidemiológico completo
  public async performEpidemiologicalAnalysis(
    diseaseId: string,
    timeFrame: { startDate: Date; endDate: Date },
    geographicScope: { center: Location; radius: number }
  ): Promise<EpidemiologicalAnalysis> {
    try {
      console.log(
        `📊 Realizando análisis epidemiológico para enfermedad: ${diseaseId}`
      );

      const response = await api.post<EpidemiologicalAnalysis>(
        ILLNESS_ENDPOINTS.OUTBREAK_ANALYSIS,
        {
          diseaseId,
          timeFrame,
          geographicScope,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error realizando análisis epidemiológico");
      }

      console.log("✅ Análisis epidemiológico completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error en análisis epidemiológico:", error);
      throw error;
    }
  }

  // Detectar clusters espaciales de enfermedades
  public async detectSpatialClusters(
    diseaseType: string,
    timeWindow: number = 30
  ): Promise<SpatialCluster[]> {
    try {
      console.log(`🎯 Detectando clusters espaciales para: ${diseaseType}`);

      const response = await api.get<SpatialCluster[]>(
        MAP_ENDPOINTS.CLUSTER_ANALYSIS,
        {
          params: {
            diseaseType,
            timeWindow,
            method: "scan_statistic",
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error detectando clusters espaciales");
      }

      console.log(`✅ ${response.data.length} clusters detectados`);
      return response.data;
    } catch (error) {
      console.error("❌ Error detectando clusters:", error);
      throw error;
    }
  }

  // Generar mapa de calor de enfermedades
  public async generateDiseaseHeatMap(
    diseaseType?: string,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<{ heatMapUrl: string; metadata: any }> {
    try {
      console.log("🔥 Generando mapa de calor de enfermedades...");

      const response = await api.post("/health/heatmap", {
        diseaseType,
        timeRange,
        resolution: "high",
        includeMetadata: true,
      });

      if (!response.success || !response.data) {
        throw new Error("Error generando mapa de calor");
      }

      console.log("✅ Mapa de calor generado");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando mapa de calor:", error);
      throw error;
    }
  }

  // MÉTODOS DE PREDICCIÓN CON IA

  // Generar predicciones de salud
  public async generateHealthPredictions(
    bovineId: string
  ): Promise<HealthPrediction[]> {
    try {
      console.log(
        `🔮 Generando predicciones de salud para bovino: ${bovineId}`
      );

      const response = await api.get<HealthPrediction[]>(
        `/health/predictions/${bovineId}`
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando predicciones");
      }

      console.log(`✅ ${response.data.length} predicciones generadas`);
      return response.data;
    } catch (error) {
      console.error("❌ Error generando predicciones:", error);
      throw error;
    }
  }

  // Actualizar predicciones automáticamente
  private async updateHealthPredictions(): Promise<void> {
    try {
      console.log("🔄 Actualizando predicciones de salud automáticamente...");

      const response = await api.post("/health/predictions/update-all");

      if (response.success) {
        console.log("✅ Predicciones actualizadas automáticamente");
      }
    } catch (error) {
      console.error("❌ Error actualizando predicciones:", error);
    }
  }

  // Predecir riesgo de enfermedad específica
  public async predictDiseaseRisk(
    bovineId: string,
    diseaseType: string,
    timeHorizon: number = 30
  ): Promise<{
    probability: number;
    riskLevel: "low" | "medium" | "high";
    factors: string[];
    confidence: number;
    recommendations: string[];
  }> {
    try {
      console.log(
        `🎯 Prediciendo riesgo de ${diseaseType} para bovino: ${bovineId}`
      );

      const response = await api.post("/health/predict-disease-risk", {
        bovineId,
        diseaseType,
        timeHorizon,
      });

      if (!response.success || !response.data) {
        throw new Error("Error prediciendo riesgo de enfermedad");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error prediciendo riesgo:", error);
      throw error;
    }
  }

  // MÉTODOS DE GESTIÓN DE CUARENTENAS

  // Crear zona de cuarentena
  public async createQuarantineZone(
    quarantineData: Omit<
      QuarantineZone,
      "id" | "createdAt" | "updatedAt" | "createdBy"
    >,
    sync: boolean = true
  ): Promise<QuarantineZone> {
    try {
      console.log(`🔒 Creando zona de cuarentena: ${quarantineData.name}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_quarantine",
          data: quarantineData,
          timestamp: Date.now(),
        });

        console.log("📱 Cuarentena guardada para sincronización offline");
        throw new Error(
          "Cuarentena guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.post<QuarantineZone>(
        "/health/quarantine-zones",
        quarantineData
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando zona de cuarentena");
      }

      // Crear alerta automática
      await this.createHealthAlert({
        type: AlertType.QUARANTINE_VIOLATION,
        severity: AlertSeverity.HIGH,
        title: `Zona de Cuarentena Establecida: ${quarantineData.name}`,
        description: `Nueva cuarentena por ${quarantineData.reason}`,
        location: quarantineData.center,
        bovineIds: quarantineData.affectedAnimals,
        affectedCount: quarantineData.affectedAnimals.length,
        estimatedRisk: 85,
        recommendations: [
          "Notificar a todo el personal",
          "Activar protocolos de bioseguridad",
          "Programar monitoreo intensivo",
          "Documentar todas las actividades",
        ],
        actionRequired: true,
      });

      this.clearCache();
      console.log("✅ Zona de cuarentena creada exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error creando zona de cuarentena:", error);
      throw error;
    }
  }

  // Obtener animales en zona de cuarentena
  public async getAnimalsInQuarantine(quarantineId: string): Promise<string[]> {
    try {
      const response = await api.get<string[]>(
        `/health/quarantine-zones/${quarantineId}/animals`
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo animales en cuarentena");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo animales en cuarentena:", error);
      throw error;
    }
  }

  // Verificar violación de cuarentena
  public async checkQuarantineViolations(): Promise<{
    violations: Array<{
      quarantineId: string;
      bovineId: string;
      violationType: string;
      location: Location;
      timestamp: Date;
    }>;
    alertsGenerated: number;
  }> {
    try {
      console.log("🚨 Verificando violaciones de cuarentena...");

      const response = await api.get("/health/quarantine-violations");

      if (!response.success || !response.data) {
        return { violations: [], alertsGenerated: 0 };
      }

      // Generar alertas automáticas para violaciones
      let alertsGenerated = 0;
      for (const violation of response.data.violations) {
        await this.createHealthAlert({
          type: AlertType.QUARANTINE_VIOLATION,
          severity: AlertSeverity.CRITICAL,
          title: "Violación de Cuarentena Detectada",
          description: `Animal ${violation.bovineId} ha violado la cuarentena`,
          location: violation.location,
          bovineIds: [violation.bovineId],
          affectedCount: 1,
          estimatedRisk: 90,
          recommendations: [
            "Localizar y aislar animal inmediatamente",
            "Revisar protocolos de seguridad",
            "Evaluar daño potencial",
            "Notificar a supervisor",
          ],
          actionRequired: true,
        });
        alertsGenerated++;
      }

      return { ...response.data, alertsGenerated };
    } catch (error) {
      console.error("❌ Error verificando violaciones de cuarentena:", error);
      return { violations: [], alertsGenerated: 0 };
    }
  }

  // MÉTODOS DE ALERTAS DE SALUD

  // Crear alerta de salud
  private async createHealthAlert(
    alertData: Omit<HealthAlert, "id" | "createdAt" | "updatedAt" | "createdBy">
  ): Promise<HealthAlert> {
    try {
      const response = await api.post<HealthAlert>("/health/alerts", alertData);

      if (!response.success || !response.data) {
        throw new Error("Error creando alerta de salud");
      }

      // Agregar a alertas activas
      this.activeAlerts.push(response.data);

      // Emitir evento para notificación en tiempo real
      window.dispatchEvent(
        new CustomEvent("health:alert", {
          detail: response.data,
        })
      );

      console.log(`🚨 Alerta de salud creada: ${response.data.title}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando alerta de salud:", error);
      throw error;
    }
  }

  // Verificar alertas de salud automáticamente
  private async checkHealthAlerts(): Promise<void> {
    try {
      // Verificar violaciones de cuarentena
      await this.checkQuarantineViolations();

      // Verificar vacunaciones vencidas
      await this.checkOverdueVaccinations();

      // Verificar mortalidad anormal
      await this.checkAbnormalMortality();

      // Verificar condiciones ambientales
      await this.checkEnvironmentalRisks();
    } catch (error) {
      console.error("❌ Error verificando alertas de salud:", error);
    }
  }

  // Verificar vacunaciones vencidas
  private async checkOverdueVaccinations(): Promise<void> {
    try {
      const response = await api.get("/health/overdue-vaccinations");

      if (response.success && response.data?.length > 0) {
        await this.createHealthAlert({
          type: AlertType.VACCINATION_DUE,
          severity: AlertSeverity.MEDIUM,
          title: `${response.data.length} Vacunaciones Vencidas`,
          description:
            "Se han detectado vacunaciones que requieren atención inmediata",
          bovineIds: response.data.map((v: any) => v.bovineId),
          affectedCount: response.data.length,
          estimatedRisk: 60,
          recommendations: [
            "Programar vacunaciones inmediatas",
            "Evaluar estado de salud de animales",
            "Actualizar calendario de vacunación",
            "Verificar disponibilidad de vacunas",
          ],
          actionRequired: true,
        });
      }
    } catch (error) {
      console.error("❌ Error verificando vacunaciones vencidas:", error);
    }
  }

  // Verificar mortalidad anormal
  private async checkAbnormalMortality(): Promise<void> {
    try {
      const response = await api.get("/health/mortality-analysis");

      if (response.success && response.data?.isAbnormal) {
        await this.createHealthAlert({
          type: AlertType.ABNORMAL_MORTALITY,
          severity: AlertSeverity.HIGH,
          title: "Mortalidad Anormal Detectada",
          description: `Tasa de mortalidad ${response.data.rate}% excede el promedio normal`,
          affectedCount: response.data.deathCount,
          estimatedRisk: 85,
          recommendations: [
            "Investigar causas de mortalidad",
            "Revisar condiciones ambientales",
            "Evaluar calidad de alimento y agua",
            "Consultar con veterinario especialista",
          ],
          actionRequired: true,
        });
      }
    } catch (error) {
      console.error("❌ Error verificando mortalidad anormal:", error);
    }
  }

  // Verificar riesgos ambientales
  private async checkEnvironmentalRisks(): Promise<void> {
    try {
      const response = await api.get("/health/environmental-risks");

      if (response.success && response.data?.risks?.length > 0) {
        for (const risk of response.data.risks) {
          if (risk.level === "high" || risk.level === "critical") {
            await this.createHealthAlert({
              type: AlertType.ENVIRONMENTAL_RISK,
              severity:
                risk.level === "critical"
                  ? AlertSeverity.CRITICAL
                  : AlertSeverity.HIGH,
              title: `Riesgo Ambiental: ${risk.factor}`,
              description: risk.description,
              affectedCount: risk.affectedAnimals,
              estimatedRisk: risk.riskScore,
              recommendations: risk.mitigation,
              actionRequired: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("❌ Error verificando riesgos ambientales:", error);
    }
  }

  // MÉTODOS DE MÉTRICAS Y REPORTES DE SALUD

  // Obtener métricas de salud del rebaño
  public async getHerdHealthMetrics(): Promise<HerdHealthMetrics> {
    try {
      const cacheKey = "herd_health_metrics";
      const cached = this.getFromCache<HerdHealthMetrics>(cacheKey);

      if (cached) {
        return cached;
      }

      console.log("📊 Obteniendo métricas de salud del rebaño...");

      const response = await api.get<HerdHealthMetrics>(
        REPORT_ENDPOINTS.HEALTH_OVERVIEW
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo métricas de salud");
      }

      this.setCache(cacheKey, response.data);
      console.log("✅ Métricas de salud obtenidas");

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo métricas de salud:", error);
      throw error;
    }
  }

  // Generar reporte de tendencias de salud
  public async generateHealthTrendReport(
    period: "weekly" | "monthly" | "quarterly" | "yearly",
    metrics: string[] = [
      "morbidity",
      "mortality",
      "vaccination_coverage",
      "recovery_rate",
    ]
  ): Promise<{ reportId: string; downloadUrl: string }> {
    try {
      console.log(`📈 Generando reporte de tendencias de salud: ${period}`);

      const response = await api.post("/health/reports/trends", {
        period,
        metrics,
        includeCharts: true,
        format: "pdf",
      });

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte de tendencias");
      }

      console.log("✅ Reporte de tendencias generado");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte de tendencias:", error);
      throw error;
    }
  }

  // Análisis de eficacia de tratamientos
  public async analyzeTreatmentEfficacy(
    treatmentType?: string,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<{
    overallEfficacy: number;
    treatmentAnalysis: Array<{
      treatment: string;
      successRate: number;
      averageRecoveryTime: number;
      costEffectiveness: number;
      sideEffects: string[];
      recommendations: string[];
    }>;
  }> {
    try {
      console.log("💊 Analizando eficacia de tratamientos...");

      const response = await api.post("/health/treatment-efficacy-analysis", {
        treatmentType,
        timeRange,
      });

      if (!response.success || !response.data) {
        throw new Error("Error analizando eficacia de tratamientos");
      }

      console.log("✅ Análisis de eficacia completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error analizando eficacia de tratamientos:", error);
      throw error;
    }
  }

  // MÉTODOS DE TRATAMIENTOS

  // Actualizar tratamiento
  public async updateTreatment(
    treatmentId: string,
    updates: Partial<Treatment>,
    sync: boolean = true
  ): Promise<Treatment> {
    try {
      console.log(`💉 Actualizando tratamiento: ${treatmentId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "update_treatment",
          id: treatmentId,
          data: updates,
          timestamp: Date.now(),
        });

        console.log(
          "📱 Actualización de tratamiento guardada para sincronización offline"
        );
        throw new Error(
          "Actualización guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<Treatment>(
        `/health/treatments/${treatmentId}`,
        updates
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando tratamiento");
      }

      this.clearCache();
      console.log("✅ Tratamiento actualizado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando tratamiento:", error);
      throw error;
    }
  }

  // Monitorear efectos secundarios
  public async monitorSideEffects(treatmentId: string): Promise<{
    detected: boolean;
    effects: string[];
    severity: "mild" | "moderate" | "severe";
    recommendations: string[];
  }> {
    try {
      const response = await api.get(
        `/health/treatments/${treatmentId}/side-effects`
      );

      if (!response.success || !response.data) {
        return {
          detected: false,
          effects: [],
          severity: "mild",
          recommendations: [],
        };
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error monitoreando efectos secundarios:", error);
      return {
        detected: false,
        effects: [],
        severity: "mild",
        recommendations: [],
      };
    }
  }

  // MÉTODOS DE EXPORTACIÓN Y REPORTES

  // Exportar datos de salud
  public async exportHealthData(
    format: "csv" | "excel" | "pdf",
    dataType:
      | "health_records"
      | "illnesses"
      | "vaccinations"
      | "treatments"
      | "alerts"
  ): Promise<void> {
    try {
      console.log(
        `📤 Exportando datos de salud: ${dataType} en formato ${format}`
      );

      await apiClient.download(
        `/health/export/${dataType}`,
        `health_${dataType}_${format}_${new Date().getTime()}.${format}`,
        (progress) => {
          console.log(`📥 Progreso de exportación: ${progress}%`);
        }
      );

      console.log("✅ Exportación completada");
    } catch (error) {
      console.error("❌ Error exportando datos de salud:", error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIDAD

  // Obtener alertas activas
  public getActiveAlerts(): HealthAlert[] {
    return this.activeAlerts.filter((alert) => !alert.resolvedAt);
  }

  // Resolver alerta
  public async resolveAlert(
    alertId: string,
    resolutionNotes: string
  ): Promise<void> {
    try {
      await api.put(`/health/alerts/${alertId}/resolve`, {
        resolutionNotes,
        resolvedAt: new Date(),
      });

      // Remover de alertas activas
      this.activeAlerts = this.activeAlerts.filter(
        (alert) => alert.id !== alertId
      );

      console.log("✅ Alerta resuelta exitosamente");
    } catch (error) {
      console.error("❌ Error resolviendo alerta:", error);
      throw error;
    }
  }

  // Obtener colores para severidad de enfermedades
  public getIllnessSeverityColor(severity: IllnessSeverity): string {
    const colors = {
      [IllnessSeverity.MILD]: "#22C55E", // Verde
      [IllnessSeverity.MODERATE]: "#F59E0B", // Amarillo
      [IllnessSeverity.SEVERE]: "#EF4444", // Rojo
      [IllnessSeverity.CRITICAL]: "#DC2626", // Rojo oscuro
      [IllnessSeverity.TERMINAL]: "#7F1D1D", // Rojo muy oscuro
    };

    return colors[severity] || "#6B7280";
  }

  // Obtener colores para alertas
  public getAlertSeverityColor(severity: AlertSeverity): string {
    const colors = {
      [AlertSeverity.INFO]: "#3B82F6", // Azul
      [AlertSeverity.LOW]: "#10B981", // Verde
      [AlertSeverity.MEDIUM]: "#F59E0B", // Amarillo
      [AlertSeverity.HIGH]: "#EF4444", // Rojo
      [AlertSeverity.CRITICAL]: "#DC2626", // Rojo oscuro
      [AlertSeverity.EMERGENCY]: "#7F1D1D", // Rojo muy oscuro
    };

    return colors[severity] || "#6B7280";
  }

  // Calcular puntaje de salud general
  public calculateOverallHealthScore(metrics: HerdHealthMetrics): number {
    const weights = {
      healthPercentage: 0.3,
      vaccinationCoverage: 0.2,
      mortalityRate: 0.25, // invertido (menos mortalidad = mejor puntaje)
      morbidityRate: 0.15, // invertido
      bodyCondition: 0.1,
    };

    let score = 0;
    score += metrics.healthPercentage * weights.healthPercentage;
    score += metrics.vaccinationCoverage * weights.vaccinationCoverage;
    score += (100 - metrics.mortalityRate) * weights.mortalityRate;
    score += (100 - metrics.morbidityRate) * weights.morbidityRate;
    score += (metrics.averageBodyCondition / 5) * 100 * weights.bodyCondition;

    return Math.round(score);
  }

  // Destructor
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (this.alertTimer) {
      clearInterval(this.alertTimer);
    }

    if (this.predictionTimer) {
      clearInterval(this.predictionTimer);
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.clearCache();
    this.pendingOperations = [];
    this.activeAlerts = [];

    console.log("🔒 HealthService destruido correctamente");
  }
}

// Instancia singleton del servicio de salud
export const healthService = new HealthService();

// Exports adicionales
export {
  HealthRecordType,
  IllnessSeverity,
  AlertType,
  AlertSeverity,
  PredictionType,
  QuarantineStatus,
  ILLNESS_SEVERITY_LABELS,
  ALERT_SEVERITY_LABELS,
};

export type {
  HealthRecord,
  Illness,
  HealthAlert,
  EpidemiologicalAnalysis,
  HealthPrediction,
  HerdHealthMetrics,
  QuarantineZone,
  Treatment,
  LabResult,
};

// Export default para compatibilidad
export default healthService;
