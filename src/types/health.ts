// Tipos relacionados con la salud del ganado y medicina veterinaria

import { BaseEntity } from "./common";
import { HealthStatus, IllnessSeverity } from "../constants/bovineTypes";

// Registro médico completo
export interface MedicalRecord extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  veterinarianId: string;
  veterinarianName: string;
  clinicId?: string;
  recordType: MedicalRecordType;
  date: Date;
  weight?: number;
  bodyTemperature?: number; // °C
  heartRate?: number; // bpm
  respiratoryRate?: number; // rpm
  bodyConditionScore?: number; // 1-9
  generalCondition: GeneralCondition;
  findings: ClinicalFinding[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  medications: MedicationRecord[];
  recommendations: string[];
  followUpDate?: Date;
  attachments?: string[];
  notes?: string;
  cost?: number;
  isEmergency: boolean;
}

// Hallazgo clínico
export interface ClinicalFinding {
  id: string;
  system: BodySystem;
  finding: string;
  severity: FindingSeverity;
  isAbnormal: boolean;
  notes?: string;
}

// Diagnóstico
export interface Diagnosis {
  id: string;
  condition: string;
  icdCode?: string;
  category: DiagnosisCategory;
  severity: IllnessSeverity;
  confidence: DiagnosticConfidence;
  isPrimary: boolean;
  isChronicCondition: boolean;
  differentialDiagnoses?: string[];
  supportingEvidence: string[];
  notes?: string;
}

// Tratamiento
export interface Treatment {
  id: string;
  type: TreatmentType;
  description: string;
  startDate: Date;
  endDate?: Date;
  frequency?: string;
  dosage?: string;
  route?: AdministrationRoute;
  cost?: number;
  veterinarianInstructions?: string;
  response: TreatmentResponse;
  sideEffects?: string[];
  status: TreatmentStatus;
}

// Registro de medicamento
export interface MedicationRecord {
  id: string;
  medicationName: string;
  activeIngredient: string;
  strength: string;
  form: MedicationForm;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  dosage: string;
  frequency: string;
  route: AdministrationRoute;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  administeredBy?: string;
  withdrawalPeriod?: number; // días
  cost: number;
  sideEffects?: string[];
  contraindications?: string[];
  status: MedicationStatus;
  notes?: string;
}

// Examen veterinario de rutina
export interface RoutineExamination extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  veterinarianId: string;
  date: Date;
  type: ExaminationType;
  vitalSigns: VitalSigns;
  physicalExamination: PhysicalExamination;
  laboratoryResults?: LaboratoryResult[];
  imagingResults?: ImagingResult[];
  vaccinations?: VaccinationRecord[];
  recommendations: string[];
  nextExamDate?: Date;
  overallAssessment: OverallAssessment;
  cost: number;
}

// Signos vitales
export interface VitalSigns {
  temperature: number; // °C
  heartRate: number; // bpm
  respiratoryRate: number; // rpm
  bloodPressure?: BloodPressure;
  capillaryRefillTime?: number; // segundos
  hydrationStatus: HydrationStatus;
  mucousMembraneColor: MucousMembraneColor;
}

// Presión arterial
export interface BloodPressure {
  systolic: number;
  diastolic: number;
  unit: "mmHg";
}

// Examen físico
export interface PhysicalExamination {
  bodyConditionScore: number; // 1-9
  locomotionScore?: number; // 1-5
  systems: SystemExamination[];
  abnormalFindings: string[];
  photos?: ExaminationPhoto[];
}

// Examen por sistema
export interface SystemExamination {
  system: BodySystem;
  findings: string[];
  isNormal: boolean;
  abnormalities?: SystemAbnormality[];
}

// Anormalidad del sistema
export interface SystemAbnormality {
  finding: string;
  severity: FindingSeverity;
  location?: string;
  description: string;
  requiresFollowUp: boolean;
}

// Foto del examen
export interface ExaminationPhoto {
  id: string;
  url: string;
  description: string;
  bodyPart: string;
  timestamp: Date;
}

