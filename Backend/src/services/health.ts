import { Op } from 'sequelize';
import Health from '../models/Health';
import Medication from '../models/Medication';
import Inventory from '../models/Inventory';
import { logger as appLogger } from '../utils/logger';

// Mock de modelos faltantes
interface VaccinationRecord {
  id: string;
  bovineId: string;
  vaccineId: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  administrationDate: Date;
  nextDueDate?: Date;
  dose: string;
  administrationRoute: AdministrationRoute;
  veterinarianId: string;
  veterinarianName: string;
  location: Location;
  status: VaccinationStatus;
  type: VaccinationType;
  cost: number;
  sideEffects?: string[];
  efficacyRate?: number;
  notes?: string;
  createdAt: Date;
}

interface TreatmentPlan {
  id: string;
  bovineId: string;
  veterinarianId: string;
  condition: string;
  diagnosis: string;
  startDate: Date;
  endDate?: Date;
  duration?: number;
  status: TreatmentStatus;
  type: TreatmentType;
  medications: TreatmentMedication[];
  instructions: string[];
  objectives: string[];
  progress: number;
  nextCheckup?: Date;
  totalCost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Logger temporal (reemplazando el conflicto)
const healthLogger = {
  info: (message: string) => console.log(`INFO: ${message}`),
  error: (message: string, error?: any) => console.error(`ERROR: ${message}`, error),
  warn: (message: string) => console.warn(`WARN: ${message}`)
};

// Enums para el sistema de salud
enum HealthStatus {
  HEALTHY = 'healthy',
  SICK = 'sick',
  RECOVERING = 'recovering',
  QUARANTINE = 'quarantine',
  DECEASED = 'deceased',
  CRITICAL = 'critical'
}

enum VaccinationType {
  CORE = 'core',              // Vacunas esenciales
  NON_CORE = 'non_core',      // Vacunas opcionales
  EMERGENCY = 'emergency',     // Vacunas de emergencia
  BOOSTER = 'booster'         // Refuerzos
}

enum TreatmentType {
  PREVENTIVE = 'preventive',
  CURATIVE = 'curative',
  SUPPORTIVE = 'supportive',
  PALLIATIVE = 'palliative',
  SURGICAL = 'surgical'
}

enum MedicationType {
  ANTIBIOTIC = 'antibiotic',
  VACCINE = 'vaccine',
  VITAMIN = 'vitamin',
  HORMONE = 'hormone',
  ANTIPARASITIC = 'antiparasitic',
  ANALGESIC = 'analgesic',
  ANTI_INFLAMMATORY = 'anti_inflammatory',
  OTHER = 'other'
}

enum AdministrationRoute {
  ORAL = 'oral',
  INTRAMUSCULAR = 'intramuscular',
  SUBCUTANEOUS = 'subcutaneous',
  INTRAVENOUS = 'intravenous',
  TOPICAL = 'topical',
  INTRAUTERINE = 'intrauterine',
  INTRAMAMMARY = 'intramammary',
  INHALATION = 'inhalation'
}

enum DiseaseCategory {
  INFECTIOUS = 'infectious',
  PARASITIC = 'parasitic',
  METABOLIC = 'metabolic',
  REPRODUCTIVE = 'reproductive',
  RESPIRATORY = 'respiratory',
  DIGESTIVE = 'digestive',
  MUSCULOSKELETAL = 'musculoskeletal',
  DERMATOLOGICAL = 'dermatological',
  NEUROLOGICAL = 'neurological',
  CARDIOVASCULAR = 'cardiovascular'
}

enum DiseaseSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

enum TreatmentStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

enum VaccinationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

// Interfaces principales
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MedicalRecord {
  id: string;
  bovineId: string;
  veterinarianId: string;
  consultationType: string;
  diagnosis?: string;
  treatment?: string;
  consultationDate: Date;
  nextConsultation?: Date;
  cost?: number;
  observations?: string;
  medications: AppliedMedication[];
  attachments?: string[];
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
}

interface AppliedMedication {
  id: string;
  healthRecordId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  applicationDate: Date;
  applicationTime?: string;
  administrationRoute: AdministrationRoute;
  appliedBy: string;
  observations?: string;
  withdrawalPeriod?: number; // días
  cost: number;
}

interface TreatmentMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: AdministrationRoute;
  instructions: string;
  startDate: Date;
  endDate: Date;
  cost: number;
}

