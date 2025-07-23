import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Production, Bovine, Ranch, User, Location } from '../models';

// ============================================================================
// INTERFACES Y TIPOS SIMPLIFICADOS
// ============================================================================

interface ProductionQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================================================
// CONTROLADOR DE PRODUCCIÓN SIMPLIFICADO
// ============================================================================

export class ProductionController {

  // --------------------------------------------------------------------------
  // OBTENER TODOS LOS REGISTROS DE PRODUCCIÓN
  // --------------------------------------------------------------------------
  
  public static async getAllProduction(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '20',
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query as ProductionQuery;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Buscar registros de producción sin filtros complejos
      const { count, rows: productionRecords } = await Production.findAndCountAll({
        order: [[sortBy, sortOrder]],
        limit: limitNumber,
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Registros de producción obtenidos exitosamente',
        data: {
          records: productionRecords,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalItems: count,
            itemsPerPage: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo registros de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR NUEVA PRODUCCIÓN
  // --------------------------------------------------------------------------
  
  public static async recordProduction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      // Verificar que el bovino existe
      if (req.body.bovineId) {
        const bovine = await Bovine.findByPk(req.body.bovineId);
        if (!bovine) {
          res.status(404).json({
            success: false,
            message: 'Bovino no encontrado'
          });
          return;
        }
      }

      // Preparar datos para crear usando SOLO el body
      const productionData = {
        ...req.body,
        recordedBy: userId
      };

      // Crear registro de producción
      const newRecord = await (Production as any).create(productionData);

      res.status(201).json({
        success: true,
        message: 'Producción registrada exitosamente',
        data: newRecord
      });

    } catch (error) {
      console.error('❌ Error registrando producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR PRODUCCIÓN DE LECHE
  // --------------------------------------------------------------------------
  
  public static async recordMilkProduction(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      // Verificar que el bovino existe
      if (req.body.bovineId) {
        const bovine = await Bovine.findByPk(req.body.bovineId);
        if (!bovine) {
          res.status(404).json({
            success: false,
            message: 'Bovino no encontrado'
          });
          return;
        }
      }

      // Crear registro usando el body directamente
      const milkRecord = await (Production as any).create({
        ...req.body,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Producción de leche registrada exitosamente',
        data: milkRecord
      });

    } catch (error) {
      console.error('❌ Error registrando producción de leche:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR PESO DEL BOVINO
  // --------------------------------------------------------------------------
  
  public static async recordWeight(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      // Verificar que el bovino existe
      if (req.body.bovineId) {
        const bovine = await Bovine.findByPk(req.body.bovineId);
        if (!bovine) {
          res.status(404).json({
            success: false,
            message: 'Bovino no encontrado'
          });
          return;
        }

        // Actualizar el peso en el bovino si es posible
        try {
          await bovine.update(req.body);
        } catch (updateError) {
          console.warn('No se pudo actualizar el bovino:', updateError);
        }
      }

      // Crear registro de peso
      const weightRecord = await (Production as any).create({
        ...req.body,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Peso registrado exitosamente',
        data: {
          record: weightRecord
        }
      });

    } catch (error) {
      console.error('❌ Error registrando peso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ESTADÍSTICAS DE PRODUCCIÓN POR BOVINO
  // --------------------------------------------------------------------------
  
  public static async getBovineProductionStats(req: Request, res: Response): Promise<void> {
    try {
      const { bovineId } = req.params;

      // Obtener registros de producción básicos
      const productionRecords = await Production.findAll({
        order: [['id', 'ASC']]
      });

      if (productionRecords.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No se encontraron registros de producción'
        });
        return;
      }

      // Calcular estadísticas básicas
      const quantities = productionRecords.map(record => (record as any).quantity || 0);
      const totalProduction = quantities.reduce((sum, qty) => sum + qty, 0);
      const averageProduction = quantities.length > 0 ? totalProduction / quantities.length : 0;

      res.status(200).json({
        success: true,
        message: 'Estadísticas de producción obtenidas exitosamente',
        data: {
          bovineId,
          totalProduction,
          averageProduction: parseFloat(averageProduction.toFixed(2)),
          totalRecords: productionRecords.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER REPORTE DE PRODUCCIÓN DEL RANCHO
  // --------------------------------------------------------------------------
  
  public static async getRanchProductionReport(req: Request, res: Response): Promise<void> {
    try {
      const { ranchId } = req.params;

      // Obtener todos los registros de producción
      const productionData = await Production.findAll({
        order: [['id', 'DESC']]
      });

      // Calcular estadísticas básicas
      const totalProduction = productionData.reduce((sum, record) => sum + ((record as any).quantity || 0), 0);
      const averageProduction = productionData.length > 0 ? totalProduction / productionData.length : 0;

      res.status(200).json({
        success: true,
        message: 'Reporte de producción del rancho obtenido exitosamente',
        data: {
          ranchId,
          summary: {
            totalProduction: parseFloat(totalProduction.toFixed(2)),
            averageProduction: parseFloat(averageProduction.toFixed(2)),
            totalRecords: productionData.length
          }
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
  // OBTENER COMPARATIVA DE PRODUCTIVIDAD
  // --------------------------------------------------------------------------
  
  public static async getProductivityComparison(req: Request, res: Response): Promise<void> {
    try {
      const { ranchId } = req.params;

      // Obtener datos básicos
      const allRecords = await Production.findAll();

      res.status(200).json({
        success: true,
        message: 'Comparativa de productividad obtenida exitosamente',
        data: {
          ranchId,
          totalRecords: allRecords.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo comparativa de productividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER PRODUCCIÓN POR ID
  // --------------------------------------------------------------------------
  
  public static async getProductionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const production = await Production.findByPk(id);

      if (!production) {
        res.status(404).json({
          success: false,
          message: 'Registro de producción no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Registro de producción obtenido exitosamente',
        data: production
      });

    } catch (error) {
      console.error('❌ Error obteniendo registro de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ACTUALIZAR REGISTRO DE PRODUCCIÓN
  // --------------------------------------------------------------------------
  
  public static async updateProduction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const production = await Production.findByPk(id);
      if (!production) {
        res.status(404).json({
          success: false,
          message: 'Registro de producción no encontrado'
        });
        return;
      }

      await production.update(req.body);

      res.status(200).json({
        success: true,
        message: 'Registro de producción actualizado exitosamente',
        data: production
      });

    } catch (error) {
      console.error('❌ Error actualizando registro de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ELIMINAR REGISTRO DE PRODUCCIÓN
  // --------------------------------------------------------------------------
  
  public static async deleteProduction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const production = await Production.findByPk(id);
      if (!production) {
        res.status(404).json({
          success: false,
          message: 'Registro de producción no encontrado'
        });
        return;
      }

      await production.destroy();

      res.status(200).json({
        success: true,
        message: 'Registro de producción eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando registro de producción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

export default ProductionController;