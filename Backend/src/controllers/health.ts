import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/database';
import { 
  MedicalRecord,
  Vaccination, 
  Illness, 
  Treatment,
  Medication,
  LabTest,
  HealthAlert,
  Quarantine,
  Bovine, 
  Location, 
  Finance,
  User
} from '../models';
import { HealthService } from '../services/health.service';

// Tipos de salud veterinaria
type HealthStatus = 'HEALTHY' | 'SICK' | 'RECOVERING' | 'QUARANTINE' | 'CRITICAL' | 'UNDER_TREATMENT';
type IllnessSeverity = 'mild' | 'moderate' | 'severe' | 'critical' | 'terminal';
type TreatmentStatus = 'planned' | 'active' | 'completed' | 'cancelled' | 'on_hold';
type VaccinationStatus = 'scheduled' | 'completed' | 'overdue' | 'cancelled';
type MedicationStatus = 'prescribed' | 'administering' | 'completed' | 'discontinued';
type LabTestStatus = 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
type QuarantineStatus = 'active' | 'pending_approval' | 'suspended' | 'completed' | 'violated';

// Interfaces para registros médicos
interface CreateMedicalRecordRequest {
  animalId: string;
  veterinarianId: string;
  veterinarianName: string;
  clinicId?: string;
  recordType: 'routine_checkup' | 'illness_diagnosis' | 'vaccination' | 'injury_assessment' | 'reproductive_exam' | 'emergency_evaluation';
  
  examinationDate: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    facility?: string;
  };
  
  vitalSigns?: {
    temperature: number; // °C
    heartRate: number; // bpm
    respiratoryRate: number; // rpm
    weight?: number; // kg
    bodyConditionScore?: number; // 1-9
  };
  
  physicalExamination: {
    generalCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    appetite: 'normal' | 'increased' | 'decreased' | 'absent';
    mobility: 'normal' | 'restricted' | 'lame' | 'immobile';
    hydrationStatus: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration';
    consciousness: 'alert' | 'depressed' | 'stuporous' | 'comatose';
  };
  
  findings: Array<{
    system: 'cardiovascular' | 'respiratory' | 'digestive' | 'nervous' | 'reproductive' | 'musculoskeletal' | 'integumentary' | 'urinary';
    finding: string;
    severity: 'normal' | 'mild' | 'moderate' | 'severe';
    isAbnormal: boolean;
    notes?: string;
  }>;
  
  diagnoses?: Array<{
    condition: string;
    icdCode?: string;
    category: 'infectious' | 'metabolic' | 'nutritional' | 'toxic' | 'genetic' | 'traumatic' | 'neoplastic';
    severity: IllnessSeverity;
    confidence: 'definitive' | 'probable' | 'possible' | 'rule_out';
    isPrimary: boolean;
    differentialDiagnoses?: string[];
    notes?: string;
  }>;
  
  labTests?: Array<{
    testType: 'blood_chemistry' | 'complete_blood_count' | 'serology' | 'microbiology' | 'parasitology' | 'pathology';
    testName: string;
    sampleType: 'blood' | 'urine' | 'feces' | 'milk' | 'tissue' | 'swab';
    laboratory: string;
    urgency: 'routine' | 'urgent' | 'stat';
    expectedResults?: Date;
  }>;
  
  treatments?: Array<{
    type: 'medication' | 'surgical' | 'supportive' | 'dietary' | 'physical_therapy';
    description: string;
    startDate: Date;
    duration?: number; // días
    frequency?: string;
    instructions: string;
    cost?: number;
  }>;
  
  medications?: Array<{
    medicationName: string;
    activeIngredient: string;
    dosage: string;
    frequency: string;
    route: 'oral' | 'intramuscular' | 'subcutaneous' | 'intravenous' | 'topical' | 'intranasal';
    duration: number; // días
    withdrawalPeriod?: number; // días
    cost?: number;
    instructions?: string;
  }>;
  
  recommendations: string[];
  followUpDate?: Date;
  isEmergency: boolean;
  totalCost?: number;
  notes?: string;
  attachments?: string[];
}

interface UpdateMedicalRecordRequest extends Partial<CreateMedicalRecordRequest> {
  id: string;
}

// Interfaces para vacunaciones
interface CreateVaccinationRequest {
  animalId: string;
  vaccineType: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  dose: string;
  
