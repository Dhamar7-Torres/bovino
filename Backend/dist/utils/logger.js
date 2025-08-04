"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CattleLogger = exports.logger = exports.getLoggerStats = exports.setLogLevel = exports.generateRequestId = exports.logPerformance = exports.logAuthEvent = exports.logDatabaseError = exports.logCattleEvent = exports.logUserActivity = exports.logDebug = exports.logInfo = exports.logWarn = exports.logError = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./constants");
const LOG_COLORS = {
    [constants_1.LOG_LEVELS.ERROR]: '\x1b[31m',
    [constants_1.LOG_LEVELS.WARN]: '\x1b[33m',
    [constants_1.LOG_LEVELS.INFO]: '\x1b[36m',
    [constants_1.LOG_LEVELS.DEBUG]: '\x1b[37m',
    reset: '\x1b[0m'
};
const defaultConfig = {
    level: process.env.LOG_LEVEL || constants_1.LOG_LEVELS.INFO,
    enableConsole: process.env.NODE_ENV !== 'production',
    enableFile: true,
    logDirectory: process.env.LOG_DIRECTORY || './logs',
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 10,
    format: 'json',
    includeStackTrace: true
};
class CattleLogger {
    constructor(config = {}) {
        this.requestCounter = 0;
        this.config = { ...defaultConfig, ...config };
        this.currentLogFile = this.generateLogFileName();
        this.ensureLogDirectory();
        this.initializeLogger();
    }
    ensureLogDirectory() {
        try {
            if (!(0, fs_1.existsSync)(this.config.logDirectory)) {
                (0, fs_1.mkdirSync)(this.config.logDirectory, { recursive: true });
            }
        }
        catch (error) {
            console.error('❌ Error creando directorio de logs:', error);
        }
    }
    generateLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return (0, path_1.join)(this.config.logDirectory, `cattle-app-${date}.log`);
    }
    initializeLogger() {
        try {
            const startupEntry = {
                timestamp: new Date().toISOString(),
                level: constants_1.LOG_LEVELS.INFO,
                message: '🚀 Sistema de logging inicializado',
                module: 'Logger',
                metadata: {
                    config: {
                        level: this.config.level,
                        enableConsole: this.config.enableConsole,
                        enableFile: this.config.enableFile,
                        logDirectory: this.config.logDirectory
                    },
                    environment: constants_1.SERVER_CONFIG.NODE_ENV,
                    processId: process.pid
                }
            };
            this.writeLog(startupEntry);
        }
        catch (error) {
            console.error('❌ Error inicializando logger:', error);
        }
    }
    shouldLog(level) {
        const levels = [constants_1.LOG_LEVELS.ERROR, constants_1.LOG_LEVELS.WARN, constants_1.LOG_LEVELS.INFO, constants_1.LOG_LEVELS.DEBUG];
        const configLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= configLevelIndex;
    }
    formatConsoleMessage(entry) {
        const color = LOG_COLORS[entry.level] || LOG_COLORS.reset;
        const timestamp = new Date(entry.timestamp).toLocaleString('es-ES');
        const level = entry.level.toUpperCase().padEnd(5);
        const module = entry.module ? `[${entry.module}]` : '';
        let message = `${color}${timestamp} ${level}${LOG_COLORS.reset} ${module} ${entry.message}`;
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            message += `\n${color}📋 Metadata:${LOG_COLORS.reset} ${JSON.stringify(entry.metadata, null, 2)}`;
        }
        if (entry.error && this.config.includeStackTrace) {
            message += `\n${color}🔥 Error:${LOG_COLORS.reset} ${entry.error.stack || entry.error.message}`;
        }
        return message;
    }
    formatFileMessage(entry) {
        if (this.config.format === 'json') {
            const logData = {
                timestamp: entry.timestamp,
                level: entry.level,
                message: entry.message,
                module: entry.module,
                userId: entry.userId,
                requestId: entry.requestId,
                metadata: entry.metadata,
                error: entry.error ? {
                    name: entry.error.name,
                    message: entry.error.message,
                    stack: this.config.includeStackTrace ? entry.error.stack : undefined
                } : undefined,
                processId: process.pid,
                hostname: process.env.HOSTNAME || 'unknown'
            };
            return JSON.stringify(logData);
        }
        else {
            const timestamp = entry.timestamp;
            const level = entry.level.toUpperCase();
            const module = entry.module ? `[${entry.module}]` : '';
            const userId = entry.userId ? `User:${entry.userId}` : '';
            const requestId = entry.requestId ? `Req:${entry.requestId}` : '';
            let message = `${timestamp} ${level} ${module} ${userId} ${requestId} ${entry.message}`;
            if (entry.metadata) {
                message += ` | Metadata: ${JSON.stringify(entry.metadata)}`;
            }
            if (entry.error) {
                message += ` | Error: ${entry.error.message}`;
                if (this.config.includeStackTrace && entry.error.stack) {
                    message += `\nStack: ${entry.error.stack}`;
                }
            }
            return message;
        }
    }
    checkLogRotation() {
        try {
            if (!(0, fs_1.existsSync)(this.currentLogFile)) {
                return {
                    currentSize: 0,
                    rotationNeeded: false,
                    nextLogFile: this.currentLogFile
                };
            }
            const stats = require('fs').statSync(this.currentLogFile);
            const currentSize = stats.size;
            const rotationNeeded = currentSize >= this.config.maxFileSize;
            if (rotationNeeded) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const baseName = this.currentLogFile.replace('.log', '');
                const nextLogFile = `${baseName}-${timestamp}.log`;
                return {
                    currentSize,
                    rotationNeeded: true,
                    nextLogFile
                };
            }
            return {
                currentSize,
                rotationNeeded: false,
                nextLogFile: this.currentLogFile
            };
        }
        catch (error) {
            console.error('❌ Error verificando rotación de logs:', error);
            return {
                currentSize: 0,
                rotationNeeded: false,
                nextLogFile: this.currentLogFile
            };
        }
    }
    rotateLogFile(rotationInfo) {
        try {
            if (rotationInfo.rotationNeeded) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);
                require('fs').renameSync(this.currentLogFile, rotatedFile);
                this.cleanOldLogFiles();
                this.currentLogFile = this.generateLogFileName();
            }
        }
        catch (error) {
            console.error('❌ Error rotando archivo de log:', error);
        }
    }
    cleanOldLogFiles() {
        try {
            const fs = require('fs');
            const files = fs.readdirSync(this.config.logDirectory)
                .filter((file) => file.startsWith('cattle-app-') && file.endsWith('.log'))
                .map((file) => ({
                name: file,
                path: (0, path_1.join)(this.config.logDirectory, file),
                mtime: fs.statSync((0, path_1.join)(this.config.logDirectory, file)).mtime
            }))
                .sort((a, b) => b.mtime - a.mtime);
            if (files.length > this.config.maxFiles) {
                const filesToDelete = files.slice(this.config.maxFiles);
                filesToDelete.forEach((file) => {
                    try {
                        fs.unlinkSync(file.path);
                        console.log(`🗑️ Archivo de log eliminado: ${file.name}`);
                    }
                    catch (error) {
                        console.error(`❌ Error eliminando archivo ${file.name}:`, error);
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error limpiando archivos de log antiguos:', error);
        }
    }
    writeLog(entry) {
        try {
            if (this.config.enableConsole && this.shouldLog(entry.level)) {
                const consoleMessage = this.formatConsoleMessage(entry);
                console.log(consoleMessage);
            }
            if (this.config.enableFile && this.shouldLog(entry.level)) {
                const rotationInfo = this.checkLogRotation();
                this.rotateLogFile(rotationInfo);
                const fileMessage = this.formatFileMessage(entry);
                (0, fs_1.appendFileSync)(this.currentLogFile, fileMessage + '\n', 'utf8');
            }
        }
        catch (error) {
            console.error('❌ Error escribiendo log:', error);
        }
    }
    generateRequestId() {
        this.requestCounter++;
        const timestamp = Date.now().toString(36);
        const counter = this.requestCounter.toString(36);
        return `req_${timestamp}_${counter}`;
    }
    error(message, metadata, error, module) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.ERROR,
            message,
            module,
            metadata,
            error
        };
        this.writeLog(entry);
    }
    warn(message, metadata, module) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.WARN,
            message,
            module,
            metadata
        };
        this.writeLog(entry);
    }
    info(message, metadata, module) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.INFO,
            message,
            module,
            metadata
        };
        this.writeLog(entry);
    }
    debug(message, metadata, module) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.DEBUG,
            message,
            module,
            metadata
        };
        this.writeLog(entry);
    }
    userActivity(userId, action, metadata, requestId) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.INFO,
            message: `Actividad de usuario: ${action}`,
            module: 'UserActivity',
            userId,
            requestId,
            metadata: {
                ...metadata,
                action,
                userAgent: process.env.HTTP_USER_AGENT || 'unknown'
            }
        };
        this.writeLog(entry);
    }
    cattleEvent(cattleId, eventType, eventData, userId) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.INFO,
            message: `Evento de ganado: ${eventType}`,
            module: 'CattleEvent',
            userId,
            metadata: {
                cattleId,
                eventType,
                eventData
            }
        };
        this.writeLog(entry);
    }
    databaseError(operation, error, query, params) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: constants_1.LOG_LEVELS.ERROR,
            message: `Error de base de datos en operación: ${operation}`,
            module: 'Database',
            error,
            metadata: {
                operation,
                query,
                params
            }
        };
        this.writeLog(entry);
    }
    authEvent(event, userId, metadata) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: event === 'failed_login' ? constants_1.LOG_LEVELS.WARN : constants_1.LOG_LEVELS.INFO,
            message: `Evento de autenticación: ${event}`,
            module: 'Auth',
            userId,
            metadata: {
                ...metadata,
                event,
                ipAddress: process.env.CLIENT_IP || 'unknown'
            }
        };
        this.writeLog(entry);
    }
    performance(operation, duration, metadata) {
        const level = duration > 5000 ? constants_1.LOG_LEVELS.WARN : constants_1.LOG_LEVELS.DEBUG;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message: `Performance: ${operation} completado en ${duration}ms`,
            module: 'Performance',
            metadata: {
                ...metadata,
                operation,
                duration,
                threshold: duration > 5000 ? 'exceeded' : 'normal'
            }
        };
        this.writeLog(entry);
    }
    setLogLevel(level) {
        this.config.level = level;
        this.info(`Nivel de log cambiado a: ${level}`, { previousLevel: this.config.level }, 'Logger');
    }
    getStats() {
        try {
            const stats = {
                config: this.config,
                currentLogFile: this.currentLogFile,
                logDirectory: this.config.logDirectory,
                fileExists: (0, fs_1.existsSync)(this.currentLogFile),
                fileSize: 0,
                requestCounter: this.requestCounter
            };
            if (stats.fileExists) {
                const fileStats = require('fs').statSync(this.currentLogFile);
                stats.fileSize = fileStats.size;
            }
            return stats;
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas del logger:', error);
            return {};
        }
    }
    close() {
        this.info('🔐 Logger cerrando...', undefined, 'Logger');
    }
}
exports.CattleLogger = CattleLogger;
const logger = new CattleLogger();
exports.logger = logger;
const logError = (message, metadata, error, module) => {
    logger.error(message, metadata, error, module);
};
exports.logError = logError;
const logWarn = (message, metadata, module) => {
    logger.warn(message, metadata, module);
};
exports.logWarn = logWarn;
const logInfo = (message, metadata, module) => {
    logger.info(message, metadata, module);
};
exports.logInfo = logInfo;
const logDebug = (message, metadata, module) => {
    logger.debug(message, metadata, module);
};
exports.logDebug = logDebug;
const logUserActivity = (userId, action, metadata, requestId) => {
    logger.userActivity(userId, action, metadata, requestId);
};
exports.logUserActivity = logUserActivity;
const logCattleEvent = (cattleId, eventType, eventData, userId) => {
    logger.cattleEvent(cattleId, eventType, eventData, userId);
};
exports.logCattleEvent = logCattleEvent;
const logDatabaseError = (operation, error, query, params) => {
    logger.databaseError(operation, error, query, params);
};
exports.logDatabaseError = logDatabaseError;
const logAuthEvent = (event, userId, metadata) => {
    logger.authEvent(event, userId, metadata);
};
exports.logAuthEvent = logAuthEvent;
const logPerformance = (operation, duration, metadata) => {
    logger.performance(operation, duration, metadata);
};
exports.logPerformance = logPerformance;
const generateRequestId = () => logger.generateRequestId();
exports.generateRequestId = generateRequestId;
const setLogLevel = (level) => logger.setLogLevel(level);
exports.setLogLevel = setLogLevel;
const getLoggerStats = () => logger.getStats();
exports.getLoggerStats = getLoggerStats;
//# sourceMappingURL=logger.js.map