// Resultado de laboratorio
export interface LaboratoryResult {
  id: string;
  testName: string;
  testCode?: string;
  category: LabTestCategory;
  sampleType: SampleType;
  collectionDate: Date;
  resultsDate: Date;
  laboratory: string;
  results: LabTestResult[];
  interpretation: string;
  isAbnormal: boolean;
  clinicalSignificance?: string;
  cost: number;
}

// Resultado de prueba de laboratorio
export interface LabTestResult {
  parameter: string;
  value: any;
  unit?: string;
  referenceRange?: string;
  status: TestResultStatus;
  flag?: ResultFlag;
  notes?: string;
}

// Resultado de imagen
export interface ImagingResult {
  id: string;
  type: ImagingType;
  bodyPart: string;
  date: Date;
  radiologist?: string;
  findings: string[];
  impression: string;
  recommendations?: string[];
  images: ImagingFile[];
  cost: number;
}

// Archivo de imagen
export interface ImagingFile {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  view?: string; // lateral, anterior, posterior, etc.
  timestamp: Date;
}

// Registro de vacunación médica
export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  dose: string;
  route: AdministrationRoute;
  site: InjectionSite;
  administeredBy: string;
  reactions?: VaccinationReaction[];
  nextDueDate?: Date;
  cost: number;
}

// Reacción a vacuna
export interface VaccinationReaction {
  type: ReactionType;
  severity: ReactionSeverity;
  onset: Date;
  duration?: number; // horas
  description: string;
  treatment?: string;
  resolved: boolean;
}

// Evaluación general
export interface OverallAssessment {
  healthStatus: HealthStatus;
  bodyCondition: BodyConditionAssessment;
  recommendations: HealthRecommendation[];
  riskFactors: RiskFactor[];
  prognosis: Prognosis;
  qualityOfLife?: QualityOfLifeScore;
}

// Evaluación de condición corporal
export interface BodyConditionAssessment {
  score: number; // 1-9
  category: BodyConditionCategory;
  description: string;
  recommendations?: string[];
}

// Recomendación de salud
export interface HealthRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  timeframe?: string;
  estimatedCost?: number;
}

// Factor de riesgo
export interface RiskFactor {
  factor: string;
  category: RiskCategory;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  description: string;
  preventiveMeasures?: string[];
}

// Pronóstico
export interface Prognosis {
  outlook: PrognosisOutlook;
  timeframe?: string;
  factors: PrognosticFactor[];
  confidenceLevel: ConfidenceLevel;
  notes?: string;
}

// Factor pronóstico
export interface PrognosticFactor {
  factor: string;
  impact: PrognosticImpact;
  description: string;
}

// Puntuación de calidad de vida
export interface QualityOfLifeScore {
  overall: number; // 1-10
  mobility: number;
  appetite: number;
  socialBehavior: number;
  painLevel: number;
  notes?: string;
  assessmentDate: Date;
}

// Brote de enfermedad
export interface DiseaseOutbreak extends BaseEntity {
  name: string;
  disease: string;
  startDate: Date;
  endDate?: Date;
  status: OutbreakStatus;
  affectedAnimals: string[]; // IDs de animales
  totalAffected: number;
  totalSusceptible: number;
  attackRate: number; // porcentaje
  mortalityRate: number; // porcentaje
  epicurve: EpiCurvePoint[];
  controlMeasures: ControlMeasure[];
  investigation: OutbreakInvestigation;
  notifications: RegulatoryNotification[];
  economicImpact?: EconomicImpact;
}

// Punto de curva epidémica
export interface EpiCurvePoint {
  date: Date;
  newCases: number;
  cumulativeCases: number;
}

// Medida de control
export interface ControlMeasure {
  type: ControlMeasureType;
  description: string;
  implementationDate: Date;
  duration?: number; // días
  effectivenesss?: number; // porcentaje
  cost?: number;
  responsiblePerson: string;
}

