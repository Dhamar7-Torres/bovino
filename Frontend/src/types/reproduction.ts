// Tipos para sistema completo de gestión reproductiva bovina
// Incluye ciclos estrales, inseminación, gestación, partos y mejoramiento genético

import { BaseEntity, Coordinates } from "./common";

// Interfaz principal del programa reproductivo
export interface ReproductiveProgram extends BaseEntity {
  // Información básica
  name: string;
  description: string;
  objectives: ReproductiveObjective[];

  // Configuración del programa
  config: ReproductiveProgramConfig;

  // Animales incluidos
  participants: ReproductiveParticipant[];

  // Protocolos aplicados
  protocols: ReproductiveProtocol[];

  // Seguimiento y métricas
  tracking: ReproductiveTracking;

  // Análisis y resultados
  performance: ReproductivePerformance;

  // Planificación temporal
  schedule: ReproductiveSchedule;

  // Estado del programa
  status: ProgramStatus;
}

// Participante en programa reproductivo
export interface ReproductiveParticipant extends BaseEntity {
  // Información del animal
  animalId: string;
  earTag: string;
  name?: string;
  breed: string;

  // Estado reproductivo actual
  currentStatus: ReproductiveStatus;

  // Historial reproductivo
  history: ReproductiveHistory;

  // Evaluación reproductiva
  evaluation: ReproductiveEvaluation;

  // Objetivo reproductivo individual
  objectives: IndividualObjective[];

  // Eventos programados
  scheduledEvents: ScheduledReproductiveEvent[];

  // Ubicación actual
  currentLocation: Coordinates;

  // Notas y observaciones
  notes: string[];

  // Estado de participación
  participationStatus: ParticipationStatus;
}

// Historial reproductivo completo
export interface ReproductiveHistory {
  // Eventos reproductivos
  events: ReproductiveEvent[];

  // Ciclos estrales
  estralCycles: EstralCycle[];

  // Servicios (inseminaciones/montas)
  services: ReproductiveService[];

  // Gestaciones
  pregnancies: Pregnancy[];

  // Partos
  calvings: CalvingEvent[];

  // Tratamientos reproductivos
  treatments: ReproductiveTreatment[];

  // Exámenes reproductivos
  examinations: ReproductiveExamination[];

  // Métricas calculadas
  metrics: ReproductiveMetrics;
}

// Ciclo estral completo
export interface EstralCycle extends BaseEntity {
  // Información básica
  cycleNumber: number;
  startDate: Date;
  endDate?: Date;

  // Fases del ciclo
  phases: EstralPhase[];

  // Detección de estro
  estrusDetection: EstrusDetection;

  // Calidad del estro
  estrusQuality: EstrusQuality;

  // Ovulación
  ovulation?: OvulationData;

  // Corpus luteum
  corpusLuteum?: CorpusLuteumData;

  // Duración total del ciclo
  cycleDuration: number; // días

  // Anomalías detectadas
  abnormalities: CycleAbnormality[];

  // Notas del veterinario
  veterinaryNotes?: string;
}

// Anomalía del ciclo
export interface CycleAbnormality {
  type: string;
  description: string;
  severity: SeverityLevel;
  detectionDate: Date;
  treatment?: string;
}

// Fase del ciclo estral
export interface EstralPhase {
  phase: EstralPhaseType;
  startDate: Date;
  endDate?: Date;
  duration: number; // horas

  // Características observadas
  characteristics: PhaseCharacteristic[];

  // Signos clínicos
  clinicalSigns: ClinicalSign[];

  // Observaciones
  observations: string[];

  // Confianza en la identificación
  confidence: ConfidenceLevel;
}

// Característica de fase
export interface PhaseCharacteristic {
  characteristic: string;
  intensity: IntensityLevel;
  duration: number; // horas
  notes?: string;
}

// Signo clínico
export interface ClinicalSign {
  sign: string;
  severity: SeverityLevel;
  duration: number; // horas
  firstObserved: Date;
  lastObserved?: Date;
}

// Detección de estro
export interface EstrusDetection {
  // Método de detección
  detectionMethod: EstrusDetectionMethod[];

  // Signos observados
  signs: EstrusSign[];

  // Intensidad del estro
  intensity: EstrusIntensity;

  // Duración del estro
  duration: number; // horas

  // Momento de detección
  detectionTime: Date;

  // Personal que detectó
  detectedBy: string;

  // Tecnología utilizada
  technology?: DetectionTechnology;

  // Confianza en la detección
  confidence: ConfidenceLevel;

  // Validación veterinaria
  veterinaryValidation?: boolean;
}

// Tecnología de detección
export interface DetectionTechnology {
  deviceType: string;
  manufacturer: string;
  model: string;
  accuracy: number; // porcentaje
  batteryLife?: number; // días
  lastCalibration?: Date;
}

// Calidad del estro
export interface EstrusQuality {
  // Puntuación general (1-10)
  overallScore: number;

  // Criterios evaluados
  criteria: QualityCriteria;

  // Predictores de fertilidad
  fertilityPredictors: FertilityPredictor[];

  // Recomendaciones
  recommendations: string[];

  // Probabilidad de concepción
  conceptionProbability: number; // 0-1
}

// Criterios de calidad del estro
export interface QualityCriteria {
  standingBehavior: QualityScore;
  mucusCharacteristics: QualityScore;
  vulvarChanges: QualityScore;
  behavioralChanges: QualityScore;
  durationAppropriate: QualityScore;
  timingCorrect: QualityScore;
}

// Puntuación de calidad
export interface QualityScore {
  score: number; // 1-10
  weight: number; // peso en cálculo total
  notes?: string;
}

// Predictor de fertilidad
export interface FertilityPredictor {
  predictor: string;
  value: number;
  weight: number; // peso en el cálculo
  impact: FertilityImpact;
}

// Datos de ovulación
export interface OvulationData {
  // Tiempo estimado de ovulación
  estimatedTime: Date;

  // Método de determinación
  determinationMethod: OvulationDetectionMethod;

  // Folículo dominante
  dominantFollicle?: FollicleData;

  // Datos ultrasonográficos
  ultrasoundData?: UltrasoundData;

  // Calidad de la ovulación
  quality: OvulationQuality;

  // Confirmación
  confirmed: boolean;

  // Notas veterinarias
  veterinaryNotes?: string;
}

// Datos ultrasonográficos
export interface UltrasoundData {
  examinationDate: Date;
  operator: string;
  findings: UltrasoundFinding[];
  images: UltrasoundImage[];
  equipment: UltrasoundEquipment;
}

// Hallazgo ultrasonográfico
export interface UltrasoundFinding {
  structure: AnatomicalStructure;
  measurement: number;
  unit: string;
  description: string;
  abnormal: boolean;
}

// Imagen ultrasonográfica
export interface UltrasoundImage {
  id: string;
  filename: string;
  description: string;
  measurements: ImageMeasurement[];
  quality: ImageQuality;
}

// Medición en imagen
export interface ImageMeasurement {
  structure: string;
  value: number;
  unit: string;
  confidence: number;
}

// Calidad de imagen
export interface ImageQuality {
  resolution: string;
  clarity: QualityRating;
  artifacts: string[];
  usableForDiagnosis: boolean;
}

// Equipo de ultrasonido
export interface UltrasoundEquipment {
  manufacturer: string;
  model: string;
  probeType: string;
  frequency: number; // MHz
  lastCalibration: Date;
}

// Calidad de ovulación
export interface OvulationQuality {
  timing: QualityRating;
  follicleSize: QualityRating;
  hormoneProfile: QualityRating;
  overallRating: QualityRating;
}

// Datos del folículo
export interface FollicleData {
  // Ubicación (ovario izquierdo/derecho)
  location: OvaryLocation;

  // Tamaño
  diameter: number; // mm

  // Forma
  shape: FollicleShape;

  // Características ultrasonográficas
  ultrasoundCharacteristics: UltrasoundCharacteristics;

  // Evolución temporal
  development: FollicleDevelopment[];

  // Predicción de ovulación
  ovulationPrediction: Date;
}

// Características ultrasonográficas
export interface UltrasoundCharacteristics {
  echogenicity: Echogenicity;
  wallThickness: number; // mm
  fluidClarity: FluidClarity;
  vascularity: VascularityLevel;
}

// Desarrollo folicular
export interface FollicleDevelopment {
  date: Date;
  diameter: number; // mm
  characteristics: string[];
  growthRate: number; // mm/día
}

// Datos del corpus luteum
export interface CorpusLuteumData {
  // Formación
  formationDate: Date;

  // Ubicación
  location: OvaryLocation;

  // Tamaño
  diameter: number; // mm

  // Características morfológicas
  morphology: CorpusLuteumMorphology;

  // Funcionalidad
  functionality: CLFunctionality;

  // Progesterona sérica
  progesteroneLevels: ProgesteroneLevel[];

  // Regresión
  regression?: CLRegression;
}

// Morfología del corpus luteum
export interface CorpusLuteumMorphology {
  diameter: number; // mm
  echogenicity: Echogenicity;
  cavitation: boolean;
  vascularization: VascularityLevel;
}

// Funcionalidad del CL
export interface CLFunctionality {
  progesteroneProduction: ProductionLevel;
  duration: number; // días
  qualityScore: number; // 1-10
}

// Nivel de progesterona
export interface ProgesteroneLevel {
  measurementDate: Date;
  level: number; // ng/ml
  reference: ProgesteroneReference;
  interpretation: string;
}

// Regresión del CL
export interface CLRegression {
  regressionDate: Date;
  method: RegressionMethod;
  completeness: RegressionCompleteness;
  duration: number; // días
}

// Servicio reproductivo (IA o monta natural)
export interface ReproductiveService extends BaseEntity {
  // Tipo de servicio
  serviceType: ServiceType;

  // Fecha y hora del servicio
  serviceDateTime: Date;

  // Información del macho
  maleInfo: MaleReproductorInfo;

  // Información del material genético
  geneticMaterial?: GeneticMaterialInfo;

  // Técnico responsable
  technician: TechnicianInfo;

  // Condiciones del servicio
  serviceConditions: ServiceConditions;

  // Timing del servicio
  timing: ServiceTiming;

  // Calidad del servicio
  serviceQuality: ServiceQuality;

  // Seguimiento post-servicio
  followUp: PostServiceFollowUp;

  // Costos asociados
  costs: ServiceCosts;

  // Resultado final
  outcome: ServiceOutcome;
}

// Información del reproductor macho
export interface MaleReproductorInfo {
  // Identificación
  id: string;
  name: string;
  earTag?: string;
  registrationNumber?: string;

