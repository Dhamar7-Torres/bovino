import { Router, Request, Response } from 'express';
import { BovinesController } from '../controllers/bovines';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { roleMiddleware } from '../middleware/role';
import { uploadMiddleware } from '../middleware/upload';
import { geoLocationMiddleware } from '../middleware/geoLocation';
import {
  createBovineValidationRules,
  updateBovineValidationRules,
  searchBovineValidationRules,
  bulkUpdateValidationRules,
  genealogyValidationRules,
  locationValidationRules,
  exportValidationRules,
  importValidationRules
} from '../validators/Bovines';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de bovinos
const bovinesController = new BovinesController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DE BOVINOS
// ============================================================================

// Todas las rutas de bovinos requieren autenticación
router.use(authMiddleware);

// ============================================================================
// RUTAS CRUD BÁSICAS
// ============================================================================

/**
 * @route   GET /cattle
 * @desc    Obtener lista paginada de bovinos con filtros opcionales
 * @access  Private
 * @query   ?page=1&limit=10&search=term&type=CATTLE&breed=Holstein&gender=FEMALE&healthStatus=HEALTHY&sortBy=earTag&sortOrder=asc
 */
router.get(
  '/',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many requests for cattle list'
  }),
  searchBovineValidationRules(),
  validationMiddleware,
  bovinesController.getBovinesList
);

/**
 * @route   POST /cattle
 * @desc    Crear un nuevo bovino en el sistema
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { earTag: string, name?: string, type: string, breed: string, gender: string, birthDate: string, weight: number, location: object, etc. }
 */
router.post(
  '/',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 creaciones por usuario cada 15 minutos
    message: 'Too many cattle creation attempts'
  }),
  uploadMiddleware.array('photos', 5), // máximo 5 fotos por bovino
  geoLocationMiddleware, // validar y procesar ubicación GPS
  createBovineValidationRules(),
  validationMiddleware,
  bovinesController.createBovine
);

/**
 * @route   GET /cattle/:id
 * @desc    Obtener detalles específicos de un bovino por ID
 * @access  Private
 * @params  id: string (UUID del bovino)
 */
router.get(
  '/:id',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas por usuario cada 5 minutos
    message: 'Too many requests for cattle details'
  }),
  bovinesController.getBovineById
);

/**
 * @route   PUT /cattle/:id
 * @desc    Actualizar información de un bovino existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del bovino)
 * @body    Campos a actualizar del bovino
 */
router.put(
  '/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 actualizaciones por usuario cada 15 minutos
    message: 'Too many cattle update attempts'
  }),
  uploadMiddleware.array('photos', 5),
  geoLocationMiddleware,
  updateBovineValidationRules(),
  validationMiddleware,
  bovinesController.updateBovine
);

/**
 * @route   DELETE /cattle/:id
 * @desc    Eliminar un bovino del sistema (soft delete)
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @params  id: string (UUID del bovino)
 */
router.delete(
  '/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 eliminaciones por usuario cada 30 minutos
    message: 'Too many cattle deletion attempts'
  }),
  bovinesController.deleteBovine
);

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICA
// ============================================================================

/**
 * @route   GET /cattle/search
 * @desc    Búsqueda avanzada de bovinos con múltiples criterios
 * @access  Private
 * @query   Múltiples parámetros de búsqueda y filtrado
 */
router.get(
  '/search',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 búsquedas por usuario cada 5 minutos
    message: 'Too many search requests'
  }),
  searchBovineValidationRules(),
  validationMiddleware,
  bovinesController.searchBovines
);

/**
 * @route   GET /cattle/ear-tag/:earTag
 * @desc    Buscar bovino por número de arete específico
 * @access  Private
 * @params  earTag: string (número de arete único)
 */
router.get(
  '/ear-tag/:earTag',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many ear tag lookups'
  }),
  bovinesController.getBovineByEarTag
);

/**
 * @route   GET /cattle/type/:type
 * @desc    Obtener bovinos filtrados por tipo (CATTLE, BULL, COW, CALF)
 * @access  Private
 * @params  type: string (CATTLE | BULL | COW | CALF)
 */
router.get(
  '/type/:type',
  bovinesController.getBovinesByType
);

/**
 * @route   GET /cattle/breed/:breed
 * @desc    Obtener bovinos filtrados por raza
 * @access  Private
 * @params  breed: string (nombre de la raza)
 */
router.get(
  '/breed/:breed',
  bovinesController.getBovinesByBreed
);

/**
 * @route   GET /cattle/gender/:gender
 * @desc    Obtener bovinos filtrados por género
 * @access  Private
 * @params  gender: string (MALE | FEMALE)
 */
router.get(
  '/gender/:gender',
  bovinesController.getBovinesByGender
);

/**
 * @route   GET /cattle/health-status/:status
 * @desc    Obtener bovinos filtrados por estado de salud
 * @access  Private
 * @params  status: string (HEALTHY | SICK | RECOVERING | QUARANTINE | DECEASED)
 */
router.get(
  '/health-status/:status',
  bovinesController.getBovinesByHealthStatus
);

