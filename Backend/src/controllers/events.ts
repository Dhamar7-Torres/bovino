import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database'; // Importación corregida como default
import Event, { 
  EventType, 
  EventStatus, 
  EventPriority,
  EventSpecificData,
  VaccinationEventData,
  DiseaseEventData,
  TreatmentEventData,
  HealthCheckEventData,
  ReproductionEventData,
  MovementEventData
} from '../models/Event'; // Usando los tipos correctos del modelo Event
import Bovine from '../models/Bovine';

// Tipos simplificados adaptados al modelo real
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Interfaces para requests - adaptadas al modelo real
interface CreateEventRequest {
  bovineId: string; // Singular, como en el modelo real
  eventType: EventType; // Usando EventType del modelo
  title: string;
  description?: string;
  scheduledDate: Date; // Fecha y hora completa
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    address?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  priority: EventPriority;
  veterinarianId?: string; // ID en lugar de nombre
  cost?: number;
  currency?: string;
  eventData?: EventSpecificData; // Datos específicos del evento
  followUpRequired?: boolean;
  followUpDate?: Date;
  publicNotes?: string;
  privateNotes?: string;
  photos?: string[];
  attachments?: string[];
  weatherConditions?: string;
  temperature?: number;
  humidity?: number;
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
  status?: EventStatus;
  startDate?: Date;
  endDate?: Date;
  performedBy?: string;
  results?: string;
  complications?: string;
  followUpNotes?: string;
}

interface EventFilters {
  eventType?: EventType[];
  status?: EventStatus[];
  priority?: EventPriority[];
  bovineId?: string; // Singular
  veterinarianId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // en km
  };
  searchTerm?: string;
  costRange?: {
    min: number;
    max: number;
  };
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface EventTimeline {
  events: EventTimelineItem[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEvents: number;
    eventsByType: Record<EventType, number>;
    eventsByStatus: Record<EventStatus, number>;
    totalCost: number;
  };
}

interface EventTimelineItem {
  id: string;
  eventType: EventType;
  title: string;
  description: string;
  date: Date;
  status: EventStatus;
  priority: EventPriority;
  bovineInfo: {
    id: string;
    earTag: string;
    name?: string;
    cattleType: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  cost?: number;
  veterinarianId?: string;
  createdBy: string;
  publicNotes?: string;
  eventData?: EventSpecificData;
}

// Tipos específicos para resultados de consultas agregadas con raw: true
interface EventTypeCountResult {
  eventType: EventType;
  count: string;
}

interface EventStatusCountResult {
  status: EventStatus;
  count: string;
}

interface EventPriorityCountResult {
  priority: EventPriority;
  count: string;
}

interface CostStatsRawResult {
  totalCost: string | null;
  averageCost: string | null;
  minCost: string | null;
  maxCost: string | null;
}

export class EventsController {
  /**
   * Crear nuevo evento
   * POST /api/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventRequest = req.body;
      const userId = (req as any).user?.id || 'system';

      // Validaciones básicas
      if (!eventData.eventType || !eventData.title || !eventData.scheduledDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'Tipo, título y fecha programada son obligatorios'
          }
        });
        return;
      }

      // Validar ubicación
      if (!eventData.location || !eventData.location.latitude || !eventData.location.longitude) {
        res.status(400).json({
          success: false,
          message: 'Ubicación es obligatoria',
          errors: {
            location: 'Las coordenadas son obligatorias para el evento'
          }
        });
        return;
      }

      // Validar bovino
      if (!eventData.bovineId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar un bovino',
          errors: {
            bovineId: 'El ID del bovino es obligatorio'
          }
        });
        return;
      }

      // Verificar que el bovino existe
      const bovine = await Bovine.findByPk(eventData.bovineId);
      if (!bovine || !bovine.isActive) {
        res.status(400).json({
          success: false,
          message: 'Bovino no encontrado',
          errors: {
            bovineId: 'El bovino no existe o está inactivo'
          }
        });
        return;
      }

      // Crear evento usando el modelo real
      const newEvent = await Event.create({
        bovineId: eventData.bovineId,
        eventType: eventData.eventType,
        title: eventData.title,
        description: eventData.description || '',
        status: EventStatus.SCHEDULED,
        priority: eventData.priority || EventPriority.MEDIUM,
        scheduledDate: eventData.scheduledDate,
        location: {
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
          altitude: eventData.location.altitude,
          accuracy: eventData.location.accuracy || 10,
          address: eventData.location.address,
          municipality: eventData.location.municipality,
          state: eventData.location.state,
          country: eventData.location.country || 'México'
        },
        veterinarianId: eventData.veterinarianId,
        cost: eventData.cost || 0,
        currency: eventData.currency || 'MXN',
        eventData: eventData.eventData,
        followUpRequired: eventData.followUpRequired || false,
        followUpDate: eventData.followUpDate,
        publicNotes: eventData.publicNotes,
        privateNotes: eventData.privateNotes,
        photos: eventData.photos || [],
        attachments: eventData.attachments || [],
        weatherConditions: eventData.weatherConditions,
        temperature: eventData.temperature,
        humidity: eventData.humidity,
        isActive: true,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: {
          event: newEvent
        }
      });

    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error inesperado al crear el evento'
        }
      });
    }
  };

  /**
   * Obtener lista de eventos con filtros
   * GET /api/events
   */
  public getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        eventType,
        status,
        priority,
        bovineId,
        veterinarianId,
        dateRange,
        location,
        searchTerm,
        costRange,
        createdBy,
        page = 1,
        limit = 20,
        sortBy = 'scheduledDate',
        sortOrder = 'DESC'
      }: EventFilters = req.query as any;

