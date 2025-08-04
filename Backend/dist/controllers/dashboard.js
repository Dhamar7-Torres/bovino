"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const sequelize_1 = require("sequelize");
const Bovine_1 = __importStar(require("../models/Bovine"));
const Event_1 = __importStar(require("../models/Event"));
class DashboardController {
    constructor() {
        this.getDashboardOverview = async (req, res) => {
            try {
                const { timeRange = 'monthly' } = req.query;
                const userId = req.user?.id;
                const totalBovines = await Bovine_1.default.count({ where: { isActive: true } });
                const healthyBovines = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.HEALTHY }
                });
                const sickBovines = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        healthStatus: { [sequelize_1.Op.in]: [Bovine_1.HealthStatus.SICK, Bovine_1.HealthStatus.RECOVERING] }
                    }
                });
                const upcomingVaccinations = await Event_1.default.count({
                    where: {
                        eventType: Event_1.EventType.VACCINATION,
                        scheduledDate: {
                            [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
                        },
                        status: Event_1.EventStatus.SCHEDULED,
                        isActive: true
                    }
                });
                const today = new Date();
                const todayStart = new Date(today.setHours(0, 0, 0, 0));
                const todayEnd = new Date(today.setHours(23, 59, 59, 999));
                const todayEvents = await Event_1.default.count({
                    where: {
                        scheduledDate: {
                            [sequelize_1.Op.between]: [todayStart, todayEnd]
                        },
                        status: { [sequelize_1.Op.in]: [Event_1.EventStatus.SCHEDULED, Event_1.EventStatus.IN_PROGRESS] },
                        isActive: true
                    }
                });
                const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const newBovinesThisWeek = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        createdAt: { [sequelize_1.Op.gte]: lastWeek }
                    }
                });
                const weeklyGrowth = totalBovines > 0 ? (newBovinesThisWeek / totalBovines) * 100 : 0;
                const monthlyRevenue = 125750.50;
                const activeAlerts = await this.getActiveAlertsCount();
                const overview = {
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
            }
            catch (error) {
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
        this.getHealthMetrics = async (req, res) => {
            try {
                const { timeRange = 'monthly' } = req.query;
                const totalAnimals = await Bovine_1.default.count({ where: { isActive: true } });
                const healthyCount = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.HEALTHY }
                });
                const sickCount = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.SICK }
                });
                const recoveringCount = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.RECOVERING }
                });
                const quarantineCount = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.QUARANTINE }
                });
                const healthScore = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;
                const cattleTypes = Object.values(Bovine_1.CattleType);
                const byType = await Promise.all(cattleTypes.map(async (type) => {
                    const typeCount = await Bovine_1.default.count({
                        where: { isActive: true, cattleType: type }
                    });
                    const typeHealthy = await Bovine_1.default.count({
                        where: { isActive: true, cattleType: type, healthStatus: Bovine_1.HealthStatus.HEALTHY }
                    });
                    const typeIssues = await Bovine_1.default.count({
                        where: {
                            isActive: true,
                            cattleType: type,
                            healthStatus: {
                                [sequelize_1.Op.in]: [Bovine_1.HealthStatus.SICK, Bovine_1.HealthStatus.RECOVERING, Bovine_1.HealthStatus.QUARANTINE]
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
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const recentDiseaseEvents = await Event_1.default.findAll({
                    where: {
                        eventType: Event_1.EventType.DISEASE,
                        scheduledDate: { [sequelize_1.Op.gte]: monthAgo },
                        isActive: true
                    },
                    limit: 10,
                    order: [['scheduledDate', 'DESC']]
                });
                const recentIllnesses = recentDiseaseEvents.map(event => ({
                    id: event.id,
                    diseaseName: event.title,
                    affectedCount: 1,
                    severity: event.priority,
                    date: event.scheduledDate,
                    status: event.status
                }));
                const currentPeriodDeaths = await Bovine_1.default.count({
                    where: {
                        healthStatus: Bovine_1.HealthStatus.DECEASED,
                        updatedAt: { [sequelize_1.Op.gte]: monthAgo }
                    }
                });
                const previousPeriodDeaths = await Bovine_1.default.count({
                    where: {
                        healthStatus: Bovine_1.HealthStatus.DECEASED,
                        updatedAt: {
                            [sequelize_1.Op.between]: [
                                new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                                monthAgo
                            ]
                        }
                    }
                });
                const currentMortalityRate = totalAnimals > 0 ? (currentPeriodDeaths / totalAnimals) * 100 : 0;
                const previousMortalityRate = totalAnimals > 0 ? (previousPeriodDeaths / totalAnimals) * 100 : 0;
                let trend = 'stable';
                if (currentMortalityRate > previousMortalityRate * 1.1)
                    trend = 'up';
                else if (currentMortalityRate < previousMortalityRate * 0.9)
                    trend = 'down';
                const healthMetrics = {
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
            }
            catch (error) {
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
        this.getVaccinationMetrics = async (req, res) => {
            try {
                const totalBovines = await Bovine_1.default.count({ where: { isActive: true } });
                const upToDateBovines = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        vaccinationStatus: Bovine_1.VaccinationStatus.UP_TO_DATE
                    }
                });
                const overallCoverage = totalBovines > 0 ? Math.round((upToDateBovines / totalBovines) * 100) : 0;
                const vaccinationEvents = await Event_1.default.findAll({
                    where: {
                        eventType: Event_1.EventType.VACCINATION,
                        status: Event_1.EventStatus.COMPLETED,
                        isActive: true
                    },
                    attributes: [
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count'],
                        'title'
                    ],
                    group: ['title'],
                    raw: true
                });
                const byVaccineType = vaccinationEvents.map((vaccine) => ({
                    vaccineType: vaccine.title || 'Sin especificar',
                    coverage: totalBovines > 0 ? Math.round((parseInt(vaccine.count) / totalBovines) * 100) : 0,
                    administered: parseInt(vaccine.count),
                    required: totalBovines
                }));
                const onTimeBovines = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        vaccinationStatus: Bovine_1.VaccinationStatus.UP_TO_DATE
                    }
                });
                const overdueBovines = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        vaccinationStatus: Bovine_1.VaccinationStatus.OVERDUE
                    }
                });
                const pendingBovines = await Bovine_1.default.count({
                    where: {
                        isActive: true,
                        vaccinationStatus: Bovine_1.VaccinationStatus.PENDING
                    }
                });
                const totalScheduled = onTimeBovines + overdueBovines + pendingBovines;
                const complianceRate = totalScheduled > 0 ? Math.round((onTimeBovines / totalScheduled) * 100) : 0;
                const upcomingVaccinationEvents = await Event_1.default.findAll({
                    where: {
                        eventType: Event_1.EventType.VACCINATION,
                        scheduledDate: {
                            [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
                        },
                        status: Event_1.EventStatus.SCHEDULED,
                        isActive: true
                    },
                    order: [['scheduledDate', 'ASC']],
                    limit: 20
                });
                const upcoming = await Promise.all(upcomingVaccinationEvents.map(async (event) => {
                    const bovine = await Bovine_1.default.findByPk(event.bovineId, {
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
                }));
                const trends = [];
                for (let i = 5; i >= 0; i--) {
                    const periodStart = new Date();
                    periodStart.setMonth(periodStart.getMonth() - i);
                    periodStart.setDate(1);
                    const periodEnd = new Date(periodStart);
                    periodEnd.setMonth(periodEnd.getMonth() + 1);
                    periodEnd.setDate(0);
                    const administered = await Event_1.default.count({
                        where: {
                            eventType: Event_1.EventType.VACCINATION,
                            status: Event_1.EventStatus.COMPLETED,
                            scheduledDate: { [sequelize_1.Op.between]: [periodStart, periodEnd] },
                            isActive: true
                        }
                    });
                    const target = Math.round(totalBovines * 0.2);
                    const compliance = target > 0 ? Math.round((administered / target) * 100) : 0;
                    trends.push({
                        month: periodStart.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
                        administered,
                        target,
                        compliance
                    });
                }
                const vaccinationMetrics = {
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
            }
            catch (error) {
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
        this.getProductionMetrics = async (req, res) => {
            try {
                const totalProduction = 15750.5;
                const dailyAverage = 525.0;
                const weeklyGrowth = 3.2;
                const monthlyTarget = 18000;
                const efficiency = Math.round((totalProduction / monthlyTarget) * 100);
                const productionMetrics = {
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
            }
            catch (error) {
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
        this.getFinancialMetrics = async (req, res) => {
            try {
                const totalRevenue = 125750.50;
                const totalExpenses = 89320.25;
                const netProfit = totalRevenue - totalExpenses;
                const profitMargin = (netProfit / totalRevenue) * 100;
                const roi = 15.3;
                const totalBovines = await Bovine_1.default.count({ where: { isActive: true } });
                const financialMetrics = {
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
            }
            catch (error) {
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
        this.getGeographicMetrics = async (req, res) => {
            try {
                const bovinesWithLocation = await Bovine_1.default.findAll({
                    where: { isActive: true },
                    attributes: ['id', 'healthStatus', 'location']
                });
                const locationGroups = new Map();
                bovinesWithLocation.forEach((bovine) => {
                    if (!bovine.location || !bovine.location.latitude || !bovine.location.longitude) {
                        return;
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
                                [Bovine_1.HealthStatus.HEALTHY]: 0,
                                [Bovine_1.HealthStatus.SICK]: 0,
                                [Bovine_1.HealthStatus.RECOVERING]: 0,
                                [Bovine_1.HealthStatus.QUARANTINE]: 0,
                                [Bovine_1.HealthStatus.DECEASED]: 0
                            },
                            lastActivity: bovine.location.timestamp || new Date(),
                            alerts: 0
                        });
                    }
                    const group = locationGroups.get(locKey);
                    group.animalCount += 1;
                    group.healthStatus[bovine.healthStatus] += 1;
                    if (bovine.healthStatus !== Bovine_1.HealthStatus.HEALTHY) {
                        group.alerts += 1;
                    }
                });
                const distribution = Array.from(locationGroups.values());
                const heatmap = distribution.map((dist) => ({
                    lat: dist.location.latitude,
                    lng: dist.location.longitude,
                    intensity: Math.min(dist.animalCount / 10, 1),
                    type: 'bovines'
                }));
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
                const geographicMetrics = {
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
            }
            catch (error) {
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
        this.getAlertsAndNotifications = async (req, res) => {
            try {
                const critical = [];
                const sickAnimals = await Bovine_1.default.findAll({
                    where: {
                        isActive: true,
                        healthStatus: { [sequelize_1.Op.in]: [Bovine_1.HealthStatus.SICK, Bovine_1.HealthStatus.QUARANTINE] }
                    },
                    limit: 10
                });
                sickAnimals.forEach((animal) => {
                    critical.push({
                        id: `health_${animal.id}`,
                        type: 'health',
                        title: `Animal enfermo: ${animal.earTag}`,
                        description: `${animal.name || animal.earTag} requiere atención médica`,
                        severity: animal.healthStatus === Bovine_1.HealthStatus.QUARANTINE ? 'urgent' : 'high',
                        createdAt: animal.updatedAt,
                        bovineId: animal.id,
                        location: animal.location?.address,
                        actionRequired: true
                    });
                });
                const urgentEvents = await Event_1.default.findAll({
                    where: {
                        priority: Event_1.EventPriority.EMERGENCY,
                        status: Event_1.EventStatus.SCHEDULED,
                        scheduledDate: {
                            [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
                        },
                        isActive: true
                    },
                    limit: 5
                });
                urgentEvents.forEach((event) => {
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
                const severityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                critical.sort((a, b) => {
                    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                    if (severityDiff !== 0)
                        return severityDiff;
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
                const alertsAndNotifications = {
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
            }
            catch (error) {
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
        this.getPerformanceKPIs = async (req, res) => {
            try {
                const totalBovines = await Bovine_1.default.count({ where: { isActive: true } });
                const healthyAnimals = await Bovine_1.default.count({
                    where: { isActive: true, healthStatus: Bovine_1.HealthStatus.HEALTHY }
                });
                const animalWelfare = totalBovines > 0 ? Math.round((healthyAnimals / totalBovines) * 100) : 0;
                const performanceKPIs = {
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
            }
            catch (error) {
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
    }
    async getActiveAlertsCount() {
        let alertCount = 0;
        const sickAnimals = await Bovine_1.default.count({
            where: {
                isActive: true,
                healthStatus: { [sequelize_1.Op.in]: [Bovine_1.HealthStatus.SICK, Bovine_1.HealthStatus.QUARANTINE] }
            }
        });
        alertCount += sickAnimals;
        const urgentEvents = await Event_1.default.count({
            where: {
                priority: Event_1.EventPriority.EMERGENCY,
                status: Event_1.EventStatus.SCHEDULED,
                scheduledDate: {
                    [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]
                },
                isActive: true
            }
        });
        alertCount += urgentEvents;
        return alertCount;
    }
    calculateVaccinationPriority(dueDate) {
        const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0)
            return 'urgent';
        if (daysUntilDue <= 3)
            return 'high';
        if (daysUntilDue <= 7)
            return 'medium';
        return 'low';
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.js.map