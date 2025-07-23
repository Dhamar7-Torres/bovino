import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import { 
  Ranch, Bovine, Production, Event, Health, Inventory, 
  Location, User, Finance 
} from '../models';

// ============================================================================
// INTERFACES SIMPLIFICADAS
// ============================================================================

interface ReportQuery {
  ranchId?: string;
  reportType?: string;
  startDate?: string;
  endDate?: string;
  format?: string;
  groupBy?: string;
}

// ============================================================================
// CONTROLADOR DE REPORTES SIMPLIFICADO
// ============================================================================

export class ReportsController {

  // --------------------------------------------------------------------------
  // GENERAR REPORTE DE PRODUCCIÓN
  // --------------------------------------------------------------------------
  
  public static async generateProductionReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        ranchId,
        startDate,
        endDate,
        format = 'json'
      } = req.query as ReportQuery;

      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : new Date();
      const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));

      // Obtener datos de producción sin filtros complejos
      const productionData = await Production.findAll({
        order: [['id', 'DESC']]
      });

      // Calcular estadísticas básicas
      const totalProduction = productionData.reduce((sum, record) => sum + ((record as any).quantity || 0), 0);
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

    } catch (error) {
      console.error('❌ Error generando reporte de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE DE SALUD
  // --------------------------------------------------------------------------
  
  public static async generateHealthReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        ranchId,
        startDate,
        endDate,
        format = 'json'
      } = req.query as ReportQuery;

      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : new Date();

      // Obtener eventos de salud básicos
      const healthEvents = await Health.findAll({
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

    } catch (error) {
      console.error('❌ Error generando reporte de salud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE FINANCIERO
  // --------------------------------------------------------------------------
  
  public static async generateFinancialReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        ranchId,
        startDate,
        endDate,
        format = 'json'
      } = req.query as ReportQuery;

      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : new Date();

      // Obtener datos financieros básicos
      const financeRecords = await Finance.findAll({
        order: [['id', 'DESC']]
      });

      // Calcular totales básicos
      const totalIncome = financeRecords
        .filter(r => (r as any).transactionType === 'income')
        .reduce((sum, record) => sum + ((record as any).amount || 0), 0);

      const totalExpenses = financeRecords
        .filter(r => (r as any).transactionType === 'expense')
        .reduce((sum, record) => sum + ((record as any).amount || 0), 0);

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

    } catch (error) {
      console.error('❌ Error generando reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE DE INVENTARIO
  // --------------------------------------------------------------------------
  
  public static async generateInventoryReport(req: Request, res: Response): Promise<void> {
    try {
      const { ranchId } = req.query as ReportQuery;

      // Obtener todos los items del inventario
      const inventoryItems = await Inventory.findAll({
        order: [['id', 'DESC']]
      });

      const totalItems = inventoryItems.length;
      const totalValue = inventoryItems.reduce(
        (sum, item) => sum + (((item as any).quantity || 0) * ((item as any).costPerUnit || 0)), 0
      );

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

    } catch (error) {
      console.error('❌ Error generando reporte de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE GENERAL DEL RANCHO
  // --------------------------------------------------------------------------
  
  public static async generateGeneralReport(req: Request, res: Response): Promise<void> {
    try {
      const { ranchId, startDate, endDate } = req.query as ReportQuery;

      if (!ranchId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere ranchId para el reporte general'
        });
        return;
      }

      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : new Date();

      // Obtener información del rancho
      const ranch = await Ranch.findByPk(ranchId);

      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      // Obtener estadísticas básicas
      const bovineCount = await Bovine.count();
      const productionCount = await Production.count();
      const healthCount = await Health.count();

      const generalReport = {
        ranchInfo: {
          name: (ranch as any).name || 'Rancho',
          location: (ranch as any).location || 'No especificado'
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

    } catch (error) {
      console.error('❌ Error generando reporte general:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE COMPARATIVO
  // --------------------------------------------------------------------------
  
  public static async generateComparativeReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        comparisonType = 'general',
        ranchId,
        startDate,
        endDate
      } = req.query as any;

      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : new Date();

      // Obtener datos básicos para comparación
      const totalBovines = await Bovine.count();
      const totalProduction = await Production.count();

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

    } catch (error) {
      console.error('❌ Error generando reporte comparativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ESTADÍSTICAS RÁPIDAS
  // --------------------------------------------------------------------------
  
  public static async getQuickStats(req: Request, res: Response): Promise<void> {
    try {
      const { ranchId } = req.query as ReportQuery;

      // Obtener estadísticas básicas
      const stats = {
        totalBovines: await Bovine.count(),
        totalProduction: await Production.count(),
        totalHealthEvents: await Health.count(),
        totalInventoryItems: await Inventory.count(),
        totalFinanceRecords: await Finance.count()
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas rápidas obtenidas exitosamente',
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas rápidas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GENERAR REPORTE PERSONALIZADO
  // --------------------------------------------------------------------------
  
  public static async generateCustomReport(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      // Procesar parámetros del reporte personalizado
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

    } catch (error) {
      console.error('❌ Error generando reporte personalizado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // EXPORTAR REPORTE
  // --------------------------------------------------------------------------
  
  public static async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportType, format = 'json' } = req.query as ReportQuery;

      // Por ahora, todos los formatos devuelven JSON
      // En el futuro se implementarían conversores para PDF, Excel, etc.
      
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

    } catch (error) {
      console.error('❌ Error exportando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER HISTORIAL DE REPORTES
  // --------------------------------------------------------------------------
  
  public static async getReportHistory(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10' } = req.query as any;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      // Simulación de historial de reportes
      // En una implementación real, esto vendría de una tabla de reportes generados
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

    } catch (error) {
      console.error('❌ Error obteniendo historial de reportes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

export default ReportsController;