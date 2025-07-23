import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';
import { 
  Bovine, 
  Location, 
  Finance,
  User
} from '../models';

// Tipos para alimentación
type FeedType = 
  | 'concentrate' 
  | 'forage' 
  | 'hay' 
  | 'silage' 
  | 'grain' 
  | 'pellets' 
  | 'supplement' 
  | 'mineral' 
  | 'vitamin' 
  | 'fresh_grass' 
  | 'organic';

type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled';
type ConsumptionBehavior = 'excellent' | 'good' | 'fair' | 'poor' | 'refused';
type FeedingFrequency = 'once_daily' | 'twice_daily' | 'three_times' | 'ad_libitum' | 'restricted';
type Season = 'dry' | 'rainy' | 'transition';
type BovineType = 'CATTLE' | 'BULL' | 'COW' | 'CALF';

// Interfaces para planes nutricionales
interface CreateFeedingPlanRequest {
  name: string;
  description?: string;
  bovineIds: string[];
  targetGroups?: {
    type: BovineType[];
    ageRange?: { min: number; max: number };
    weightRange?: { min: number; max: number };
    productionStage?: string[];
  };
  startDate: Date;
  endDate?: Date;
  status: PlanStatus;
  
  components: Array<{
    feedId: string;
    feedName: string;
    feedType: FeedType;
    quantity: number;
    unit: string;
    costPerUnit: number;
    administrationTimes: string[];
    specialInstructions?: string;
  }>;
  
  nutritionalGoals: {
    dailyProtein: number;
    dailyEnergy: number;
    dailyFiber: number;
    dailyCalcium: number;
    dailyPhosphorus: number;
    bodyWeightGain?: number;
    milkProduction?: number;
    reproductiveGoals?: string[];
  };
  
  weeklySchedule: {
    [day: string]: Array<{
      time: string;
      feeds: string[];
      location: {
        latitude: number;
        longitude: number;
        address: string;
        section?: string;
      };
      duration: number;
      responsible: string;
      instructions?: string;
    }>;
  };
  
  dailyCost?: number;
  veterinarianApproval?: boolean;
  approvedBy?: string;
  notes?: string;
}

interface UpdateFeedingPlanRequest extends Partial<CreateFeedingPlanRequest> {
  id: string;
  approvalDate?: Date;
  lastModified?: Date;
}

interface CreateConsumptionRecordRequest {
  animalId: string;
  planId?: string;
  feedComponentId?: string;
  feedType: FeedType;
  feedName: string;
  
  consumption: {
    scheduledQuantity: number;
    actualQuantity: number;
    refusalQuantity: number;
    wastageQuantity?: number;
    consumptionPercentage: number;
  };
  
  feedingTime: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    section?: string;
    feedingArea?: string;
  };
  
  animalBehavior: {
    appetite: ConsumptionBehavior;
    competitiveness: 'low' | 'medium' | 'high';
    feedingDuration: number;
    observations: string[];
    healthIndicators: string[];
    behaviorNotes?: string;
  };
  
  environmentalFactors?: {
    temperature: number;
    humidity: number;
    weather: string;
    stressFactors: string[];
  };
  
  costAnalysis?: {
    feedCost: number;
    wasteCost: number;
    efficiencyRatio: number;
  };
  
  recordedBy: string;
  notes?: string;
}

interface UpdateConsumptionRecordRequest extends Partial<CreateConsumptionRecordRequest> {
  id: string;
}

interface CreateFeedInventoryRequest {
  feedName: string;
  feedType: FeedType;
  supplier: string;
  batchNumber: string;
  
  quantities: {
    received: number;
    current: number;
    reserved: number;
    unit: string;
  };
  
  nutritionalProfile: {
    protein: number;
    energy: number;
    fiber: number;
    moisture: number;
    calcium: number;
    phosphorus: number;
    vitamins: Array<{
      name: string;
      content: number;
      unit: string;
    }>;
    minerals: Array<{
      name: string;
      content: number;
      unit: string;
    }>;
  };
  
