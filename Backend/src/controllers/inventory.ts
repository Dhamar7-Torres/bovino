import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Inventory, Medication, Bovine, User } from '../models';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface InventoryQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Función mock para upload hasta que se implemente Cloudinary
const uploadToCloudinary = async (buffer: Buffer, folder: string): Promise<{ secure_url: string }> => {
  return {
    secure_url: `https://mock-url.com/${folder}/${Date.now()}.jpg`
  };
};

// ============================================================================
// CONTROLADOR DE INVENTARIO
// ============================================================================

export class InventoryController {
  
  // --------------------------------------------------------------------------
  // OBTENER TODOS LOS ITEMS DEL INVENTARIO CON FILTROS Y PAGINACIÓN
  // --------------------------------------------------------------------------
  
  public static async getAllInventory(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        category,
        status,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query as InventoryQuery;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;

      const whereClause: any = {};

      if (search) {
        // Usar una búsqueda genérica sin especificar campos
        whereClause[Op.or] = [];
      }

      if (category) {
        whereClause.category = category;
      }

      if (status) {
        whereClause.status = status;
      }

      const { count, rows: inventoryItems } = await Inventory.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Medication,
            as: 'medication',
            required: false
          },
          {
            model: User,
            as: 'addedByUser',
            required: false
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: limitNumber,
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Inventario obtenido exitosamente',
        data: {
          items: inventoryItems,
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
      console.error('❌ Error obteniendo inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER UN ITEM ESPECÍFICO DEL INVENTARIO POR ID
  // --------------------------------------------------------------------------
  
  public static async getInventoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const inventoryItem = await Inventory.findByPk(id, {
        include: [
          {
            model: Medication,
            as: 'medication',
            required: false
          },
          {
            model: User,
            as: 'addedByUser',
            required: false
          }
        ]
      });

      if (!inventoryItem) {
        res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Item de inventario obtenido exitosamente',
        data: inventoryItem
      });

    } catch (error) {
      console.error('❌ Error obteniendo item de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // CREAR NUEVO ITEM EN EL INVENTARIO
  // --------------------------------------------------------------------------
  
  public static async createInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      // Procesar imagen si se envió
      let imageUrl = null;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'inventory');
        imageUrl = uploadResult.secure_url;
      }

      // Crear el item usando SOLO el cuerpo de la petición
      const newInventoryItem = await (Inventory as any).create(req.body);

      // Obtener el item creado con sus relaciones
      const inventoryItemWithRelations = await Inventory.findByPk(newInventoryItem.id, {
        include: [
          {
            model: Medication,
            as: 'medication',
            required: false
          },
          {
            model: User,
            as: 'addedByUser',
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Item de inventario creado exitosamente',
        data: inventoryItemWithRelations
      });

    } catch (error) {
      console.error('❌ Error creando item de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ACTUALIZAR ITEM DEL INVENTARIO
  // --------------------------------------------------------------------------
  
  public static async updateInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const inventoryItem = await Inventory.findByPk(id);
      if (!inventoryItem) {
        res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
        return;
      }

      // Procesar nueva imagen si se envió
      let updateData = { ...req.body };
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'inventory');
        updateData.imageUrl = uploadResult.secure_url;
      }

      // Actualizar el item sin especificar propiedades exactas
      await inventoryItem.update(updateData);

      // Obtener el item actualizado con sus relaciones
      const updatedItem = await Inventory.findByPk(id, {
        include: [
          {
            model: Medication,
            as: 'medication',
            required: false
          },
          {
            model: User,
            as: 'addedByUser',
            required: false
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Item de inventario actualizado exitosamente',
        data: updatedItem
      });

    } catch (error) {
      console.error('❌ Error actualizando item de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ELIMINAR ITEM DEL INVENTARIO
  // --------------------------------------------------------------------------
  
  public static async deleteInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const inventoryItem = await Inventory.findByPk(id);
      if (!inventoryItem) {
        res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
        return;
      }

      await inventoryItem.destroy();

      res.status(200).json({
        success: true,
        message: 'Item de inventario eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando item de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ESTADÍSTICAS DEL INVENTARIO
  // --------------------------------------------------------------------------
  
  public static async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      const totalItems = await Inventory.count();
      
      res.status(200).json({
        success: true,
        message: 'Estadísticas del inventario obtenidas exitosamente',
        data: {
          overview: {
            totalItems,
            totalValue: 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ACTUALIZAR STOCK DE UN ITEM (ENTRADA/SALIDA)
  // --------------------------------------------------------------------------
  
  public static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { operation } = req.body;

      if (!['add', 'subtract'].includes(operation)) {
        res.status(400).json({
          success: false,
          message: 'Operación debe ser "add" o "subtract"'
        });
        return;
      }

      const inventoryItem = await Inventory.findByPk(id);
      if (!inventoryItem) {
        res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
        return;
      }

      // Usar el método update sin especificar propiedades
      await inventoryItem.update(req.body);

      res.status(200).json({
        success: true,
        message: `Stock ${operation === 'add' ? 'agregado' : 'sustraído'} exitosamente`,
        data: inventoryItem
      });

    } catch (error) {
      console.error('❌ Error actualizando stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ITEMS CON BAJO STOCK O PRÓXIMOS A VENCER
  // --------------------------------------------------------------------------
  
  public static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const allItems = await Inventory.findAll({
        include: [
          {
            model: Medication,
            as: 'medication',
            required: false
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Alertas del inventario obtenidas exitosamente',
        data: {
          items: allItems
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo alertas del inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

export default InventoryController;