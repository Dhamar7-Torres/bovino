"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRanchImage = exports.RanchController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const upload_1 = require("../config/upload");
let validationResult;
try {
    const expressValidator = require('express-validator');
    validationResult = expressValidator.validationResult;
}
catch (error) {
    validationResult = () => ({ isEmpty: () => true, array: () => [] });
}
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
class RanchController {
    static async getAllRanches(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { page = '1', limit = '10', search, state = 'Tabasco', municipality, status, sortBy = 'name', sortOrder = 'ASC' } = req.query;
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const offset = (pageNumber - 1) * limitNumber;
            const whereClause = {};
            if (search) {
                whereClause.name = { [sequelize_1.Op.iLike]: `%${search}%` };
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
            const { count, rows: ranches } = await models_1.Ranch.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.User,
                        as: 'owner',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'employees',
                        attributes: ['id', 'firstName', 'lastName'],
                        through: { attributes: [] },
                        required: false
                    }
                ],
                attributes: {
                    include: [
                        [
                            (0, sequelize_1.literal)(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.status != 'sold')`),
                            'total_bovines'
                        ],
                        [
                            (0, sequelize_1.literal)(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'female' AND bovines.status = 'active')`),
                            'productive_bovines'
                        ]
                    ]
                },
                order: [[sortBy, sortOrder]],
                limit: limitNumber,
                offset: offset,
                distinct: true
            });
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
        }
        catch (error) {
            console.error('❌ Error obteniendo ranchos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getRanchById(req, res) {
        try {
            const { id } = req.params;
            const ranch = await models_1.Ranch.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'owner',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'employees',
                        attributes: ['id', 'firstName', 'lastName'],
                        through: { attributes: ['position', 'hire_date'] },
                        required: false
                    },
                    {
                        model: models_1.Bovine,
                        as: 'bovines',
                        attributes: ['id', 'earring_number', 'name', 'breed', 'gender', 'status'],
                        limit: 10,
                        order: [['created_at', 'DESC']],
                        required: false
                    }
                ],
                attributes: {
                    include: [
                        [
                            (0, sequelize_1.literal)(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.status != 'sold')`),
                            'total_bovines'
                        ],
                        [
                            (0, sequelize_1.literal)(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'female' AND bovines.status = 'active')`),
                            'female_bovines'
                        ],
                        [
                            (0, sequelize_1.literal)(`(SELECT COUNT(*) FROM bovines WHERE bovines.ranch_id = "Ranch"."id" AND bovines.gender = 'male' AND bovines.status = 'active')`),
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
            const additionalStats = await RanchController.getRanchStatistics(id);
            res.status(200).json({
                success: true,
                message: 'Rancho obtenido exitosamente',
                data: {
                    ranch,
                    statistics: additionalStats
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo rancho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async createRanch(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { name, description, total_area, pasture_area, address, municipality, state = 'Tabasco', postal_code, latitude, longitude, operation_type = 'mixed', management_system = 'semi_intensive', infrastructure, configuration, pastures } = req.body;
            if (!RanchController.isValidTabascoCoordinates(latitude, longitude)) {
                res.status(400).json({
                    success: false,
                    message: 'Las coordenadas deben estar dentro de Tabasco, México'
                });
                return;
            }
            if (!TABASCO_MUNICIPALITIES.includes(municipality)) {
                res.status(400).json({
                    success: false,
                    message: 'Municipio no válido para Tabasco'
                });
                return;
            }
            const ownerId = req.user?.id;
            let imageUrl = null;
            if (req.file) {
                try {
                    const processedImagePath = await (0, upload_1.processImage)(req.file.path, {
                        width: 1920,
                        height: 1080,
                        quality: 85,
                        format: 'jpeg'
                    });
                    imageUrl = (0, upload_1.getFileUrl)(processedImagePath);
                }
                catch (error) {
                    console.warn('Error procesando imagen:', error);
                    imageUrl = (0, upload_1.getFileUrl)(req.file.path);
                }
            }
            const defaultConfiguration = {
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
                    low_weight_threshold: 400,
                    low_milk_threshold: 10,
                    geofence_alerts: true,
                    health_alerts: true
                }
            };
            const newRanch = await models_1.Ranch.create({
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
            });
            const ranchWithRelations = await models_1.Ranch.findByPk(newRanch.id, {
                include: [
                    {
                        model: models_1.User,
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
        }
        catch (error) {
            console.error('❌ Error creando rancho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async updateRanch(req, res) {
        try {
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
            const ranch = await models_1.Ranch.findByPk(id);
            if (!ranch) {
                res.status(404).json({
                    success: false,
                    message: 'Rancho no encontrado'
                });
                return;
            }
            const userId = req.user?.id;
            if (ranch.owner_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar este rancho'
                });
                return;
            }
            if (updateData.latitude && updateData.longitude) {
                if (!RanchController.isValidTabascoCoordinates(updateData.latitude, updateData.longitude)) {
                    res.status(400).json({
                        success: false,
                        message: 'Las coordenadas deben estar dentro de Tabasco, México'
                    });
                    return;
                }
            }
            if (updateData.municipality && !TABASCO_MUNICIPALITIES.includes(updateData.municipality)) {
                res.status(400).json({
                    success: false,
                    message: 'Municipio no válido para Tabasco'
                });
                return;
            }
            if (req.file) {
                try {
                    const processedImagePath = await (0, upload_1.processImage)(req.file.path, {
                        width: 1920,
                        height: 1080,
                        quality: 85,
                        format: 'jpeg'
                    });
                    updateData.image_url = (0, upload_1.getFileUrl)(processedImagePath);
                }
                catch (error) {
                    console.warn('Error procesando imagen:', error);
                    updateData.image_url = (0, upload_1.getFileUrl)(req.file.path);
                }
            }
            await ranch.update(updateData);
            const updatedRanch = await models_1.Ranch.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
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
        }
        catch (error) {
            console.error('❌ Error actualizando rancho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async deleteRanch(req, res) {
        try {
            const { id } = req.params;
            const ranch = await models_1.Ranch.findByPk(id);
            if (!ranch) {
                res.status(404).json({
                    success: false,
                    message: 'Rancho no encontrado'
                });
                return;
            }
            const userId = req.user?.id;
            if (ranch.owner_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este rancho'
                });
                return;
            }
            const activeBovinesCount = await models_1.Bovine.count({
                where: (0, sequelize_1.literal)(`ranch_id = '${id}' AND status != 'sold'`)
            });
            const activeBovines = Array.isArray(activeBovinesCount) ? activeBovinesCount.length : (activeBovinesCount || 0);
            if (activeBovines > 0) {
                res.status(400).json({
                    success: false,
                    message: `No se puede eliminar el rancho. Tiene ${activeBovines} bovinos activos`
                });
                return;
            }
            await ranch.destroy();
            res.status(200).json({
                success: true,
                message: 'Rancho eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('❌ Error eliminando rancho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getRanchDashboard(req, res) {
        try {
            const { id } = req.params;
            const { period = '30' } = req.query;
            const ranch = await models_1.Ranch.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
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
            const days = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const bovineStats = await RanchController.getBovineStatistics(id);
            const productionStats = await RanchController.getProductionStatistics(id, startDate);
            const recentEvents = await models_1.Event.findAll({
                where: (0, sequelize_1.literal)(`id IN (SELECT e.id FROM events e INNER JOIN bovines b ON e.bovine_id = b.id WHERE b.ranch_id = '${id}')`),
                order: [['created_at', 'DESC']],
                limit: 10
            }).catch(() => []);
            const activeAlertsResult = await models_1.Event.count({
                where: (0, sequelize_1.literal)(`status = 'active' AND priority IN ('high', 'critical') AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${id}')`)
            }).catch(() => 0);
            const activeAlerts = Array.isArray(activeAlertsResult) ? activeAlertsResult.length : (activeAlertsResult || 0);
            const inventoryStatus = await RanchController.getInventoryStatus(id);
            res.status(200).json({
                success: true,
                message: 'Dashboard del rancho obtenido exitosamente',
                data: {
                    ranch: {
                        id: ranch.id,
                        name: ranch.name,
                        total_area: ranch.total_area,
                        operation_type: ranch.operation_type,
                        owner: ranch.owner
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
        }
        catch (error) {
            console.error('❌ Error obteniendo dashboard del rancho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async managePastures(req, res) {
        try {
            const { id } = req.params;
            const { action, pasture_data } = req.body;
            const ranch = await models_1.Ranch.findByPk(id);
            if (!ranch) {
                res.status(404).json({
                    success: false,
                    message: 'Rancho no encontrado'
                });
                return;
            }
            let updatedPastures = [...(ranch.pastures || [])];
            switch (action) {
                case 'add':
                    const newPasture = {
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
                    const pastureIndex = updatedPastures.findIndex(p => p.id === pasture_data.id);
                    if (pastureIndex !== -1) {
                        updatedPastures[pastureIndex] = { ...updatedPastures[pastureIndex], ...pasture_data };
                    }
                    break;
                case 'remove':
                    updatedPastures = updatedPastures.filter(p => p.id !== pasture_data.id);
                    break;
                case 'rotate':
                    await RanchController.rotateBovines(id, pasture_data.from_pasture, pasture_data.to_pasture);
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Acción no válida para gestión de potreros'
                    });
                    return;
            }
            await ranch.update({ pastures: updatedPastures });
            res.status(200).json({
                success: true,
                message: `Potrero ${action} exitosamente`,
                data: {
                    pastures: updatedPastures,
                    total_pastures: updatedPastures.length,
                    total_pasture_area: updatedPastures.reduce((sum, p) => sum + p.area_hectares, 0)
                }
            });
        }
        catch (error) {
            console.error('❌ Error gestionando potreros:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getTabascoMunicipalities(req, res) {
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
        }
        catch (error) {
            console.error('❌ Error obteniendo municipios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
    static isValidTabascoCoordinates(lat, lng) {
        return (lat >= TABASCO_BOUNDS.south &&
            lat <= TABASCO_BOUNDS.north &&
            lng >= TABASCO_BOUNDS.west &&
            lng <= TABASCO_BOUNDS.east);
    }
    static async getRanchStatistics(ranchId) {
        try {
            const stats = await Promise.all([
                models_1.Bovine.count({
                    where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND gender = 'female' AND status != 'sold'`)
                }),
                models_1.Bovine.count({
                    where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND gender = 'male' AND status != 'sold'`)
                }),
                Promise.resolve(0),
                models_1.Event.count({
                    where: (0, sequelize_1.literal)(`created_at >= NOW() - INTERVAL '30 days'`)
                }).catch(() => 0)
            ]);
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
        }
        catch (error) {
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
    static async getBovineStatistics(ranchId) {
        try {
            const totalBovinesResult = await models_1.Bovine.count({
                where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND status != 'sold'`)
            });
            const femaleBovinesResult = await models_1.Bovine.count({
                where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND gender = 'female' AND status != 'sold'`)
            });
            const maleBovinesResult = await models_1.Bovine.count({
                where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND gender = 'male' AND status != 'sold'`)
            });
            const totalBovines = Array.isArray(totalBovinesResult) ? totalBovinesResult.length : (totalBovinesResult || 0);
            const femaleBovines = Array.isArray(femaleBovinesResult) ? femaleBovinesResult.length : (femaleBovinesResult || 0);
            const maleBovines = Array.isArray(maleBovinesResult) ? maleBovinesResult.length : (maleBovinesResult || 0);
            return [
                { gender: 'female', count: femaleBovines },
                { gender: 'male', count: maleBovines },
                { total: totalBovines }
            ];
        }
        catch (error) {
            console.error('Error obteniendo estadísticas de bovinos:', error);
            return [];
        }
    }
    static async getProductionStatistics(ranchId, startDate) {
        try {
            return [
                { production_type: 'milk', total: 0, average: 0, records: 0 },
                { production_type: 'weight', total: 0, average: 0, records: 0 }
            ];
        }
        catch (error) {
            console.error('Error obteniendo estadísticas de producción:', error);
            return [];
        }
    }
    static async getInventoryStatus(ranchId) {
        return {
            total_items: 0,
            low_stock_items: 0,
            expired_items: 0,
            total_value: 0
        };
    }
    static async rotateBovines(ranchId, fromPastureId, toPastureId) {
        console.log(`Rotando bovinos del potrero ${fromPastureId} al ${toPastureId} en rancho ${ranchId}`);
    }
}
exports.RanchController = RanchController;
exports.uploadRanchImage = (0, upload_1.createUploadMiddleware)('cattle_images', 'image', false);
exports.default = RanchController;
//# sourceMappingURL=ranch.js.map