  // Características genéticas
  breed: string;
  bloodline: string;
  pedigree: PedigreeInfo;

  // Evaluación reproductiva
  reproductiveEvaluation: MaleReproductiveEvaluation;

  // Métricas de rendimiento
  performanceMetrics: MalePerformanceMetrics;

  // Estado de salud reproductiva
  healthStatus: ReproductiveHealthStatus;

  // Disponibilidad
  availability: MaleAvailability;
}

// Información del pedigrí
export interface PedigreeInfo {
  sire: string;
  dam: string;
  grandsires: string[];
  granddams: string[];
  registrationNumbers: string[];
  completeness: number; // porcentaje
}

// Evaluación reproductiva del macho
export interface MaleReproductiveEvaluation {
  libido: LibidoScore;
  mountingAbility: MountingAbilityScore;
  semenQuality: SemenQualityScore;
  physicalSoundness: PhysicalSoundnessScore;
  overallScore: number; // 1-10
  lastEvaluationDate: Date;
}

// Métricas de rendimiento del macho
export interface MalePerformanceMetrics {
  conceptionRate: number;
  calvingRate: number;
  offspringQuality: number;
  serviceCapacity: number; // servicios por temporada
  longevity: number; // años en servicio
}

// Estado de salud reproductiva
export interface ReproductiveHealthStatus {
  status: HealthStatusLevel;
  lastCheckDate: Date;
  conditions: string[];
  medications: string[];
  restrictions: string[];
}

// Disponibilidad del macho
export interface MaleAvailability {
  available: boolean;
  startDate?: Date;
  endDate?: Date;
  restrictions: string[];
  location: string;
  reservations: ServiceReservation[];
}

// Reserva de servicio
export interface ServiceReservation {
  id: string;
  animalId: string;
  serviceDate: Date;
  serviceType: ServiceType;
  notes?: string;
}

// Información del material genético
export interface GeneticMaterialInfo {
  // Tipo de material
  materialType: GeneticMaterialType;

  // Identificación del lote
  batchNumber: string;
  productionDate: Date;
  expirationDate: Date;

  // Características del semen
  semenCharacteristics?: SemenCharacteristics;

  // Proveedor
  supplier: SupplierInfo;

  // Almacenamiento
  storage: StorageInfo;

  // Calidad evaluada
  qualityAssessment: GeneticMaterialQuality;

  // Trazabilidad
  traceability: MaterialTraceability;
}

// Características del semen
export interface SemenCharacteristics {
  // Concentración
  concentration: number; // millones/ml

  // Motilidad
  motility: MotilityData;

  // Morfología
  morphology: MorphologyData;

  // Viabilidad
  viability: number; // porcentaje

  // Integridad del ADN
  dnaIntegrity: number; // porcentaje

  // Volumen
  volume: number; // ml

  // pH
  ph: number;

  // Fecha de evaluación
  evaluationDate: Date;

  // Laboratorio evaluador
  laboratory: string;
}

// Datos de motilidad
export interface MotilityData {
  // Motilidad total
  totalMotility: number; // porcentaje

  // Motilidad progresiva
  progressiveMotility: number; // porcentaje

  // Velocidad
  velocity: VelocityParameters;

  // Clasificación por grados
  gradeClassification: MotilityGrade[];

  // Método de evaluación
  evaluationMethod: MotilityEvaluationMethod;
}

// Parámetros de velocidad espermática
export interface VelocityParameters {
  // Velocidad curvilínea
  vcl: number; // μm/s

  // Velocidad promedio
  vap: number; // μm/s

  // Velocidad en línea recta
  vsl: number; // μm/s

  // Linealidad
  linearity: number; // porcentaje

  // Rectitud
  straightness: number; // porcentaje
}

// Grado de motilidad
export interface MotilityGrade {
  grade: number; // 0-4
  percentage: number;
  description: string;
}

// Datos de morfología
export interface MorphologyData {
  normalMorphology: number; // porcentaje
  headDefects: number; // porcentaje
  midpieceDefects: number; // porcentaje
  tailDefects: number; // porcentaje
  evaluationMethod: MorphologyEvaluationMethod;
}

// Información del proveedor
export interface SupplierInfo {
  name: string;
  country: string;
  certification: string[];
  qualityRating: number; // 1-10
  contactInfo: string;
}

// Información de almacenamiento
export interface StorageInfo {
  facility: string;
  temperature: number; // Celsius
  storageConditions: string[];
  locationInStorage: string;
  handlingProtocol: string;
}

// Calidad del material genético
export interface GeneticMaterialQuality {
  preFreeze: QualityScore;
  postThaw: QualityScore;
  fieldFertility: QualityScore;
  overallRating: QualityRating;
}

// Trazabilidad del material
export interface MaterialTraceability {
  originFarm: string;
  collectionDate: Date;
  processingFacility: string;
  processingDate: Date;
  transportHistory: TransportRecord[];
  storageHistory: StorageRecord[];
}

// Registro de transporte
export interface TransportRecord {
  id: string;
  fromLocation: string;
  toLocation: string;
  transportDate: Date;
  carrier: string;
  conditions: string[];
}

// Registro de almacenamiento
export interface StorageRecord {
  id: string;
  facility: string;
  storageDate: Date;
  temperature: number;
  duration: number; // días
  conditions: string[];
}

// Información del técnico
export interface TechnicianInfo {
  id: string;
  name: string;
  certification: string[];
  experience: number; // años
  specialization: string[];
  contactInfo: string;
}

// Condiciones del servicio
export interface ServiceConditions {
  temperature: number; // Celsius
  humidity: number; // porcentaje
  weather: string;
  location: string;
  timeOfDay: string;
  stressFactors: string[];
}

// Timing del servicio
export interface ServiceTiming {
  hoursFromEstrusStart: number;
  timeRelativeToOvulation: string;
  optimalTiming: boolean;
  timingScore: number; // 1-10
}

// Calidad del servicio
export interface ServiceQuality {
  technicalExecution: QualityRating;
  animalHandling: QualityRating;
  materialQuality: QualityRating;
  timing: QualityRating;
  overallScore: number; // 1-10
}

// Seguimiento post-servicio
export interface PostServiceFollowUp {
  estrusReturn: boolean;
  returnDate?: Date;
  pregnancyCheck: Date;
  pregnancyResult?: boolean;
  notes: string[];
}

// Costos del servicio
export interface ServiceCosts {
  geneticMaterial: number;
  technician: number;
  veterinary: number;
  transport: number;
  other: number;
  total: number;
}

// Resultado del servicio
export interface ServiceOutcome {
  conception: boolean;
  confirmationDate?: Date;
  embryonicLoss?: boolean;
  lossDate?: Date;
  calvingDate?: Date;
  calfInfo?: CalfBirthInfo;
}

// Gestación completa
export interface Pregnancy extends BaseEntity {
  // Información básica
  confirmationDate: Date;
  estimatedConceptionDate: Date;
  expectedCalvingDate: Date;

  // Método de confirmación
  confirmationMethod: PregnancyConfirmationMethod;

  // Seguimiento gestacional
  monitoring: PregnancyMonitoring;

  // Desarrollo fetal
  fetalDevelopment: FetalDevelopment[];

  // Salud materna
  maternalHealth: MaternalHealthTracking;

  // Nutrición gestacional
  nutrition: GestationalNutrition;

  // Complicaciones
  complications: PregnancyComplication[];

  // Preparación para el parto
  calvingPreparation: CalvingPreparation;

  // Resultado de la gestación
  outcome: PregnancyOutcome;
}

// Seguimiento gestacional
export interface PregnancyMonitoring {
  // Exámenes programados
  scheduledExams: PregnancyExam[];

  // Ultrasonografías
  ultrasounds: PregnancyUltrasound[];

  // Análisis de laboratorio
  laboratoryTests: PregnancyLabTest[];

  // Monitoreo nutricional
  nutritionalMonitoring: NutritionalAssessment[];

  // Evaluación corporal
  bodyConditionTracking: BodyConditionRecord[];

  // Vacunaciones
  vaccinations: PregnancyVaccination[];
}

// Examen de gestación
export interface PregnancyExam {
  id: string;
  examDate: Date;
  examType: string;
  veterinarian: string;
  findings: string[];
  recommendations: string[];
}

// Ultrasonido de gestación
export interface PregnancyUltrasound {
  examinationDate: Date;
  gestationAge: number; // días
  fetalViability: boolean;
  fetalSize: FetalMeasurements;
  placentalHealth: PlacentalAssessment;
  amniotic: AmnioticAssessment;
  twins: boolean;
  abnormalities: FetalAbnormality[];
}

// Mediciones fetales
export interface FetalMeasurements {
  crownRumpLength: number; // cm
  biparietal: number; // cm
  heartRate: number; // latidos/min
  estimatedWeight: number; // kg
}

// Evaluación placentaria
export interface PlacentalAssessment {
  thickness: number; // mm
  vascularity: VascularityLevel;
  position: string;
  abnormalities: string[];
}

// Evaluación amniótica
export interface AmnioticAssessment {
  fluidLevel: FluidLevel;
  clarity: FluidClarity;
  volume: number; // ml
  abnormalities: string[];
}

// Anormalidad fetal
export interface FetalAbnormality {
  type: string;
  description: string;
  severity: SeverityLevel;
  prognosis: string;
}

// Análisis de laboratorio de gestación
export interface PregnancyLabTest {
  id: string;
  testDate: Date;
  testType: string;
  results: LabResult[];
  interpretation: string;
}

// Resultado de laboratorio
export interface LabResult {
  parameter: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: string;
}

// Evaluación nutricional
export interface NutritionalAssessment {
  assessmentDate: Date;
  bodyWeight: number; // kg
  bodyConditionScore: BodyConditionScore;
  feedIntake: number; // kg/día
  supplements: SupplementRecord[];
  recommendations: string[];
}

// Registro de suplemento
export interface SupplementRecord {
  supplement: string;
  dosage: number;
  unit: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
}

// Registro de condición corporal
export interface BodyConditionRecord {
  assessmentDate: Date;
  score: BodyConditionScore;
  assessor: string;
  notes?: string;
}

// Vacunación durante gestación
export interface PregnancyVaccination {
  id: string;
  vaccinationDate: Date;
  vaccine: string;
  dose: string;
  veterinarian: string;
  gestationWeek: number;
}

// Desarrollo fetal
export interface FetalDevelopment {
  assessmentDate: Date;
  gestationAge: number; // días
  measurements: FetalMeasurements;
  development: DevelopmentStage;
  normalDevelopment: boolean;
  concerns: string[];
}