  applicationDate: Date;
  nextDueDate?: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    vaccinationSite?: string;
  };
  
  veterinarianName: string;
  veterinarianId?: string;
  
  administrationRoute: 'intramuscular' | 'subcutaneous' | 'intranasal' | 'oral';
  administrationSite: string;
  
  vaccineInfo: {
    expirationDate: Date;
    storageTemp: string;
    serialNumber?: string;
    productCode?: string;
  };
  
  preVaccinationAssessment: {
    temperature: number;
    healthStatus: HealthStatus;
    contraindications: string[];
    allergies: string[];
  };
  
  postVaccinationMonitoring: {
    observationPeriod: number; // minutos
    immediateReactions: string[];
    vitalSignsCheck?: {
      temperature: number;
      heartRate: number;
      respiratoryRate: number;
    };
  };
  
  sideEffects?: Array<{
    type: 'local' | 'systemic' | 'allergic';
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    onset: Date;
    duration?: number; // horas
    treatment?: string;
  }>;
  
  certificateInfo?: {
    certificateNumber: string;
    issuedBy: string;
    validUntil?: Date;
  };
  
  cost?: number;
  notes?: string;
}

interface UpdateVaccinationRequest extends Partial<CreateVaccinationRequest> {
  id: string;
  status?: VaccinationStatus;
}

// Interfaces para enfermedades
interface CreateIllnessRequest {
  animalId: string;
  diseaseName: string;
  diagnosisDate: Date;
  
  location: {
    latitude: number;
    longitude: number;
    address: string;
    isolationArea?: string;
  };
  
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: number; // días
    progression: 'improving' | 'stable' | 'worsening';
    notes?: string;
  }>;
  
  clinicalSigns: Array<{
    sign: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal: boolean;
  }>;
  
  diagnosisInfo: {
    severity: IllnessSeverity;
    stage: 'incubation' | 'prodromal' | 'acute' | 'chronic' | 'recovery';
    prognosis: 'excellent' | 'good' | 'guarded' | 'poor' | 'grave';
    confidence: 'definitive' | 'probable' | 'presumptive';
    method: 'clinical' | 'laboratory' | 'imaging' | 'necropsy';
  };
  
  epidemiologyInfo: {
    isContagious: boolean;
    transmissionRoute?: 'direct_contact' | 'airborne' | 'vector_borne' | 'foodborne' | 'waterborne';
    incubationPeriod?: number; // días
    infectiousPeriod?: number; // días
    caseClassification: 'suspected' | 'probable' | 'confirmed';
  };
  
  riskFactors: Array<{
    factor: string;
    category: 'environmental' | 'nutritional' | 'genetic' | 'management' | 'infectious';
    impact: 'low' | 'medium' | 'high';
  }>;
  
  treatmentPlan?: {
    primaryTreatment: string;
    supportiveCare: string[];
    isolationRequired: boolean;
    quarantinePeriod?: number; // días
    monitoringFrequency: 'hourly' | 'daily' | 'weekly';
    expectedRecoveryTime?: number; // días
  };
  
  veterinarianName: string;
  veterinarianId?: string;
  recoveryDate?: Date;
  totalCost?: number;
  notes?: string;
  reportableDisease?: boolean;
}

interface UpdateIllnessRequest extends Partial<CreateIllnessRequest> {
  id: string;
  status?: 'suspected' | 'confirmed' | 'treated' | 'recovered' | 'chronic' | 'terminal';
  outcomeDate?: Date;
}

// Interfaces para análisis de salud
interface HealthAnalyticsRequest {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  animalIds?: string[];
  diseaseCategories?: string[];
  veterinarianIds?: string[];
  includeFinancialAnalysis?: boolean;
  includeEpidemiological?: boolean;
}

interface HealthMetrics {
  overview: {
    totalAnimals: number;
    healthyAnimals: number;
    sickAnimals: number;
    underTreatment: number;
    inQuarantine: number;
    recovered: number;
    mortality: number;
    healthScore: number;
  };
  
  vaccinationMetrics: {
    totalVaccinations: number;
    upToDateAnimals: number;
    overdueVaccinations: number;
    vaccinationCoverage: number;
    averageCostPerVaccination: number;
    sideEffectRate: number;
    complianceRate: number;
  };
  
  diseaseMetrics: {
    activeCases: number;
    newCases: number;
    recoveredCases: number;
    mortalityRate: number;
    morbidityRate: number;
    avgRecoveryTime: number;
    treatmentSuccessRate: number;
    contagiousDiseases: number;
  };
  
  treatmentMetrics: {
    activeTreatments: number;
    completedTreatments: number;
    treatmentCosts: number;
    avgTreatmentDuration: number;
    medicationCompliance: number;
    adverseReactions: number;
  };
  
  costAnalysis: {
    totalVeterinaryCosts: number;
    preventiveCosts: number;
    treatmentCosts: number;
    medicationCosts: number;
    laboratoryCosts: number;
    costPerAnimal: number;
    costPerCase: number;
  };
  
  trends: Array<{
    period: string;
    healthScore: number;
    newCases: number;
    recoveryRate: number;
    vaccinationRate: number;
    costs: number;
  }>;
}

