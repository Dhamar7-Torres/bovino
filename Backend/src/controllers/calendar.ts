import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database'; // Importación corregida como default
import Event, { 
  EventType, 
  EventStatus, 
  EventPriority,
  RecurrenceType,
  EventSpecificData,
  NotificationConfig // Importar NotificationConfig del modelo
} from '../models/Event'; // Usando los tipos correctos del modelo Event
import Bovine from '../models/Bovine'; // Importación corregida
import Location from '../models/Location'; // Importación corregida

// Tipos para eventos del calendario (usando los del modelo Event)
type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'year';
type ReminderType = 'immediate' | '1_hour' | '3_hours' | '1_day' | '3_days' | '7_days';

// Interfaces para requests - adaptadas al modelo real
interface CreateEventRequest {
  title: string;
  description?: string;
  eventType: EventType; // Usando EventType del modelo
  scheduledDate: Date; // Cambiado de startDate + startTime
  startDate?: Date;
  endDate?: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  bovineId: string; // Cambiado de bovineIds (array) a bovineId (string)
  priority: EventPriority; // Usando EventPriority del modelo
  veterinarianId?: string; // Cambiado de veterinarianName
  cost?: number;
  currency?: string;
  eventData?: EventSpecificData; // Usando EventSpecificData del modelo
  tags?: string[]; // Este campo no existe en Event, se puede agregar a notes
  isRecurring?: boolean; // Para determinar si crear recurrencia
  recurrenceConfig?: {
    type: RecurrenceType;
    interval?: number;
    endDate?: Date;
    maxOccurrences?: number;
  };
  reminderSettings?: {
    enabled: boolean;
    recipients?: string[];
  };
  followUpRequired?: boolean;
  followUpDate?: Date;
  publicNotes?: string;
  privateNotes?: string;
  photos?: string[];
  attachments?: string[];
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
  status?: EventStatus;
}

interface CalendarFilters {
  eventTypes?: EventType[];
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus[];
  priority?: EventPriority[];
  bovineId?: string; // Cambiado de bovineIds
  veterinarianId?: string; // Cambiado de veterinarianName
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // en km
  };
  searchTerm?: string;
  view?: CalendarView;
  page?: number;
  limit?: number;
}

// Interface temporal para recordatorios (hasta implementar modelo Reminder)
// Nota: Se mapea a NotificationConfig del modelo Event
interface ReminderRequest {
  eventId: string;
  reminderType: ReminderType;
  customMessage?: string;
  recipients: string[];
  methods: ('EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP')[]; // Coincide con notificationMethods
}

// Interface temporal para programación de vacunación (hasta implementar modelo)
interface VaccinationScheduleRequest {
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  scheduledDate: Date;
  veterinarianId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  doseNumber: number;
  totalDoses: number;
  cost?: number;
  notes?: string;
}

