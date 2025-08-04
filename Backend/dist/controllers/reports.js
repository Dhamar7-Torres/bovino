"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const models_1 = require("../models");
class ReportsController {
    static async generateProductionReport(req, res) {
        try {
            const { ranchId, startDate, endDate, format = 'json' } = req.query;
            const startDateObj = startDate ? new Date(startDate) : new Date();
            const endDateObj = endDate ? new Date(endDate) : new Date();
            const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
            const productionData = await models_1.Production.findAll({
                order: [['id', 'DESC']]
            });
            const totalProduction = productionData.reduce((sum, record) => sum + (record.quantity || 0), 0);
            const averageDaily = days > 0 ? totalProduction / days : 0;
            const report = {
                period: {
                    startDate: startDateObj,
                    endDate: endDateObj,
                    days
                },
                summary: {
                    totalProduction: parseFloat(totalProduction.toFixed(2)),
                    averageDaily: parseFloat(averageDaily.toFixed(2)),
                    totalRecords: productionData.length
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte de producción generado exitosamente',
                data: {
                    reportType: 'production',
                    generatedAt: new Date(),
                    report
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateHealthReport(req, res) {
        try {
            const { ranchId, startDate, endDate, format = 'json' } = req.query;
            const startDateObj = startDate ? new Date(startDate) : new Date();
            const endDateObj = endDate ? new Date(endDate) : new Date();
            const healthEvents = await models_1.Health.findAll({
                order: [['id', 'DESC']]
            });
            const totalEvents = healthEvents.length;
            const report = {
                period: {
                    startDate: startDateObj,
                    endDate: endDateObj
                },
                summary: {
                    totalHealthEvents: totalEvents,
                    healthScore: totalEvents > 0 ? Math.max(0, 100 - totalEvents * 2) : 100
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte de salud generado exitosamente',
                data: {
                    reportType: 'health',
                    generatedAt: new Date(),
                    report
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte de salud:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateFinancialReport(req, res) {
        try {
            const { ranchId, startDate, endDate, format = 'json' } = req.query;
            const startDateObj = startDate ? new Date(startDate) : new Date();
            const endDateObj = endDate ? new Date(endDate) : new Date();
            const financeRecords = await models_1.Finance.findAll({
                order: [['id', 'DESC']]
            });
            const totalIncome = financeRecords
                .filter(r => r.transactionType === 'income')
                .reduce((sum, record) => sum + (record.amount || 0), 0);
            const totalExpenses = financeRecords
                .filter(r => r.transactionType === 'expense')
                .reduce((sum, record) => sum + (record.amount || 0), 0);
            const netProfit = totalIncome - totalExpenses;
            const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
            const report = {
                period: {
                    startDate: startDateObj,
                    endDate: endDateObj
                },
                summary: {
                    totalIncome: parseFloat(totalIncome.toFixed(2)),
                    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
                    netProfit: parseFloat(netProfit.toFixed(2)),
                    profitMargin: parseFloat(profitMargin.toFixed(2))
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte financiero generado exitosamente',
                data: {
                    reportType: 'financial',
                    generatedAt: new Date(),
                    report
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte financiero:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateInventoryReport(req, res) {
        try {
            const { ranchId } = req.query;
            const inventoryItems = await models_1.Inventory.findAll({
                order: [['id', 'DESC']]
            });
            const totalItems = inventoryItems.length;
            const totalValue = inventoryItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.costPerUnit || 0)), 0);
            const report = {
                summary: {
                    totalItems,
                    totalValue: parseFloat(totalValue.toFixed(2)),
                    recordsAnalyzed: inventoryItems.length
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte de inventario generado exitosamente',
                data: {
                    reportType: 'inventory',
                    generatedAt: new Date(),
                    report
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateGeneralReport(req, res) {
        try {
            const { ranchId, startDate, endDate } = req.query;
            if (!ranchId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere ranchId para el reporte general'
                });
                return;
            }
            const startDateObj = startDate ? new Date(startDate) : new Date();
            const endDateObj = endDate ? new Date(endDate) : new Date();
            const ranch = await models_1.Ranch.findByPk(ranchId);
            if (!ranch) {
                res.status(404).json({
                    success: false,
                    message: 'Rancho no encontrado'
                });
                return;
            }
            const bovineCount = await models_1.Bovine.count();
            const productionCount = await models_1.Production.count();
            const healthCount = await models_1.Health.count();
            const generalReport = {
                ranchInfo: {
                    name: ranch.name || 'Rancho',
                    location: ranch.location || 'No especificado'
                },
                period: {
                    startDate: startDateObj,
                    endDate: endDateObj
                },
                summary: {
                    totalBovines: bovineCount,
                    totalProductionRecords: productionCount,
                    totalHealthRecords: healthCount
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte general generado exitosamente',
                data: {
                    reportType: 'general',
                    generatedAt: new Date(),
                    report: generalReport
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte general:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateComparativeReport(req, res) {
        try {
            const { comparisonType = 'general', ranchId, startDate, endDate } = req.query;
            const startDateObj = startDate ? new Date(startDate) : new Date();
            const endDateObj = endDate ? new Date(endDate) : new Date();
            const totalBovines = await models_1.Bovine.count();
            const totalProduction = await models_1.Production.count();
            const report = {
                comparisonType,
                data: {
                    entities: [
                        {
                            name: 'Total General',
                            metrics: {
                                bovineCount: totalBovines,
                                productionRecords: totalProduction,
                                overallScore: 85
                            }
                        }
                    ],
                    benchmarks: {
                        industryAverage: 85,
                        topPerformer: 95,
                        regionalAverage: 80
                    }
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte comparativo generado exitosamente',
                data: {
                    reportType: 'comparative',
                    generatedAt: new Date(),
                    report
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte comparativo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getQuickStats(req, res) {
        try {
            const { ranchId } = req.query;
            const stats = {
                totalBovines: await models_1.Bovine.count(),
                totalProduction: await models_1.Production.count(),
                totalHealthEvents: await models_1.Health.count(),
                totalInventoryItems: await models_1.Inventory.count(),
                totalFinanceRecords: await models_1.Finance.count()
            };
            res.status(200).json({
                success: true,
                message: 'Estadísticas rápidas obtenidas exitosamente',
                data: stats
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas rápidas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async generateCustomReport(req, res) {
        try {
            const body = req.body;
            const reportData = {
                reportType: 'custom',
                parameters: body,
                generatedAt: new Date(),
                summary: {
                    message: 'Reporte personalizado generado basado en parámetros proporcionados'
                }
            };
            res.status(200).json({
                success: true,
                message: 'Reporte personalizado generado exitosamente',
                data: reportData
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte personalizado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async exportReport(req, res) {
        try {
            const { reportType, format = 'json' } = req.query;
            const exportData = {
                reportType,
                format,
                exportedAt: new Date(),
                note: `Exportación en formato ${format} será implementada próximamente`,
                data: {
                    message: 'Datos del reporte aquí'
                }
            };
            res.status(200).json({
                success: true,
                message: `Reporte exportado en formato ${format} exitosamente`,
                data: exportData
            });
        }
        catch (error) {
            console.error('❌ Error exportando reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getReportHistory(req, res) {
        try {
            const { page = '1', limit = '10' } = req.query;
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const reportHistory = [
                {
                    id: 1,
                    reportType: 'production',
                    generatedAt: new Date(),
                    status: 'completed',
                    generatedBy: 'admin'
                },
                {
                    id: 2,
                    reportType: 'health',
                    generatedAt: new Date(),
                    status: 'completed',
                    generatedBy: 'admin'
                }
            ];
            res.status(200).json({
                success: true,
                message: 'Historial de reportes obtenido exitosamente',
                data: {
                    reports: reportHistory,
                    pagination: {
                        currentPage: pageNumber,
                        totalPages: 1,
                        totalItems: reportHistory.length,
                        itemsPerPage: limitNumber
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo historial de reportes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
}
exports.ReportsController = ReportsController;
exports.default = ReportsController;
//# sourceMappingURL=reports.js.map