// Etapa de desarrollo
export interface DevelopmentStage {
  stage: string;
  expectedSize: number;
  organDevelopment: OrganDevelopment[];
  milestones: DevelopmentMilestone[];
}

// Desarrollo de órganos
export interface OrganDevelopment {
  organ: string;
  developmentStatus: string;
  normalForAge: boolean;
  notes?: string;
}

// Hito de desarrollo
export interface DevelopmentMilestone {
  milestone: string;
  expectedDate: Date;
  achieved: boolean;
  notes?: string;
}

// Seguimiento de salud materna
export interface MaternalHealthTracking {
  bodyCondition: BodyConditionRecord[];
  weight: WeightRecord[];
  nutrition: NutritionalAssessment[];
  healthChecks: HealthCheckRecord[];
  complications: MaternalComplication[];
}

// Registro de peso
export interface WeightRecord {
  date: Date;
  weight: number; // kg
  method: string;
  notes?: string;
}

// Registro de chequeo de salud
export interface HealthCheckRecord {
  id: string;
  checkDate: Date;
  checkType: string;
  veterinarian: string;
  findings: string[];
  treatments: string[];
}

// Complicación materna
export interface MaternalComplication {
  complication: string;
  onset: Date;
  severity: SeverityLevel;
  treatment: string[];
  resolved: boolean;
  resolutionDate?: Date;
}

// Nutrición gestacional
export interface GestationalNutrition {
  nutritionPlan: NutritionPlan;
  caloriRequirements: CalorieRequirements;
  supplements: SupplementPlan;
  monitoring: NutritionMonitoring;
}

// Plan nutricional
export interface NutritionPlan {
  planName: string;
  gestationStage: string;
  feedComposition: FeedComponent[];
  feedingSchedule: FeedingSchedule;
}

// Componente del alimento
export interface FeedComponent {
  ingredient: string;
  percentage: number;
  nutritionalValue: NutritionalValue;
}

// Valor nutricional
export interface NutritionalValue {
  protein: number; // porcentaje
  energy: number; // Mcal/kg
  fiber: number; // porcentaje
  calcium: number; // porcentaje
  phosphorus: number; // porcentaje
}

// Horario de alimentación
export interface FeedingSchedule {
  feedingsPerDay: number;
  feedingTimes: string[];
  portionSizes: number[];
}

// Requerimientos calóricos
export interface CalorieRequirements {
  maintenance: number; // Mcal/día
  pregnancy: number; // Mcal/día
  total: number; // Mcal/día
  adjustmentFactors: AdjustmentFactor[];
}

// Factor de ajuste
export interface AdjustmentFactor {
  factor: string;
  multiplier: number;
  reason: string;
}

// Plan de suplementos
export interface SupplementPlan {
  vitamins: VitaminSupplement[];
  minerals: MineralSupplement[];
  other: OtherSupplement[];
}

// Suplemento vitamínico
export interface VitaminSupplement {
  vitamin: string;
  dosage: number;
  unit: string;
  frequency: string;
}

// Suplemento mineral
export interface MineralSupplement {
  mineral: string;
  dosage: number;
  unit: string;
  frequency: string;
}

// Otro suplemento
export interface OtherSupplement {
  supplement: string;
  dosage: number;
  unit: string;
  frequency: string;
  purpose: string;
}

// Monitoreo nutricional
export interface NutritionMonitoring {
  feedIntakeTracking: boolean;
  weightTracking: boolean;
  bodyConditionTracking: boolean;
  bloodParameters: boolean;
  frequency: string;
}

// Complicación de gestación
export interface PregnancyComplication {
  complication: string;
  onsetDate: Date;
  severity: SeverityLevel;
  symptoms: string[];
  treatment: ComplicationTreatment;
  outcome: ComplicationOutcome;
}

// Tratamiento de complicación
export interface ComplicationTreatment {
  treatmentType: string;
  medications: MedicationTreatment[];
  procedures: TreatmentProcedure[];
  veterinarian: string;
  cost: number;
}

// Tratamiento con medicamentos
export interface MedicationTreatment {
  medication: string;
  dosage: string;
  frequency: string;
  duration: number; // días
  route: string;
}

// Procedimiento de tratamiento
export interface TreatmentProcedure {
  procedure: string;
  date: Date;
  outcome: string;
  complications?: string[];
}

// Resultado de complicación
export interface ComplicationOutcome {
  resolved: boolean;
  resolutionDate?: Date;
  chronicCondition: boolean;
  impact: ComplicationImpact;
}

// Impacto de complicación
export interface ComplicationImpact {
  onMother: string[];
  onFetus: string[];
  onFutureReproduction: string[];
  economicImpact: number;
}

// Preparación para el parto
export interface CalvingPreparation {
  expectedDate: Date;
  preparationStartDate: Date;
  nutritionAdjustment: NutritionAdjustment;
  vaccinations: VaccinationRecord[];
  facilityPreparation: FacilityPreparation;
  personnelAssignment: PersonnelAssignment[];
  emergencyPlan: EmergencyPlan;
}

// Ajuste nutricional
export interface NutritionAdjustment {
  adjustmentDate: Date;
  changes: NutritionalChange[];
  reason: string;
  expectedBenefit: string;
}

// Cambio nutricional
export interface NutritionalChange {
  component: string;
  previousAmount: number;
  newAmount: number;
  unit: string;
  reason: string;
}

// Registro de vacunación
export interface VaccinationRecord {
  id: string;
  vaccinationDate: Date;
  vaccine: string;
  dose: string;
  veterinarian: string;
  purpose: string;
}

// Preparación de instalaciones
export interface FacilityPreparation {
  facilityType: string;
  preparationTasks: PreparationTask[];
  equipmentCheck: EquipmentCheck[];
  supplyInventory: SupplyInventory[];
}

// Tarea de preparación
export interface PreparationTask {
  task: string;
  assignedTo: string;
  dueDate: Date;
  completed: boolean;
  completionDate?: Date;
}

// Verificación de equipo
export interface EquipmentCheck {
  equipment: string;
  checkDate: Date;
  condition: string;
  issues?: string[];
  repairNeeded: boolean;
}

// Inventario de suministros
export interface SupplyInventory {
  item: string;
  currentStock: number;
  requiredStock: number;
  unit: string;
  orderNeeded: boolean;
}

// Asignación de personal
export interface PersonnelAssignment {
  role: string;
  assignedPerson: PersonInfo;
  availability: AvailabilityInfo;
  backupPerson?: PersonInfo;
}

// Información de persona
export interface PersonInfo {
  id: string;
  name: string;
  role: string;
  experience: number; // años
  contactInfo: ContactInfo;
}

// Información de contacto
export interface ContactInfo {
  phone: string;
  email?: string;
  address?: string;
}

// Información de disponibilidad
export interface AvailabilityInfo {
  available: boolean;
  availabilityPeriod: AvailabilityPeriod;
  restrictions: string[];
}

// Período de disponibilidad
export interface AvailabilityPeriod {
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
}

// Franja horaria
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// Plan de emergencia
export interface EmergencyPlan {
  contacts: EmergencyContact[];
  procedures: EmergencyProcedure[];
  equipmentLocation: EquipmentLocation[];
  transportPlan: TransportPlan;
}

// Contacto de emergencia
export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available24h: boolean;
  specialization: string[];
}

// Procedimiento de emergencia
export interface EmergencyProcedure {
  scenario: string;
  steps: ProcedureStep[];
  requiredPersonnel: string[];
  requiredEquipment: string[];
}

// Paso de procedimiento
export interface ProcedureStep {
  stepNumber: number;
  description: string;
  timeLimit?: number; // minutos
  criticalStep: boolean;
}

// Ubicación de equipo
export interface EquipmentLocation {
  equipment: string;
  location: string;
  accessibility: string;
  lastChecked: Date;
}

// Plan de transporte
export interface TransportPlan {
  primaryRoute: TransportRoute;
  alternativeRoutes: TransportRoute[];
  vehicleInfo: VehicleInfo;
  estimatedTime: number; // minutos
}

// Ruta de transporte
export interface TransportRoute {
  routeName: string;
  distance: number; // km
  estimatedTime: number; // minutos
  roadConditions: string;
  alternatives: string[];
}

// Información del vehículo
export interface VehicleInfo {
  vehicleType: string;
  availability: boolean;
  fuelLevel: number; // porcentaje
  condition: string;
  driver: PersonInfo;
}

// Resultado de gestación
export interface PregnancyOutcome {
  outcome: PregnancyOutcomeType;
  calvingDate?: Date;
  gestationLength?: number; // días
  calfInfo?: CalfBirthInfo;
  complications?: string[];
  motherCondition?: string;
}

// Información del ternero al nacer
export interface CalfBirthInfo {
  // Identificación
  temporaryId: string;
  gender: CalfGender;

  // Métricas físicas
  birthWeight: number; // kg
  bodyLength: number; // cm
  heartGirth: number; // cm

  // Evaluación vital
  vitalSigns: NewbornVitalSigns;

  // Vigor y reflejos
  vigor: CalfVigor;
  reflexes: NewbornReflexes;

  // Características físicas
  physicalCharacteristics: CalfPhysicalTraits;

  // Estado de salud inicial
  healthStatus: NewbornHealthStatus;

  // Intervenciones inmediatas
  immediateInterventions: NewbornIntervention[];

  // Evaluación genética preliminar
  geneticAssessment?: PreliminaryGeneticAssessment;
}

// Signos vitales del recién nacido
export interface NewbornVitalSigns {
  heartRate: number; // latidos por minuto
  respiratoryRate: number; // respiraciones por minuto
  temperature: number; // Celsius
  bloodPressure?: number;
  oxygenSaturation?: number;
}

// Reflejos del recién nacido
export interface NewbornReflexes {
  suckingReflex: ReflexAssessment;
  standingReflex: ReflexAssessment;
  withdrawalReflex: ReflexAssessment;
  menaceResponse: ReflexAssessment;
}

// Evaluación de reflejo
export interface ReflexAssessment {
  present: boolean;
  strength: ReflexStrength;
  normalForAge: boolean;
  notes?: string;
}

// Características físicas del ternero
export interface CalfPhysicalTraits {
  color: string;
  markings: string[];
  muscling: MusclingScore;
  frame: FrameScore;
  structuralCorrectness: StructuralScore;
}

// Intervención neonatal
export interface NewbornIntervention {
  intervention: InterventionType;
  timePerformed: Date;
  performedBy: string;
  outcome: InterventionOutcome;
  notes?: string;
}

