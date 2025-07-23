import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database'; // Importación corregida como default
import Bovine, { 
  CattleType, 
  HealthStatus, 
  VaccinationStatus, 
  GenderType 
} from '../models/Bovine'; // Usando los tipos correctos del modelo Bovine
import Event, { EventType, EventStatus, EventPriority } from '../models/Event';
import Location from '../models/Location';

// Tipos para el dashboard (adaptados a los modelos reales)
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type ProductionType = 'MILK' | 'MEAT' | 'BREEDING';

// Interfaces temporales para modelos faltantes
interface TemporaryVaccination {
  id: string;
  bovineId: string;
  vaccineType: string;
  applicationDate: Date;
}

interface TemporaryIllness {
  id: string;
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  severity: string;
}

interface TemporaryFinance {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
}

// Interfaces para estadísticas
interface DashboardOverview {
  totalBovines: number;
  healthyBovines: number;
  sickBovines: number;
  upcomingVaccinations: number;
  todayEvents: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
  activeAlerts: number;
}

interface HealthMetrics {
  overall: {
    totalAnimals: number;
    healthyCount: number;
    sickCount: number;
    recoveringCount: number;
    quarantineCount: number;
    healthScore: number;
  };
  byType: Array<{
    type: CattleType;
    count: number;
    healthyPercentage: number;
    issues: number;
  }>;
  recentIllnesses: Array<{
    id: string;
    diseaseName: string;
    affectedCount: number;
    severity: string;
    date: Date;
    status: string;
  }>;
  mortalityRate: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface VaccinationMetrics {
  coverage: {
    overall: number;
    byVaccineType: Array<{
      vaccineType: string;
      coverage: number;
      administered: number;
      required: number;
    }>;
  };
  compliance: {
    onTime: number;
    late: number;
    missed: number;
    rate: number;
  };
  upcoming: Array<{
    bovineId: string;
    earTag: string;
    vaccineName: string;
    dueDate: Date;
    priority: string;
    daysPastDue?: number;
  }>;
  trends: Array<{
    month: string;
    administered: number;
    target: number;
    compliance: number;
  }>;
}

interface ProductionMetrics {
  summary: {
    totalProduction: number;
    dailyAverage: number;
    weeklyGrowth: number;
    monthlyTarget: number;
    efficiency: number;
  };
  byType: Array<{
    type: ProductionType;
    value: number;
    unit: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topProducers: Array<{
    bovineId: string;
    earTag: string;
    name?: string;
    production: number;
    efficiency: number;
  }>;
  forecast: Array<{
    period: string;
    expected: number;
    confidence: number;
  }>;
}

interface FinancialMetrics {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  };
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    change: number;
  }>;
  cashFlow: Array<{
    month: string;
    income: number;
    expenses: number;
    netFlow: number;
  }>;
  costPerAnimal: {
    feed: number;
    medical: number;
    maintenance: number;
    total: number;
  };
}

interface GeographicMetrics {
  distribution: Array<{
    location: {
      latitude: number;
      longitude: number;
      address?: string;
      section?: string;
    };
    animalCount: number;
    healthStatus: Record<HealthStatus, number>;
    lastActivity: Date;
    alerts: number;
  }>;
  heatmap: Array<{
    lat: number;
    lng: number;
    intensity: number;
    type: 'bovines' | 'vaccinations' | 'illnesses' | 'events';
  }>;
  zones: Array<{
    id: string;
    name: string;
    area: number; // en hectáreas
    capacity: number;
    currentOccupancy: number;
    utilizationRate: number;
  }>;
}

interface AlertsAndNotifications {
  critical: Array<{
    id: string;
    type: 'health' | 'vaccination' | 'event' | 'system';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    bovineId?: string;
    location?: string;
    actionRequired: boolean;
  }>;
  summary: {
    total: number;
    urgent: number;
    unread: number;
    byType: Record<string, number>;
  };
}

interface PerformanceKPIs {
  operational: {
    animalWelfare: number; // 0-100
    feedEfficiency: number; // kg production per kg feed
    reproductionRate: number; // %
    averageDailyGain: number; // kg/day
    mortalityRate: number; // %
  };
  financial: {
    revenuePerAnimal: number;
    costPerAnimal: number;
    profitPerAnimal: number;
    roi: number; // %
    breakEvenPoint: number; // días
  };
  sustainability: {
    carbonFootprint: number; // kg CO2 equivalent
    waterUsageEfficiency: number;
    landUseEfficiency: number;
    wasteReductionRate: number; // %
  };
}

