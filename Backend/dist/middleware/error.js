"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.asyncErrorHandler = exports.createCattleError = exports.validateResponse = exports.notFoundHandler = exports.errorHandler = exports.CattleErrorCodes = void 0;
const auth_1 = require("./auth");
var CattleErrorCodes;
(function (CattleErrorCodes) {
    CattleErrorCodes["CATTLE_NOT_FOUND"] = "CATTLE_NOT_FOUND";
    CattleErrorCodes["INVALID_EAR_TAG"] = "INVALID_EAR_TAG";
    CattleErrorCodes["DUPLICATE_EAR_TAG"] = "DUPLICATE_EAR_TAG";
    CattleErrorCodes["CATTLE_ALREADY_DECEASED"] = "CATTLE_ALREADY_DECEASED";
    CattleErrorCodes["VACCINATION_NOT_FOUND"] = "VACCINATION_NOT_FOUND";
    CattleErrorCodes["VACCINE_EXPIRED"] = "VACCINE_EXPIRED";
    CattleErrorCodes["VACCINATION_TOO_RECENT"] = "VACCINATION_TOO_RECENT";
    CattleErrorCodes["INVALID_VACCINE_DOSE"] = "INVALID_VACCINE_DOSE";
    CattleErrorCodes["HEALTH_RECORD_NOT_FOUND"] = "HEALTH_RECORD_NOT_FOUND";
    CattleErrorCodes["INVALID_DIAGNOSIS"] = "INVALID_DIAGNOSIS";
    CattleErrorCodes["TREATMENT_CONFLICT"] = "TREATMENT_CONFLICT";
    CattleErrorCodes["INVALID_COORDINATES"] = "INVALID_COORDINATES";
    CattleErrorCodes["LOCATION_OUT_OF_BOUNDS"] = "LOCATION_OUT_OF_BOUNDS";
    CattleErrorCodes["GPS_UNAVAILABLE"] = "GPS_UNAVAILABLE";
    CattleErrorCodes["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    CattleErrorCodes["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    CattleErrorCodes["FILE_CORRUPTED"] = "FILE_CORRUPTED";
    CattleErrorCodes["DATABASE_CONNECTION_ERROR"] = "DATABASE_CONNECTION_ERROR";
    CattleErrorCodes["QUERY_TIMEOUT"] = "QUERY_TIMEOUT";
    CattleErrorCodes["CONSTRAINT_VIOLATION"] = "CONSTRAINT_VIOLATION";
    CattleErrorCodes["INVALID_DATE_RANGE"] = "INVALID_DATE_RANGE";
    CattleErrorCodes["INVALID_WEIGHT_VALUE"] = "INVALID_WEIGHT_VALUE";
    CattleErrorCodes["INVALID_AGE_VALUE"] = "INVALID_AGE_VALUE";
    CattleErrorCodes["INVALID_BREED"] = "INVALID_BREED";
    CattleErrorCodes["INVALID_GENDER"] = "INVALID_GENDER";
})(CattleErrorCodes || (exports.CattleErrorCodes = CattleErrorCodes = {}));
const getClientIP = (req) => {
    return req.ip ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        'unknown';
};
const createErrorLog = (error, req) => {
    return {
        timestamp: new Date().toISOString(),
        level: error instanceof auth_1.ApiError && error.statusCode < 500 ? 'warn' : 'error',
        message: error.message,
        stack: error.stack,
        userId: req.userId,
        userEmail: req.user?.email,
        path: req.originalUrl || req.url,
        method: req.method,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined,
        params: Object.keys(req.params || {}).length > 0 ? req.params : undefined,
        query: Object.keys(req.query || {}).length > 0 ? req.query : undefined
    };
};
const notifyCriticalError = async (errorLog) => {
    try {
        if (errorLog.level === 'error') {
            console.error('🚨 ERROR CRÍTICO EN SISTEMA GANADERO:', {
                message: errorLog.message,
                path: errorLog.path,
                user: errorLog.userEmail,
                timestamp: errorLog.timestamp
            });
        }
    }
    catch (notificationError) {
        console.error('Error al enviar notificación de error crítico:', notificationError);
    }
};
const errorHandler = async (error, req, res, next) => {
    try {
        const errorLog = createErrorLog(error, req);
        if (errorLog.level === 'error') {
            console.error('❌ Error del sistema:', errorLog);
        }
        else {
            console.warn('⚠️ Advertencia del sistema:', errorLog);
        }
        if (errorLog.level === 'error') {
            await notifyCriticalError(errorLog);
        }
        let statusCode = 500;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'Error interno del servidor';
        let details = undefined;
        if (error instanceof auth_1.ApiError) {
            statusCode = error.statusCode;
            errorCode = error.code;
            message = error.message;
        }
        else if (error.name === 'ValidationError') {
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
            message = 'Error de validación de datos';
            details = error.message;
        }
        else if (error.name === 'CastError') {
            statusCode = 400;
            errorCode = 'INVALID_ID_FORMAT';
            message = 'Formato de ID inválido';
        }
        else if (error.name === 'MongoError' || error.name === 'SequelizeError') {
            statusCode = 500;
            errorCode = 'DATABASE_ERROR';
            message = 'Error de base de datos';
            if (process.env.NODE_ENV === 'development') {
                details = error.message;
            }
        }
        else if (error.name === 'MulterError') {
            statusCode = 400;
            errorCode = 'FILE_UPLOAD_ERROR';
            message = 'Error en la carga de archivo';
            details = error.message;
        }
        else if (error.message.includes('ECONNREFUSED')) {
            statusCode = 503;
            errorCode = 'SERVICE_UNAVAILABLE';
            message = 'Servicio temporalmente no disponible';
        }
        else if (error.name === 'JsonWebTokenError') {
            statusCode = 401;
            errorCode = 'INVALID_TOKEN';
            message = 'Token de autenticación inválido';
        }
        else if (error.name === 'TokenExpiredError') {
            statusCode = 401;
            errorCode = 'EXPIRED_TOKEN';
            message = 'Token de autenticación expirado';
        }
        const requestId = req.headers['x-request-id'] ||
            `cattle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const errorResponse = {
            success: false,
            error: {
                code: errorCode,
                message: message,
                details: details,
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.url,
                method: req.method
            },
            requestId: requestId
        };
        if (process.env.NODE_ENV === 'development') {
            errorResponse.error.stack = error.stack;
        }
        res.status(statusCode).json(errorResponse);
    }
    catch (handlerError) {
        console.error('Error crítico en el manejador de errores:', handlerError);
        res.status(500).json({
            success: false,
            error: {
                code: 'CRITICAL_ERROR_HANDLER_FAILURE',
                message: 'Error crítico en el sistema',
                timestamp: new Date().toISOString(),
                path: req.originalUrl || req.url,
                method: req.method
            }
        });
    }
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new auth_1.ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND');
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const validateResponse = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (typeof data === 'string') {
                    try {
                        const parsed = JSON.parse(data);
                        if (!parsed.hasOwnProperty('success')) {
                            console.warn(`⚠️ Respuesta sin campo 'success' en ${req.originalUrl}`);
                        }
                    }
                    catch (e) {
                    }
                }
            }
        }
        catch (validationError) {
            console.error('Error validando respuesta:', validationError);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.validateResponse = validateResponse;
const createCattleError = (code, customMessage, details) => {
    const errorMessages = {
        [CattleErrorCodes.CATTLE_NOT_FOUND]: 'Animal no encontrado',
        [CattleErrorCodes.INVALID_EAR_TAG]: 'Número de arete inválido',
        [CattleErrorCodes.DUPLICATE_EAR_TAG]: 'El número de arete ya existe',
        [CattleErrorCodes.CATTLE_ALREADY_DECEASED]: 'El animal ya está marcado como fallecido',
        [CattleErrorCodes.VACCINATION_NOT_FOUND]: 'Registro de vacunación no encontrado',
        [CattleErrorCodes.VACCINE_EXPIRED]: 'La vacuna está vencida',
        [CattleErrorCodes.VACCINATION_TOO_RECENT]: 'Vacunación muy reciente, debe esperar',
        [CattleErrorCodes.INVALID_VACCINE_DOSE]: 'Dosis de vacuna inválida',
        [CattleErrorCodes.HEALTH_RECORD_NOT_FOUND]: 'Registro de salud no encontrado',
        [CattleErrorCodes.INVALID_DIAGNOSIS]: 'Diagnóstico inválido',
        [CattleErrorCodes.TREATMENT_CONFLICT]: 'Conflicto con tratamiento actual',
        [CattleErrorCodes.INVALID_COORDINATES]: 'Coordenadas GPS inválidas',
        [CattleErrorCodes.LOCATION_OUT_OF_BOUNDS]: 'Ubicación fuera de los límites del rancho',
        [CattleErrorCodes.GPS_UNAVAILABLE]: 'GPS no disponible',
        [CattleErrorCodes.INVALID_FILE_TYPE]: 'Tipo de archivo no permitido',
        [CattleErrorCodes.FILE_TOO_LARGE]: 'Archivo demasiado grande',
        [CattleErrorCodes.FILE_CORRUPTED]: 'Archivo corrupto o dañado',
        [CattleErrorCodes.DATABASE_CONNECTION_ERROR]: 'Error de conexión a la base de datos',
        [CattleErrorCodes.QUERY_TIMEOUT]: 'Tiempo de espera agotado en la consulta',
        [CattleErrorCodes.CONSTRAINT_VIOLATION]: 'Violación de restricción de base de datos',
        [CattleErrorCodes.INVALID_DATE_RANGE]: 'Rango de fechas inválido',
        [CattleErrorCodes.INVALID_WEIGHT_VALUE]: 'Valor de peso inválido',
        [CattleErrorCodes.INVALID_AGE_VALUE]: 'Valor de edad inválido',
        [CattleErrorCodes.INVALID_BREED]: 'Raza no válida',
        [CattleErrorCodes.INVALID_GENDER]: 'Género no válido'
    };
    const message = customMessage || errorMessages[code];
    const statusCode = code.includes('NOT_FOUND') ? 404 :
        code.includes('DUPLICATE') || code.includes('INVALID') ? 400 : 500;
    const error = new auth_1.ApiError(statusCode, message, code);
    if (details) {
        error.details = details;
    }
    return error;
};
exports.createCattleError = createCattleError;
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
exports.default = exports.errorHandler;
var auth_2 = require("./auth");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return auth_2.ApiError; } });
//# sourceMappingURL=error.js.map