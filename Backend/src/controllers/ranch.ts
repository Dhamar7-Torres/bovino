import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Ranch, User, Bovine, Production, Event, Location, Inventory } from '../models';
import { processImage, getFileUrl, createUploadMiddleware } from '../config/upload';

// Importación condicional de express-validator
let validationResult: any;
try {
  const expressValidator = require('express-validator');
  validationResult = expressValidator.validationResult;
} catch (error) {
  validationResult = () => ({ isEmpty: () => true, array: () => [] });
}

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface RanchQuery {
  page?: string;
  limit?: string;
  search?: string;
  state?: string;
  municipality?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

interface PastureArea {
  id: string;
  name: string;
  area_hectares: number;
  capacity_bovines: number;
  current_bovines: number;
  pasture_type: 'natural' | 'improved' | 'cultivated';
  grass_species: string[];
  rotation_schedule?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  status: 'available' | 'occupied' | 'resting' | 'maintenance';
}

interface RanchInfrastructure {
  water_sources: {
    wells: number;
    ponds: number;
    streams: number;
    water_tanks: number;
  };
  buildings: {
    stables: number;
    milking_parlors: number;
    feed_storage: number;
    equipment_storage: number;
    administration: number;
  };
  fencing: {
    total_km: number;
    electric_fence_km: number;
    barbed_wire_km: number;
    wooden_fence_km: number;
  };
  equipment: {
    tractors: number;
    milking_machines: number;
    feeders: number;
    weighing_scales: number;
  };
}

interface RanchConfiguration {
  operation_type: 'dairy' | 'beef' | 'mixed' | 'breeding';
  management_system: 'intensive' | 'semi_intensive' | 'extensive';
  milking_schedule: {
    times_per_day: number;
    morning_time: string;
    afternoon_time: string;
    evening_time?: string;
  };
  feeding_schedule: {
    times_per_day: number;
    feeding_times: string[];
  };
  rotation_system: {
    enabled: boolean;
    rotation_days: number;
    rest_days: number;
  };
  alerts_configuration: {
    low_weight_threshold: number;
    low_milk_threshold: number;
    geofence_alerts: boolean;
    health_alerts: boolean;
  };
}

// ============================================================================
// COORDENADAS DE REFERENCIA PARA TABASCO, MÉXICO
// ============================================================================

const TABASCO_BOUNDS = {
  north: 18.5,
  south: 17.3,
  east: -91.0,
  west: -94.8
};

const TABASCO_MUNICIPALITIES = [
  'Balancán', 'Cárdenas', 'Centla', 'Centro', 'Comalcalco',
  'Cunduacán', 'Emiliano Zapata', 'Huimanguillo', 'Jalapa',
  'Jalpa de Méndez', 'Jonuta', 'Macuspana', 'Nacajuca',
  'Paraíso', 'Tacotalpa', 'Teapa', 'Tenosique'
];

// ============================================================================
// CONTROLADOR DE RANCHOS
// ============================================================================

export class RanchController {

  // --------------------------------------------------------------------------
  // OBTENER TODOS LOS RANCHOS CON FILTROS Y PAGINACIÓN
  // --------------------------------------------------------------------------
  
  public static async getAllRanches(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
        return;
      }

      const {
        page = '1',
        limit = '10',
        search,
        state = 'Tabasco',
        municipality,
        status,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query as RanchQuery;

      // Configurar paginación
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Construir filtros dinámicos
      const whereClause: any = {};

      if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` };
      }

      if (state) {
        whereClause.state = state;
      }

      if (municipality) {
        whereClause.municipality = municipality;
      }

      if (status) {
        whereClause.status = status;
      }

      // Buscar ranchos con estadísticas agregadas
      const { count, rows: ranches } = await Ranch.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: false
          },
          {
            model: User,
            as: 'employees',
            attributes: ['id', 'firstName', 'lastName'],
            through: { attributes: [] },
            required: false
          }
        ],
        attributes: {
          include: [
            // Contar bovinos por rancho - simplificado
            [
              literal(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.status != 'sold')`),
              'total_bovines'
            ],
            // Contar bovinos productivos - simplificado
            [
              literal(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'female' AND bovines.status = 'active')`),
              'productive_bovines'
            ]
          ]
        },
        order: [[sortBy, sortOrder]],
        limit: limitNumber,
        offset: offset,
        distinct: true
      });

      // Calcular información de paginación
      const totalPages = Math.ceil(count / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Ranchos obtenidos exitosamente',
        data: {
          ranches,
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
      console.error('❌ Error obteniendo ranchos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER UN RANCHO ESPECÍFICO POR ID CON DETALLES COMPLETOS
  // --------------------------------------------------------------------------
  
  public static async getRanchById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ranch = await Ranch.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: false
          },
          {
            model: User,
            as: 'employees',
            attributes: ['id', 'firstName', 'lastName'],
            through: { attributes: ['position', 'hire_date'] },
            required: false
          },
          {
            model: Bovine,
            as: 'bovines',
            attributes: ['id', 'earring_number', 'name', 'breed', 'gender', 'status'],
            limit: 10, // Solo mostrar algunos ejemplos
            order: [['created_at', 'DESC']],
            required: false
          }
        ],
        attributes: {
          include: [
            // Estadísticas detalladas - simplificado
            [
              literal(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.status != 'sold')`),
              'total_bovines'
            ],
            [
              literal(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'female' AND bovines.status = 'active')`),
              'female_bovines'
            ],
            [
              literal(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'male' AND bovines.status = 'active')`),
              'male_bovines'
            ]
          ]
        }
      });

      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      // Obtener estadísticas adicionales
      const additionalStats = await RanchController.getRanchStatistics(id);

      res.status(200).json({
        success: true,
        message: 'Rancho obtenido exitosamente',
        data: {
          ranch,
          statistics: additionalStats
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo rancho:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // CREAR NUEVO RANCHO
  // --------------------------------------------------------------------------
  
  public static async createRanch(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
        return;
      }

      const {
        name,
        description,
        total_area,
        pasture_area,
        address,
        municipality,
        state = 'Tabasco',
        postal_code,
        latitude,
        longitude,
        operation_type = 'mixed',
        management_system = 'semi_intensive',
        infrastructure,
        configuration,
        pastures
      } = req.body;

      // Validar coordenadas para Tabasco
      if (!RanchController.isValidTabascoCoordinates(latitude, longitude)) {
        res.status(400).json({
          success: false,
          message: 'Las coordenadas deben estar dentro de Tabasco, México'
        });
        return;
      }

      // Validar municipio de Tabasco
      if (!TABASCO_MUNICIPALITIES.includes(municipality)) {
        res.status(400).json({
          success: false,
          message: 'Municipio no válido para Tabasco'
        });
        return;
      }

      // Obtener el usuario actual como propietario
      const ownerId = (req as any).user?.id;

      // Procesar imagen si se envió
      let imageUrl = null;
      if (req.file) {
        try {
          // Procesar la imagen usando las funciones de upload.ts
          const processedImagePath = await processImage(req.file.path, {
            width: 1920,
            height: 1080,
            quality: 85,
            format: 'jpeg'
          });
          imageUrl = getFileUrl(processedImagePath);
        } catch (error) {
          console.warn('Error procesando imagen:', error);
          imageUrl = getFileUrl(req.file.path);
        }
      }

      // Configuración por defecto
      const defaultConfiguration: RanchConfiguration = {
        operation_type,
        management_system,
        milking_schedule: {
          times_per_day: operation_type === 'dairy' ? 2 : 1,
          morning_time: '05:00',
          afternoon_time: '16:00'
        },
        feeding_schedule: {
          times_per_day: 2,
          feeding_times: ['07:00', '17:00']
        },
        rotation_system: {
          enabled: management_system !== 'intensive',
          rotation_days: 7,
          rest_days: 21
        },
        alerts_configuration: {
          low_weight_threshold: 400, // kg
          low_milk_threshold: 10, // litros
          geofence_alerts: true,
          health_alerts: true
        }
      };

      // Crear el rancho
      const newRanch = await Ranch.create({
        name,
        description,
        total_area,
        pasture_area,
        address,
        municipality,
        state,
        postal_code,
        latitude,
        longitude,
        image_url: imageUrl,
        operation_type,
        management_system,
        infrastructure: infrastructure || {},
        configuration: { ...defaultConfiguration, ...configuration },
        pastures: pastures || [],
        owner_id: ownerId,
        status: 'active'
      } as any);

      // Obtener el rancho creado con sus relaciones
      const ranchWithRelations = await Ranch.findByPk((newRanch as any).id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Rancho creado exitosamente',
        data: ranchWithRelations
      });

    } catch (error) {
      console.error('❌ Error creando rancho:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ACTUALIZAR RANCHO
  // --------------------------------------------------------------------------
  
  public static async updateRanch(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      // Verificar que el rancho existe
      const ranch = await Ranch.findByPk(id);
      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      // Verificar permisos (solo el propietario puede actualizar)
      const userId = (req as any).user?.id;
      if ((ranch as any).owner_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este rancho'
        });
        return;
      }

      // Validar coordenadas si se están actualizando
      if (updateData.latitude && updateData.longitude) {
        if (!RanchController.isValidTabascoCoordinates(updateData.latitude, updateData.longitude)) {
          res.status(400).json({
            success: false,
            message: 'Las coordenadas deben estar dentro de Tabasco, México'
          });
          return;
        }
      }

      // Validar municipio si se está actualizando
      if (updateData.municipality && !TABASCO_MUNICIPALITIES.includes(updateData.municipality)) {
        res.status(400).json({
          success: false,
          message: 'Municipio no válido para Tabasco'
        });
        return;
      }

      // Procesar nueva imagen si se envió
      if (req.file) {
        try {
          const processedImagePath = await processImage(req.file.path, {
            width: 1920,
            height: 1080,
            quality: 85,
            format: 'jpeg'
          });
          updateData.image_url = getFileUrl(processedImagePath);
        } catch (error) {
          console.warn('Error procesando imagen:', error);
          updateData.image_url = getFileUrl(req.file.path);
        }
      }

      // Actualizar el rancho
      await (ranch as any).update(updateData);

      // Obtener el rancho actualizado con sus relaciones
      const updatedRanch = await Ranch.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Rancho actualizado exitosamente',
        data: updatedRanch
      });

    } catch (error) {
      console.error('❌ Error actualizando rancho:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // ELIMINAR RANCHO
  // --------------------------------------------------------------------------
  
  public static async deleteRanch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ranch = await Ranch.findByPk(id);
      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      // Verificar permisos
      const userId = (req as any).user?.id;
      if ((ranch as any).owner_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este rancho'
        });
        return;
      }

      // Verificar si tiene bovinos activos
      const activeBovinesCount = await Bovine.count({
        where: literal(`ranch_id = '${id}' AND status != 'sold'`)
      } as any);

      const activeBovines = Array.isArray(activeBovinesCount) ? activeBovinesCount.length : (activeBovinesCount || 0);

      if (activeBovines > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar el rancho. Tiene ${activeBovines} bovinos activos`
        });
        return;
      }

      await (ranch as any).destroy();

      res.status(200).json({
        success: true,
        message: 'Rancho eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando rancho:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER DASHBOARD DEL RANCHO CON ESTADÍSTICAS
  // --------------------------------------------------------------------------
  
  public static async getRanchDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { period = '30' } = req.query; // días para estadísticas

      const ranch = await Ranch.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Estadísticas generales del ganado
      const bovineStats = await RanchController.getBovineStatistics(id);

      // Estadísticas de producción
      const productionStats = await RanchController.getProductionStatistics(id, startDate);

      // Eventos recientes - simplificado
      const recentEvents = await Event.findAll({
        where: literal(`id IN (SELECT e.id FROM events e INNER JOIN bovines b ON e.bovine_id = b.id WHERE b.ranch_id = '${id}')`)
        ,
        order: [['created_at', 'DESC']],
        limit: 10
      } as any).catch(() => []);

      // Alertas activas - simplificado
      const activeAlertsResult = await Event.count({
        where: literal(`status = 'active' AND priority IN ('high', 'critical') AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${id}')`)
      } as any).catch(() => 0);

      const activeAlerts = Array.isArray(activeAlertsResult) ? activeAlertsResult.length : (activeAlertsResult || 0);

      // Estado del inventario
      const inventoryStatus = await RanchController.getInventoryStatus(id);

      res.status(200).json({
        success: true,
        message: 'Dashboard del rancho obtenido exitosamente',
        data: {
          ranch: {
            id: (ranch as any).id,
            name: (ranch as any).name,
            total_area: (ranch as any).total_area,
            operation_type: (ranch as any).operation_type,
            owner: (ranch as any).owner
          },
          period_days: days,
          bovine_statistics: bovineStats,
          production_statistics: productionStats,
          recent_events: recentEvents,
          active_alerts: activeAlerts,
          inventory_status: inventoryStatus,
          last_updated: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo dashboard del rancho:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // GESTIONAR POTREROS DEL RANCHO
  // --------------------------------------------------------------------------
  
  public static async managePastures(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, pasture_data } = req.body;

      const ranch = await Ranch.findByPk(id);
      if (!ranch) {
        res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
        return;
      }

      let updatedPastures = [...((ranch as any).pastures || [])];

      switch (action) {
        case 'add':
          // Agregar nuevo potrero
          const newPasture: PastureArea = {
            id: `pasture_${Date.now()}`,
            name: pasture_data.name,
            area_hectares: pasture_data.area_hectares,
            capacity_bovines: pasture_data.capacity_bovines,
            current_bovines: 0,
            pasture_type: pasture_data.pasture_type || 'natural',
            grass_species: pasture_data.grass_species || [],
            coordinates: pasture_data.coordinates || [],
            status: 'available'
          };
          updatedPastures.push(newPasture);
          break;

        case 'update':
          // Actualizar potrero existente
          const pastureIndex = updatedPastures.findIndex(p => p.id === pasture_data.id);
          if (pastureIndex !== -1) {
            updatedPastures[pastureIndex] = { ...updatedPastures[pastureIndex], ...pasture_data };
          }
          break;

        case 'remove':
          // Eliminar potrero
          updatedPastures = updatedPastures.filter(p => p.id !== pasture_data.id);
          break;

        case 'rotate':
          // Rotación de bovinos entre potreros
          await RanchController.rotateBovines(id, pasture_data.from_pasture, pasture_data.to_pasture);
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Acción no válida para gestión de potreros'
          });
          return;
      }

      // Actualizar el rancho con los nuevos potreros
      await (ranch as any).update({ pastures: updatedPastures });

      res.status(200).json({
        success: true,
        message: `Potrero ${action} exitosamente`,
        data: {
          pastures: updatedPastures,
          total_pastures: updatedPastures.length,
          total_pasture_area: updatedPastures.reduce((sum: number, p: PastureArea) => sum + p.area_hectares, 0)
        }
      });

    } catch (error) {
      console.error('❌ Error gestionando potreros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER MUNICIPIOS DE TABASCO
  // --------------------------------------------------------------------------
  
  public static async getTabascoMunicipalities(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Municipios de Tabasco obtenidos exitosamente',
        data: {
          state: 'Tabasco',
          municipalities: TABASCO_MUNICIPALITIES.map(municipality => ({
            name: municipality,
            state: 'Tabasco',
            country: 'México'
          })),
          total_municipalities: TABASCO_MUNICIPALITIES.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo municipios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // --------------------------------------------------------------------------
  // MÉTODOS AUXILIARES PRIVADOS
  // --------------------------------------------------------------------------

  // Validar coordenadas para Tabasco
  private static isValidTabascoCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= TABASCO_BOUNDS.south &&
      lat <= TABASCO_BOUNDS.north &&
      lng >= TABASCO_BOUNDS.west &&
      lng <= TABASCO_BOUNDS.east
    );
  }

  // Obtener estadísticas generales del rancho
  private static async getRanchStatistics(ranchId: string): Promise<any> {
    try {
      const stats = await Promise.all([
        // Total de bovinos por género usando literal
        Bovine.count({
          where: literal(`ranch_id = '${ranchId}' AND gender = 'female' AND status != 'sold'`)
        } as any),
        Bovine.count({
          where: literal(`ranch_id = '${ranchId}' AND gender = 'male' AND status != 'sold'`)
        } as any),
        
        // Retornar 0 para producción por ahora
        Promise.resolve(0),
        
        // Eventos del último mes usando literal
        Event.count({
          where: literal(`created_at >= NOW() - INTERVAL '30 days'`)
        } as any).catch(() => 0)
      ]);

      // Manejar el caso donde count puede retornar arrays
      const femaleBovines = Array.isArray(stats[0]) ? stats[0].length : (stats[0] || 0);
      const maleBovines = Array.isArray(stats[1]) ? stats[1].length : (stats[1] || 0);
      const eventsCount = Array.isArray(stats[3]) ? stats[3].length : (stats[3] || 0);

      return {
        female_bovines: femaleBovines,
        male_bovines: maleBovines,
        total_bovines: femaleBovines + maleBovines,
        milk_production_30d: stats[2] || 0,
        events_30d: eventsCount
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del rancho:', error);
      return {
        female_bovines: 0,
        male_bovines: 0,
        total_bovines: 0,
        milk_production_30d: 0,
        events_30d: 0
      };
    }
  }

  // Obtener estadísticas de bovinos
  private static async getBovineStatistics(ranchId: string): Promise<any> {
    try {
      // Simplificar consulta para evitar errores de tipo
      const totalBovinesResult = await Bovine.count({
        where: literal(`ranch_id = '${ranchId}' AND status != 'sold'`)
      } as any);

      const femaleBovinesResult = await Bovine.count({
        where: literal(`ranch_id = '${ranchId}' AND gender = 'female' AND status != 'sold'`)
      } as any);

      const maleBovinesResult = await Bovine.count({
        where: literal(`ranch_id = '${ranchId}' AND gender = 'male' AND status != 'sold'`)
      } as any);

      // Manejar el caso donde count puede retornar arrays
      const totalBovines = Array.isArray(totalBovinesResult) ? totalBovinesResult.length : (totalBovinesResult || 0);
      const femaleBovines = Array.isArray(femaleBovinesResult) ? femaleBovinesResult.length : (femaleBovinesResult || 0);
      const maleBovines = Array.isArray(maleBovinesResult) ? maleBovinesResult.length : (maleBovinesResult || 0);

      return [
        { gender: 'female', count: femaleBovines },
        { gender: 'male', count: maleBovines },
        { total: totalBovines }
      ];
    } catch (error) {
      console.error('Error obteniendo estadísticas de bovinos:', error);
      return [];
    }
  }

  // Obtener estadísticas de producción
  private static async getProductionStatistics(ranchId: string, startDate: Date): Promise<any> {
    try {
      // Simplificar para evitar errores de tipo
      // Por ahora retornamos datos simulados hasta que los modelos estén bien definidos
      return [
        { production_type: 'milk', total: 0, average: 0, records: 0 },
        { production_type: 'weight', total: 0, average: 0, records: 0 }
      ];
    } catch (error) {
      console.error('Error obteniendo estadísticas de producción:', error);
      return [];
    }
  }

  // Obtener estado del inventario
  private static async getInventoryStatus(ranchId: string): Promise<any> {
    // Por ahora retornamos datos simulados
    // En el futuro esto se conectaría con un modelo de inventario por rancho
    return {
      total_items: 0,
      low_stock_items: 0,
      expired_items: 0,
      total_value: 0
    };
  }

  // Rotar bovinos entre potreros
  private static async rotateBovines(
    ranchId: string, 
    fromPastureId: string, 
    toPastureId: string
  ): Promise<void> {
    // Lógica para mover bovinos entre potreros
    // Por ahora es un placeholder para futura implementación
    console.log(`Rotando bovinos del potrero ${fromPastureId} al ${toPastureId} en rancho ${ranchId}`);
  }
}

// ============================================================================
// MIDDLEWARE DE UPLOAD PARA RANCHOS
// ============================================================================

// Middleware para subir imágenes de ranchos
export const uploadRanchImage = createUploadMiddleware('cattle_images', 'image', false);

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default RanchController;