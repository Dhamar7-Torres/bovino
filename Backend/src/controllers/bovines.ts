import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import { sequelize } from '../config/database';
import { Bovine, Vaccination, Illness, Location } from '../models';
import { BovineService } from '../services/bovine.service';

// Tipos para las operaciones de bovinos
type BovineType = "CATTLE" | "BULL" | "COW" | "CALF";
type BovineGender = "MALE" | "FEMALE";
type HealthStatus = "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
type IllnessSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Interfaces para requests
interface CreateBovineRequest {
  earTag: string;
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  healthStatus: HealthStatus;
  photos?: string[];
}

interface UpdateBovineRequest extends Partial<CreateBovineRequest> {
  id: string;
}

interface BovineSearchParams {
  searchTerm?: string;
  type?: BovineType;
  breed?: string;
  gender?: BovineGender;
  healthStatus?: HealthStatus;
  ageMin?: number;
  ageMax?: number;
  weightMin?: number;
  weightMax?: number;
  locationRadius?: number;
  centerLatitude?: number;
  centerLongitude?: number;
  hasVaccinations?: boolean;
  hasIllnesses?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface BulkOperationRequest {
  ids: string[];
  operation: 'update' | 'delete' | 'vaccinate' | 'move_location' | 'change_health_status';
  data?: any;
}

export class BovinesController {
  private bovineService: BovineService;

  constructor() {
    this.bovineService = new BovineService();
  }