// ============================================================================
// RUTAS DE GENEALOGÍA Y PARENTESCO
// ============================================================================

/**
 * @route   GET /cattle/:id/genealogy
 * @desc    Obtener árbol genealógico completo de un bovino
 * @access  Private
 * @params  id: string (UUID del bovino)
 * @query   ?generations=3&includeOffspring=true&includeSiblings=true
 */
router.get(
  '/:id/genealogy',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 consultas genealógicas por usuario cada 10 minutos
    message: 'Too many genealogy requests'
  }),
  genealogyValidationRules(),
  validationMiddleware,
  bovinesController.getBovineGenealogy
);

/**
 * @route   GET /cattle/:id/offspring
 * @desc    Obtener descendencia directa de un bovino
 * @access  Private
 * @params  id: string (UUID del bovino)
 * @query   ?includeGrandchildren=false&sortBy=birthDate&sortOrder=desc
 */
router.get(
  '/:id/offspring',
  bovinesController.getBovineOffspring
);

/**
 * @route   GET /cattle/:id/siblings
 * @desc    Obtener hermanos de un bovino (mismos padres)
 * @access  Private
 * @params  id: string (UUID del bovino)
 */
router.get(
  '/:id/siblings',
  bovinesController.getBovineSiblings
);

/**
 * @route   GET /cattle/:id/parents
 * @desc    Obtener información de los padres de un bovino
 * @access  Private
 * @params  id: string (UUID del bovino)
 */
router.get(
  '/:id/parents',
  bovinesController.getBovineParents
);

// ============================================================================
// RUTAS DE UBICACIÓN Y GEOLOCALIZACIÓN
// ============================================================================

/**
 * @route   PUT /cattle/:id/location
 * @desc    Actualizar ubicación GPS de un bovino
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @params  id: string (UUID del bovino)
 * @body    { latitude: number, longitude: number, address?: string, accuracy?: number }
 */
router.put(
  '/:id/location',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 actualizaciones de ubicación por usuario cada 5 minutos
    message: 'Too many location updates'
  }),
  geoLocationMiddleware,
  locationValidationRules(),
  validationMiddleware,
  bovinesController.updateBovineLocation
);

/**
 * @route   GET /cattle/nearby
 * @desc    Encontrar bovinos cercanos a una ubicación específica
 * @access  Private
 * @query   ?latitude=17.989&longitude=-92.247&radius=1000&limit=50
 */
router.get(
  '/nearby',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 30, // máximo 30 búsquedas de proximidad por usuario cada 5 minutos
    message: 'Too many proximity searches'
  }),
  bovinesController.getNearbyBovines
);

/**
 * @route   GET /cattle/by-area
 * @desc    Obtener bovinos dentro de un área geográfica específica
 * @access  Private
 * @query   ?bounds=sw_lat,sw_lng,ne_lat,ne_lng&includeVaccinations=true
 */
router.get(
  '/by-area',
  bovinesController.getBovinesByArea
);

// ============================================================================
// RUTAS DE ESTADÍSTICAS Y ANÁLISIS
// ============================================================================

/**
 * @route   GET /cattle/stats
 * @desc    Obtener estadísticas generales del ganado
 * @access  Private
 * @query   ?includeVaccinations=true&includeIllnesses=true&dateRange=30d
 */
router.get(
  '/stats',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 consultas de estadísticas por usuario cada 10 minutos
    message: 'Too many statistics requests'
  }),
  bovinesController.getBovineStatistics
);

/**
 * @route   GET /cattle/stats/by-type
 * @desc    Estadísticas agrupadas por tipo de bovino
 * @access  Private
 */
router.get(
  '/stats/by-type',
  bovinesController.getStatsByType
);

/**
 * @route   GET /cattle/stats/by-health
 * @desc    Estadísticas agrupadas por estado de salud
 * @access  Private
 */
router.get(
  '/stats/by-health',
  bovinesController.getStatsByHealth
);

/**
 * @route   GET /cattle/stats/age-distribution
 * @desc    Distribución de edades del ganado
 * @access  Private
 * @query   ?groupBy=months&includeCalves=true
 */
router.get(
  '/stats/age-distribution',
  bovinesController.getAgeDistribution
);

/**
 * @route   GET /cattle/stats/weight-distribution
 * @desc    Distribución de pesos del ganado
 * @access  Private
 * @query   ?groupBy=ranges&includeCalves=true
 */
router.get(
  '/stats/weight-distribution',
  bovinesController.getWeightDistribution
);

// ============================================================================
// OPERACIONES MASIVAS (BULK OPERATIONS)
// ============================================================================

/**
 * @route   PUT /cattle/bulk-update
 * @desc    Actualizar múltiples bovinos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { ids: string[], updates: object, operation: string }
 */
router.put(
  '/bulk-update',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 operaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk operations'
  }),
  bulkUpdateValidationRules(),
  validationMiddleware,
  bovinesController.bulkUpdateBovines
);

/**
 * @route   DELETE /cattle/bulk-delete
 * @desc    Eliminar múltiples bovinos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { ids: string[], confirmationCode: string }
 */