// Evaluación genética preliminar
export interface PreliminaryGeneticAssessment {
  parentage: ParentageAssessment;
  breeding: BreedingAssessment;
  geneticMarkers: GeneticMarkerAssessment[];
  expectedPerformance: ExpectedPerformanceAssessment;
}

// Evaluación de parentesco
export interface ParentageAssessment {
  sireConfirmed: boolean;
  damConfirmed: boolean;
  method: string;
  confidence: number; // porcentaje
}

// Evaluación de raza
export interface BreedingAssessment {
  breedComposition: BreedComposition[];
  purityLevel: number; // porcentaje
  registrationEligible: boolean;
}

// Composición racial
export interface BreedComposition {
  breed: string;
  percentage: number;
  confidence: number;
}

// Evaluación de marcador genético
export interface GeneticMarkerAssessment {
  marker: string;
  value: string;
  trait: string;
  impact: GeneticImpact;
}

// Evaluación de rendimiento esperado
export interface ExpectedPerformanceAssessment {
  growthPotential: PerformancePrediction;
  reproductivePotential: PerformancePrediction;
  healthPredisposition: HealthPredisposition[];
}

// Predicción de rendimiento
export interface PerformancePrediction {
  trait: string;
  expectedValue: number;
  confidence: number; // porcentaje
  ranking: PerformanceRanking;
}

// Predisposición de salud
export interface HealthPredisposition {
  condition: string;
  riskLevel: RiskLevel;
  prevention: PreventionStrategy[];
}

// Estrategia de prevención
export interface PreventionStrategy {
  strategy: string;
  implementation: string;
  effectiveness: number; // porcentaje
}

// Análisis de rendimiento reproductivo
export interface ReproductivePerformance {
  // Período de análisis
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
  };

  // Métricas clave
  keyMetrics: ReproductiveKPI[];

  // Análisis de fertilidad
  fertilityAnalysis: FertilityAnalysis;

  // Eficiencia reproductiva
  efficiency: ReproductiveEfficiency;

  // Análisis económico
  economicAnalysis: ReproductiveEconomicAnalysis;

  // Comparaciones
  benchmarking: ReproductiveBenchmarking;

  // Tendencias
  trends: ReproductiveTrend[];

  // Factores de riesgo
  riskFactors: ReproductiveRiskFactor[];

  // Recomendaciones de mejora
  improvements: PerformanceImprovement[];
}

// KPI reproductivo
export interface ReproductiveKPI {
  name: string;
  value: number;
  unit: string;
  target?: number;
  benchmark?: number;

  // Variación respecto a período anterior
  periodChange: number;
  changePercentage: number;

  // Tendencia
  trend: TrendDirection;

  // Clasificación
  performance: PerformanceRating;

  // Factores contributivos
  contributingFactors: string[];
}

// Análisis de fertilidad
export interface FertilityAnalysis {
  // Tasa de concepción general
  overallConceptionRate: number;

  // Tasa de concepción por método
  conceptionByMethod: Record<ServiceType, number>;

  // Tasa de preñez a primera inseminación
  firstServiceConceptionRate: number;

  // Servicios por concepción
  servicesPerConception: number;

  // Tasa de pérdidas embrionarias
  embryonicLossRate: number;

  // Factores que afectan fertilidad
  fertilityFactors: FertilityFactor[];

  // Análisis estacional
  seasonalAnalysis: SeasonalFertilityData[];

  // Análisis por grupos
  groupAnalysis: GroupFertilityAnalysis[];
}

// Factor de fertilidad
export interface FertilityFactor {
  factor: string;
  impact: FertilityImpact;
  significance: StatisticalSignificance;

  // Correlación con resultados
  correlation: number;

  // Recomendaciones
  recommendations: string[];
}

// Datos de fertilidad estacional
export interface SeasonalFertilityData {
  season: Season;
  conceptionRate: number;
  pregnancyRate: number;
  calvingRate: number;
  factors: SeasonalFactor[];
}

// Factor estacional
export interface SeasonalFactor {
  factor: string;
  impact: FertilityImpact;
  severity: SeverityLevel;
  mitigation: string[];
}

// Análisis de fertilidad por grupo
export interface GroupFertilityAnalysis {
  groupCriteria: string;
  groupSize: number;
  conceptionRate: number;
  comparison: GroupComparison;
  factors: GroupSpecificFactor[];
}

// Comparación de grupos
export interface GroupComparison {
  comparedTo: string;
  difference: number;
  significance: StatisticalSignificance;
  interpretation: string;
}

// Factor específico del grupo
export interface GroupSpecificFactor {
  factor: string;
  impact: FertilityImpact;
  uniqueToGroup: boolean;
  recommendations: string[];
}

// Eficiencia reproductiva
export interface ReproductiveEfficiency {
  daysOpen: number;
  calvingInterval: number;
  servicesPerConception: number;
  firstServiceConceptionRate: number;
  pregnancyRate: number;
  calvingRate: number;
}

// Análisis económico reproductivo
export interface ReproductiveEconomicAnalysis {
  totalCosts: number;
  costPerService: number;
  costPerPregnancy: number;
  costPerCalf: number;
  revenue: number;
  profitability: number;
  roi: number; // Return on Investment
}

// Benchmarking reproductivo
export interface ReproductiveBenchmarking {
  industryAverage: BenchmarkData[];
  topPerformers: BenchmarkData[];
  similarOperations: BenchmarkData[];
  historicalPerformance: BenchmarkData[];
}

// Datos de benchmark
export interface BenchmarkData {
  metric: string;
  value: number;
  percentile: number;
  source: string;
  date: Date;
}

// Tendencia reproductiva
export interface ReproductiveTrend {
  metric: string;
  direction: TrendDirection;
  magnitude: number;
  period: number; // meses
  significance: StatisticalSignificance;
  causes: string[];
}

// Factor de riesgo reproductivo
export interface ReproductiveRiskFactor {
  factor: string;
  riskLevel: RiskLevel;
  impact: ImpactLevel;
  mitigation: string[];
  monitoring: string[];
}

// Mejora de rendimiento
export interface PerformanceImprovement {
  area: string;
  currentPerformance: number;
  targetPerformance: number;
  recommendations: string[];
  timeline: string;
  expectedBenefit: number;
  implementationCost: number;
}

// Interfaces requeridas adicionales
export interface ReproductiveObjective {
  type: ObjectiveType;
  description: string;
  target: number;
  unit: string;
  deadline: Date;
  priority: Priority;
}

export interface ReproductiveProgramConfig {
  breedingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  synchronizationProtocols: string[];
  targetConceptionRate: number;
  maxServicesPerCow: number;
  minimumRestPeriod: number; // días
  useAI: boolean;
  useNaturalBreeding: boolean;
  useEmbryoTransfer: boolean;
}

export interface ReproductiveTracking {
  cycleTracking: boolean;
  estrusDetection: boolean;
  pregnancyMonitoring: boolean;
  calvingPrediction: boolean;
  performanceMetrics: boolean;
  costTracking: boolean;
}

export interface ReproductiveSchedule {
  // Objetivos de la temporada
  seasonGoals: SeasonGoal[];

  // Eventos programados
  scheduledEvents: ScheduledEvent[];

  // Sincronización de grupos
  groupSynchronization: GroupSynchronization[];

  // Uso de reproductores
  bullUtilization: BullUtilizationPlan;

  // Planificación de partos
  calvingSchedule: CalvingSchedulePlan;

  // Recursos requeridos
  resourceRequirements: ResourceRequirement[];

  // Cronograma de manejo
  managementCalendar: ManagementCalendarEvent[];
}

export interface SeasonGoal {
  goal: string;
  target: number;
  unit: string;
  deadline: Date;
  responsible: string;
}

export interface ScheduledEvent {
  eventType: string;
  scheduledDate: Date;
  animalIds: string[];
  responsible: string;
  resources: string[];
}

export interface GroupSynchronization {
  groupId: string;
  protocol: string;
  startDate: Date;
  expectedEstrus: Date;
  participants: string[];
}

export interface BullUtilizationPlan {
  bullId: string;
  assignedFemales: string[];
  serviceCapacity: number;
  schedule: BullSchedule[];
}

export interface BullSchedule {
  date: Date;
  animalId: string;
  serviceType: ServiceType;
  estimated: boolean;
}

export interface CalvingSchedulePlan {
  expectedCalvings: ExpectedCalving[];
  resourceAllocation: CalvingResourceAllocation;
  personnelSchedule: CalvingPersonnelSchedule[];
}

export interface ExpectedCalving {
  animalId: string;
  expectedDate: Date;
  riskLevel: RiskLevel;
  assistanceNeeded: boolean;
}

export interface CalvingResourceAllocation {
  facilities: FacilityAllocation[];
  equipment: EquipmentAllocation[];
  supplies: SupplyAllocation[];
}

export interface FacilityAllocation {
  facility: string;
  capacity: number;
  reservations: FacilityReservation[];
}

export interface FacilityReservation {
  animalId: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
}

export interface EquipmentAllocation {
  equipment: string;
  availability: EquipmentAvailability[];
}

export interface EquipmentAvailability {
  date: Date;
  available: boolean;
  reservedFor?: string;
}

export interface SupplyAllocation {
  supply: string;
  currentStock: number;
  requiredStock: number;
  reorderPoint: number;
}

export interface CalvingPersonnelSchedule {
  date: Date;
  shift: string;
  assignedPersonnel: PersonnelAssignment[];
  onCallPersonnel: PersonnelAssignment[];
}

export interface ResourceRequirement {
  resource: string;
  quantity: number;
  unit: string;
  requiredDate: Date;
  cost: number;
}

export interface ManagementCalendarEvent {
  eventType: string;
  date: Date;
  description: string;
  animals: string[];
  responsible: string;
  estimated: boolean;
}

export interface ReproductiveEvent extends BaseEntity {
  eventType: ReproductiveEventType;
  eventDate: Date;
  description: string;
  outcome?: string;
  cost?: number;
  veterinarianId?: string;
  notes?: string;
  location?: Coordinates;
}

export interface ScheduledReproductiveEvent {
  eventType: ReproductiveEventType;
  scheduledDate: Date;
  estimatedDuration: number; // minutos
  priority: Priority;
  requiredPersonnel: string[];
  requiredResources: string[];
  notes?: string;
}

export interface IndividualObjective {
  animalId: string;
  objective: string;
  target: any;
  deadline: Date;
  status: ObjectiveStatus;
}

export interface ReproductiveEvaluation {
  evaluationDate: Date;
  breedingSoundness: BreedingSoundnessScore;
  reproductiveHistory: HistoryScore;
  bodyCondition: BodyConditionScore;
  age: number; // meses
  recommendations: string[];
  suitableForBreeding: boolean;
}