      // Construir filtros WHERE
      const whereConditions: any = { isActive: true };

      // Filtros específicos
      if (eventType) {
        const typeArray = Array.isArray(eventType) ? eventType : [eventType];
        whereConditions.eventType = { [Op.in]: typeArray };
      }
      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        whereConditions.status = { [Op.in]: statusArray };
      }
      if (priority) {
        const priorityArray = Array.isArray(priority) ? priority : [priority];
        whereConditions.priority = { [Op.in]: priorityArray };
      }
      if (bovineId) {
        whereConditions.bovineId = bovineId;
      }
      if (veterinarianId) {
        whereConditions.veterinarianId = veterinarianId;
      }
      if (createdBy) {
        whereConditions.createdBy = createdBy;
      }

      // Filtro por rango de fechas
      if (dateRange && (dateRange.startDate || dateRange.endDate)) {
        whereConditions.scheduledDate = {};
        if (dateRange.startDate) whereConditions.scheduledDate[Op.gte] = new Date(dateRange.startDate);
        if (dateRange.endDate) whereConditions.scheduledDate[Op.lte] = new Date(dateRange.endDate);
      }

      // Filtro por costo
      if (costRange && (costRange.min !== undefined || costRange.max !== undefined)) {
        whereConditions.cost = {};
        if (costRange.min !== undefined) whereConditions.cost[Op.gte] = costRange.min;
        if (costRange.max !== undefined) whereConditions.cost[Op.lte] = costRange.max;
      }

      // Filtro de búsqueda de texto
      if (searchTerm) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { publicNotes: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: events } = await Event.findAndCountAll({
        where: whereConditions,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder]],
        distinct: true
      });

      // Filtrar por proximidad geográfica si se especifica
      let filteredEvents = events;
      if (location && location.latitude && location.longitude && location.radius) {
        filteredEvents = events.filter(event => {
          if (!event.location) return false;
          const distance = this.calculateDistance(
            location.latitude, location.longitude,
            event.location.latitude, event.location.longitude
          );
          return distance <= location.radius;
        });
      }

      // Enriquecer eventos con información de bovinos
      const enrichedEvents = await Promise.all(
        filteredEvents.map(async (event: any) => {
          const bovine = await Bovine.findByPk(event.bovineId, {
            attributes: ['id', 'earTag', 'name', 'cattleType']
          });

          return {
            ...event.toJSON(),
            bovineInfo: bovine ? {
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              cattleType: bovine.cattleType
            } : null
          };
        })
      );

      // Preparar respuesta
      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        message: 'Eventos obtenidos exitosamente',
        data: {
          events: enrichedEvents,
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
      console.error('Error al obtener eventos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener los eventos'
        }
      });
    }
  };

  /**
   * Obtener evento específico por ID
   * GET /api/events/:id
   */
  public getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event || !event.isActive) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
          errors: {
            event: 'El evento especificado no existe'
          }
        });
        return;
      }

      // Obtener información del bovino
      const bovine = await Bovine.findByPk(event.bovineId, {
        attributes: ['id', 'earTag', 'name', 'cattleType', 'breed', 'gender']
      });

      // Obtener eventos relacionados (mismo bovino o tipo)
      const relatedEvents = await Event.findAll({
        where: {
          id: { [Op.ne]: event.id },
          [Op.or]: [
            { eventType: event.eventType },
            { bovineId: event.bovineId }
          ],
          isActive: true
        },
        limit: 5,
        order: [['scheduledDate', 'DESC']],
        attributes: ['id', 'title', 'eventType', 'scheduledDate', 'status']
      });

      res.status(200).json({
        success: true,
        message: 'Evento obtenido exitosamente',
        data: {
          event: {
            ...event.toJSON(),
            bovineInfo: bovine ? {
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              cattleType: bovine.cattleType,
              breed: bovine.breed,
              gender: bovine.gender
            } : null,
            relatedEvents: relatedEvents.map(e => e.toJSON())
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener el evento'
        }
      });
    }
  };

  /**
   * Actualizar evento
   * PUT /api/events/:id
   */
  public updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateEventRequest = req.body;
      const userId = (req as any).user?.id || 'system';

      // Buscar evento existente
      const existingEvent = await Event.findByPk(id);

      if (!existingEvent || !existingEvent.isActive) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
          errors: {
            event: 'El evento especificado no existe'
          }
        });
        return;
      }

      // Validar bovino si se está cambiando
      if (updateData.bovineId && updateData.bovineId !== existingEvent.bovineId) {
        const bovine = await Bovine.findByPk(updateData.bovineId);
        if (!bovine || !bovine.isActive) {
          res.status(400).json({
            success: false,
            message: 'Bovino no encontrado',
            errors: {
              bovineId: 'El bovino no existe o está inactivo'
            }
          });
          return;
        }
      }

      // Preparar datos de actualización
      const updatePayload: any = {
        title: updateData.title || existingEvent.title,
        description: updateData.description !== undefined ? updateData.description : existingEvent.description,
        eventType: updateData.eventType || existingEvent.eventType,
        scheduledDate: updateData.scheduledDate || existingEvent.scheduledDate,
        startDate: updateData.startDate !== undefined ? updateData.startDate : existingEvent.startDate,
        endDate: updateData.endDate !== undefined ? updateData.endDate : existingEvent.endDate,
        bovineId: updateData.bovineId || existingEvent.bovineId,
        status: updateData.status || existingEvent.status,
        priority: updateData.priority || existingEvent.priority,
        veterinarianId: updateData.veterinarianId !== undefined ? updateData.veterinarianId : existingEvent.veterinarianId,
        cost: updateData.cost !== undefined ? updateData.cost : existingEvent.cost,
        currency: updateData.currency || existingEvent.currency,
        eventData: updateData.eventData !== undefined ? updateData.eventData : existingEvent.eventData,
        followUpRequired: updateData.followUpRequired !== undefined ? updateData.followUpRequired : existingEvent.followUpRequired,
        followUpDate: updateData.followUpDate !== undefined ? updateData.followUpDate : existingEvent.followUpDate,
        publicNotes: updateData.publicNotes !== undefined ? updateData.publicNotes : existingEvent.publicNotes,
        privateNotes: updateData.privateNotes !== undefined ? updateData.privateNotes : existingEvent.privateNotes,
        photos: updateData.photos !== undefined ? updateData.photos : existingEvent.photos,
        attachments: updateData.attachments !== undefined ? updateData.attachments : existingEvent.attachments,
        results: updateData.results !== undefined ? updateData.results : existingEvent.results,
        complications: updateData.complications !== undefined ? updateData.complications : existingEvent.complications,
        followUpNotes: updateData.followUpNotes !== undefined ? updateData.followUpNotes : existingEvent.followUpNotes,
        weatherConditions: updateData.weatherConditions !== undefined ? updateData.weatherConditions : existingEvent.weatherConditions,
        temperature: updateData.temperature !== undefined ? updateData.temperature : existingEvent.temperature,
        humidity: updateData.humidity !== undefined ? updateData.humidity : existingEvent.humidity,
        performedBy: updateData.performedBy !== undefined ? updateData.performedBy : existingEvent.performedBy,
        updatedBy: userId
      };

      // Actualizar ubicación si se proporciona
      if (updateData.location) {
        updatePayload.location = {
          ...existingEvent.location,
          ...updateData.location
        };
      }

      // Actualizar evento
      await existingEvent.update(updatePayload);

      // Obtener evento actualizado
      const updatedEvent = await Event.findByPk(id);

      res.status(200).json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: {
          event: updatedEvent
        }
      });

    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al actualizar el evento'
        }
      });
    }
  };

  /**
   * Eliminar evento (soft delete)
   * DELETE /api/events/:id
   */
  public deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
          errors: {
            event: 'El evento especificado no existe'
          }
        });
        return;
      }

      // Usar soft delete del modelo Event
      await event.destroy();

      res.status(200).json({
        success: true,
        message: 'Evento eliminado exitosamente',
        data: {
          deleted: true
        }
      });

    } catch (error) {
      console.error('Error al eliminar evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al eliminar el evento'
        }
      });
    }
  };

  /**
   * Obtener timeline de eventos
   * GET /api/events/timeline
   */
  public getEventTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        eventType,
        bovineId,
        limit = 50
      } = req.query;

      // Establecer rango de fechas por defecto (últimos 30 días)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const dateRange = {
        startDate: startDate ? new Date(startDate as string) : defaultStartDate,
        endDate: endDate ? new Date(endDate as string) : defaultEndDate
      };

      const whereConditions: any = {
        scheduledDate: {
          [Op.between]: [dateRange.startDate, dateRange.endDate]
        },
        isActive: true
      };

      // Filtros adicionales
      if (eventType) whereConditions.eventType = eventType;
      if (bovineId) whereConditions.bovineId = bovineId;

      // Obtener eventos
      const events = await Event.findAll({
        where: whereConditions,
        order: [['scheduledDate', 'DESC']],
        limit: parseInt(limit.toString())
      });

      // Enriquecer con información de bovinos
      const timelineEvents = await Promise.all(
        events.map(async (event: any) => {
          const bovine = await Bovine.findByPk(event.bovineId, {
            attributes: ['id', 'earTag', 'name', 'cattleType']
          });

          const timelineItem: EventTimelineItem = {
            id: event.id,
            eventType: event.eventType,
            title: event.title,
            description: event.description || '',
            date: event.scheduledDate,
            status: event.status,
            priority: event.priority,
            bovineInfo: bovine ? {
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              cattleType: bovine.cattleType
            } : {
              id: 'unknown',
              earTag: 'N/A',
              cattleType: 'UNKNOWN'
            },
            location: {
              latitude: event.location.latitude,
              longitude: event.location.longitude,
              address: event.location.address
            },
            cost: event.cost,
            veterinarianId: event.veterinarianId,
            createdBy: event.createdBy,
            publicNotes: event.publicNotes,
            eventData: event.eventData
          };

          return timelineItem;
        })
      );

      // Calcular estadísticas de resumen
      const eventsByType: Record<string, number> = {};
      const eventsByStatus: Record<string, number> = {};
      let totalCost = 0;

      timelineEvents.forEach(event => {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
        eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;
        totalCost += event.cost || 0;
      });

      const timeline: EventTimeline = {
        events: timelineEvents,
        dateRange,
        summary: {
          totalEvents: timelineEvents.length,
          eventsByType: eventsByType as Record<EventType, number>,
          eventsByStatus: eventsByStatus as Record<EventStatus, number>,
          totalCost: Math.round(totalCost * 100) / 100
        }
      };

      res.status(200).json({
        success: true,
        message: 'Timeline de eventos obtenida exitosamente',
        data: {
          timeline
        }
      });

    } catch (error) {
      console.error('Error al obtener timeline:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener la timeline de eventos'
        }
      });
    }
  };

  /**
   * Obtener estadísticas de eventos
   * GET /api/events/statistics
   */
  public getEventStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange = 'monthly' } = req.query;

      // Establecer período para estadísticas
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
        case 'yearly':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      const whereConditions = {
        scheduledDate: { [Op.gte]: startDate },
        isActive: true
      };

      // Conteo total
      const totalEvents = await Event.count({ where: whereConditions });

      // Eventos por tipo
      const eventsByType = await Event.findAll({
        where: whereConditions,
        attributes: [
          'eventType',
          [fn('COUNT', col('eventType')), 'count']
        ],
        group: ['eventType'],
        raw: true
      }) as unknown as EventTypeCountResult[];

      // Eventos por estado
      const eventsByStatus = await Event.findAll({
        where: whereConditions,
        attributes: [
          'status',
          [fn('COUNT', col('status')), 'count']
        ],
        group: ['status'],
        raw: true
      }) as unknown as EventStatusCountResult[];

      // Eventos por prioridad
      const eventsByPriority = await Event.findAll({
        where: whereConditions,
        attributes: [
          'priority',
          [fn('COUNT', col('priority')), 'count']
        ],
        group: ['priority'],
        raw: true
      }) as unknown as EventPriorityCountResult[];

      // Costo total y promedio
      const costStats = await Event.findAll({
        where: whereConditions,
        attributes: [
          [fn('SUM', col('cost')), 'totalCost'],
          [fn('AVG', col('cost')), 'averageCost'],
          [fn('MIN', col('cost')), 'minCost'],
          [fn('MAX', col('cost')), 'maxCost']
        ],
        raw: true
      }) as unknown as CostStatsRawResult[];

      // Eventos próximos (próximos 7 días)
      const upcomingEvents = await Event.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.in]: [EventStatus.SCHEDULED] },
          isActive: true
        },
        order: [['scheduledDate', 'ASC']],
        limit: 10
      });

      const statistics = {
        totalEvents,
        eventsByType: this.formatTypeCountStats(eventsByType),
        eventsByStatus: this.formatStatusCountStats(eventsByStatus),
        eventsByPriority: this.formatPriorityCountStats(eventsByPriority),
        costStatistics: {
          total: Math.round((parseFloat(costStats[0]?.totalCost || '0') || 0) * 100) / 100,
          average: Math.round((parseFloat(costStats[0]?.averageCost || '0') || 0) * 100) / 100,
          minimum: Math.round((parseFloat(costStats[0]?.minCost || '0') || 0) * 100) / 100,
          maximum: Math.round((parseFloat(costStats[0]?.maxCost || '0') || 0) * 100) / 100
        },
        upcomingEvents: upcomingEvents.slice(0, 5),
        timeRange,
        period: { startDate, endDate: currentDate }
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas de eventos obtenidas exitosamente',
        data: { statistics }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al obtener las estadísticas'
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

  private formatTypeCountStats(stats: EventTypeCountResult[]): Record<string, number> {
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.eventType] = parseInt(stat.count);
    });
    return result;
  }

  private formatStatusCountStats(stats: EventStatusCountResult[]): Record<string, number> {
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.status] = parseInt(stat.count);
    });
    return result;
  }

  private formatPriorityCountStats(stats: EventPriorityCountResult[]): Record<string, number> {
    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat.priority] = parseInt(stat.count);
    });
    return result;
  }
}