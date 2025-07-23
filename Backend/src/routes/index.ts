import { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { 
  authenticateToken, 
  globalErrorHandler,
  requestLogger,
  responseLogger,
  apiVersioning,
  healthCheck
} from '../middleware';

// ===================================================================
// IMPORTACIÓN DE TODAS LAS RUTAS DEL SISTEMA
// ===================================================================

// Rutas de autenticación y usuarios
import authRoutes from './auth';

// Rutas de gestión de ganado
import bovinesRoutes from './bovines';

// Rutas de salud veterinaria
import healthRoutes from './health';

// Rutas de reproducción
import reproductionRoutes from './reproduction';

// Rutas de producción
import productionRoutes from './production';

// Rutas de mapas y geolocalización
import mapsRoutes from './maps';

// Rutas de eventos y calendario
import eventsRoutes from './events';
import calendarRoutes from './calendar';

// Rutas de inventario de medicamentos
import inventoryRoutes from './inventory';

// Rutas de finanzas
import financesRoutes from './finances';

// Rutas de reportes
import reportsRoutes from './reports';

// Rutas de gestión del rancho
import ranchRoutes from './ranch';

// Rutas de alimentación y nutrición
import feedingRoutes from './feeding';

// Rutas de dashboard
import dashboardRoutes from './dashboard';

// Rutas de gestión de archivos
import uploadRoutes from './upload';

// ===================================================================
// CONFIGURACIÓN DEL ROUTER PRINCIPAL
// ===================================================================

const router = Router();

// ===================================================================
// MIDDLEWARE GLOBAL DE SEGURIDAD Y CONFIGURACIÓN
// ===================================================================

// Configuración de CORS específica para aplicación ganadera
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de dominios permitidos para la aplicación ganadera
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://ganado-app.com',
      'https://www.ganado-app.com',
      'https://app.ganado-ujat.edu.mx',
      // Agregar más dominios según necesidad
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-API-Key',
    'X-Client-Version',
    'X-Ranch-ID'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
    'X-Rate-Limit-Remaining',
    'Content-Disposition'
  ],
  maxAge: 86400 // 24 horas
};

router.use(cors(corsOptions));

// Configuración de Helmet para seguridad
router.use(helmet({
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
  crossOriginEmbedderPolicy: false
}));

// Compresión de respuestas
router.use(compression({
  filter: (req, res) => {
    // No comprimir si el cliente lo rechaza
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Usar filtro por defecto para todo lo demás
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024 // Solo comprimir si > 1KB
}));

// ===================================================================
// RATE LIMITING GLOBAL
// ===================================================================

// Rate limiting general para toda la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP',
    message: 'Por favor intente nuevamente en 15 minutos',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚫 Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
      retryAfter: Math.ceil(15 * 60)
    });
  }
});

// Rate limiting estricto para operaciones críticas
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // máximo 100 requests por IP por hora
  message: {
    error: 'Límite de operaciones críticas excedido',
    message: 'Por favor intente nuevamente en 1 hora',
    retryAfter: 60 * 60
  }
});

router.use(generalLimiter);

// ===================================================================
// MIDDLEWARE DE LOGGING Y AUDITORÍA
// ===================================================================

// Logging de requests entrantes
router.use(requestLogger);

// Middleware para agregar información de contexto
router.use((req: Request, res: Response, next: NextFunction) => {
  // Agregar timestamp de inicio de request
  req.startTime = Date.now();
  
  // Agregar ID único de request para trazabilidad
  req.requestId = require('crypto').randomUUID();
  
  // Agregar información del cliente
  req.clientInfo = {
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'Unknown',
    version: req.get('X-Client-Version') || '1.0.0',
    platform: req.get('X-Client-Platform') || 'Unknown'
  };
  
  next();
});

// ===================================================================
// VERSIONADO DE API
// ===================================================================

router.use(apiVersioning);

// ===================================================================
// RUTAS DE SALUD Y ESTADO DEL SISTEMA
// ===================================================================

/**
 * GET /api/health
 * Endpoint de salud del sistema para monitoring
 */
router.get('/health', healthCheck);

/**
 * GET /api/status
 * Estado detallado del sistema y servicios
 */
