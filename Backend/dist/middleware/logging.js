"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = exports.resetSystemMetrics = exports.getSystemMetrics = exports.auditTrail = exports.logLocationChange = exports.logVeterinaryActivity = exports.logCattleError = exports.logCattleEvent = exports.requestLogger = exports.CattleEventType = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var CattleEventType;
(function (CattleEventType) {
    CattleEventType["CATTLE_CREATED"] = "cattle_created";
    CattleEventType["CATTLE_UPDATED"] = "cattle_updated";
    CattleEventType["CATTLE_DELETED"] = "cattle_deleted";
    CattleEventType["CATTLE_MOVED"] = "cattle_moved";
    CattleEventType["CATTLE_DECEASED"] = "cattle_deceased";
    CattleEventType["HEALTH_CHECKUP"] = "health_checkup";
    CattleEventType["ILLNESS_DIAGNOSED"] = "illness_diagnosed";
    CattleEventType["TREATMENT_STARTED"] = "treatment_started";
    CattleEventType["TREATMENT_COMPLETED"] = "treatment_completed";
    CattleEventType["RECOVERY_RECORDED"] = "recovery_recorded";
    CattleEventType["VACCINATION_SCHEDULED"] = "vaccination_scheduled";
    CattleEventType["VACCINATION_ADMINISTERED"] = "vaccination_administered";
    CattleEventType["VACCINATION_MISSED"] = "vaccination_missed";
    CattleEventType["VACCINE_REACTION"] = "vaccine_reaction";
    CattleEventType["BREEDING_PLANNED"] = "breeding_planned";
    CattleEventType["MATING_RECORDED"] = "mating_recorded";
    CattleEventType["PREGNANCY_DETECTED"] = "pregnancy_detected";
    CattleEventType["BIRTH_RECORDED"] = "birth_recorded";
    CattleEventType["WEANING_RECORDED"] = "weaning_recorded";
    CattleEventType["MILK_PRODUCTION_RECORDED"] = "milk_production_recorded";
    CattleEventType["WEIGHT_RECORDED"] = "weight_recorded";
    CattleEventType["FEED_CONSUMPTION_RECORDED"] = "feed_consumption_recorded";
    CattleEventType["MEDICATION_USED"] = "medication_used";
    CattleEventType["MEDICATION_EXPIRED"] = "medication_expired";
    CattleEventType["INVENTORY_UPDATED"] = "inventory_updated";
    CattleEventType["SUPPLY_ORDERED"] = "supply_ordered";
    CattleEventType["LOGIN_ATTEMPT"] = "login_attempt";
    CattleEventType["LOGOUT"] = "logout";
    CattleEventType["PASSWORD_CHANGED"] = "password_changed";
    CattleEventType["PERMISSION_CHANGED"] = "permission_changed";
    CattleEventType["BACKUP_CREATED"] = "backup_created";
    CattleEventType["DATA_EXPORTED"] = "data_exported";
    CattleEventType["DATA_IMPORTED"] = "data_imported";
    CattleEventType["SYSTEM_ERROR"] = "system_error";
})(CattleEventType || (exports.CattleEventType = CattleEventType = {}));
class CattleLogger {
    constructor() {
        this.performanceMetrics = {
            requestCount: 0,
            averageResponseTime: 0,
            errorCount: 0,
            activeUsers: new Set(),
            popularEndpoints: new Map(),
            slowQueries: []
        };
    }
    static getInstance() {
        if (!CattleLogger.instance) {
            CattleLogger.instance = new CattleLogger();
        }
        return CattleLogger.instance;
    }
    log(logData) {
        const logString = this.formatLog(logData);
        switch (logData.level) {
            case LogLevel.ERROR:
                console.error(logString);
                break;
            case LogLevel.WARN:
                console.warn(logString);
                break;
            case LogLevel.INFO:
                console.info(logString);
                break;
            case LogLevel.DEBUG:
                if (process.env.NODE_ENV === 'development') {
                    console.debug(logString);
                }
                break;
            case LogLevel.TRACE:
                if (process.env.LOG_LEVEL === 'trace') {
                    console.trace(logString);
                }
                break;
        }
        this.updateMetrics(logData);
        if (logData.level === LogLevel.ERROR) {
            this.sendCriticalAlert(logData);
        }
    }
    formatLog(logData) {
        const emoji = this.getLogEmoji(logData.level, logData.eventType);
        if (process.env.NODE_ENV === 'development') {
            return `${emoji} [${logData.level.toUpperCase()}] ${logData.timestamp} - ${logData.message}
      Event: ${logData.eventType}
      User: ${logData.userEmail || 'Sistema'} (${logData.userRole || 'N/A'})
      ${logData.cattleEarTag ? `Ganado: ${logData.cattleEarTag}` : ''}
      ${logData.path ? `Endpoint: ${logData.method} ${logData.path}` : ''}
      ${logData.responseTime ? `Tiempo: ${logData.responseTime}ms` : ''}
      ${logData.metadata ? `Datos: ${JSON.stringify(logData.metadata, null, 2)}` : ''}`;
        }
        else {
            return JSON.stringify(logData);
        }
    }
    getLogEmoji(level, eventType) {
        if (level === LogLevel.ERROR)
            return '🚨';
        if (level === LogLevel.WARN)
            return '⚠️';
        const eventEmojis = {
            [CattleEventType.CATTLE_CREATED]: '🐄',
            [CattleEventType.VACCINATION_ADMINISTERED]: '💉',
            [CattleEventType.ILLNESS_DIAGNOSED]: '🩺',
            [CattleEventType.BIRTH_RECORDED]: '🍼',
            [CattleEventType.CATTLE_MOVED]: '📍',
            [CattleEventType.MILK_PRODUCTION_RECORDED]: '🥛',
            [CattleEventType.LOGIN_ATTEMPT]: '🔐',
            [CattleEventType.DATA_EXPORTED]: '📊',
            [CattleEventType.BACKUP_CREATED]: '💾'
        };
        return eventEmojis[eventType] || '📝';
    }
    updateMetrics(logData) {
        this.performanceMetrics.requestCount++;
        if (logData.userId) {
            this.performanceMetrics.activeUsers.add(logData.userId);
        }
        if (logData.level === LogLevel.ERROR) {
            this.performanceMetrics.errorCount++;
        }
        if (logData.path) {
            const current = this.performanceMetrics.popularEndpoints.get(logData.path) || 0;
            this.performanceMetrics.popularEndpoints.set(logData.path, current + 1);
        }
        if (logData.responseTime) {
            const currentAvg = this.performanceMetrics.averageResponseTime;
            const count = this.performanceMetrics.requestCount;
            this.performanceMetrics.averageResponseTime =
                (currentAvg * (count - 1) + logData.responseTime) / count;
            if (logData.responseTime > 1000) {
                this.performanceMetrics.slowQueries.push({
                    query: `${logData.method} ${logData.path}`,
                    duration: logData.responseTime,
                    timestamp: logData.timestamp
                });
                if (this.performanceMetrics.slowQueries.length > 100) {
                    this.performanceMetrics.slowQueries.shift();
                }
            }
        }
    }
    sendCriticalAlert(logData) {
        console.error('🚨 ALERTA CRÍTICA DEL SISTEMA GANADERO 🚨', {
            message: logData.message,
            event: logData.eventType,
            user: logData.userEmail,
            cattle: logData.cattleEarTag,
            timestamp: logData.timestamp
        });
    }
    getMetrics() {
        return {
            ...this.performanceMetrics,
            activeUsers: new Set(this.performanceMetrics.activeUsers),
            popularEndpoints: new Map(this.performanceMetrics.popularEndpoints),
            slowQueries: [...this.performanceMetrics.slowQueries]
        };
    }
    resetMetrics() {
        this.performanceMetrics = {
            requestCount: 0,
            averageResponseTime: 0,
            errorCount: 0,
            activeUsers: new Set(),
            popularEndpoints: new Map(),
            slowQueries: []
        };
    }
}
const logger = CattleLogger.getInstance();
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] ||
        `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    logger.log({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: 'http_request',
        message: `Request entrante: ${req.method} ${req.originalUrl}`,
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        requestId: requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: {
            query: req.query,
            params: req.params,
            bodySize: req.get('content-length') || 0
        }
    });
    const originalSend = res.send;
    res.send = function (data) {
        const responseTime = Date.now() - startTime;
        logger.log({
            timestamp: new Date().toISOString(),
            level: res.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
            eventType: 'http_response',
            message: `Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`,
            userId: req.userId,
            userEmail: req.user?.email,
            userRole: req.userRole,
            requestId: requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: responseTime,
            ip: req.ip || req.connection.remoteAddress,
            metadata: {
                responseSize: data ? JSON.stringify(data).length : 0
            }
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
const logCattleEvent = (eventType, message, req, metadata) => {
    logger.log({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: eventType,
        message: message,
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        requestId: req.requestId,
        cattleId: metadata?.cattleId,
        cattleEarTag: metadata?.cattleEarTag,
        location: metadata?.location,
        metadata: metadata
    });
};
exports.logCattleEvent = logCattleEvent;
const logCattleError = (error, req, context) => {
    logger.log({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        eventType: CattleEventType.SYSTEM_ERROR,
        message: error.message,
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        requestId: req.requestId,
        cattleId: context?.cattleId,
        cattleEarTag: context?.cattleEarTag,
        method: req.method,
        path: req.originalUrl,
        stack: error.stack,
        error: {
            name: error.name,
            message: error.message,
            code: error.code
        },
        metadata: context
    });
};
exports.logCattleError = logCattleError;
const logVeterinaryActivity = (activity, cattleEarTag, details, req, location) => {
    const eventTypes = {
        diagnosis: CattleEventType.ILLNESS_DIAGNOSED,
        treatment: CattleEventType.TREATMENT_STARTED,
        vaccination: CattleEventType.VACCINATION_ADMINISTERED,
        checkup: CattleEventType.HEALTH_CHECKUP
    };
    logger.log({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: eventTypes[activity],
        message: `Actividad veterinaria: ${activity} en ganado ${cattleEarTag}`,
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        requestId: req.requestId,
        cattleEarTag: cattleEarTag,
        location: location,
        metadata: {
            activity: activity,
            details: details,
            veterinarian: req.user?.email
        }
    });
};
exports.logVeterinaryActivity = logVeterinaryActivity;
const logLocationChange = (cattleEarTag, fromLocation, toLocation, req, reason) => {
    logger.log({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: CattleEventType.CATTLE_MOVED,
        message: `Ganado ${cattleEarTag} movido de ${fromLocation.address || 'ubicación desconocida'} a ${toLocation.address || 'nueva ubicación'}`,
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        requestId: req.requestId,
        cattleEarTag: cattleEarTag,
        location: toLocation,
        metadata: {
            fromLocation: fromLocation,
            toLocation: toLocation,
            reason: reason,
            distance: calculateDistance(fromLocation, toLocation)
        }
    });
};
exports.logLocationChange = logLocationChange;
function calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
const auditTrail = (operation, resource) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                logger.log({
                    timestamp: new Date().toISOString(),
                    level: LogLevel.INFO,
                    eventType: `${resource.toLowerCase()}_${operation.toLowerCase()}`,
                    message: `${operation} en ${resource}: ${req.method} ${req.originalUrl}`,
                    userId: req.userId,
                    userEmail: req.user?.email,
                    userRole: req.userRole,
                    requestId: req.requestId,
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: res.statusCode,
                    metadata: {
                        operation: operation,
                        resource: resource,
                        resourceId: req.params.id || req.body.id,
                        changes: operation === 'UPDATE' ? req.body : undefined
                    }
                });
            }
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditTrail = auditTrail;
const getSystemMetrics = () => {
    return logger.getMetrics();
};
exports.getSystemMetrics = getSystemMetrics;
const resetSystemMetrics = () => {
    logger.resetMetrics();
};
exports.resetSystemMetrics = resetSystemMetrics;
const logMessage = (level, eventType, message, metadata) => {
    logger.log({
        timestamp: new Date().toISOString(),
        level: level,
        eventType: eventType,
        message: message,
        metadata: metadata
    });
};
exports.logMessage = logMessage;
//# sourceMappingURL=logging.js.map