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
exports.EventsController = void 0;
const sequelize_1 = require("sequelize");
const Event_1 = __importStar(require("../models/Event"));
const Bovine_1 = __importDefault(require("../models/Bovine"));
class EventsController {
    constructor() {
        this.createEvent = async (req, res) => {
            try {
                const eventData = req.body;
                const userId = req.user?.id || 'system';
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
                const bovine = await Bovine_1.default.findByPk(eventData.bovineId);
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
                const newEvent = await Event_1.default.create({
                    bovineId: eventData.bovineId,
                    eventType: eventData.eventType,
                    title: eventData.title,
                    description: eventData.description || '',
                    status: Event_1.EventStatus.SCHEDULED,
                    priority: eventData.priority || Event_1.EventPriority.MEDIUM,
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
                const { eventType, status, priority, bovineId, veterinarianId, dateRange, location, searchTerm, costRange, createdBy, page = 1, limit = 20, sortBy = 'scheduledDate', sortOrder = 'DESC' } = req.query;
                const whereConditions = { isActive: true };
                if (eventType) {
                    const typeArray = Array.isArray(eventType) ? eventType : [eventType];
                    whereConditions.eventType = { [sequelize_1.Op.in]: typeArray };
                }
                if (status) {
                    const statusArray = Array.isArray(status) ? status : [status];
                    whereConditions.status = { [sequelize_1.Op.in]: statusArray };
                }
                if (priority) {
                    const priorityArray = Array.isArray(priority) ? priority : [priority];
                    whereConditions.priority = { [sequelize_1.Op.in]: priorityArray };
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
                if (dateRange && (dateRange.startDate || dateRange.endDate)) {
                    whereConditions.scheduledDate = {};
                    if (dateRange.startDate)
                        whereConditions.scheduledDate[sequelize_1.Op.gte] = new Date(dateRange.startDate);
                    if (dateRange.endDate)
                        whereConditions.scheduledDate[sequelize_1.Op.lte] = new Date(dateRange.endDate);
                }
                if (costRange && (costRange.min !== undefined || costRange.max !== undefined)) {
                    whereConditions.cost = {};
                    if (costRange.min !== undefined)
                        whereConditions.cost[sequelize_1.Op.gte] = costRange.min;
                    if (costRange.max !== undefined)
                        whereConditions.cost[sequelize_1.Op.lte] = costRange.max;
                }
                if (searchTerm) {
                    whereConditions[sequelize_1.Op.or] = [
                        { title: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { publicNotes: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                const pageNum = parseInt(page.toString()) || 1;
                const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
                const offset = (pageNum - 1) * limitNum;
                const { count, rows: events } = await Event_1.default.findAndCountAll({
                    where: whereConditions,
                    limit: limitNum,
                    offset: offset,
                    order: [[sortBy, sortOrder]],
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
                const enrichedEvents = await Promise.all(filteredEvents.map(async (event) => {
                    const bovine = await Bovine_1.default.findByPk(event.bovineId, {
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
                }));
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
            }
            catch (error) {
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
        this.getEventById = async (req, res) => {
            try {
                const { id } = req.params;
                const event = await Event_1.default.findByPk(id);
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
                const bovine = await Bovine_1.default.findByPk(event.bovineId, {
                    attributes: ['id', 'earTag', 'name', 'cattleType', 'breed', 'gender']
                });
                const relatedEvents = await Event_1.default.findAll({
                    where: {
                        id: { [sequelize_1.Op.ne]: event.id },
                        [sequelize_1.Op.or]: [
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
            }
            catch (error) {
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
        this.updateEvent = async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const userId = req.user?.id || 'system';
                const existingEvent = await Event_1.default.findByPk(id);
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
                if (updateData.bovineId && updateData.bovineId !== existingEvent.bovineId) {
                    const bovine = await Bovine_1.default.findByPk(updateData.bovineId);
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
                    results: updateData.results !== undefined ? updateData.results : existingEvent.results,
                    complications: updateData.complications !== undefined ? updateData.complications : existingEvent.complications,
                    followUpNotes: updateData.followUpNotes !== undefined ? updateData.followUpNotes : existingEvent.followUpNotes,
                    weatherConditions: updateData.weatherConditions !== undefined ? updateData.weatherConditions : existingEvent.weatherConditions,
                    temperature: updateData.temperature !== undefined ? updateData.temperature : existingEvent.temperature,
                    humidity: updateData.humidity !== undefined ? updateData.humidity : existingEvent.humidity,
                    performedBy: updateData.performedBy !== undefined ? updateData.performedBy : existingEvent.performedBy,
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
                        general: error instanceof Error ? error.message : 'Ocurrió un error al eliminar el evento'
                    }
                });
            }
        };
        this.getEventTimeline = async (req, res) => {
            try {
                const { startDate, endDate, eventType, bovineId, limit = 50 } = req.query;
                const defaultEndDate = new Date();
                const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const dateRange = {
                    startDate: startDate ? new Date(startDate) : defaultStartDate,
                    endDate: endDate ? new Date(endDate) : defaultEndDate
                };
                const whereConditions = {
                    scheduledDate: {
                        [sequelize_1.Op.between]: [dateRange.startDate, dateRange.endDate]
                    },
                    isActive: true
                };
                if (eventType)
                    whereConditions.eventType = eventType;
                if (bovineId)
                    whereConditions.bovineId = bovineId;
                const events = await Event_1.default.findAll({
                    where: whereConditions,
                    order: [['scheduledDate', 'DESC']],
                    limit: parseInt(limit.toString())
                });
                const timelineEvents = await Promise.all(events.map(async (event) => {
                    const bovine = await Bovine_1.default.findByPk(event.bovineId, {
                        attributes: ['id', 'earTag', 'name', 'cattleType']
                    });
                    const timelineItem = {
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
                }));
                const eventsByType = {};
                const eventsByStatus = {};
                let totalCost = 0;
                timelineEvents.forEach(event => {
                    eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
                    eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;
                    totalCost += event.cost || 0;
                });
                const timeline = {
                    events: timelineEvents,
                    dateRange,
                    summary: {
                        totalEvents: timelineEvents.length,
                        eventsByType: eventsByType,
                        eventsByStatus: eventsByStatus,
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
            }
            catch (error) {
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
        this.getEventStatistics = async (req, res) => {
            try {
                const { timeRange = 'monthly' } = req.query;
                const currentDate = new Date();
                let startDate;
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
                    scheduledDate: { [sequelize_1.Op.gte]: startDate },
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
                const costStats = await Event_1.default.findAll({
                    where: whereConditions,
                    attributes: [
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('cost')), 'totalCost'],
                        [(0, sequelize_1.fn)('AVG', (0, sequelize_1.col)('cost')), 'averageCost'],
                        [(0, sequelize_1.fn)('MIN', (0, sequelize_1.col)('cost')), 'minCost'],
                        [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('cost')), 'maxCost']
                    ],
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
            }
            catch (error) {
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
    formatTypeCountStats(stats) {
        const result = {};
        stats.forEach(stat => {
            result[stat.eventType] = parseInt(stat.count);
        });
        return result;
    }
    formatStatusCountStats(stats) {
        const result = {};
        stats.forEach(stat => {
            result[stat.status] = parseInt(stat.count);
        });
        return result;
    }
    formatPriorityCountStats(stats) {
        const result = {};
        stats.forEach(stat => {
            result[stat.priority] = parseInt(stat.count);
        });
        return result;
    }
}
exports.EventsController = EventsController;
//# sourceMappingURL=events.js.map