  /**
   * Crear nuevo bovino
   * POST /api/bovines
   */
  public createBovine = async (req: Request, res: Response): Promise<void> => {
    try {
      const bovineData: CreateBovineRequest = req.body;

      // Validaciones básicas
      if (!bovineData.earTag || !bovineData.type || !bovineData.breed || !bovineData.gender) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'EarTag, tipo, raza y género son obligatorios'
          }
        });
        return;
      }

      // Validar que el earTag sea único
      const existingBovine = await Bovine.findOne({ 
        where: { earTag: bovineData.earTag } 
      });

      if (existingBovine) {
        res.status(409).json({
          success: false,
          message: 'El número de arete ya existe',
          errors: {
            earTag: 'Ya existe un bovino con este número de arete'
          }
        });
        return;
      }

      // Validar ubicación
      if (!bovineData.location || !bovineData.location.latitude || !bovineData.location.longitude) {
        res.status(400).json({
          success: false,
          message: 'Ubicación es obligatoria',
          errors: {
            location: 'Las coordenadas de latitud y longitud son obligatorias'
          }
        });
        return;
      }

      // Crear registro de ubicación primero
      const locationRecord = await Location.create({
        latitude: bovineData.location.latitude,
        longitude: bovineData.location.longitude,
        address: bovineData.location.address || '',
        accuracy: 10, // Valor por defecto
        timestamp: new Date()
      });

      // Calcular edad si se proporciona fecha de nacimiento
      const currentDate = new Date();
      const birthDate = new Date(bovineData.birthDate);
      const ageInMonths = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

      // Crear bovino
      const newBovine = await Bovine.create({
        earTag: bovineData.earTag,
        name: bovineData.name || null,
        type: bovineData.type,
        breed: bovineData.breed,
        gender: bovineData.gender,
        birthDate: bovineData.birthDate,
        ageInMonths: ageInMonths,
        weight: bovineData.weight || 0,
        motherEarTag: bovineData.motherEarTag || null,
        fatherEarTag: bovineData.fatherEarTag || null,
        locationId: locationRecord.id,
        healthStatus: bovineData.healthStatus || 'HEALTHY',
        photos: bovineData.photos || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Incluir datos de ubicación en la respuesta
      const bovineWithLocation = await Bovine.findByPk(newBovine.id, {
        include: [{
          model: Location,
          as: 'location'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Bovino creado exitosamente',
        data: {
          bovine: bovineWithLocation
        }
      });

    } catch (error) {
      console.error('Error al crear bovino:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear el bovino'
        }
      });
    }
  };

  /**
   * Obtener lista de bovinos con filtros
   * GET /api/bovines
   */
  public getBovines = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        searchTerm,
        type,
        breed,
        gender,
        healthStatus,
        ageMin,
        ageMax,
        weightMin,
        weightMax,
        locationRadius,
        centerLatitude,
        centerLongitude,
        hasVaccinations,
        hasIllnesses,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      }: BovineSearchParams = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {
        isActive: true
      };

      // Filtro de búsqueda de texto
      if (searchTerm) {
        whereConditions[Op.or] = [
          { earTag: { [Op.iLike]: `%${searchTerm}%` } },
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { breed: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Filtros específicos
      if (type) whereConditions.type = type;
      if (breed) whereConditions.breed = { [Op.iLike]: `%${breed}%` };
      if (gender) whereConditions.gender = gender;
      if (healthStatus) whereConditions.healthStatus = healthStatus;

      // Filtros de rango de edad
      if (ageMin !== undefined || ageMax !== undefined) {
        whereConditions.ageInMonths = {};
        if (ageMin !== undefined) whereConditions.ageInMonths[Op.gte] = parseInt(ageMin.toString());
        if (ageMax !== undefined) whereConditions.ageInMonths[Op.lte] = parseInt(ageMax.toString());
      }

      // Filtros de rango de peso
      if (weightMin !== undefined || weightMax !== undefined) {
        whereConditions.weight = {};
        if (weightMin !== undefined) whereConditions.weight[Op.gte] = parseFloat(weightMin.toString());
        if (weightMax !== undefined) whereConditions.weight[Op.lte] = parseFloat(weightMax.toString());
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100); // Máximo 100
      const offset = (pageNum - 1) * limitNum;

      // Incluir asociaciones
      const includeAssociations: any[] = [
        {
          model: Location,
          as: 'location',
          attributes: ['latitude', 'longitude', 'address']
        }
      ];

      // Filtros condicionales para asociaciones
      if (hasVaccinations === 'true') {
        includeAssociations.push({
          model: Vaccination,
          as: 'vaccinations',
          required: true
        });
      } else {
        includeAssociations.push({
          model: Vaccination,
          as: 'vaccinations',
          required: false
        });
      }

      if (hasIllnesses === 'true') {
        includeAssociations.push({
          model: Illness,
          as: 'illnesses',
          required: true
        });
      } else {
        includeAssociations.push({
          model: Illness,
          as: 'illnesses',
          required: false
        });
      }

      // Ejecutar consulta
      const { count, rows: bovines } = await Bovine.findAndCountAll({
        where: whereConditions,
        include: includeAssociations,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Filtrar por proximidad geográfica si se especifica
      let filteredBovines = bovines;
      if (locationRadius && centerLatitude && centerLongitude) {
        const radiusKm = parseFloat(locationRadius.toString());
        const centerLat = parseFloat(centerLatitude.toString());
        const centerLng = parseFloat(centerLongitude.toString());

        filteredBovines = bovines.filter(bovine => {
          if (!bovine.location) return false;
          const distance = this.calculateDistance(
            centerLat, centerLng,
            bovine.location.latitude, bovine.location.longitude
          );
          return distance <= radiusKm;
        });
      }

      // Preparar respuesta
      const totalPages = Math.ceil(count / limitNum);
      
      res.status(200).json({
        success: true,
        message: 'Bovinos obtenidos exitosamente',
        data: {
          bovines: filteredBovines,
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
      console.error('Error al obtener bovinos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener los bovinos'
        }
      });
    }
  };

  /**
   * Obtener bovino específico por ID
   * GET /api/bovines/:id
   */
  public getBovineById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const bovine = await Bovine.findOne({
        where: { 
          id: id,
          isActive: true 
        },
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Vaccination,
            as: 'vaccinations',
            order: [['applicationDate', 'DESC']]
          },
          {
            model: Illness,
            as: 'illnesses',
            order: [['diagnosisDate', 'DESC']]
          }
        ]
      });

      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado',
          errors: {
            bovine: 'El bovino especificado no existe o ha sido eliminado'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Bovino obtenido exitosamente',
        data: {
          bovine: bovine
        }
      });

    } catch (error) {
      console.error('Error al obtener bovino:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener el bovino'
        }
      });
    }
  };

  /**
   * Actualizar bovino
   * PUT /api/bovines/:id
   */
  public updateBovine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateBovineRequest = req.body;

      // Buscar bovino existente
      const existingBovine = await Bovine.findOne({
        where: { 
          id: id,
          isActive: true 
        }
      });

      if (!existingBovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado',
          errors: {
            bovine: 'El bovino especificado no existe'
          }
        });
        return;
      }

      // Validar earTag único si se está actualizando
      if (updateData.earTag && updateData.earTag !== existingBovine.earTag) {
        const duplicateEarTag = await Bovine.findOne({
          where: { 
            earTag: updateData.earTag,
            id: { [Op.ne]: id },
            isActive: true
          }
        });

        if (duplicateEarTag) {
          res.status(409).json({
            success: false,
            message: 'El número de arete ya existe',
            errors: {
              earTag: 'Ya existe otro bovino con este número de arete'
            }
          });
          return;
        }
      }

      // Actualizar ubicación si se proporciona
      if (updateData.location) {
        await Location.update(
          {
            latitude: updateData.location.latitude,
            longitude: updateData.location.longitude,
            address: updateData.location.address || '',
            timestamp: new Date()
          },
          { where: { id: existingBovine.locationId } }
        );
      }

      // Recalcular edad si se actualiza fecha de nacimiento
      let ageInMonths = existingBovine.ageInMonths;
      if (updateData.birthDate) {
        const currentDate = new Date();
        const birthDate = new Date(updateData.birthDate);
        ageInMonths = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      }

      // Actualizar bovino
      await existingBovine.update({
        earTag: updateData.earTag || existingBovine.earTag,
        name: updateData.name !== undefined ? updateData.name : existingBovine.name,
        type: updateData.type || existingBovine.type,
        breed: updateData.breed || existingBovine.breed,
        gender: updateData.gender || existingBovine.gender,
        birthDate: updateData.birthDate || existingBovine.birthDate,
        ageInMonths: ageInMonths,
        weight: updateData.weight !== undefined ? updateData.weight : existingBovine.weight,
        motherEarTag: updateData.motherEarTag !== undefined ? updateData.motherEarTag : existingBovine.motherEarTag,
        fatherEarTag: updateData.fatherEarTag !== undefined ? updateData.fatherEarTag : existingBovine.fatherEarTag,
        healthStatus: updateData.healthStatus || existingBovine.healthStatus,
        photos: updateData.photos !== undefined ? updateData.photos : existingBovine.photos,
        updatedAt: new Date()
      });

      // Obtener bovino actualizado con asociaciones
      const updatedBovine = await Bovine.findByPk(id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Vaccination,
            as: 'vaccinations'
          },
          {
            model: Illness,
            as: 'illnesses'
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Bovino actualizado exitosamente',
        data: {
          bovine: updatedBovine
        }
      });

    } catch (error) {
      console.error('Error al actualizar bovino:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al actualizar el bovino'
        }
      });
    }
  };

  /**
   * Eliminar bovino (eliminación lógica)
   * DELETE /api/bovines/:id
   */
  public deleteBovine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const bovine = await Bovine.findOne({
        where: { 
          id: id,
          isActive: true 
        }
      });

      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado',
          errors: {
            bovine: 'El bovino especificado no existe'
          }
        });
        return;
      }

      // Eliminación lógica
      await bovine.update({
        isActive: false,
        updatedAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Bovino eliminado exitosamente',
        data: {
          deleted: true
        }
      });

    } catch (error) {
      console.error('Error al eliminar bovino:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al eliminar el bovino'
        }
      });
    }
  };

  /**
   * Obtener estadísticas de bovinos
   * GET /api/bovines/stats
   */
  public getBovineStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener conteos básicos
      const totalCount = await Bovine.count({ where: { isActive: true } });
      
      // Conteo por tipo
      const typeStats = await Bovine.findAll({
        where: { isActive: true },
        attributes: [
          'type',
          [fn('COUNT', col('type')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      // Conteo por género
      const genderStats = await Bovine.findAll({
        where: { isActive: true },
        attributes: [
          'gender',
          [fn('COUNT', col('gender')), 'count']
        ],
        group: ['gender'],
        raw: true
      });

      // Conteo por estado de salud
      const healthStats = await Bovine.findAll({
        where: { isActive: true },
        attributes: [
          'healthStatus',
          [fn('COUNT', col('healthStatus')), 'count']
        ],
        group: ['healthStatus'],
        raw: true
      });

      // Promedios
      const averages = await Bovine.findAll({
        where: { isActive: true },
        attributes: [
          [fn('AVG', col('ageInMonths')), 'averageAge'],
          [fn('AVG', col('weight')), 'averageWeight']
        ],
        raw: true
      });

      // Cobertura de vacunación
      const totalBovines = totalCount;
      const bovinersWithVaccinations = await Bovine.count({
        where: { isActive: true },
        include: [{
          model: Vaccination,
          as: 'vaccinations',
          required: true
        }],
        distinct: true
      });

      // Tasa de enfermedad
      const bovinesWithIllnesses = await Bovine.count({
        where: { isActive: true },
        include: [{
          model: Illness,
          as: 'illnesses',
          required: true
        }],
        distinct: true
      });

      const stats = {
        totalCount,
        countByType: this.formatCountStats(typeStats),
        countByGender: this.formatCountStats(genderStats),
        countByHealthStatus: this.formatCountStats(healthStats),
        averageAge: Math.round(parseFloat(averages[0]?.averageAge) || 0),
        averageWeight: Math.round(parseFloat(averages[0]?.averageWeight) || 0),
        vaccinationCoverage: totalBovines > 0 ? Math.round((bovinersWithVaccinations / totalBovines) * 100) : 0,
        illnessRate: totalBovines > 0 ? Math.round((bovinesWithIllnesses / totalBovines) * 100) : 0
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener las estadísticas'
        }
      });
    }
  };

  /**
   * Operación en lote
   * POST /api/bovines/bulk
   */
  public bulkOperation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids, operation, data }: BulkOperationRequest = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'IDs de bovinos requeridos',
          errors: {
            ids: 'Debe proporcionar al menos un ID de bovino'
          }
        });
        return;
      }

      let result;
      
      switch (operation) {
        case 'update':
          result = await this.performBulkUpdate(ids, data);
          break;
        case 'delete':
          result = await this.performBulkDelete(ids);
          break;
        case 'change_health_status':
          result = await this.performBulkHealthStatusChange(ids, data.healthStatus);
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Operación no válida',
            errors: {
              operation: 'Operación no soportada'
            }
          });
          return;
      }

      res.status(200).json({
        success: true,
        message: `Operación ${operation} completada exitosamente`,
        data: result
      });

    } catch (error) {
      console.error('Error en operación en lote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error en la operación en lote'
        }
      });
    }
  };

  // Métodos auxiliares privados
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
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

  private formatCountStats(stats: any[]): Record<string, number> {
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat[Object.keys(stat)[0]]] = parseInt(stat.count);
    });
    return result;
  }

  private async performBulkUpdate(ids: string[], updateData: any): Promise<any> {
    const [affectedCount] = await Bovine.update(
      {
        ...updateData,
        updatedAt: new Date()
      },
      {
        where: {
          id: { [Op.in]: ids },
          isActive: true
        }
      }
    );
    
    return {
      updatedCount: affectedCount,
      ids: ids
    };
  }

  private async performBulkDelete(ids: string[]): Promise<any> {
    const [affectedCount] = await Bovine.update(
      {
        isActive: false,
        updatedAt: new Date()
      },
      {
        where: {
          id: { [Op.in]: ids },
          isActive: true
        }
      }
    );
    
    return {
      deletedCount: affectedCount,
      ids: ids
    };
  }

  private async performBulkHealthStatusChange(ids: string[], healthStatus: HealthStatus): Promise<any> {
    const [affectedCount] = await Bovine.update(
      {
        healthStatus: healthStatus,
        updatedAt: new Date()
      },
      {
        where: {
          id: { [Op.in]: ids },
          isActive: true
        }
      }
    );
    
    return {
      updatedCount: affectedCount,
      newHealthStatus: healthStatus,
      ids: ids
    };
  }
}