router.get('/status', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Verificar conexión a base de datos
    const dbStatus = await checkDatabaseConnection();
    
    // Verificar espacio en disco
    const diskStatus = await checkDiskSpace();
    
    // Verificar memoria
    const memoryStatus = checkMemoryUsage();
    
    // Información del sistema
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
    
    const status = {
      status: 'healthy',
      version: '1.0.0',
      services: {
        database: dbStatus,
        storage: diskStatus,
        memory: memoryStatus
      },
      system: systemInfo
    };
    
    res.json({
      success: true,
      data: status,
      message: 'Sistema operando correctamente'
    });
  } catch (error) {
    console.error('❌ Error verificando estado del sistema:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Error verificando estado del sistema',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/info
 * Información general de la API
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'API de Gestión Ganadera con Geolocalización',
      version: '1.0.0',
      description: 'Sistema integral para gestión de ganado bovino con funcionalidades de geolocalización, salud veterinaria, reproducción y producción',
      institution: 'Universidad Juárez Autónoma de Tabasco (UJAT)',
      developer: 'División Académica de Ciencias Biológicas',
      documentation: '/api/docs',
      endpoints: {
        authentication: '/api/auth/*',
        bovines: '/api/bovines/*',
        health: '/api/health/*',
        reproduction: '/api/reproduction/*',
        production: '/api/production/*',
        maps: '/api/maps/*',
        events: '/api/events/*',
        calendar: '/api/calendar/*',
        inventory: '/api/inventory/*',
        finances: '/api/finances/*',
        reports: '/api/reports/*',
        ranch: '/api/ranch/*',
        feeding: '/api/feeding/*',
        dashboard: '/api/dashboard/*',
        upload: '/api/upload/*'
      },
      features: [
        'Gestión integral de ganado bovino',
        'Geolocalización en tiempo real',
        'Control sanitario y veterinario',
        'Seguimiento reproductivo',
        'Análisis de producción',
        'Inventario de medicamentos',
        'Reportes especializados',
        'Sistema de alertas',
        'Gestión documental',
        'Análisis financiero'
      ],
      support: {
        email: 'soporte@ganado-ujat.edu.mx',
        documentation: 'https://docs.ganado-ujat.edu.mx',
        issues: 'https://github.com/ujat/ganado-api/issues'
      }
    }
  });
});

// ===================================================================
// CONFIGURACIÓN DE RUTAS PRINCIPALES
// ===================================================================

// Rutas de autenticación (sin prefijo de versión para compatibilidad)
router.use('/auth', authRoutes);