// Investigación de brote
export interface OutbreakInvestigation {
  investigator: string;
  startDate: Date;
  hypothesis: string[];
  riskFactors: OutbreakRiskFactor[];
  samples: InvestigationSample[];
  findings: string[];
  conclusions: string[];
  recommendations: string[];
  reportUrl?: string;
}

// Factor de riesgo de brote
export interface OutbreakRiskFactor {
  factor: string;
  oddsRatio?: number;
  confidenceInterval?: string;
  pValue?: number;
  isSignificant: boolean;
}

// Muestra de investigación
export interface InvestigationSample {
  id: string;
  type: SampleType;
  source: string; // ID del animal o ubicación
  collectionDate: Date;
  results?: string;
  laboratory: string;
  cost: number;
}

// Notificación regulatoria
export interface RegulatoryNotification {
  authority: string;
  reportDate: Date;
  reportNumber?: string;
  status: NotificationStatus;
  response?: string;
  followUpRequired: boolean;
}

// Impacto económico
export interface EconomicImpact {
  directCosts: number;
  indirectCosts: number;
  totalLosses: number;
  productionLoss: number;
  treatmentCosts: number;
  preventionCosts: number;
  marketImpact?: number;
}

// Historial de salud del animal
export interface AnimalHealthHistory {
  animalId: string;
  animalEarTag: string;
  medicalRecords: MedicalRecord[];
  vaccinations: VaccinationRecord[];
  treatments: Treatment[];
  chronicConditions: ChronicCondition[];
  allergies: Allergy[];
  surgicalHistory: SurgicalProcedure[];
  reproductiveHealth?: ReproductiveHealthRecord;
  nutritionalAssessments: NutritionalAssessment[];
  growthRecords: GrowthRecord[];
  behavioralAssessments?: BehavioralAssessment[];
}

// Condición crónica
export interface ChronicCondition {
  condition: string;
  diagnosisDate: Date;
  severity: IllnessSeverity;
  managementPlan: ManagementPlan;
  currentStatus: ConditionStatus;
  lastAssessment: Date;
  medications: MedicationRecord[];
  notes?: string;
}

// Plan de manejo
export interface ManagementPlan {
  description: string;
  medications?: string[];
  dietaryRestrictions?: string[];
  exerciseRecommendations?: string[];
  monitoringSchedule: string;
  emergencyPlan?: string;
  reviewDate: Date;
}

// Alergia
export interface Allergy {
  allergen: string;
  type: AllergyType;
  severity: AllergySeverity;
  symptoms: string[];
  diagnosisDate: Date;
  avoidanceInstructions: string[];
  emergencyTreatment?: string;
}

// Procedimiento quirúrgico
export interface SurgicalProcedure {
  id: string;
  procedure: string;
  date: Date;
  surgeon: string;
  anesthesia: AnesthesiaRecord;
  indication: string;
  technique: string;
  complications?: string[];
  outcome: SurgicalOutcome;
  postOpCare: PostOperativeCare;
  cost: number;
}

// Registro de anestesia
export interface AnesthesiaRecord {
  type: AnesthesiaType;
  agent: string;
  dose: string;
  route: AdministrationRoute;
  duration: number; // minutos
  complications?: string[];
  recovery: AnesthesiaRecovery;
}

// Recuperación de anestesia
export interface AnesthesiaRecovery {
  quality: RecoveryQuality;
  duration: number; // minutos
  complications?: string[];
  notes?: string;
}

// Cuidado postoperatorio
export interface PostOperativeCare {
  instructions: string[];
  medications: MedicationRecord[];
  activityRestrictions: string[];
  followUpSchedule: string[];
  woundCare?: WoundCareInstructions;
}

// Instrucciones de cuidado de heridas
export interface WoundCareInstructions {
  cleaningProtocol: string;
  dressingChanges: string;
  signsOfInfection: string[];
  healingTimeline: string;
  restrictions: string[];
}