export interface ReproductiveMetrics {
  // Intervalo entre partos
  calvingInterval: number; // días

  // Período de espera voluntario
  voluntaryWaitingPeriod: number; // días

  // Días abiertos
  daysOpen: number;

  // Días al primer servicio
  daysToFirstService: number;

  // Edad al primer parto
  ageAtFirstCalving?: number; // meses

  // Número de lactancias
  lactationNumber: number;

  // Tasa de descarte por problemas reproductivos
  reproductiveCullRate: number;

  // Índice de fertilidad
  fertilityIndex: number;

  // Vida productiva reproductiva
  reproductiveLifespan: number; // años
}

export interface ReproductiveTreatment extends BaseEntity {
  // Tipo de tratamiento
  treatmentType: ReproductiveTreatmentType;

  // Indicación médica
  indication: TreatmentIndication;

  // Protocolo aplicado
  protocol: TreatmentProtocol;

  // Medicamentos utilizados
  medications: ReproductiveMedication[];

  // Cronograma de aplicación
  schedule: TreatmentSchedule;

  // Monitoreo del tratamiento
  monitoring: TreatmentMonitoring;

  // Respuesta al tratamiento
  response: TreatmentResponse;

  // Efectos secundarios
  sideEffects: SideEffect[];

  // Costos del tratamiento
  costs: TreatmentCosts;

  // Veterinario responsable
  veterinarian: VeterinarianInfo;
}

export interface TreatmentIndication {
  diagnosis: string;
  symptoms: string[];
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  prognosis: PrognosisLevel;
}

export interface TreatmentProtocol {
  name: string;
  description: string;
  steps: TreatmentStep[];
  duration: number; // días
  expectedOutcome: string;
  alternatives: string[];
}

export interface TreatmentStep {
  stepNumber: number;
  description: string;
  timing: StepTiming;
  requiredPersonnel: string[];
  requiredEquipment: string[];
  medications?: ProtocolMedication[];
  monitoring?: StepMonitoring;
}

export interface StepTiming {
  dayOfTreatment: number;
  timeOfDay: string;
  relativeTo?: string;
  tolerance: number; // minutos
}

export interface StepMonitoring {
  parameters: string[];
  frequency: string;
  alerts: string[];
}

export interface ProtocolMedication {
  medication: string;
  dosage: string;
  route: AdministrationRoute;
  timing: string;
  contraindications: string[];
}

export interface ReproductiveMedication {
  medication: MedicationInfo;
  dosage: DosageInfo;
  administration: AdministrationInfo;
  duration: number; // días
  monitoring: MedicationMonitoring;
}

export interface MedicationInfo {
  name: string;
  activeIngredient: string;
  manufacturer: string;
  batchNumber?: string;
  expirationDate?: Date;
}

export interface DosageInfo {
  amount: number;
  unit: string;
  frequency: string;
  totalDose: number;
}

export interface AdministrationInfo {
  route: AdministrationRoute;
  site?: string;
  method: string;
  administeredBy: string;
}

export interface MedicationMonitoring {
  parameters: MonitoringParameter[];
  frequency: string;
  alerts: AlertSetting[];
}

export interface MonitoringParameter {
  parameter: string;
  normalRange: string;
  alertThreshold: string;
  unit: string;
}

export interface AlertSetting {
  condition: string;
  severity: SeverityLevel;
  notification: string[];
  escalation: boolean;
}

export interface TreatmentSchedule {
  startDate: Date;
  endDate: Date;
  frequency: string;
  times: TreatmentTime[];
  reminders: ReminderSetting[];
}

export interface TreatmentTime {
  time: string;
  medication?: string;
  procedure?: string;
  notes?: string;
}

export interface ReminderSetting {
  reminderType: string;
  timing: string;
  recipients: string[];
  method: string;
}

export interface TreatmentMonitoring {
  parameters: MonitoringParameter[];
  frequency: string;
  alerts: AlertSetting[];
  reportingSchedule: ReportingSchedule;
}

export interface ReportingSchedule {
  frequency: string;
  recipients: string[];
  format: string;
  automated: boolean;
}

export interface TreatmentResponse {
  responseType: ResponseType;
  timeToResponse: number; // horas
  effectiveness: EffectivenessRating;
  sideEffects: SideEffect[];
  completionStatus: CompletionStatus;
}

export interface SideEffect {
  effect: string;
  severity: SeverityLevel;
  startDate: Date;
  endDate?: Date;
  management: string[];
}

export interface TreatmentCosts {
  medications: number;
  procedures: number;
  monitoring: number;
  personnel: number;
  other: number;
  total: number;
}

export interface VeterinarianInfo {
  id: string;
  name: string;
  license: string;
  specialization: string[];
  contactInfo: ContactInfo;
  availability: AvailabilityInfo;
}

export interface ReproductiveExamination extends BaseEntity {
  // Tipo de examen
  examinationType: ReproductiveExamType;

  // Fecha del examen
  examinationDate: Date;

  // Veterinario examinador
  veterinarian: VeterinarianInfo;

  // Razón del examen
  reason: ExaminationReason;

  // Métodos utilizados
  methods: ExaminationMethod[];

  // Hallazgos clínicos
  clinicalFindings: ClinicalFinding[];

  // Diagnóstico
  diagnosis: ReproductiveDiagnosis;

  // Recomendaciones
  recommendations: ExaminationRecommendation[];

  // Seguimiento requerido
  followUpRequired: boolean;
  followUpDate?: Date;

  // Imágenes y documentos
  attachments: ExaminationAttachment[];
}

export interface ExaminationReason {
  primaryReason: string;
  secondaryReasons: string[];
  urgency: UrgencyLevel;
  referral?: ReferralInfo;
}

export interface ReferralInfo {
  referringVeterinarian: string;
  referralReason: string;
  specialtyRequired: string;
}

export interface ExaminationMethod {
  method: string;
  technique: string;
  equipment?: string;
  findings: string[];
}

export interface ClinicalFinding {
  finding: string;
  location: AnatomicalLocation;
  severity: SeverityLevel;
  significance: ClinicalSignificance;
  followUpRequired: boolean;
}

export interface AnatomicalLocation {
  organ: string;
  region: string;
  laterality?: string;
  details?: string;
}

export interface ReproductiveDiagnosis {
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  confidence: ConfidenceLevel;
  differential: string[];
  prognosis: PrognosisLevel;
}

export interface ExaminationRecommendation {
  recommendation: string;
  priority: Priority;
  timeline: string;
  expectedOutcome: string;
  alternatives: string[];
}

export interface ExaminationAttachment {
  type: AttachmentType;
  filename: string;
  description: string;
  uploadDate: Date;
  size: number; // bytes
}

export interface ReproductiveProtocol extends BaseEntity {
  // Información básica
  name: string;
  description: string;
  purpose: ProtocolPurpose;

  // Pasos del protocolo
  steps: ProtocolStep[];

  // Medicamentos incluidos
  medications: ProtocolMedication[];

  // Cronograma
  timeline: ProtocolTimeline;

  // Criterios de inclusión
  inclusionCriteria: InclusionCriteria;

  // Contraindicaciones
  contraindications: string[];

  // Monitoreo requerido
  monitoring: ProtocolMonitoring;

  // Métricas de éxito
  successMetrics: SuccessMetric[];

  // Costos estimados
  estimatedCosts: ProtocolCosts;

  // Eficacia reportada
  efficacy: ProtocolEfficacy;
}

export interface ProtocolPurpose {
  primaryPurpose: string;
  secondaryPurposes: string[];
  targetOutcome: string;
  successCriteria: string[];
}

export interface ProtocolStep {
  stepNumber: number;
  description: string;
  timing: StepTiming;
  requiredPersonnel: string[];
  requiredEquipment: string[];
  medications?: ProtocolMedication[];
  monitoring?: StepMonitoring;
}

export interface ProtocolTimeline {
  totalDuration: number; // días
  keyMilestones: Milestone[];
  criticalPeriods: CriticalPeriod[];
}

export interface Milestone {
  name: string;
  targetDate: Date;
  description: string;
  successCriteria: string[];
  dependencies: string[];
}

export interface CriticalPeriod {
  name: string;
  startDay: number;
  endDay: number;
  riskFactors: string[];
  monitoringRequired: string[];
}

export interface InclusionCriteria {
  age: AgeRange;
  bodyCondition: BodyConditionRange;
  reproductiveStatus: ReproductiveStatus[];
  healthStatus: HealthStatusLevel[];
  excludingConditions: string[];
}

export interface AgeRange {
  minimum: number;
  maximum: number;
  unit: string;
  preferredRange?: [number, number];
}

export interface BodyConditionRange {
  minimum: BodyConditionScore;
  maximum: BodyConditionScore;
  optimal?: BodyConditionScore;
}

export interface ProtocolMonitoring {
  requiredExams: ExaminationRequirement[];
  laboratoryTests: LabTestRequirement[];
  imaging: ImagingRequirement[];
  behavioralObservation: BehavioralObservation[];
}

export interface ExaminationRequirement {
  examinationType: ReproductiveExamType;
  frequency: string;
  timing: string;
  mandatory: boolean;
}

export interface LabTestRequirement {
  testType: string;
  parameters: string[];
  frequency: string;
  timing: string;
}

export interface ImagingRequirement {
  imagingType: string;
  frequency: string;
  timing: string;
  indications: string[];
}

export interface BehavioralObservation {
  behavior: string;
  frequency: string;
  duration: number; // minutos
  parameters: string[];
}

export interface SuccessMetric {
  metric: string;
  target: number;
  unit: string;
  measurement: MeasurementMethod;
  evaluationPeriod: number; // días
}

export interface MeasurementMethod {
  method: string;
  equipment?: string;
  frequency: string;
  operator: string;
}

export interface ProtocolCosts {
  medications: number;
  examinations: number;
  laborTests: number;
  personnel: number;
  equipment: number;
  total: number;
}

export interface ProtocolEfficacy {
  successRate: number;
  conceptionRate: number;
  pregnancyRate: number;
  calvingRate: number;
  sideEffectRate: number;
  costEffectiveness: number;
}

// Evento de parto
export interface CalvingEvent extends BaseEntity {
  // Información temporal
  calvingDate: Date;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutos

  // Dificultad del parto
  calvingDifficulty: CalvingDifficulty;

  // Asistencia requerida
  assistance: CalvingAssistance;

  // Información del ternero
  calfInfo: CalfBirthInfo;

  // Condición materna
  maternalCondition: MaternalCondition;

