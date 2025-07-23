import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Op, WhereOptions } from 'sequelize';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateRequest,
  auditLog,
  rateLimitByUserId,
  uploadMultiple,
  validateFileUpload
} from '../middleware';
import { 
  RanchController,
  PropertyController,
  StaffController,
  DocumentController 
} from '../controllers';

const router = Router();

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===================================================================

// Validar coordenadas geográficas para rancho
const validateRanchCoordinates = [
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90 grados'),
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180 grados'),
  body('location.elevation')
    .optional()
    .isFloat({ min: -500, max: 8000 })
    .withMessage('La elevación debe estar entre -500 y 8000 metros')
];

// Validar dimensiones del rancho
const validateRanchDimensions = [
  body('dimensions.totalArea')
    .isFloat({ min: 0.1, max: 1000000 })
    .withMessage('El área total debe estar entre 0.1 y 1,000,000 hectáreas'),
  body('dimensions.usableArea')
    .isFloat({ min: 0 })
    .withMessage('El área utilizable debe ser un número positivo'),
  body('dimensions.pastureArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El área de pastoreo debe ser un número positivo'),
  body('dimensions.buildingArea')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('El área de construcciones debe estar entre 0 y 1,000,000 m²'),
  body('dimensions.waterBodyArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El área de cuerpos de agua debe ser un número positivo'),
  body('dimensions.forestArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El área forestal debe ser un número positivo')
];

// Validar información de contacto
const validateContactInfo = [
  body('contactInfo.email')
    .isEmail()
    .withMessage('Email debe ser válido'),
  body('contactInfo.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Teléfono debe ser válido'),
  body('contactInfo.alternatePhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Teléfono alternativo debe ser válido'),
  body('contactInfo.website')
    .optional()
    .isURL()
    .withMessage('Sitio web debe ser una URL válida')
];

// ===================================================================
// RUTAS DE VISTA GENERAL DEL RANCHO
// ===================================================================

/**
 * GET /api/ranch/overview
 * Vista general del rancho con estadísticas principales
 */
