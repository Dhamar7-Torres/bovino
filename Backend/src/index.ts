// ============================================================================
// INDEX.TS - SERVIDOR PRINCIPAL DEL BACKEND - VERSIÓN CORREGIDA COMPLETA
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

// 🔧 ARREGLO 1: Puerto correcto desde .env (5000, no 8000)
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// 🔧 ARREGLO 2: CORS SUPER PERMISIVO PRIMERO (ANTES DE HELMET)
// ============================================================================

const cors = require('cors');

// CORS completamente permisivo para desarrollo
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // En desarrollo, permitir CUALQUIER origen
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      callback(null, true);
      return;
    }
    
    // Orígenes permitidos expandidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:4173', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Origen rechazado: ${origin} - PERO PERMITIDO EN DESARROLLO`);
      // EN DESARROLLO, PERMITIR DE TODAS FORMAS
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 🔧 ARREGLO 3: Middleware CORS manual adicional para asegurar funcionamiento
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Forzar headers CORS en desarrollo
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Responder inmediatamente a OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// ============================================================================
// 🔧 ARREGLO 4: HELMET CON CSP MUY PERMISIVO PARA DESARROLLO
// ============================================================================

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  // En desarrollo, helmet MUY permisivo para evitar errores CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
        imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
        // 🚨 CLAVE: Esto arregla los errores de connect-src
        connectSrc: [
          "'self'", 
          "http://localhost:*", 
          "https://localhost:*", 
          "http://127.0.0.1:*",
          "https://127.0.0.1:*",
          "ws://localhost:*",
          "wss://localhost:*"
        ],
        fontSrc: ["'self'", "https:", "http:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:", "http:", "data:"],
        frameSrc: ["'self'", "https:", "http:"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
        manifestSrc: ["'self'"],
        baseUri: ["'self'"]
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
  }));
  
  console.log('🛡️  Helmet configurado para desarrollo (CSP muy permisivo)');
} else {
  // Configuración más segura para producción
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
}

// ============================================================================
// 🔧 ARREGLO 5: FAVICON Y MIDDLEWARE ADICIONAL
// ============================================================================

// Manejar favicon para evitar errores 404
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end(); // No Content - evita el error 404
});

// Middleware adicional para limpiar headers problemáticos
app.use((req, res, next) => {
  // Remover headers que pueden causar conflictos
  res.removeHeader('X-Powered-By');
  
  // Asegurar CORS headers están presentes en desarrollo
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// ============================================================================
// MIDDLEWARE DE UTILIDADES
// ============================================================================

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
    status: 'active',
    cors: 'enabled',
    port: PORT
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
    version: '1.0.0',
    cors: 'working',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🔧 ARREGLO 6: Endpoint específico para pruebas de CORS
app.get('/api/test-cors', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CORS funcionando correctamente',
    origin: req.headers.origin || 'no-origin',
    userAgent: req.headers['user-agent'],
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers'),
    }
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
      timestamp: new Date().toISOString(),
      cors: 'enabled',
      port: PORT,
      host: HOST
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
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test-cors',
      'GET /system-info'
    ]
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

    // 🔧 Mostrar configuración CORS y CSP
    console.log('🌐 Configuración de desarrollo:');
    console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Puerto: ${PORT}`);
    console.log(`   - CORS: Habilitado (muy permisivo)`);
    console.log(`   - CSP: Configurado para desarrollo`);
    console.log(`   - Helmet: Modo desarrollo`);

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
      console.log(`🧪 Test CORS: http://${HOST}:${PORT}/api/test-cors`);
      console.log(`📊 Estado del sistema: http://${HOST}:${PORT}/system-info`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
      console.log('');
      console.log('🔧 PRUEBAS RÁPIDAS:');
      console.log(`curl http://localhost:${PORT}/api/health`);
      console.log(`curl http://localhost:${PORT}/api/test-cors`);
      console.log('');
      console.log('🌐 Frontend fetch test:');
      console.log(`fetch('http://localhost:${PORT}/api/health').then(r=>r.json()).then(console.log)`);
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
          console.log('💡 Soluciones:');
          console.log(`   lsof -i :${PORT}  # Ver qué proceso usa el puerto`);
          console.log(`   kill -9 <PID>     # Matar el proceso`);
          console.log(`   PORT=5001 npm run dev  # Usar otro puerto`);
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
    console.log('   Backend API v1.0.0 - CORS Y CSP ARREGLADOS');
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