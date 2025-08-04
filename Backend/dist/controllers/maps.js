"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
let validationResult;
try {
    const expressValidator = require('express-validator');
    validationResult = expressValidator.validationResult;
}
catch (error) {
    validationResult = () => ({ isEmpty: () => true, array: () => [] });
}
const RANCH_DEFAULT_CENTER = {
    latitude: 17.9869,
    longitude: -92.9303,
    altitude: 10
};
const TABASCO_BOUNDS = {
    north: 18.5,
    south: 17.3,
    east: -91.0,
    west: -94.8
};
class MapsController {
    static async getCurrentLocations(req, res) {
        try {
            const { ranch_id } = req.query;
            const whereClause = {};
            if (ranch_id) {
                whereClause.ranch_id = ranch_id;
            }
            const currentLocations = await models_1.Location.findAll({
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        where: whereClause,
                        attributes: ['id', 'earring_number', 'name', 'breed', 'status'],
                        required: false,
                        include: [
                            {
                                model: models_1.Ranch,
                                as: 'ranch',
                                attributes: ['id', 'name'],
                                required: false
                            }
                        ]
                    }
                ],
                where: {
                    id: {
                        [sequelize_1.Op.in]: (0, sequelize_1.literal)(`(
              SELECT DISTINCT ON (bovine_id) id 
              FROM locations 
              ORDER BY bovine_id, recorded_at DESC
            )`)
                    }
                },
                order: [['recorded_at', 'DESC']]
            });
            const mapData = currentLocations.map((location) => {
                const bovineData = location.bovine || location.Bovine;
                const ranchData = bovineData?.ranch || bovineData?.Ranch;
                return {
                    id: location.id,
                    bovine: bovineData ? {
                        id: bovineData.id,
                        earring_number: bovineData.earring_number,
                        name: bovineData.name,
                        breed: bovineData.breed,
                        status: bovineData.status
                    } : null,
                    coordinates: {
                        latitude: parseFloat(location.latitude),
                        longitude: parseFloat(location.longitude),
                        altitude: location.altitude ? parseFloat(location.altitude) : null,
                        accuracy: location.accuracy ? parseFloat(location.accuracy) : null
                    },
                    recorded_at: location.recorded_at,
                    location_type: location.location_type,
                    ranch: ranchData || null
                };
            });
            res.status(200).json({
                success: true,
                message: 'Ubicaciones actuales obtenidas exitosamente',
                data: {
                    locations: mapData,
                    center: RANCH_DEFAULT_CENTER,
                    bounds: TABASCO_BOUNDS,
                    total_animals: mapData.length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo ubicaciones actuales:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getBovineLocationHistory(req, res) {
        try {
            const { bovineId } = req.params;
            const { start_date, end_date, limit = '100' } = req.query;
            const whereClause = { bovine_id: bovineId };
            if (start_date && end_date) {
                whereClause.recorded_at = {
                    [sequelize_1.Op.between]: [new Date(start_date), new Date(end_date)]
                };
            }
            else if (start_date) {
                whereClause.recorded_at = {
                    [sequelize_1.Op.gte]: new Date(start_date)
                };
            }
            else if (end_date) {
                whereClause.recorded_at = {
                    [sequelize_1.Op.lte]: new Date(end_date)
                };
            }
            const locationHistory = await models_1.Location.findAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    }
                ],
                order: [['recorded_at', 'DESC']],
                limit: parseInt(limit)
            });
            const stats = await MapsController.calculateMovementStats(locationHistory);
            res.status(200).json({
                success: true,
                message: 'Historial de ubicaciones obtenido exitosamente',
                data: {
                    bovine: locationHistory.length > 0 ? locationHistory[0].bovine || locationHistory[0].Bovine : null,
                    locations: locationHistory.map((loc) => ({
                        id: loc.id,
                        coordinates: {
                            latitude: parseFloat(loc.latitude),
                            longitude: parseFloat(loc.longitude),
                            altitude: loc.altitude ? parseFloat(loc.altitude) : null
                        },
                        recorded_at: loc.recorded_at,
                        location_type: loc.location_type,
                        accuracy: loc.accuracy ? parseFloat(loc.accuracy) : null
                    })),
                    statistics: stats,
                    total_points: locationHistory.length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo historial de ubicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordLocation(req, res) {
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
            const { bovine_id, latitude, longitude, altitude, accuracy, location_type = 'gps_tracking', notes } = req.body;
            const bovine = await models_1.Bovine.findByPk(bovine_id);
            if (!bovine) {
                res.status(404).json({
                    success: false,
                    message: 'Bovino no encontrado'
                });
                return;
            }
            if (!MapsController.isValidTabascoCoordinates(latitude, longitude)) {
                res.status(400).json({
                    success: false,
                    message: 'Coordenadas fuera del rango válido para Tabasco, México'
                });
                return;
            }
            const newLocation = await models_1.Location.create({
                bovine_id,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                altitude: altitude ? altitude.toString() : null,
                accuracy: accuracy ? accuracy.toString() : null,
                location_type: location_type || 'gps_tracking',
                recorded_at: new Date()
            });
            await MapsController.checkGeofenceAlerts(bovine_id, latitude, longitude);
            const locationWithBovine = await models_1.Location.findByPk(newLocation.id, {
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Ubicación registrada exitosamente',
                data: locationWithBovine
            });
        }
        catch (error) {
            console.error('❌ Error registrando ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getGeofences(req, res) {
        try {
            const { ranch_id } = req.query;
            const predefinedGeofences = [
                {
                    id: 'pasture_1',
                    name: 'Potrero Principal',
                    type: 'pasture',
                    coordinates: [
                        { latitude: 17.9900, longitude: -92.9350 },
                        { latitude: 17.9900, longitude: -92.9250 },
                        { latitude: 17.9800, longitude: -92.9250 },
                        { latitude: 17.9800, longitude: -92.9350 }
                    ]
                },
                {
                    id: 'facility_barn',
                    name: 'Establo Principal',
                    type: 'facility',
                    center: { latitude: 17.9869, longitude: -92.9303 },
                    radius: 50
                },
                {
                    id: 'safe_zone_main',
                    name: 'Zona Segura Principal',
                    type: 'safe_zone',
                    center: RANCH_DEFAULT_CENTER,
                    radius: 500
                },
                {
                    id: 'restricted_highway',
                    name: 'Zona Restringida - Carretera',
                    type: 'restricted',
                    coordinates: [
                        { latitude: 17.9950, longitude: -92.9400 },
                        { latitude: 17.9950, longitude: -92.9200 },
                        { latitude: 17.9970, longitude: -92.9200 },
                        { latitude: 17.9970, longitude: -92.9400 }
                    ]
                }
            ];
            res.status(200).json({
                success: true,
                message: 'Geocercas obtenidas exitosamente',
                data: {
                    geofences: predefinedGeofences,
                    ranch_center: RANCH_DEFAULT_CENTER,
                    total_geofences: predefinedGeofences.length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo geocercas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getMovementAnalysis(req, res) {
        try {
            const { bovine_id, days = '7' } = req.query;
            const daysBack = parseInt(days);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);
            const whereClause = {
                recorded_at: {
                    [sequelize_1.Op.gte]: startDate
                }
            };
            if (bovine_id) {
                whereClause.bovine_id = bovine_id;
            }
            const locations = await models_1.Location.findAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name'],
                        required: false
                    }
                ],
                order: [['bovine_id', 'ASC'], ['recorded_at', 'ASC']]
            });
            const analysisData = await MapsController.analyzeMovementPatterns(locations);
            res.status(200).json({
                success: true,
                message: 'Análisis de patrones de movimiento completado',
                data: {
                    analysis_period: {
                        start_date: startDate,
                        end_date: new Date(),
                        days: daysBack
                    },
                    patterns: analysisData,
                    total_animals_analyzed: Object.keys(analysisData).length
                }
            });
        }
        catch (error) {
            console.error('❌ Error analizando patrones de movimiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getLocationAlerts(req, res) {
        try {
            const { ranch_id, active_only = 'true' } = req.query;
            const whereClause = {
                eventType: {
                    [sequelize_1.Op.in]: ['geofence_exit', 'geofence_enter', 'location_alert', 'animal_missing']
                }
            };
            if (active_only === 'true') {
                whereClause.status = 'active';
            }
            const locationAlerts = await models_1.Event.findAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        where: ranch_id ? { ranch_id } : undefined,
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: 50
            });
            const categorizedAlerts = {
                geofence_violations: locationAlerts.filter((alert) => ['geofence_exit', 'geofence_enter'].includes(alert.eventType)),
                missing_animals: locationAlerts.filter((alert) => alert.eventType === 'animal_missing'),
                location_warnings: locationAlerts.filter((alert) => alert.eventType === 'location_alert')
            };
            res.status(200).json({
                success: true,
                message: 'Alertas de ubicación obtenidas exitosamente',
                data: {
                    alerts: categorizedAlerts,
                    total_alerts: locationAlerts.length,
                    active_alerts: locationAlerts.filter((a) => a.status === 'active').length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo alertas de ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static isValidTabascoCoordinates(lat, lng) {
        return (lat >= TABASCO_BOUNDS.south &&
            lat <= TABASCO_BOUNDS.north &&
            lng >= TABASCO_BOUNDS.west &&
            lng <= TABASCO_BOUNDS.east);
    }
    static async calculateMovementStats(locations) {
        if (locations.length < 2) {
            return {
                total_distance: 0,
                average_speed: 0,
                max_distance_from_center: 0,
                time_period: null
            };
        }
        let totalDistance = 0;
        let maxDistanceFromCenter = 0;
        for (let i = 1; i < locations.length; i++) {
            const prev = locations[i - 1];
            const curr = locations[i];
            const distance = MapsController.calculateDistance(parseFloat(prev.latitude), parseFloat(prev.longitude), parseFloat(curr.latitude), parseFloat(curr.longitude));
            totalDistance += distance;
            const distanceFromCenter = MapsController.calculateDistance(RANCH_DEFAULT_CENTER.latitude, RANCH_DEFAULT_CENTER.longitude, parseFloat(curr.latitude), parseFloat(curr.longitude));
            if (distanceFromCenter > maxDistanceFromCenter) {
                maxDistanceFromCenter = distanceFromCenter;
            }
        }
        const timeSpan = new Date(locations[0].recorded_at).getTime() -
            new Date(locations[locations.length - 1].recorded_at).getTime();
        const hoursSpan = timeSpan / (1000 * 60 * 60);
        const averageSpeed = hoursSpan > 0 ? totalDistance / hoursSpan : 0;
        return {
            total_distance: Math.round(totalDistance * 100) / 100,
            average_speed: Math.round(averageSpeed * 100) / 100,
            max_distance_from_center: Math.round(maxDistanceFromCenter * 100) / 100,
            time_period: {
                start: locations[locations.length - 1].recorded_at,
                end: locations[0].recorded_at,
                duration_hours: Math.round(hoursSpan * 100) / 100
            }
        };
    }
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static isPointInCircularGeofence(pointLat, pointLng, centerLat, centerLng, radius) {
        const distance = MapsController.calculateDistance(pointLat, pointLng, centerLat, centerLng);
        return distance <= radius;
    }
    static async checkGeofenceAlerts(bovineId, lat, lng) {
        const distanceFromCenter = MapsController.calculateDistance(lat, lng, RANCH_DEFAULT_CENTER.latitude, RANCH_DEFAULT_CENTER.longitude);
        if (distanceFromCenter > 500) {
            try {
                await models_1.Event.create({
                    bovine_id: bovineId,
                    eventType: 'geofence_exit',
                    title: 'Animal fuera de zona segura',
                    description: `El animal se encuentra a ${Math.round(distanceFromCenter)}m del centro del rancho`,
                    status: 'active',
                    priority: 'high'
                });
            }
            catch (error) {
                console.error('Error creating geofence alert:', error);
            }
        }
    }
    static async analyzeMovementPatterns(locations) {
        const patterns = {};
        const bovineLocations = {};
        locations.forEach(location => {
            const bovineId = location.bovine_id;
            if (!bovineLocations[bovineId]) {
                bovineLocations[bovineId] = [];
            }
            bovineLocations[bovineId].push(location);
        });
        for (const [bovineId, bovineLocationData] of Object.entries(bovineLocations)) {
            const stats = await MapsController.calculateMovementStats(bovineLocationData);
            const firstLocation = bovineLocationData[0];
            const bovineData = firstLocation ? (firstLocation.bovine || firstLocation.Bovine) : null;
            patterns[bovineId] = {
                bovine: bovineData,
                movement_stats: stats,
                location_points: bovineLocationData.length,
                activity_level: MapsController.classifyActivityLevel(stats.total_distance, stats.average_speed),
                last_location: firstLocation ? {
                    latitude: parseFloat(firstLocation.latitude),
                    longitude: parseFloat(firstLocation.longitude),
                    recorded_at: firstLocation.recorded_at
                } : null
            };
        }
        return patterns;
    }
    static classifyActivityLevel(totalDistance, averageSpeed) {
        if (totalDistance < 100 && averageSpeed < 50) {
            return 'low';
        }
        else if (totalDistance < 500 && averageSpeed < 200) {
            return 'moderate';
        }
        else {
            return 'high';
        }
    }
}
exports.MapsController = MapsController;
exports.default = MapsController;
//# sourceMappingURL=maps.js.map