router.get('/overview',
  authenticateToken,
  query('includeStats')
    .optional()
    .isBoolean()
    .withMessage('includeStats debe ser verdadero o falso'),
  query('includeAlerts')
    .optional()
    .isBoolean()
    .withMessage('includeAlerts debe ser verdadero o falso'),
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'),
  validateRequest,
  auditLog('ranch.overview.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        includeStats = true, 
        includeAlerts = true, 
        timeRange = '30d' 
      } = req.query;
      const userId = req.user?.id;

      const overview = await RanchController.getRanchOverview({
        includeStats: includeStats === 'true',
        includeAlerts: includeAlerts === 'true',
        timeRange: timeRange as string,
        userId
      });

      res.json({
        success: true,
        data: overview,
        message: 'Vista general del rancho obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ranch/statistics
 * Estadísticas detalladas del rancho
 */
router.get('/statistics',
  authenticateToken,
  query('category')
    .optional()
    .isIn(['general', 'operational', 'financial', 'compliance', 'production'])
    .withMessage('Categoría de estadísticas inválida'),
  query('period')
    .optional()
    .isIn(['current', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Período inválido'),
  query('includeComparisons')
    .optional()
    .isBoolean()
    .withMessage('includeComparisons debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        category = 'general', 
        period = 'current', 
        includeComparisons = false 
      } = req.query;
      const userId = req.user?.id;

      const statistics = await RanchController.getRanchStatistics({
        category: category as string,
        period: period as string,
        includeComparisons: includeComparisons === 'true',
        userId
      });

      res.json({
        success: true,
        data: statistics,
        message: 'Estadísticas del rancho obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE RANCHOS
// ===================================================================

/**
 * GET /api/ranch
 * Obtiene información básica del rancho del usuario
 */
router.get('/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      const ranch = await RanchController.getUserRanch(userId);

      if (!ranch) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró información del rancho para este usuario'
        });
      }

      res.json({
        success: true,
        data: ranch,
        message: 'Información del rancho obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ranch
 * Crea un nuevo rancho (solo para administradores)
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin', 'system_admin']),
  [
    body('basicInfo.name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('basicInfo.description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    body('basicInfo.establishedYear')
      .isInt({ min: 1800, max: new Date().getFullYear() })
      .withMessage('Año de establecimiento inválido'),
    body('basicInfo.propertyType')
      .isIn(['ranch', 'farm', 'dairy', 'feedlot', 'mixed'])
      .withMessage('Tipo de propiedad inválido'),
    body('basicInfo.registrationNumber')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Número de registro debe tener entre 1 y 50 caracteres'),
    // Validar ubicación
    body('location.address')
      .notEmpty()
      .isLength({ min: 10, max: 200 })
      .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    body('location.city')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
    body('location.state')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El estado debe tener entre 2 y 100 caracteres'),
    body('location.country')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El país debe tener entre 2 y 100 caracteres'),
    body('location.postalCode')
      .optional()
      .isLength({ min: 5, max: 10 })
      .withMessage('Código postal debe tener entre 5 y 10 caracteres'),
    ...validateRanchCoordinates,
    // Validar dimensiones
    ...validateRanchDimensions,
    // Validar información del propietario
    body('ownership.ownerName')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre del propietario debe tener entre 2 y 100 caracteres'),
    body('ownership.ownerType')
      .isIn(['individual', 'corporation', 'cooperative', 'government'])
      .withMessage('Tipo de propietario inválido'),
    ...validateContactInfo
  ],
  validateRequest,
  auditLog('ranch.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ranchData = req.body;
      const userId = req.user?.id;

      const newRanch = await RanchController.createRanch({
        ...ranchData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: newRanch,
        message: 'Rancho creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/ranch/:id
 * Actualiza información del rancho
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'owner']),
  param('id')
    .isUUID()
    .withMessage('ID del rancho debe ser un UUID válido'),
  [
    body('basicInfo.name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('basicInfo.description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    body('basicInfo.establishedYear')
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() })
      .withMessage('Año de establecimiento inválido'),
    body('location.address')
      .optional()
      .isLength({ min: 10, max: 200 })
      .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    body('dimensions.totalArea')
      .optional()
      .isFloat({ min: 0.1, max: 1000000 })
      .withMessage('El área total debe estar entre 0.1 y 1,000,000 hectáreas')
  ],
  validateRequest,
  auditLog('ranch.update'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      const updatedRanch = await RanchController.updateRanch(id, {
        ...updateData,
        updatedBy: userId
      });

      if (!updatedRanch) {
        return res.status(404).json({
          success: false,
          message: 'Rancho no encontrado'
        });
      }

      res.json({
        success: true,
        data: updatedRanch,
        message: 'Rancho actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE INFORMACIÓN DE LA PROPIEDAD
// ===================================================================

/**
 * GET /api/ranch/property-info
 * Obtiene información completa de la propiedad
 */
router.get('/property-info',
  authenticateToken,
  query('includeDocuments')
    .optional()
    .isBoolean()
    .withMessage('includeDocuments debe ser verdadero o falso'),
  query('includePhotos')
    .optional()
    .isBoolean()
    .withMessage('includePhotos debe ser verdadero o falso'),
  query('includeFacilities')
    .optional()
    .isBoolean()
    .withMessage('includeFacilities debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        includeDocuments = true, 
        includePhotos = true, 
        includeFacilities = true 
      } = req.query;
      const userId = req.user?.id;

      const propertyInfo = await PropertyController.getPropertyInfo({
        includeDocuments: includeDocuments === 'true',
        includePhotos: includePhotos === 'true',
        includeFacilities: includeFacilities === 'true',
        userId
      });

      res.json({
        success: true,
        data: propertyInfo,
        message: 'Información de la propiedad obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ranch/facilities
 * Obtiene lista de instalaciones del rancho
 */
router.get('/facilities',
  authenticateToken,
  query('type')
    .optional()
    .isIn(['barn', 'milking_parlor', 'feed_storage', 'water_source', 'corral', 'office', 'housing', 'equipment_storage', 'processing', 'quarantine'])
    .withMessage('Tipo de instalación inválido'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'under_construction', 'needs_repair', 'planned'])
    .withMessage('Estado de instalación inválido'),
  query('includeCoordinates')
    .optional()
    .isBoolean()
    .withMessage('includeCoordinates debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, status, includeCoordinates = true } = req.query;
      const userId = req.user?.id;

      const facilities = await PropertyController.getFacilities({
        type: type as string,
        status: status as string,
        includeCoordinates: includeCoordinates === 'true',
        userId
      });

      res.json({
        success: true,
        data: facilities,
        message: 'Instalaciones obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ranch/facilities
 * Registra nueva instalación en el rancho
 */
router.post('/facilities',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  [
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('type')
      .isIn(['barn', 'milking_parlor', 'feed_storage', 'water_source', 'corral', 'office', 'housing', 'equipment_storage', 'processing', 'quarantine'])
      .withMessage('Tipo de instalación inválido'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres'),
    body('capacity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La capacidad debe ser un número entero positivo'),
    body('area')
      .optional()
      .isFloat({ min: 0.1, max: 100000 })
      .withMessage('El área debe estar entre 0.1 y 100,000 m²'),
    body('coordinates.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida'),
    body('coordinates.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida'),
    body('constructionDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de construcción debe ser válida'),
    body('lastMaintenanceDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de último mantenimiento debe ser válida'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'under_construction', 'needs_repair', 'planned'])
      .withMessage('Estado de instalación inválido'),
    body('specifications')
      .optional()
      .isObject()
      .withMessage('Las especificaciones deben ser un objeto válido')
  ],
  validateRequest,
  auditLog('ranch.facility.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityData = req.body;
      const userId = req.user?.id;

      const newFacility = await PropertyController.createFacility({
        ...facilityData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: newFacility,
        message: 'Instalación registrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE DOCUMENTOS
// ===================================================================

/**
 * GET /api/ranch/documents
 * Obtiene documentos del rancho
 */
router.get('/documents',
  authenticateToken,
  query('type')
    .optional()
    .isIn(['title_deed', 'survey', 'permit', 'certificate', 'insurance', 'tax', 'environmental', 'inspection', 'contract', 'legal', 'financial'])
    .withMessage('Tipo de documento inválido'),
  query('status')
    .optional()
    .isIn(['valid', 'expired', 'pending', 'requires_renewal', 'under_review'])
    .withMessage('Estado de documento inválido'),
  query('expiringWithin')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días de vencimiento debe estar entre 1 y 365'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, status, expiringWithin } = req.query;
      const userId = req.user?.id;

      const documents = await DocumentController.getRanchDocuments({
        type: type as string,
        status: status as string,
        expiringWithin: expiringWithin ? parseInt(expiringWithin as string) : undefined,
        userId
      });

      res.json({
        success: true,
        data: documents,
        message: 'Documentos obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ranch/documents/upload
 * Sube documentos del rancho
 */
router.post('/documents/upload',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'owner']),
  uploadMultiple.fields([
    { name: 'documents', maxCount: 10 }
  ]),
  validateFileUpload(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']),
  [
    body('type')
      .isIn(['title_deed', 'survey', 'permit', 'certificate', 'insurance', 'tax', 'environmental', 'inspection', 'contract', 'legal', 'financial'])
      .withMessage('Tipo de documento inválido'),
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La descripción no puede exceder 500 caracteres'),
    body('expirationDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de vencimiento debe ser válida'),
    body('issuer')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El emisor debe tener entre 2 y 100 caracteres'),
    body('documentNumber')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Número de documento debe tener entre 1 y 50 caracteres')
  ],
  validateRequest,
  auditLog('ranch.document.upload'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documentData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const userId = req.user?.id;

      if (!files.documents || files.documents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere al menos un archivo'
        });
      }

      const uploadedDocuments = await DocumentController.uploadDocuments({
        ...documentData,
        files: files.documents,
        uploadedBy: userId
      });

      res.status(201).json({
        success: true,
        data: uploadedDocuments,
        message: 'Documentos subidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/ranch/documents/:id
 * Elimina un documento
 */
router.delete('/documents/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'owner']),
  param('id')
    .isUUID()
    .withMessage('ID del documento debe ser un UUID válido'),
  validateRequest,
  auditLog('ranch.document.delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const deleted = await DocumentController.deleteDocument(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE PERSONAL
// ===================================================================

/**
 * GET /api/ranch/staff
 * Obtiene lista del personal del rancho
 */
router.get('/staff',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('department')
    .optional()
    .isIn(['administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'])
    .withMessage('Departamento inválido'),
  query('position')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Posición debe tener entre 1 y 100 caracteres'),
  query('status')
    .optional()
    .isIn(['active', 'on_leave', 'suspended', 'terminated'])
    .withMessage('Estado del empleado inválido'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Búsqueda debe tener entre 1 y 100 caracteres'),
  validateRequest,
  auditLog('ranch.staff.list'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        department,
        position,
        status,
        search
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        department: department as string,
        position: position as string,
        status: status as string,
        search: search as string
      };

      const staff = await StaffController.getStaff({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: staff,
        message: 'Personal obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ranch/staff
 * Registra nuevo empleado
 */
router.post('/staff',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'hr_manager']),
  [
    body('personalInfo.firstName')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('personalInfo.lastName')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    body('personalInfo.idNumber')
      .notEmpty()
      .isLength({ min: 5, max: 20 })
      .withMessage('Número de identificación debe tener entre 5 y 20 caracteres'),
    body('personalInfo.birthDate')
      .isISO8601()
      .withMessage('Fecha de nacimiento debe ser válida'),
    body('personalInfo.gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Género inválido'),
    body('personalInfo.maritalStatus')
      .optional()
      .isIn(['single', 'married', 'divorced', 'widowed'])
      .withMessage('Estado civil inválido'),
    body('contactInfo.email')
      .optional()
      .isEmail()
      .withMessage('Email debe ser válido'),
    body('contactInfo.phone')
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Teléfono debe ser válido'),
    body('contactInfo.address')
      .notEmpty()
      .isLength({ min: 10, max: 200 })
      .withMessage('Dirección debe tener entre 10 y 200 caracteres'),
    body('contactInfo.emergencyContact.name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Contacto de emergencia debe tener entre 2 y 100 caracteres'),
    body('contactInfo.emergencyContact.phone')
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Teléfono de emergencia debe ser válido'),
    body('contactInfo.emergencyContact.relationship')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('Relación debe tener entre 2 y 50 caracteres'),
    body('employment.position')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Posición debe tener entre 2 y 100 caracteres'),
    body('employment.department')
      .isIn(['administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'])
      .withMessage('Departamento inválido'),
    body('employment.hireDate')
      .isISO8601()
      .withMessage('Fecha de contratación debe ser válida'),
    body('employment.employmentType')
      .isIn(['full_time', 'part_time', 'temporary', 'seasonal', 'contractor'])
      .withMessage('Tipo de empleo inválido'),
    body('employment.salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salario debe ser un número positivo'),
    body('employment.supervisor')
      .optional()
      .isUUID()
      .withMessage('Supervisor debe ser un UUID válido'),
    body('qualifications.education')
      .optional()
      .isIn(['none', 'primary', 'secondary', 'technical', 'university', 'postgraduate'])
      .withMessage('Nivel educativo inválido'),
    body('qualifications.experience')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Experiencia debe estar entre 0 y 50 años'),
    body('qualifications.certifications')
      .optional()
      .isArray()
      .withMessage('Certificaciones debe ser un array'),
    body('qualifications.skills')
      .optional()
      .isArray()
      .withMessage('Habilidades debe ser un array'),
    body('qualifications.languages')
      .optional()
      .isArray()
      .withMessage('Idiomas debe ser un array')
  ],
  validateRequest,
  auditLog('ranch.staff.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const staffData = req.body;
      const userId = req.user?.id;

      const newEmployee = await StaffController.createEmployee({
        ...staffData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: newEmployee,
        message: 'Empleado registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/ranch/staff/:id
 * Actualiza información de empleado
 */
router.put('/staff/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'hr_manager']),
  param('id')
    .isUUID()
    .withMessage('ID del empleado debe ser un UUID válido'),
  [
    body('personalInfo.firstName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('personalInfo.lastName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    body('contactInfo.email')
      .optional()
      .isEmail()
      .withMessage('Email debe ser válido'),
    body('contactInfo.phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Teléfono debe ser válido'),
    body('employment.position')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Posición debe tener entre 2 y 100 caracteres'),
    body('employment.department')
      .optional()
      .isIn(['administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'])
      .withMessage('Departamento inválido'),
    body('employment.status')
      .optional()
      .isIn(['active', 'on_leave', 'suspended', 'terminated'])
      .withMessage('Estado del empleado inválido'),
    body('employment.salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salario debe ser un número positivo')
  ],
  validateRequest,
  auditLog('ranch.staff.update'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      const updatedEmployee = await StaffController.updateEmployee(id, {
        ...updateData,
        updatedBy: userId
      });

      if (!updatedEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      res.json({
        success: true,
        data: updatedEmployee,
        message: 'Empleado actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ranch/staff/:id/performance
 * Obtiene evaluación de rendimiento de empleado
 */
router.get('/staff/:id/performance',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'hr_manager']),
  param('id')
    .isUUID()
    .withMessage('ID del empleado debe ser un UUID válido'),
  query('period')
    .optional()
    .isIn(['current_month', 'last_month', 'quarter', 'year', 'all_time'])
    .withMessage('Período inválido'),
  query('includeHistory')
    .optional()
    .isBoolean()
    .withMessage('includeHistory debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { period = 'current_month', includeHistory = false } = req.query;
      const userId = req.user?.id;

      const performance = await StaffController.getEmployeePerformance({
        employeeId: id,
        period: period as string,
        includeHistory: includeHistory === 'true',
        userId
      });

      res.json({
        success: true,
        data: performance,
        message: 'Evaluación de rendimiento obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES DEL RANCHO
// ===================================================================

/**
 * GET /api/ranch/reports/compliance
 * Reporte de cumplimiento legal y certificaciones
 */
router.get('/reports/compliance',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'compliance_officer']),
  query('includeExpiring')
    .optional()
    .isBoolean()
    .withMessage('includeExpiring debe ser verdadero o falso'),
  query('expiryThreshold')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Umbral de vencimiento debe estar entre 1 y 365 días'),
  query('format')
    .optional()
    .isIn(['json', 'pdf', 'excel'])
    .withMessage('Formato inválido'),
  validateRequest,
  auditLog('ranch.reports.compliance'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        includeExpiring = true, 
        expiryThreshold = 30, 
        format = 'json' 
      } = req.query;
      const userId = req.user?.id;

      const complianceReport = await RanchController.generateComplianceReport({
        includeExpiring: includeExpiring === 'true',
        expiryThreshold: parseInt(expiryThreshold as string),
        format: format as string,
        userId
      });

      if (format === 'json') {
        res.json({
          success: true,
          data: complianceReport,
          message: 'Reporte de cumplimiento generado exitosamente'
        });
      } else {
        // Para PDF y Excel, configurar headers apropiados
        const contentTypes = {
          pdf: 'application/pdf',
          excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
        res.setHeader('Content-Disposition', `attachment; filename="compliance_report.${format}"`);
        res.send(complianceReport);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ranch/reports/operational
 * Reporte operacional del rancho
 */
router.get('/reports/operational',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'),
  query('includeStaffMetrics')
    .optional()
    .isBoolean()
    .withMessage('includeStaffMetrics debe ser verdadero o falso'),
  query('includeFacilityStatus')
    .optional()
    .isBoolean()
    .withMessage('includeFacilityStatus debe ser verdadero o falso'),
  validateRequest,
  auditLog('ranch.reports.operational'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate,
        endDate,
        includeStaffMetrics = true,
        includeFacilityStatus = true
      } = req.query;
      const userId = req.user?.id;

      const operationalReport = await RanchController.generateOperationalReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeStaffMetrics: includeStaffMetrics === 'true',
        includeFacilityStatus: includeFacilityStatus === 'true',
        userId
      });

      res.json({
        success: true,
        data: operationalReport,
        message: 'Reporte operacional generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// EXPORTAR ROUTER
// ===================================================================

export default router;