export class DashboardController {
  /**
   * Obtener resumen general del dashboard
   * GET /api/dashboard/overview
   */
  public getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange = 'monthly' }: { timeRange?: TimeRange } = req.query as any;
      const userId = (req as any).user?.id;

      // Estadísticas básicas usando el modelo real
      const totalBovines = await Bovine.count({ where: { isActive: true } });
      const healthyBovines = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.HEALTHY } 
      });
      const sickBovines = await Bovine.count({ 
        where: { 
          isActive: true, 
          healthStatus: { [Op.in]: [HealthStatus.SICK, HealthStatus.RECOVERING] } 
        } 
      });

      // Eventos de vacunación próximos (usando modelo Event)
      const upcomingVaccinations = await Event.count({
        where: {
          eventType: EventType.VACCINATION,
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: EventStatus.SCHEDULED,
          isActive: true
        }
      });

      // Eventos de hoy
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      
      const todayEvents = await Event.count({
        where: {
          scheduledDate: {
            [Op.between]: [todayStart, todayEnd]
          },
          status: { [Op.in]: [EventStatus.SCHEDULED, EventStatus.IN_PROGRESS] },
          isActive: true
        }
      });

      // Crecimiento semanal
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newBovinesThisWeek = await Bovine.count({
        where: {
          isActive: true,
          createdAt: { [Op.gte]: lastWeek }
        }
      });
      const weeklyGrowth = totalBovines > 0 ? (newBovinesThisWeek / totalBovines) * 100 : 0;

      // Ingresos mensuales (simulados por ahora)
      const monthlyRevenue = 125750.50; // Placeholder hasta implementar modelo Finance

      // Alertas activas
      const activeAlerts = await this.getActiveAlertsCount();

      const overview: DashboardOverview = {
        totalBovines,
        healthyBovines,
        sickBovines,
        upcomingVaccinations,
        todayEvents,
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
        monthlyRevenue,
        activeAlerts
      };

      res.status(200).json({
        success: true,
        message: 'Resumen del dashboard obtenido exitosamente',
        data: {
          overview,
          lastUpdated: new Date(),
          timeRange
        }
      });

    } catch (error) {
      console.error('Error al obtener resumen del dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener el resumen del dashboard'
        }
      });
    }
  };

  /**
   * Obtener métricas de salud
   * GET /api/dashboard/health-metrics
   */
  public getHealthMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange = 'monthly' }: { timeRange?: TimeRange } = req.query as any;

      // Métricas generales usando enums correctos
      const totalAnimals = await Bovine.count({ where: { isActive: true } });
      const healthyCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.HEALTHY } 
      });
      const sickCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.SICK } 
      });
      const recoveringCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.RECOVERING } 
      });
      const quarantineCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.QUARANTINE } 
      });

      const healthScore = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;

      // Métricas por tipo usando CattleType correcto
      const cattleTypes = Object.values(CattleType);
      const byType = await Promise.all(cattleTypes.map(async (type) => {
        const typeCount = await Bovine.count({ 
          where: { isActive: true, cattleType: type } // Usar cattleType, no type
        });
        const typeHealthy = await Bovine.count({ 
          where: { isActive: true, cattleType: type, healthStatus: HealthStatus.HEALTHY } 
        });
        const typeIssues = await Bovine.count({ 
          where: { 
            isActive: true, 
            cattleType: type, 
            healthStatus: { 
              [Op.in]: [HealthStatus.SICK, HealthStatus.RECOVERING, HealthStatus.QUARANTINE] 
            } 
          } 
        });

        return {
          type,
          count: typeCount,
          healthyPercentage: typeCount > 0 ? Math.round((typeHealthy / typeCount) * 100) : 0,
          issues: typeIssues
        };
      }));

      // Enfermedades recientes (simuladas por ahora - usar eventos de enfermedad)
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentDiseaseEvents = await Event.findAll({
        where: {
          eventType: EventType.DISEASE,
          scheduledDate: { [Op.gte]: monthAgo },
          isActive: true
        },
        limit: 10,
        order: [['scheduledDate', 'DESC']]
      });

      const recentIllnesses = recentDiseaseEvents.map(event => ({
        id: event.id,
        diseaseName: event.title,
        affectedCount: 1, // Un evento por bovino
        severity: event.priority,
        date: event.scheduledDate,
        status: event.status
      }));

      // Tasa de mortalidad
      const currentPeriodDeaths = await Bovine.count({
        where: {
          healthStatus: HealthStatus.DECEASED,
          updatedAt: { [Op.gte]: monthAgo }
        }
      });
      const previousPeriodDeaths = await Bovine.count({
        where: {
          healthStatus: HealthStatus.DECEASED,
          updatedAt: { 
            [Op.between]: [
              new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              monthAgo
            ]
          }
        }
      });

      const currentMortalityRate = totalAnimals > 0 ? (currentPeriodDeaths / totalAnimals) * 100 : 0;
      const previousMortalityRate = totalAnimals > 0 ? (previousPeriodDeaths / totalAnimals) * 100 : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentMortalityRate > previousMortalityRate * 1.1) trend = 'up';
      else if (currentMortalityRate < previousMortalityRate * 0.9) trend = 'down';

      const healthMetrics: HealthMetrics = {
        overall: {
          totalAnimals,
          healthyCount,
          sickCount,
          recoveringCount,
          quarantineCount,
          healthScore
        },
        byType,
        recentIllnesses,
        mortalityRate: {
          current: Math.round(currentMortalityRate * 100) / 100,
          previous: Math.round(previousMortalityRate * 100) / 100,
          trend
        }
      };

      res.status(200).json({
        success: true,
        message: 'Métricas de salud obtenidas exitosamente',
        data: {
          healthMetrics,
          lastUpdated: new Date(),
          timeRange
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas de salud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las métricas de salud'
        }
      });
    }
  };

  /**
   * Obtener métricas de vacunación
   * GET /api/dashboard/vaccination-metrics
   */
  public getVaccinationMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalBovines = await Bovine.count({ where: { isActive: true } });

      // Cobertura general usando VaccinationStatus
      const upToDateBovines = await Bovine.count({
        where: { 
          isActive: true,
          vaccinationStatus: VaccinationStatus.UP_TO_DATE
        }
      });

      const overallCoverage = totalBovines > 0 ? Math.round((upToDateBovines / totalBovines) * 100) : 0;

      // Eventos de vacunación por tipo
      const vaccinationEvents = await Event.findAll({
        where: {
          eventType: EventType.VACCINATION,
          status: EventStatus.COMPLETED,
          isActive: true
        },
        attributes: [
          [fn('COUNT', col('id')), 'count'],
          'title' // Usar título como tipo de vacuna
        ],
        group: ['title'],
        raw: true
      });

      const byVaccineType = (vaccinationEvents as any[]).map((vaccine) => ({
        vaccineType: vaccine.title || 'Sin especificar',
        coverage: totalBovines > 0 ? Math.round((parseInt(vaccine.count) / totalBovines) * 100) : 0,
        administered: parseInt(vaccine.count),
        required: totalBovines
      }));

      // Compliance usando estados de vacunación
      const onTimeBovines = await Bovine.count({
        where: { 
          isActive: true,
          vaccinationStatus: VaccinationStatus.UP_TO_DATE
        }
      });

      const overdueBovines = await Bovine.count({
        where: { 
          isActive: true,
          vaccinationStatus: VaccinationStatus.OVERDUE
        }
      });

      const pendingBovines = await Bovine.count({
        where: { 
          isActive: true,
          vaccinationStatus: VaccinationStatus.PENDING
        }
      });

      const totalScheduled = onTimeBovines + overdueBovines + pendingBovines;
      const complianceRate = totalScheduled > 0 ? Math.round((onTimeBovines / totalScheduled) * 100) : 0;

      // Próximas vacunaciones usando eventos programados
      const upcomingVaccinationEvents = await Event.findAll({
        where: {
          eventType: EventType.VACCINATION,
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          },
          status: EventStatus.SCHEDULED,
          isActive: true
        },
        order: [['scheduledDate', 'ASC']],
        limit: 20
      });

      // Obtener información de bovinos para eventos próximos
      const upcoming = await Promise.all(
        upcomingVaccinationEvents.map(async (event) => {
          const bovine = await Bovine.findByPk(event.bovineId, {
            attributes: ['earTag', 'name']
          });
          
          return {
            bovineId: event.bovineId,
            earTag: bovine?.earTag || 'Sin etiqueta',
            vaccineName: event.title,
            dueDate: event.scheduledDate,
            priority: this.calculateVaccinationPriority(event.scheduledDate),
            daysPastDue: event.scheduledDate < new Date() ? 
              Math.floor((new Date().getTime() - event.scheduledDate.getTime()) / (1000 * 60 * 60 * 24)) : 
              undefined
          };
        })
      );

      // Tendencias mensuales (últimos 6 meses)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);

        const administered = await Event.count({
          where: {
            eventType: EventType.VACCINATION,
            status: EventStatus.COMPLETED,
            scheduledDate: { [Op.between]: [periodStart, periodEnd] },
            isActive: true
          }
        });

        const target = Math.round(totalBovines * 0.2); // 20% mensual como objetivo
        const compliance = target > 0 ? Math.round((administered / target) * 100) : 0;

        trends.push({
          month: periodStart.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
          administered,
          target,
          compliance
        });
      }

      const vaccinationMetrics: VaccinationMetrics = {
        coverage: {
          overall: overallCoverage,
          byVaccineType
        },
        compliance: {
          onTime: onTimeBovines,
          late: overdueBovines,
          missed: pendingBovines,
          rate: complianceRate
        },
        upcoming,
        trends
      };

      res.status(200).json({
        success: true,
        message: 'Métricas de vacunación obtenidas exitosamente',
        data: {
          vaccinationMetrics,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas de vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las métricas de vacunación'
        }
      });
    }
  };

  /**
   * Obtener métricas de producción (simuladas)
   * GET /api/dashboard/production-metrics
   */
  public getProductionMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Simulación de métricas de producción
      const totalProduction = 15750.5;
      const dailyAverage = 525.0;
      const weeklyGrowth = 3.2;
      const monthlyTarget = 18000;
      const efficiency = Math.round((totalProduction / monthlyTarget) * 100);

      const productionMetrics: ProductionMetrics = {
        summary: {
          totalProduction,
          dailyAverage,
          weeklyGrowth,
          monthlyTarget,
          efficiency
        },
        byType: [
          {
            type: 'MILK',
            value: totalProduction,
            unit: 'litros',
            change: 5.3,
            trend: 'up'
          },
          {
            type: 'MEAT',
            value: 2450.0,
            unit: 'kg',
            change: -1.2,
            trend: 'down'
          },
          {
            type: 'BREEDING',
            value: 23,
            unit: 'servicios',
            change: 12.5,
            trend: 'up'
          }
        ],
        topProducers: [
          {
            bovineId: 'temp1',
            earTag: 'COW001',
            name: 'Luna',
            production: 28.5,
            efficiency: 98.2
          },
          {
            bovineId: 'temp2',
            earTag: 'COW002',
            name: 'Bella',
            production: 26.8,
            efficiency: 95.1
          }
        ],
        forecast: [
          { period: 'Próxima semana', expected: 4200, confidence: 85 },
          { period: 'Próximo mes', expected: 18500, confidence: 78 },
          { period: 'Próximo trimestre', expected: 55200, confidence: 65 }
        ]
      };

      res.status(200).json({
        success: true,
        message: 'Métricas de producción obtenidas exitosamente',
        data: {
          productionMetrics,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las métricas de producción'
        }
      });
    }
  };

  /**
   * Obtener métricas financieras (simuladas)
   * GET /api/dashboard/financial-metrics
   */
  public getFinancialMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Simulación de métricas financieras
      const totalRevenue = 125750.50;
      const totalExpenses = 89320.25;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = (netProfit / totalRevenue) * 100;
      const roi = 15.3;

      const totalBovines = await Bovine.count({ where: { isActive: true } });

      const financialMetrics: FinancialMetrics = {
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin: Math.round(profitMargin * 100) / 100,
          roi
        },
        byCategory: [
          { category: 'Alimentación', amount: 53592.15, percentage: 60, change: 2.5 },
          { category: 'Veterinario', amount: 17864.05, percentage: 20, change: -1.2 },
          { category: 'Mantenimiento', amount: 17864.05, percentage: 20, change: 5.8 }
        ],
        cashFlow: [
          { month: 'Ene', income: 18500, expenses: 12800, netFlow: 5700 },
          { month: 'Feb', income: 19200, expenses: 13200, netFlow: 6000 },
          { month: 'Mar', income: 20100, expenses: 14100, netFlow: 6000 },
          { month: 'Abr', income: 21500, expenses: 15800, netFlow: 5700 },
          { month: 'May', income: 22800, expenses: 16200, netFlow: 6600 },
          { month: 'Jun', income: 23650, expenses: 17220, netFlow: 6430 }
        ],
        costPerAnimal: {
          feed: totalBovines > 0 ? Math.round((totalExpenses * 0.6 / totalBovines) * 100) / 100 : 0,
          medical: totalBovines > 0 ? Math.round((totalExpenses * 0.2 / totalBovines) * 100) / 100 : 0,
          maintenance: totalBovines > 0 ? Math.round((totalExpenses * 0.2 / totalBovines) * 100) / 100 : 0,
          total: totalBovines > 0 ? Math.round((totalExpenses / totalBovines) * 100) / 100 : 0
        }
      };

      res.status(200).json({
        success: true,
        message: 'Métricas financieras obtenidas exitosamente',
        data: {
          financialMetrics,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas financieras:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las métricas financieras'
        }
      });
    }
  };

  /**
   * Obtener métricas geográficas
   * GET /api/dashboard/geographic-metrics
   */
  public getGeographicMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener bovinos con su ubicación
      const bovinesWithLocation = await Bovine.findAll({
        where: { isActive: true },
        attributes: ['id', 'healthStatus', 'location']
      });

      // Agrupar por ubicación
      const locationGroups = new Map();
      
      bovinesWithLocation.forEach((bovine: any) => {
        if (!bovine.location || !bovine.location.latitude || !bovine.location.longitude) {
          return; // Saltar bovinos sin ubicación
        }
        
        const locKey = `${Math.round(bovine.location.latitude * 1000)}_${Math.round(bovine.location.longitude * 1000)}`;
        
        if (!locationGroups.has(locKey)) {
          locationGroups.set(locKey, {
            location: {
              latitude: bovine.location.latitude,
              longitude: bovine.location.longitude,
              address: bovine.location.address,
              section: bovine.location.municipality
            },
            animalCount: 0,
            healthStatus: {
              [HealthStatus.HEALTHY]: 0,
              [HealthStatus.SICK]: 0,
              [HealthStatus.RECOVERING]: 0,
              [HealthStatus.QUARANTINE]: 0,
              [HealthStatus.DECEASED]: 0
            },
            lastActivity: bovine.location.timestamp || new Date(),
            alerts: 0
          });
        }

        const group = locationGroups.get(locKey);
        group.animalCount += 1;
        group.healthStatus[bovine.healthStatus as HealthStatus] += 1;
        
        if (bovine.healthStatus !== HealthStatus.HEALTHY) {
          group.alerts += 1;
        }
      });

      const distribution = Array.from(locationGroups.values());

      // Generar heatmap
      const heatmap = distribution.map((dist: any) => ({
        lat: dist.location.latitude,
        lng: dist.location.longitude,
        intensity: Math.min(dist.animalCount / 10, 1),
        type: 'bovines' as const
      }));

      // Zonas simuladas
      const zones = [
        {
          id: 'zone_north',
          name: 'Potrero Norte',
          area: 50.5,
          capacity: 200,
          currentOccupancy: 185,
          utilizationRate: 92.5
        },
        {
          id: 'zone_south',
          name: 'Potrero Sur',
          area: 42.8,
          capacity: 180,
          currentOccupancy: 165,
          utilizationRate: 91.7
        }
      ];

      const geographicMetrics: GeographicMetrics = {
        distribution,
        heatmap,
        zones
      };

      res.status(200).json({
        success: true,
        message: 'Métricas geográficas obtenidas exitosamente',
        data: {
          geographicMetrics,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener métricas geográficas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las métricas geográficas'
        }
      });
    }
  };

  /**
   * Obtener alertas y notificaciones
   * GET /api/dashboard/alerts
   */
  public getAlertsAndNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const critical: AlertsAndNotifications['critical'] = [];

      // Alertas de salud críticas
      const sickAnimals = await Bovine.findAll({
        where: {
          isActive: true,
          healthStatus: { [Op.in]: [HealthStatus.SICK, HealthStatus.QUARANTINE] }
        },
        limit: 10
      });

      sickAnimals.forEach((animal: any) => {
        critical.push({
          id: `health_${animal.id}`,
          type: 'health',
          title: `Animal enfermo: ${animal.earTag}`,
          description: `${animal.name || animal.earTag} requiere atención médica`,
          severity: animal.healthStatus === HealthStatus.QUARANTINE ? 'urgent' : 'high',
          createdAt: animal.updatedAt,
          bovineId: animal.id,
          location: animal.location?.address,
          actionRequired: true
        });
      });

      // Eventos urgentes próximos
      const urgentEvents = await Event.findAll({
        where: {
          priority: EventPriority.EMERGENCY,
          status: EventStatus.SCHEDULED,
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
          },
          isActive: true
        },
        limit: 5
      });

      urgentEvents.forEach((event: any) => {
        critical.push({
          id: `event_${event.id}`,
          type: 'event',
          title: `Evento urgente: ${event.title}`,
          description: `Programado para ${event.scheduledDate.toLocaleDateString()}`,
          severity: 'urgent',
          createdAt: event.createdAt,
          location: event.location?.address,
          actionRequired: true
        });
      });

      // Ordenar por severidad y fecha
      const severityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      critical.sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const summary = {
        total: critical.length,
        urgent: critical.filter(a => a.severity === 'urgent').length,
        unread: critical.length,
        byType: {
          health: critical.filter(a => a.type === 'health').length,
          vaccination: critical.filter(a => a.type === 'vaccination').length,
          event: critical.filter(a => a.type === 'event').length,
          system: critical.filter(a => a.type === 'system').length
        }
      };

      const alertsAndNotifications: AlertsAndNotifications = {
        critical: critical.slice(0, 20),
        summary
      };

      res.status(200).json({
        success: true,
        message: 'Alertas y notificaciones obtenidas exitosamente',
        data: {
          alertsAndNotifications,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las alertas'
        }
      });
    }
  };

  /**
   * Obtener KPIs de rendimiento
   * GET /api/dashboard/performance-kpis
   */
  public getPerformanceKPIs = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalBovines = await Bovine.count({ where: { isActive: true } });
      
      // KPIs operacionales
      const healthyAnimals = await Bovine.count({ 
        where: { isActive: true, healthStatus: HealthStatus.HEALTHY } 
      });
      const animalWelfare = totalBovines > 0 ? Math.round((healthyAnimals / totalBovines) * 100) : 0;

      const performanceKPIs: PerformanceKPIs = {
        operational: {
          animalWelfare,
          feedEfficiency: 2.8,
          reproductionRate: 85.5,
          averageDailyGain: 0.85,
          mortalityRate: 2.1
        },
        financial: {
          revenuePerAnimal: totalBovines > 0 ? 125750.50 / totalBovines : 0,
          costPerAnimal: totalBovines > 0 ? 89320.25 / totalBovines : 0,
          profitPerAnimal: totalBovines > 0 ? (125750.50 - 89320.25) / totalBovines : 0,
          roi: 15.3,
          breakEvenPoint: 285
        },
        sustainability: {
          carbonFootprint: 1250.5,
          waterUsageEfficiency: 92.3,
          landUseEfficiency: 88.7,
          wasteReductionRate: 15.2
        }
      };

      res.status(200).json({
        success: true,
        message: 'KPIs de rendimiento obtenidos exitosamente',
        data: {
          performanceKPIs,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener KPIs de rendimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener los KPIs de rendimiento'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async getActiveAlertsCount(): Promise<number> {
    let alertCount = 0;

    // Animales enfermos
    const sickAnimals = await Bovine.count({
      where: {
        isActive: true,
        healthStatus: { [Op.in]: [HealthStatus.SICK, HealthStatus.QUARANTINE] }
      }
    });
    alertCount += sickAnimals;

    // Eventos urgentes próximos
    const urgentEvents = await Event.count({
      where: {
        priority: EventPriority.EMERGENCY,
        status: EventStatus.SCHEDULED,
        scheduledDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
        },
        isActive: true
      }
    });
    alertCount += urgentEvents;

    return alertCount;
  }

  private calculateVaccinationPriority(dueDate: Date): string {
    const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'urgent';
    if (daysUntilDue <= 3) return 'high';
    if (daysUntilDue <= 7) return 'medium';
    return 'low';
  }
}