export class CalendarController {
  /**
   * Crear nuevo evento en el calendario
   * POST /api/calendar/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventRequest = req.body;
      const userId = (req as any).user?.id || 'system';

      // Validaciones básicas
      if (!eventData.title || !eventData.eventType || !eventData.scheduledDate) {
        res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          errors: {
            general: 'Título, tipo de evento y fecha son obligatorios'
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

      // Validar que el bovino existe
      if (eventData.bovineId) {
        const bovine = await Bovine.findByPk(eventData.bovineId);
        if (!bovine) {
          res.status(404).json({
            success: false,
            message: 'Bovino no encontrado',
            errors: {
              bovineId: 'El bovino especificado no existe'
            }
          });
          return;
        }
      }

      // Crear evento
      const newEvent = await Event.create({
        bovineId: eventData.bovineId,
        eventType: eventData.eventType,
        title: eventData.title,
        description: eventData.description || '',
        status: EventStatus.SCHEDULED,
        priority: eventData.priority || EventPriority.MEDIUM,
        scheduledDate: eventData.scheduledDate,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: {
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
          address: eventData.location.address,
          municipality: eventData.location.municipality,
          state: eventData.location.state,
          country: eventData.location.country || 'México'
        },
        veterinarianId: eventData.veterinarianId,
        cost: eventData.cost || 0,
        currency: eventData.currency || 'MXN',
        eventData: eventData.eventData,
        recurrence: eventData.isRecurring ? {
          type: eventData.recurrenceConfig?.type || RecurrenceType.NONE,
          interval: eventData.recurrenceConfig?.interval,
          endDate: eventData.recurrenceConfig?.endDate,
          maxOccurrences: eventData.recurrenceConfig?.maxOccurrences
        } : undefined,
        notifications: eventData.reminderSettings ? {
          enabled: eventData.reminderSettings.enabled,
          advanceNotice: 1, // Por defecto 1 día antes
          reminderFrequency: 'DAILY',
          notificationMethods: ['EMAIL', 'PUSH'],
          recipients: eventData.reminderSettings.recipients || []
        } : undefined,
        followUpRequired: eventData.followUpRequired || false,
        followUpDate: eventData.followUpDate,
        publicNotes: eventData.publicNotes,
        privateNotes: eventData.privateNotes,
        photos: eventData.photos || [],
        attachments: eventData.attachments || [],
        isActive: true,
        createdBy: userId
      });

      // Crear eventos recurrentes si es necesario
      if (eventData.isRecurring && eventData.recurrenceConfig) {
        await this.createRecurringEvents(newEvent, eventData.recurrenceConfig);
      }

      // Obtener evento completo
      const eventWithDetails = await Event.findByPk(newEvent.id);

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: {
          event: eventWithDetails
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
   * Obtener eventos del calendario con filtros
   * GET /api/calendar/events
   */
  public getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        eventTypes,
        startDate,
        endDate,
        status,
        priority,
        bovineId,
        veterinarianId,
        tags,
        location,
        searchTerm,
        view = 'month',
        page = 1,
        limit = 50
      }: CalendarFilters = req.query as any;

      // Construir filtros WHERE
      const whereConditions: any = { isActive: true };

      // Filtro por fechas
      if (startDate || endDate) {
        whereConditions.scheduledDate = {};
        if (startDate) whereConditions.scheduledDate[Op.gte] = new Date(startDate);
        if (endDate) whereConditions.scheduledDate[Op.lte] = new Date(endDate);
      }

      // Filtros específicos
      if (eventTypes && Array.isArray(eventTypes)) {
        whereConditions.eventType = { [Op.in]: eventTypes };
      }
      if (status && Array.isArray(status)) {
        whereConditions.status = { [Op.in]: status };
      }
      if (priority && Array.isArray(priority)) {
        whereConditions.priority = { [Op.in]: priority };
      }
      if (bovineId) {
        whereConditions.bovineId = bovineId;
      }
      if (veterinarianId) {
        whereConditions.veterinarianId = veterinarianId;
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
      const limitNum = Math.min(parseInt(limit.toString()) || 50, 200);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: events } = await Event.findAndCountAll({
        where: whereConditions,
        limit: limitNum,
        offset: offset,
        order: [['scheduledDate', 'ASC']],
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

      // Preparar respuesta
      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        message: 'Eventos obtenidos exitosamente',
        data: {
          events: filteredEvents,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          },
          view: view
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
   * GET /api/calendar/events/:id
   */
  public getEventById = async (req: Request, res: Response): Promise<void> => {
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

      // Obtener información del bovino si existe
      let bovine = null;
      if (event.bovineId) {
        bovine = await Bovine.findByPk(event.bovineId, {
          attributes: ['id', 'earTag', 'name', 'cattleType', 'breed'] // Cambiado 'type' por 'cattleType'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Evento obtenido exitosamente',
        data: {
          event: {
            ...event.toJSON(),
            bovine: bovine
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
   * PUT /api/calendar/events/:id
   */
  public updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateEventRequest = req.body;
      const userId = (req as any).user?.id || 'system';

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

      // Validar bovino si se está cambiando
      if (updateData.bovineId && updateData.bovineId !== existingEvent.bovineId) {
        const bovine = await Bovine.findByPk(updateData.bovineId);
        if (!bovine) {
          res.status(404).json({
            success: false,
            message: 'Bovino no encontrado',
            errors: {
              bovineId: 'El bovino especificado no existe'
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
   * Eliminar evento
   * DELETE /api/calendar/events/:id
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
          general: 'Ocurrió un error al eliminar el evento'
        }
      });
    }
  };

  /**
   * Obtener estadísticas del calendario
   * GET /api/calendar/stats
   */
  public getCalendarStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      // Establecer rango de fechas (por defecto: mes actual)
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const whereConditions = {
        scheduledDate: {
          [Op.between]: [start, end]
        },
        isActive: true
      };

      // Conteo total de eventos
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

      // Próximos eventos (próximos 7 días)
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

      // Eventos vencidos
      const overdueEvents = await Event.count({
        where: {
          scheduledDate: { [Op.lt]: new Date() },
          status: EventStatus.SCHEDULED,
          isActive: true
        }
      });

      // Costo total de eventos
      const totalCost = await Event.sum('cost', { where: whereConditions }) || 0;

      const stats = {
        totalEvents,
        eventsByType: this.formatCountStats(eventsByType),
        eventsByStatus: this.formatCountStats(eventsByStatus),
        eventsByPriority: this.formatCountStats(eventsByPriority),
        upcomingEvents: upcomingEvents.slice(0, 5), // Solo los próximos 5
        overdueEvents,
        totalCost: Math.round(totalCost * 100) / 100,
        dateRange: { start, end }
      };

      res.status(200).json({
        success: true,
        message: 'Estadísticas del calendario obtenidas exitosamente',
        data: { stats }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas del calendario:', error);
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
   * Crear recordatorio para evento (funcionalidad simplificada)
   * POST /api/calendar/reminders
   */
  public createReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const reminderData: ReminderRequest = req.body;

      // Validar que el evento existe
      const event = await Event.findByPk(reminderData.eventId);
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

      // Calcular advanceNotice basado en reminderType
      let advanceNotice = 0;
      switch (reminderData.reminderType) {
        case '1_hour':
          advanceNotice = 0; // Notificar el mismo día
          break;
        case '1_day':
          advanceNotice = 1;
          break;
        case '3_days':
          advanceNotice = 3;
          break;
        case '7_days':
          advanceNotice = 7;
          break;
        default:
          advanceNotice = 0;
      }

      // Por ahora, solo actualizar las notificaciones del evento
      // En el futuro se puede crear un modelo Reminder separado
      await event.update({
        notifications: {
          enabled: true,
          advanceNotice: advanceNotice,
          reminderFrequency: 'DAILY',
          notificationMethods: reminderData.methods as ('EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP')[],
          recipients: reminderData.recipients
        }
      });

      res.status(201).json({
        success: true,
        message: 'Recordatorio creado exitosamente',
        data: {
          eventId: reminderData.eventId,
          reminderType: reminderData.reminderType,
          advanceNotice: advanceNotice,
          enabled: true
        }
      });

    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al crear el recordatorio'
        }
      });
    }
  };

  /**
   * Obtener eventos de vacunación programados
   * GET /api/calendar/vaccination-schedule
   */
  public getVaccinationSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, bovineId, status, vaccineType } = req.query;

      const whereConditions: any = {
        eventType: EventType.VACCINATION,
        isActive: true
      };

      // Filtros por fecha
      if (startDate || endDate) {
        whereConditions.scheduledDate = {};
        if (startDate) whereConditions.scheduledDate[Op.gte] = new Date(startDate as string);
        if (endDate) whereConditions.scheduledDate[Op.lte] = new Date(endDate as string);
      }

      // Filtros específicos
      if (bovineId) whereConditions.bovineId = bovineId;
      if (status) whereConditions.status = status;
      
      // Filtro por tipo de vacuna (en eventData)
      if (vaccineType) {
        whereConditions['eventData.vaccineType'] = { [Op.iLike]: `%${vaccineType}%` };
      }

      const vaccinationSchedule = await Event.findAll({
        where: whereConditions,
        order: [['scheduledDate', 'ASC']]
      });

      // Obtener información de bovinos para cada evento
      const scheduleWithBovines = await Promise.all(
        vaccinationSchedule.map(async (event) => {
          const bovine = await Bovine.findByPk(event.bovineId, {
            attributes: ['id', 'earTag', 'name', 'cattleType', 'breed']
          });
          
          return {
            ...event.toJSON(),
            bovine
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Programación de vacunación obtenida exitosamente',
        data: {
          schedule: scheduleWithBovines
        }
      });

    } catch (error) {
      console.error('Error al obtener programación de vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al obtener la programación'
        }
      });
    }
  };

  /**
   * Crear entrada en programación de vacunación
   * POST /api/calendar/vaccination-schedule
   */
  public createVaccinationSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleData: VaccinationScheduleRequest = req.body;
      const userId = (req as any).user?.id || 'system';

      // Validar que el bovino existe
      const bovine = await Bovine.findByPk(scheduleData.bovineId);
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

      // Crear evento de vacunación
      const vaccinationEvent = await Event.create({
        bovineId: scheduleData.bovineId,
        eventType: EventType.VACCINATION,
        title: `Vacunación: ${scheduleData.vaccineName}`,
        description: `Aplicación de vacuna ${scheduleData.vaccineName} - Dosis ${scheduleData.doseNumber}/${scheduleData.totalDoses}`,
        status: EventStatus.SCHEDULED,
        priority: EventPriority.MEDIUM,
        scheduledDate: scheduleData.scheduledDate,
        location: {
          latitude: scheduleData.location.latitude,
          longitude: scheduleData.location.longitude,
          address: scheduleData.location.address
        },
        veterinarianId: scheduleData.veterinarianId,
        cost: scheduleData.cost || 0,
        currency: 'MXN',
        eventData: {
          vaccineType: scheduleData.vaccineType,
          vaccineName: scheduleData.vaccineName,
          dosage: scheduleData.doseNumber,
          dosageUnit: 'dosis',
          applicationMethod: 'SUBCUTANEOUS' as const
        },
        followUpRequired: scheduleData.doseNumber < scheduleData.totalDoses,
        publicNotes: scheduleData.notes,
        isActive: true,
        createdBy: userId
      });

      // Obtener evento con información del bovino
      const eventWithBovine = await Event.findByPk(vaccinationEvent.id);
      const bovineInfo = await Bovine.findByPk(scheduleData.bovineId, {
        attributes: ['id', 'earTag', 'name', 'cattleType', 'breed']
      });

      res.status(201).json({
        success: true,
        message: 'Programación de vacunación creada exitosamente',
        data: {
          schedule: {
            ...eventWithBovine?.toJSON(),
            bovine: bovineInfo
          }
        }
      });

    } catch (error) {
      console.error('Error al crear programación de vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: error instanceof Error ? error.message : 'Ocurrió un error al crear la programación'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async createRecurringEvents(baseEvent: Event, recurrenceConfig: any): Promise<void> {
    try {
      const maxOccurrences = recurrenceConfig.maxOccurrences || 10;
      const interval = recurrenceConfig.interval || 1;
      
      // Crear eventos futuros basados en el patrón
      for (let i = 1; i < maxOccurrences; i++) {
        const nextDate = this.calculateNextRecurrenceDate(baseEvent.scheduledDate, recurrenceConfig.type, interval * i);
        
        // Verificar fecha límite
        if (recurrenceConfig.endDate && nextDate > recurrenceConfig.endDate) {
          break;
        }

        await Event.create({
          bovineId: baseEvent.bovineId,
          eventType: baseEvent.eventType,
          title: baseEvent.title,
          description: baseEvent.description,
          status: EventStatus.SCHEDULED,
          priority: baseEvent.priority,
          scheduledDate: nextDate,
          location: baseEvent.location,
          veterinarianId: baseEvent.veterinarianId,
          cost: baseEvent.cost,
          currency: baseEvent.currency,
          eventData: baseEvent.eventData,
          recurrence: baseEvent.recurrence,
          parentEventId: baseEvent.id,
          followUpRequired: baseEvent.followUpRequired,
          publicNotes: baseEvent.publicNotes,
          privateNotes: baseEvent.privateNotes,
          isActive: true,
          createdBy: baseEvent.createdBy
        });
      }
    } catch (error) {
      console.error('Error creando eventos recurrentes:', error);
    }
  }

  private calculateNextRecurrenceDate(baseDate: Date, type: RecurrenceType, multiplier: number): Date {
    const nextDate = new Date(baseDate);

    switch (type) {
      case RecurrenceType.DAILY:
        nextDate.setDate(nextDate.getDate() + multiplier);
        break;
      case RecurrenceType.WEEKLY:
        nextDate.setDate(nextDate.getDate() + (7 * multiplier));
        break;
      case RecurrenceType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + multiplier);
        break;
      case RecurrenceType.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + multiplier);
        break;
      default:
        break;
    }

    return nextDate;
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