// Sistema de logging para la aplicación de seguimiento de ganado
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LOG_LEVELS, SERVER_CONFIG } from './constants';

// Interfaces para el sistema de logging
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  userId?: number;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDirectory: string;
  maxFileSize: number; // en bytes
  maxFiles: number;
  format: 'json' | 'text';
  includeStackTrace: boolean;
}

interface LogRotationInfo {
  currentSize: number;
  rotationNeeded: boolean;
  nextLogFile: string;
}

// Tipos de niveles de log
type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

// Colores para la consola
const LOG_COLORS = {
  [LOG_LEVELS.ERROR]: '\x1b[31m',   // Rojo
  [LOG_LEVELS.WARN]: '\x1b[33m',    // Amarillo
  [LOG_LEVELS.INFO]: '\x1b[36m',    // Cian
  [LOG_LEVELS.DEBUG]: '\x1b[37m',   // Blanco
  reset: '\x1b[0m'
} as const;

// Configuración por defecto del logger
const defaultConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || LOG_LEVELS.INFO,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: true,
  logDirectory: process.env.LOG_DIRECTORY || './logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  format: 'json',
  includeStackTrace: true
};

class CattleLogger {
  private config: LoggerConfig;
  private currentLogFile: string;
  private requestCounter: number = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.currentLogFile = this.generateLogFileName();
    this.ensureLogDirectory();
    this.initializeLogger();
  }

  /**
   * Asegurar que el directorio de logs existe
   */
  private ensureLogDirectory(): void {
    try {
      if (!existsSync(this.config.logDirectory)) {
        mkdirSync(this.config.logDirectory, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Error creando directorio de logs:', error);
    }
  }

  /**
   * Generar nombre del archivo de log
   */
  private generateLogFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return join(this.config.logDirectory, `cattle-app-${date}.log`);
  }

  /**
   * Inicializar el logger
   */
  private initializeLogger(): void {
    try {
      // Escribir entrada de inicio
      const startupEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LOG_LEVELS.INFO,
        message: '🚀 Sistema de logging inicializado',
        module: 'Logger',
        metadata: {
          config: {
            level: this.config.level,
            enableConsole: this.config.enableConsole,
            enableFile: this.config.enableFile,
            logDirectory: this.config.logDirectory
          },
          environment: SERVER_CONFIG.NODE_ENV,
          processId: process.pid
        }
      };

      this.writeLog(startupEntry);
    } catch (error) {
      console.error('❌ Error inicializando logger:', error);
    }
  }

  /**
   * Verificar si se debe registrar un nivel de log
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= configLevelIndex;
  }

  /**
   * Formatear entrada de log para la consola
   */
  private formatConsoleMessage(entry: LogEntry): string {
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

  /**
   * Formatear entrada de log para archivo
   */
  private formatFileMessage(entry: LogEntry): string {
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
    } else {
      // Formato de texto
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

  /**
   * Verificar si se necesita rotación de archivos
   */
  private checkLogRotation(): LogRotationInfo {
    try {
      if (!existsSync(this.currentLogFile)) {
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
    } catch (error) {
      console.error('❌ Error verificando rotación de logs:', error);
      return {
        currentSize: 0,
        rotationNeeded: false,
        nextLogFile: this.currentLogFile
      };
    }
  }

  /**
   * Rotar archivo de log
   */
  private rotateLogFile(rotationInfo: LogRotationInfo): void {
    try {
      if (rotationInfo.rotationNeeded) {
        // Renombrar archivo actual
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);
        
        require('fs').renameSync(this.currentLogFile, rotatedFile);
        
        // Limpiar archivos antiguos
        this.cleanOldLogFiles();
        
        // Actualizar archivo actual
        this.currentLogFile = this.generateLogFileName();
      }
    } catch (error) {
      console.error('❌ Error rotando archivo de log:', error);
    }
  }

  /**
   * Limpiar archivos de log antiguos
   */
  private cleanOldLogFiles(): void {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(this.config.logDirectory)
        .filter((file: string) => file.startsWith('cattle-app-') && file.endsWith('.log'))
        .map((file: string) => ({
          name: file,
          path: join(this.config.logDirectory, file),
          mtime: fs.statSync(join(this.config.logDirectory, file)).mtime
        }))
        .sort((a: any, b: any) => b.mtime - a.mtime);

      // Mantener solo los archivos más recientes
      if (files.length > this.config.maxFiles) {
        const filesToDelete = files.slice(this.config.maxFiles);
        filesToDelete.forEach((file: any) => {
          try {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Archivo de log eliminado: ${file.name}`);
          } catch (error) {
            console.error(`❌ Error eliminando archivo ${file.name}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error limpiando archivos de log antiguos:', error);
    }
  }

  /**
   * Escribir entrada de log
   */
  private writeLog(entry: LogEntry): void {
    try {
      // Log a consola
      if (this.config.enableConsole && this.shouldLog(entry.level)) {
        const consoleMessage = this.formatConsoleMessage(entry);
        console.log(consoleMessage);
      }

      // Log a archivo
      if (this.config.enableFile && this.shouldLog(entry.level)) {
        const rotationInfo = this.checkLogRotation();
        this.rotateLogFile(rotationInfo);

        const fileMessage = this.formatFileMessage(entry);
        appendFileSync(this.currentLogFile, fileMessage + '\n', 'utf8');
      }
    } catch (error) {
      console.error('❌ Error escribiendo log:', error);
    }
  }

  /**
   * Generar ID único para request
   */
  public generateRequestId(): string {
    this.requestCounter++;
    const timestamp = Date.now().toString(36);
    const counter = this.requestCounter.toString(36);
    return `req_${timestamp}_${counter}`;
  }

  /**
   * Log de nivel ERROR
   */
  public error(message: string, metadata?: Record<string, any>, error?: Error, module?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.ERROR,
      message,
      module,
      metadata,
      error
    };
    this.writeLog(entry);
  }

  /**
   * Log de nivel WARN
   */
  public warn(message: string, metadata?: Record<string, any>, module?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.WARN,
      message,
      module,
      metadata
    };
    this.writeLog(entry);
  }

  /**
   * Log de nivel INFO
   */
  public info(message: string, metadata?: Record<string, any>, module?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.INFO,
      message,
      module,
      metadata
    };
    this.writeLog(entry);
  }

  /**
   * Log de nivel DEBUG
   */
  public debug(message: string, metadata?: Record<string, any>, module?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.DEBUG,
      message,
      module,
      metadata
    };
    this.writeLog(entry);
  }

  /**
   * Log de actividad de usuario
   */
  public userActivity(
    userId: number,
    action: string,
    metadata?: Record<string, any>,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.INFO,
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

  /**
   * Log de eventos de ganado
   */
  public cattleEvent(
    cattleId: number,
    eventType: string,
    eventData: Record<string, any>,
    userId?: number
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.INFO,
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

  /**
   * Log de errores de base de datos
   */
  public databaseError(
    operation: string,
    error: Error,
    query?: string,
    params?: any[]
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.ERROR,
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

  /**
   * Log de autenticación
   */
  public authEvent(
    event: 'login' | 'logout' | 'failed_login' | 'token_expired',
    userId?: number,
    metadata?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: event === 'failed_login' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO,
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

  /**
   * Log de performance
   */
  public performance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const level = duration > 5000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
    
    const entry: LogEntry = {
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

  /**
   * Cambiar nivel de log en tiempo de ejecución
   */
  public setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(`Nivel de log cambiado a: ${level}`, { previousLevel: this.config.level }, 'Logger');
  }

  /**
   * Obtener estadísticas del logger
   */
  public getStats(): Record<string, any> {
    try {
      const stats = {
        config: this.config,
        currentLogFile: this.currentLogFile,
        logDirectory: this.config.logDirectory,
        fileExists: existsSync(this.currentLogFile),
        fileSize: 0,
        requestCounter: this.requestCounter
      };

      if (stats.fileExists) {
        const fileStats = require('fs').statSync(this.currentLogFile);
        stats.fileSize = fileStats.size;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del logger:', error);
      return {};
    }
  }

  /**
   * Cerrar el logger y limpiar recursos
   */
  public close(): void {
    this.info('🔐 Logger cerrando...', undefined, 'Logger');
  }
}

// Instancia global del logger
const logger = new CattleLogger();

// Exportar funciones directas para facilidad de uso
export const logError = (message: string, metadata?: Record<string, any>, error?: Error, module?: string) => {
  logger.error(message, metadata, error, module);
};

export const logWarn = (message: string, metadata?: Record<string, any>, module?: string) => {
  logger.warn(message, metadata, module);
};

export const logInfo = (message: string, metadata?: Record<string, any>, module?: string) => {
  logger.info(message, metadata, module);
};

export const logDebug = (message: string, metadata?: Record<string, any>, module?: string) => {
  logger.debug(message, metadata, module);
};

export const logUserActivity = (userId: number, action: string, metadata?: Record<string, any>, requestId?: string) => {
  logger.userActivity(userId, action, metadata, requestId);
};

export const logCattleEvent = (cattleId: number, eventType: string, eventData: Record<string, any>, userId?: number) => {
  logger.cattleEvent(cattleId, eventType, eventData, userId);
};

export const logDatabaseError = (operation: string, error: Error, query?: string, params?: any[]) => {
  logger.databaseError(operation, error, query, params);
};

export const logAuthEvent = (event: 'login' | 'logout' | 'failed_login' | 'token_expired', userId?: number, metadata?: Record<string, any>) => {
  logger.authEvent(event, userId, metadata);
};

export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  logger.performance(operation, duration, metadata);
};

export const generateRequestId = () => logger.generateRequestId();

export const setLogLevel = (level: LogLevel) => logger.setLogLevel(level);

export const getLoggerStats = () => logger.getStats();

// Exportar la instancia principal y tipos
export { logger, CattleLogger };
export type { LogEntry, LoggerConfig, LogLevel, LogRotationInfo };