  // Complicaciones
  complications: CalvingComplication[];

  // Manejo post-parto
  postPartumManagement: PostPartumManagement;

  // Personal involucrado
  personnel: CalvingPersonnel;

  // Documentación
  documentation: CalvingDocumentation;
}

export interface CalvingAssistance {
  assistanceRequired: boolean;
  assistanceType: CalvingAssistanceType[];
  personnel: CalvingPersonnel;
  equipment: CalvingEquipment[];
  medications: CalvingMedication[];
}

export interface CalvingEquipment {
  equipment: string;
  used: boolean;
  condition: string;
  notes?: string;
}

export interface CalvingMedication {
  medication: string;
  dosage: string;
  route: string;
  indication: string;
  administeredBy: string;
}

export interface CalvingComplication {
  complication: string;
  severity: SeverityLevel;
  treatment: string[];
  outcome: string;
  impact: ComplicationImpact;
}

export interface MaternalCondition {
  vitalSigns: MaternalVitalSigns;
  placentaExpulsion: PlacentaExpulsion;
  uterineInvolution: UterineInvolution;
  lactationStart: LactationStart;
  bodyCondition: BodyConditionAssessment;
  complications: MaternalComplication[];
}

export interface MaternalVitalSigns {
  temperature: number; // Celsius
  heartRate: number; // latidos/min
  respiratoryRate: number; // respiraciones/min
  bloodPressure?: number;
  attitude: AttitudeScore;
}

export interface PlacentaExpulsion {
  expelled: boolean;
  expulsionTime?: Date;
  timeToExpulsion?: number; // horas
  complete: boolean;
  complications?: string[];
}

export interface UterineInvolution {
  involutionStatus: InvolutionStatus;
  timeToInvolution?: number; // días
  complications?: string[];
  treatment?: string[];
}

export interface LactationStart {
  lactationStarted: boolean;
  timeToLactation?: number; // horas
  colostumQuality: ColostrumQuality;
  milkProduction: EarlyMilkProduction;
}

export interface ColostrumQuality {
  quality: QualityRating;
  volume: number; // litros
  antibodyLevel?: number;
  testMethod?: string;
}

export interface EarlyMilkProduction {
  volume: number; // litros/día
  quality: MilkQuality;
  trend: ProductionTrend;
}

export interface MilkQuality {
  fatContent: number; // porcentaje
  proteinContent: number; // porcentaje
  somaticCellCount?: number;
  bacterialCount?: number;
}

export interface BodyConditionAssessment {
  score: BodyConditionScore;
  assessor: string;
  changes: BodyConditionChange[];
  recommendations: string[];
}

export interface BodyConditionChange {
  timeframe: string;
  change: number;
  direction: ChangeDirection;
  causes: string[];
}

export interface PostPartumManagement {
  immediateAssessment: ImmediatePostPartumAssessment;
  monitoring: PostPartumMonitoring;
  nutrition: PostPartumNutrition;
  treatments: PostPartumTreatment[];
  milking: MilkingManagement;
  breeding: BreedingManagement;
}

export interface ImmediatePostPartumAssessment {
  assessmentTime: Date;
  overallCondition: ConditionRating;
  priorities: AssessmentPriority[];
  interventions: ImmediateIntervention[];
}

export interface AssessmentPriority {
  priority: string;
  urgency: UrgencyLevel;
  action: string;
  responsible: string;
}

export interface ImmediateIntervention {
  intervention: string;
  timePerformed: Date;
  outcome: string;
  followUp?: string;
}

export interface PostPartumMonitoring {
  monitoringPlan: MonitoringPlan;
  dailyChecks: DailyCheck[];
  alerts: PostPartumAlert[];
  reportingSchedule: ReportingSchedule;
}

export interface MonitoringPlan {
  duration: number; // días
  frequency: string;
  parameters: MonitoringParameter[];
  personnel: string[];
}

export interface DailyCheck {
  checkDate: Date;
  checker: string;
  observations: CheckObservation[];
  concerns: string[];
  actions: string[];
}

export interface CheckObservation {
  parameter: string;
  value: string;
  normal: boolean;
  notes?: string;
}

export interface PostPartumAlert {
  alertType: string;
  condition: string;
  severity: SeverityLevel;
  action: string;
  escalation: boolean;
}

export interface PostPartumNutrition {
  nutritionPlan: PostPartumNutritionPlan;
  feedingSchedule: PostPartumFeedingSchedule;
  supplementation: PostPartumSupplementation;
  monitoring: NutritionMonitoring;
}

export interface PostPartumNutritionPlan {
  planName: string;
  lactationStage: string;
  energyRequirements: EnergyRequirements;
  proteinRequirements: ProteinRequirements;
  feedComposition: FeedComponent[];
}

export interface EnergyRequirements {
  maintenance: number; // Mcal/día
  lactation: number; // Mcal/día
  total: number; // Mcal/día
  adjustments: RequirementAdjustment[];
}

export interface ProteinRequirements {
  crudeProtein: number; // g/día
  bypassProtein: number; // g/día
  total: number; // g/día
  adjustments: RequirementAdjustment[];
}

export interface RequirementAdjustment {
  factor: string;
  adjustment: number;
  unit: string;
  reason: string;
}

export interface PostPartumFeedingSchedule {
  feedingsPerDay: number;
  feedingTimes: string[];
  portionSizes: FeedPortion[];
  waterRequirements: WaterRequirements;
}

export interface FeedPortion {
  feedType: string;
  amount: number;
  unit: string;
  time: string;
}

export interface WaterRequirements {
  dailyRequirement: number; // litros/día
  qualityStandards: WaterQualityStandard[];
  accessFrequency: string;
}

export interface WaterQualityStandard {
  parameter: string;
  acceptableRange: string;
  testFrequency: string;
}

export interface PostPartumSupplementation {
  vitamins: VitaminSupplement[];
  minerals: MineralSupplement[];
  other: OtherSupplement[];
  duration: number; // días
}

export interface PostPartumTreatment {
  treatmentType: string;
  indication: string;
  protocol: TreatmentProtocol;
  startDate: Date;
  duration: number; // días
  monitoring: TreatmentMonitoring;
}

export interface MilkingManagement {
  milkingSchedule: MilkingSchedule;
  milkingProcedure: MilkingProcedure;
  milkQuality: MilkQualityManagement;
  equipmentManagement: EquipmentManagement;
}

export interface MilkingSchedule {
  milkingsPerDay: number;
  milkingTimes: string[];
  startDate: Date;
  adjustments: ScheduleAdjustment[];
}

export interface ScheduleAdjustment {
  date: Date;
  change: string;
  reason: string;
  duration?: number; // días
}

export interface MilkingProcedure {
  preMillingPrep: PreparationStep[];
  milkingSteps: MilkingStep[];
  postMilkingCare: PostMilkingStep[];
  hygieneMeasures: HygieneMeasure[];
}

export interface PreparationStep {
  step: string;
  procedure: string;
  equipment?: string;
  timeRequired: number; // minutos
}

export interface MilkingStep {
  step: string;
  procedure: string;
  equipment: string;
  duration: number; // minutos
  qualityChecks: string[];
}

export interface PostMilkingStep {
  step: string;
  procedure: string;
  timeframe: string;
  importance: Priority;
}

export interface HygieneMeasure {
  measure: string;
  frequency: string;
  method: string;
  verification: string;
}

export interface MilkQualityManagement {
  qualityTests: MilkQualityTest[];
  standards: MilkQualityStandard[];
  correctionActions: QualityCorrectionAction[];
}

export interface MilkQualityTest {
  testType: string;
  frequency: string;
  parameters: string[];
  acceptableRanges: Record<string, string>;
}

export interface MilkQualityStandard {
  parameter: string;
  standard: string;
  measurement: string;
  frequency: string;
}

export interface QualityCorrectionAction {
  issue: string;
  action: string;
  timeframe: string;
  responsible: string;
}

export interface EquipmentManagement {
  equipmentList: MilkingEquipment[];
  maintenanceSchedule: MaintenanceSchedule[];
  cleaningProtocol: CleaningProtocol;
  qualityAssurance: EquipmentQualityAssurance;
}

export interface MilkingEquipment {
  equipment: string;
  model: string;
  serialNumber?: string;
  installationDate: Date;
  lastMaintenance: Date;
  condition: EquipmentCondition;
}

export interface MaintenanceSchedule {
  equipment: string;
  maintenanceType: string;
  frequency: string;
  lastPerformed: Date;
  nextDue: Date;
  responsible: string;
}

export interface CleaningProtocol {
  protocol: string;
  frequency: string;
  steps: CleaningStep[];
  verification: CleaningVerification[];
}

export interface CleaningStep {
  step: string;
  procedure: string;
  chemicals?: ChemicalUsage[];
  duration: number; // minutos
}

export interface ChemicalUsage {
  chemical: string;
  concentration: string;
  amount: number;
  unit: string;
  safetyMeasures: string[];
}

export interface CleaningVerification {
  check: string;
  method: string;
  frequency: string;
  acceptableCriteria: string;
}

export interface EquipmentQualityAssurance {
  qualityChecks: EquipmentQualityCheck[];
  calibrationSchedule: CalibrationSchedule[];
  performanceMonitoring: PerformanceMonitoring;
}

export interface EquipmentQualityCheck {
  check: string;
  frequency: string;
  method: string;
  acceptableCriteria: string;
}

export interface CalibrationSchedule {
  equipment: string;
  calibrationType: string;
  frequency: string;
  lastCalibration: Date;
  nextDue: Date;
}

export interface PerformanceMonitoring {
  metrics: EquipmentMetric[];
  alertThresholds: PerformanceThreshold[];
  reportingFrequency: string;
}

export interface EquipmentMetric {
  metric: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  trend: PerformanceTrend;
}

export interface PerformanceThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  action: string;
}

export interface BreedingManagement {
  breedingPlan: PostPartumBreedingPlan;
  voluntaryWaitingPeriod: VoluntaryWaitingPeriod;
  reproductiveExams: PostPartumReproductiveExam[];
  treatmentPlan?: PostPartumTreatmentPlan;
}

export interface PostPartumBreedingPlan {
  planType: string;
  targetFirstService: Date;
  serviceType: ServiceType;
  geneticObjectives: GeneticObjective[];
  successCriteria: BreedingSuccessCriteria;
}

export interface GeneticObjective {
  trait: string;
  target: string;
  priority: Priority;
  method: string;
}

export interface BreedingSuccessCriteria {
  conceptionRate: number;
  servicesPerConception: number;
  daysOpen: number;
  calvingInterval: number;
}

