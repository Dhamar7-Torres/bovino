import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import { sequelize } from '../config/database';
import { Event, Reminder, Bovine, Location, VaccinationSchedule } from '../models';
import { CalendarService } from '../services/calendar';

// Tipos para eventos del calendario
type EventType = 
  | 'vaccination' 
  | 'breeding' 
  | 'health' 
  | 'feeding' 
  | 'general' 
  | 'veterinary' 
  | 'checkup' 
  | 'birth' 
  | 'emergency' 
  | 'purchase' 
  | 'sale' 
  | 'treatment' 
  | 'appointment';

type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'overdue' | 'in_progress';
type EventPriority = 'low' | 'medium' | 'high' | 'urgent';
type ReminderType = 'immediate' | '1_hour' | '3_hours' | '1_day' | '3_days' | '7_days';
type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'year';

// Interfaces para requests
interface CreateEventRequest {
  title: string;
  description?: string;
  eventType: EventType;
  startDate: Date;
  startTime: string;
  endDate?: Date;
  endTime?: string;
  duration?: number; // en minutos
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    section?: string;
  };
  bovineIds?: string[];
  priority: EventPriority;
  veterinarianName?: string;
  cost?: number;
  tags?: string[];
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
  };
  reminderSettings: {
    enabled: boolean;
    types: ReminderType[];
    recipients?: string[];
    customMessage?: string;
  };
  notes?: string;
  metadata?: Record<string, any>;
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
  bovineIds?: string[];
  veterinarianName?: string;
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

interface ReminderRequest {
  eventId: string;
  reminderType: ReminderType;
  customMessage?: string;
  recipients: string[];
  methods: ('email' | 'sms' | 'push' | 'whatsapp')[];
}