  qualityMetrics: {
    grade: 'premium' | 'standard' | 'economy';
    appearance: string;
    smell: string;
    texture: string;
    mold: boolean;
    contamination: boolean;
    overallScore: number;
  };
  
  storage: {
    location: {
      latitude: number;
      longitude: number;
      address: string;
      facility: string;
      zone?: string;
    };
    conditions: {
      temperature: number;
      humidity: number;
      ventilation: 'poor' | 'adequate' | 'good' | 'excellent';
      protection: string[];
    };
    packaging: string;
    storageDate: Date;
  };
  
  pricing: {
    unitCost: number;
    totalCost: number;
    currency: string;
    purchaseDate: Date;
    invoice?: string;
  };
  
  dates: {
    manufacturingDate?: Date;
    expirationDate: Date;
    bestByDate?: Date;
  };
  
  certifications?: string[];
  notes?: string;
}

interface UpdateFeedInventoryRequest extends Partial<CreateFeedInventoryRequest> {
  id: string;
}

interface FeedingPlanFilters {
  status?: PlanStatus[];
  bovineIds?: string[];
  feedTypes?: FeedType[];
  veterinarianApproval?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  costRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface ConsumptionFilters {
  animalIds?: string[];
  planIds?: string[];
  feedTypes?: FeedType[];
  behaviorRating?: ConsumptionBehavior[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  efficiencyRange?: {
    min: number;
    max: number;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface FeedingAnalytics {
  overview: {
    totalPlans: number;
    activePlans: number;
    totalAnimals: number;
    avgDailyCost: number;
    feedEfficiency: number;
  };
  
  consumptionTrends: Array<{
    period: string;
    totalConsumption: number;
    avgEfficiency: number;
    cost: number;
    wastage: number;
  }>;
  
  nutritionalBalance: {
    proteinAdequacy: number;
    energyBalance: number;
    fiberContent: number;
    mineralBalance: number;
    supplementationRate: number;
  };
  
  behaviorAnalysis: {
    appetiteDistribution: Record<ConsumptionBehavior, number>;
    avgFeedingTime: number;
    competitionLevels: Record<string, number>;
    healthObservations: Array<{
      indicator: string;
      frequency: number;
      trend: 'improving' | 'stable' | 'declining';
    }>;
  };
  
  costAnalysis: {
    totalMonthlyCost: number;
    costPerAnimal: number;
    costPerKg: number;
    feedTypeBreakdown: Array<{
      feedType: FeedType;
      percentage: number;
      cost: number;
    }>;
    wastageCoast: number;
  };
  
  inventoryStatus: {
    totalValue: number;
    lowStockAlerts: number;
    expiringItems: number;
    qualityIssues: number;
    topSuppliers: Array<{
      supplier: string;
      volume: number;
      cost: number;
    }>;
  };
}

// Simulación de modelos hasta que estén disponibles
const FeedingPlan = {
  create: async (data: any) => ({ id: 'mock-plan-id', ...data }),
  count: async (options: any) => 5,
  findAll: async (options: any) => [],
  findByPk: async (id: string, options?: any) => null,
  findAndCountAll: async (options: any) => ({ count: 0, rows: [] })
};

const FeedConsumption = {
  create: async (data: any) => ({ id: 'mock-consumption-id', ...data }),
  findAll: async (options: any) => [],
  findByPk: async (id: string, options?: any) => null,
  findAndCountAll: async (options: any) => ({ count: 0, rows: [] })
};

const FeedInventory = {
  create: async (data: any) => ({ id: 'mock-inventory-id', ...data }),
  findAll: async (options: any) => [],
  findByPk: async (id: string, options?: any) => null,
  findAndCountAll: async (options: any) => ({ count: 0, rows: [] })
};

const FeedSchedule = {
  create: async (data: any) => ({ id: 'mock-schedule-id', ...data })
};

export class FeedingController {
  constructor() {
    // Constructor vacío
  }

  /**
   * Crear nuevo plan nutricional
   * POST /api/feeding/plans
   */
  public createFeedingPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const planData: CreateFeedingPlanRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!planData.name || !planData.bovineIds || planData.bovineIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'Nombre del plan y bovinos son obligatorios'
          }
        });
        return;
      }

