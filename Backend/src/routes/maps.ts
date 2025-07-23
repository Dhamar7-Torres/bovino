import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Op, WhereOptions } from 'sequelize';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateRequest,
  auditLog,
  rateLimitByUserId
} from '../middleware';
import { 
  MapsController,
  LocationController,
  GeofenceController,
  TrackingController 
} from '../controllers';

const router = Router();

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PARA COORDENADAS
// ===================================================================

// Validar coordenadas geográficas
const validateCoordinates = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90 grados'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180 grados'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La precisión debe ser un número positivo')
];

// Validar bounds del mapa
const validateMapBounds = [
  query('swLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud suroeste inválida'),
  query('swLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud suroeste inválida'),
  query('neLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud noreste inválida'),
  query('neLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud noreste inválida')
];

// Validar radio de búsqueda
const validateRadius = query('radius')
  .optional()
  .isFloat({ min: 0.1, max: 100 })
  .withMessage('El radio debe estar entre 0.1 y 100 kilómetros');

// Validar fechas
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
];

// ===================================================================
// RUTAS DE VISTA GENERAL DEL RANCHO
// ===================================================================

/**
 * GET /api/maps/ranch-overview
 * Vista general del rancho con todas las ubicaciones principales
 */
router.get('/ranch-overview',
  authenticateToken,
  validateMapBounds,
  query('includePotreros')
    .optional()
    .isBoolean()
    .withMessage('includePotreros debe ser verdadero o falso'),
  query('includeGanado')
    .optional()
    .isBoolean()
    .withMessage('includeGanado debe ser verdadero o falso'),
  query('includeInfraestructura')
    .optional()
    .isBoolean()
    .withMessage('includeInfraestructura debe ser verdadero o falso'),
  validateRequest,
  auditLog('maps.ranch_overview.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        includePotreros = true,
        includeGanado = true,
        includeInfraestructura = true
      } = req.query;

      const userId = req.user?.id;

      const bounds = (swLat && swLng && neLat && neLng) ? {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      } : undefined;

      const ranchOverview = await MapsController.getRanchOverview({
        bounds,
        includePotreros: includePotreros === 'true',
        includeGanado: includeGanado === 'true',
        includeInfraestructura: includeInfraestructura === 'true',
        userId
      });

      res.json({
        success: true,
        data: ranchOverview,
        message: 'Vista general del rancho obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/maps/ranch-boundaries
 * Obtiene los límites geográficos del rancho
 */
router.get('/ranch-boundaries',
  authenticateToken,
  query('ranchId')
    .optional()
    .isUUID()
    .withMessage('ID de rancho debe ser un UUID válido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ranchId } = req.query;
      const userId = req.user?.id;

      const boundaries = await MapsController.getRanchBoundaries({
        ranchId: ranchId as string,
        userId
      });

      res.json({
        success: true,
        data: boundaries,
        message: 'Límites del rancho obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE UBICACIONES DE GANADO
// ===================================================================

/**
 * GET /api/maps/cattle-locations
 * Obtiene ubicaciones actuales del ganado
 */
router.get('/cattle-locations',
  authenticateToken,
  validateMapBounds,
  validateRadius,
  query('centerLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud del centro inválida'),
  query('centerLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud del centro inválida'),
  query('lastUpdatedWithin')
    .optional()
    .isInt({ min: 1, max: 720 })
    .withMessage('lastUpdatedWithin debe estar entre 1 y 720 horas'),
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive debe ser verdadero o falso'),
  query('earTags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',');
        if (tags.length > 50) {
          throw new Error('Máximo 50 aretes por consulta');
        }
        return true;
      }
      return true;
    }),
  validateRequest,
  auditLog('maps.cattle_locations.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        centerLat, centerLng, radius,
        lastUpdatedWithin = 24,
        includeInactive = false,
        earTags
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        bounds: (swLat && swLng && neLat && neLng) ? {
          swLat: parseFloat(swLat as string),
          swLng: parseFloat(swLng as string),
          neLat: parseFloat(neLat as string),
          neLng: parseFloat(neLng as string)
        } : undefined,
        center: (centerLat && centerLng) ? {
          latitude: parseFloat(centerLat as string),
          longitude: parseFloat(centerLng as string)
        } : undefined,
        radius: radius ? parseFloat(radius as string) : undefined,
        lastUpdatedWithin: parseInt(lastUpdatedWithin as string),
        includeInactive: includeInactive === 'true',
        earTags: earTags ? (earTags as string).split(',') : undefined
      };

      const cattleLocations = await LocationController.getCattleLocations(filters, userId);

      res.json({
        success: true,
        data: cattleLocations,
        message: 'Ubicaciones del ganado obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/maps/cattle-location
 * Registra nueva ubicación de ganado
 */
router.post('/cattle-location',
  authenticateToken,
  rateLimitByUserId(60, 15), // 60 requests per 15 minutes por usuario
  [
    body('bovineId')
      .isUUID()
      .withMessage('ID de bovino debe ser un UUID válido'),
    ...validateCoordinates,
    body('timestamp')
      .optional()
      .isISO8601()
      .withMessage('Timestamp debe ser una fecha válida'),
    body('method')
      .optional()
      .isIn(['gps', 'manual', 'rfid', 'visual', 'camera'])
      .withMessage('Método de ubicación inválido'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Las notas no pueden exceder 500 caracteres'),
    body('potrero')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Nombre del potrero debe tener entre 1 y 100 caracteres'),
    body('zone')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Zona debe tener entre 1 y 100 caracteres')
  ],
  validateRequest,
  auditLog('maps.cattle_location.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locationData = req.body;
      const userId = req.user?.id;

      const newLocation = await LocationController.recordCattleLocation({
        ...locationData,
        recordedBy: userId,
        timestamp: locationData.timestamp || new Date()
      });

      res.status(201).json({
        success: true,
        data: newLocation,
        message: 'Ubicación del ganado registrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/maps/cattle/:bovineId/history
 * Historial de ubicaciones de un bovino específico
 */
router.get('/cattle/:bovineId/history',
  authenticateToken,
  param('bovineId')
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  validateDateRange,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Límite debe estar entre 1 y 1000'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;
      const userId = req.user?.id;

      const history = await LocationController.getCattleLocationHistory({
        bovineId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string),
        userId
      });

      res.json({
        success: true,
        data: history,
        message: 'Historial de ubicaciones obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE UBICACIONES DE EVENTOS VETERINARIOS
// ===================================================================

/**
 * GET /api/maps/vaccination-locations
 * Mapa de ubicaciones donde se han aplicado vacunas
 */
router.get('/vaccination-locations',
  authenticateToken,
  validateMapBounds,
  validateDateRange,
  query('vaccineType')
    .optional()
    .isIn([
      'fiebre_aftosa', 'brucelosis', 'rabia', 'carbunco', 'clostridiosis',
      'ibl', 'dvb', 'pi3', 'brsv', 'leptospirosis', 'campylobacteriosis'
    ])
    .withMessage('Tipo de vacuna inválido'),
  query('groupBy')
    .optional()
    .isIn(['location', 'date', 'vaccine', 'veterinarian'])
    .withMessage('Agrupación inválida'),
  validateRequest,
  auditLog('maps.vaccination_locations.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        startDate, endDate,
        vaccineType, groupBy = 'location'
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        bounds: (swLat && swLng && neLat && neLng) ? {
          swLat: parseFloat(swLat as string),
          swLng: parseFloat(swLng as string),
          neLat: parseFloat(neLat as string),
          neLng: parseFloat(neLng as string)
        } : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        vaccineType: vaccineType as string,
        groupBy: groupBy as string
      };

      const vaccinationLocations = await MapsController.getVaccinationLocations(filters, userId);

      res.json({
        success: true,
        data: vaccinationLocations,
        message: 'Ubicaciones de vacunación obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/maps/illness-locations
 * Mapa de ubicaciones donde se han registrado enfermedades
 */
router.get('/illness-locations',
  authenticateToken,
  validateMapBounds,
  validateDateRange,
  query('diseaseType')
    .optional()
    .isIn([
      'respiratory', 'digestive', 'reproductive', 'metabolic',
      'infectious', 'parasitic', 'nutritional', 'traumatic'
    ])
    .withMessage('Tipo de enfermedad inválido'),
  query('severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Severidad inválida'),
  query('contagious')
    .optional()
    .isBoolean()
    .withMessage('Contagioso debe ser verdadero o falso'),
  query('includeRecovered')
    .optional()
    .isBoolean()
    .withMessage('includeRecovered debe ser verdadero o falso'),
  validateRequest,
  auditLog('maps.illness_locations.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        startDate, endDate,
        diseaseType, severity, contagious,
        includeRecovered = true
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        bounds: (swLat && swLng && neLat && neLng) ? {
          swLat: parseFloat(swLat as string),
          swLng: parseFloat(swLng as string),
          neLat: parseFloat(neLat as string),
          neLng: parseFloat(neLng as string)
        } : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        diseaseType: diseaseType as string,
        severity: severity as string,
        contagious: contagious === 'true',
        includeRecovered: includeRecovered === 'true'
      };

      const illnessLocations = await MapsController.getIllnessLocations(filters, userId);

      res.json({
        success: true,
        data: illnessLocations,
        message: 'Ubicaciones de enfermedades obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE MAPAS DE CALOR Y ANÁLISIS ESPACIAL
// ===================================================================

/**
 * GET /api/maps/density-heatmap
 * Genera mapa de calor de densidad de ganado
 */
router.get('/density-heatmap',
  authenticateToken,
  validateMapBounds,
  query('resolution')
    .optional()
    .isInt({ min: 10, max: 100 })
    .withMessage('Resolución debe estar entre 10 y 100'),
  query('timeWindow')
    .optional()
    .isIn(['1h', '6h', '12h', '24h', '7d', '30d'])
    .withMessage('Ventana de tiempo inválida'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        resolution = 50,
        timeWindow = '24h'
      } = req.query;

      const userId = req.user?.id;

      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };

      const heatmapData = await MapsController.generateDensityHeatmap({
        bounds,
        resolution: parseInt(resolution as string),
        timeWindow: timeWindow as string,
        userId
      });

      res.json({
        success: true,
        data: heatmapData,
        message: 'Mapa de calor de densidad generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/maps/activity-heatmap
 * Mapa de calor de actividad veterinaria (vacunaciones, tratamientos)
 */
router.get('/activity-heatmap',
  authenticateToken,
  validateMapBounds,
  validateDateRange,
  query('activityType')
    .optional()
    .isIn(['vaccination', 'treatment', 'inspection', 'feeding', 'movement'])
    .withMessage('Tipo de actividad inválido'),
  query('intensity')
    .optional()
    .isIn(['low', 'medium', 'high', 'auto'])
    .withMessage('Intensidad inválida'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        startDate, endDate,
        activityType, intensity = 'auto'
      } = req.query;

      const userId = req.user?.id;

      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };

      const activityHeatmap = await MapsController.generateActivityHeatmap({
        bounds,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        activityType: activityType as string,
        intensity: intensity as string,
        userId
      });

      res.json({
        success: true,
        data: activityHeatmap,
        message: 'Mapa de calor de actividad generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GEOCERCAS Y ZONAS
// ===================================================================

/**
 * GET /api/maps/geofences
 * Obtiene todas las geocercas configuradas
 */
router.get('/geofences',
  authenticateToken,
  query('type')
    .optional()
    .isIn(['potrero', 'danger_zone', 'feeding_area', 'water_source', 'quarantine', 'restricted'])
    .withMessage('Tipo de geocerca inválido'),
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, active } = req.query;
      const userId = req.user?.id;

      const geofences = await GeofenceController.getGeofences({
        type: type as string,
        active: active === 'true',
        userId
      });

      res.json({
        success: true,
        data: geofences,
        message: 'Geocercas obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/maps/geofences
 * Crea una nueva geocerca
 */
router.post('/geofences',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  [
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('type')
      .isIn(['potrero', 'danger_zone', 'feeding_area', 'water_source', 'quarantine', 'restricted'])
      .withMessage('Tipo de geocerca inválido'),
    body('coordinates')
      .isArray({ min: 3 })
      .withMessage('Debe proporcionar al menos 3 coordenadas'),
    body('coordinates.*.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida'),
    body('coordinates.*.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres'),
    body('alertOnEntry')
      .optional()
      .isBoolean()
      .withMessage('Alerta de entrada debe ser verdadero o falso'),
    body('alertOnExit')
      .optional()
      .isBoolean()
      .withMessage('Alerta de salida debe ser verdadero o falso'),
    body('capacity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La capacidad debe ser un número entero positivo'),
    body('grassType')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tipo de pasto debe tener entre 1 y 50 caracteres'),
    body('lastRotationDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de última rotación debe ser válida')
  ],
  validateRequest,
  auditLog('maps.geofence.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const geofenceData = req.body;
      const userId = req.user?.id;

      const newGeofence = await GeofenceController.createGeofence({
        ...geofenceData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: newGeofence,
        message: 'Geocerca creada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/maps/geofences/:id
 * Actualiza una geocerca existente
 */
router.put('/geofences/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('coordinates')
      .optional()
      .isArray({ min: 3 })
      .withMessage('Debe proporcionar al menos 3 coordenadas'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Activo debe ser verdadero o falso')
  ],
  validateRequest,
  auditLog('maps.geofence.update'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      const updatedGeofence = await GeofenceController.updateGeofence(id, {
        ...updateData,
        updatedBy: userId
      });

      if (!updatedGeofence) {
        return res.status(404).json({
          success: false,
          message: 'Geocerca no encontrada'
        });
      }

      res.json({
        success: true,
        data: updatedGeofence,
        message: 'Geocerca actualizada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/maps/geofences/:id
 * Elimina una geocerca
 */
router.delete('/geofences/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  validateRequest,
  auditLog('maps.geofence.delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const deleted = await GeofenceController.deleteGeofence(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Geocerca no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Geocerca eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE ALERTAS GEOGRÁFICAS
// ===================================================================

/**
 * GET /api/maps/geofence-alerts
 * Obtiene alertas de geocercas (entradas/salidas no autorizadas)
 */
router.get('/geofence-alerts',
  authenticateToken,
  validateDateRange,
  query('geofenceId')
    .optional()
    .isUUID()
    .withMessage('ID de geocerca debe ser un UUID válido'),
  query('alertType')
    .optional()
    .isIn(['entry', 'exit', 'breach', 'overstay'])
    .withMessage('Tipo de alerta inválido'),
  query('status')
    .optional()
    .isIn(['active', 'acknowledged', 'resolved'])
    .withMessage('Estado de alerta inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate,
        geofenceId, alertType, status
      } = req.query;

      const userId = req.user?.id;

      const alerts = await GeofenceController.getGeofenceAlerts({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        geofenceId: geofenceId as string,
        alertType: alertType as string,
        status: status as string,
        userId
      });

      res.json({
        success: true,
        data: alerts,
        message: 'Alertas de geocerca obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/maps/check-geofence-violations
 * Verifica violaciones de geocercas en tiempo real
 */
router.post('/check-geofence-violations',
  authenticateToken,
  rateLimitByUserId(100, 15), // 100 requests per 15 minutes
  [
    body('locations')
      .isArray({ min: 1, max: 50 })
      .withMessage('Debe proporcionar entre 1 y 50 ubicaciones'),
    body('locations.*.bovineId')
      .isUUID()
      .withMessage('ID de bovino debe ser un UUID válido'),
    body('locations.*.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida'),
    body('locations.*.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida'),
    body('locations.*.timestamp')
      .isISO8601()
      .withMessage('Timestamp debe ser una fecha válida')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locations } = req.body;
      const userId = req.user?.id;

      const violations = await GeofenceController.checkViolations({
        locations,
        userId
      });

      res.json({
        success: true,
        data: violations,
        message: 'Verificación de violaciones completada'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE ANÁLISIS ESPACIAL Y ESTADÍSTICAS
// ===================================================================

/**
 * GET /api/maps/cluster-analysis
 * Análisis de clustering de ganado por ubicación
 */
router.get('/cluster-analysis',
  authenticateToken,
  validateMapBounds,
  query('algorithm')
    .optional()
    .isIn(['kmeans', 'dbscan', 'hierarchical'])
    .withMessage('Algoritmo de clustering inválido'),
  query('minClusterSize')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Tamaño mínimo de cluster debe estar entre 2 y 100'),
  query('maxClusters')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('Número máximo de clusters debe estar entre 2 y 20'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        swLat, swLng, neLat, neLng,
        algorithm = 'kmeans',
        minClusterSize = 5,
        maxClusters = 10
      } = req.query;

      const userId = req.user?.id;

      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };

      const clusterAnalysis = await MapsController.performClusterAnalysis({
        bounds,
        algorithm: algorithm as string,
        minClusterSize: parseInt(minClusterSize as string),
        maxClusters: parseInt(maxClusters as string),
        userId
      });

      res.json({
        success: true,
        data: clusterAnalysis,
        message: 'Análisis de clustering completado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/maps/movement-patterns
 * Análisis de patrones de movimiento del ganado
 */
router.get('/movement-patterns',
  authenticateToken,
  validateDateRange,
  query('bovineIds')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const ids = value.split(',');
        if (ids.length > 20) {
          throw new Error('Máximo 20 bovinos por análisis');
        }
        return true;
      }
      return true;
    }),
  query('analysisType')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'seasonal'])
    .withMessage('Tipo de análisis inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate,
        bovineIds, analysisType = 'daily'
      } = req.query;

      const userId = req.user?.id;

      const movementPatterns = await MapsController.analyzeMovementPatterns({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        bovineIds: bovineIds ? (bovineIds as string).split(',') : undefined,
        analysisType: analysisType as string,
        userId
      });

      res.json({
        success: true,
        data: movementPatterns,
        message: 'Análisis de patrones de movimiento completado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GEOCODIFICACIÓN Y SERVICIOS DE UBICACIÓN
// ===================================================================

/**
 * POST /api/maps/geocode
 * Geocodifica una dirección a coordenadas
 */
router.post('/geocode',
  authenticateToken,
  rateLimitByUserId(50, 15), // 50 requests per 15 minutes
  [
    body('address')
      .notEmpty()
      .isLength({ min: 5, max: 200 })
      .withMessage('La dirección debe tener entre 5 y 200 caracteres'),
    body('country')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Código de país debe tener 2 caracteres'),
    body('region')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Región debe tener entre 1 y 100 caracteres')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address, country = 'MX', region } = req.body;
      const userId = req.user?.id;

      const geocodeResult = await MapsController.geocodeAddress({
        address,
        country,
        region,
        userId
      });

      res.json({
        success: true,
        data: geocodeResult,
        message: 'Geocodificación completada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/maps/reverse-geocode
 * Geocodificación inversa: coordenadas a dirección
 */
router.post('/reverse-geocode',
  authenticateToken,
  rateLimitByUserId(50, 15), // 50 requests per 15 minutes
  validateCoordinates,
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude } = req.body;
      const userId = req.user?.id;

      const reverseResult = await MapsController.reverseGeocode({
        latitude,
        longitude,
        userId
      });

      res.json({
        success: true,
        data: reverseResult,
        message: 'Geocodificación inversa completada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE EXPORTACIÓN Y REPORTES DE MAPAS
// ===================================================================

/**
 * GET /api/maps/export-data
 * Exporta datos geográficos en diferentes formatos
 */
router.get('/export-data',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  query('format')
    .isIn(['geojson', 'kml', 'csv', 'gpx'])
    .withMessage('Formato de exportación inválido'),
  query('dataType')
    .isIn(['cattle_locations', 'geofences', 'vaccination_sites', 'illness_sites'])
    .withMessage('Tipo de datos inválido'),
  validateDateRange,
  validateRequest,
  auditLog('maps.export_data'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        format, dataType,
        startDate, endDate
      } = req.query;

      const userId = req.user?.id;

      const exportData = await MapsController.exportGeoData({
        format: format as string,
        dataType: dataType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        userId
      });

      // Configurar headers apropiados según el formato
      const contentTypes = {
        geojson: 'application/geo+json',
        kml: 'application/vnd.google-earth.kml+xml',
        csv: 'text/csv',
        gpx: 'application/gpx+xml'
      };

      res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
      res.setHeader('Content-Disposition', `attachment; filename="geo_data.${format}"`);

      if (format === 'csv') {
        res.send(exportData);
      } else {
        res.json(exportData);
      }
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// EXPORTAR ROUTER
// ===================================================================

export default router;