interface EpidemiologyAnalysis {
  diseaseOutbreaks: Array<{
    disease: string;
    startDate: Date;
    endDate?: Date;
    caseCount: number;
    attackRate: number;
    mortalityRate: number;
    geographicSpread: Array<{
      location: string;
      caseCount: number;
      coordinates: { lat: number; lng: number };
    }>;
    controlMeasures: string[];
    status: 'ongoing' | 'controlled' | 'resolved';
  }>;
  
  spatialAnalysis: {
    hotspots: Array<{
      center: { lat: number; lng: number };
      radius: number; // metros
      caseCount: number;
      diseases: string[];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
    
    clusters: Array<{
      id: string;
      disease: string;
      locations: Array<{ lat: number; lng: number }>;
      confidence: number;
      significance: number;
    }>;
  };
  
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      weight: number;
      impact: string;
    }>;
    recommendations: string[];
  };
}

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Crear registro médico completo
   * POST /api/health/medical-records
   */
  public createMedicalRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const recordData: CreateMedicalRecordRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!recordData.animalId || !recordData.veterinarianName || !recordData.examinationDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'ID del animal, veterinario y fecha de examen son obligatorios'
          }
        });
        return;
      }

      // Validar que el animal existe
      const animal = await Bovine.findOne({
        where: { id: recordData.animalId, isActive: true }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado',
          errors: {
            animalId: 'El animal especificado no existe o está inactivo'
          }
        });
        return;
      }

      // Crear ubicación del examen
      const locationRecord = await Location.create({
        latitude: recordData.location.latitude,
        longitude: recordData.location.longitude,
        address: recordData.location.address,
        section: recordData.location.facility || '',
        accuracy: 10,
        timestamp: recordData.examinationDate
      });

      // Calcular costo total
      const treatmentCosts = recordData.treatments?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0;
      const medicationCosts = recordData.medications?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
      const totalCost = treatmentCosts + medicationCosts + (recordData.totalCost || 0);

      // Crear registro médico
      const newRecord = await MedicalRecord.create({
        animalId: recordData.animalId,
        animalEarTag: (animal as any).earTag,
        veterinarianId: recordData.veterinarianId || userId,
        veterinarianName: recordData.veterinarianName,
        clinicId: recordData.clinicId,
        recordType: recordData.recordType,
        examinationDate: recordData.examinationDate,
        locationId: locationRecord.id,
        vitalSigns: recordData.vitalSigns || {},
        physicalExamination: recordData.physicalExamination,
        findings: recordData.findings || [],
        diagnoses: recordData.diagnoses || [],
        recommendations: recordData.recommendations,
        followUpDate: recordData.followUpDate,
        isEmergency: recordData.isEmergency,
        totalCost: totalCost,
        notes: recordData.notes || '',
        attachments: recordData.attachments || [],
        status: 'active',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear registros de laboratorio si existen
      if (recordData.labTests && recordData.labTests.length > 0) {
        const labTests = recordData.labTests.map(test => ({
          medicalRecordId: newRecord.id,
          animalId: recordData.animalId,
          testType: test.testType,
          testName: test.testName,
          sampleType: test.sampleType,
          laboratory: test.laboratory,
          orderDate: recordData.examinationDate,
          urgency: test.urgency,
          expectedResults: test.expectedResults,
          status: 'ordered' as LabTestStatus,
          orderedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await LabTest.bulkCreate(labTests);
      }

      // Crear registros de tratamiento si existen
      if (recordData.treatments && recordData.treatments.length > 0) {
        const treatments = recordData.treatments.map(treatment => ({
          medicalRecordId: newRecord.id,
          animalId: recordData.animalId,
          type: treatment.type,
          description: treatment.description,
          startDate: treatment.startDate,
          endDate: treatment.endDate,
          frequency: treatment.frequency || '',
          instructions: treatment.instructions,
          cost: treatment.cost || 0,
          status: 'active' as TreatmentStatus,
          prescribedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await Treatment.bulkCreate(treatments);
      }

      // Crear registros de medicación si existen
      if (recordData.medications && recordData.medications.length > 0) {
        const medications = recordData.medications.map(med => ({
          medicalRecordId: newRecord.id,
          animalId: recordData.animalId,
          medicationName: med.medicationName,
          activeIngredient: med.activeIngredient,
          dosage: med.dosage,
          frequency: med.frequency,
          route: med.route,
          duration: med.duration,
          withdrawalPeriod: med.withdrawalPeriod || 0,
          startDate: recordData.examinationDate,
          cost: med.cost || 0,
          instructions: med.instructions || '',
          status: 'prescribed' as MedicationStatus,
          prescribedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await Medication.bulkCreate(medications);
      }

      // Actualizar estado de salud del animal si es necesario
      if (recordData.diagnoses && recordData.diagnoses.length > 0) {
        const hasSevereDiagnosis = recordData.diagnoses.some(d => 
          ['severe', 'critical', 'terminal'].includes(d.severity)
        );
        
        if (hasSevereDiagnosis) {
          await animal.update({ 
            healthStatus: 'SICK',
            lastHealthCheck: recordData.examinationDate,
            updatedAt: new Date()
          });
        }
      }

      // Crear entrada financiera si hay costo
      if (totalCost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          amount: totalCost,
          date: recordData.examinationDate,
          description: `Consulta veterinaria - ${recordData.recordType} - ${(animal as any).earTag}`,
          bovineIds: [recordData.animalId],
          medicalRecordId: newRecord.id,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Obtener registro completo
      const recordWithDetails = await MedicalRecord.findByPk(newRecord.id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Bovine,
            as: 'animal',
            attributes: ['id', 'earTag', 'name', 'type']
          },
          {
            model: LabTest,
            as: 'labTests',
            required: false
          },
          {
            model: Treatment,
            as: 'treatments',
            required: false
          },
          {
            model: Medication,
            as: 'medications',
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Registro médico creado exitosamente',
        data: {
          record: recordWithDetails
        }
      });

    } catch (error) {
      console.error('Error al crear registro médico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear el registro médico'
        }
      });
    }
  };

  /**
   * Crear registro de vacunación
   * POST /api/health/vaccinations
   */
  public createVaccination = async (req: Request, res: Response): Promise<void> => {
    try {
      const vaccinationData: CreateVaccinationRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!vaccinationData.animalId || !vaccinationData.vaccineName || !vaccinationData.applicationDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'ID del animal, nombre de vacuna y fecha de aplicación son obligatorios'
          }
        });
        return;
      }

      // Validar que el animal existe
      const animal = await Bovine.findOne({
        where: { id: vaccinationData.animalId, isActive: true }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado',
          errors: {
            animalId: 'El animal especificado no existe o está inactivo'
          }
        });
        return;
      }

      // Verificar si hay contraindicaciones
      if (vaccinationData.preVaccinationAssessment.contraindications.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Contraindicaciones encontradas',
          errors: {
            contraindications: vaccinationData.preVaccinationAssessment.contraindications.join(', ')
          }
        });
        return;
      }

      // Crear ubicación de vacunación
      const locationRecord = await Location.create({
        latitude: vaccinationData.location.latitude,
        longitude: vaccinationData.location.longitude,
        address: vaccinationData.location.address,
        section: vaccinationData.location.vaccinationSite || '',
        accuracy: 10,
        timestamp: vaccinationData.applicationDate
      });

      // Crear registro de vacunación
      const newVaccination = await Vaccination.create({
        animalId: vaccinationData.animalId,
        animalEarTag: (animal as any).earTag,
        vaccineType: vaccinationData.vaccineType,
        vaccineName: vaccinationData.vaccineName,
        manufacturer: vaccinationData.manufacturer,
        batchNumber: vaccinationData.batchNumber,
        dose: vaccinationData.dose,
        applicationDate: vaccinationData.applicationDate,
        nextDueDate: vaccinationData.nextDueDate,
        locationId: locationRecord.id,
        veterinarianName: vaccinationData.veterinarianName,
        veterinarianId: vaccinationData.veterinarianId || userId,
        administrationRoute: vaccinationData.administrationRoute,
        administrationSite: vaccinationData.administrationSite,
        vaccineInfo: vaccinationData.vaccineInfo,
        preVaccinationAssessment: vaccinationData.preVaccinationAssessment,
        postVaccinationMonitoring: vaccinationData.postVaccinationMonitoring,
        sideEffects: vaccinationData.sideEffects || [],
        certificateInfo: vaccinationData.certificateInfo || {},
        cost: vaccinationData.cost || 0,
        notes: vaccinationData.notes || '',
        status: 'completed',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear entrada financiera si hay costo
      if (vaccinationData.cost && vaccinationData.cost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          subcategory: 'vaccination',
          amount: vaccinationData.cost,
          date: vaccinationData.applicationDate,
          description: `Vacunación ${vaccinationData.vaccineName} - ${(animal as any).earTag}`,
          bovineIds: [vaccinationData.animalId],
          vaccinationId: newVaccination.id,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Actualizar último chequeo del animal
      await animal.update({
        lastVaccinationDate: vaccinationData.applicationDate,
        updatedAt: new Date()
      });

      // Crear alerta de próxima vacunación si se especifica
      if (vaccinationData.nextDueDate) {
        await HealthAlert.create({
          animalId: vaccinationData.animalId,
          alertType: 'vaccination_due',
          severity: 'medium',
          title: `Próxima vacunación: ${vaccinationData.vaccineName}`,
          description: `Refuerzo de vacuna programado`,
          triggerDate: vaccinationData.nextDueDate,
          isActive: true,
          metadata: {
            vaccineName: vaccinationData.vaccineName,
            vaccineType: vaccinationData.vaccineType
          },
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Obtener vacunación completa
      const vaccinationWithDetails = await Vaccination.findByPk(newVaccination.id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Bovine,
            as: 'animal',
            attributes: ['id', 'earTag', 'name', 'type']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Vacunación registrada exitosamente',
        data: {
          vaccination: vaccinationWithDetails
        }
      });

    } catch (error) {
      console.error('Error al registrar vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al registrar la vacunación'
        }
      });
    }
  };

  /**
   * Crear registro de enfermedad
   * POST /api/health/illnesses
   */
  public createIllness = async (req: Request, res: Response): Promise<void> => {
    try {
      const illnessData: CreateIllnessRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!illnessData.animalId || !illnessData.diseaseName || !illnessData.diagnosisDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'ID del animal, nombre de enfermedad y fecha de diagnóstico son obligatorios'
          }
        });
        return;
      }

      // Validar que el animal existe
      const animal = await Bovine.findOne({
        where: { id: illnessData.animalId, isActive: true }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado',
          errors: {
            animalId: 'El animal especificado no existe o está inactivo'
          }
        });
        return;
      }

      // Crear ubicación del diagnóstico
      const locationRecord = await Location.create({
        latitude: illnessData.location.latitude,
        longitude: illnessData.location.longitude,
        address: illnessData.location.address,
        section: illnessData.location.isolationArea || '',
        accuracy: 10,
        timestamp: illnessData.diagnosisDate
      });

      // Crear registro de enfermedad
      const newIllness = await Illness.create({
        animalId: illnessData.animalId,
        animalEarTag: (animal as any).earTag,
        diseaseName: illnessData.diseaseName,
        diagnosisDate: illnessData.diagnosisDate,
        locationId: locationRecord.id,
        symptoms: illnessData.symptoms,
        clinicalSigns: illnessData.clinicalSigns,
        diagnosisInfo: illnessData.diagnosisInfo,
        epidemiologyInfo: illnessData.epidemiologyInfo,
        riskFactors: illnessData.riskFactors || [],
        treatmentPlan: illnessData.treatmentPlan || {},
        veterinarianName: illnessData.veterinarianName,
        veterinarianId: illnessData.veterinarianId || userId,
        recoveryDate: illnessData.recoveryDate,
        totalCost: illnessData.totalCost || 0,
        notes: illnessData.notes || '',
        status: illnessData.epidemiologyInfo.caseClassification,
        reportableDisease: illnessData.reportableDisease || false,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Actualizar estado de salud del animal
      const healthStatusMap: Record<IllnessSeverity, HealthStatus> = {
        'mild': 'SICK',
        'moderate': 'SICK',
        'severe': 'CRITICAL',
        'critical': 'CRITICAL',
        'terminal': 'CRITICAL'
      };

      await animal.update({
        healthStatus: healthStatusMap[illnessData.diagnosisInfo.severity],
        lastHealthCheck: illnessData.diagnosisDate,
        updatedAt: new Date()
      });

      // Crear cuarentena si es necesario
      if (illnessData.treatmentPlan?.isolationRequired && illnessData.epidemiologyInfo.isContagious) {
        await this.createQuarantineForIllness(newIllness.id, illnessData, locationRecord.id, userId);
      }

      // Crear alerta de enfermedad reportable
      if (illnessData.reportableDisease) {
        await HealthAlert.create({
          animalId: illnessData.animalId,
          alertType: 'disease_outbreak',
          severity: 'high',
          title: `Enfermedad reportable: ${illnessData.diseaseName}`,
          description: `Requiere notificación a autoridades sanitarias`,
          triggerDate: illnessData.diagnosisDate,
          isActive: true,
          metadata: {
            disease: illnessData.diseaseName,
            severity: illnessData.diagnosisInfo.severity,
            contagious: illnessData.epidemiologyInfo.isContagious
          },
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Crear entrada financiera si hay costo
      if (illnessData.totalCost && illnessData.totalCost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          subcategory: 'treatment',
          amount: illnessData.totalCost,
          date: illnessData.diagnosisDate,
          description: `Tratamiento ${illnessData.diseaseName} - ${(animal as any).earTag}`,
          bovineIds: [illnessData.animalId],
          illnessId: newIllness.id,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Obtener enfermedad completa
      const illnessWithDetails = await Illness.findByPk(newIllness.id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Bovine,
            as: 'animal',
            attributes: ['id', 'earTag', 'name', 'type']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Enfermedad registrada exitosamente',
        data: {
          illness: illnessWithDetails
        }
      });

    } catch (error) {
      console.error('Error al registrar enfermedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al registrar la enfermedad'
        }
      });
    }
  };

  /**
   * Obtener métricas de salud
   * GET /api/health/metrics
   */
  public getHealthMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        animalIds,
        includeFinancialAnalysis = true
      }: HealthAnalyticsRequest = req.query as any;

      // Establecer fechas
      const currentDate = new Date();
      const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
      const analysisEndDate = endDate ? new Date(endDate) : currentDate;

      const dateConditions = {
        createdAt: { [Op.between]: [analysisStartDate, analysisEndDate] }
      };

      // Filtrar por animales si se especifica
      const animalConditions = animalIds && Array.isArray(animalIds) 
        ? { animalId: { [Op.in]: animalIds } }
        : {};

      // Métricas generales
      const totalAnimals = await Bovine.count({ 
        where: { 
          isActive: true,
          ...(animalIds ? { id: { [Op.in]: animalIds } } : {})
        }
      });

      const healthStatusCounts = await Bovine.findAll({
        where: { 
          isActive: true,
          ...(animalIds ? { id: { [Op.in]: animalIds } } : {})
        },
        attributes: [
          'healthStatus',
          [fn('COUNT', col('healthStatus')), 'count']
        ],
        group: ['healthStatus'],
        raw: true
      });

      const healthyAnimals = healthStatusCounts.find((h: any) => h.healthStatus === 'HEALTHY')?.count || 0;
      const sickAnimals = healthStatusCounts.find((h: any) => h.healthStatus === 'SICK')?.count || 0;
      const underTreatment = healthStatusCounts.find((h: any) => h.healthStatus === 'UNDER_TREATMENT')?.count || 0;
      const inQuarantine = healthStatusCounts.find((h: any) => h.healthStatus === 'QUARANTINE')?.count || 0;
      
      const healthScore = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;

      // Métricas de vacunación
      const totalVaccinations = await Vaccination.count({
        where: { ...dateConditions, ...animalConditions }
      });

      const vaccinationCounts = await Vaccination.findAll({
        where: { ...animalConditions },
        attributes: [
          [fn('COUNT', literal('DISTINCT "animalId"')), 'vaccinatedAnimals']
        ],
        raw: true
      });

      const vaccinatedAnimals = parseInt((vaccinationCounts[0] as any)?.vaccinatedAnimals || '0');
      const vaccinationCoverage = totalAnimals > 0 ? Math.round((vaccinatedAnimals / totalAnimals) * 100) : 0;

      // Métricas de enfermedades
      const activeCases = await Illness.count({
        where: {
          ...animalConditions,
          status: { [Op.in]: ['suspected', 'confirmed', 'treated'] },
          recoveryDate: null
        }
      });

      const newCases = await Illness.count({
        where: { ...dateConditions, ...animalConditions }
      });

      const recoveredCases = await Illness.count({
        where: {
          ...dateConditions,
          ...animalConditions,
          status: 'recovered',
          recoveryDate: { [Op.ne]: null }
        }
      });

      // Cálculo de tasas
      const mortalityCount = await Bovine.count({
        where: {
          healthStatus: 'DECEASED',
          updatedAt: { [Op.between]: [analysisStartDate, analysisEndDate] },
          ...(animalIds ? { id: { [Op.in]: animalIds } } : {})
        }
      });

      const mortalityRate = totalAnimals > 0 ? Math.round((mortalityCount / totalAnimals) * 10000) / 100 : 0;
      const morbidityRate = totalAnimals > 0 ? Math.round((newCases / totalAnimals) * 10000) / 100 : 0;

      // Métricas de tratamiento
      const activeTreatments = await Treatment.count({
        where: {
          ...animalConditions,
          status: 'active'
        }
      });

      const completedTreatments = await Treatment.count({
        where: { ...dateConditions, ...animalConditions, status: 'completed' }
      });

      // Análisis de costos si se solicita
      let costAnalysis = {};
      if (includeFinancialAnalysis === 'true') {
        const veterinaryCosts = await Finance.findAll({
          where: {
            category: 'veterinary',
            date: { [Op.between]: [analysisStartDate, analysisEndDate] },
            ...(animalIds ? { bovineIds: { [Op.overlap]: animalIds } } : {})
          },
          attributes: [
            'subcategory',
            [fn('SUM', col('amount')), 'total']
          ],
          group: ['subcategory'],
          raw: true
        });

        const totalCosts = veterinaryCosts.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
        
        costAnalysis = {
          totalVeterinaryCosts: Math.round(totalCosts * 100) / 100,
          preventiveCosts: veterinaryCosts.find((c: any) => c.subcategory === 'vaccination')?.total || 0,
          treatmentCosts: veterinaryCosts.find((c: any) => c.subcategory === 'treatment')?.total || 0,
          medicationCosts: veterinaryCosts.find((c: any) => c.subcategory === 'medication')?.total || 0,
          laboratoryCosts: veterinaryCosts.find((c: any) => c.subcategory === 'laboratory')?.total || 0,
          costPerAnimal: totalAnimals > 0 ? Math.round((totalCosts / totalAnimals) * 100) / 100 : 0,
          costPerCase: newCases > 0 ? Math.round((totalCosts / newCases) * 100) / 100 : 0
        };
      }

      // Tendencias (últimos 6 meses)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);

        const periodNewCases = await Illness.count({
          where: {
            diagnosisDate: { [Op.between]: [periodStart, periodEnd] },
            ...animalConditions
          }
        });

        const periodRecovered = await Illness.count({
          where: {
            recoveryDate: { [Op.between]: [periodStart, periodEnd] },
            ...animalConditions
          }
        });

        const periodVaccinations = await Vaccination.count({
          where: {
            applicationDate: { [Op.between]: [periodStart, periodEnd] },
            ...animalConditions
          }
        });

        trends.push({
          period: periodStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          healthScore: Math.round(Math.random() * 20 + 80), // Simulado - calcular real
          newCases: periodNewCases,
          recoveryRate: periodNewCases > 0 ? Math.round((periodRecovered / periodNewCases) * 100) : 0,
          vaccinationRate: periodVaccinations,
          costs: 0 // Calcular de costos reales
        });
      }

      const metrics: HealthMetrics = {
        overview: {
          totalAnimals,
          healthyAnimals: parseInt(healthyAnimals.toString()),
          sickAnimals: parseInt(sickAnimals.toString()),
          underTreatment: parseInt(underTreatment.toString()),
          inQuarantine: parseInt(inQuarantine.toString()),
          recovered: recoveredCases,
          mortality: mortalityCount,
          healthScore
        },
        
        vaccinationMetrics: {
          totalVaccinations,
          upToDateAnimals: vaccinatedAnimals,
          overdueVaccinations: 0, // Implementar cálculo
          vaccinationCoverage,
          averageCostPerVaccination: totalVaccinations > 0 ? 25.50 : 0, // Simplificado
          sideEffectRate: 2.3, // Simplificado
          complianceRate: 94.5 // Simplificado
        },
        
        diseaseMetrics: {
          activeCases,
          newCases,
          recoveredCases,
          mortalityRate,
          morbidityRate,
          avgRecoveryTime: 7.5, // Días, simplificado
          treatmentSuccessRate: recoveredCases > 0 ? Math.round((recoveredCases / newCases) * 100) : 0,
          contagiousDiseases: 0 // Implementar cálculo
        },
        
        treatmentMetrics: {
          activeTreatments,
          completedTreatments,
          treatmentCosts: 0, // De costAnalysis
          avgTreatmentDuration: 5.2, // Días, simplificado
          medicationCompliance: 89.7, // Simplificado
          adverseReactions: 3 // Simplificado
        },
        
        costAnalysis,
        trends
      };

      res.status(200).json({
        success: true,
        message: 'Métricas de salud obtenidas exitosamente',
        data: {
          metrics,
          period: { startDate: analysisStartDate, endDate: analysisEndDate }
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas de salud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener las métricas de salud'
        }
      });
    }
  };

  /**
   * Análisis epidemiológico
   * GET /api/health/epidemiology
   */
  public getEpidemiologyAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'quarterly',
        diseaseCategories,
        includeMapping = true
      } = req.query;

      // Detectar brotes de enfermedades
      const currentDate = new Date();
      const analysisStart = new Date(currentDate.getFullYear(), 0, 1);

      // Agrupar casos por enfermedad y fecha
      const diseaseOutbreaks = await Illness.findAll({
        where: {
          diagnosisDate: { [Op.gte]: analysisStart },
          ...(diseaseCategories ? { 
            diagnosisInfo: { 
              category: { [Op.in]: Array.isArray(diseaseCategories) ? diseaseCategories : [diseaseCategories] } 
            } 
          } : {})
        },
        include: [{
          model: Location,
          as: 'location'
        }],
        order: [['diagnosisDate', 'DESC']]
      });

      // Agrupar por enfermedad
      const diseaseGroups = new Map<string, any[]>();
      diseaseOutbreaks.forEach((illness: any) => {
        const disease = illness.diseaseName;
        if (!diseaseGroups.has(disease)) {
          diseaseGroups.set(disease, []);
        }
        diseaseGroups.get(disease)!.push(illness);
      });

      // Analizar brotes
      const outbreaks = [];
      for (const [disease, cases] of diseaseGroups) {
        if (cases.length >= 3) { // Umbral mínimo para considerar brote
          const sortedCases = cases.sort((a, b) => a.diagnosisDate.getTime() - b.diagnosisDate.getTime());
          const startDate = sortedCases[0].diagnosisDate;
          const endDate = sortedCases[sortedCases.length - 1].diagnosisDate;
          
          // Análisis geográfico
          const geographicSpread = [];
          const locationMap = new Map();
          
          cases.forEach((case_: any) => {
            if (case_.location) {
              const locKey = `${case_.location.latitude}_${case_.location.longitude}`;
              if (!locationMap.has(locKey)) {
                locationMap.set(locKey, {
                  location: case_.location.address,
                  caseCount: 0,
                  coordinates: {
                    lat: case_.location.latitude,
                    lng: case_.location.longitude
                  }
                });
              }
              locationMap.get(locKey).caseCount += 1;
            }
          });

          geographicSpread.push(...locationMap.values());

          outbreaks.push({
            disease,
            startDate,
            endDate: cases.some((c: any) => c.status !== 'recovered') ? undefined : endDate,
            caseCount: cases.length,
            attackRate: 0, // Calcular basado en población en riesgo
            mortalityRate: 0, // Calcular basado en muertes
            geographicSpread,
            controlMeasures: [
              'Aislamiento de casos',
              'Desinfección de áreas',
              'Restricción de movimientos'
            ],
            status: cases.some((c: any) => c.status !== 'recovered') ? 'ongoing' : 'resolved'
          });
        }
      }

      // Análisis espacial si se solicita
      let spatialAnalysis = {};
      if (includeMapping === 'true') {
        // Puntos calientes (hotspots)
        const hotspots = [];
        const clusters = [];

        // Agregar análisis espacial aquí
        // Por ahora, datos simulados
        hotspots.push({
          center: { lat: 17.9869, lng: -92.9303 },
          radius: 500,
          caseCount: 8,
          diseases: ['mastitis', 'neumonía'],
          riskLevel: 'medium' as const
        });

        spatialAnalysis = {
          hotspots,
          clusters
        };
      }

      // Evaluación de riesgo
      const riskAssessment = {
        overallRisk: 'medium' as const,
        riskFactors: [
          { factor: 'Densidad de población', weight: 0.3, impact: 'Alta concentración de animales' },
          { factor: 'Condiciones climáticas', weight: 0.2, impact: 'Humedad y temperatura favorables' },
          { factor: 'Manejo sanitario', weight: 0.4, impact: 'Protocolos de bioseguridad estándar' },
          { factor: 'Proximidad a otros rebaños', weight: 0.1, impact: 'Contacto limitado con externos' }
        ],
        recommendations: [
          'Reforzar medidas de bioseguridad',
          'Incrementar frecuencia de monitoreo sanitario',
          'Revisar protocolos de vacunación',
          'Mejorar ventilación en instalaciones'
        ]
      };

      const analysis: EpidemiologyAnalysis = {
        diseaseOutbreaks: outbreaks,
        spatialAnalysis,
        riskAssessment
      };

      res.status(200).json({
        success: true,
        message: 'Análisis epidemiológico obtenido exitosamente',
        data: {
          analysis,
          generatedAt: new Date(),
          period: period
        }
      });

    } catch (error) {
      console.error('Error al obtener análisis epidemiológico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener el análisis epidemiológico'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async createQuarantineForIllness(illnessId: string, illnessData: CreateIllnessRequest, locationId: string, userId: string): Promise<void> {
    const quarantinePeriod = illnessData.treatmentPlan?.quarantinePeriod || 21; // días por defecto
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + quarantinePeriod);

    await Quarantine.create({
      illnessId: illnessId,
      animalId: illnessData.animalId,
      reason: `Cuarentena por ${illnessData.diseaseName}`,
      startDate: illnessData.diagnosisDate,
      endDate: endDate,
      locationId: locationId,
      restrictions: [
        {
          type: 'movement',
          description: 'Prohibido movimiento fuera del área de aislamiento',
          severity: 'mandatory'
        },
        {
          type: 'contact',
          description: 'Contacto restringido con otros animales',
          severity: 'mandatory'
        }
      ],
      monitoringSchedule: {
        frequency: 'daily',
        tests: ['observación clínica', 'signos vitales'],
        personnel: [illnessData.veterinarianName],
        reportingInterval: 24
      },
      exitCriteria: [
        'Resolución completa de síntomas',
        'Resultado negativo en pruebas de laboratorio',
        'Aprobación veterinaria'
      ],
      status: 'active',
      veterinarianId: userId,
      approvedBy: userId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}