      // Validar que los bovinos existen
      const bovines = await Bovine.findAll({
        where: {
          id: { [Op.in]: planData.bovineIds },
          isActive: true
        }
      });

      if (bovines.length !== planData.bovineIds.length) {
        res.status(400).json({
          success: false,
          message: 'Algunos bovinos no fueron encontrados',
          errors: {
            bovineIds: 'Uno o más bovinos no existen o están inactivos'
          }
        });
        return;
      }

      // Validar componentes del plan
      if (!planData.components || planData.components.length === 0) {
        res.status(400).json({
          success: false,
          message: 'El plan debe tener al menos un componente alimentario',
          errors: {
            components: 'Debe especificar al menos un tipo de alimento'
          }
        });
        return;
      }

      // Calcular costo diario total
      const dailyCost = planData.components.reduce((total, component) => {
        return total + (component.quantity * component.costPerUnit);
      }, 0);

      // Crear plan de alimentación
      const newPlan = await FeedingPlan.create({
        name: planData.name,
        description: planData.description || '',
        bovineIds: planData.bovineIds,
        targetGroups: planData.targetGroups || {},
        startDate: planData.startDate,
        endDate: planData.endDate,
        status: planData.status || 'draft',
        components: planData.components,
        nutritionalGoals: planData.nutritionalGoals,
        dailyCost: dailyCost,
        weeklySchedule: planData.weeklySchedule,
        veterinarianApproval: planData.veterinarianApproval || false,
        approvedBy: planData.approvedBy || null,
        approvalDate: planData.veterinarianApproval ? new Date() : null,
        notes: planData.notes || '',
        createdBy: userId,
        createdAt: new Date(),
        lastModified: new Date()
      });

      // Crear horarios de alimentación automáticos
      await this.createAutomaticFeedingSchedules(newPlan.id, planData, userId);

