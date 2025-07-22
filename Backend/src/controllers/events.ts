import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/database';
import { 
  Event, 
  Bovine, 
  Location, 
  User,
  Vaccination,
  Illness,
  Finance
} from '../models';
import { EventsService } from '../services/events.service';

// Tipos de eventos del ganado
type EventType = 
  | 'vaccination' 
  | 'illness' 
  | 'reproductive' 
  | 'transfer' 
  | 'management' 
  | 'health_check' 
  | 'feeding' 
  | 'milking' 
  | 'pregnancy_check' 
  | 'birth' 
  | 'death'
  | 'purchase'
  | 'sale'
  | 'transport'
  | 'emergency'
  | 'breeding'
  | 'treatment'
  | 'maintenance';

type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'failed';
type EventPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
type ReproductiveEventType = 'heat_detection' | 'artificial_insemination' | 'natural_breeding' | 'pregnancy_diagnosis' | 'calving' | 'weaning' | 'dry_off' | 'abortion';
type TransferType = 'within_farm' | 'to_another_farm' | 'to_slaughter' | 'to_market' | 'quarantine' | 'pasture_rotation';
type ManagementType = 'weighing' | 'tagging' | 'dehorning' | 'castration' | 'hoof_trimming' | 'grooming';

// Interfaces para eventos
interface CreateEventRequest {
  type: EventType;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime?: string;
  duration?: number; // en minutos
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    section?: string;
  };
  bovineIds: string[];
  priority: EventPriority;
  veterinarianName?: string;
  cost?: number;
  tags?: string[];
  notes?: string;
  
  // Detalles específicos por tipo de evento
  vaccinationDetails?: {
    vaccineType: string;
    vaccineName: string;
    dose: string;
    batchNumber?: string;
    manufacturer?: string;
    nextDueDate?: Date;
    sideEffects?: string[];
  };
  
  illnessDetails?: {
    diseaseName: string;
    symptoms: string[];
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    diagnosis: string;
    treatment?: string;
    isContagious: boolean;
    expectedRecoveryDate?: Date;
  };
  
  reproductiveDetails?: {
    eventType: ReproductiveEventType;
    bullId?: string;
    semenBatch?: string;
    technician?: string;
    success?: boolean;
    expectedDueDate?: Date;
    calvingDifficulty?: 'easy' | 'moderate' | 'difficult' | 'assisted' | 'cesarean';
    offspringInfo?: {
      gender: 'male' | 'female';
      weight: number;
      health: string;
    };
  };
  
  transferDetails?: {
    transferType: TransferType;
    fromLocation: string;
    toLocation: string;
    reason: string;
    transportMethod?: string;
    driverName?: string;
    vehiclePlate?: string;
    distance?: number;
    estimatedDuration?: number;
  };
  
  managementDetails?: {
    managementType: ManagementType;
    equipment?: string[];
    measurements?: {
      weight?: number;
      height?: number;
      bodyCondition?: number;
    };
    results?: string;
  };
  
  purchaseSaleDetails?: {
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    buyerSeller: string;
    paymentMethod?: string;
    contractNumber?: string;
    quality?: string;
    weight?: number;
  };
  
  feedingDetails?: {
    feedType: string;
    quantity: number;
    unit: string;
    supplier?: string;
    nutritionalInfo?: {
      protein: number;
      energy: number;
      fiber: number;
    };
  };
  
  emergencyDetails?: {
    emergencyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    responseTime?: number;
    actionsToken?: string[];
    outcome?: string;
    followUpRequired?: boolean;
  };
  
  weatherConditions?: {
    temperature?: number;
    humidity?: number;
    condition?: string;
    windSpeed?: number;
  };
  
  metadata?: Record<string, any>;
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
  status?: EventStatus;
  completedDate?: Date;
  actualDuration?: number;
  actualCost?: number;
  completionNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