// Salud reproductiva
export interface ReproductiveHealthRecord {
  lastBreedingDate?: Date;
  gestationStatus?: GestationStatus;
  lastCalvingDate?: Date;
  calvingDifficulty?: CalvingDifficulty;
  postPartumHealth?: PostPartumHealth;
  reproductiveDisorders: ReproductiveDisorder[];
  fertilityAssessments: FertilityAssessment[];
}

// Trastorno reproductivo
export interface ReproductiveDisorder {
  condition: string;
  diagnosisDate: Date;
  treatment?: string;
  resolved: boolean;
  impact: ReproductiveImpact;
}

// Evaluación de fertilidad
export interface FertilityAssessment {
  date: Date;
  method: FertilityTestMethod;
  results: string;
  recommendations: string[];
  nextAssessment?: Date;
}

// Evaluación nutricional
export interface NutritionalAssessment {
  date: Date;
  bodyWeight: number;
  bodyConditionScore: number;
  dietAnalysis: DietAnalysis;
  deficiencies?: NutritionalDeficiency[];
  recommendations: NutritionalRecommendation[];
  followUpDate?: Date;
}

// Análisis dietético
export interface DietAnalysis {
  totalEnergyMcal: number;
  proteinPercent: number;
  fiberPercent: number;
  fatPercent: number;
  minerals: MineralContent[];
  vitamins: VitaminContent[];
  adequacyRating: AdequacyRating;
}

// Contenido mineral
export interface MineralContent {
  mineral: string;
  amount: number;
  unit: string;
  adequacy: NutritionalAdequacy;
}

// Contenido vitamínico
export interface VitaminContent {
  vitamin: string;
  amount: number;
  unit: string;
  adequacy: NutritionalAdequacy;
}

// Deficiencia nutricional
export interface NutritionalDeficiency {
  nutrient: string;
  severity: DeficiencySeverity;
  symptoms: string[];
  recommendations: string[];
}

// Recomendación nutricional
export interface NutritionalRecommendation {
  type: NutritionalRecommendationType;
  description: string;
  duration?: string;
  expectedOutcome: string;
}

// Registro de crecimiento
export interface GrowthRecord {
  date: Date;
  age: number; // días
  weight: number;
  height?: number;
  length?: number;
  chestGirth?: number;
  growthRate?: number; // kg/día
  percentile?: number;
  notes?: string;
}

// Evaluación del comportamiento
export interface BehavioralAssessment {
  date: Date;
  assessor: string;
  temperament: TemperamentScore;
  socialBehavior: SocialBehaviorScore;
  feedingBehavior: FeedingBehaviorScore;
  abnormalBehaviors: AbnormalBehavior[];
  environmentalFactors: string[];
  recommendations: string[];
}

// Puntuación de temperamento
export interface TemperamentScore {
  docility: number; // 1-5
  flightSpeed?: number; // metros/segundo
  chuteBehavior?: ChuteScore;
  notes?: string;
}

// Comportamiento anormal
export interface AbnormalBehavior {
  behavior: string;
  frequency: BehaviorFrequency;
  duration?: string;
  triggers?: string[];
  interventions?: string[];
}

// Enums
export enum MedicalRecordType {
  ROUTINE_EXAMINATION = "routine_examination",
  SICK_CALL = "sick_call",
  EMERGENCY = "emergency",
  SURGERY = "surgery",
  VACCINATION = "vaccination",
  PREGNANCY_CHECK = "pregnancy_check",
  POST_MORTEM = "post_mortem",
}

export enum GeneralCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

export enum BodySystem {
  CARDIOVASCULAR = "cardiovascular",
  RESPIRATORY = "respiratory",
  DIGESTIVE = "digestive",
  NERVOUS = "nervous",
  MUSCULOSKELETAL = "musculoskeletal",
  INTEGUMENTARY = "integumentary",
  REPRODUCTIVE = "reproductive",
  URINARY = "urinary",
  LYMPHATIC = "lymphatic",
  ENDOCRINE = "endocrine",
  MAMMARY = "mammary",
}