interface DiseaseRecord {
  id: string;
  bovineId: string;
  diseaseName: string;
  category: DiseaseCategory;
  dateDetected: Date;
  dateResolved?: Date;
  severity: DiseaseSeverity;
  status: 'suspected' | 'confirmed' | 'treated' | 'recovered' | 'chronic';
  symptoms: string[];
  diagnosis: string;
  treatment?: string;
  veterinarianId: string;
  isContagious: boolean;
  quarantineRequired: boolean;
  quarantineEndDate?: Date;
  isReportable: boolean; // Enfermedad de declaración obligatoria
  relatedCases?: string[]; // IDs de casos relacionados
  preventionMeasures: string[];
  cost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HealthAlert {
  id: string;
  bovineId: string;
  alertType: 'vaccination_due' | 'treatment_overdue' | 'health_deterioration' | 'quarantine_violation' | 'medication_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  triggerDate: Date;
  dueDate?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actions: string[];
  relatedRecordId?: string;
  notificationSent: boolean;
}

interface HealthMetrics {
  bovineId: string;
  period: {
    start: Date;
    end: Date;
  };
  consultations: number;
  vaccinations: number;
  treatments: number;
  activeDiseases: number;
  totalCost: number;
  averageWeight?: number;
  healthScore: number; // 0-100
  riskFactors: string[];
  recommendations: string[];
}

interface VaccinationSchedule {
  bovineId: string;
  schedules: VaccinationScheduleItem[];
}

interface VaccinationScheduleItem {
  vaccineId: string;
  vaccineName: string;
  type: VaccinationType;
  scheduledDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRecurring: boolean;
  intervalDays?: number;
  lastAdministered?: Date;
  status: VaccinationStatus;
  cost: number;
}

interface HealthStatistics {
  totalConsultations: number;
  totalVaccinations: number;
  totalTreatments: number;
  activeTreatments: number;
  healthyAnimals: number;
  sickAnimals: number;
  criticalAnimals: number;
  quarantinedAnimals: number;
  totalHealthCosts: number;
  averageCostPerAnimal: number;
  commonDiseases: { disease: string; count: number }[];
  vaccinationCoverage: number; // porcentaje
  treatmentSuccessRate: number;
  mortalityRate: number;
}

// Mock de modelos
const HealthModel = {
  create: async (data: any): Promise<MedicalRecord> => data as MedicalRecord,
  findAll: async (options: any): Promise<MedicalRecord[]> => [],
  findByPk: async (id: string): Promise<MedicalRecord | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 0
};

const VaccinationRecordModel = {
  create: async (data: any): Promise<VaccinationRecord> => data as VaccinationRecord,
  findAll: async (options: any): Promise<VaccinationRecord[]> => [],
  findByPk: async (id: string): Promise<VaccinationRecord | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 0
};

const TreatmentPlanModel = {
  create: async (data: any): Promise<TreatmentPlan> => data as TreatmentPlan,
  findAll: async (options: any): Promise<TreatmentPlan[]> => [],
  findByPk: async (id: string): Promise<TreatmentPlan | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 0
};

const DiseaseRecordModel = {
  create: async (data: any): Promise<DiseaseRecord> => data as DiseaseRecord,
  findAll: async (options: any): Promise<DiseaseRecord[]> => [],
  findByPk: async (id: string): Promise<DiseaseRecord | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 0
};

// Mock de servicios
const notificationService = {
  sendHealthAlert: async (alert: HealthAlert): Promise<void> => {
    console.log(`Enviando alerta de salud: ${alert.message}`);
  },
  sendVaccinationReminder: async (bovineId: string, vaccineName: string, dueDate: Date): Promise<void> => {
    console.log(`Recordatorio de vacunación: ${vaccineName} para bovino ${bovineId}`);
  }
};

const emailService = {
  sendVaccinationReminder: async (email: string, data: any): Promise<void> => {
    console.log(`Enviando recordatorio de vacunación por email a ${email}`);
  },
  sendHealthAlert: async (email: string, data: any): Promise<void> => {
    console.log(`Enviando alerta de salud por email a ${email}`);
  }
};

const geolocationService = {
  validateCoordinates: (location: Location): boolean => {
    return location.latitude >= -90 && location.latitude <= 90 &&
           location.longitude >= -180 && location.longitude <= 180;
  },
  reverseGeocode: async (location: Location): Promise<string> => {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
};

class HealthService {
  /**
   * Crea un nuevo registro médico para un bovino
   * @param medicalData - Datos del registro médico
   * @param userId - ID del usuario que crea el registro
   * @returns Promise con el registro médico creado
   */
  async createMedicalRecord(medicalData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<MedicalRecord> {
    try {
      // Validar ubicación si se proporciona
      if (medicalData.location && !geolocationService.validateCoordinates(medicalData.location)) {
        throw new Error('Coordenadas de ubicación inválidas');
      }

      // Crear registro médico
      const medicalRecord: MedicalRecord = {
        ...medicalData,
        id: this.generateHealthId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await HealthModel.create(medicalRecord);

      // Registrar medicamentos aplicados
      if (medicalData.medications && medicalData.medications.length > 0) {
        for (const medication of medicalData.medications) {
          await this.recordAppliedMedication({
            ...medication,
            healthRecordId: medicalRecord.id
          });
        }
      }

      // Crear alertas si es necesario
      await this.createHealthAlertsFromRecord(medicalRecord);

      // Enviar notificaciones
      await this.sendHealthNotifications(medicalRecord, userId);

      healthLogger.info(`Registro médico creado para bovino ${medicalData.bovineId}`);
      return medicalRecord;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error creando registro médico:', errorMessage);
      throw new Error(`Error creando registro médico: ${errorMessage}`);
    }
  }

  /**
   * Registra una vacunación para un bovino
   * @param vaccinationData - Datos de la vacunación
   * @param userId - ID del usuario
   * @returns Promise con el registro de vacunación
   */
  async recordVaccination(vaccinationData: Omit<VaccinationRecord, 'id' | 'createdAt'>, userId: string): Promise<VaccinationRecord> {
    try {
      // Validar ubicación
      if (!geolocationService.validateCoordinates(vaccinationData.location)) {
        throw new Error('Coordenadas de ubicación inválidas');
      }

      // Verificar si ya existe una vacunación reciente del mismo tipo
      const existingVaccination = await this.checkDuplicateVaccination(
        vaccinationData.bovineId,
        vaccinationData.vaccineId,
        vaccinationData.administrationDate
      );

      if (existingVaccination) {
        throw new Error(`Ya existe una vacunación reciente de ${vaccinationData.vaccineName} para este bovino`);
      }

      // Calcular próxima fecha de vacunación
      const nextDueDate = this.calculateNextVaccinationDate(vaccinationData.vaccineId, vaccinationData.administrationDate);

      const vaccinationRecord: VaccinationRecord = {
        ...vaccinationData,
        id: this.generateVaccinationId(),
        nextDueDate,
        createdAt: new Date()
      };

      await VaccinationRecordModel.create(vaccinationRecord);

      // Programar próxima vacunación
      if (nextDueDate) {
        await this.scheduleNextVaccination(vaccinationRecord);
      }

      // Actualizar inventario de vacunas
      await this.updateVaccineInventory(vaccinationData.vaccineId, 1);

      // Enviar confirmación
      await this.sendVaccinationConfirmation(vaccinationRecord, userId);

      healthLogger.info(`Vacunación registrada: ${vaccinationData.vaccineName} para bovino ${vaccinationData.bovineId}`);
      return vaccinationRecord;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error registrando vacunación:', errorMessage);
      throw new Error(`Error registrando vacunación: ${errorMessage}`);
    }
  }

  /**
   * Crea un plan de tratamiento para un bovino
   * @param treatmentData - Datos del plan de tratamiento
   * @param userId - ID del usuario
   * @returns Promise con el plan de tratamiento creado
   */
  async createTreatmentPlan(treatmentData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<TreatmentPlan> {
    try {
      // Validar medicamentos del plan
      for (const medication of treatmentData.medications) {
        await this.validateMedicationAvailability(medication.medicationId, medication.dosage);
      }

      // Calcular costo total
      const totalCost = treatmentData.medications.reduce((sum, med) => sum + med.cost, 0);

      const treatmentPlan: TreatmentPlan = {
        ...treatmentData,
        id: this.generateTreatmentId(),
        totalCost,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await TreatmentPlanModel.create(treatmentPlan);

      // Reservar medicamentos en inventario
      for (const medication of treatmentData.medications) {
        await this.reserveMedicationInventory(medication.medicationId, medication.dosage);
      }

      // Crear alertas de seguimiento
      await this.createTreatmentAlerts(treatmentPlan);

      healthLogger.info(`Plan de tratamiento creado para bovino ${treatmentData.bovineId}`);
      return treatmentPlan;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error creando plan de tratamiento:', errorMessage);
      throw new Error(`Error creando plan de tratamiento: ${errorMessage}`);
    }
  }

  /**
   * Registra una enfermedad para un bovino
   * @param diseaseData - Datos de la enfermedad
   * @param userId - ID del usuario
   * @returns Promise con el registro de la enfermedad
   */
  async recordDisease(diseaseData: Omit<DiseaseRecord, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<DiseaseRecord> {
    try {
      const diseaseRecord: DiseaseRecord = {
        ...diseaseData,
        id: this.generateDiseaseId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await DiseaseRecordModel.create(diseaseRecord);

      // Manejar cuarentena si es necesaria
      if (diseaseData.quarantineRequired) {
        await this.initiateQuarantine(diseaseData.bovineId, diseaseData.quarantineEndDate);
      }

      // Procesar enfermedad contagiosa
      if (diseaseData.isContagious) {
        await this.handleContagiousDisease(diseaseRecord);
      }

      // Reportar enfermedad si es de declaración obligatoria
      if (diseaseData.isReportable) {
        await this.reportNotifiableDisease(diseaseRecord);
      }

      // Crear alertas críticas
      if (diseaseData.severity === DiseaseSeverity.CRITICAL) {
        await this.createCriticalHealthAlert(diseaseRecord);
      }

      healthLogger.info(`Enfermedad registrada: ${diseaseData.diseaseName} para bovino ${diseaseData.bovineId}`);
      return diseaseRecord;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error registrando enfermedad:', errorMessage);
      throw new Error(`Error registrando enfermedad: ${errorMessage}`);
    }
  }

  /**
   * Obtiene el historial médico completo de un bovino
   * @param bovineId - ID del bovino
   * @param filters - Filtros opcionales
   * @returns Promise con el historial médico
   */
  async getMedicalHistory(
    bovineId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      includeVaccinations?: boolean;
      includeTreatments?: boolean;
      includeDiseases?: boolean;
    } = {}
  ): Promise<{
    medicalRecords: MedicalRecord[];
    vaccinations: VaccinationRecord[];
    treatments: TreatmentPlan[];
    diseases: DiseaseRecord[];
  }> {
    try {
      const whereConditions: any = { bovineId };

      // Aplicar filtros de fecha
      if (filters.startDate || filters.endDate) {
        const dateFilter: any = {};
        if (filters.startDate) dateFilter[Op.gte] = filters.startDate;
        if (filters.endDate) dateFilter[Op.lte] = filters.endDate;
        whereConditions.consultationDate = dateFilter;
      }

      // Obtener registros médicos
      const medicalRecords = await HealthModel.findAll({
        where: whereConditions,
        order: [['consultationDate', 'DESC']]
      });

      let vaccinations: VaccinationRecord[] = [];
      let treatments: TreatmentPlan[] = [];
      let diseases: DiseaseRecord[] = [];

      // Obtener vacunaciones si se solicita
      if (filters.includeVaccinations) {
        const vaccinationWhere: any = { bovineId };
        if (filters.startDate || filters.endDate) {
          const dateFilter: any = {};
          if (filters.startDate) dateFilter[Op.gte] = filters.startDate;
          if (filters.endDate) dateFilter[Op.lte] = filters.endDate;
          vaccinationWhere.administrationDate = dateFilter;
        }

        vaccinations = await VaccinationRecordModel.findAll({
          where: vaccinationWhere,
          order: [['administrationDate', 'DESC']]
        });
      }

      // Obtener tratamientos si se solicita
      if (filters.includeTreatments) {
        const treatmentWhere: any = { bovineId };
        if (filters.startDate || filters.endDate) {
          const dateFilter: any = {};
          if (filters.startDate) dateFilter[Op.gte] = filters.startDate;
          if (filters.endDate) dateFilter[Op.lte] = filters.endDate;
          treatmentWhere.startDate = dateFilter;
        }

        treatments = await TreatmentPlanModel.findAll({
          where: treatmentWhere,
          order: [['startDate', 'DESC']]
        });
      }

      // Obtener enfermedades si se solicita
      if (filters.includeDiseases) {
        const diseaseWhere: any = { bovineId };
        if (filters.startDate || filters.endDate) {
          const dateFilter: any = {};
          if (filters.startDate) dateFilter[Op.gte] = filters.startDate;
          if (filters.endDate) dateFilter[Op.lte] = filters.endDate;
          diseaseWhere.dateDetected = dateFilter;
        }

        diseases = await DiseaseRecordModel.findAll({
          where: diseaseWhere,
          order: [['dateDetected', 'DESC']]
        });
      }

      return {
        medicalRecords,
        vaccinations,
        treatments,
        diseases
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error(`Error obteniendo historial médico para bovino ${bovineId}:`, errorMessage);
      throw new Error(`Error obteniendo historial médico: ${errorMessage}`);
    }
  }

  /**
   * Obtiene la programación de vacunaciones pendientes
   * @param ranchId - ID del rancho (opcional)
   * @param days - Días hacia adelante para buscar
   * @returns Promise con vacunaciones programadas
   */
  async getVaccinationSchedule(ranchId?: string, days = 30): Promise<VaccinationScheduleItem[]> {
    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));

      // Mock de programación de vacunaciones
      const scheduleItems: VaccinationScheduleItem[] = [
        {
          vaccineId: 'vacc_001',
          vaccineName: 'Vacuna Triple Bovina',
          type: VaccinationType.CORE,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'high',
          isRecurring: true,
          intervalDays: 365,
          status: VaccinationStatus.SCHEDULED,
          cost: 85.00
        },
        {
          vaccineId: 'vacc_002',
          vaccineName: 'Vacuna Brucelosis',
          type: VaccinationType.CORE,
          scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          priority: 'urgent',
          isRecurring: false,
          status: VaccinationStatus.OVERDUE,
          cost: 120.00
        }
      ];

      // Filtrar por fechas
      const filteredSchedule = scheduleItems.filter(item => 
        item.scheduledDate >= startDate && item.scheduledDate <= endDate
      );

      // Ordenar por prioridad y fecha
      filteredSchedule.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      });

      return filteredSchedule;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error obteniendo programación de vacunaciones:', errorMessage);
      throw new Error(`Error obteniendo programación: ${errorMessage}`);
    }
  }

  /**
   * Calcula métricas de salud para un bovino
   * @param bovineId - ID del bovino
   * @param period - Período de análisis
   * @returns Promise con métricas de salud
   */
  async calculateHealthMetrics(bovineId: string, period: { start: Date; end: Date }): Promise<HealthMetrics> {
    try {
      // Obtener datos del período
      const whereConditions = {
        bovineId,
        consultationDate: { [Op.between]: [period.start, period.end] }
      };

      const consultations = await HealthModel.count({ where: whereConditions });
      
      const vaccinationWhere = {
        bovineId,
        administrationDate: { [Op.between]: [period.start, period.end] }
      };
      const vaccinations = await VaccinationRecordModel.count({ where: vaccinationWhere });

      const treatmentWhere = {
        bovineId,
        startDate: { [Op.between]: [period.start, period.end] }
      };
      const treatments = await TreatmentPlanModel.count({ where: treatmentWhere });

      const diseaseWhere = {
        bovineId,
        dateDetected: { [Op.between]: [period.start, period.end] },
        status: { [Op.in]: ['suspected', 'confirmed', 'treated'] }
      };
      const activeDiseases = await DiseaseRecordModel.count({ where: diseaseWhere });

      // Calcular costo total (mock)
      const totalCost = 2500.00;

      // Calcular score de salud basado en factores
      let healthScore = 100;
      if (activeDiseases > 0) healthScore -= (activeDiseases * 20);
      if (consultations > 5) healthScore -= 10;
      healthScore = Math.max(0, Math.min(100, healthScore));

      // Identificar factores de riesgo
      const riskFactors = [];
      if (activeDiseases > 0) riskFactors.push('Enfermedades activas');
      if (consultations > 3) riskFactors.push('Múltiples consultas médicas');
      if (vaccinations === 0) riskFactors.push('Falta de vacunaciones');

      // Generar recomendaciones
      const recommendations = [];
      if (vaccinations === 0) recommendations.push('Actualizar esquema de vacunación');
      if (activeDiseases > 0) recommendations.push('Seguimiento médico continuo');
      if (healthScore < 70) recommendations.push('Evaluación veterinaria urgente');

      const metrics: HealthMetrics = {
        bovineId,
        period,
        consultations,
        vaccinations,
        treatments,
        activeDiseases,
        totalCost,
        healthScore,
        riskFactors,
        recommendations
      };

      return metrics;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error(`Error calculando métricas de salud para bovino ${bovineId}:`, errorMessage);
      throw new Error(`Error calculando métricas: ${errorMessage}`);
    }
  }

  /**
   * Procesa alertas de salud automáticas
   * @param ranchId - ID del rancho (opcional)
   * @returns Promise con alertas procesadas
   */
  async processHealthAlerts(ranchId?: string): Promise<HealthAlert[]> {
    try {
      const alerts: HealthAlert[] = [];
      const now = new Date();

      // Verificar vacunaciones vencidas
      const overdueVaccinations = await VaccinationRecordModel.findAll({
        where: {
          nextDueDate: { [Op.lte]: now },
          status: VaccinationStatus.SCHEDULED
        }
      });

      for (const vaccination of overdueVaccinations) {
        alerts.push({
          id: this.generateAlertId(),
          bovineId: vaccination.bovineId,
          alertType: 'vaccination_due',
          severity: 'high',
          message: `Vacunación vencida: ${vaccination.vaccineName}`,
          details: `La vacuna ${vaccination.vaccineName} está vencida desde ${vaccination.nextDueDate?.toLocaleDateString()}`,
          triggerDate: now,
          dueDate: vaccination.nextDueDate,
          isResolved: false,
          actions: ['Programar vacunación', 'Contactar veterinario'],
          relatedRecordId: vaccination.id,
          notificationSent: false
        });
      }

      // Verificar tratamientos sin seguimiento
      const overdueTreatments = await TreatmentPlanModel.findAll({
        where: {
          nextCheckup: { [Op.lte]: now },
          status: TreatmentStatus.ACTIVE
        }
      });

      for (const treatment of overdueTreatments) {
        alerts.push({
          id: this.generateAlertId(),
          bovineId: treatment.bovineId,
          alertType: 'treatment_overdue',
          severity: 'medium',
          message: `Seguimiento de tratamiento pendiente`,
          details: `El tratamiento para ${treatment.condition} requiere seguimiento`,
          triggerDate: now,
          dueDate: treatment.nextCheckup,
          isResolved: false,
          actions: ['Evaluar progreso', 'Ajustar tratamiento'],
          relatedRecordId: treatment.id,
          notificationSent: false
        });
      }

      // Enviar notificaciones para alertas no enviadas
      for (const alert of alerts.filter(a => !a.notificationSent)) {
        await this.sendHealthAlertNotification(alert);
        alert.notificationSent = true;
      }

      healthLogger.info(`Procesadas ${alerts.length} alertas de salud`);
      return alerts;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error procesando alertas de salud:', errorMessage);
      throw new Error(`Error procesando alertas: ${errorMessage}`);
    }
  }

  /**
   * Obtiene estadísticas generales de salud
   * @param ranchId - ID del rancho (opcional)
   * @param period - Período de análisis
   * @returns Promise con estadísticas
   */
  async getHealthStatistics(ranchId?: string, period = 30): Promise<HealthStatistics> {
    try {
      const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));
      
      // Mock de estadísticas (en producción se calcularían con datos reales)
      const statistics: HealthStatistics = {
        totalConsultations: 1245,
        totalVaccinations: 2156,
        totalTreatments: 234,
        activeTreatments: 45,
        healthyAnimals: 1890,
        sickAnimals: 78,
        criticalAnimals: 12,
        quarantinedAnimals: 23,
        totalHealthCosts: 125000.50,
        averageCostPerAnimal: 65.78,
        commonDiseases: [
          { disease: 'Mastitis', count: 45 },
          { disease: 'Parasitosis', count: 32 },
          { disease: 'Claudicación', count: 28 },
          { disease: 'Diarrea', count: 21 }
        ],
        vaccinationCoverage: 94.5,
        treatmentSuccessRate: 89.2,
        mortalityRate: 2.1
      };

      return statistics;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      healthLogger.error('Error obteniendo estadísticas de salud:', errorMessage);
      throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
    }
  }

  // Métodos privados de utilidad

  private async checkDuplicateVaccination(bovineId: string, vaccineId: string, administrationDate: Date): Promise<boolean> {
    try {
      const daysBefore = new Date(administrationDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const existing = await VaccinationRecordModel.findAll({
        where: {
          bovineId,
          vaccineId,
          administrationDate: { [Op.between]: [daysBefore, administrationDate] }
        }
      });

      return existing.length > 0;

    } catch (error) {
      return false;
    }
  }

  private calculateNextVaccinationDate(vaccineId: string, administrationDate: Date): Date | undefined {
    // Mock de cálculo de próxima vacunación
    const vaccinationIntervals: Record<string, number> = {
      'vacc_001': 365, // Triple bovina - anual
      'vacc_002': 730, // Brucelosis - cada 2 años
      'vacc_003': 180, // Otras - cada 6 meses
    };

    const intervalDays = vaccinationIntervals[vaccineId] || 365;
    return new Date(administrationDate.getTime() + (intervalDays * 24 * 60 * 60 * 1000));
  }

  private async recordAppliedMedication(medicationData: AppliedMedication): Promise<void> {
    try {
      // Mock de registro de medicación aplicada
      console.log('Medicación registrada:', medicationData);
    } catch (error) {
      healthLogger.error('Error registrando medicación aplicada:', error);
    }
  }

  private async createHealthAlertsFromRecord(record: MedicalRecord): Promise<void> {
    // Mock de creación de alertas basadas en el registro médico
    console.log('Creando alertas de salud para registro:', record.id);
  }

  private async sendHealthNotifications(record: MedicalRecord, userId: string): Promise<void> {
    try {
      // Enviar notificación de consulta registrada
      await notificationService.sendHealthAlert({
        id: this.generateAlertId(),
        bovineId: record.bovineId,
        alertType: 'health_deterioration',
        severity: 'medium',
        message: 'Nueva consulta médica registrada',
        details: `Consulta: ${record.consultationType}`,
        triggerDate: new Date(),
        isResolved: false,
        actions: ['Revisar diagnóstico', 'Programar seguimiento'],
        relatedRecordId: record.id,
        notificationSent: false
      });
    } catch (error) {
      healthLogger.error('Error enviando notificaciones de salud:', error);
    }
  }

  private async scheduleNextVaccination(vaccination: VaccinationRecord): Promise<void> {
    if (vaccination.nextDueDate) {
      console.log(`Programando próxima vacunación de ${vaccination.vaccineName} para ${vaccination.nextDueDate.toLocaleDateString()}`);
    }
  }

  private async updateVaccineInventory(vaccineId: string, quantity: number): Promise<void> {
    console.log(`Actualizando inventario: ${vaccineId}, cantidad usada: ${quantity}`);
  }

  private async sendVaccinationConfirmation(vaccination: VaccinationRecord, userId: string): Promise<void> {
    try {
      await notificationService.sendVaccinationReminder(
        vaccination.bovineId, 
        vaccination.vaccineName, 
        vaccination.nextDueDate || new Date()
      );
    } catch (error) {
      healthLogger.error('Error enviando confirmación de vacunación:', error);
    }
  }

  private async validateMedicationAvailability(medicationId: string, dosage: string): Promise<void> {
    // Mock de validación de disponibilidad de medicamento
    console.log(`Validando disponibilidad de medicamento ${medicationId}, dosis: ${dosage}`);
  }

  private async reserveMedicationInventory(medicationId: string, dosage: string): Promise<void> {
    console.log(`Reservando medicamento ${medicationId}, dosis: ${dosage}`);
  }

  private async createTreatmentAlerts(treatment: TreatmentPlan): Promise<void> {
    console.log(`Creando alertas de seguimiento para tratamiento ${treatment.id}`);
  }

  private async initiateQuarantine(bovineId: string, endDate?: Date): Promise<void> {
    console.log(`Iniciando cuarentena para bovino ${bovineId} hasta ${endDate?.toLocaleDateString() || 'indefinido'}`);
  }

  private async handleContagiousDisease(disease: DiseaseRecord): Promise<void> {
    console.log(`Manejando enfermedad contagiosa: ${disease.diseaseName} para bovino ${disease.bovineId}`);
  }

  private async reportNotifiableDisease(disease: DiseaseRecord): Promise<void> {
    console.log(`Reportando enfermedad de declaración obligatoria: ${disease.diseaseName}`);
  }

  private async createCriticalHealthAlert(disease: DiseaseRecord): Promise<void> {
    const alert: HealthAlert = {
      id: this.generateAlertId(),
      bovineId: disease.bovineId,
      alertType: 'health_deterioration',
      severity: 'critical',
      message: `Estado crítico: ${disease.diseaseName}`,
      details: `Enfermedad crítica detectada que requiere atención inmediata`,
      triggerDate: new Date(),
      isResolved: false,
      actions: ['Contactar veterinario de emergencia', 'Iniciar tratamiento urgente'],
      relatedRecordId: disease.id,
      notificationSent: false
    };

    await notificationService.sendHealthAlert(alert);
  }

  private async sendHealthAlertNotification(alert: HealthAlert): Promise<void> {
    try {
      await notificationService.sendHealthAlert(alert);
    } catch (error) {
      healthLogger.error('Error enviando notificación de alerta:', error);
    }
  }

  private generateHealthId(): string {
    return `health_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateVaccinationId(): string {
    return `vacc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateTreatmentId(): string {
    return `treat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateDiseaseId(): string {
    return `disease_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Exportar instancia única del servicio
export const healthService = new HealthService();