interface EventFilters {
  type?: EventType[];
  status?: EventStatus[];
  priority?: EventPriority[];
  bovineIds?: string[];
  veterinarianName?: string;
  tags?: string[];
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
  type: EventType;
  title: string;
  description: string;
  date: Date;
  time?: string;
  status: EventStatus;
  priority: EventPriority;
  bovineInfo: Array<{
    id: string;
    earTag: string;
    name?: string;
    type: string;
  }>;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    section?: string;
  };
  cost?: number;
  veterinarianName?: string;
  tags: string[];
  createdBy: string;
  notes?: string;
  details: Record<string, any>;
}

export class EventsController {
  private eventsService: EventsService;

  constructor() {
    this.eventsService = new EventsService();
  }

  /**
   * Crear nuevo evento
   * POST /api/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!eventData.type || !eventData.title || !eventData.scheduledDate) {
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

      // Validar bovinos
      if (!eventData.bovineIds || eventData.bovineIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar al menos un bovino',
          errors: {
            bovineIds: 'Al menos un bovino debe estar asociado al evento'
          }
        });
        return;
      }

      // Verificar que todos los bovinos existen
      const bovines = await Bovine.findAll({
        where: {
          id: { [Op.in]: eventData.bovineIds },
          isActive: true
        }
      });

      if (bovines.length !== eventData.bovineIds.length) {
        res.status(400).json({
          success: false,
          message: 'Algunos bovinos no fueron encontrados',
          errors: {
            bovineIds: 'Uno o más bovinos no existen o están inactivos'
          }
        });
        return;
      }

      // Crear ubicación
      const locationRecord = await Location.create({
        latitude: eventData.location.latitude,
        longitude: eventData.location.longitude,
        address: eventData.location.address || '',
        section: eventData.location.section || '',
        accuracy: 10,
        timestamp: new Date()
      });

      // Crear evento base
      const newEvent = await Event.create({
        type: eventData.type,
        title: eventData.title,
        description: eventData.description || '',
        scheduledDate: eventData.scheduledDate,
        scheduledTime: eventData.scheduledTime || '09:00',
        duration: eventData.duration || 60,
        locationId: locationRecord.id,
        bovineIds: eventData.bovineIds,
        status: 'scheduled',
        priority: eventData.priority,
        veterinarianName: eventData.veterinarianName || '',
        cost: eventData.cost || 0,
        tags: eventData.tags || [],
        notes: eventData.notes || '',
        weatherConditions: eventData.weatherConditions || {},
        metadata: eventData.metadata || {},
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear registros específicos según el tipo de evento
      await this.createSpecificEventDetails(newEvent.id, eventData);

      // Crear entrada financiera si hay costo
      if (eventData.cost && eventData.cost > 0) {
        await Finance.create({
          type: eventData.type === 'sale' ? 'income' : 'expense',
          category: this.getFinanceCategoryFromEventType(eventData.type),
          amount: eventData.cost,
          date: eventData.scheduledDate,
          description: `${eventData.title} - ${eventData.description}`,
          bovineIds: eventData.bovineIds,
          eventId: newEvent.id,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Obtener evento completo con asociaciones
      const eventWithDetails = await Event.findByPk(newEvent.id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      // Agregar información de bovinos
      const bovineInfo = bovines.map(bovine => ({
        id: bovine.id,
        earTag: bovine.earTag,
        name: bovine.name,
        type: bovine.type
      }));

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: {
          event: {
            ...eventWithDetails.toJSON(),
            bovineInfo
          }
        }
      });

    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error inesperado al crear el evento'
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
        type,
        status,
        priority,
        bovineIds,
        veterinarianName,
        tags,
        dateRange,
        location,
        searchTerm,
        costRange,
        createdBy,
        page = 1,
        limit = 20,
        sortBy = 'scheduledDate',
        sortOrder = 'DESC'
      }: EventFilters = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {};

      // Filtros específicos
      if (type) {
        const typeArray = Array.isArray(type) ? type : [type];
        whereConditions.type = { [Op.in]: typeArray };
      }
      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        whereConditions.status = { [Op.in]: statusArray };
      }
      if (priority) {
        const priorityArray = Array.isArray(priority) ? priority : [priority];
        whereConditions.priority = { [Op.in]: priorityArray };
      }
      if (veterinarianName) {
        whereConditions.veterinarianName = { [Op.iLike]: `%${veterinarianName}%` };
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
          { veterinarianName: { [Op.iLike]: `%${searchTerm}%` } },
          { notes: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Filtros de bovinos
      if (bovineIds && Array.isArray(bovineIds)) {
        whereConditions[Op.or] = bovineIds.map(id => ({
          bovineIds: { [Op.contains]: [id] }
        }));
      }

      // Filtros por tags
      if (tags && Array.isArray(tags)) {
        whereConditions[Op.and] = tags.map(tag => ({
          tags: { [Op.contains]: [tag] }
        }));
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: events } = await Event.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
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
          const bovines = await Bovine.findAll({
            where: {
              id: { [Op.in]: event.bovineIds },
              isActive: true
            },
            attributes: ['id', 'earTag', 'name', 'type']
          });

          return {
            ...event.toJSON(),
            bovineInfo: bovines.map(bovine => ({
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              type: bovine.type
            }))
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
          general: 'Ocurrió un error al obtener los eventos'
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

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

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

      // Obtener información de bovinos
      const bovines = await Bovine.findAll({
        where: {
          id: { [Op.in]: (event as any).bovineIds },
          isActive: true
        },
        attributes: ['id', 'earTag', 'name', 'type', 'breed', 'gender']
      });

      // Obtener detalles específicos según el tipo de evento
      const specificDetails = await this.getSpecificEventDetails(event.id, (event as any).type);

      // Obtener eventos relacionados (mismo bovino, tipo similar)
      const relatedEvents = await Event.findAll({
        where: {
          id: { [Op.ne]: event.id },
          [Op.or]: [
            { type: (event as any).type },
            { bovineIds: { [Op.overlap]: (event as any).bovineIds } }
          ]
        },
        limit: 5,
        order: [['scheduledDate', 'DESC']],
        attributes: ['id', 'title', 'type', 'scheduledDate', 'status']
      });

      res.status(200).json({
        success: true,
        message: 'Evento obtenido exitosamente',
        data: {
          event: {
            ...(event as any).toJSON(),
            bovineInfo: bovines.map(bovine => ({
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              type: bovine.type,
              breed: bovine.breed,
              gender: bovine.gender
            })),
            specificDetails,
            relatedEvents: relatedEvents.map((e: any) => e.toJSON())
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener el evento'
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

      // Buscar evento existente
      const existingEvent = await Event.findByPk(id);

      if (!existingEvent) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
          errors: {
            event: 'El evento especificado no existe'
          }
        });
        return;
      }

      // Actualizar ubicación si se proporciona
      if (updateData.location) {
        await Location.update(
          {
            latitude: updateData.location.latitude,
            longitude: updateData.location.longitude,
            address: updateData.location.address || '',
            section: updateData.location.section || '',
            timestamp: new Date()
          },
          { where: { id: (existingEvent as any).locationId } }
        );
      }

      // Actualizar evento
      const updateFields = {
        type: updateData.type || (existingEvent as any).type,
        title: updateData.title || (existingEvent as any).title,
        description: updateData.description !== undefined ? updateData.description : (existingEvent as any).description,
        scheduledDate: updateData.scheduledDate || (existingEvent as any).scheduledDate,
        scheduledTime: updateData.scheduledTime || (existingEvent as any).scheduledTime,
        duration: updateData.duration !== undefined ? updateData.duration : (existingEvent as any).duration,
        bovineIds: updateData.bovineIds !== undefined ? updateData.bovineIds : (existingEvent as any).bovineIds,
        status: updateData.status || (existingEvent as any).status,
        priority: updateData.priority || (existingEvent as any).priority,
        veterinarianName: updateData.veterinarianName !== undefined ? updateData.veterinarianName : (existingEvent as any).veterinarianName,
        cost: updateData.cost !== undefined ? updateData.cost : (existingEvent as any).cost,
        actualCost: updateData.actualCost !== undefined ? updateData.actualCost : (existingEvent as any).actualCost,
        tags: updateData.tags !== undefined ? updateData.tags : (existingEvent as any).tags,
        notes: updateData.notes !== undefined ? updateData.notes : (existingEvent as any).notes,
        completedDate: updateData.completedDate || (existingEvent as any).completedDate,
        actualDuration: updateData.actualDuration !== undefined ? updateData.actualDuration : (existingEvent as any).actualDuration,
        completionNotes: updateData.completionNotes !== undefined ? updateData.completionNotes : (existingEvent as any).completionNotes,
        followUpRequired: updateData.followUpRequired !== undefined ? updateData.followUpRequired : (existingEvent as any).followUpRequired,
        followUpDate: updateData.followUpDate || (existingEvent as any).followUpDate,
        weatherConditions: updateData.weatherConditions !== undefined ? updateData.weatherConditions : (existingEvent as any).weatherConditions,
        metadata: updateData.metadata !== undefined ? updateData.metadata : (existingEvent as any).metadata,
        updatedAt: new Date()
      };

      await existingEvent.update(updateFields);

      // Actualizar detalles específicos si se proporcionan
      await this.updateSpecificEventDetails(id, updateData);

      // Actualizar entrada financiera si cambió el costo
      if (updateData.cost !== undefined || updateData.actualCost !== undefined) {
        const finalCost = updateData.actualCost || updateData.cost || (existingEvent as any).cost;
        await Finance.update(
          {
            amount: finalCost,
            updatedAt: new Date()
          },
          { where: { eventId: id } }
        );
      }

      // Obtener evento actualizado
      const updatedEvent = await Event.findByPk(id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

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
          general: 'Ocurrió un error al actualizar el evento'
        }
      });
    }
  };

  /**
   * Eliminar evento
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

      // Eliminar entradas financieras asociadas
      await Finance.destroy({
        where: { eventId: id }
      });

      // Eliminar detalles específicos del evento
      await this.deleteSpecificEventDetails(id, (event as any).type);

      // Eliminar evento
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
          general: 'Ocurrió un error al eliminar el evento'
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
        type,
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
        }
      };

      // Filtros adicionales
      if (type) whereConditions.type = type;
      if (bovineId) {
        whereConditions.bovineIds = { [Op.contains]: [bovineId] };
      }

      // Obtener eventos
      const events = await Event.findAll({
        where: whereConditions,
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['firstName', 'lastName']
          }
        ],
        order: [['scheduledDate', 'DESC'], ['scheduledTime', 'ASC']],
        limit: parseInt(limit.toString())
      });

      // Enriquecer con información de bovinos
      const timelineEvents = await Promise.all(
        events.map(async (event: any) => {
          const bovines = await Bovine.findAll({
            where: {
              id: { [Op.in]: event.bovineIds },
              isActive: true
            },
            attributes: ['id', 'earTag', 'name', 'type']
          });

          const timelineItem: EventTimelineItem = {
            id: event.id,
            type: event.type,
            title: event.title,
            description: event.description || '',
            date: event.scheduledDate,
            time: event.scheduledTime,
            status: event.status,
            priority: event.priority,
            bovineInfo: bovines.map(bovine => ({
              id: bovine.id,
              earTag: bovine.earTag,
              name: bovine.name,
              type: bovine.type
            })),
            location: {
              latitude: event.location.latitude,
              longitude: event.location.longitude,
              address: event.location.address,
              section: event.location.section
            },
            cost: event.cost,
            veterinarianName: event.veterinarianName,
            tags: event.tags || [],
            createdBy: event.creator ? `${event.creator.firstName} ${event.creator.lastName}` : 'Desconocido',
            notes: event.notes,
            details: event.metadata || {}
          };

          return timelineItem;
        })
      );

      // Calcular estadísticas de resumen
      const eventsByType: Record<string, number> = {};
      const eventsByStatus: Record<string, number> = {};
      let totalCost = 0;

      timelineEvents.forEach(event => {
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
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
          general: 'Ocurrió un error al obtener la timeline de eventos'
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
        scheduledDate: { [Op.gte]: startDate }
      };

      // Conteo total
      const totalEvents = await Event.count({ where: whereConditions });

      // Eventos por tipo
      const eventsByType = await Event.findAll({
        where: whereConditions,
        attributes: [
          'type',
          [fn('COUNT', col('type')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      // Eventos por estado
      const eventsByStatus = await Event.findAll({
        where: whereConditions,
        attributes: [
          'status',
          [fn('COUNT', col('status')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Eventos por prioridad
      const eventsByPriority = await Event.findAll({
        where: whereConditions,
        attributes: [
          'priority',
          [fn('COUNT', col('priority')), 'count']
        ],
        group: ['priority'],
        raw: true
      });

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
      });

      // Eventos próximos (próximos 7 días)
      const upcomingEvents = await Event.findAll({
        where: {
          scheduledDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.in]: ['scheduled', 'in_progress'] }
        },
        include: [{
          model: Location,
          as: 'location'
        }],
        order: [['scheduledDate', 'ASC']],
        limit: 10
      });

      // Veterinarios más activos
      const activeVeterinarians = await Event.findAll({
        where: {
          ...whereConditions,
          veterinarianName: { [Op.ne]: '' }
        },
        attributes: [
          'veterinarianName',
          [fn('COUNT', col('veterinarianName')), 'eventCount']
        ],
        group: ['veterinarianName'],
        order: [[fn('COUNT', col('veterinarianName')), 'DESC']],
        limit: 5,
        raw: true
      });

      const statistics = {
        totalEvents,
        eventsByType: this.formatCountStats(eventsByType),
        eventsByStatus: this.formatCountStats(eventsByStatus),
        eventsByPriority: this.formatCountStats(eventsByPriority),
        costStatistics: {
          total: Math.round((parseFloat(costStats[0]?.totalCost) || 0) * 100) / 100,
          average: Math.round((parseFloat(costStats[0]?.averageCost) || 0) * 100) / 100,
          minimum: Math.round((parseFloat(costStats[0]?.minCost) || 0) * 100) / 100,
          maximum: Math.round((parseFloat(costStats[0]?.maxCost) || 0) * 100) / 100
        },
        upcomingEvents: upcomingEvents.slice(0, 5),
        activeVeterinarians: activeVeterinarians.map((vet: any) => ({
          name: vet.veterinarianName,
          eventCount: parseInt(vet.eventCount)
        })),
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
          general: 'Ocurrió un error al obtener las estadísticas'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async createSpecificEventDetails(eventId: string, eventData: CreateEventRequest): Promise<void> {
    // Crear detalles específicos según el tipo de evento
    switch (eventData.type) {
      case 'vaccination':
        if (eventData.vaccinationDetails) {
          await Vaccination.create({
            bovineId: eventData.bovineIds[0], // Primer bovino para el registro principal
            vaccineType: eventData.vaccinationDetails.vaccineType,
            vaccineName: eventData.vaccinationDetails.vaccineName,
            dose: eventData.vaccinationDetails.dose,
            applicationDate: eventData.scheduledDate,
            nextDueDate: eventData.vaccinationDetails.nextDueDate,
            veterinarianName: eventData.veterinarianName || '',
            batchNumber: eventData.vaccinationDetails.batchNumber || '',
            manufacturer: eventData.vaccinationDetails.manufacturer || '',
            location: eventData.location,
            notes: eventData.notes || '',
            sideEffects: eventData.vaccinationDetails.sideEffects || [],
            eventId: eventId,
            createdAt: new Date()
          });
        }
        break;
      
      case 'illness':
        if (eventData.illnessDetails) {
          await Illness.create({
            bovineId: eventData.bovineIds[0],
            diseaseName: eventData.illnessDetails.diseaseName,
            diagnosisDate: eventData.scheduledDate,
            symptoms: eventData.illnessDetails.symptoms,
            severity: eventData.illnessDetails.severity,
            treatment: eventData.illnessDetails.treatment || '',
            veterinarianName: eventData.veterinarianName || '',
            recoveryDate: eventData.illnessDetails.expectedRecoveryDate,
            location: eventData.location,
            notes: eventData.notes || '',
            isContagious: eventData.illnessDetails.isContagious,
            eventId: eventId,
            createdAt: new Date()
          });
        }
        break;
      
      // Agregar más casos según sea necesario
      default:
        // Para otros tipos de eventos, almacenar los detalles en metadata
        break;
    }
  }

  private async updateSpecificEventDetails(eventId: string, updateData: UpdateEventRequest): Promise<void> {
    // Actualizar detalles específicos según el tipo de evento
    if (updateData.vaccinationDetails && updateData.type === 'vaccination') {
      await Vaccination.update(
        {
          vaccineType: updateData.vaccinationDetails.vaccineType,
          vaccineName: updateData.vaccinationDetails.vaccineName,
          dose: updateData.vaccinationDetails.dose,
          nextDueDate: updateData.vaccinationDetails.nextDueDate,
          veterinarianName: updateData.veterinarianName,
          batchNumber: updateData.vaccinationDetails.batchNumber,
          manufacturer: updateData.vaccinationDetails.manufacturer,
          notes: updateData.notes,
          sideEffects: updateData.vaccinationDetails.sideEffects,
          updatedAt: new Date()
        },
        { where: { eventId: eventId } }
      );
    }

    if (updateData.illnessDetails && updateData.type === 'illness') {
      await Illness.update(
        {
          diseaseName: updateData.illnessDetails.diseaseName,
          symptoms: updateData.illnessDetails.symptoms,
          severity: updateData.illnessDetails.severity,
          treatment: updateData.illnessDetails.treatment,
          veterinarianName: updateData.veterinarianName,
          recoveryDate: updateData.illnessDetails.expectedRecoveryDate,
          notes: updateData.notes,
          isContagious: updateData.illnessDetails.isContagious,
          updatedAt: new Date()
        },
        { where: { eventId: eventId } }
      );
    }
  }

  private async deleteSpecificEventDetails(eventId: string, eventType: EventType): Promise<void> {
    // Eliminar detalles específicos según el tipo de evento
    switch (eventType) {
      case 'vaccination':
        await Vaccination.destroy({ where: { eventId: eventId } });
        break;
      case 'illness':
        await Illness.destroy({ where: { eventId: eventId } });
        break;
      // Agregar más casos según sea necesario
    }
  }

  private async getSpecificEventDetails(eventId: string, eventType: EventType): Promise<any> {
    // Obtener detalles específicos según el tipo de evento
    switch (eventType) {
      case 'vaccination':
        return await Vaccination.findOne({ where: { eventId: eventId } });
      case 'illness':
        return await Illness.findOne({ where: { eventId: eventId } });
      default:
        return null;
    }
  }

  private getFinanceCategoryFromEventType(eventType: EventType): string {
    const categoryMap: Record<EventType, string> = {
      vaccination: 'veterinary',
      illness: 'veterinary',
      treatment: 'veterinary',
      health_check: 'veterinary',
      feeding: 'feed',
      purchase: 'livestock',
      sale: 'livestock',
      transport: 'transportation',
      breeding: 'breeding',
      reproductive: 'breeding',
      management: 'management',
      maintenance: 'maintenance',
      emergency: 'emergency',
      birth: 'breeding',
      death: 'livestock',
      transfer: 'management',
      milking: 'production',
      pregnancy_check: 'veterinary'
    };

    return categoryMap[eventType] || 'other';
  }

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
      const key = stat[Object.keys(stat)[0]];
      result[key] = parseInt(stat.count);
    });
    return result;
  }
}