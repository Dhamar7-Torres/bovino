import { Op, Transaction } from 'sequelize';
import { logger as appLogger } from '../utils/logger';

// Logger específico para el servicio de reproducción
const logger = {
  info: (message: string, metadata?: any) => appLogger.info(message, metadata, 'ReproductionService'),
  error: (message: string, error?: any) => appLogger.error(message, { error }, error as Error, 'ReproductionService'),
  warn: (message: string, metadata?: any) => appLogger.warn(message, metadata, 'ReproductionService')
};

// Tipos y enums para reproducción
export type ReproductionType = 
  | 'HEAT_DETECTION'
  | 'ARTIFICIAL_INSEMINATION'
  | 'NATURAL_MATING'
  | 'PREGNANCY_CHECK'
  | 'BIRTH'
  | 'WEANING'
  | 'BREEDING_EVALUATION'
  | 'SYNCHRONIZATION';

export type PregnancyStatus = 'CONFIRMED' | 'NEGATIVE' | 'UNCERTAIN' | 'RECHECK';

// Interfaces principales
export interface ReproductionRecord {
  id: string;
  bovineId: string;
  type: ReproductionType;
  eventDate: Date;
  location?: LocationData;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface BreedingEvent {
  id: string;
  bovineId: string;
  eventType: 'HEAT' | 'INSEMINATION' | 'MATING';
  eventDate: Date;
  details: Record<string, any>;
}

export interface BirthRecord {
  id: string;
  motherId: string;
  birthDate: Date;
  calvingType: 'NATURAL' | 'ASSISTED' | 'CESAREAN';
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT';
  assistance: boolean;
  veterinarianId?: string;
  duration?: number;
  complications?: string[];
  placentaExpulsion?: 'NORMAL' | 'RETAINED' | 'MANUAL';
  calfGender: 'MALE' | 'FEMALE';
  calfWeight?: number;
  calfHealth: 'HEALTHY' | 'WEAK' | 'SICK';
  calfVigor: 'STRONG' | 'MODERATE' | 'WEAK';
  calfEarTag?: string;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeatRecord {
  id: string;
  bovineId: string;
  detectedDate: Date;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  duration?: number;
  symptoms: string[];
  detectionMethod: 'VISUAL' | 'PEDOMETER' | 'HEAT_DETECTOR' | 'HORMONE_TEST';
  nextPredictedHeat?: Date;
  optimalBreedingWindow?: {
    start: Date;
    end: Date;
  };
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InseminationRecord {
  id: string;
  bovineId: string;
  serviceDate: Date;
  bullId?: string;
  bullName?: string;
  semenBatch?: string;
  semenQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  technicianId?: string;
  technicianName?: string;
  method: 'ARTIFICIAL' | 'NATURAL';
  cervixQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  timeFromHeat?: number;
  expectedPregnancyCheck?: Date;
  expectedCalvingDate?: Date;
  cost?: number;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PregnancyRecord {
  id: string;
  bovineId: string;
  checkDate: Date;
  status: PregnancyStatus;
  method: 'PALPATION' | 'ULTRASOUND' | 'BLOOD_TEST' | 'VISUAL';
  gestationAge?: number;
  veterinarianId?: string;
  veterinarianName?: string;
  expectedCalvingDate?: Date;
  relatedInseminationId?: string;
  nextCheckDate?: Date;
  fetusViability?: 'GOOD' | 'FAIR' | 'POOR';
  complications?: string[];
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReproductionMetrics {
  bovineId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalEvents: number;
  eventsByType: Record<string, {
    count: number;
    lastDate: Date;
    frequency: number;
  }>;
  fertilityRate: number;
  averageCalvingInterval: number;
  averageGestation: number;
  totalCalves: number;
  lastEvent: Date | null;
  fertilityAnalysis?: FertilityAnalysis;
}

export interface FertilityAnalysis {
  conception: {
    rate: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    factors: string[];
  };
  calving: {
    interval: number;
    regularity: 'REGULAR' | 'IRREGULAR';
    complications: string[];
  };
  breeding: {
    efficiency: number;
    recommendations: string[];
  };
}

export interface GeneticRecord {
  id: string;
  bovineId: string;
  sireBullId?: string;
  damCowId?: string;
  geneticTraits: Record<string, any>;
  breedingValue?: number;
  heritability?: Record<string, number>;
}

export interface SynchronizationProtocol {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    day: number;
    action: string;
    hormone?: string;
    dosage?: string;
    notes?: string;
  }>;
  duration: number;
  expectedResults: string[];
}

// Clases de error
export class ApiError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Mocks para modelos
const Reproduction = {
  create: async (data: any, options?: any): Promise<any> => ({
    ...data,
    id: `repro_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }),
  findByPk: async (id: string, options?: any): Promise<any | null> => ({
    id,
    bovineId: 'bovine_123',
    type: 'HEAT_DETECTION',
    eventDate: new Date(),
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: function() { return this; }
  }),
  findAll: async (options?: any): Promise<any[]> => [],
  findAndCountAll: async (options?: any): Promise<{ rows: any[]; count: number }> => ({
    rows: [],
    count: 0
  }),
  findOne: async (options?: any): Promise<any | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1]
};

const Bovine = {
  findByPk: async (id: string, options?: any): Promise<any | null> => ({
    id,
    earTag: `COW${id.padStart(3, '0')}`,
    name: `Bovine_${id}`,
    breed: 'Holstein',
    birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000), // 3 años
    reproductiveStatus: 'OPEN',
    lastCalvingDate: null,
    totalCalves: 0,
    daysPostPartum: 0
  }),
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 150,
  create: async (data: any, options?: any): Promise<any> => ({
    ...data,
    id: `bovine_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

const Location = {
  findAll: async (options?: any): Promise<any[]> => []
};

const Event = {
  create: async (data: any, options?: any): Promise<any> => ({
    ...data,
    id: `event_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

const Finance = {
  create: async (data: any, options?: any): Promise<any> => ({
    ...data,
    id: `finance_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

const sequelize = {
  transaction: async (): Promise<Transaction> => ({
    commit: async () => {},
    rollback: async () => {}
  } as Transaction),
  literal: (value: string) => ({ literal: value })
};

// Mocks para servicios
class LocationService {
  async getCurrentLocation(): Promise<LocationData> {
    return {
      latitude: 19.4326,
      longitude: -99.1332,
      accuracy: 10
    };
  }
}

class NotificationService {
  async createNotification(notification: {
    userId: string;
    title: string;
    message: string;
    type: string;
    relatedId: string;
    relatedType: string;
  }): Promise<void> {
    console.log(`📢 Notificación: ${notification.title}`);
  }

  async scheduleNotification(notification: any, scheduledDate: Date): Promise<void> {
    console.log(`⏰ Notificación programada para: ${scheduledDate.toISOString()}`);
  }
}

class EventService {
  async createEvent(eventData: any): Promise<void> {
    console.log(`📝 Evento creado: ${eventData.type}`);
  }
}

export class ReproductionService {
  private locationService: LocationService;
  private notificationService: NotificationService;
  private eventService: EventService;

  // Constantes reproductivas para bovinos
  private readonly GESTATION_PERIOD_DAYS = 283; // Promedio días de gestación
  private readonly ESTRUS_CYCLE_DAYS = 21; // Ciclo estral promedio
  private readonly POST_PARTUM_INTERVAL = 60; // Días mínimos post-parto para nueva concepción
  private readonly PREGNANCY_CHECK_DAYS = [30, 60, 120, 180, 240]; // Días para chequeos de embarazo

  constructor() {
    this.locationService = new LocationService();
    this.notificationService = new NotificationService();
    this.eventService = new EventService();
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES - CRUD DE REGISTROS REPRODUCTIVOS
  // ============================================================================

  /**
   * Crear nuevo registro reproductivo
   * @param reproductionData - Datos del registro reproductivo
   * @param userId - ID del usuario que crea el registro
   * @returns Promise<ReproductionRecord>
   */
  public async createReproductionRecord(
    reproductionData: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ReproductionRecord> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      // Validar datos reproductivos
      await this.validateReproductionData(reproductionData, transaction);

      // Verificar que el bovino existe y es reproductivamente activo
      const bovine = await Bovine.findByPk(reproductionData.bovineId, { transaction });
      if (!bovine) {
        throw new ValidationError('El bovino especificado no existe');
      }

      await this.validateBovineReproductiveStatus(bovine, reproductionData.type);

      // Obtener ubicación actual si no se proporciona
      let location = reproductionData.location;
      if (!location?.latitude || !location?.longitude) {
        location = await this.locationService.getCurrentLocation();
      }

      // Calcular fechas automáticas según el tipo de evento
      const calculatedDates = await this.calculateReproductiveDates(
        reproductionData.type,
        reproductionData.eventDate,
        bovine
      );

      // Crear registro reproductivo
      const reproductionRecord = await Reproduction.create({
        ...reproductionData,
        location,
        calculatedDates,
        recordedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });

      // Crear evento asociado
      await this.createReproductiveEvent(reproductionRecord, transaction);

      // Actualizar estado reproductivo del bovino
      await this.updateBovineReproductiveStatus(
        reproductionData.bovineId, 
        reproductionData.type,
        reproductionRecord.id,
        transaction
      );

      // Programar alertas y recordatorios
      await this.scheduleReproductiveAlerts(reproductionRecord, transaction);

      // Crear transacciones financieras si aplica
      await this.createFinancialRecords(reproductionRecord, transaction);

      await transaction.commit();

      logger.info('✅ Registro reproductivo creado exitosamente', {
        reproductionId: reproductionRecord.id,
        bovineId: reproductionData.bovineId,
        type: reproductionData.type,
        userId
      });

      return this.formatReproductionRecord(reproductionRecord);

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error creando registro reproductivo', { error, reproductionData });
      throw error;
    }
  }

  /**
   * Obtener registros reproductivos por bovino
   * @param bovineId - ID del bovino
   * @param options - Opciones de filtrado
   * @returns Promise<{ records: ReproductionRecord[], metrics: ReproductionMetrics }>
   */
  public async getReproductionByBovine(
    bovineId: string,
    options: {
      type?: ReproductionType;
      startDate?: Date;
      endDate?: Date;
      includeMetrics?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ records: ReproductionRecord[], total: number, metrics?: ReproductionMetrics }> {
    try {
      // Construir filtros
      const whereClause: any = { bovineId };
      
      if (options.type) {
        whereClause.type = options.type;
      }
      
      if (options.startDate || options.endDate) {
        whereClause.eventDate = {};
        if (options.startDate) {
          whereClause.eventDate[Op.gte] = options.startDate;
        }
        if (options.endDate) {
          whereClause.eventDate[Op.lte] = options.endDate;
        }
      }

      // Obtener registros
      const { rows: reproductions, count: total } = await Reproduction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            attributes: ['id', 'earTag', 'name', 'breed', 'birthDate']
          }
        ],
        order: [['eventDate', 'DESC']],
        limit: options.limit || 50,
        offset: options.offset || 0
      });

      const records = reproductions.map(repro => this.formatReproductionRecord(repro));

      // Calcular métricas si se solicitan
      let metrics;
      if (options.includeMetrics && records.length > 0) {
        metrics = await this.calculateReproductionMetrics(bovineId, options);
      }

      return { records, total, metrics };

    } catch (error) {
      logger.error('❌ Error obteniendo registros reproductivos', { error, bovineId });
      throw new ApiError('Error obteniendo registros reproductivos', 500);
    }
  }

  // ============================================================================
  // MÉTODOS ESPECÍFICOS POR TIPO DE EVENTO REPRODUCTIVO
  // ============================================================================

  /**
   * Registrar detección de celo
   * @param heatData - Datos del celo
   * @param userId - ID del usuario
   * @returns Promise<HeatRecord>
   */
  public async recordHeat(
    heatData: Omit<HeatRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<HeatRecord> {
    try {
      // Validaciones específicas para celo
      await this.validateHeatRecord(heatData);

      // Predecir próximo celo
      const nextHeatDate = this.calculateNextHeatDate(heatData.detectedDate);

      const reproductionData: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: heatData.bovineId,
        type: 'HEAT_DETECTION',
        eventDate: heatData.detectedDate,
        location: heatData.location,
        notes: heatData.notes,
        metadata: {
          intensity: heatData.intensity,
          duration: heatData.duration,
          symptoms: heatData.symptoms,
          detectionMethod: heatData.detectionMethod,
          nextPredictedHeat: nextHeatDate,
          optimal_breeding_window: {
            start: new Date(heatData.detectedDate.getTime() + 12 * 60 * 60 * 1000), // 12 horas después
            end: new Date(heatData.detectedDate.getTime() + 18 * 60 * 60 * 1000) // 18 horas después
          }
        }
      };

      const record = await this.createReproductionRecord(reproductionData, userId);
      
      // Programar notificación para ventana óptima de reproducción
      await this.scheduleBreedingWindowAlert(record);

      return {
        id: record.id,
        bovineId: record.bovineId,
        detectedDate: record.eventDate,
        intensity: record.metadata?.intensity || 'MEDIUM',
        duration: record.metadata?.duration,
        symptoms: record.metadata?.symptoms || [],
        detectionMethod: record.metadata?.detectionMethod || 'VISUAL',
        nextPredictedHeat: record.metadata?.nextPredictedHeat,
        optimalBreedingWindow: record.metadata?.optimal_breeding_window,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      logger.error('❌ Error registrando celo', { error, heatData });
      throw error;
    }
  }

  /**
   * Registrar inseminación
   * @param inseminationData - Datos de inseminación
   * @param userId - ID del usuario
   * @returns Promise<InseminationRecord>
   */
  public async recordInsemination(
    inseminationData: Omit<InseminationRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<InseminationRecord> {
    try {
      // Validaciones específicas para inseminación
      await this.validateInseminationRecord(inseminationData);

      // Calcular fecha esperada de diagnóstico de preñez
      const pregnancyCheckDate = new Date(inseminationData.serviceDate);
      pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + 30); // 30 días después

      // Calcular fecha esperada de parto
      const expectedCalvingDate = new Date(inseminationData.serviceDate);
      expectedCalvingDate.setDate(expectedCalvingDate.getDate() + this.GESTATION_PERIOD_DAYS);

      const reproductionData: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: inseminationData.bovineId,
        type: 'ARTIFICIAL_INSEMINATION',
        eventDate: inseminationData.serviceDate,
        location: inseminationData.location,
        notes: inseminationData.notes,
        metadata: {
          bullId: inseminationData.bullId,
          bullName: inseminationData.bullName,
          semenBatch: inseminationData.semenBatch,
          semenQuality: inseminationData.semenQuality,
          technicianId: inseminationData.technicianId,
          technicianName: inseminationData.technicianName,
          method: inseminationData.method,
          cervixQuality: inseminationData.cervixQuality,
          timeFromHeat: inseminationData.timeFromHeat,
          expectedPregnancyCheck: pregnancyCheckDate,
          expectedCalvingDate: expectedCalvingDate,
          cost: inseminationData.cost
        }
      };

      const record = await this.createReproductionRecord(reproductionData, userId);
      
      // Programar recordatorio para chequeo de preñez
      await this.schedulePregnancyCheckReminder(record, pregnancyCheckDate);

      return {
        id: record.id,
        bovineId: record.bovineId,
        serviceDate: record.eventDate,
        bullId: record.metadata?.bullId,
        bullName: record.metadata?.bullName,
        semenBatch: record.metadata?.semenBatch,
        semenQuality: record.metadata?.semenQuality,
        technicianId: record.metadata?.technicianId,
        technicianName: record.metadata?.technicianName,
        method: record.metadata?.method || 'ARTIFICIAL',
        cervixQuality: record.metadata?.cervixQuality,
        timeFromHeat: record.metadata?.timeFromHeat,
        expectedPregnancyCheck: record.metadata?.expectedPregnancyCheck,
        expectedCalvingDate: record.metadata?.expectedCalvingDate,
        cost: record.metadata?.cost,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      logger.error('❌ Error registrando inseminación', { error, inseminationData });
      throw error;
    }
  }

  /**
   * Confirmar embarazo
   * @param pregnancyData - Datos del embarazo
   * @param userId - ID del usuario
   * @returns Promise<PregnancyRecord>
   */
  public async confirmPregnancy(
    pregnancyData: Omit<PregnancyRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<PregnancyRecord> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Validar datos de embarazo
      await this.validatePregnancyRecord(pregnancyData);

      // Buscar la inseminación relacionada
      const relatedInsemination = await this.findRelatedInsemination(
        pregnancyData.bovineId,
        pregnancyData.checkDate,
        transaction
      );

      // Calcular fecha esperada de parto
      let expectedCalvingDate: Date;
      if (relatedInsemination) {
        expectedCalvingDate = new Date(relatedInsemination.eventDate);
        expectedCalvingDate.setDate(expectedCalvingDate.getDate() + this.GESTATION_PERIOD_DAYS);
      } else {
        // Si no hay inseminación relacionada, calcular desde la fecha de diagnóstico
        expectedCalvingDate = new Date(pregnancyData.checkDate);
        expectedCalvingDate.setDate(expectedCalvingDate.getDate() + (this.GESTATION_PERIOD_DAYS - 30));
      }

      const reproductionData: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: pregnancyData.bovineId,
        type: 'PREGNANCY_CHECK',
        eventDate: pregnancyData.checkDate,
        location: pregnancyData.location,
        notes: pregnancyData.notes,
        metadata: {
          status: pregnancyData.status,
          method: pregnancyData.method,
          gestationAge: pregnancyData.gestationAge,
          veterinarianId: pregnancyData.veterinarianId,
          veterinarianName: pregnancyData.veterinarianName,
          expectedCalvingDate: expectedCalvingDate,
          relatedInseminationId: relatedInsemination?.id,
          nextCheckDate: this.calculateNextPregnancyCheck(pregnancyData.checkDate, pregnancyData.gestationAge),
          fetusViability: pregnancyData.fetusViability,
          complications: pregnancyData.complications
        }
      };

      const record = await this.createReproductionRecord(reproductionData, userId);

      // Actualizar estado del bovino
      if (pregnancyData.status === 'CONFIRMED') {
        await Bovine.update({
          reproductiveStatus: 'PREGNANT',
          lastPregnancyCheck: pregnancyData.checkDate,
          expectedCalvingDate: expectedCalvingDate
        }, { 
          where: { id: pregnancyData.bovineId },
          transaction 
        });

        // Programar recordatorios de chequeos adicionales
        await this.schedulePregnancyMonitoring(record, expectedCalvingDate, transaction);
      } else if (pregnancyData.status === 'NEGATIVE') {
        await Bovine.update({
          reproductiveStatus: 'OPEN',
          lastPregnancyCheck: pregnancyData.checkDate
        }, { 
          where: { id: pregnancyData.bovineId },
          transaction 
        });

        // Programar detección del próximo celo
        await this.scheduleNextHeatDetection(record, transaction);
      }

      await transaction.commit();

      return {
        id: record.id,
        bovineId: record.bovineId,
        checkDate: record.eventDate,
        status: record.metadata?.status || 'UNCERTAIN',
        method: record.metadata?.method || 'VISUAL',
        gestationAge: record.metadata?.gestationAge,
        veterinarianId: record.metadata?.veterinarianId,
        veterinarianName: record.metadata?.veterinarianName,
        expectedCalvingDate: record.metadata?.expectedCalvingDate,
        relatedInseminationId: record.metadata?.relatedInseminationId,
        nextCheckDate: record.metadata?.nextCheckDate,
        fetusViability: record.metadata?.fetusViability,
        complications: record.metadata?.complications,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error confirmando embarazo', { error, pregnancyData });
      throw error;
    }
  }

  /**
   * Registrar parto
   * @param birthData - Datos del parto
   * @param userId - ID del usuario
   * @returns Promise<BirthRecord>
   */
  public async recordBirth(
    birthData: Omit<BirthRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<BirthRecord> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Validar datos del parto
      await this.validateBirthRecord(birthData);

      const reproductionData: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: birthData.motherId,
        type: 'BIRTH',
        eventDate: birthData.birthDate,
        location: birthData.location,
        notes: birthData.notes,
        metadata: {
          calvingType: birthData.calvingType,
          difficulty: birthData.difficulty,
          assistance: birthData.assistance,
          veterinarianId: birthData.veterinarianId,
          duration: birthData.duration,
          complications: birthData.complications,
          placentaExpulsion: birthData.placentaExpulsion,
          calfDetails: {
            gender: birthData.calfGender,
            weight: birthData.calfWeight,
            health: birthData.calfHealth,
            vigor: birthData.calfVigor,
            earTag: birthData.calfEarTag
          }
        }
      };

      const record = await this.createReproductionRecord(reproductionData, userId);

      // Crear registro del ternero si se proporciona información
      if (birthData.calfEarTag) {
        await this.createCalfRecord(birthData, record.id, transaction);
      }

      // Actualizar estado reproductivo de la madre
      await Bovine.update({
        reproductiveStatus: 'LACTATING',
        lastCalvingDate: birthData.birthDate,
        totalCalves: sequelize.literal('total_calves + 1'),
        daysPostPartum: 0
      }, { 
        where: { id: birthData.motherId },
        transaction 
      });

      // Programar chequeo post-parto
      const postPartumCheckDate = new Date(birthData.birthDate);
      postPartumCheckDate.setDate(postPartumCheckDate.getDate() + 30);
      
      await this.schedulePostPartumCheck(record, postPartumCheckDate, transaction);

      await transaction.commit();

      return {
        id: record.id,
        motherId: record.bovineId,
        birthDate: record.eventDate,
        calvingType: record.metadata?.calvingType || 'NATURAL',
        difficulty: record.metadata?.difficulty || 'EASY',
        assistance: record.metadata?.assistance || false,
        veterinarianId: record.metadata?.veterinarianId,
        duration: record.metadata?.duration,
        complications: record.metadata?.complications,
        placentaExpulsion: record.metadata?.placentaExpulsion,
        calfGender: record.metadata?.calfDetails?.gender || 'MALE',
        calfWeight: record.metadata?.calfDetails?.weight,
        calfHealth: record.metadata?.calfDetails?.health || 'HEALTHY',
        calfVigor: record.metadata?.calfDetails?.vigor || 'STRONG',
        calfEarTag: record.metadata?.calfDetails?.earTag,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error registrando parto', { error, birthData });
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS DE ANÁLISIS Y MÉTRICAS
  // ============================================================================

  /**
   * Calcular métricas reproductivas para un bovino
   * @param bovineId - ID del bovino
   * @param options - Opciones de cálculo
   * @returns Promise<ReproductionMetrics>
   */
  public async calculateReproductionMetrics(
    bovineId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      includeFertility?: boolean;
    } = {}
  ): Promise<ReproductionMetrics> {
    try {
      const whereClause: any = { bovineId };

      if (options.startDate || options.endDate) {
        whereClause.eventDate = {};
        if (options.startDate) {
          whereClause.eventDate[Op.gte] = options.startDate;
        }
        if (options.endDate) {
          whereClause.eventDate[Op.lte] = options.endDate;
        }
      }

      const records = await Reproduction.findAll({
        where: whereClause,
        order: [['eventDate', 'ASC']]
      });

      const metrics: ReproductionMetrics = {
        bovineId,
        period: {
          startDate: options.startDate || (records[0]?.eventDate || new Date()),
          endDate: options.endDate || (records[records.length - 1]?.eventDate || new Date())
        },
        totalEvents: records.length,
        eventsByType: {},
        fertilityRate: 0,
        averageCalvingInterval: 0,
        averageGestation: 0,
        totalCalves: 0,
        lastEvent: records.length > 0 ? records[records.length - 1].eventDate : null
      };

      // Agrupar eventos por tipo
      const eventGroups = records.reduce((acc, record) => {
        if (!acc[record.type]) {
          acc[record.type] = [];
        }
        acc[record.type].push(record);
        return acc;
      }, {} as Record<string, any[]>);

      // Calcular métricas por tipo
      for (const [type, events] of Object.entries(eventGroups)) {
        const typedEvents = events as any[]; // Tipar explícitamente como any[]
        metrics.eventsByType[type] = {
          count: typedEvents.length,
          lastDate: typedEvents[typedEvents.length - 1].eventDate,
          frequency: this.calculateEventFrequency(typedEvents)
        };
      }

      // Calcular tasa de fertilidad
      const inseminations = eventGroups['ARTIFICIAL_INSEMINATION'] || [];
      const pregnancies = eventGroups['PREGNANCY_CHECK']?.filter((p: any) => 
        p.metadata?.status === 'CONFIRMED'
      ) || [];
      
      if (inseminations.length > 0) {
        metrics.fertilityRate = (pregnancies.length / inseminations.length) * 100;
      }

      // Calcular intervalo entre partos
      const births = eventGroups['BIRTH'] || [];
      if (births.length > 1) {
        const intervals = [];
        for (let i = 1; i < births.length; i++) {
          const interval = births[i].eventDate.getTime() - births[i-1].eventDate.getTime();
          intervals.push(interval / (24 * 60 * 60 * 1000)); // Convertir a días
        }
        metrics.averageCalvingInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      }

      metrics.totalCalves = births.length;

      // Análisis de fertilidad adicional si se solicita
      if (options.includeFertility) {
        metrics.fertilityAnalysis = await this.analyzeFertility(bovineId, records);
      }

      return metrics;

    } catch (error) {
      logger.error('❌ Error calculando métricas reproductivas', { error, bovineId });
      throw new ApiError('Error calculando métricas reproductivas', 500);
    }
  }

  /**
   * Obtener reporte de eficiencia reproductiva del hato
   * @param options - Opciones de filtrado
   * @returns Promise<any>
   */
  public async getHerdReproductionReport(options: {
    ranchId?: string;
    startDate?: Date;
    endDate?: Date;
    includeIndividual?: boolean;
  } = {}): Promise<any> {
    try {
      const whereClause: any = {};
      
      if (options.startDate || options.endDate) {
        whereClause.eventDate = {};
        if (options.startDate) {
          whereClause.eventDate[Op.gte] = options.startDate;
        }
        if (options.endDate) {
          whereClause.eventDate[Op.lte] = options.endDate;
        }
      }

      // Incluir filtro por rancho si se especifica
      const bovineFilter: any = {};
      if (options.ranchId) {
        bovineFilter.ranchId = options.ranchId;
      }

      const reproductionData = await Reproduction.findAll({
        where: whereClause,
        include: [{
          model: Bovine,
          where: bovineFilter,
          attributes: ['id', 'earTag', 'name', 'breed', 'birthDate']
        }],
        order: [['eventDate', 'ASC']]
      });

      // Calcular métricas agregadas
      const herdMetrics = {
        totalAnimals: new Set(reproductionData.map(r => r.bovineId)).size,
        totalEvents: reproductionData.length,
        eventsByType: {},
        overallFertilityRate: 0,
        averageCalvingInterval: 0,
        birthsThisPeriod: 0,
        pregnantCows: 0,
        openCows: 0
      };

      // Procesar datos por tipo de evento
      const eventsByType = reproductionData.reduce((acc, record) => {
        if (!acc[record.type]) {
          acc[record.type] = [];
        }
        acc[record.type].push(record);
        return acc;
      }, {} as Record<string, any[]>);

      // Calcular métricas específicas
      const inseminations = eventsByType['ARTIFICIAL_INSEMINATION'] || [];
      const confirmedPregnancies = (eventsByType['PREGNANCY_CHECK'] || [])
        .filter((p: any) => p.metadata?.status === 'CONFIRMED');
      const births = eventsByType['BIRTH'] || [];

      herdMetrics.overallFertilityRate = inseminations.length > 0 ? 
        (confirmedPregnancies.length / inseminations.length) * 100 : 0;
      herdMetrics.birthsThisPeriod = births.length;

      // Métricas individuales si se solicitan
      let individualMetrics = null;
      if (options.includeIndividual) {
        const bovineIds = Array.from(new Set(reproductionData.map(r => r.bovineId)));
        individualMetrics = await Promise.all(
          bovineIds.map(id => this.calculateReproductionMetrics(id, options))
        );
      }

      return {
        herdMetrics,
        individualMetrics,
        period: {
          startDate: options.startDate,
          endDate: options.endDate
        },
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('❌ Error generando reporte reproductivo del hato', { error, options });
      throw new ApiError('Error generando reporte reproductivo', 500);
    }
  }

  // ============================================================================
  // MÉTODOS DE VALIDACIÓN Y SOPORTE
  // ============================================================================

  /**
   * Validar datos reproductivos generales
   * @param data - Datos a validar
   * @param transaction - Transacción activa
   * @returns Promise<void>
   */
  private async validateReproductionData(
    data: Omit<ReproductionRecord, 'id' | 'createdAt' | 'updatedAt'>,
    transaction: Transaction
  ): Promise<void> {
    if (!data.bovineId) {
      throw new ValidationError('El ID del bovino es requerido');
    }

    if (!data.type) {
      throw new ValidationError('El tipo de evento reproductivo es requerido');
    }

    if (!data.eventDate) {
      throw new ValidationError('La fecha del evento es requerida');
    }

    // Validar que la fecha no sea futura (excepto para programación)
    if (data.eventDate > new Date() && !data.type.includes('SCHEDULED')) {
      throw new ValidationError('La fecha del evento no puede ser futura');
    }

    // Validar duplicados en el mismo día para ciertos eventos
    const duplicateEvent = await Reproduction.findOne({
      where: {
        bovineId: data.bovineId,
        type: data.type,
        eventDate: {
          [Op.between]: [
            new Date(data.eventDate.getFullYear(), data.eventDate.getMonth(), data.eventDate.getDate(), 0, 0, 0),
            new Date(data.eventDate.getFullYear(), data.eventDate.getMonth(), data.eventDate.getDate(), 23, 59, 59)
          ]
        }
      },
      transaction
    });

    if (duplicateEvent && ['HEAT_DETECTION', 'ARTIFICIAL_INSEMINATION', 'BIRTH'].includes(data.type)) {
      throw new ValidationError(`Ya existe un evento de tipo ${data.type} para este bovino en la fecha especificada`);
    }
  }

  /**
   * Validar estado reproductivo del bovino
   * @param bovine - Datos del bovino
   * @param eventType - Tipo de evento
   * @returns Promise<void>
   */
  private async validateBovineReproductiveStatus(
    bovine: any,
    eventType: ReproductionType
  ): Promise<void> {
    // Validar edad mínima para reproducción
    if (bovine.birthDate) {
      const ageInMonths = Math.floor(
        (Date.now() - bovine.birthDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      
      if (ageInMonths < 15 && ['ARTIFICIAL_INSEMINATION', 'NATURAL_MATING'].includes(eventType)) {
        throw new ValidationError('El bovino es muy joven para reproducción (mínimo 15 meses)');
      }
    }

    // Validar estado reproductivo actual
    if (eventType === 'ARTIFICIAL_INSEMINATION' && bovine.reproductiveStatus === 'PREGNANT') {
      throw new ValidationError('No se puede inseminar un bovino preñado');
    }

    if (eventType === 'PREGNANCY_CHECK' && bovine.reproductiveStatus === 'OPEN') {
      // Advertencia pero no error - podría ser un chequeo de confirmación
      logger.warn('⚠️ Chequeo de preñez en bovino marcado como vacío', {
        bovineId: bovine.id,
        status: bovine.reproductiveStatus
      });
    }
  }

  /**
   * Calcular fechas reproductivas automáticas
   * @param eventType - Tipo de evento
   * @param eventDate - Fecha del evento
   * @param bovine - Datos del bovino
   * @returns Promise<object>
   */
  private async calculateReproductiveDates(
    eventType: ReproductionType,
    eventDate: Date,
    bovine: any
  ): Promise<object> {
    const calculatedDates: any = {};

    switch (eventType) {
      case 'HEAT_DETECTION':
        calculatedDates.nextHeatDate = this.calculateNextHeatDate(eventDate);
        calculatedDates.optimalBreedingStart = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000);
        calculatedDates.optimalBreedingEnd = new Date(eventDate.getTime() + 18 * 60 * 60 * 1000);
        break;

      case 'ARTIFICIAL_INSEMINATION':
        calculatedDates.pregnancyCheckDate = new Date(eventDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        calculatedDates.expectedCalvingDate = new Date(eventDate.getTime() + this.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        calculatedDates.dryOffDate = new Date(eventDate.getTime() + (this.GESTATION_PERIOD_DAYS - 60) * 24 * 60 * 60 * 1000);
        break;

      case 'PREGNANCY_CHECK':
        if (bovine.lastInseminationDate) {
          calculatedDates.conceptionDate = bovine.lastInseminationDate;
          calculatedDates.expectedCalvingDate = new Date(bovine.lastInseminationDate.getTime() + this.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        }
        break;

      case 'BIRTH':
        calculatedDates.breedingEligibleDate = new Date(eventDate.getTime() + this.POST_PARTUM_INTERVAL * 24 * 60 * 60 * 1000);
        calculatedDates.weaningDate = new Date(eventDate.getTime() + 210 * 24 * 60 * 60 * 1000); // ~7 meses
        break;
    }

    return calculatedDates;
  }

  /**
   * Calcular próxima fecha de celo
   * @param lastHeatDate - Fecha del último celo
   * @returns Date
   */
  private calculateNextHeatDate(lastHeatDate: Date): Date {
    const nextHeat = new Date(lastHeatDate);
    nextHeat.setDate(nextHeat.getDate() + this.ESTRUS_CYCLE_DAYS);
    return nextHeat;
  }

  /**
   * Formatear registro reproductivo para respuesta
   * @param record - Registro de base de datos
   * @returns ReproductionRecord
   */
  private formatReproductionRecord(record: any): ReproductionRecord {
    return {
      id: record.id,
      bovineId: record.bovineId,
      type: record.type,
      eventDate: record.eventDate,
      location: record.location,
      notes: record.notes,
      metadata: record.metadata || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  // ============================================================================
  // MÉTODOS DE SOPORTE IMPLEMENTADOS
  // ============================================================================

  private async validateHeatRecord(data: any): Promise<void> {
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(data.intensity)) {
      throw new ValidationError('Intensidad de celo inválida');
    }
  }

  private async validateInseminationRecord(data: any): Promise<void> {
    if (!data.bullId && !data.bullName) {
      throw new ValidationError('Información del toro es requerida');
    }
  }

  private async validatePregnancyRecord(data: any): Promise<void> {
    if (!['CONFIRMED', 'NEGATIVE', 'UNCERTAIN'].includes(data.status)) {
      throw new ValidationError('Estado de preñez inválido');
    }
  }

  private async validateBirthRecord(data: any): Promise<void> {
    if (!['NATURAL', 'ASSISTED', 'CESAREAN'].includes(data.calvingType)) {
      throw new ValidationError('Tipo de parto inválido');
    }
  }

  private async scheduleBreedingWindowAlert(record: any): Promise<void> {
    if (record.metadata?.optimal_breeding_window?.start) {
      await this.notificationService.scheduleNotification({
        userId: record.recordedBy,
        title: 'Ventana óptima de reproducción',
        message: `Ventana óptima para inseminar bovino ${record.bovineId}`,
        type: 'BREEDING_ALERT',
        relatedId: record.bovineId,
        relatedType: 'BOVINE'
      }, record.metadata.optimal_breeding_window.start);
    }
  }

  private async schedulePregnancyCheckReminder(record: any, checkDate: Date): Promise<void> {
    await this.notificationService.scheduleNotification({
      userId: record.recordedBy,
      title: 'Recordatorio: Chequeo de preñez',
      message: `Chequeo de preñez programado para bovino ${record.bovineId}`,
      type: 'PREGNANCY_CHECK',
      relatedId: record.bovineId,
      relatedType: 'BOVINE'
    }, checkDate);
  }

  private async findRelatedInsemination(bovineId: string, checkDate: Date, transaction: Transaction): Promise<any> {
    return await Reproduction.findOne({
      where: {
        bovineId,
        type: 'ARTIFICIAL_INSEMINATION',
        eventDate: {
          [Op.between]: [
            new Date(checkDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 días antes
            checkDate
          ]
        }
      },
      order: [['eventDate', 'DESC']],
      transaction
    });
  }

  private calculateNextPregnancyCheck(checkDate: Date, gestationAge?: number): Date {
    const nextCheck = new Date(checkDate);
    if (gestationAge && gestationAge < 60) {
      nextCheck.setDate(nextCheck.getDate() + 30); // Chequeo en 30 días
    } else {
      nextCheck.setDate(nextCheck.getDate() + 60); // Chequeo en 60 días
    }
    return nextCheck;
  }

  private async schedulePregnancyMonitoring(record: any, expectedCalvingDate: Date, transaction: Transaction): Promise<void> {
    // Programar chequeos durante la gestación
    const checks = [60, 120, 180, 240]; // Días después de confirmación
    
    for (const days of checks) {
      const checkDate = new Date(record.eventDate.getTime() + days * 24 * 60 * 60 * 1000);
      if (checkDate < expectedCalvingDate) {
        await this.notificationService.scheduleNotification({
          userId: record.recordedBy,
          title: 'Chequeo de gestación',
          message: `Chequeo programado de gestación para bovino ${record.bovineId}`,
          type: 'PREGNANCY_MONITORING',
          relatedId: record.bovineId,
          relatedType: 'BOVINE'
        }, checkDate);
      }
    }
  }

  private async scheduleNextHeatDetection(record: any, transaction: Transaction): Promise<void> {
    const nextHeatDate = this.calculateNextHeatDate(record.eventDate);
    await this.notificationService.scheduleNotification({
      userId: record.recordedBy,
      title: 'Vigilar próximo celo',
      message: `Próximo celo esperado para bovino ${record.bovineId}`,
      type: 'HEAT_DETECTION',
      relatedId: record.bovineId,
      relatedType: 'BOVINE'
    }, nextHeatDate);
  }

  private async createCalfRecord(birthData: any, recordId: string, transaction: Transaction): Promise<void> {
    // Crear registro del ternero en la tabla de bovinos
    await Bovine.create({
      earTag: birthData.calfEarTag,
      name: `Cría de ${birthData.motherId}`,
      type: 'CALF',
      breed: 'Unknown', // Se heredará de la madre
      gender: birthData.calfGender,
      birthDate: birthData.birthDate,
      birthWeight: birthData.calfWeight,
      motherId: birthData.motherId,
      healthStatus: birthData.calfHealth.toUpperCase(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });
  }

  private async schedulePostPartumCheck(record: any, checkDate: Date, transaction: Transaction): Promise<void> {
    await this.notificationService.scheduleNotification({
      userId: record.recordedBy,
      title: 'Chequeo post-parto',
      message: `Chequeo post-parto programado para bovino ${record.bovineId}`,
      type: 'POST_PARTUM_CHECK',
      relatedId: record.bovineId,
      relatedType: 'BOVINE'
    }, checkDate);
  }

  private calculateEventFrequency(events: any[]): number {
    if (events.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < events.length; i++) {
      const interval = events[i].eventDate.getTime() - events[i-1].eventDate.getTime();
      intervals.push(interval / (24 * 60 * 60 * 1000)); // Días
    }
    
    return intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  }

  private async analyzeFertility(bovineId: string, records: any[]): Promise<FertilityAnalysis> {
    const inseminations = records.filter((r: any) => r.type === 'ARTIFICIAL_INSEMINATION');
    const pregnancies = records.filter((r: any) => r.type === 'PREGNANCY_CHECK' && r.metadata?.status === 'CONFIRMED');
    const births = records.filter((r: any) => r.type === 'BIRTH');

    const conceptionRate = inseminations.length > 0 ? (pregnancies.length / inseminations.length) * 100 : 0;
    
    // Calcular intervalo entre partos
    let calvingInterval = 0;
    if (births.length > 1) {
      const intervals = [];
      for (let i = 1; i < births.length; i++) {
        const interval = (births[i].eventDate.getTime() - births[i-1].eventDate.getTime()) / (24 * 60 * 60 * 1000);
        intervals.push(interval);
      }
      calvingInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    }

    return {
      conception: {
        rate: conceptionRate,
        trend: conceptionRate > 75 ? 'IMPROVING' : conceptionRate > 50 ? 'STABLE' : 'DECLINING',
        factors: []
      },
      calving: {
        interval: calvingInterval,
        regularity: calvingInterval > 0 && calvingInterval < 400 ? 'REGULAR' : 'IRREGULAR',
        complications: []
      },
      breeding: {
        efficiency: conceptionRate,
        recommendations: [
          conceptionRate < 50 ? 'Evaluar nutrición y manejo reproductivo' : 'Mantener protocolo actual'
        ]
      }
    };
  }

  private async createReproductiveEvent(record: any, transaction: Transaction): Promise<void> {
    await Event.create({
      type: 'REPRODUCTIVE_EVENT',
      title: `Evento reproductivo: ${record.type}`,
      description: `${record.type} registrado para bovino ${record.bovineId}`,
      bovineId: record.bovineId,
      scheduledDate: record.eventDate,
      status: 'COMPLETED',
      createdBy: record.recordedBy,
      metadata: record.metadata
    }, { transaction });
  }

  private async updateBovineReproductiveStatus(
    bovineId: string, 
    type: string, 
    recordId: string, 
    transaction: Transaction
  ): Promise<void> {
    const updateData: any = { lastReproductiveEvent: new Date() };

    switch (type) {
      case 'HEAT_DETECTION':
        updateData.lastHeatDate = new Date();
        break;
      case 'ARTIFICIAL_INSEMINATION':
        updateData.lastInseminationDate = new Date();
        updateData.reproductiveStatus = 'BRED';
        break;
      case 'PREGNANCY_CHECK':
        updateData.lastPregnancyCheck = new Date();
        break;
    }

    await Bovine.update(updateData, {
      where: { id: bovineId },
      transaction
    });
  }

  private async scheduleReproductiveAlerts(record: any, transaction: Transaction): Promise<void> {
    // Implementación simplificada - programar alertas según el tipo de evento
    console.log(`📅 Programando alertas para evento ${record.type} - ${record.id}`);
  }

  private async createFinancialRecords(record: any, transaction: Transaction): Promise<void> {
    // Crear registros financieros si hay costos asociados
    if (record.metadata?.cost && record.metadata.cost > 0) {
      await Finance.create({
        type: 'EXPENSE',
        category: 'REPRODUCTIVE',
        subcategory: record.type,
        amount: record.metadata.cost,
        date: record.eventDate,
        bovineId: record.bovineId,
        description: `Costo de ${record.type}`,
        recordedBy: record.recordedBy
      }, { transaction });
    }
  }
}

// Exportar instancia única del servicio
export const reproductionService = new ReproductionService();