router.delete(
  '/bulk-delete',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 2, // máximo 2 eliminaciones masivas por usuario cada hora
    message: 'Too many bulk delete operations'
  }),
  bovinesController.bulkDeleteBovines
);

/**
 * @route   PUT /cattle/bulk-location-update
 * @desc    Actualizar ubicación de múltiples bovinos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { ids: string[], location: object, reason: string }
 */
router.put(
  '/bulk-location-update',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 actualizaciones masivas de ubicación cada 15 minutos
    message: 'Too many bulk location updates'
  }),
  geoLocationMiddleware,
  bovinesController.bulkUpdateLocation
);

// ============================================================================
// IMPORTACIÓN Y EXPORTACIÓN
// ============================================================================

/**
 * @route   POST /cattle/export
 * @desc    Exportar datos de bovinos en diferentes formatos
 * @access  Private
 * @body    { format: 'csv' | 'excel' | 'pdf', filters?: object, fields?: string[] }
 */
router.post(
  '/export',
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 exportaciones por usuario cada 30 minutos
    message: 'Too many export requests'
  }),
  exportValidationRules(),
  validationMiddleware,
  bovinesController.exportBovines
);

/**
 * @route   POST /cattle/import
 * @desc    Importar bovinos desde archivo CSV o Excel
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    FormData con archivo y configuraciones
 */
router.post(
  '/import',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 importaciones por usuario cada hora
    message: 'Too many import attempts'
  }),
  uploadMiddleware.single('file'),
  importValidationRules(),
  validationMiddleware,
  bovinesController.importBovines
);

/**
 * @route   GET /cattle/export/:exportId/download
 * @desc    Descargar archivo exportado previamente
 * @access  Private
 * @params  exportId: string (ID del proceso de exportación)
 */
router.get(
  '/export/:exportId/download',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 descargas por usuario cada 10 minutos
    message: 'Too many download requests'
  }),
  bovinesController.downloadExport
);

/**
 * @route   GET /cattle/import/:importId/status
 * @desc    Verificar estado de proceso de importación
 * @access  Private
 * @params  importId: string (ID del proceso de importación)
 */
router.get(
  '/import/:importId/status',
  bovinesController.getImportStatus
);

// ============================================================================
// RUTAS DE ARCHIVO Y MULTIMEDIA
// ============================================================================

/**
 * @route   POST /cattle/:id/photos
 * @desc    Subir fotos adicionales para un bovino
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @params  id: string (UUID del bovino)
 */
router.post(
  '/:id/photos',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 subidas de fotos por usuario cada 30 minutos
    message: 'Too many photo uploads'
  }),
  uploadMiddleware.array('photos', 10),
  bovinesController.uploadBovinePhotos
);

/**
 * @route   DELETE /cattle/:id/photos/:photoId
 * @desc    Eliminar foto específica de un bovino
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @params  id: string (UUID del bovino), photoId: string (ID de la foto)
 */
router.delete(
  '/:id/photos/:photoId',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  bovinesController.deleteBovinePhoto
);

/**
 * @route   GET /cattle/:id/photos/:photoId
 * @desc    Obtener foto específica de un bovino
 * @access  Private
 * @params  id: string (UUID del bovino), photoId: string (ID de la foto)
 * @query   ?size=thumbnail|medium|full
 */
router.get(
  '/:id/photos/:photoId',
  bovinesController.getBovinePhoto
);

// ============================================================================
// RUTAS DE AUDITORÍA Y HISTORIAL
// ============================================================================

/**
 * @route   GET /cattle/:id/history
 * @desc    Obtener historial completo de cambios de un bovino
 * @access  Private
 * @params  id: string (UUID del bovino)
 * @query   ?page=1&limit=50&eventType=all&dateRange=30d
 */
router.get(
  '/:id/history',
  bovinesController.getBovineHistory
);

/**
 * @route   GET /cattle/:id/timeline
 * @desc    Obtener línea de tiempo de eventos importantes del bovino
 * @access  Private
 * @params  id: string (UUID del bovino)
 */
router.get(
  '/:id/timeline',
  bovinesController.getBovineTimeline
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DE BOVINOS
// ============================================================================

/**
 * Middleware de manejo de errores específico para bovinos
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Bovines Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos de bovinos
  if (error.name === 'BovineNotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Bovino no encontrado',
      error: 'BOVINE_NOT_FOUND'
    });
  }

  if (error.name === 'DuplicateEarTagError') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un bovino con este número de arete',
      error: 'DUPLICATE_EAR_TAG'
    });
  }

  if (error.name === 'InvalidLocationError') {
    return res.status(400).json({
      success: false,
      message: 'Coordenadas GPS inválidas',
      error: 'INVALID_LOCATION'
    });
  }

  if (error.name === 'FileUploadError') {
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      error: 'FILE_UPLOAD_ERROR',
      details: error.details
    });
  }

  if (error.name === 'BulkOperationError') {
    return res.status(400).json({
      success: false,
      message: 'Error en operación masiva',
      error: 'BULK_OPERATION_ERROR',
      details: error.details
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;