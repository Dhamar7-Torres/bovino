import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { 
  Medication,
  Bovine, 
  Location, 
  Finance,
  User
} from '../models';

// Tipos básicos
type HealthStatus = 'HEALTHY' | 'SICK' | 'RECOVERING' | 'QUARANTINE' | 'CRITICAL' | 'UNDER_TREATMENT';
type IllnessSeverity = 'mild' | 'moderate' | 'severe' | 'critical' | 'terminal';

// Interface básica para requests autenticados
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Interfaces para requests
interface CreateMedicalRecordRequest {
  animalId: string;
  veterinarianId?: string;
  veterinarianName: string;
  clinicId?: string;
  recordType: string;
  examinationDate: string | Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    facility?: string;
  };
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    bodyConditionScore?: number;
  };
  physicalExamination: {
    generalCondition: string;
    appetite: string;
    mobility: string;
    hydrationStatus: string;
    consciousness: string;
  };
  findings?: Array<{
    system: string;
    finding: string;
    severity: string;
    isAbnormal: boolean;
    notes?: string;
  }>;
  diagnoses?: Array<{
    condition: string;
    icdCode?: string;
    category: string;
    severity: string;
    confidence: string;
    isPrimary: boolean;
    differentialDiagnoses?: string[];
    notes?: string;
  }>;
  labTests?: Array<{
    testType: string;
    testName: string;
    sampleType: string;
    laboratory: string;
    urgency: string;
    expectedResults?: string | Date;
  }>;
  treatments?: Array<{
    type: string;
    description: string;
    startDate: string | Date;
    duration?: number;
    frequency?: string;
    instructions: string;
    cost?: number;
    endDate?: string | Date;
  }>;
  medications?: Array<{
    medicationName: string;
    activeIngredient: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: number;
    withdrawalPeriod?: number;
    cost?: number;
    instructions?: string;
  }>;
  recommendations: string[];
  followUpDate?: string | Date;
  isEmergency: boolean;
  totalCost?: number;
  notes?: string;
  attachments?: string[];
}

interface CreateVaccinationRequest {
  animalId: string;
  vaccineType: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  dose: string;
  applicationDate: string | Date;
  nextDueDate?: string | Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    vaccinationSite?: string;
  };
  veterinarianName: string;
  veterinarianId?: string;
  administrationRoute: string;
  administrationSite: string;
  vaccineInfo: {
    expirationDate: string | Date;
    storageTemp: string;
    serialNumber?: string;
    productCode?: string;
  };
  preVaccinationAssessment: {
    temperature: number;
    healthStatus: string;
    contraindications: string[];
    allergies: string[];
  };
  postVaccinationMonitoring: {
    observationPeriod: number;
    immediateReactions: string[];
    vitalSignsCheck?: {
      temperature: number;
      heartRate: number;
      respiratoryRate: number;
    };
  };
  sideEffects?: Array<{
    type: string;
    description: string;
    severity: string;
    onset: string | Date;
    duration?: number;
    treatment?: string;
  }>;
  certificateInfo?: {
    certificateNumber: string;
    issuedBy: string;
    validUntil?: string | Date;
  };
  cost?: number;
  notes?: string;
}

interface CreateIllnessRequest {
  animalId: string;
  diseaseName: string;
  diagnosisDate: string | Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    isolationArea?: string;
  };
  symptoms: Array<{
    symptom: string;
    severity: string;
    duration: number;
    progression: string;
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
    severity: string;
    stage: string;
    prognosis: string;
    confidence: string;
    method: string;
  };
  epidemiologyInfo: {
    isContagious: boolean;
    transmissionRoute?: string;
    incubationPeriod?: number;
    infectiousPeriod?: number;
    caseClassification: string;
  };
  riskFactors?: Array<{
    factor: string;
    category: string;
    impact: string;
  }>;
  treatmentPlan?: {
    primaryTreatment: string;
    supportiveCare: string[];
    isolationRequired: boolean;
    quarantinePeriod?: number;
    monitoringFrequency: string;
    expectedRecoveryTime?: number;
  };
  veterinarianName: string;
  veterinarianId?: string;
  recoveryDate?: string | Date;
  totalCost?: number;
  notes?: string;
  reportableDisease?: boolean;
}