export enum FindingSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
}

export enum DiagnosisCategory {
  INFECTIOUS = "infectious",
  METABOLIC = "metabolic",
  NUTRITIONAL = "nutritional",
  TOXIC = "toxic",
  GENETIC = "genetic",
  NEOPLASTIC = "neoplastic",
  TRAUMATIC = "traumatic",
  BEHAVIORAL = "behavioral",
  REPRODUCTIVE = "reproductive",
  OTHER = "other",
}

export enum DiagnosticConfidence {
  TENTATIVE = "tentative",
  PROBABLE = "probable",
  DEFINITIVE = "definitive",
}

export enum TreatmentType {
  MEDICATION = "medication",
  SURGERY = "surgery",
  THERAPY = "therapy",
  MANAGEMENT = "management",
  SUPPORTIVE = "supportive",
  PREVENTIVE = "preventive",
}

export enum AdministrationRoute {
  ORAL = "oral",
  INTRAMUSCULAR = "intramuscular",
  INTRAVENOUS = "intravenous",
  SUBCUTANEOUS = "subcutaneous",
  TOPICAL = "topical",
  INTRANASAL = "intranasal",
  INTRA_MAMMARY = "intra_mammary",
  INHALATION = "inhalation",
}

export enum TreatmentResponse {
  EXCELLENT = "excellent",
  GOOD = "good",
  PARTIAL = "partial",
  POOR = "poor",
  NO_RESPONSE = "no_response",
}

export enum TreatmentStatus {
  PLANNED = "planned",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  DISCONTINUED = "discontinued",
  FAILED = "failed",
}

export enum MedicationForm {
  TABLET = "tablet",
  CAPSULE = "capsule",
  INJECTION = "injection",
  LIQUID = "liquid",
  POWDER = "powder",
  PASTE = "paste",
  IMPLANT = "implant",
  BOLUS = "bolus",
}

export enum MedicationStatus {
  PRESCRIBED = "prescribed",
  DISPENSED = "dispensed",
  ADMINISTERED = "administered",
  COMPLETED = "completed",
  DISCONTINUED = "discontinued",
}

export enum ExaminationType {
  ROUTINE = "routine",
  PRE_PURCHASE = "pre_purchase",
  PREGNANCY = "pregnancy",
  BREEDING_SOUNDNESS = "breeding_soundness",
  INSURANCE = "insurance",
  RESEARCH = "research",
}

export enum HydrationStatus {
  NORMAL = "normal",
  MILD_DEHYDRATION = "mild_dehydration",
  MODERATE_DEHYDRATION = "moderate_dehydration",
  SEVERE_DEHYDRATION = "severe_dehydration",
}

export enum MucousMembraneColor {
  PINK = "pink",
  PALE = "pale",
  YELLOW = "yellow",
  BLUE = "blue",
  RED = "red",
  PURPLE = "purple",
}

export enum LabTestCategory {
  HEMATOLOGY = "hematology",
  BIOCHEMISTRY = "biochemistry",
  SEROLOGY = "serology",
  MICROBIOLOGY = "microbiology",
  PARASITOLOGY = "parasitology",
  PATHOLOGY = "pathology",
  TOXICOLOGY = "toxicology",
}

export enum SampleType {
  BLOOD = "blood",
  SERUM = "serum",
  PLASMA = "plasma",
  URINE = "urine",
  FECES = "feces",
  MILK = "milk",
  TISSUE = "tissue",
  SWAB = "swab",
  HAIR = "hair",
}

export enum TestResultStatus {
  NORMAL = "normal",
  ABNORMAL = "abnormal",
  CRITICAL = "critical",
  PENDING = "pending",
  INVALID = "invalid",
}

export enum ResultFlag {
  HIGH = "high",
  LOW = "low",
  CRITICAL_HIGH = "critical_high",
  CRITICAL_LOW = "critical_low",
  POSITIVE = "positive",
  NEGATIVE = "negative",
}