      // Obtener plan completo
      const planWithDetails = await FeedingPlan.findByPk(newPlan.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Plan nutricional creado exitosamente',
        data: {
          plan: planWithDetails
        }
      });

    } catch (error) {
      console.error('Error al crear plan nutricional:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear el plan nutricional'
        }
      });
    }
  };

  /**
   * Obtener planes nutricionales con filtros
   * GET /api/feeding/plans
   */
  public getFeedingPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        status,
        bovineIds,
        feedTypes,
        veterinarianApproval,
        dateRange,
        costRange,
        searchTerm,
        createdBy,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      }: FeedingPlanFilters = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {};

      // Filtros específicos
      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        whereConditions.status = { [Op.in]: statusArray };
      }
      if (veterinarianApproval !== undefined) {
        const boolValue = typeof veterinarianApproval === 'string' 
          ? veterinarianApproval === 'true' 
          : veterinarianApproval;
        whereConditions.veterinarianApproval = boolValue;
      }
      if (createdBy) {
        whereConditions.createdBy = createdBy;
      }

      // Filtro por rango de fechas
      if (dateRange && (dateRange.startDate || dateRange.endDate)) {
        whereConditions.startDate = {};
        if (dateRange.startDate) whereConditions.startDate[Op.gte] = new Date(dateRange.startDate);
        if (dateRange.endDate) whereConditions.startDate[Op.lte] = new Date(dateRange.endDate);
      }

      // Filtro por costo diario
      if (costRange && (costRange.min !== undefined || costRange.max !== undefined)) {
        whereConditions.dailyCost = {};
        if (costRange.min !== undefined) whereConditions.dailyCost[Op.gte] = costRange.min;
        if (costRange.max !== undefined) whereConditions.dailyCost[Op.lte] = costRange.max;
      }

      // Filtro de búsqueda de texto
      if (searchTerm) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { notes: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Filtros de bovinos
      if (bovineIds && Array.isArray(bovineIds)) {
        whereConditions[Op.or] = bovineIds.map(id => ({
          bovineIds: { [Op.contains]: [id] }
        }));
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: plans } = await FeedingPlan.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Filtrar por tipos de alimento si se especifica
      let filteredPlans = plans;
      if (feedTypes && Array.isArray(feedTypes)) {
        filteredPlans = plans.filter((plan: any) => {
          return plan.components.some((component: any) => 
            feedTypes.includes(component.feedType)
          );
        });
      }

      // Enriquecer con información de bovinos
      const enrichedPlans = await Promise.all(
        filteredPlans.map(async (plan: any) => {
          const bovines = await Bovine.findAll({
            where: {
              id: { [Op.in]: plan.bovineIds },
              isActive: true
            },
            attributes: ['id', 'earTag', 'name', 'type', 'weight']
          });

          return {
            ...plan.toJSON(),
            bovineInfo: bovines.map(bovine => ({
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              type: (bovine as any).type,
              weight: bovine.weight
            })),
            totalAnimals: bovines.length
          };
        })
      );

      // Preparar respuesta
      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        message: 'Planes nutricionales obtenidos exitosamente',
        data: {
          plans: enrichedPlans,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener planes nutricionales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener los planes nutricionales'
        }
      });
    }
  };

  /**
   * Crear registro de consumo
   * POST /api/feeding/consumption
   */
  public createConsumptionRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const recordData: CreateConsumptionRecordRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!recordData.animalId || !recordData.feedType || !recordData.feedingTime) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'ID del animal, tipo de alimento y hora de alimentación son obligatorios'
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

      // Calcular eficiencia de consumo
      const efficiency = recordData.consumption.scheduledQuantity > 0 
        ? (recordData.consumption.actualQuantity / recordData.consumption.scheduledQuantity) * 100 
        : 0;

      // Crear registro de consumo SIN ubicación por ahora
      const newRecord = await FeedConsumption.create({
        animalId: recordData.animalId,
        animalTag: (animal as any).earTag,
        planId: recordData.planId || null,
        feedComponentId: recordData.feedComponentId || null,
        feedType: recordData.feedType,
        feedName: recordData.feedName,
        scheduledQuantity: recordData.consumption.scheduledQuantity,
        actualQuantity: recordData.consumption.actualQuantity,
        refusalQuantity: recordData.consumption.refusalQuantity,
        wastageQuantity: recordData.consumption.wastageQuantity || 0,
        consumptionPercentage: recordData.consumption.consumptionPercentage,
        efficiencyRatio: Math.round(efficiency * 100) / 100,
        feedingTime: recordData.feedingTime,
        animalBehavior: recordData.animalBehavior,
        environmentalFactors: recordData.environmentalFactors || {},
        costAnalysis: recordData.costAnalysis || {},
        recordedBy: userId,
        notes: recordData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Obtener registro completo
      const recordWithDetails = await FeedConsumption.findByPk(newRecord.id, {
        include: [
          {
            model: Bovine,
            as: 'animal',
            attributes: ['id', 'earTag', 'name', 'type']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Registro de consumo creado exitosamente',
        data: {
          record: recordWithDetails
        }
      });

    } catch (error) {
      console.error('Error al crear registro de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear el registro de consumo'
        }
      });
    }
  };

  /**
   * Obtener registros de consumo con filtros
   * GET /api/feeding/consumption
   */
  public getConsumptionRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        animalIds,
        planIds,
        feedTypes,
        behaviorRating,
        dateRange,
        location,
        efficiencyRange,
        page = 1,
        limit = 20,
        sortBy = 'feedingTime',
        sortOrder = 'DESC'
      }: ConsumptionFilters = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {};

      // Filtros específicos
      if (animalIds && Array.isArray(animalIds)) {
        whereConditions.animalId = { [Op.in]: animalIds };
      }
      if (planIds && Array.isArray(planIds)) {
        whereConditions.planId = { [Op.in]: planIds };
      }
      if (feedTypes && Array.isArray(feedTypes)) {
        whereConditions.feedType = { [Op.in]: feedTypes };
      }

      // Filtro por rango de fechas
      if (dateRange && (dateRange.startDate || dateRange.endDate)) {
        whereConditions.feedingTime = {};
        if (dateRange.startDate) whereConditions.feedingTime[Op.gte] = new Date(dateRange.startDate);
        if (dateRange.endDate) whereConditions.feedingTime[Op.lte] = new Date(dateRange.endDate);
      }

      // Filtro por eficiencia
      if (efficiencyRange && (efficiencyRange.min !== undefined || efficiencyRange.max !== undefined)) {
        whereConditions.efficiencyRatio = {};
        if (efficiencyRange.min !== undefined) whereConditions.efficiencyRatio[Op.gte] = efficiencyRange.min;
        if (efficiencyRange.max !== undefined) whereConditions.efficiencyRatio[Op.lte] = efficiencyRange.max;
      }

      // Filtro por comportamiento
      if (behaviorRating && Array.isArray(behaviorRating)) {
        whereConditions['animalBehavior.appetite'] = { [Op.in]: behaviorRating };
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: records } = await FeedConsumption.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Bovine,
            as: 'animal',
            attributes: ['id', 'earTag', 'name', 'type', 'weight']
          },
          {
            model: FeedingPlan,
            as: 'plan',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Preparar respuesta
      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        message: 'Registros de consumo obtenidos exitosamente',
        data: {
          records: records,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener registros de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener los registros de consumo'
        }
      });
    }
  };

  /**
   * Crear entrada en inventario de alimentos
   * POST /api/feeding/inventory
   */
  public createFeedInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const inventoryData: CreateFeedInventoryRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!inventoryData.feedName || !inventoryData.feedType || !inventoryData.supplier) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'Nombre del alimento, tipo y proveedor son obligatorios'
          }
        });
        return;
      }

      // Crear entrada de inventario SIN ubicación por ahora
      const newInventoryItem = await FeedInventory.create({
        feedName: inventoryData.feedName,
        feedType: inventoryData.feedType,
        supplier: inventoryData.supplier,
        batchNumber: inventoryData.batchNumber,
        quantityReceived: inventoryData.quantities.received,
        currentQuantity: inventoryData.quantities.current,
        reservedQuantity: inventoryData.quantities.reserved || 0,
        unit: inventoryData.quantities.unit,
        nutritionalProfile: inventoryData.nutritionalProfile,
        qualityMetrics: inventoryData.qualityMetrics,
        storageConditions: inventoryData.storage.conditions,
        packaging: inventoryData.storage.packaging,
        storageDate: inventoryData.storage.storageDate,
        unitCost: inventoryData.pricing.unitCost,
        totalCost: inventoryData.pricing.totalCost,
        currency: inventoryData.pricing.currency || 'MXN',
        purchaseDate: inventoryData.pricing.purchaseDate,
        invoice: inventoryData.pricing.invoice || '',
        manufacturingDate: inventoryData.dates.manufacturingDate,
        expirationDate: inventoryData.dates.expirationDate,
        bestByDate: inventoryData.dates.bestByDate,
        certifications: inventoryData.certifications || [],
        notes: inventoryData.notes || '',
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Obtener entrada completa
      const inventoryWithDetails = await FeedInventory.findByPk(newInventoryItem.id);

      res.status(201).json({
        success: true,
        message: 'Entrada de inventario creada exitosamente',
        data: {
          inventory: inventoryWithDetails
        }
      });

    } catch (error) {
      console.error('Error al crear entrada de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear la entrada de inventario'
        }
      });
    }
  };

  /**
   * Obtener análisis y métricas de alimentación
   * GET /api/feeding/analytics
   */
  public getFeedingAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange = 'monthly', bovineIds } = req.query;

      // Establecer período para análisis
      const currentDate = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'weekly':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
        case 'quarterly':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      const dateConditions = {
        createdAt: { [Op.gte]: startDate }
      };

      // Filtrar por bovinos si se especifica
      const bovineConditions = bovineIds && Array.isArray(bovineIds) 
        ? { animalId: { [Op.in]: bovineIds } }
        : {};

      // Overview general
      const totalPlans = await FeedingPlan.count({ where: dateConditions });
      const activePlans = await FeedingPlan.count({ 
        where: { ...dateConditions, status: 'active' } 
      });
      
      const planData = await FeedingPlan.findAll({
        where: { ...dateConditions, status: 'active' },
        attributes: ['bovineIds', 'dailyCost']
      });

      const totalAnimals = new Set(
        planData.flatMap((plan: any) => plan.bovineIds)
      ).size;

      const avgDailyCost = planData.length > 0 
        ? planData.reduce((sum: number, plan: any) => sum + plan.dailyCost, 0) / planData.length 
        : 0;

      // Eficiencia de alimentación
      const efficiencyData = await FeedConsumption.findAll({
        where: {
          feedingTime: { [Op.gte]: startDate },
          ...bovineConditions
        },
        attributes: [
          [fn('AVG', col('efficiencyRatio')), 'avgEfficiency']
        ],
        raw: true
      });

      const feedEfficiency = parseFloat((efficiencyData[0] as any)?.avgEfficiency || '0');

      // Tendencias de consumo por período
      const consumptionTrends: Array<{
        period: string;
        totalConsumption: number;
        avgEfficiency: number;
        cost: number;
        wastage: number;
      }> = [];
      
      const periods = this.generatePeriods(startDate, currentDate, timeRange as string);
      
      for (const period of periods) {
        const periodConsumption = await FeedConsumption.findAll({
          where: {
            feedingTime: {
              [Op.between]: [period.start, period.end]
            },
            ...bovineConditions
          },
          attributes: [
            [fn('SUM', col('actualQuantity')), 'totalConsumption'],
            [fn('AVG', col('efficiencyRatio')), 'avgEfficiency'],
            [fn('SUM', col('costAnalysis.feedCost')), 'totalCost'],
            [fn('SUM', col('wastageQuantity')), 'totalWastage']
          ],
          raw: true
        });

        consumptionTrends.push({
          period: period.label,
          totalConsumption: parseFloat((periodConsumption[0] as any)?.totalConsumption || '0'),
          avgEfficiency: parseFloat((periodConsumption[0] as any)?.avgEfficiency || '0'),
          cost: parseFloat((periodConsumption[0] as any)?.totalCost || '0'),
          wastage: parseFloat((periodConsumption[0] as any)?.totalWastage || '0')
        });
      }

      // Balance nutricional (simulado)
      const nutritionalBalance = {
        proteinAdequacy: 92.5,
        energyBalance: 88.3,
        fiberContent: 78.9,
        mineralBalance: 95.1,
        supplementationRate: 67.8
      };

      // Análisis de comportamiento
      const behaviorData = await FeedConsumption.findAll({
        where: {
          feedingTime: { [Op.gte]: startDate },
          ...bovineConditions
        },
        attributes: [
          'animalBehavior'
        ],
        raw: true
      });

      const appetiteDistribution: Record<string, number> = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        refused: 0
      };

      let totalFeedingTime = 0;
      let feedingTimeCount = 0;

      behaviorData.forEach((record: any) => {
        const behavior = record.animalBehavior;
        if (behavior && behavior.appetite) {
          appetiteDistribution[behavior.appetite] = (appetiteDistribution[behavior.appetite] || 0) + 1;
        }
        if (behavior && behavior.feedingDuration) {
          totalFeedingTime += behavior.feedingDuration;
          feedingTimeCount++;
        }
      });

      const avgFeedingTime = feedingTimeCount > 0 ? totalFeedingTime / feedingTimeCount : 0;

      // Análisis de tipos de alimento
      const feedTypeData = await FeedConsumption.findAll({
        where: {
          feedingTime: { [Op.gte]: startDate },
          ...bovineConditions
        },
        attributes: [
          'feedType',
          [fn('SUM', col('actualQuantity')), 'totalQuantity'],
          [fn('SUM', col('costAnalysis.feedCost')), 'totalCost']
        ],
        group: ['feedType'],
        raw: true
      });

      const totalFeedCost = feedTypeData.reduce((sum: number, item: any) => 
        sum + parseFloat(item.totalCost || '0'), 0);

      const feedTypeBreakdown = feedTypeData.map((item: any) => ({
        feedType: item.feedType as FeedType,
        percentage: totalFeedCost > 0 ? Math.round((parseFloat(item.totalCost || '0') / totalFeedCost) * 100) : 0,
        cost: parseFloat(item.totalCost || '0')
      }));

      // Status del inventario
      const inventoryData = await FeedInventory.findAll({
        where: { isActive: true },
        attributes: [
          [fn('SUM', col('totalCost')), 'totalValue'],
          [fn('COUNT', literal("CASE WHEN currentQuantity < (quantityReceived * 0.1) THEN 1 END")), 'lowStock'],
          [fn('COUNT', literal("CASE WHEN expirationDate <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END")), 'expiring'],
          [fn('COUNT', literal("CASE WHEN qualityMetrics.overallScore < 6 THEN 1 END")), 'qualityIssues']
        ],
        raw: true
      });

      const analytics: FeedingAnalytics = {
        overview: {
          totalPlans,
          activePlans,
          totalAnimals,
          avgDailyCost: Math.round(avgDailyCost * 100) / 100,
          feedEfficiency: Math.round(feedEfficiency * 100) / 100
        },
        consumptionTrends,
        nutritionalBalance,
        behaviorAnalysis: {
          appetiteDistribution: appetiteDistribution as Record<ConsumptionBehavior, number>,
          avgFeedingTime: Math.round(avgFeedingTime),
          competitionLevels: { low: 60, medium: 30, high: 10 },
          healthObservations: [
            { indicator: 'Buen apetito', frequency: 85, trend: 'stable' },
            { indicator: 'Rumia normal', frequency: 92, trend: 'improving' },
            { indicator: 'Comportamiento competitivo', frequency: 15, trend: 'declining' }
          ]
        },
        costAnalysis: {
          totalMonthlyCost: 0,
          costPerAnimal: 0,
          costPerKg: 0,
          feedTypeBreakdown,
          wastageCoast: 0
        },
        inventoryStatus: {
          totalValue: parseFloat((inventoryData[0] as any)?.totalValue || '0'),
          lowStockAlerts: parseInt((inventoryData[0] as any)?.lowStock || '0'),
          expiringItems: parseInt((inventoryData[0] as any)?.expiring || '0'),
          qualityIssues: parseInt((inventoryData[0] as any)?.qualityIssues || '0'),
          topSuppliers: []
        }
      };

      res.status(200).json({
        success: true,
        message: 'Análisis de alimentación obtenido exitosamente',
        data: {
          analytics,
          timeRange,
          period: { startDate, endDate: currentDate }
        }
      });

    } catch (error) {
      console.error('Error al obtener análisis de alimentación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener el análisis de alimentación'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async createAutomaticFeedingSchedules(planId: string, planData: CreateFeedingPlanRequest, userId: string): Promise<void> {
    for (const [day, sessions] of Object.entries(planData.weeklySchedule)) {
      for (const session of sessions) {
        await FeedSchedule.create({
          planId: planId,
          dayOfWeek: day,
          feedingTime: session.time,
          feedComponents: session.feeds,
          duration: session.duration,
          responsible: session.responsible,
          instructions: session.instructions || '',
          isActive: true,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  private generatePeriods(startDate: Date, endDate: Date, timeRange: string): Array<{start: Date, end: Date, label: string}> {
    const periods = [];
    let current = new Date(startDate);
    
    while (current < endDate) {
      let periodEnd: Date;
      let label: string;
      
      switch (timeRange) {
        case 'weekly':
          periodEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
          label = `Semana ${Math.ceil((current.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;
          break;
        case 'monthly':
          periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1);
          label = current.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
          break;
        default:
          periodEnd = new Date(current.getTime() + 30 * 24 * 60 * 60 * 1000);
          label = current.toLocaleDateString('es-ES');
      }
      
      periods.push({
        start: new Date(current),
        end: new Date(Math.min(periodEnd.getTime(), endDate.getTime())),
        label
      });
      
      current = periodEnd;
    }
    
    return periods;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}