export interface VoluntaryWaitingPeriod {
  duration: number; // días
  startDate: Date;
  endDate: Date;
  criteria: VWPCriteria[];
  adjustments: VWPAdjustment[];
}

export interface VWPCriteria {
  criterion: string;
  requirement: string;
  assessment: string;
  met: boolean;
}

export interface VWPAdjustment {
  reason: string;
  adjustment: number; // días
  newEndDate: Date;
  approved: boolean;
}

export interface PostPartumReproductiveExam {
  examDate: Date;
  examType: string;
  veterinarian: string;
  findings: ReproductiveExamFinding[];
  recommendations: string[];
}

export interface ReproductiveExamFinding {
  structure: string;
  finding: string;
  normal: boolean;
  significance: ClinicalSignificance;
}

export interface PostPartumTreatmentPlan {
  indication: string;
  treatments: PostPartumTreatment[];
  monitoring: TreatmentMonitoring;
  expectedOutcome: string;
  successCriteria: string[];
}

export interface CalvingPersonnel {
  primaryHandler: PersonInfo;
  veterinarian?: PersonInfo;
  assistants: PersonInfo[];
  emergencyContact: PersonInfo;
}

export interface CalvingDocumentation {
  photos: CalvingPhoto[];
  videos: CalvingVideo[];
  reports: CalvingReport[];
  certificates: BirthCertificate[];
}

export interface CalvingPhoto {
  id: string;
  filename: string;
  timestamp: Date;
  description: string;
  category: PhotoCategory;
}

export interface CalvingVideo {
  id: string;
  filename: string;
  timestamp: Date;
  duration: number; // segundos
  description: string;
}

export interface CalvingReport {
  id: string;
  reportType: string;
  generatedDate: Date;
  author: string;
  content: string;
  attachments: string[];
}

export interface BirthCertificate {
  certificateNumber: string;
  issueDate: Date;
  issuingAuthority: string;
  calfInfo: CalfRegistrationInfo;
  parentInfo: ParentRegistrationInfo;
}

export interface CalfRegistrationInfo {
  temporaryId: string;
  registrationName?: string;
  breed: string;
  gender: CalfGender;
  birthDate: Date;
  birthWeight: number;
}

export interface ParentRegistrationInfo {
  sire: RegistrationInfo;
  dam: RegistrationInfo;
}

export interface RegistrationInfo {
  name: string;
  registrationNumber: string;
  breed: string;
  registrationAuthority: string;
}

// Enums principales

export enum ReproductiveStatus {
  HEIFER = "heifer", // Vaquilla
  OPEN = "open", // Vacía
  BRED = "bred", // Servida
  PREGNANT = "pregnant", // Gestante
  LACTATING = "lactating", // Lactando
  DRY = "dry", // Seca
  CULLED = "culled", // Desechada
}

export enum ServiceType {
  ARTIFICIAL_INSEMINATION = "artificial_insemination",
  NATURAL_BREEDING = "natural_breeding",
  EMBRYO_TRANSFER = "embryo_transfer",
  IN_VITRO_FERTILIZATION = "in_vitro_fertilization",
  TIMED_AI = "timed_ai",
  FIXED_TIME_AI = "fixed_time_ai",
}

export enum EstrusDetectionMethod {
  VISUAL_OBSERVATION = "visual_observation",
  ACTIVITY_MONITORS = "activity_monitors",
  PEDOMETERS = "pedometers",
  HEAT_DETECTOR_PATCHES = "heat_detector_patches",
  CHIN_BALL_MARKERS = "chin_ball_markers",
  HORMONE_TESTING = "hormone_testing",
  ULTRASOUND = "ultrasound",
  TAIL_PAINT = "tail_paint",
  SCRATCH_CARDS = "scratch_cards",
  ELECTRONIC_SYSTEMS = "electronic_systems",
}

export enum EstrusSign {
  STANDING_TO_BE_MOUNTED = "standing_to_be_mounted",
  MOUNTING_OTHER_CATTLE = "mounting_other_cattle",
  RESTLESSNESS = "restlessness",
  DECREASED_FEED_INTAKE = "decreased_feed_intake",
  INCREASED_ACTIVITY = "increased_activity",
  VULVAR_SWELLING = "vulvar_swelling",
  CLEAR_VAGINAL_DISCHARGE = "clear_vaginal_discharge",
  MUCUS_DISCHARGE = "mucus_discharge",
  BELLOWING = "bellowing",
  CHIN_RESTING = "chin_resting",
  SNIFFING_GENITALS = "sniffing_genitals",
  FOLLOWING_OTHER_CATTLE = "following_other_cattle",
}

export enum EstrusIntensity {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

export enum EstralPhaseType {
  PROESTRUS = "proestrus",
  ESTRUS = "estrus",
  METESTRUS = "metestrus",
  DIESTRUS = "diestrus",
}

export enum OvulationDetectionMethod {
  ULTRASOUND = "ultrasound",
  PROGESTERONE_LEVELS = "progesterone_levels",
  LH_SURGE = "lh_surge",
  BEHAVIORAL_OBSERVATION = "behavioral_observation",
  RECTAL_PALPATION = "rectal_palpation",
}

export enum PregnancyConfirmationMethod {
  RECTAL_PALPATION = "rectal_palpation",
  ULTRASOUND = "ultrasound",
  BLOOD_TEST = "blood_test",
  MILK_TEST = "milk_test",
  TRANSRECTAL_ULTRASOUND = "transrectal_ultrasound",
  PREGNANCY_ASSOCIATED_GLYCOPROTEINS = "pregnancy_associated_glycoproteins",
}

export enum CalvingDifficulty {
  UNASSISTED = "unassisted",
  EASY_ASSISTANCE = "easy_assistance",
  MODERATE_ASSISTANCE = "moderate_assistance",
  DIFFICULT_EXTRACTION = "difficult_extraction",
  CAESAREAN_SECTION = "caesarean_section",
  VETERINARY_ASSISTANCE = "veterinary_assistance",
}

export enum CalfGender {
  MALE = "male",
  FEMALE = "female",
}

export enum CalfVigor {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  WEAK = "weak",
  VERY_WEAK = "very_weak",
}

export enum ReproductiveTreatmentType {
  HORMONE_THERAPY = "hormone_therapy",
  SYNCHRONIZATION_PROTOCOL = "synchronization_protocol",
  OVULATION_INDUCTION = "ovulation_induction",
  LUTEAL_REGRESSION = "luteal_regression",
  FOLLICULAR_DEVELOPMENT = "follicular_development",
  EMBRYO_TRANSFER_PREP = "embryo_transfer_prep",
  FERTILITY_ENHANCEMENT = "fertility_enhancement",
  POSTPARTUM_TREATMENT = "postpartum_treatment",
}

export enum ReproductiveExamType {
  BREEDING_SOUNDNESS = "breeding_soundness",
  PREGNANCY_CHECK = "pregnancy_check",
  POSTPARTUM_EXAM = "postpartum_exam",
  REPRODUCTIVE_TRACT_EXAM = "reproductive_tract_exam",
  FOLLICULAR_DYNAMICS = "follicular_dynamics",
  CORPUS_LUTEUM_EXAM = "corpus_luteum_exam",
  SEMEN_EVALUATION = "semen_evaluation",
  ARTIFICIAL_INSEMINATION_CHECK = "artificial_insemination_check",
}

export enum GeneticMaterialType {
  FRESH_SEMEN = "fresh_semen",
  FROZEN_SEMEN = "frozen_semen",
  FRESH_EMBRYO = "fresh_embryo",
  FROZEN_EMBRYO = "frozen_embryo",
  IN_VITRO_EMBRYO = "in_vitro_embryo",
  SEXED_SEMEN = "sexed_semen",
}

export enum MotilityEvaluationMethod {
  VISUAL_MICROSCOPY = "visual_microscopy",
  COMPUTER_ASSISTED = "computer_assisted",
  FLOW_CYTOMETRY = "flow_cytometry",
  FLUORESCENT_STAINING = "fluorescent_staining",
}

export enum MorphologyEvaluationMethod {
  BRIGHT_FIELD = "bright_field",
  PHASE_CONTRAST = "phase_contrast",
  DIFFERENTIAL_INTERFERENCE = "differential_interference",
  FLUORESCENT = "fluorescent",
}

export enum OvaryLocation {
  LEFT = "left",
  RIGHT = "right",
}

export enum FollicleShape {
  ROUND = "round",
  OVAL = "oval",
  IRREGULAR = "irregular",
}

export enum Echogenicity {
  ANECHOIC = "anechoic",
  HYPOECHOIC = "hypoechoic",
  ISOECHOIC = "isoechoic",
  HYPERECHOIC = "hyperechoic",
}

export enum FluidClarity {
  CLEAR = "clear",
  SLIGHTLY_TURBID = "slightly_turbid",
  TURBID = "turbid",
  OPAQUE = "opaque",
}

export enum VascularityLevel {
  ABSENT = "absent",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  ABUNDANT = "abundant",
}

export enum ProductionLevel {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  EXCESSIVE = "excessive",
}

export enum ProgesteroneReference {
  BASELINE = "baseline",
  LUTEAL_PHASE = "luteal_phase",
  PREGNANCY = "pregnancy",
  ABNORMAL = "abnormal",
}

export enum RegressionMethod {
  NATURAL = "natural",
  INDUCED = "induced",
  PARTIAL = "partial",
  INCOMPLETE = "incomplete",
}

export enum RegressionCompleteness {
  COMPLETE = "complete",
  PARTIAL = "partial",
  INCOMPLETE = "incomplete",
  FAILED = "failed",
}

export enum ConfidenceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum TrendDirection {
  IMPROVING = "improving",
  STABLE = "stable",
  DECLINING = "declining",
  FLUCTUATING = "fluctuating",
}

export enum PerformanceRating {
  EXCELLENT = "excellent",
  GOOD = "good",
  AVERAGE = "average",
  BELOW_AVERAGE = "below_average",
  POOR = "poor",
}

export enum FertilityImpact {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
  VARIABLE = "variable",
}

export enum StatisticalSignificance {
  HIGHLY_SIGNIFICANT = "highly_significant",
  SIGNIFICANT = "significant",
  MARGINALLY_SIGNIFICANT = "marginally_significant",
  NOT_SIGNIFICANT = "not_significant",
}

export enum ProgramStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ParticipationStatus {
  ENROLLED = "enrolled",
  ACTIVE = "active",
  WITHDRAWN = "withdrawn",
  COMPLETED = "completed",
  EXCLUDED = "excluded",
}

export enum ObjectiveType {
  CONCEPTION_RATE = "conception_rate",
  PREGNANCY_RATE = "pregnancy_rate",
  CALVING_RATE = "calving_rate",
  CALVING_INTERVAL = "calving_interval",
  DAYS_OPEN = "days_open",
  GENETIC_IMPROVEMENT = "genetic_improvement",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ObjectiveStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  ACHIEVED = "achieved",
  PARTIALLY_ACHIEVED = "partially_achieved",
  NOT_ACHIEVED = "not_achieved",
}

export enum BreedingSoundnessScore {
  EXCELLENT = "excellent",
  GOOD = "good",
  SATISFACTORY = "satisfactory",
  QUESTIONABLE = "questionable",
  UNSATISFACTORY = "unsatisfactory",
}

export enum HistoryScore {
  EXCELLENT = "excellent",
  GOOD = "good",
  AVERAGE = "average",
  POOR = "poor",
  UNKNOWN = "unknown",
}

export enum BodyConditionScore {
  EMACIATED = "emaciated", // 1
  VERY_THIN = "very_thin", // 2
  THIN = "thin", // 3
  BORDERLINE = "borderline", // 4
  MODERATE = "moderate", // 5
  GOOD = "good", // 6
  VERY_GOOD = "very_good", // 7
  FAT = "fat", // 8
  VERY_FAT = "very_fat", // 9
}

export enum IntensityLevel {
  MINIMAL = "minimal",
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  EXTREME = "extreme",
}

export enum SeverityLevel {
  MINIMAL = "minimal",
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

export enum QualityRating {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum AnatomicalStructure {
  OVARY = "ovary",
  FOLLICLE = "follicle",
  CORPUS_LUTEUM = "corpus_luteum",
  UTERUS = "uterus",
  CERVIX = "cervix",
  VAGINA = "vagina",
  EMBRYO = "embryo",
  FETUS = "fetus",
  PLACENTA = "placenta",
}

export enum LibidoScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum MountingAbilityScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum SemenQualityScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum PhysicalSoundnessScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum HealthStatusLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

export enum ReproductiveEventType {
  ESTRUS_DETECTION = "estrus_detection",
  ARTIFICIAL_INSEMINATION = "artificial_insemination",
  NATURAL_BREEDING = "natural_breeding",
  PREGNANCY_CHECK = "pregnancy_check",
  PREGNANCY_CONFIRMATION = "pregnancy_confirmation",
  CALVING = "calving",
  POSTPARTUM_EXAM = "postpartum_exam",
  WEANING = "weaning",
  DRY_OFF = "dry_off",
  SYNCHRONIZATION = "synchronization",
  EMBRYO_TRANSFER = "embryo_transfer",
  HORMONE_TREATMENT = "hormone_treatment",
}

export enum CalvingAssistanceType {
  MANUAL_ASSISTANCE = "manual_assistance",
  CALF_PULLER = "calf_puller",
  REPOSITIONING = "repositioning",
  EPISIOTOMY = "episiotomy",
  CAESAREAN_SECTION = "caesarean_section",
  FETOTOMY = "fetotomy",
}

export enum PregnancyOutcomeType {
  SUCCESSFUL_CALVING = "successful_calving",
  ABORTION = "abortion",
  STILLBIRTH = "stillbirth",
  MUMMIFICATION = "mummification",
  RESORPTION = "resorption",
}

export enum NewbornHealthStatus {
  NORMAL = "normal",
  WEAK = "weak",
  DISTRESSED = "distressed",
  CRITICAL = "critical",
  DECEASED = "deceased",
}

export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
}

export enum RiskLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum ImpactLevel {
  MINIMAL = "minimal",
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  SEVERE = "severe",
}

export enum FluidLevel {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  EXCESSIVE = "excessive",
}

export enum ReflexStrength {
  ABSENT = "absent",
  WEAK = "weak",
  NORMAL = "normal",
  STRONG = "strong",
  HYPERACTIVE = "hyperactive",
}

export enum MusclingScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum FrameScore {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra_large",
}

export enum StructuralScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum InterventionType {
  RESUSCITATION = "resuscitation",
  WARMING = "warming",
  FEEDING_ASSISTANCE = "feeding_assistance",
  MEDICATION = "medication",
  MONITORING = "monitoring",
}

export enum InterventionOutcome {
  SUCCESSFUL = "successful",
  PARTIALLY_SUCCESSFUL = "partially_successful",
  UNSUCCESSFUL = "unsuccessful",
  ONGOING = "ongoing",
}

export enum GeneticImpact {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
  UNKNOWN = "unknown",
}

export enum PerformanceRanking {
  TOP_10_PERCENT = "top_10_percent",
  TOP_25_PERCENT = "top_25_percent",
  AVERAGE = "average",
  BOTTOM_25_PERCENT = "bottom_25_percent",
  BOTTOM_10_PERCENT = "bottom_10_percent",
}

export enum UrgencyLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  EMERGENCY = "emergency",
}

export enum PrognosisLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  GUARDED = "guarded",
  POOR = "poor",
  GRAVE = "grave",
}

