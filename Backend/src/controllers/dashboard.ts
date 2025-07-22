import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/database';
import { 
  Bovine, 
  Vaccination, 
  Illness, 
  Event, 
  Location, 
  Production, 
  Finance, 
  VaccinationSchedule,
  User
} from '../models';
import { DashboardService } from '../services/dashboard';

// Tipos para el dashboard
type HealthStatus = 'HEALTHY' | 'SICK' | 'RECOVERING' | 'QUARANTINE' | 'DECEASED';
type BovineType = 'CATTLE' | 'BULL' | 'COW' | 'CALF';
type EventType = 'vaccination' | 'breeding' | 'health' | 'feeding' | 'veterinary' | 'emergency';
type ProductionType = 'MILK' | 'MEAT' | 'BREEDING';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

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
    type: BovineType;
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
      address: string;
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

interface TrendsAnalysis {
  bovineGrowth: Array<{
    period: string;
    additions: number;
    removals: number;
    netGrowth: number;
  }>;
  healthTrends: Array<{
    period: string;
    healthScore: number;
    illnessRate: number;
    mortalityRate: number;
  }>;
  vaccinationTrends: Array<{
    period: string;
    administered: number;
    coverage: number;
    compliance: number;
  }>;
  productionTrends: Array<{
    period: string;
    milk: number;
    meat: number;
    breeding: number;
    efficiency: number;
  }>;
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
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Obtener resumen general del dashboard
   * GET /api/dashboard/overview
   */
  public getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange = 'monthly' }: { timeRange?: TimeRange } = req.query;
      const userId = (req as any).user?.id;

      // Estadísticas básicas
      const totalBovines = await Bovine.count({ where: { isActive: true } });
      const healthyBovines = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'HEALTHY' } 
      });
      const sickBovines = await Bovine.count({ 
        where: { isActive: true, healthStatus: { [Op.in]: ['SICK', 'RECOVERING'] } } 
      });

      // Vacunaciones próximas (próximos 7 días)
      const upcomingVaccinations = await VaccinationSchedule.count({
        where: {
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: 'scheduled'
        }
      });

      // Eventos de hoy
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = await Event.count({
        where: {
          startDate: today,
          status: { [Op.in]: ['scheduled', 'in_progress'] }
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
      const weeklyGrowth = (newBovinesThisWeek / totalBovines) * 100;

      // Ingresos mensuales
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const monthlyRevenue = await Finance.sum('amount', {
        where: {
          type: 'income',
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      // Alertas activas
      const activeAlerts = await this.getActiveAlertsCount();

      const overview: DashboardOverview = {
        totalBovines,
        healthyBovines,
        sickBovines,
        upcomingVaccinations,
        todayEvents,
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
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
          general: 'Ocurrió un error al obtener el resumen del dashboard'
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
      const { timeRange = 'monthly' }: { timeRange?: TimeRange } = req.query;

      // Métricas generales
      const totalAnimals = await Bovine.count({ where: { isActive: true } });
      const healthyCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'HEALTHY' } 
      });
      const sickCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'SICK' } 
      });
      const recoveringCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'RECOVERING' } 
      });
      const quarantineCount = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'QUARANTINE' } 
      });

      const healthScore = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;

      // Métricas por tipo
      const bovineTypes = ['CATTLE', 'BULL', 'COW', 'CALF'];
      const byType = await Promise.all(bovineTypes.map(async (type) => {
        const typeCount = await Bovine.count({ 
          where: { isActive: true, type: type as BovineType } 
        });
        const typeHealthy = await Bovine.count({ 
          where: { isActive: true, type: type as BovineType, healthStatus: 'HEALTHY' } 
        });
        const typeIssues = await Bovine.count({ 
          where: { 
            isActive: true, 
            type: type as BovineType, 
            healthStatus: { [Op.in]: ['SICK', 'RECOVERING', 'QUARANTINE'] } 
          } 
        });

        return {
          type: type as BovineType,
          count: typeCount,
          healthyPercentage: typeCount > 0 ? Math.round((typeHealthy / typeCount) * 100) : 0,
          issues: typeIssues
        };
      }));

      // Enfermedades recientes (último mes)
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentIllnesses = await Illness.findAll({
        where: {
          diagnosisDate: { [Op.gte]: monthAgo }
        },
        attributes: [
          'diseaseName',
          'severity',
          [fn('COUNT', col('diseaseName')), 'affectedCount'],
          [fn('MAX', col('diagnosisDate')), 'lastOccurrence']
        ],
        group: ['diseaseName', 'severity'],
        order: [[fn('COUNT', col('diseaseName')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Tasa de mortalidad
      const currentPeriodDeaths = await Bovine.count({
        where: {
          healthStatus: 'DECEASED',
          updatedAt: { [Op.gte]: monthAgo }
        }
      });
      const previousPeriodDeaths = await Bovine.count({
        where: {
          healthStatus: 'DECEASED',
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
        recentIllnesses: recentIllnesses.map((illness: any) => ({
          id: `illness_${illness.diseaseName}`,
          diseaseName: illness.diseaseName,
          affectedCount: parseInt(illness.affectedCount),
          severity: illness.severity,
          date: illness.lastOccurrence,
          status: 'active'
        })),
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
          general: 'Ocurrió un error al obtener las métricas de salud'
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

      // Cobertura general
      const vaccinatedBovines = await Bovine.count({
        where: { isActive: true },
        include: [{
          model: Vaccination,
          as: 'vaccinations',
          required: true
        }],
        distinct: true
      });

      const overallCoverage = totalBovines > 0 ? Math.round((vaccinatedBovines / totalBovines) * 100) : 0;

      // Cobertura por tipo de vacuna
      const vaccineTypes = await Vaccination.findAll({
        attributes: [
          'vaccineType',
          [fn('COUNT', fn('DISTINCT', col('bovineId'))), 'administered'],
        ],
        group: ['vaccineType'],
        raw: true
      });

      const byVaccineType = vaccineTypes.map((vaccine: any) => ({
        vaccineType: vaccine.vaccineType,
        coverage: Math.round((vaccine.administered / totalBovines) * 100),
        administered: parseInt(vaccine.administered),
        required: totalBovines
      }));

      // Compliance de programación
      const onTimeVaccinations = await VaccinationSchedule.count({
        where: {
          status: 'completed',
          scheduledDate: { [Op.gte]: col('completedDate') }
        }
      });

      const lateVaccinations = await VaccinationSchedule.count({
        where: {
          status: 'completed',
          scheduledDate: { [Op.lt]: col('completedDate') }
        }
      });

      const missedVaccinations = await VaccinationSchedule.count({
        where: {
          status: 'overdue'
        }
      });

      const totalScheduled = onTimeVaccinations + lateVaccinations + missedVaccinations;
      const complianceRate = totalScheduled > 0 ? Math.round((onTimeVaccinations / totalScheduled) * 100) : 0;

      // Próximas vacunaciones
      const upcoming = await VaccinationSchedule.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          },
          status: 'scheduled'
        },
        include: [{
          model: Bovine,
          as: 'bovine',
          attributes: ['earTag', 'name']
        }],
        order: [['scheduledDate', 'ASC']],
        limit: 20
      });

      // Tendencias mensuales (últimos 6 meses)
      const monthsAgo = 6;
      const trends = [];
      
      for (let i = monthsAgo; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);

        const administered = await Vaccination.count({
          where: {
            applicationDate: { [Op.between]: [periodStart, periodEnd] }
          }
        });

        trends.push({
          month: periodStart.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
          administered,
          target: Math.round(totalBovines * 0.2), // Asumiendo 20% mensual como objetivo
          compliance: totalBovines > 0 ? Math.round((administered / (totalBovines * 0.2)) * 100) : 0
        });
      }

      const vaccinationMetrics: VaccinationMetrics = {
        coverage: {
          overall: overallCoverage,
          byVaccineType
        },
        compliance: {
          onTime: onTimeVaccinations,
          late: lateVaccinations,
          missed: missedVaccinations,
          rate: complianceRate
        },
        upcoming: upcoming.map((schedule: any) => ({
          bovineId: schedule.bovineId,
          earTag: schedule.bovine?.earTag || schedule.bovineTag,
          vaccineName: schedule.vaccineName,
          dueDate: schedule.scheduledDate,
          priority: this.calculateVaccinationPriority(schedule.scheduledDate),
          daysPastDue: schedule.status === 'overdue' ? 
            Math.floor((new Date().getTime() - schedule.scheduledDate.getTime()) / (1000 * 60 * 60 * 24)) : 
            undefined
        })),
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
          general: 'Ocurrió un error al obtener las métricas de vacunación'
        }
      });
    }
  };

  /**
   * Obtener métricas de producción
   * GET /api/dashboard/production-metrics
   */
  public getProductionMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      // Simulación de métricas de producción (expandir con modelo Production real)
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Producción total del mes (placeholder)
      const totalProduction = 15750.5; // litros de leche
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const dailyAverage = totalProduction / currentMonth.getDate();
      
      // Crecimiento semanal (placeholder)
      const weeklyGrowth = 3.2; // porcentaje
      
      // Meta mensual
      const monthlyTarget = 18000; // litros
      
      // Eficiencia
      const efficiency = Math.round((totalProduction / monthlyTarget) * 100);

      const productionMetrics: ProductionMetrics = {
        summary: {
          totalProduction: Math.round(totalProduction * 100) / 100,
          dailyAverage: Math.round(dailyAverage * 100) / 100,
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
            bovineId: '1',
            earTag: 'COW001',
            name: 'Luna',
            production: 28.5,
            efficiency: 98.2
          },
          {
            bovineId: '2',
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
          general: 'Ocurrió un error al obtener las métricas de producción'
        }
      });
    }
  };

  /**
   * Obtener métricas financieras
   * GET /api/dashboard/financial-metrics
   */
  public getFinancialMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Ingresos del mes
      const totalRevenue = await Finance.sum('amount', {
        where: {
          type: 'income',
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      // Gastos del mes
      const totalExpenses = await Finance.sum('amount', {
        where: {
          type: 'expense',
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const roi = 15.3; // Placeholder - calcular basado en inversiones

      // Gastos por categoría
      const expenseCategories = await Finance.findAll({
        where: {
          type: 'expense',
          date: { [Op.between]: [monthStart, monthEnd] }
        },
        attributes: [
          'category',
          [fn('SUM', col('amount')), 'total']
        ],
        group: ['category'],
        raw: true
      });

      const byCategory = expenseCategories.map((cat: any) => ({
        category: cat.category,
        amount: parseFloat(cat.total),
        percentage: totalExpenses > 0 ? Math.round((parseFloat(cat.total) / totalExpenses) * 100) : 0,
        change: 0 // Placeholder - calcular cambio vs período anterior
      }));

      // Flujo de caja (últimos 6 meses)
      const cashFlow = [];
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - i);
        periodStart.setDate(1);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);

        const income = await Finance.sum('amount', {
          where: {
            type: 'income',
            date: { [Op.between]: [periodStart, periodEnd] }
          }
        }) || 0;

        const expenses = await Finance.sum('amount', {
          where: {
            type: 'expense',
            date: { [Op.between]: [periodStart, periodEnd] }
          }
        }) || 0;

        cashFlow.push({
          month: periodStart.toLocaleString('es-ES', { month: 'short' }),
          income: Math.round(income * 100) / 100,
          expenses: Math.round(expenses * 100) / 100,
          netFlow: Math.round((income - expenses) * 100) / 100
        });
      }

      // Costo por animal
      const totalBovines = await Bovine.count({ where: { isActive: true } });
      const feedCost = totalExpenses * 0.6; // Estimación: 60% del gasto es alimentación
      const medicalCost = totalExpenses * 0.2; // 20% gastos médicos
      const maintenanceCost = totalExpenses * 0.2; // 20% mantenimiento

      const financialMetrics: FinancialMetrics = {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          profitMargin: Math.round(profitMargin * 100) / 100,
          roi: Math.round(roi * 100) / 100
        },
        byCategory,
        cashFlow,
        costPerAnimal: {
          feed: totalBovines > 0 ? Math.round((feedCost / totalBovines) * 100) / 100 : 0,
          medical: totalBovines > 0 ? Math.round((medicalCost / totalBovines) * 100) / 100 : 0,
          maintenance: totalBovines > 0 ? Math.round((maintenanceCost / totalBovines) * 100) / 100 : 0,
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
          general: 'Ocurrió un error al obtener las métricas financieras'
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
      // Distribución por ubicación
      const bovinesWithLocation = await Bovine.findAll({
        where: { isActive: true },
        include: [{
          model: Location,
          as: 'location',
          required: true
        }],
        attributes: ['id', 'healthStatus']
      });

      // Agrupar por ubicación
      const locationGroups = new Map();
      
      bovinesWithLocation.forEach((bovine: any) => {
        const locKey = `${bovine.location.latitude}_${bovine.location.longitude}`;
        
        if (!locationGroups.has(locKey)) {
          locationGroups.set(locKey, {
            location: {
              latitude: bovine.location.latitude,
              longitude: bovine.location.longitude,
              address: bovine.location.address,
              section: bovine.location.section
            },
            animalCount: 0,
            healthStatus: {
              HEALTHY: 0,
              SICK: 0,
              RECOVERING: 0,
              QUARANTINE: 0,
              DECEASED: 0
            },
            lastActivity: bovine.location.timestamp,
            alerts: 0
          });
        }

        const group = locationGroups.get(locKey);
        group.animalCount += 1;
        group.healthStatus[bovine.healthStatus as HealthStatus] += 1;
        
        if (bovine.healthStatus !== 'HEALTHY') {
          group.alerts += 1;
        }
      });

      const distribution = Array.from(locationGroups.values());

      // Generar heatmap para diferentes tipos de datos
      const heatmap = [];
      
      // Densidad de bovinos
      distribution.forEach((dist: any) => {
        heatmap.push({
          lat: dist.location.latitude,
          lng: dist.location.longitude,
          intensity: Math.min(dist.animalCount / 10, 1), // Normalizar a 0-1
          type: 'bovines' as const
        });
      });

      // Zonas del rancho (simuladas)
      const zones = [
        {
          id: 'zone_north',
          name: 'Potrero Norte',
          area: 50.5, // hectáreas
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
        },
        {
          id: 'zone_east',
          name: 'Área de Reproducción',
          area: 25.3,
          capacity: 80,
          currentOccupancy: 72,
          utilizationRate: 90.0
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
          general: 'Ocurrió un error al obtener las métricas geográficas'
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
          healthStatus: { [Op.in]: ['SICK', 'QUARANTINE'] }
        },
        include: [{
          model: Location,
          as: 'location'
        }],
        limit: 10
      });

      sickAnimals.forEach((animal: any) => {
        critical.push({
          id: `health_${animal.id}`,
          type: 'health',
          title: `Animal enfermo: ${animal.earTag}`,
          description: `${animal.name || animal.earTag} requiere atención médica`,
          severity: animal.healthStatus === 'QUARANTINE' ? 'urgent' : 'high',
          createdAt: animal.updatedAt,
          bovineId: animal.id,
          location: animal.location?.address,
          actionRequired: true
        });
      });

      // Vacunaciones vencidas
      const overdueVaccinations = await VaccinationSchedule.findAll({
        where: {
          status: 'overdue',
          scheduledDate: { [Op.lt]: new Date() }
        },
        include: [{
          model: Bovine,
          as: 'bovine'
        }],
        limit: 10
      });

      overdueVaccinations.forEach((schedule: any) => {
        const daysPastDue = Math.floor((new Date().getTime() - schedule.scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
        
        critical.push({
          id: `vaccination_${schedule.id}`,
          type: 'vaccination',
          title: `Vacunación vencida: ${schedule.bovine?.earTag}`,
          description: `${schedule.vaccineName} - ${daysPastDue} días de retraso`,
          severity: daysPastDue > 7 ? 'urgent' : 'high',
          createdAt: schedule.scheduledDate,
          bovineId: schedule.bovineId,
          actionRequired: true
        });
      });

      // Eventos próximos urgentes
      const urgentEvents = await Event.findAll({
        where: {
          priority: 'urgent',
          status: 'scheduled',
          startDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
          }
        },
        include: [{
          model: Location,
          as: 'location'
        }],
        limit: 5
      });

      urgentEvents.forEach((event: any) => {
        critical.push({
          id: `event_${event.id}`,
          type: 'event',
          title: `Evento urgente: ${event.title}`,
          description: `Programado para ${event.startDate.toLocaleDateString()} a las ${event.startTime}`,
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

      // Resumen de alertas
      const summary = {
        total: critical.length,
        urgent: critical.filter(a => a.severity === 'urgent').length,
        unread: critical.length, // Placeholder - implementar sistema de lectura
        byType: {
          health: critical.filter(a => a.type === 'health').length,
          vaccination: critical.filter(a => a.type === 'vaccination').length,
          event: critical.filter(a => a.type === 'event').length,
          system: critical.filter(a => a.type === 'system').length
        }
      };

      const alertsAndNotifications: AlertsAndNotifications = {
        critical: critical.slice(0, 20), // Limitar a 20 alertas críticas
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
          general: 'Ocurrió un error al obtener las alertas'
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
      
      // KPIs operacionales (simulados - expandir con datos reales)
      const healthyAnimals = await Bovine.count({ 
        where: { isActive: true, healthStatus: 'HEALTHY' } 
      });
      const animalWelfare = totalBovines > 0 ? Math.round((healthyAnimals / totalBovines) * 100) : 0;

      // KPIs financieros
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const totalRevenue = await Finance.sum('amount', {
        where: {
          type: 'income',
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const totalExpenses = await Finance.sum('amount', {
        where: {
          type: 'expense',
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const revenuePerAnimal = totalBovines > 0 ? totalRevenue / totalBovines : 0;
      const costPerAnimal = totalBovines > 0 ? totalExpenses / totalBovines : 0;
      const profitPerAnimal = revenuePerAnimal - costPerAnimal;
      const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

      const performanceKPIs: PerformanceKPIs = {
        operational: {
          animalWelfare,
          feedEfficiency: 2.8, // kg production per kg feed
          reproductionRate: 85.5, // %
          averageDailyGain: 0.85, // kg/day
          mortalityRate: 2.1 // %
        },
        financial: {
          revenuePerAnimal: Math.round(revenuePerAnimal * 100) / 100,
          costPerAnimal: Math.round(costPerAnimal * 100) / 100,
          profitPerAnimal: Math.round(profitPerAnimal * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          breakEvenPoint: 285 // días
        },
        sustainability: {
          carbonFootprint: 1250.5, // kg CO2 equivalent
          waterUsageEfficiency: 92.3,
          landUseEfficiency: 88.7,
          wasteReductionRate: 15.2 // %
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
          general: 'Ocurrió un error al obtener los KPIs de rendimiento'
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
        healthStatus: { [Op.in]: ['SICK', 'QUARANTINE'] }
      }
    });
    alertCount += sickAnimals;

    // Vacunaciones vencidas
    const overdueVaccinations = await VaccinationSchedule.count({
      where: {
        status: 'overdue'
      }
    });
    alertCount += overdueVaccinations;

    // Eventos urgentes próximos
    const urgentEvents = await Event.count({
      where: {
        priority: 'urgent',
        status: 'scheduled',
        startDate: {
          [Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
        }
      }
    });
    alertCount += urgentEvents;

    return alertCount;
  }

  private calculateVaccinationPriority(dueDate: Date): string {
    const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'urgent'; // Vencida
    if (daysUntilDue <= 3) return 'high';
    if (daysUntilDue <= 7) return 'medium';
    return 'low';
  }
}