export enum ImagingType {
  RADIOGRAPHY = "radiography",
  ULTRASOUND = "ultrasound",
  CT_SCAN = "ct_scan",
  MRI = "mri",
  ENDOSCOPY = "endoscopy",
}

export enum InjectionSite {
  NECK = "neck",
  SHOULDER = "shoulder",
  HIP = "hip",
  THIGH = "thigh",
  ABDOMEN = "abdomen",
}

export enum ReactionType {
  LOCAL_SWELLING = "local_swelling",
  SYSTEMIC = "systemic",
  ALLERGIC = "allergic",
  ANAPHYLACTIC = "anaphylactic",
  BEHAVIORAL = "behavioral",
}

export enum ReactionSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  LIFE_THREATENING = "life_threatening",
}

export enum BodyConditionCategory {
  EMACIATED = "emaciated",
  THIN = "thin",
  IDEAL = "ideal",
  OVERWEIGHT = "overweight",
  OBESE = "obese",
}

export enum RecommendationType {
  TREATMENT = "treatment",
  MANAGEMENT = "management",
  NUTRITION = "nutrition",
  HOUSING = "housing",
  MONITORING = "monitoring",
  PREVENTION = "prevention",
}

export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum RiskCategory {
  INFECTIOUS = "infectious",
  NUTRITIONAL = "nutritional",
  ENVIRONMENTAL = "environmental",
  GENETIC = "genetic",
  BEHAVIORAL = "behavioral",
  MANAGEMENT = "management",
}

export enum RiskSeverity {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum RiskLikelihood {
  UNLIKELY = "unlikely",
  POSSIBLE = "possible",
  LIKELY = "likely",
  ALMOST_CERTAIN = "almost_certain",
}

export enum PrognosisOutlook {
  EXCELLENT = "excellent",
  GOOD = "good",
  GUARDED = "guarded",
  POOR = "poor",
  GRAVE = "grave",
}

export enum PrognosticImpact {
  FAVORABLE = "favorable",
  NEUTRAL = "neutral",
  UNFAVORABLE = "unfavorable",
}

export enum ConfidenceLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export enum OutbreakStatus {
  SUSPECTED = "suspected",
  CONFIRMED = "confirmed",
  ONGOING = "ongoing",
  CONTROLLED = "controlled",
  RESOLVED = "resolved",
}

export enum ControlMeasureType {
  QUARANTINE = "quarantine",
  ISOLATION = "isolation",
  VACCINATION = "vaccination",
  TREATMENT = "treatment",
  DISINFECTION = "disinfection",
  MOVEMENT_RESTRICTION = "movement_restriction",
  CULLING = "culling",
  SURVEILLANCE = "surveillance",
}

export enum NotificationStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  ACKNOWLEDGED = "acknowledged",
  UNDER_REVIEW = "under_review",
  CLOSED = "closed",
}

export enum ConditionStatus {
  WELL_CONTROLLED = "well_controlled",
  CONTROLLED = "controlled",
  UNCONTROLLED = "uncontrolled",
  WORSENING = "worsening",
  STABLE = "stable",
}

export enum AllergyType {
  DRUG = "drug",
  FOOD = "food",
  ENVIRONMENTAL = "environmental",
  CONTACT = "contact",
}

export enum AllergySeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  LIFE_THREATENING = "life_threatening",
}

export enum SurgicalOutcome {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  FAILED = "failed",
}

export enum AnesthesiaType {
  LOCAL = "local",
  REGIONAL = "regional",
  GENERAL = "general",
  SEDATION = "sedation",
}

export enum RecoveryQuality {
  SMOOTH = "smooth",
  FAIR = "fair",
  ROUGH = "rough",
  COMPLICATED = "complicated",
}

export enum GestationStatus {
  OPEN = "open",
  BRED = "bred",
  PREGNANT = "pregnant",
  POSTPARTUM = "postpartum",
}