export enum ResponseType {
  EXCELLENT = "excellent",
  GOOD = "good",
  PARTIAL = "partial",
  POOR = "poor",
  NO_RESPONSE = "no_response",
}

export enum EffectivenessRating {
  HIGHLY_EFFECTIVE = "highly_effective",
  EFFECTIVE = "effective",
  MODERATELY_EFFECTIVE = "moderately_effective",
  MINIMALLY_EFFECTIVE = "minimally_effective",
  INEFFECTIVE = "ineffective",
}

export enum CompletionStatus {
  COMPLETED = "completed",
  PARTIALLY_COMPLETED = "partially_completed",
  DISCONTINUED = "discontinued",
  ONGOING = "ongoing",
}

export enum AdministrationRoute {
  ORAL = "oral",
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  TOPICAL = "topical",
  INTRAUTERINE = "intrauterine",
  INTRAMAMMARY = "intramammary",
}

export enum ClinicalSignificance {
  NOT_SIGNIFICANT = "not_significant",
  MILD = "mild",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  HIGHLY_SIGNIFICANT = "highly_significant",
}

export enum AttachmentType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  AUDIO = "audio",
  ULTRASOUND = "ultrasound",
  XRAY = "xray",
}

// Enums adicionales necesarios
export enum AttitudeScore {
  ALERT = "alert",
  BRIGHT = "bright",
  QUIET = "quiet",
  DEPRESSED = "depressed",
  MORIBUND = "moribund",
}

export enum InvolutionStatus {
  NORMAL = "normal",
  DELAYED = "delayed",
  INCOMPLETE = "incomplete",
  ABNORMAL = "abnormal",
}

export enum ProductionTrend {
  INCREASING = "increasing",
  STABLE = "stable",
  DECREASING = "decreasing",
  VARIABLE = "variable",
}

export enum ChangeDirection {
  INCREASE = "increase",
  DECREASE = "decrease",
  NO_CHANGE = "no_change",
}

export enum ConditionRating {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

export enum PerformanceTrend {
  IMPROVING = "improving",
  STABLE = "stable",
  DECLINING = "declining",
}

export enum EquipmentCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  NEEDS_REPAIR = "needs_repair",
}

export enum PhotoCategory {
  BEFORE_CALVING = "before_calving",
  DURING_CALVING = "during_calving",
  AFTER_CALVING = "after_calving",
  CALF = "calf",
  COMPLICATIONS = "complications",
}

// Etiquetas en español para la interfaz

export const REPRODUCTIVE_STATUS_LABELS = {
  [ReproductiveStatus.HEIFER]: "Vaquilla",
  [ReproductiveStatus.OPEN]: "Vacía",
  [ReproductiveStatus.BRED]: "Servida",
  [ReproductiveStatus.PREGNANT]: "Gestante",
  [ReproductiveStatus.LACTATING]: "Lactando",
  [ReproductiveStatus.DRY]: "Seca",
  [ReproductiveStatus.CULLED]: "Desechada",
} as const;

export const SERVICE_TYPE_LABELS = {
  [ServiceType.ARTIFICIAL_INSEMINATION]: "Inseminación Artificial",
  [ServiceType.NATURAL_BREEDING]: "Monta Natural",
  [ServiceType.EMBRYO_TRANSFER]: "Transferencia de Embriones",
  [ServiceType.IN_VITRO_FERTILIZATION]: "Fertilización In Vitro",
  [ServiceType.TIMED_AI]: "IA a Tiempo Fijo",
  [ServiceType.FIXED_TIME_AI]: "IA a Tiempo Programado",
} as const;

export const ESTRUS_DETECTION_METHOD_LABELS = {
  [EstrusDetectionMethod.VISUAL_OBSERVATION]: "Observación Visual",
  [EstrusDetectionMethod.ACTIVITY_MONITORS]: "Monitores de Actividad",
  [EstrusDetectionMethod.PEDOMETERS]: "Podómetros",
  [EstrusDetectionMethod.HEAT_DETECTOR_PATCHES]: "Parches Detectores",
  [EstrusDetectionMethod.CHIN_BALL_MARKERS]: "Marcadores de Barbilla",
  [EstrusDetectionMethod.HORMONE_TESTING]: "Pruebas Hormonales",
  [EstrusDetectionMethod.ULTRASOUND]: "Ultrasonido",
  [EstrusDetectionMethod.TAIL_PAINT]: "Pintura de Cola",
  [EstrusDetectionMethod.SCRATCH_CARDS]: "Tarjetas de Rayado",
  [EstrusDetectionMethod.ELECTRONIC_SYSTEMS]: "Sistemas Electrónicos",
} as const;

export const CALVING_DIFFICULTY_LABELS = {
  [CalvingDifficulty.UNASSISTED]: "Sin Asistencia",
  [CalvingDifficulty.EASY_ASSISTANCE]: "Asistencia Fácil",
  [CalvingDifficulty.MODERATE_ASSISTANCE]: "Asistencia Moderada",
  [CalvingDifficulty.DIFFICULT_EXTRACTION]: "Extracción Difícil",
  [CalvingDifficulty.CAESAREAN_SECTION]: "Cesárea",
  [CalvingDifficulty.VETERINARY_ASSISTANCE]: "Asistencia Veterinaria",
} as const;

export const CALF_VIGOR_LABELS = {
  [CalfVigor.EXCELLENT]: "Excelente",
  [CalfVigor.GOOD]: "Bueno",
  [CalfVigor.FAIR]: "Regular",
  [CalfVigor.WEAK]: "Débil",
  [CalfVigor.VERY_WEAK]: "Muy Débil",
} as const;
