import { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Importaciones corregidas de middleware
import { authenticateToken } from '../middleware/auth';
import { requestLogger } from '../middleware/logging';

// ===================================================================
// EXTENDER EL TIPO REQUEST PARA PROPIEDADES PERSONALIZADAS
// ===================================================================

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
      clientInfo?: {
        ip: string;
        userAgent: string;
        version: string;
        platform: string;
      };
    }
  }
}

// ===================================================================
// IMPORTACIÓN DE TODAS LAS RUTAS DEL SISTEMA
// ===================================================================

// Rutas de autenticación y usuarios
// import authRoutes from './auth';

// Rutas de gestión de ganado
import bovinesRoutes from './bovines';

// Rutas de alimentación y nutrición
import feedingRoutes from './feeding';
import health from './health';
import reproduction from './reproduction';
import production from './production';
import maps from './maps';
import events from './events';
import calendar from './calendar';
import inventory from './inventory';
import finances from './finances';
import reports from './reports';
import ranch from './ranch';
import dashboard from './dashboard';
import upload from './upload';

// Rutas adicionales (comentadas hasta que se implementen)
import healthRoutes from './health';
import reproductionRoutes from './reproduction';
import productionRoutes from './production';
import mapsRoutes from './maps';
import eventsRoutes from './events';
import calendarRoutes from './calendar';
import inventoryRoutes from './inventory';
import financesRoutes from './finances';
import reportsRoutes from './reports';
import ranchRoutes from './ranch';
import dashboardRoutes from './dashboard';
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
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'Unknown',
    version: req.get('X-Client-Version') || '1.0.0',
    platform: req.get('X-Client-Platform') || 'Unknown'
  };
  
  next();
});

// ===================================================================
// MIDDLEWARE DE VERSIONADO SIMPLE
// ===================================================================

router.use((req: Request, res: Response, next: NextFunction) => {
  // Agregar información de versión de API
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-API-Server', 'Cattle Management System');
  next();
});

// ===================================================================
// RUTAS DE SALUD Y ESTADO DEL SISTEMA
// ===================================================================

/**
 * GET /api/health
 * Endpoint de salud del sistema para monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

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
        // authentication: '/api/auth/*',
        bovines: '/api/bovines/*',
        feeding: '/api/feeding/*',
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
        dashboard: '/api/dashboard/*',
        upload: '/api/upload/*'
      },
      features: [
        'Gestión integral de ganado bovino',
        'Control de alimentación y nutrición',
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

// Rutas de autenticación (comentadas hasta implementar)
// router.use('/auth', authRoutes);

// Rutas principales del sistema ganadero con prefijo /api/v1
router.use('/bovines', bovinesRoutes);
router.use('/feeding', feedingRoutes);

// Rutas adicionales (comentadas hasta que se implementen)
router.use('/health', health);
router.use('/reproduction', reproduction);
router.use('/production', production);
router.use('/maps', maps);
router.use('/events', events);
router.use('/calendar', calendar);
router.use('/inventory', inventory);
router.use('/finances', finances);
router.use('/reports', reports);
router.use('/ranch', ranch);
router.use('/dashboard', dashboard);
router.use('/upload', upload);

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
      // authentication: 'Autenticación y autorización',
      bovines: 'Gestión de ganado bovino',
      feeding: 'Sistema de alimentación y nutrición',
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
    // Ganado
    { method: 'GET', path: '/api/bovines', description: 'Listar ganado' },
    { method: 'POST', path: '/api/bovines', description: 'Registrar nuevo bovino' },
    { method: 'GET', path: '/api/bovines/:id', description: 'Obtener bovino específico' },
    { method: 'PUT', path: '/api/bovines/:id', description: 'Actualizar bovino' },
    { method: 'DELETE', path: '/api/bovines/:id', description: 'Eliminar bovino' },
    
    // Alimentación
    { method: 'GET', path: '/api/feeding/records', description: 'Registros de alimentación' },
    { method: 'POST', path: '/api/feeding/records', description: 'Nuevo registro de alimentación' },
    { method: 'GET', path: '/api/feeding/plans', description: 'Planes nutricionales' },
    { method: 'POST', path: '/api/feeding/plans', description: 'Crear plan nutricional' },
    { method: 'GET', path: '/api/feeding/schedule', description: 'Horarios de alimentación' },
    { method: 'GET', path: '/api/feeding/inventory', description: 'Inventario de alimentos' },
    { method: 'GET', path: '/api/feeding/statistics', description: 'Estadísticas de alimentación' },
    
    // Sistema
    { method: 'GET', path: '/api/health', description: 'Estado del sistema' },
    { method: 'GET', path: '/api/status', description: 'Estado detallado del sistema' },
    { method: 'GET', path: '/api/info', description: 'Información de la API' },
    { method: 'GET', path: '/api/ping', description: 'Test de conectividad' },
    { method: 'GET', path: '/api/time', description: 'Sincronización de tiempo' },
    { method: 'POST', path: '/api/echo', description: 'Hecho para pruebas' }
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

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 Error global:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Error de validación',
      details: error.details || error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Error de autenticación
  if (error.statusCode === 401) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: error.message || 'Error de autenticación',
      timestamp: new Date().toISOString()
    });
  }

  // Error de autorización
  if (error.statusCode === 403) {
    return res.status(403).json({
      success: false,
      error: 'AUTHORIZATION_ERROR',
      message: error.message || 'Sin permisos para realizar esta acción',
      timestamp: new Date().toISOString()
    });
  }

  // Error genérico del servidor
  res.status(error.statusCode || 500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

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
    
    // Verificar espacio disponible (implementación simplificada)
    return {
      status: 'ok',
      available: '10 GB',
      used: '2 GB'
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