export class HealthController {
  constructor() {
    // Constructor vacío
  }

  /**
   * Crear registro médico
   */
  public createMedicalRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const recordData: CreateMedicalRecordRequest = req.body;
      const userId = req.user?.id || 'system';

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

      // Verificar que el animal existe
      const animal = await Bovine.findOne({
        where: { 
          id: recordData.animalId, 
          isActive: true 
        }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado'
        });
        return;
      }

      // Crear ubicación sin tipos específicos
      const locationRecord = await Location.create({
        latitude: recordData.location.latitude.toString(),
        longitude: recordData.location.longitude.toString(),
        address: recordData.location.address,
        description: recordData.location.facility || 'Consulta veterinaria',
        accuracy: '10',
        timestamp: new Date(recordData.examinationDate)
      } as any);

      // Calcular costo total
      const treatmentCosts = recordData.treatments?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0;
      const medicationCosts = recordData.medications?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
      const totalCost = treatmentCosts + medicationCosts + (recordData.totalCost || 0);

      // Registro médico simulado
      const newRecord = {
        id: this.generateId('health'),
        animalId: recordData.animalId,
        animalEarTag: (animal as any).earTag || 'N/A',
        veterinarianId: recordData.veterinarianId || userId,
        veterinarianName: recordData.veterinarianName,
        clinicId: recordData.clinicId,
        recordType: recordData.recordType,
        examinationDate: new Date(recordData.examinationDate),
        locationId: locationRecord.id,
        vitalSigns: recordData.vitalSigns || {},
        physicalExamination: recordData.physicalExamination,
        findings: recordData.findings || [],
        diagnoses: recordData.diagnoses || [],
        recommendations: recordData.recommendations,
        followUpDate: recordData.followUpDate ? new Date(recordData.followUpDate) : null,
        isEmergency: recordData.isEmergency,
        totalCost: totalCost,
        notes: recordData.notes || '',
        attachments: recordData.attachments || [],
        status: 'active',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Actualizar animal si hay diagnósticos severos
      if (recordData.diagnoses && recordData.diagnoses.length > 0) {
        const hasSevereDiagnosis = recordData.diagnoses.some(d => 
          ['severe', 'critical', 'terminal'].includes(d.severity)
        );
        
        if (hasSevereDiagnosis) {
          await animal.update({ 
            healthStatus: 'SICK',
            lastHealthCheck: new Date(recordData.examinationDate),
            updatedAt: new Date()
          } as any);
        }
      }

      // Crear entrada financiera
      if (totalCost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          amount: totalCost.toString(),
          date: new Date(recordData.examinationDate),
          description: `Consulta veterinaria - ${recordData.recordType}`,
          bovineIds: [recordData.animalId],
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      res.status(201).json({
        success: true,
        message: 'Registro médico creado exitosamente',
        data: { record: newRecord }
      });

    } catch (error) {
      console.error('Error al crear registro médico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Crear vacunación
   */
  public createVaccination = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vaccinationData: CreateVaccinationRequest = req.body;
      const userId = req.user?.id || 'system';

      // Validaciones
      if (!vaccinationData.animalId || !vaccinationData.vaccineName || !vaccinationData.applicationDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes'
        });
        return;
      }

      // Verificar animal
      const animal = await Bovine.findOne({
        where: { 
          id: vaccinationData.animalId, 
          isActive: true 
        }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado'
        });
        return;
      }

      // Verificar contraindicaciones
      if (vaccinationData.preVaccinationAssessment.contraindications.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Contraindicaciones encontradas'
        });
        return;
      }

      // Crear ubicación
      const locationRecord = await Location.create({
        latitude: vaccinationData.location.latitude.toString(),
        longitude: vaccinationData.location.longitude.toString(),
        address: vaccinationData.location.address,
        description: vaccinationData.location.vaccinationSite || 'Vacunación',
        accuracy: '10',
        timestamp: new Date(vaccinationData.applicationDate)
      } as any);

      // Registro de vacunación simulado
      const newVaccination = {
        id: this.generateId('vacc'),
        animalId: vaccinationData.animalId,
        animalEarTag: (animal as any).earTag || 'N/A',
        vaccineType: vaccinationData.vaccineType,
        vaccineName: vaccinationData.vaccineName,
        manufacturer: vaccinationData.manufacturer,
        batchNumber: vaccinationData.batchNumber,
        dose: vaccinationData.dose,
        applicationDate: new Date(vaccinationData.applicationDate),
        nextDueDate: vaccinationData.nextDueDate ? new Date(vaccinationData.nextDueDate) : null,
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
      };

      // Entrada financiera
      if (vaccinationData.cost && vaccinationData.cost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          subcategory: 'vaccination',
          amount: vaccinationData.cost.toString(),
          date: new Date(vaccinationData.applicationDate),
          description: `Vacunación ${vaccinationData.vaccineName}`,
          bovineIds: [vaccinationData.animalId],
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      // Actualizar animal
      await animal.update({
        lastVaccinationDate: new Date(vaccinationData.applicationDate),
        updatedAt: new Date()
      } as any);

      res.status(201).json({
        success: true,
        message: 'Vacunación registrada exitosamente',
        data: { vaccination: newVaccination }
      });

    } catch (error) {
      console.error('Error al registrar vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Crear enfermedad
   */
  public createIllness = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const illnessData: CreateIllnessRequest = req.body;
      const userId = req.user?.id || 'system';

      // Validaciones
      if (!illnessData.animalId || !illnessData.diseaseName || !illnessData.diagnosisDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes'
        });
        return;
      }

      // Verificar animal
      const animal = await Bovine.findOne({
        where: { 
          id: illnessData.animalId, 
          isActive: true 
        }
      });

      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal no encontrado'
        });
        return;
      }

      // Crear ubicación
      const locationRecord = await Location.create({
        latitude: illnessData.location.latitude.toString(),
        longitude: illnessData.location.longitude.toString(),
        address: illnessData.location.address,
        description: illnessData.location.isolationArea || 'Diagnóstico',
        accuracy: '10',
        timestamp: new Date(illnessData.diagnosisDate)
      } as any);

      // Registro de enfermedad simulado
      const newIllness = {
        id: this.generateId('illness'),
        animalId: illnessData.animalId,
        animalEarTag: (animal as any).earTag || 'N/A',
        diseaseName: illnessData.diseaseName,
        diagnosisDate: new Date(illnessData.diagnosisDate),
        locationId: locationRecord.id,
        symptoms: illnessData.symptoms,
        clinicalSigns: illnessData.clinicalSigns,
        diagnosisInfo: illnessData.diagnosisInfo,
        epidemiologyInfo: illnessData.epidemiologyInfo,
        riskFactors: illnessData.riskFactors || [],
        treatmentPlan: illnessData.treatmentPlan || {},
        veterinarianName: illnessData.veterinarianName,
        veterinarianId: illnessData.veterinarianId || userId,
        recoveryDate: illnessData.recoveryDate ? new Date(illnessData.recoveryDate) : null,
        totalCost: illnessData.totalCost || 0,
        notes: illnessData.notes || '',
        status: illnessData.epidemiologyInfo.caseClassification,
        reportableDisease: illnessData.reportableDisease || false,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Actualizar estado del animal
      const statusMap: { [key: string]: string } = {
        'mild': 'SICK',
        'moderate': 'SICK',
        'severe': 'CRITICAL',
        'critical': 'CRITICAL',
        'terminal': 'CRITICAL'
      };

      await animal.update({
        healthStatus: statusMap[illnessData.diagnosisInfo.severity] || 'SICK',
        lastHealthCheck: new Date(illnessData.diagnosisDate),
        updatedAt: new Date()
      } as any);

      // Entrada financiera
      if (illnessData.totalCost && illnessData.totalCost > 0) {
        await Finance.create({
          type: 'expense',
          category: 'veterinary',
          subcategory: 'treatment',
          amount: illnessData.totalCost.toString(),
          date: new Date(illnessData.diagnosisDate),
          description: `Tratamiento ${illnessData.diseaseName}`,
          bovineIds: [illnessData.animalId],
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      res.status(201).json({
        success: true,
        message: 'Enfermedad registrada exitosamente',
        data: { illness: newIllness }
      });

    } catch (error) {
      console.error('Error al registrar enfermedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener métricas de salud
   */
  public getHealthMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        animalIds,
        includeFinancialAnalysis = 'true'
      } = req.query;

      // Fechas
      const currentDate = new Date();
      const analysisStartDate = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), 0, 1);
      const analysisEndDate = endDate ? new Date(endDate as string) : currentDate;

      // Filtros
      const animalFilter = animalIds && Array.isArray(animalIds) 
        ? { id: { [Op.in]: animalIds } }
        : {};

      // Contar animales
      const totalAnimals = await Bovine.count({ 
        where: { 
          isActive: true,
          ...animalFilter
        }
      });

      // Datos simulados realistas
      const healthyAnimals = Math.floor(totalAnimals * 0.85);
      const sickAnimals = Math.floor(totalAnimals * 0.10);
      const underTreatment = Math.floor(totalAnimals * 0.03);
      const inQuarantine = Math.floor(totalAnimals * 0.02);
      const healthScore = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;

      const totalVaccinations = Math.floor(totalAnimals * 1.2);
      const vaccinatedAnimals = Math.floor(totalAnimals * 0.95);
      const vaccinationCoverage = totalAnimals > 0 ? Math.round((vaccinatedAnimals / totalAnimals) * 100) : 0;

      const activeCases = Math.floor(totalAnimals * 0.05);
      const newCases = Math.floor(totalAnimals * 0.03);
      const recoveredCases = Math.floor(totalAnimals * 0.02);
      const mortalityCount = Math.floor(totalAnimals * 0.01);

      const mortalityRate = totalAnimals > 0 ? Math.round((mortalityCount / totalAnimals) * 10000) / 100 : 0;
      const morbidityRate = totalAnimals > 0 ? Math.round((newCases / totalAnimals) * 10000) / 100 : 0;

      const activeTreatments = Math.floor(totalAnimals * 0.04);
      const completedTreatments = Math.floor(totalAnimals * 0.02);

      // Análisis de costos simplificado
      let costAnalysis = {
        totalVeterinaryCosts: 0,
        preventiveCosts: 0,
        treatmentCosts: 0,
        medicationCosts: 0,
        laboratoryCosts: 0,
        costPerAnimal: 0,
        costPerCase: 0
      };

      if (includeFinancialAnalysis === 'true') {
        const totalCosts = totalAnimals * 45.50;
        const preventiveCosts = totalAnimals * 25.50;
        const treatmentCosts = totalAnimals * 15.00;
        const medicationCosts = totalAnimals * 3.50;
        const laboratoryCosts = totalAnimals * 1.50;

        costAnalysis = {
          totalVeterinaryCosts: Math.round(totalCosts * 100) / 100,
          preventiveCosts: Math.round(preventiveCosts * 100) / 100,
          treatmentCosts: Math.round(treatmentCosts * 100) / 100,
          medicationCosts: Math.round(medicationCosts * 100) / 100,
          laboratoryCosts: Math.round(laboratoryCosts * 100) / 100,
          costPerAnimal: totalAnimals > 0 ? Math.round((totalCosts / totalAnimals) * 100) / 100 : 0,
          costPerCase: newCases > 0 ? Math.round((totalCosts / newCases) * 100) / 100 : 0
        };
      }

      // Tendencias
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);

        trends.push({
          period: periodStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          healthScore: Math.round(Math.random() * 20 + 80),
          newCases: Math.floor(Math.random() * 10 + 5),
          recoveryRate: Math.round(Math.random() * 20 + 80),
          vaccinationRate: Math.floor(Math.random() * 50 + 150),
          costs: Math.round(Math.random() * 5000 + 10000)
        });
      }

      const metrics = {
        overview: {
          totalAnimals,
          healthyAnimals,
          sickAnimals,
          underTreatment,
          inQuarantine,
          recovered: recoveredCases,
          mortality: mortalityCount,
          healthScore
        },
        vaccinationMetrics: {
          totalVaccinations,
          upToDateAnimals: vaccinatedAnimals,
          overdueVaccinations: totalAnimals - vaccinatedAnimals,
          vaccinationCoverage,
          averageCostPerVaccination: 25.50,
          sideEffectRate: 2.3,
          complianceRate: 94.5
        },
        diseaseMetrics: {
          activeCases,
          newCases,
          recoveredCases,
          mortalityRate,
          morbidityRate,
          avgRecoveryTime: 7.5,
          treatmentSuccessRate: recoveredCases > 0 ? Math.round((recoveredCases / newCases) * 100) : 0,
          contagiousDiseases: Math.floor(activeCases * 0.3)
        },
        treatmentMetrics: {
          activeTreatments,
          completedTreatments,
          treatmentCosts: costAnalysis.treatmentCosts,
          avgTreatmentDuration: 5.2,
          medicationCompliance: 89.7,
          adverseReactions: 3
        },
        costAnalysis,
        trends
      };

      res.status(200).json({
        success: true,
        message: 'Métricas de salud obtenidas exitosamente',
        data: {
          metrics,
          period: { 
            startDate: analysisStartDate, 
            endDate: analysisEndDate 
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas de salud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Análisis epidemiológico
   */
  public getEpidemiologyAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'quarterly',
        diseaseCategories,
        includeMapping = 'true'
      } = req.query;

      // Datos simulados
      const diseaseOutbreaks = [
        {
          disease: 'Mastitis',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          caseCount: 12,
          attackRate: 15.4,
          mortalityRate: 0.8,
          geographicSpread: [
            {
              location: 'Sector Norte',
              caseCount: 8,
              coordinates: { lat: 17.9869, lng: -92.9303 }
            },
            {
              location: 'Sector Sur',
              caseCount: 4,
              coordinates: { lat: 17.9800, lng: -92.9250 }
            }
          ],
          controlMeasures: [
            'Aislamiento de casos',
            'Desinfección de áreas',
            'Tratamiento con antibióticos'
          ],
          status: 'resolved'
        }
      ];

      let spatialAnalysis = {
        hotspots: [] as any[],
        clusters: [] as any[]
      };

      if (includeMapping === 'true') {
        spatialAnalysis = {
          hotspots: [
            {
              center: { lat: 17.9869, lng: -92.9303 },
              radius: 500,
              caseCount: 8,
              diseases: ['mastitis', 'neumonía'],
              riskLevel: 'medium'
            }
          ],
          clusters: [
            {
              id: 'cluster_001',
              disease: 'mastitis',
              locations: [
                { lat: 17.9869, lng: -92.9303 },
                { lat: 17.9800, lng: -92.9250 }
              ],
              confidence: 0.85,
              significance: 0.92
            }
          ]
        };
      }

      const riskAssessment = {
        overallRisk: 'medium',
        riskFactors: [
          { factor: 'Densidad de población', weight: 0.3, impact: 'Alta concentración de animales' },
          { factor: 'Condiciones climáticas', weight: 0.2, impact: 'Humedad y temperatura favorables' }
        ],
        recommendations: [
          'Reforzar medidas de bioseguridad',
          'Incrementar frecuencia de monitoreo sanitario'
        ]
      };

      const analysis = {
        diseaseOutbreaks,
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
        message: 'Error interno del servidor'
      });
    }
  };

  // Método auxiliar
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}