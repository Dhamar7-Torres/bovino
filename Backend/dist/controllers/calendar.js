"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const sequelize_1 = require("sequelize");
const Event_1 = __importStar(require("../models/Event"));
const Bovine_1 = __importDefault(require("../models/Bovine"));
class CalendarController {
    constructor() {
        this.createEvent = async (req, res) => {
            try {
                const eventData = req.body;
                const userId = req.user?.id || 'system';
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
                if (eventData.bovineId) {
                    const bovine = await Bovine_1.default.findByPk(eventData.bovineId);
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
                const newEvent = await Event_1.default.create({
                    bovineId: eventData.bovineId,
                    eventType: eventData.eventType,
                    title: eventData.title,
                    description: eventData.description || '',
                    status: Event_1.EventStatus.SCHEDULED,
                    priority: eventData.priority || Event_1.EventPriority.MEDIUM,
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
                        type: eventData.recurrenceConfig?.type || Event_1.RecurrenceType.NONE,
                        interval: eventData.recurrenceConfig?.interval,
                        endDate: eventData.recurrenceConfig?.endDate,
                        maxOccurrences: eventData.recurrenceConfig?.maxOccurrences
                    } : undefined,
                    notifications: eventData.reminderSettings ? {
                        enabled: eventData.reminderSettings.enabled,
                        advanceNotice: 1,
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
                if (eventData.isRecurring && eventData.recurrenceConfig) {
                    await this.createRecurringEvents(newEvent, eventData.recurrenceConfig);
                }
                const eventWithDetails = await Event_1.default.findByPk(newEvent.id);
                res.status(201).json({
                    success: true,
                    message: 'Evento creado exitosamente',
                    data: {
                        event: eventWithDetails
                    }
                });
            }
            catch (error) {
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
        this.getEvents = async (req, res) => {
            try {
                const { eventTypes, startDate, endDate, status, priority, bovineId, veterinarianId, tags, location, searchTerm, view = 'month', page = 1, limit = 50 } = req.query;
                const whereConditions = { isActive: true };
                if (startDate || endDate) {
                    whereConditions.scheduledDate = {};
                    if (startDate)
                        whereConditions.scheduledDate[sequelize_1.Op.gte] = new Date(startDate);
                    if (endDate)
                        whereConditions.scheduledDate[sequelize_1.Op.lte] = new Date(endDate);
                }
                if (eventTypes && Array.isArray(eventTypes)) {
                    whereConditions.eventType = { [sequelize_1.Op.in]: eventTypes };
                }
                if (status && Array.isArray(status)) {
                    whereConditions.status = { [sequelize_1.Op.in]: status };
                }
                if (priority && Array.isArray(priority)) {
                    whereConditions.priority = { [sequelize_1.Op.in]: priority };
                }
                if (bovineId) {
                    whereConditions.bovineId = bovineId;
                }
                if (veterinarianId) {
                    whereConditions.veterinarianId = veterinarianId;
                }
                if (searchTerm) {
                    whereConditions[sequelize_1.Op.or] = [
                        { title: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { publicNotes: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                const pageNum = parseInt(page.toString()) || 1;
                const limitNum = Math.min(parseInt(limit.toString()) || 50, 200);
                const offset = (pageNum - 1) * limitNum;
                const { count, rows: events } = await Event_1.default.findAndCountAll({
                    where: whereConditions,
                    limit: limitNum,
                    offset: offset,
                    order: [['scheduledDate', 'ASC']],
                    distinct: true
                });
                let filteredEvents = events;
                if (location && location.latitude && location.longitude && location.radius) {
                    filteredEvents = events.filter(event => {
                        if (!event.location)
                            return false;
                        const distance = this.calculateDistance(location.latitude, location.longitude, event.location.latitude, event.location.longitude);
                        return distance <= location.radius;
                    });
                }
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
            }
            catch (error) {
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
        this.getEventById = async (req, res) => {
            try {
                const { id } = req.params;
                const event = await Event_1.default.findByPk(id);
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
                let bovine = null;
                if (event.bovineId) {
                    bovine = await Bovine_1.default.findByPk(event.bovineId, {
                        attributes: ['id', 'earTag', 'name', 'cattleType', 'breed']
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
            }
            catch (error) {
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
        this.updateEvent = async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const userId = req.user?.id || 'system';
                const existingEvent = await Event_1.default.findByPk(id);
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
                if (updateData.bovineId && updateData.bovineId !== existingEvent.bovineId) {
                    const bovine = await Bovine_1.default.findByPk(updateData.bovineId);
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
                const updatePayload = {
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
                if (updateData.location) {
                    updatePayload.location = {
                        ...existingEvent.location,
                        ...updateData.location
                    };
                }
                await existingEvent.update(updatePayload);
                const updatedEvent = await Event_1.default.findByPk(id);
                res.status(200).json({
                    success: true,
                    message: 'Evento actualizado exitosamente',
                    data: {
                        event: updatedEvent
                    }
                });
            }
            catch (error) {
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
        this.deleteEvent = async (req, res) => {
            try {
                const { id } = req.params;
                const event = await Event_1.default.findByPk(id);
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
                await event.destroy();
                res.status(200).json({
                    success: true,
                    message: 'Evento eliminado exitosamente',
                    data: {
                        deleted: true
                    }
                });
            }
            catch (error) {
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
        this.getCalendarStats = async (req, res) => {
            try {
                const { startDate, endDate } = req.query;
                const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
                const whereConditions = {
                    scheduledDate: {
                        [sequelize_1.Op.between]: [start, end]
                    },
                    isActive: true
                };
                const totalEvents = await Event_1.default.count({ where: whereConditions });
                const eventsByType = await Event_1.default.findAll({
                    where: whereConditions,
                    attributes: [
                        'eventType',
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('eventType')), 'count']
                    ],
                    group: ['eventType'],
                    raw: true
                });
                const eventsByStatus = await Event_1.default.findAll({
                    where: whereConditions,
                    attributes: [
                        'status',
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('status')), 'count']
                    ],
                    group: ['status'],
                    raw: true
                });
                const eventsByPriority = await Event_1.default.findAll({
                    where: whereConditions,
                    attributes: [
                        'priority',
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('priority')), 'count']
                    ],
                    group: ['priority'],
                    raw: true
                });
                const upcomingEvents = await Event_1.default.findAll({
                    where: {
                        scheduledDate: {
                            [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
                        },
                        status: { [sequelize_1.Op.in]: [Event_1.EventStatus.SCHEDULED] },
                        isActive: true
                    },
                    order: [['scheduledDate', 'ASC']],
                    limit: 10
                });
                const overdueEvents = await Event_1.default.count({
                    where: {
                        scheduledDate: { [sequelize_1.Op.lt]: new Date() },
                        status: Event_1.EventStatus.SCHEDULED,
                        isActive: true
                    }
                });
                const totalCost = await Event_1.default.sum('cost', { where: whereConditions }) || 0;
                const stats = {
                    totalEvents,
                    eventsByType: this.formatCountStats(eventsByType),
                    eventsByStatus: this.formatCountStats(eventsByStatus),
                    eventsByPriority: this.formatCountStats(eventsByPriority),
                    upcomingEvents: upcomingEvents.slice(0, 5),
                    overdueEvents,
                    totalCost: Math.round(totalCost * 100) / 100,
                    dateRange: { start, end }
                };
                res.status(200).json({
                    success: true,
                    message: 'Estadísticas del calendario obtenidas exitosamente',
                    data: { stats }
                });
            }
            catch (error) {
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
        this.createReminder = async (req, res) => {
            try {
                const reminderData = req.body;
                const event = await Event_1.default.findByPk(reminderData.eventId);
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
                let advanceNotice = 0;
                switch (reminderData.reminderType) {
                    case '1_hour':
                        advanceNotice = 0;
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
                await event.update({
                    notifications: {
                        enabled: true,
                        advanceNotice: advanceNotice,
                        reminderFrequency: 'DAILY',
                        notificationMethods: reminderData.methods,
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
            }
            catch (error) {
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
        this.getVaccinationSchedule = async (req, res) => {
            try {
                const { startDate, endDate, bovineId, status, vaccineType } = req.query;
                const whereConditions = {
                    eventType: Event_1.EventType.VACCINATION,
                    isActive: true
                };
                if (startDate || endDate) {
                    whereConditions.scheduledDate = {};
                    if (startDate)
                        whereConditions.scheduledDate[sequelize_1.Op.gte] = new Date(startDate);
                    if (endDate)
                        whereConditions.scheduledDate[sequelize_1.Op.lte] = new Date(endDate);
                }
                if (bovineId)
                    whereConditions.bovineId = bovineId;
                if (status)
                    whereConditions.status = status;
                if (vaccineType) {
                    whereConditions['eventData.vaccineType'] = { [sequelize_1.Op.iLike]: `%${vaccineType}%` };
                }
                const vaccinationSchedule = await Event_1.default.findAll({
                    where: whereConditions,
                    order: [['scheduledDate', 'ASC']]
                });
                const scheduleWithBovines = await Promise.all(vaccinationSchedule.map(async (event) => {
                    const bovine = await Bovine_1.default.findByPk(event.bovineId, {
                        attributes: ['id', 'earTag', 'name', 'cattleType', 'breed']
                    });
                    return {
                        ...event.toJSON(),
                        bovine
                    };
                }));
                res.status(200).json({
                    success: true,
                    message: 'Programación de vacunación obtenida exitosamente',
                    data: {
                        schedule: scheduleWithBovines
                    }
                });
            }
            catch (error) {
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
        this.createVaccinationSchedule = async (req, res) => {
            try {
                const scheduleData = req.body;
                const userId = req.user?.id || 'system';
                const bovine = await Bovine_1.default.findByPk(scheduleData.bovineId);
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
                const vaccinationEvent = await Event_1.default.create({
                    bovineId: scheduleData.bovineId,
                    eventType: Event_1.EventType.VACCINATION,
                    title: `Vacunación: ${scheduleData.vaccineName}`,
                    description: `Aplicación de vacuna ${scheduleData.vaccineName} - Dosis ${scheduleData.doseNumber}/${scheduleData.totalDoses}`,
                    status: Event_1.EventStatus.SCHEDULED,
                    priority: Event_1.EventPriority.MEDIUM,
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
                        applicationMethod: 'SUBCUTANEOUS'
                    },
                    followUpRequired: scheduleData.doseNumber < scheduleData.totalDoses,
                    publicNotes: scheduleData.notes,
                    isActive: true,
                    createdBy: userId
                });
                const eventWithBovine = await Event_1.default.findByPk(vaccinationEvent.id);
                const bovineInfo = await Bovine_1.default.findByPk(scheduleData.bovineId, {
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
            }
            catch (error) {
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
    }
    async createRecurringEvents(baseEvent, recurrenceConfig) {
        try {
            const maxOccurrences = recurrenceConfig.maxOccurrences || 10;
            const interval = recurrenceConfig.interval || 1;
            for (let i = 1; i < maxOccurrences; i++) {
                const nextDate = this.calculateNextRecurrenceDate(baseEvent.scheduledDate, recurrenceConfig.type, interval * i);
                if (recurrenceConfig.endDate && nextDate > recurrenceConfig.endDate) {
                    break;
                }
                await Event_1.default.create({
                    bovineId: baseEvent.bovineId,
                    eventType: baseEvent.eventType,
                    title: baseEvent.title,
                    description: baseEvent.description,
                    status: Event_1.EventStatus.SCHEDULED,
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
        }
        catch (error) {
            console.error('Error creando eventos recurrentes:', error);
        }
    }
    calculateNextRecurrenceDate(baseDate, type, multiplier) {
        const nextDate = new Date(baseDate);
        switch (type) {
            case Event_1.RecurrenceType.DAILY:
                nextDate.setDate(nextDate.getDate() + multiplier);
                break;
            case Event_1.RecurrenceType.WEEKLY:
                nextDate.setDate(nextDate.getDate() + (7 * multiplier));
                break;
            case Event_1.RecurrenceType.MONTHLY:
                nextDate.setMonth(nextDate.getMonth() + multiplier);
                break;
            case Event_1.RecurrenceType.YEARLY:
                nextDate.setFullYear(nextDate.getFullYear() + multiplier);
                break;
            default:
                break;
        }
        return nextDate;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    formatCountStats(stats) {
        const result = {};
        stats.forEach(stat => {
            const key = stat[Object.keys(stat)[0]];
            result[key] = parseInt(stat.count);
        });
        return result;
    }
}
exports.CalendarController = CalendarController;
//# sourceMappingURL=calendar.js.map