export enum CalvingDifficulty {
  EASY = "easy",
  MODERATE = "moderate",
  DIFFICULT = "difficult",
  CESAREAN = "cesarean",
}

export enum PostPartumHealth {
  NORMAL = "normal",
  RETAINED_PLACENTA = "retained_placenta",
  METRITIS = "metritis",
  MILK_FEVER = "milk_fever",
  KETOSIS = "ketosis",
}

export enum ReproductiveImpact {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SEVERE = "severe",
}

export enum FertilityTestMethod {
  BREEDING_SOUNDNESS = "breeding_soundness",
  HORMONE_ASSAY = "hormone_assay",
  ULTRASOUND = "ultrasound",
  PREGNANCY_TEST = "pregnancy_test",
}

export enum AdequacyRating {
  EXCELLENT = "excellent",
  ADEQUATE = "adequate",
  MARGINAL = "marginal",
  INADEQUATE = "inadequate",
}

export enum NutritionalAdequacy {
  DEFICIENT = "deficient",
  ADEQUATE = "adequate",
  EXCESSIVE = "excessive",
}

export enum DeficiencySeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
}

export enum NutritionalRecommendationType {
  SUPPLEMENT = "supplement",
  DIET_CHANGE = "diet_change",
  RESTRICTION = "restriction",
  MONITORING = "monitoring",
}

export enum ChuteScore {
  DOCILE = 1,
  RESTLESS = 2,
  SQUIRMING = 3,
  VERY_AGGRESSIVE = 4,
  REARING = 5,
}

export enum BehaviorFrequency {
  RARE = "rare",
  OCCASIONAL = "occasional",
  FREQUENT = "frequent",
  CONSTANT = "constant",
}

export enum SocialBehaviorScore {
  EXCELLENT = 5,
  GOOD = 4,
  FAIR = 3,
  POOR = 2,
  CONCERNING = 1,
}

export enum FeedingBehaviorScore {
  EXCELLENT = 5,
  GOOD = 4,
  FAIR = 3,
  POOR = 2,
  CONCERNING = 1,
}

// Etiquetas en español para los principales enums
export const MEDICAL_RECORD_TYPE_LABELS = {
  [MedicalRecordType.ROUTINE_EXAMINATION]: "Examen de Rutina",
  [MedicalRecordType.SICK_CALL]: "Consulta por Enfermedad",
  [MedicalRecordType.EMERGENCY]: "Emergencia",
  [MedicalRecordType.SURGERY]: "Cirugía",
  [MedicalRecordType.VACCINATION]: "Vacunación",
  [MedicalRecordType.PREGNANCY_CHECK]: "Chequeo de Preñez",
  [MedicalRecordType.POST_MORTEM]: "Necropsia",
} as const;

export const BODY_SYSTEM_LABELS = {
  [BodySystem.CARDIOVASCULAR]: "Cardiovascular",
  [BodySystem.RESPIRATORY]: "Respiratorio",
  [BodySystem.DIGESTIVE]: "Digestivo",
  [BodySystem.NERVOUS]: "Nervioso",
  [BodySystem.MUSCULOSKELETAL]: "Musculoesquelético",
  [BodySystem.INTEGUMENTARY]: "Tegumentario",
  [BodySystem.REPRODUCTIVE]: "Reproductivo",
  [BodySystem.URINARY]: "Urinario",
  [BodySystem.LYMPHATIC]: "Linfático",
  [BodySystem.ENDOCRINE]: "Endocrino",
  [BodySystem.MAMMARY]: "Mamario",
} as const;

export const TREATMENT_TYPE_LABELS = {
  [TreatmentType.MEDICATION]: "Medicamento",
  [TreatmentType.SURGERY]: "Cirugía",
  [TreatmentType.THERAPY]: "Terapia",
  [TreatmentType.MANAGEMENT]: "Manejo",
  [TreatmentType.SUPPORTIVE]: "Soporte",
  [TreatmentType.PREVENTIVE]: "Preventivo",
} as const;