// Rutas principales del sistema ganadero con prefijo /api/v1
router.use('/bovines', bovinesRoutes);
router.use('/health', healthRoutes);
router.use('/reproduction', reproductionRoutes);
router.use('/production', productionRoutes);
router.use('/maps', mapsRoutes);
router.use('/events', eventsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finances', financesRoutes);
router.use('/reports', reportsRoutes);
router.use('/ranch', ranchRoutes);
router.use('/feeding', feedingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);

// ===================================================================
// RUTAS ESPECIALES Y UTILIDADES
// ===================================================================

/**
 * GET /api/ping
 * Endpoint simple para verificar conectividad
 */
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

/**
 * GET /api/time
 * Endpoint para sincronización de tiempo
 */
router.get('/time', (req: Request, res: Response) => {
  const now = new Date();
  res.json({
    success: true,
    data: {
      timestamp: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'es-MX'
    }
  });
});

/**
 * POST /api/echo
 * Endpoint para pruebas de desarrollo
 */
router.post('/echo', (req: Request, res: Response) => {
  res.json({
    success: true,
    echo: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
});

// ===================================================================
// RUTAS DE DOCUMENTACIÓN DE API
// ===================================================================

/**
 * GET /api/docs
 * Documentación interactiva de la API (Swagger/OpenAPI)
 */
router.get('/docs', (req: Request, res: Response) => {
  // En producción, esto debería servir documentación Swagger
  res.json({
    success: true,
    message: 'Documentación de API disponible',
    documentation: {
      swagger: '/api/docs/swagger',
      postman: '/api/docs/postman',
      openapi: '/api/docs/openapi.json'
    },
    sections: {
      authentication: 'Autenticación y autorización',
      bovines: 'Gestión de ganado bovino',
      health: 'Salud veterinaria y tratamientos',
      reproduction: 'Manejo reproductivo',
      production: 'Control de producción',
      maps: 'Geolocalización y mapas',
      inventory: 'Inventario de medicamentos',
      reports: 'Reportes y análisis',
      ranch: 'Gestión del rancho',
      upload: 'Gestión de archivos'
    }
  });
});

/**
 * GET /api/endpoints
 * Lista todos los endpoints disponibles
 */
router.get('/endpoints', authenticateToken, (req: Request, res: Response) => {
  const endpoints = [
    // Autenticación
    { method: 'POST', path: '/api/auth/login', description: 'Iniciar sesión' },
    { method: 'POST', path: '/api/auth/register', description: 'Registrar usuario' },
    { method: 'POST', path: '/api/auth/logout', description: 'Cerrar sesión' },
    { method: 'POST', path: '/api/auth/refresh', description: 'Renovar token' },
    
    // Ganado
    { method: 'GET', path: '/api/bovines', description: 'Listar ganado' },
    { method: 'POST', path: '/api/bovines', description: 'Registrar nuevo bovino' },
    { method: 'GET', path: '/api/bovines/:id', description: 'Obtener bovino específico' },
    { method: 'PUT', path: '/api/bovines/:id', description: 'Actualizar bovino' },
    
    // Salud
    { method: 'GET', path: '/api/health/records', description: 'Registros de salud' },
    { method: 'POST', path: '/api/health/diagnosis', description: 'Nuevo diagnóstico' },
    { method: 'GET', path: '/api/health/treatments', description: 'Tratamientos activos' },
    
    // Reproducción
    { method: 'GET', path: '/api/reproduction/dashboard', description: 'Dashboard reproductivo' },
    { method: 'POST', path: '/api/reproduction/artificial-insemination', description: 'Registrar IA' },
    { method: 'GET', path: '/api/reproduction/pregnancy-tracking', description: 'Seguimiento gestaciones' },
    
    // Producción
    { method: 'GET', path: '/api/production/dashboard', description: 'Dashboard productivo' },
    { method: 'POST', path: '/api/production/milk', description: 'Registrar producción láctea' },
    { method: 'POST', path: '/api/production/meat', description: 'Registrar producción cárnica' },
    
    // Mapas
    { method: 'GET', path: '/api/maps/ranch-overview', description: 'Vista general del rancho' },
    { method: 'GET', path: '/api/maps/cattle-locations', description: 'Ubicaciones del ganado' },
    { method: 'GET', path: '/api/maps/vaccination-locations', description: 'Mapa de vacunaciones' },
    
    // Inventario
    { method: 'GET', path: '/api/inventory/dashboard', description: 'Dashboard de inventario' },
    { method: 'GET', path: '/api/inventory/medicines', description: 'Medicamentos veterinarios' },
    { method: 'POST', path: '/api/inventory/stock/movement', description: 'Movimiento de stock' },
    
    // Reportes
    { method: 'GET', path: '/api/reports/dashboard', description: 'Dashboard de reportes' },
    { method: 'GET', path: '/api/reports/health/overview', description: 'Reporte de salud general' },
    { method: 'GET', path: '/api/reports/export/:type', description: 'Exportar reportes' },
    
    // Rancho
    { method: 'GET', path: '/api/ranch/overview', description: 'Vista general del rancho' },
    { method: 'GET', path: '/api/ranch/staff', description: 'Personal del rancho' },
    { method: 'POST', path: '/api/ranch/documents/upload', description: 'Subir documentos' },
    
    // Upload
    { method: 'POST', path: '/api/upload/files', description: 'Subir archivos múltiples' },
    { method: 'GET', path: '/api/upload/files', description: 'Listar archivos' },
    { method: 'GET', path: '/api/upload/files/:id/download', description: 'Descargar archivo' }
  ];
  
  res.json({
    success: true,
    data: {
      total: endpoints.length,
      endpoints
    },
    message: 'Lista de endpoints disponibles'
  });
});

// ===================================================================
// MIDDLEWARE DE LOGGING DE RESPUESTAS
// ===================================================================

router.use(responseLogger);

// ===================================================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ===================================================================

router.use('*', (req: Request, res: Response) => {
  console.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'ROUTE_NOT_FOUND',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    suggestion: 'Verifique la URL y el método HTTP. Consulte /api/docs para endpoints disponibles.',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// ===================================================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ===================================================================

router.use(globalErrorHandler);

// ===================================================================
// FUNCIONES AUXILIARES PARA VERIFICACIÓN DE ESTADO
// ===================================================================

async function checkDatabaseConnection(): Promise<{ status: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    // Aquí se implementaría la verificación real de la base de datos
    // Por ahora simulamos una verificación exitosa
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      status: 'connected',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'disconnected',
      responseTime: Date.now() - startTime
    };
  }
}

async function checkDiskSpace(): Promise<{ status: string; available: string; used: string }> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Verificar espacio disponible (implementación simplificada)
    const stats = await fs.promises.statfs ? fs.promises.statfs('.') : null;
    
    if (stats) {
      const available = (stats.bavail * stats.bsize);
      const total = (stats.blocks * stats.bsize);
      const used = total - available;
      
      return {
        status: available > 1024 * 1024 * 1024 ? 'ok' : 'low', // 1GB mínimo
        available: formatBytes(available),
        used: formatBytes(used)
      };
    }
    
    return {
      status: 'unknown',
      available: 'N/A',
      used: 'N/A'
    };
  } catch (error) {
    return {
      status: 'error',
      available: 'N/A',
      used: 'N/A'
    };
  }
}

function checkMemoryUsage(): { status: string; rss: string; heapUsed: string; heapTotal: string } {
  const usage = process.memoryUsage();
  
  return {
    status: usage.rss < 512 * 1024 * 1024 ? 'ok' : 'high', // 512MB límite
    rss: formatBytes(usage.rss),
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal)
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===================================================================
// EXPORTAR ROUTER PRINCIPAL
// ===================================================================

export default router;