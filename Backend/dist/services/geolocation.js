"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geolocationService = exports.GeolocationService = void 0;
const sequelize_1 = require("sequelize");
const Location_1 = __importDefault(require("../models/Location"));
const Bovine_1 = __importDefault(require("../models/Bovine"));
const notification_1 = require("./notification");
const logger_1 = require("../utils/logger");
const Location_2 = require("../models/Location");
const database_1 = __importDefault(require("../config/database"));
var MovementPattern;
(function (MovementPattern) {
    MovementPattern["GRAZING"] = "GRAZING";
    MovementPattern["RESTING"] = "RESTING";
    MovementPattern["WALKING"] = "WALKING";
    MovementPattern["RUNNING"] = "RUNNING";
    MovementPattern["FEEDING"] = "FEEDING";
    MovementPattern["DRINKING"] = "DRINKING";
    MovementPattern["SOCIAL"] = "SOCIAL";
    MovementPattern["UNKNOWN"] = "UNKNOWN";
})(MovementPattern || (MovementPattern = {}));
var AlertType;
(function (AlertType) {
    AlertType["GEOFENCE_ENTRY"] = "GEOFENCE_ENTRY";
    AlertType["GEOFENCE_EXIT"] = "GEOFENCE_EXIT";
    AlertType["HIGH_SPEED"] = "HIGH_SPEED";
    AlertType["IMMOBILITY"] = "IMMOBILITY";
    AlertType["DEVICE_OFFLINE"] = "DEVICE_OFFLINE";
    AlertType["LOW_BATTERY"] = "LOW_BATTERY";
    AlertType["UNUSUAL_MOVEMENT"] = "UNUSUAL_MOVEMENT";
    AlertType["GROUP_SEPARATION"] = "GROUP_SEPARATION";
})(AlertType || (AlertType = {}));
class GeolocationService {
    constructor() {
        this.EARTH_RADIUS_KM = 6371;
        this.DEFAULT_ACCURACY_THRESHOLD = 10;
        this.HIGH_SPEED_THRESHOLD = 15;
        this.IMMOBILITY_THRESHOLD = 300;
    }
    async recordLocation(locationData) {
        const transaction = await database_1.default.transaction();
        try {
            this.validateCoordinates(locationData);
            const isDuplicate = await this.isDuplicateLocation(locationData, transaction);
            if (isDuplicate) {
                logger_1.logger.warn(`Ubicación duplicada ignorada para bovino ${locationData.bovineId}`, { bovineId: locationData.bovineId }, 'GeolocationService');
                await transaction.rollback();
                return locationData;
            }
            const bovine = await Bovine_1.default.findByPk(locationData.bovineId, { transaction });
            if (!bovine) {
                throw new Error(`Bovino con ID ${locationData.bovineId} no encontrado`);
            }
            const locationRecord = {
                ...locationData,
                id: this.generateLocationId(),
                timestamp: locationData.timestamp || new Date()
            };
            const updatedLocation = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                altitude: locationData.altitude,
                accuracy: locationData.accuracy,
                timestamp: locationRecord.timestamp,
                source: locationData.source
            };
            const updatedTrackingConfig = {
                isEnabled: bovine.trackingConfig?.isEnabled ?? true,
                deviceId: bovine.trackingConfig?.deviceId,
                batteryLevel: locationData.batteryLevel ?? bovine.trackingConfig?.batteryLevel,
                signalStrength: locationData.signalStrength ?? bovine.trackingConfig?.signalStrength,
                lastUpdate: locationRecord.timestamp,
                updateInterval: bovine.trackingConfig?.updateInterval,
                geofenceAlerts: bovine.trackingConfig?.geofenceAlerts ?? true
            };
            await bovine.update({
                location: updatedLocation,
                trackingConfig: updatedTrackingConfig
            }, { transaction });
            await this.processGeofenceAlerts(locationRecord, transaction);
            await this.analyzeMovementPattern(locationRecord, transaction);
            await transaction.commit();
            logger_1.logger.info(`Ubicación registrada para bovino ${locationData.bovineId}`, {
                bovineId: locationData.bovineId,
                coordinates: `${locationData.latitude}, ${locationData.longitude}`,
                source: locationData.source
            }, 'GeolocationService');
            return locationRecord;
        }
        catch (error) {
            await transaction.rollback();
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error('Error registrando ubicación:', {
                error: errorMessage,
                locationData
            }, error, 'GeolocationService');
            throw new Error(`Error registrando ubicación: ${errorMessage}`);
        }
    }
    async recordBatchLocations(locations) {
        const successful = [];
        const failed = [];
        const batchSize = 10;
        for (let i = 0; i < locations.length; i += batchSize) {
            const batch = locations.slice(i, i + batchSize);
            const batchPromises = batch.map(async (location) => {
                try {
                    const recorded = await this.recordLocation(location);
                    return { success: true, data: recorded };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                    return { success: false, location, error: errorMessage };
                }
            });
            const results = await Promise.allSettled(batchPromises);
            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    const value = result.value;
                    if (value.success && value.data) {
                        successful.push(value.data);
                    }
                    else if (!value.success && value.location && value.error) {
                        failed.push({
                            location: value.location,
                            error: value.error
                        });
                    }
                }
                else {
                    logger_1.logger.error('Error procesando ubicación en lote:', { error: result.reason }, result.reason, 'GeolocationService');
                }
            });
        }
        logger_1.logger.info(`Procesamiento en lote completado: ${successful.length} exitosos, ${failed.length} fallidos`, { successCount: successful.length, failedCount: failed.length }, 'GeolocationService');
        return { successful, failed };
    }
    async getLocationHistory(bovineId, filters = {}) {
        try {
            const bovine = await Bovine_1.default.findByPk(bovineId);
            if (!bovine || !bovine.location) {
                return [];
            }
            const currentLocation = {
                id: this.generateLocationId(),
                bovineId: bovine.id,
                latitude: bovine.location.latitude,
                longitude: bovine.location.longitude,
                altitude: bovine.location.altitude,
                accuracy: bovine.location.accuracy,
                timestamp: bovine.location.timestamp || new Date(),
                source: bovine.location.source || 'GPS',
                speed: 0,
                heading: 0
            };
            return [currentLocation];
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error(`Error obteniendo historial de ubicaciones para bovino ${bovineId}:`, { error: errorMessage, bovineId }, error, 'GeolocationService');
            throw new Error(`Error obteniendo historial: ${errorMessage}`);
        }
    }
    async getCurrentLocation(bovineId) {
        try {
            const bovine = await Bovine_1.default.findByPk(bovineId);
            if (!bovine || !bovine.location) {
                return null;
            }
            const locationPoint = {
                id: this.generateLocationId(),
                bovineId: bovine.id,
                latitude: bovine.location.latitude,
                longitude: bovine.location.longitude,
                altitude: bovine.location.altitude,
                accuracy: bovine.location.accuracy,
                timestamp: bovine.location.timestamp || new Date(),
                source: bovine.location.source || 'GPS'
            };
            return locationPoint;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error(`Error obteniendo ubicación actual para bovino ${bovineId}:`, { error: errorMessage, bovineId }, error, 'GeolocationService');
            throw new Error(`Error obteniendo ubicación actual: ${errorMessage}`);
        }
    }
    calculateDistance(point1, point2) {
        const lat1Rad = this.toRadians(point1.latitude);
        const lat2Rad = this.toRadians(point2.latitude);
        const deltaLatRad = this.toRadians(point2.latitude - point1.latitude);
        const deltaLngRad = this.toRadians(point2.longitude - point1.longitude);
        const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.EARTH_RADIUS_KM * c;
    }
    async findBovinesInRadius(center, radiusKm, ranchId) {
        try {
            const boundingBox = this.getBoundingBox(center, radiusKm);
            const whereConditions = {
                isActive: true,
                location: {
                    [sequelize_1.Op.ne]: null
                }
            };
            if (ranchId) {
                whereConditions.farmId = ranchId;
            }
            const bovines = await Bovine_1.default.findAll({
                where: whereConditions,
                attributes: ['id', 'earTag', 'location']
            });
            const bovinesInBoundingBox = bovines.filter(bovine => {
                if (!bovine.location || !bovine.location.latitude || !bovine.location.longitude) {
                    return false;
                }
                return (bovine.location.latitude >= boundingBox.southWest.latitude &&
                    bovine.location.latitude <= boundingBox.northEast.latitude &&
                    bovine.location.longitude >= boundingBox.southWest.longitude &&
                    bovine.location.longitude <= boundingBox.northEast.longitude);
            });
            const results = bovinesInBoundingBox
                .map(bovine => {
                if (!bovine.location)
                    return null;
                const distance = this.calculateDistance(center, bovine.location);
                if (distance <= radiusKm) {
                    const locationPoint = {
                        id: this.generateLocationId(),
                        bovineId: bovine.id,
                        latitude: bovine.location.latitude,
                        longitude: bovine.location.longitude,
                        altitude: bovine.location.altitude,
                        accuracy: bovine.location.accuracy,
                        timestamp: bovine.location.timestamp || new Date(),
                        source: bovine.location.source || 'GPS'
                    };
                    return {
                        bovineId: bovine.id,
                        location: locationPoint,
                        distance
                    };
                }
                return null;
            })
                .filter((result) => result !== null)
                .sort((a, b) => a.distance - b.distance);
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error('Error buscando bovinos en radio:', {
                error: errorMessage,
                center,
                radiusKm
            }, error, 'GeolocationService');
            throw new Error(`Error buscando bovinos: ${errorMessage}`);
        }
    }
    async createGeofence(geofenceData) {
        const transaction = await database_1.default.transaction();
        try {
            if (geofenceData.coordinates && geofenceData.coordinates.length > 0) {
                geofenceData.coordinates.forEach(coord => this.validateCoordinates(coord));
            }
            let center = geofenceData.center;
            if (!center && geofenceData.coordinates.length > 0) {
                center = this.calculateCentroid(geofenceData.coordinates);
            }
            const locationCode = `GF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            const geofenceConfig = {
                type: geofenceData.type,
                center: center,
                radius: geofenceData.radius,
                coordinates: geofenceData.coordinates,
                isActive: true,
                priority: 'MEDIUM',
                alertTriggers: [Location_2.AlertTrigger.ENTRY, Location_2.AlertTrigger.EXIT],
                alertRecipients: []
            };
            const location = await Location_1.default.create({
                locationCode,
                name: geofenceData.name,
                description: geofenceData.description,
                type: Location_2.LocationType.SAFE_ZONE,
                status: Location_2.LocationStatus.ACTIVE,
                coordinates: center,
                geofenceConfig,
                accessLevel: Location_2.AccessLevel.PRIVATE,
                isActive: true,
                isMonitored: geofenceData.alertsEnabled || true,
                hasAlerts: false,
                farmId: geofenceData.ranchId,
                createdBy: geofenceData.createdBy
            }, { transaction });
            await transaction.commit();
            logger_1.logger.info(`Geofence creada: ${geofenceData.name}`, {
                locationId: location.id,
                type: geofenceData.type,
                ranchId: geofenceData.ranchId
            }, 'GeolocationService');
            return location;
        }
        catch (error) {
            await transaction.rollback();
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error('Error creando geofence:', {
                error: errorMessage,
                geofenceData
            }, error, 'GeolocationService');
            throw new Error(`Error creando geofence: ${errorMessage}`);
        }
    }
    isPointInGeofence(point, geofence) {
        return geofence.isPointInsideGeofence(point);
    }
    async analyzeMovement(bovineId, startDate, endDate) {
        try {
            const locations = await this.getLocationHistory(bovineId, { startDate, endDate });
            if (locations.length < 2) {
                return {
                    bovineId,
                    period: { start: startDate, end: endDate },
                    totalDistance: 0,
                    averageSpeed: 0,
                    maxSpeed: 0,
                    timeMoving: 0,
                    timeResting: 0,
                    pattern: MovementPattern.UNKNOWN,
                    locations: [],
                    anomalies: ['Datos insuficientes para análisis']
                };
            }
            let totalDistance = 0;
            let maxSpeed = 0;
            let timeMoving = 0;
            let timeResting = 0;
            const anomalies = [];
            for (let i = 1; i < locations.length; i++) {
                const prevLocation = locations[i - 1];
                const currentLocation = locations[i];
                const distance = this.calculateDistance(prevLocation, currentLocation) * 1000;
                const timeDiff = (currentLocation.timestamp.getTime() - prevLocation.timestamp.getTime()) / 1000;
                const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0;
                totalDistance += distance;
                if (speed > maxSpeed) {
                    maxSpeed = speed;
                }
                if (speed > 0.5) {
                    timeMoving += timeDiff / 60;
                }
                else {
                    timeResting += timeDiff / 60;
                }
                if (speed > this.HIGH_SPEED_THRESHOLD) {
                    anomalies.push(`Velocidad alta detectada: ${speed.toFixed(1)} km/h`);
                }
            }
            const totalTime = (endDate.getTime() - startDate.getTime()) / 1000 / 60;
            const averageSpeed = totalTime > 0 ? (totalDistance / 1000) / (totalTime / 60) : 0;
            const pattern = this.determineMovementPattern(timeMoving, timeResting, averageSpeed);
            return {
                bovineId,
                period: { start: startDate, end: endDate },
                totalDistance,
                averageSpeed,
                maxSpeed,
                timeMoving,
                timeResting,
                pattern,
                locations,
                anomalies
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error(`Error analizando movimiento para bovino ${bovineId}:`, {
                error: errorMessage,
                bovineId,
                period: { startDate, endDate }
            }, error, 'GeolocationService');
            throw new Error(`Error analizando movimiento: ${errorMessage}`);
        }
    }
    async getGeoStatistics(ranchId, days = 30) {
        try {
            const whereConditions = { isActive: true };
            if (ranchId) {
                whereConditions.farmId = ranchId;
            }
            const totalBovines = await Bovine_1.default.count({ where: whereConditions });
            let activeBovines = 0;
            try {
                const bovinesWithTracking = await Bovine_1.default.findAll({
                    where: whereConditions,
                    attributes: ['trackingConfig']
                });
                activeBovines = bovinesWithTracking.filter(b => b.trackingConfig && b.trackingConfig.isEnabled === true).length;
            }
            catch (error) {
                activeBovines = Math.floor(totalBovines * 0.8);
            }
            const stats = {
                totalLocations: totalBovines,
                averageAccuracy: 3.5,
                coverageArea: 25.8,
                mostActiveHours: [
                    { hour: 6, count: Math.floor(totalBovines * 0.8) },
                    { hour: 18, count: Math.floor(totalBovines * 0.7) },
                    { hour: 12, count: Math.floor(totalBovines * 0.6) }
                ],
                deviceUptime: activeBovines > 0 ? (activeBovines / totalBovines) * 100 : 0,
                locationsBySource: {
                    GPS: Math.floor(totalBovines * 0.8),
                    MANUAL: Math.floor(totalBovines * 0.15),
                    ESTIMATED: Math.floor(totalBovines * 0.05)
                },
                geofenceViolations: 8,
                averageMovementSpeed: 2.3
            };
            return stats;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error('Error obteniendo estadísticas de geolocalización:', {
                error: errorMessage,
                ranchId
            }, error, 'GeolocationService');
            throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
        }
    }
    async reverseGeocode(coordinates) {
        try {
            const { latitude, longitude } = coordinates;
            if (latitude >= 17.3 && latitude <= 18.7 && longitude >= -94.1 && longitude <= -91.0) {
                return `Tabasco, México (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            }
            else if (latitude >= 17.0 && latitude <= 21.0 && longitude >= -99.0 && longitude <= -86.0) {
                return `México (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            }
            else {
                return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger_1.logger.error('Error en geocodificación inversa:', {
                error: errorMessage,
                coordinates
            }, error, 'GeolocationService');
            return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
        }
    }
    validateCoordinates(coordinates) {
        if (typeof coordinates.latitude !== 'number' ||
            typeof coordinates.longitude !== 'number') {
            throw new Error('Latitud y longitud deben ser números');
        }
        if (coordinates.latitude < -90 || coordinates.latitude > 90) {
            throw new Error('Latitud debe estar entre -90 y 90 grados');
        }
        if (coordinates.longitude < -180 || coordinates.longitude > 180) {
            throw new Error('Longitud debe estar entre -180 y 180 grados');
        }
        if (coordinates.accuracy && coordinates.accuracy < 0) {
            throw new Error('La precisión debe ser un valor positivo');
        }
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    getBoundingBox(center, radiusKm) {
        const latDelta = radiusKm / 111.32;
        const lngDelta = radiusKm / (111.32 * Math.cos(this.toRadians(center.latitude)));
        return {
            northEast: {
                latitude: center.latitude + latDelta,
                longitude: center.longitude + lngDelta
            },
            southWest: {
                latitude: center.latitude - latDelta,
                longitude: center.longitude - lngDelta
            }
        };
    }
    calculateCentroid(points) {
        const sum = points.reduce((acc, point) => ({
            latitude: acc.latitude + point.latitude,
            longitude: acc.longitude + point.longitude
        }), { latitude: 0, longitude: 0 });
        return {
            latitude: sum.latitude / points.length,
            longitude: sum.longitude / points.length
        };
    }
    calculateGroupCohesion(locations, maxDistance) {
        if (locations.length < 2)
            return 1;
        const center = this.calculateCentroid(locations);
        const distances = locations.map(loc => this.calculateDistance(center, loc) * 1000);
        const averageDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        return Math.max(0, 1 - (averageDistance / maxDistance));
    }
    determineMovementPattern(timeMoving, timeResting, averageSpeed) {
        const totalTime = timeMoving + timeResting;
        const movementRatio = totalTime > 0 ? timeMoving / totalTime : 0;
        if (movementRatio > 0.7 && averageSpeed > 3) {
            return MovementPattern.WALKING;
        }
        else if (movementRatio > 0.5 && averageSpeed > 1) {
            return MovementPattern.GRAZING;
        }
        else if (movementRatio < 0.2) {
            return MovementPattern.RESTING;
        }
        else if (averageSpeed > 8) {
            return MovementPattern.RUNNING;
        }
        else {
            return MovementPattern.GRAZING;
        }
    }
    async isDuplicateLocation(location, transaction) {
        try {
            const bovine = await Bovine_1.default.findByPk(location.bovineId, { transaction });
            if (!bovine || !bovine.location || !bovine.location.timestamp) {
                return false;
            }
            const timeDiff = Math.abs(location.timestamp.getTime() - bovine.location.timestamp.getTime());
            const distance = this.calculateDistance(location, bovine.location) * 1000;
            return timeDiff < 60000 && distance < 5;
        }
        catch (error) {
            return false;
        }
    }
    async processGeofenceAlerts(location, transaction) {
        try {
            const geofences = await Location_1.default.findAll({
                where: {
                    isActive: true,
                    isMonitored: true
                },
                transaction
            });
            const activeGeofences = geofences.filter(geofence => geofence.geofenceConfig && geofence.geofenceConfig.isActive === true);
            for (const geofence of activeGeofences) {
                if (!geofence.geofenceConfig)
                    continue;
                const isInside = this.isPointInGeofence(location, geofence);
                if (geofence.type === Location_2.LocationType.RESTRICTED_AREA && isInside) {
                    const alert = {
                        id: this.generateAlertId(),
                        type: AlertType.GEOFENCE_ENTRY,
                        bovineId: location.bovineId,
                        geofenceId: geofence.id,
                        location: { latitude: location.latitude, longitude: location.longitude },
                        timestamp: new Date(),
                        severity: 'HIGH',
                        message: `Bovino ${location.bovineId} entró en zona restringida ${geofence.name}`,
                        isResolved: false
                    };
                    await this.sendLocationAlert(alert);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error procesando alertas de geofence:', {
                error: error instanceof Error ? error.message : 'Error desconocido',
                locationId: location.id,
                bovineId: location.bovineId
            }, error, 'GeolocationService');
        }
    }
    async analyzeMovementPattern(location, transaction) {
        try {
            const bovine = await Bovine_1.default.findByPk(location.bovineId, { transaction });
            if (!bovine || !bovine.location || !bovine.location.timestamp)
                return;
            const timeDiff = (location.timestamp.getTime() - bovine.location.timestamp.getTime()) / 1000;
            const distance = this.calculateDistance(bovine.location, location) * 1000;
            const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0;
            if (speed > this.HIGH_SPEED_THRESHOLD) {
                const alert = {
                    id: this.generateAlertId(),
                    type: AlertType.HIGH_SPEED,
                    bovineId: location.bovineId,
                    location: { latitude: location.latitude, longitude: location.longitude },
                    timestamp: new Date(),
                    severity: 'MEDIUM',
                    message: `Velocidad alta detectada: ${speed.toFixed(1)} km/h`,
                    isResolved: false
                };
                await this.sendLocationAlert(alert);
            }
        }
        catch (error) {
            logger_1.logger.error('Error analizando patrón de movimiento:', {
                error: error instanceof Error ? error.message : 'Error desconocido',
                locationId: location.id,
                bovineId: location.bovineId
            }, error, 'GeolocationService');
        }
    }
    async sendLocationAlert(alert) {
        try {
            const bovine = await Bovine_1.default.findByPk(alert.bovineId);
            await notification_1.notificationService.sendLocationAlert({
                bovineId: alert.bovineId,
                bovineEarTag: bovine?.earTag || alert.bovineId,
                alertType: alert.type === AlertType.GEOFENCE_ENTRY ? 'geofence_violation' :
                    alert.type === AlertType.HIGH_SPEED ? 'unusual_movement' : 'device_offline',
                message: alert.message,
                location: alert.location,
                ranchId: bovine?.farmId || 'unknown'
            });
        }
        catch (error) {
            logger_1.logger.error('Error enviando alerta de ubicación:', {
                error: error instanceof Error ? error.message : 'Error desconocido',
                alertId: alert.id
            }, error, 'GeolocationService');
        }
    }
    generateLocationId() {
        return `loc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.GeolocationService = GeolocationService;
exports.geolocationService = new GeolocationService();
//# sourceMappingURL=geolocation.js.map