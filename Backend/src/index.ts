// ============================================================================
// INDEX.TS - SERVIDOR PRINCIPAL DEL BACKEND
// ============================================================================
// Servidor Express principal con todas las configuraciones y middleware

import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

// Importar middleware personalizado
import { errorHandler } from './middleware/error';

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();

// Crear servidor HTTP
const server = createServer(app);

// Puerto del servidor
const PORT = parseInt(process.env.PORT || '8000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// MIDDLEWARE DE SEGURIDAD Y UTILIDADES
// ============================================================================

// Seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compresión de respuestas
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Logging de requests HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// CORS configurado
const cors = require('cors');
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Parsing de JSON y URL-encoded
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      const response = res as Response;
      response.status(400).json({
        success: false,
        message: 'JSON inválido en el cuerpo de la petición'
      });
      throw new Error('JSON inválido');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Ruta de salud básica
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión Ganadera - API REST',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
});

// Health check básico
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Información del sistema
app.get('/system-info', async (req: Request, res: Response) => {
  try {
    const systemInfo = {
      status: 'active',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo información del sistema'
    });
  }
});

// ============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================================================

// Middleware para rutas no encontradas
const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    timestamp: new Date().toISOString()
  });
};

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores
app.use(errorHandler);

// ============================================================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa todos los servicios del backend
 */
async function initializeServices(): Promise<boolean> {
  try {
    console.log('🚀 Iniciando Sistema de Gestión Ganadera...');
    console.log('='.repeat(50));

    // Validaciones básicas
    console.log('📋 Validando configuración básica...');
    
    if (!process.env.DB_HOST) {
      console.warn('⚠️ DB_HOST no configurado');
    }
    
    if (!process.env.JWT_ACCESS_SECRET) {
      console.warn('⚠️ JWT_ACCESS_SECRET no configurado');
    }

    console.log('='.repeat(50));
    console.log('✅ Servicios básicos inicializados');
    return true;

  } catch (error) {
    console.error('❌ Error crítico durante la inicialización:', error);
    return false;
  }
}

/**
 * Inicia el servidor HTTP
 */
async function startServer(): Promise<void> {
  try {
    server.listen(PORT, HOST, () => {
      console.log('');
      console.log('🎉 ¡Servidor iniciado exitosamente!');
      console.log('='.repeat(50));
      console.log(`🌐 Servidor corriendo en: http://${HOST}:${PORT}`);
      console.log(`📚 Documentación API: http://${HOST}:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`📊 Estado del sistema: http://${HOST}:${PORT}/system-info`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
      console.log('='.repeat(50));
      console.log('');
    });

    // Manejo de errores del servidor
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requiere privilegios elevados`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} ya está en uso`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// ============================================================================
// MANEJO DE CIERRE ORDENADO
// ============================================================================

/**
 * Maneja el cierre ordenado del sistema
 */
async function handleShutdown(signal: string): Promise<void> {
  console.log(`\n🔄 Señal ${signal} recibida. Iniciando cierre ordenado...`);
  
  try {
    // Cerrar servidor HTTP
    server.close(() => {
      console.log('🌐 Servidor HTTP cerrado');
    });

    console.log('✅ Cierre ordenado completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre ordenado:', error);
    process.exit(1);
  }
}

// Escuchar señales de cierre
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Excepción no capturada:', error);
  handleShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('   En la promesa:', promise);
  handleShutdown('UNHANDLED_REJECTION');
});

// ============================================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================================

/**
 * Función principal de inicialización
 */
async function main(): Promise<void> {
  try {
    // Mostrar banner de inicio
    console.clear();
    console.log('🐄 SISTEMA DE GESTIÓN GANADERA - UJAT');
    console.log('   Universidad Juárez Autónoma de Tabasco');
    console.log('   Backend API v1.0.0');
    console.log('');

    // Inicializar servicios
    const servicesReady = await initializeServices();
    if (!servicesReady) {
      console.error('❌ Error crítico: No se pudieron inicializar los servicios');
      process.exit(1);
    }

    // Iniciar servidor
    await startServer();

  } catch (error) {
    console.error('❌ Error crítico en la inicialización:', error);
    process.exit(1);
  }
}

// Ejecutar función principal solo si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

// Exportar la aplicación para tests
export default app;
export { server };