interface VaccinationScheduleRequest {
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  scheduledDate: Date;
  scheduledTime: string;
  veterinarianName: string;
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
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  /**
   * Crear nuevo evento en el calendario
   * POST /api/calendar/events
   */
  public createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData: CreateEventRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
      if (!eventData.title || !eventData.eventType || !eventData.startDate) {
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

      // Crear registro de ubicación
      const locationRecord = await Location.create({
        latitude: eventData.location.latitude,
        longitude: eventData.location.longitude,
        address: eventData.location.address || '',
        section: eventData.location.section || '',
        accuracy: 10,
        timestamp: new Date()
      });

      // Calcular fecha y hora de fin si no se proporciona
      const startDateTime = new Date(`${eventData.startDate.toISOString().split('T')[0]}T${eventData.startTime}`);
      let endDateTime = eventData.endDate && eventData.endTime 
        ? new Date(`${eventData.endDate.toISOString().split('T')[0]}T${eventData.endTime}`)
        : null;

      if (!endDateTime && eventData.duration) {
        endDateTime = new Date(startDateTime.getTime() + (eventData.duration * 60000));
      }

      // Crear evento
      const newEvent = await Event.create({
        title: eventData.title,
        description: eventData.description || '',
        eventType: eventData.eventType,
        startDate: eventData.startDate,
        startTime: eventData.startTime,
        endDate: eventData.endDate || eventData.startDate,
        endTime: eventData.endTime || eventData.startTime,
        duration: eventData.duration || 60,
        locationId: locationRecord.id,
        bovineIds: eventData.bovineIds || [],
        status: 'scheduled',
        priority: eventData.priority,
        veterinarianName: eventData.veterinarianName || '',
        cost: eventData.cost || 0,
        tags: eventData.tags || [],
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern || null,
        notes: eventData.notes || '',
        metadata: eventData.metadata || {},
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear recordatorios si están habilitados
      if (eventData.reminderSettings.enabled) {
        await this.createEventReminders(newEvent.id, eventData.reminderSettings, startDateTime);
      }

      // Crear eventos recurrentes si es necesario
      if (eventData.isRecurring && eventData.recurrencePattern) {
        await this.createRecurringEvents(newEvent, eventData.recurrencePattern);
      }

      // Obtener evento completo con asociaciones
      const eventWithDetails = await Event.findByPk(newEvent.id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Reminder,
            as: 'reminders'
          }
        ]
      });

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
          general: 'Ocurrió un error inesperado al crear el evento'
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
        bovineIds,
        veterinarianName,
        tags,
        location,
        searchTerm,
        view = 'month',
        page = 1,
        limit = 50
      }: CalendarFilters = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {};

      // Filtro por fechas
      if (startDate || endDate) {
        whereConditions.startDate = {};
        if (startDate) whereConditions.startDate[Op.gte] = new Date(startDate);
        if (endDate) whereConditions.startDate[Op.lte] = new Date(endDate);
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
      if (veterinarianName) {
        whereConditions.veterinarianName = { [Op.iLike]: `%${veterinarianName}%` };
      }

      // Filtro de búsqueda de texto
      if (searchTerm) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { veterinarianName: { [Op.iLike]: `%${searchTerm}%` } }
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
      const limitNum = Math.min(parseInt(limit.toString()) || 50, 200);
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
            model: Reminder,
            as: 'reminders',
            where: { isActive: true },
            required: false
          }
        ],
        limit: limitNum,
        offset: offset,
        order: [['startDate', 'ASC'], ['startTime', 'ASC']],
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

      const event = await Event.findByPk(id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Reminder,
            as: 'reminders'
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

      // Obtener información de bovinos si existen
      let bovines = [];
      if (event.bovineIds && event.bovineIds.length > 0) {
        bovines = await Bovine.findAll({
          where: {
            id: { [Op.in]: event.bovineIds },
            isActive: true
          },
          attributes: ['id', 'earTag', 'name', 'type', 'breed']
        });
      }

      res.status(200).json({
        success: true,
        message: 'Evento obtenido exitosamente',
        data: {
          event: {
            ...event.toJSON(),
            bovines: bovines
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
          { where: { id: existingEvent.locationId } }
        );
      }

      // Actualizar evento
      await existingEvent.update({
        title: updateData.title || existingEvent.title,
        description: updateData.description !== undefined ? updateData.description : existingEvent.description,
        eventType: updateData.eventType || existingEvent.eventType,
        startDate: updateData.startDate || existingEvent.startDate,
        startTime: updateData.startTime || existingEvent.startTime,
        endDate: updateData.endDate || existingEvent.endDate,
        endTime: updateData.endTime || existingEvent.endTime,
        duration: updateData.duration !== undefined ? updateData.duration : existingEvent.duration,
        bovineIds: updateData.bovineIds !== undefined ? updateData.bovineIds : existingEvent.bovineIds,
        status: updateData.status || existingEvent.status,
        priority: updateData.priority || existingEvent.priority,
        veterinarianName: updateData.veterinarianName !== undefined ? updateData.veterinarianName : existingEvent.veterinarianName,
        cost: updateData.cost !== undefined ? updateData.cost : existingEvent.cost,
        tags: updateData.tags !== undefined ? updateData.tags : existingEvent.tags,
        notes: updateData.notes !== undefined ? updateData.notes : existingEvent.notes,
        metadata: updateData.metadata !== undefined ? updateData.metadata : existingEvent.metadata,
        updatedAt: new Date()
      });

      // Obtener evento actualizado
      const updatedEvent = await Event.findByPk(id, {
        include: [
          {
            model: Location,
            as: 'location'
          },
          {
            model: Reminder,
            as: 'reminders'
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

      // Eliminar recordatorios asociados
      await Reminder.destroy({
        where: { eventId: id }
      });

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
        startDate: {
          [Op.between]: [start, end]
        }
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
          startDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.in]: ['scheduled', 'in_progress'] }
        },
        include: [{
          model: Location,
          as: 'location'
        }],
        order: [['startDate', 'ASC']],
        limit: 10
      });

      // Eventos vencidos
      const overdueEvents = await Event.count({
        where: {
          startDate: { [Op.lt]: new Date() },
          status: 'scheduled'
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
   * Crear recordatorio para evento
   * POST /api/calendar/reminders
   */
  public createReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const reminderData: ReminderRequest = req.body;
      const userId = (req as any).user?.id;

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

      // Calcular fecha/hora del recordatorio
      const eventDateTime = new Date(`${event.startDate.toISOString().split('T')[0]}T${event.startTime}`);
      const reminderDateTime = this.calculateReminderDateTime(eventDateTime, reminderData.reminderType);

      // Crear recordatorio
      const reminder = await Reminder.create({
        eventId: reminderData.eventId,
        eventTitle: event.title,
        eventType: event.eventType,
        eventDate: event.startDate,
        eventTime: event.startTime,
        reminderType: reminderData.reminderType,
        reminderTime: reminderDateTime,
        status: 'scheduled',
        recipients: reminderData.recipients,
        methods: reminderData.methods,
        priority: event.priority,
        message: reminderData.customMessage || this.generateDefaultReminderMessage(event),
        isRecurring: event.isRecurring,
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Recordatorio creado exitosamente',
        data: {
          reminder
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
   * Obtener programación de vacunación
   * GET /api/calendar/vaccination-schedule
   */
  public getVaccinationSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, bovineId, status, vaccineType } = req.query;

      const whereConditions: any = {};

      // Filtros por fecha
      if (startDate || endDate) {
        whereConditions.scheduledDate = {};
        if (startDate) whereConditions.scheduledDate[Op.gte] = new Date(startDate as string);
        if (endDate) whereConditions.scheduledDate[Op.lte] = new Date(endDate as string);
      }

      // Filtros específicos
      if (bovineId) whereConditions.bovineId = bovineId;
      if (status) whereConditions.status = status;
      if (vaccineType) whereConditions.vaccineType = { [Op.iLike]: `%${vaccineType}%` };

      const vaccinationSchedule = await VaccinationSchedule.findAll({
        where: whereConditions,
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earTag', 'name', 'type', 'breed']
          },
          {
            model: Location,
            as: 'location'
          }
        ],
        order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']]
      });

      res.status(200).json({
        success: true,
        message: 'Programación de vacunación obtenida exitosamente',
        data: {
          schedule: vaccinationSchedule
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
      const userId = (req as any).user?.id;

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

      // Crear ubicación para la vacunación
      const locationRecord = await Location.create({
        latitude: scheduleData.location.latitude,
        longitude: scheduleData.location.longitude,
        address: scheduleData.location.address || '',
        accuracy: 10,
        timestamp: new Date()
      });

      // Calcular próxima fecha de refuerzo (ejemplo: 1 año después)
      const nextDueDate = new Date(scheduleData.scheduledDate);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);

      // Crear entrada en programación
      const schedule = await VaccinationSchedule.create({
        bovineId: scheduleData.bovineId,
        bovineName: bovine.name || '',
        bovineTag: bovine.earTag,
        vaccineType: scheduleData.vaccineType,
        vaccineName: scheduleData.vaccineName,
        scheduledDate: scheduleData.scheduledDate,
        scheduledTime: scheduleData.scheduledTime,
        status: 'scheduled',
        doseNumber: scheduleData.doseNumber || 1,
        totalDoses: scheduleData.totalDoses || 1,
        nextDueDate: nextDueDate,
        veterinarianName: scheduleData.veterinarianName,
        locationId: locationRecord.id,
        cost: scheduleData.cost || 0,
        notes: scheduleData.notes || '',
        reminderSent: false,
        certificateGenerated: false,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Obtener programación completa con asociaciones
      const scheduleWithDetails = await VaccinationSchedule.findByPk(schedule.id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earTag', 'name', 'type', 'breed']
          },
          {
            model: Location,
            as: 'location'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Programación de vacunación creada exitosamente',
        data: {
          schedule: scheduleWithDetails
        }
      });

    } catch (error) {
      console.error('Error al crear programación de vacunación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        errors: {
          general: 'Ocurrió un error al crear la programación'
        }
      });
    }
  };

  // Métodos auxiliares privados

  private async createEventReminders(eventId: string, reminderSettings: any, eventDateTime: Date): Promise<void> {
    const userId = (req as any)?.user?.id;
    
    for (const reminderType of reminderSettings.types) {
      const reminderTime = this.calculateReminderDateTime(eventDateTime, reminderType);
      
      await Reminder.create({
        eventId: eventId,
        reminderType: reminderType,
        reminderTime: reminderTime,
        status: 'scheduled',
        recipients: reminderSettings.recipients || [],
        methods: ['email', 'push'],
        message: reminderSettings.customMessage || '',
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private async createRecurringEvents(baseEvent: any, pattern: any): Promise<void> {
    // Implementar lógica de creación de eventos recurrentes
    // Esto se puede expandir según las necesidades específicas
    const occurrences = pattern.occurrences || 10;
    const interval = pattern.interval || 1;
    
    // Crear eventos futuros basados en el patrón
    for (let i = 1; i < occurrences; i++) {
      const nextDate = this.calculateNextRecurrenceDate(baseEvent.startDate, pattern.type, interval * i);
      
      await Event.create({
        ...baseEvent.dataValues,
        id: undefined, // Generar nuevo ID
        startDate: nextDate,
        endDate: nextDate,
        parentEventId: baseEvent.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private calculateReminderDateTime(eventDateTime: Date, reminderType: ReminderType): Date {
    const reminderTime = new Date(eventDateTime);

    switch (reminderType) {
      case 'immediate':
        return eventDateTime;
      case '1_hour':
        reminderTime.setHours(reminderTime.getHours() - 1);
        break;
      case '3_hours':
        reminderTime.setHours(reminderTime.getHours() - 3);
        break;
      case '1_day':
        reminderTime.setDate(reminderTime.getDate() - 1);
        break;
      case '3_days':
        reminderTime.setDate(reminderTime.getDate() - 3);
        break;
      case '7_days':
        reminderTime.setDate(reminderTime.getDate() - 7);
        break;
      default:
        return eventDateTime;
    }

    return reminderTime;
  }

  private calculateNextRecurrenceDate(baseDate: Date, type: string, multiplier: number): Date {
    const nextDate = new Date(baseDate);

    switch (type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + multiplier);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * multiplier));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + multiplier);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + multiplier);
        break;
    }

    return nextDate;
  }

  private generateDefaultReminderMessage(event: any): string {
    return `Recordatorio: ${event.title} programado para ${event.startDate.toLocaleDateString()} a las ${event.startTime}`;
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