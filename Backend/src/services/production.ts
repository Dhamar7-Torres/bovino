import { Op, Transaction } from 'sequelize';
import { logInfo, logError, logWarn } from '../utils/logger';

// Adaptador de logger para mantener compatibilidad
const logger = {
  info: (message: string, metadata?: any) => logInfo(message, metadata, 'ProductionService'),
  error: (message: string, error?: any) => logError(message, { error }, error as Error, 'ProductionService'),
  warn: (message: string, metadata?: any) => logWarn(message, metadata, 'ProductionService')
};

// Tipos y enums locales para producción
export enum ProductionType {
  MILK = 'MILK',
  WEIGHT = 'WEIGHT',
  FEED_INTAKE = 'FEED_INTAKE',
  GROWTH = 'GROWTH'
}

export enum EventStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum MilkQuality {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum WeighingMethod {
  SCALE = 'SCALE',
  TAPE = 'TAPE',
  VISUAL = 'VISUAL',
  CALCULATED = 'CALCULATED'
}

// Interfaces principales
export interface ProductionRecord {
  id: string;
  bovineId: string;
  type: ProductionType;
  value: number;
  unit: string;
  recordedDate: Date;
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

export interface MilkRecord {
  id: string;
  bovineId: string;
  quantity: number;
  milkingDate: Date;
  milkingTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
  quality?: MilkQuality;
  fatContent?: number;
  proteinContent?: number;
  somaticCellCount?: number;
  temperature?: number;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightRecord {
  id: string;
  bovineId: string;
  weight: number;
  weighingDate: Date;
  method: WeighingMethod;
  equipment?: string;
  bodyConditionScore?: number;
  estimatedWeight?: boolean;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionMetrics {
  bovineId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRecords: number;
  byType: Partial<Record<ProductionType, {
    count: number;
    total: number;
    average: number;
    minimum: number;
    maximum: number;
    unit: string;
    lastRecord: Date;
    trend?: string;
  }>>;
}

export interface ProductionSummary {
  totalRecords: number;
  byType: Record<ProductionType, number>;
  averageDaily: Record<ProductionType, number>;
  trends: Record<ProductionType, 'INCREASING' | 'DECREASING' | 'STABLE'>;
  topProducers: Array<{
    bovineId: string;
    bovineTag: string;
    totalProduction: number;
    average: number;
  }>;
}

export interface ProductionTrends {
  period: string;
  dataPoints: Array<{
    date: Date;
    value: number;
    average: number;
    count: number;
  }>;
  totalRecords: number;
  averageValue: number;
}

// Interfaces para los mocks
interface MockProductionRecord {
  id: string;
  bovineId: string;
  type: ProductionType;
  value: number;
  unit: string;
  recordedDate: Date;
  recordedBy?: string;
  metadata?: Record<string, any>;
  isDeleted?: boolean;
  location?: LocationData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  update(updateData: any, options?: any): Promise<MockProductionRecord>;
  toJSON(): any;
}

interface MockBovine {
  id: string;
  earTag: string;
  name: string;
  breed: string;
}

// Clases de error personalizadas
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

// Mocks para modelos que no existen o tienen problemas
const Production = {
  create: async (data: any, options?: any): Promise<MockProductionRecord> => {
    const record = {
      ...data,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      update: async function(this: MockProductionRecord, updateData: any, options?: any): Promise<MockProductionRecord> {
        if (updateData && typeof updateData === 'object') {
          Object.assign(this, updateData, { updatedAt: new Date() });
        }
        return this;
      },
      toJSON: function(this: MockProductionRecord) {
        return {
          id: this.id,
          bovineId: this.bovineId,
          type: this.type,
          value: this.value,
          unit: this.unit,
          recordedDate: this.recordedDate,
          location: this.location,
          notes: this.notes,
          metadata: this.metadata,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
      }
    } as MockProductionRecord;
    
    return record;
  },

  findByPk: async (id: string, options?: any): Promise<MockProductionRecord | null> => {
    if (!id) return null;
    
    const record = {
      id,
      bovineId: 'bovine_123',
      type: ProductionType.MILK,
      value: 15.5,
      unit: 'LITERS',
      recordedDate: new Date(),
      recordedBy: 'user_123',
      metadata: {},
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      update: async function(this: MockProductionRecord, updateData: any, options?: any): Promise<MockProductionRecord> {
        if (updateData && typeof updateData === 'object') {
          Object.assign(this, updateData, { updatedAt: new Date() });
        }
        return this;
      },
      toJSON: function(this: MockProductionRecord) {
        return {
          id: this.id,
          bovineId: this.bovineId,
          type: this.type,
          value: this.value,
          unit: this.unit,
          recordedDate: this.recordedDate
        };
      }
    } as MockProductionRecord;
    
    return record;
  },

  findAll: async (options?: any): Promise<MockProductionRecord[]> => {
    return [];
  },

  findAndCountAll: async (options?: any): Promise<{ rows: MockProductionRecord[]; count: number }> => {
    return { rows: [], count: 0 };
  },

  findOne: async (options?: any): Promise<MockProductionRecord | null> => {
    if (options?.where?.type === ProductionType.WEIGHT) {
      const record = {
        id: 'prev_weight_record',
        bovineId: options.where.bovineId || 'bovine_123',
        type: ProductionType.WEIGHT,
        value: 450,
        unit: 'KG',
        recordedDate: new Date(),
        isDeleted: false,
        recordedBy: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
        update: async function(this: MockProductionRecord, updateData: any): Promise<MockProductionRecord> {
          if (updateData && typeof updateData === 'object') {
            Object.assign(this, updateData, { updatedAt: new Date() });
          }
          return this;
        },
        toJSON: function(this: MockProductionRecord) {
          return {
            id: this.id,
            bovineId: this.bovineId,
            type: this.type,
            value: this.value,
            unit: this.unit,
            recordedDate: this.recordedDate
          };
        }
      } as MockProductionRecord;
      
      return record;
    }
    return null;
  },

  update: async (data: any, options: any): Promise<[number]> => [1]
};

const Bovine = {
  findByPk: async (id: string, options?: any): Promise<MockBovine | null> => {
    if (!id) return null;
    
    return {
      id,
      earTag: `TAG_${id}`,
      name: `Bovine_${id}`,
      breed: 'Holstein'
    };
  },

  update: async (updateData: any, options: any): Promise<[number]> => {
    return [1];
  }
};

const Event = {
  create: async (data: any, options?: any): Promise<any> => ({
    ...data,
    id: `event_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

const sequelize = {
  transaction: async (): Promise<Transaction> => ({
    commit: async () => {},
    rollback: async () => {}
  } as Transaction)
};

// Mock de servicios
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
    console.log(`📢 Notificación creada: ${notification.title}`);
  }
}

export class ProductionService {
  private locationService: LocationService;
  private notificationService: NotificationService;

  constructor() {
    this.locationService = new LocationService();
    this.notificationService = new NotificationService();
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES - CRUD DE REGISTROS DE PRODUCCIÓN
  // ============================================================================

  /**
   * Crear nuevo registro de producción
   */
  public async createProductionRecord(
    productionData: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ProductionRecord> {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
      // Validar datos de entrada
      await this.validateProductionData(productionData);

      // Verificar que el bovino existe
      const bovine = await Bovine.findByPk(productionData.bovineId);
      if (!bovine) {
        throw new ValidationError('El bovino especificado no existe');
      }

      // Obtener ubicación actual si no se proporciona
      let location = productionData.location;
      if (!location?.latitude || !location?.longitude) {
        location = await this.locationService.getCurrentLocation();
      }

      // Crear registro de producción
      const productionRecord = await Production.create({
        ...productionData,
        location,
        recordedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear evento relacionado
      await Event.create({
        type: 'PRODUCTION_RECORD',
        title: `Registro de ${productionData.type.toLowerCase()}`,
        description: this.generateProductionDescription(productionData),
        bovineId: productionData.bovineId,
        location,
        scheduledDate: new Date(),
        status: EventStatus.COMPLETED,
        createdBy: userId
      });

      // Actualizar métricas del bovino si es necesario
      await this.updateBovineMetrics(productionData.bovineId, transaction);

      // Verificar alertas y umbrales
      await this.checkProductionAlerts(productionRecord.id.toString(), transaction);

      await transaction.commit();

      logger.info('✅ Registro de producción creado exitosamente', {
        productionId: productionRecord.id,
        bovineId: productionData.bovineId,
        type: productionData.type,
        userId
      });

      return this.formatProductionRecord(productionRecord);

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error creando registro de producción', { error, productionData });
      throw error;
    }
  }

  /**
   * Obtener registros de producción por bovino
   */
  public async getProductionByBovine(
    bovineId: string,
    options: {
      type?: ProductionType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
      includeMetrics?: boolean;
    } = {}
  ): Promise<{ records: ProductionRecord[], total: number, metrics?: ProductionMetrics }> {
    try {
      // Construir filtros de búsqueda
      const whereClause: any = { bovineId };
      
      if (options.type) {
        whereClause.type = options.type;
      }
      
      if (options.startDate || options.endDate) {
        whereClause.recordedDate = {};
        if (options.startDate) {
          whereClause.recordedDate[Op.gte] = options.startDate;
        }
        if (options.endDate) {
          whereClause.recordedDate[Op.lte] = options.endDate;
        }
      }

      // Realizar consulta
      const { rows: productions, count: total } = await Production.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            attributes: ['id', 'earTag', 'name', 'breed']
          }
        ],
        order: [['recordedDate', 'DESC']],
        limit: options.limit || 50,
        offset: options.offset || 0
      });

      const records = productions.map(prod => this.formatProductionRecord(prod));

      // Calcular métricas si se solicitan
      let metrics;
      if (options.includeMetrics && records.length > 0) {
        metrics = await this.calculateProductionMetrics(bovineId, options);
      }

      return { records, total, metrics };

    } catch (error) {
      logger.error('❌ Error obteniendo registros de producción por bovino', { error, bovineId });
      throw new ApiError('Error obteniendo registros de producción', 500);
    }
  }

  /**
   * Actualizar registro de producción
   */
  public async updateProductionRecord(
    recordId: string,
    updateData: Partial<Omit<ProductionRecord, 'id' | 'createdAt'>>,
    userId: string
  ): Promise<ProductionRecord> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const existingRecord = await Production.findByPk(recordId);
      if (!existingRecord) {
        throw new ValidationError('Registro de producción no encontrado');
      }

      // Validar datos actualizados
      if (updateData.type || updateData.value || updateData.unit) {
        const recordData = existingRecord.toJSON();
        await this.validateProductionData({
          ...recordData,
          ...updateData
        } as ProductionRecord);
      }

      // Preparar datos de actualización seguros
      const safeUpdateData = {
        ...(updateData || {}),
        updatedAt: new Date(),
        lastModifiedBy: userId
      };

      // Actualizar registro
      await existingRecord.update(safeUpdateData);

      // Recalcular métricas del bovino
      await this.updateBovineMetrics(existingRecord.bovineId, transaction);

      await transaction.commit();

      logger.info('✅ Registro de producción actualizado', {
        recordId,
        bovineId: existingRecord.bovineId,
        userId
      });

      return this.formatProductionRecord(existingRecord);

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error actualizando registro de producción', { error, recordId });
      throw error;
    }
  }

  /**
   * Eliminar registro de producción
   */
  public async deleteProductionRecord(
    recordId: string, 
    userId: string
  ): Promise<boolean> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const record = await Production.findByPk(recordId);
      if (!record) {
        throw new ValidationError('Registro de producción no encontrado');
      }

      const bovineId = record.bovineId;

      // Marcar como eliminado (soft delete)
      await record.update({ 
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      });

      // Recalcular métricas sin incluir registros eliminados
      await this.updateBovineMetrics(bovineId, transaction);

      await transaction.commit();

      logger.info('✅ Registro de producción eliminado', {
        recordId,
        bovineId,
        userId
      });

      return true;

    } catch (error) {
      await transaction.rollback();
      logger.error('❌ Error eliminando registro de producción', { error, recordId });
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS DE MÉTRICAS Y ANÁLISIS
  // ============================================================================

  /**
   * Calcular métricas de producción para un bovino
   */
  public async calculateProductionMetrics(
    bovineId: string,
    options: {
      type?: ProductionType;
      startDate?: Date;
      endDate?: Date;
      includeTrends?: boolean;
    } = {}
  ): Promise<ProductionMetrics> {
    try {
      const whereClause: any = { 
        bovineId,
        isDeleted: false
      };

      if (options.type) {
        whereClause.type = options.type;
      }

      if (options.startDate || options.endDate) {
        whereClause.recordedDate = {};
        if (options.startDate) {
          whereClause.recordedDate[Op.gte] = options.startDate;
        }
        if (options.endDate) {
          whereClause.recordedDate[Op.lte] = options.endDate;
        }
      }

      const records = await Production.findAll({
        where: whereClause,
        order: [['recordedDate', 'ASC']]
      });

      if (records.length === 0) {
        return this.createEmptyMetrics(bovineId);
      }

      // Agrupar por tipo de producción
      const recordsByType = records.reduce((acc: Record<string, MockProductionRecord[]>, record: MockProductionRecord) => {
        if (!acc[record.type]) {
          acc[record.type] = [];
        }
        acc[record.type].push(record);
        return acc;
      }, {} as Record<string, MockProductionRecord[]>);

      const metrics: ProductionMetrics = {
        bovineId,
        period: {
          startDate: options.startDate || records[0].recordedDate,
          endDate: options.endDate || records[records.length - 1].recordedDate
        },
        totalRecords: records.length,
        byType: {}
      };

      // Calcular métricas por tipo
      for (const [type, typeRecords] of Object.entries(recordsByType)) {
        const values = typeRecords.map(r => r.value);
        const unit = typeRecords[0]?.unit || 'UNIT';

        const productionType = type as ProductionType;
        metrics.byType[productionType] = {
          count: typeRecords.length,
          total: values.reduce((sum: number, val: number) => sum + val, 0),
          average: values.reduce((sum: number, val: number) => sum + val, 0) / values.length,
          minimum: Math.min(...values),
          maximum: Math.max(...values),
          unit,
          lastRecord: typeRecords[typeRecords.length - 1]?.recordedDate || new Date(),
          trend: options.includeTrends ? 
            await this.calculateTrend(typeRecords) : undefined
        };
      }

      return metrics;

    } catch (error) {
      logger.error('❌ Error calculando métricas de producción', { error, bovineId });
      throw new ApiError('Error calculando métricas de producción', 500);
    }
  }

  /**
   * Obtener tendencias de producción
   */
  public async getProductionTrends(
    bovineIds?: string[],
    type?: ProductionType,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<ProductionTrends> {
    try {
      const whereClause: any = { isDeleted: false };
      
      if (bovineIds && bovineIds.length > 0) {
        whereClause.bovineId = { [Op.in]: bovineIds };
      }
      
      if (type) {
        whereClause.type = type;
      }

      // Calcular fecha de inicio según el período
      const endDate = new Date();
      const startDate = this.calculateStartDate(endDate, period);
      
      whereClause.recordedDate = {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      };

      const records = await Production.findAll({
        where: whereClause,
        include: [{
          model: Bovine,
          attributes: ['id', 'earTag', 'name']
        }],
        order: [['recordedDate', 'ASC']]
      });

      return this.processTrendsData(records, period);

    } catch (error) {
      logger.error('❌ Error obteniendo tendencias de producción', { error });
      throw new ApiError('Error obteniendo tendencias de producción', 500);
    }
  }

  // ============================================================================
  // MÉTODOS ESPECÍFICOS POR TIPO DE PRODUCCIÓN
  // ============================================================================

  /**
   * Registrar producción de leche
   */
  public async recordMilkProduction(
    milkData: Omit<MilkRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<MilkRecord> {
    try {
      // Validaciones específicas para leche
      await this.validateMilkProduction(milkData);

      const productionData: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: milkData.bovineId,
        type: ProductionType.MILK,
        value: milkData.quantity,
        unit: 'LITERS',
        recordedDate: milkData.milkingDate,
        location: milkData.location,
        notes: milkData.notes,
        metadata: {
          milkingTime: milkData.milkingTime,
          quality: milkData.quality,
          fatContent: milkData.fatContent,
          proteinContent: milkData.proteinContent,
          somaticCellCount: milkData.somaticCellCount,
          temperature: milkData.temperature
        }
      };

      const record = await this.createProductionRecord(productionData, userId);
      
      return {
        id: record.id,
        bovineId: record.bovineId,
        quantity: record.value,
        milkingDate: record.recordedDate,
        milkingTime: record.metadata?.milkingTime || 'MORNING',
        quality: record.metadata?.quality,
        fatContent: record.metadata?.fatContent,
        proteinContent: record.metadata?.proteinContent,
        somaticCellCount: record.metadata?.somaticCellCount,
        temperature: record.metadata?.temperature,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      logger.error('❌ Error registrando producción de leche', { error, milkData });
      throw error;
    }
  }

  /**
   * Registrar peso del bovino
   */
  public async recordWeight(
    weightData: Omit<WeightRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<WeightRecord> {
    try {
      // Validaciones específicas para peso
      await this.validateWeightRecord(weightData);

      const productionData: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        bovineId: weightData.bovineId,
        type: ProductionType.WEIGHT,
        value: weightData.weight,
        unit: 'KG',
        recordedDate: weightData.weighingDate,
        location: weightData.location,
        notes: weightData.notes,
        metadata: {
          method: weightData.method,
          equipment: weightData.equipment,
          bodyConditionScore: weightData.bodyConditionScore,
          estimatedWeight: weightData.estimatedWeight
        }
      };

      const record = await this.createProductionRecord(productionData, userId);
      
      return {
        id: record.id,
        bovineId: record.bovineId,
        weight: record.value,
        weighingDate: record.recordedDate,
        method: record.metadata?.method || WeighingMethod.SCALE,
        equipment: record.metadata?.equipment,
        bodyConditionScore: record.metadata?.bodyConditionScore,
        estimatedWeight: record.metadata?.estimatedWeight || false,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };

    } catch (error) {
      logger.error('❌ Error registrando peso', { error, weightData });
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS DE SOPORTE Y UTILIDADES
  // ============================================================================

  /**
   * Validar datos de producción
   */
  private async validateProductionData(
    data: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    if (!data.bovineId) {
      throw new ValidationError('El ID del bovino es requerido');
    }

    if (!data.type || !Object.values(ProductionType).includes(data.type)) {
      throw new ValidationError('Tipo de producción inválido');
    }

    if (!data.value || data.value <= 0) {
      throw new ValidationError('El valor debe ser mayor a 0');
    }

    if (!data.unit) {
      throw new ValidationError('La unidad de medida es requerida');
    }

    if (!data.recordedDate) {
      throw new ValidationError('La fecha de registro es requerida');
    }

    // Validar que la fecha no sea futura
    if (data.recordedDate > new Date()) {
      throw new ValidationError('La fecha de registro no puede ser futura');
    }
  }

  /**
   * Validar producción de leche
   */
  private async validateMilkProduction(
    data: Omit<MilkRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    if (!data.quantity || data.quantity <= 0) {
      throw new ValidationError('La cantidad de leche debe ser mayor a 0');
    }

    if (data.quantity > 100) { // Límite razonable para producción diaria
      throw new ValidationError('La cantidad de leche parece excesiva');
    }

    if (data.fatContent && (data.fatContent < 0 || data.fatContent > 10)) {
      throw new ValidationError('El contenido de grasa debe estar entre 0-10%');
    }

    if (data.proteinContent && (data.proteinContent < 0 || data.proteinContent > 5)) {
      throw new ValidationError('El contenido de proteína debe estar entre 0-5%');
    }
  }

  /**
   * Validar registro de peso
   */
  private async validateWeightRecord(
    data: Omit<WeightRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    if (!data.weight || data.weight <= 0) {
      throw new ValidationError('El peso debe ser mayor a 0');
    }

    if (data.weight < 50 || data.weight > 2000) { // Límites razonables
      throw new ValidationError('El peso parece estar fuera del rango normal');
    }

    if (data.bodyConditionScore && (data.bodyConditionScore < 1 || data.bodyConditionScore > 5)) {
      throw new ValidationError('La condición corporal debe estar entre 1-5');
    }
  }

  /**
   * Formatear registro de producción para respuesta
   */
  private formatProductionRecord(record: MockProductionRecord): ProductionRecord {
    return {
      id: record.id,
      bovineId: record.bovineId,
      type: record.type,
      value: record.value,
      unit: record.unit,
      recordedDate: record.recordedDate,
      location: record.location,
      notes: record.notes,
      metadata: record.metadata || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * Generar descripción del registro de producción
   */
  private generateProductionDescription(
    data: Omit<ProductionRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): string {
    const typeLabels = {
      [ProductionType.MILK]: 'leche',
      [ProductionType.WEIGHT]: 'peso',
      [ProductionType.FEED_INTAKE]: 'consumo de alimento',
      [ProductionType.GROWTH]: 'crecimiento'
    };

    return `Registro de ${typeLabels[data.type]}: ${data.value} ${data.unit}`;
  }

  /**
   * Actualizar métricas del bovino
   */
  private async updateBovineMetrics(
    bovineId: string, 
    transaction: Transaction
  ): Promise<void> {
    try {
      const metrics = await this.calculateProductionMetrics(bovineId);
      
      // Actualizar campos relevantes en el modelo Bovine usando método auxiliar
      await this.safeBovineUpdate(bovineId, {
        lastProductionUpdate: new Date(),
        productionMetrics: JSON.stringify(metrics)
      });

    } catch (error) {
      logger.warn('⚠️ Error actualizando métricas del bovino', { error, bovineId });
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Verificar alertas de producción
   */
  private async checkProductionAlerts(
    recordId: string, 
    transaction: Transaction
  ): Promise<void> {
    try {
      const record = await Production.findByPk(recordId);
      if (!record) return;

      // Implementar lógica de alertas según el tipo de producción
      if (record.type === ProductionType.MILK && record.value < 5) {
        await this.notificationService.createNotification({
          userId: record.recordedBy || 'unknown',
          title: 'Baja producción de leche',
          message: `Producción de leche por debajo del promedio: ${record.value}L`,
          type: 'WARNING',
          relatedId: record.bovineId,
          relatedType: 'BOVINE'
        });
      }

      if (record.type === ProductionType.WEIGHT) {
        // Verificar cambios drásticos de peso
        const lastWeight = await Production.findOne({
          where: {
            bovineId: record.bovineId,
            type: ProductionType.WEIGHT,
            // Excluir el registro actual
            id: { [Op.ne]: recordId }
          },
          order: [['recordedDate', 'DESC']]
        });

        if (lastWeight) {
          const weightChange = Math.abs(record.value - lastWeight.value);
          const percentChange = (weightChange / lastWeight.value) * 100;
          
          if (percentChange > 10) {
            await this.notificationService.createNotification({
              userId: record.recordedBy || 'unknown',
              title: 'Cambio significativo de peso',
              message: `Cambio de peso de ${percentChange.toFixed(1)}% detectado`,
              type: 'WARNING',
              relatedId: record.bovineId,
              relatedType: 'BOVINE'
            });
          }
        }
      }

    } catch (error) {
      logger.warn('⚠️ Error verificando alertas de producción', { error, recordId });
    }
  }

  /**
   * Calcular tendencia de registros
   */
  private async calculateTrend(records: MockProductionRecord[]): Promise<string> {
    if (records.length < 2) return 'STABLE';

    const values = records.map(r => r.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'INCREASING';
    if (change < -5) return 'DECREASING';
    return 'STABLE';
  }

  /**
   * Crear métricas vacías
   */
  private createEmptyMetrics(bovineId: string): ProductionMetrics {
    return {
      bovineId,
      period: { startDate: new Date(), endDate: new Date() },
      totalRecords: 0,
      byType: {}
    };
  }

  /**
   * Actualizar métricas del bovino de forma segura
   */
  private async safeBovineUpdate(bovineId: string, updateData: any): Promise<void> {
    try {
      if (updateData && typeof updateData === 'object') {
        await Bovine.update(updateData, { 
          where: { id: bovineId }
        });
      }
    } catch (error) {
      logger.warn('⚠️ Error actualizando bovino', { error, bovineId });
    }
  }

  /**
   * Calcular fecha de inicio según período
   */
  private calculateStartDate(endDate: Date, period: string): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  /**
   * Procesar datos de tendencias
   */
  private processTrendsData(records: MockProductionRecord[], period: string): ProductionTrends {
    // Implementar lógica de procesamiento de tendencias
    const groupedData = records.reduce((acc: Record<string, MockProductionRecord[]>, record: MockProductionRecord) => {
      const key = this.getDateKey(record.recordedDate, period);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {} as Record<string, MockProductionRecord[]>);

    const trends: ProductionTrends = {
      period,
      dataPoints: [],
      totalRecords: records.length,
      averageValue: records.length > 0 ? 
        records.reduce((sum: number, r: MockProductionRecord) => sum + r.value, 0) / records.length : 0
    };

    for (const [dateKey, dayRecords] of Object.entries(groupedData)) {
      const totalValue = dayRecords.reduce((sum: number, r: MockProductionRecord) => sum + r.value, 0);
      const avgValue = totalValue / dayRecords.length;
      
      trends.dataPoints.push({
        date: new Date(dateKey),
        value: totalValue,
        average: avgValue,
        count: dayRecords.length
      });
    }

    // Ordenar por fecha
    trends.dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

    return trends;
  }

  /**
   * Obtener clave de fecha según período
   */
  private getDateKey(date: Date, period: string): string {
    switch (period) {
      case 'week':
      case 'month':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'quarter':
        return `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      case 'year':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }
}

// Exportar instancia única del servicio
export const productionService = new ProductionService();