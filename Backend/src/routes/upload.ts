import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateRequest,
  auditLog,
  rateLimitByUserId
} from '../middleware';
import { 
  FileController,
  DocumentController,
  MediaController 
} from '../controllers';

const router = Router();

// ===================================================================
// CONFIGURACIÓN DE MULTER PARA DIFERENTES TIPOS DE ARCHIVOS
// ===================================================================

// Almacenamiento para documentos generales
const documentStorage = multer.memoryStorage();

// Almacenamiento para imágenes
const imageStorage = multer.memoryStorage();

// Almacenamiento para videos
const videoStorage = multer.memoryStorage();

// Filtros de archivos por categoría
const documentFileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido para documentos'), false);
  }
};

const imageFileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido para imágenes'), false);
  }
};

const videoFileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
  const allowedMimes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido para videos'), false);
  }
};

// Configuración de multer para diferentes tipos
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // máximo 10 archivos por request
  }
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 20 // máximo 20 imágenes por request
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 5 // máximo 5 videos por request
  }
});

// Multer genérico para archivos mixtos
const uploadMixed = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 50 // máximo 50 archivos por request
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedMimes = [
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      // Imágenes
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===================================================================

// Validar metadatos de archivo
const validateFileMetadata = [
  body('category')
    .optional()
    .isIn([
      'health_record', 'vaccination_certificate', 'genealogy', 'medical_report',
      'legal_document', 'insurance', 'permit', 'certification', 'inspection',
      'ranch_photo', 'bovine_photo', 'facility_photo', 'equipment_photo',
      'procedure_video', 'training_video', 'surveillance_video',
      'financial_report', 'production_report', 'inventory_report'
    ])
    .withMessage('Categoría de archivo inválida'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags debe ser un array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag debe tener entre 1 y 50 caracteres'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser verdadero o falso'),
  body('expirationDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento debe ser válida')
];

// Validar geolocalización para archivos
const validateFileLocation = [
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90 grados'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180 grados'),
  body('location.altitude')
    .optional()
    .isFloat({ min: -500, max: 8000 })
    .withMessage('Altitud debe estar entre -500 y 8000 metros'),
  body('location.address')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Dirección debe tener entre 1 y 200 caracteres')
];

// ===================================================================
// RUTAS DE UPLOAD GENERAL
// ===================================================================

/**
 * POST /api/upload/files
 * Upload general de archivos múltiples con metadatos
 */
router.post('/files',
  authenticateToken,
  rateLimitByUserId(100, 60), // 100 uploads por hora
  uploadMixed.array('files', 50),
  validateFileMetadata,
  validateFileLocation,
  validateRequest,
  auditLog('upload.files.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.user?.id;
      const metadata = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron archivos para subir'
        });
      }

      // Validar tamaño total
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 1024 * 1024 * 1024) { // 1GB total
        return res.status(400).json({
          success: false,
          message: 'El tamaño total de archivos excede el límite de 1GB'
        });
      }

      const uploadedFiles = await FileController.uploadMultipleFiles({
        files,
        metadata,
        userId
      });

      res.status(201).json({
        success: true,
        data: uploadedFiles,
        message: `${files.length} archivo(s) subido(s) exitosamente`
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/files
 * Lista archivos del usuario con filtros
 */
router.get('/files',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('category')
    .optional()
    .isIn([
      'health_record', 'vaccination_certificate', 'genealogy', 'medical_report',
      'legal_document', 'insurance', 'permit', 'certification', 'inspection',
      'ranch_photo', 'bovine_photo', 'facility_photo', 'equipment_photo',
      'procedure_video', 'training_video', 'surveillance_video',
      'financial_report', 'production_report', 'inventory_report'
    ])
    .withMessage('Categoría inválida'),
  query('fileType')
    .optional()
    .isIn(['image', 'video', 'document', 'all'])
    .withMessage('Tipo de archivo inválido'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Búsqueda debe tener entre 1 y 100 caracteres'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',');
        if (tags.length > 10) {
          throw new Error('Máximo 10 tags por consulta');
        }
      }
      return true;
    }),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        fileType = 'all',
        search,
        dateFrom,
        dateTo,
        tags
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        category: category as string,
        fileType: fileType as string,
        search: search as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        tags: tags ? (tags as string).split(',') : undefined
      };

      const files = await FileController.getUserFiles({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: files,
        message: 'Archivos obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/files/:id
 * Obtiene información detallada de un archivo
 */
router.get('/files/:id',
  authenticateToken,
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const file = await FileController.getFileById(id, userId);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/files/:id/download
 * Descarga un archivo
 */
router.get('/files/:id/download',
  authenticateToken,
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  query('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Versión debe ser un número entero positivo'),
  validateRequest,
  auditLog('upload.file.download'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { version } = req.query;
      const userId = req.user?.id;

      const fileStream = await FileController.downloadFile({
        fileId: id,
        version: version ? parseInt(version as string) : undefined,
        userId
      });

      if (!fileStream) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', fileStream.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileStream.filename}"`);
      res.setHeader('Content-Length', fileStream.size);

      // Enviar archivo
      fileStream.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/upload/files/:id
 * Elimina un archivo
 */
router.delete('/files/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'file_owner']),
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  validateRequest,
  auditLog('upload.file.delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const deleted = await FileController.deleteFile(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS ESPECÍFICAS PARA DOCUMENTOS DE BOVINOS
// ===================================================================

/**
 * POST /api/upload/bovines/:bovineId/documents
 * Sube documentos específicos de un bovino
 */
router.post('/bovines/:bovineId/documents',
  authenticateToken,
  param('bovineId')
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  uploadDocument.array('documents', 10),
  [
    body('documentType')
      .isIn([
        'health_record', 'vaccination_certificate', 'genealogy', 'medical_report',
        'breeding_record', 'production_record', 'identification_document'
      ])
      .withMessage('Tipo de documento inválido'),
    body('veterinarianId')
      .optional()
      .isUUID()
      .withMessage('ID de veterinario debe ser un UUID válido'),
    body('issueDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de emisión debe ser válida'),
    body('expirationDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de vencimiento debe ser válida'),
    ...validateFileMetadata
  ],
  validateRequest,
  auditLog('upload.bovine_documents.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId } = req.params;
      const documents = req.files as Express.Multer.File[];
      const documentData = req.body;
      const userId = req.user?.id;

      if (!documents || documents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron documentos para subir'
        });
      }

      const uploadedDocuments = await DocumentController.uploadBovineDocuments({
        bovineId,
        documents,
        documentData,
        userId
      });

      res.status(201).json({
        success: true,
        data: uploadedDocuments,
        message: 'Documentos del bovino subidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/bovines/:bovineId/documents
 * Obtiene documentos de un bovino específico
 */
router.get('/bovines/:bovineId/documents',
  authenticateToken,
  param('bovineId')
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('documentType')
    .optional()
    .isIn([
      'health_record', 'vaccination_certificate', 'genealogy', 'medical_report',
      'breeding_record', 'production_record', 'identification_document'
    ])
    .withMessage('Tipo de documento inválido'),
  query('includeExpired')
    .optional()
    .isBoolean()
    .withMessage('includeExpired debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId } = req.params;
      const { documentType, includeExpired = false } = req.query;
      const userId = req.user?.id;

      const documents = await DocumentController.getBovineDocuments({
        bovineId,
        documentType: documentType as string,
        includeExpired: includeExpired === 'true',
        userId
      });

      res.json({
        success: true,
        data: documents,
        message: 'Documentos del bovino obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS ESPECÍFICAS PARA FOTOS DE BOVINOS
// ===================================================================

/**
 * POST /api/upload/bovines/:bovineId/photos
 * Sube fotos de un bovino específico
 */
router.post('/bovines/:bovineId/photos',
  authenticateToken,
  param('bovineId')
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  uploadImage.array('photos', 20),
  [
    body('photoType')
      .optional()
      .isIn(['profile', 'identification', 'medical', 'breeding', 'general'])
      .withMessage('Tipo de foto inválido'),
    body('angle')
      .optional()
      .isIn(['front', 'back', 'left_side', 'right_side', 'top', 'close_up'])
      .withMessage('Ángulo de foto inválido'),
    body('isProfilePhoto')
      .optional()
      .isBoolean()
      .withMessage('isProfilePhoto debe ser verdadero o falso'),
    ...validateFileLocation
  ],
  validateRequest,
  auditLog('upload.bovine_photos.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId } = req.params;
      const photos = req.files as Express.Multer.File[];
      const photoData = req.body;
      const userId = req.user?.id;

      if (!photos || photos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron fotos para subir'
        });
      }

      const uploadedPhotos = await MediaController.uploadBovinePhotos({
        bovineId,
        photos,
        photoData,
        userId
      });

      res.status(201).json({
        success: true,
        data: uploadedPhotos,
        message: 'Fotos del bovino subidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/upload/bovines/:bovineId/photos
 * Obtiene fotos de un bovino específico
 */
router.get('/bovines/:bovineId/photos',
  authenticateToken,
  param('bovineId')
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('photoType')
    .optional()
    .isIn(['profile', 'identification', 'medical', 'breeding', 'general'])
    .withMessage('Tipo de foto inválido'),
  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId } = req.params;
      const { photoType, includeDeleted = false } = req.query;
      const userId = req.user?.id;

      const photos = await MediaController.getBovinePhotos({
        bovineId,
        photoType: photoType as string,
        includeDeleted: includeDeleted === 'true',
        userId
      });

      res.json({
        success: true,
        data: photos,
        message: 'Fotos del bovino obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS ESPECÍFICAS PARA DOCUMENTOS DEL RANCHO
// ===================================================================

/**
 * POST /api/upload/ranch/documents
 * Sube documentos legales y administrativos del rancho
 */
router.post('/ranch/documents',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'owner']),
  uploadDocument.array('documents', 10),
  [
    body('documentType')
      .isIn([
        'title_deed', 'survey', 'permit', 'certificate', 'insurance', 'tax',
        'environmental', 'inspection', 'contract', 'legal', 'financial'
      ])
      .withMessage('Tipo de documento del rancho inválido'),
    body('issuer')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Emisor debe tener entre 2 y 100 caracteres'),
    body('documentNumber')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Número de documento debe tener entre 1 y 50 caracteres'),
    body('legalStatus')
      .optional()
      .isIn(['active', 'expired', 'pending', 'cancelled'])
      .withMessage('Estado legal inválido'),
    ...validateFileMetadata
  ],
  validateRequest,
  auditLog('upload.ranch_documents.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documents = req.files as Express.Multer.File[];
      const documentData = req.body;
      const userId = req.user?.id;

      if (!documents || documents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron documentos para subir'
        });
      }

      const uploadedDocuments = await DocumentController.uploadRanchDocuments({
        documents,
        documentData,
        userId
      });

      res.status(201).json({
        success: true,
        data: uploadedDocuments,
        message: 'Documentos del rancho subidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS ESPECÍFICAS PARA FOTOS DEL RANCHO
// ===================================================================

/**
 * POST /api/upload/ranch/photos
 * Sube fotos del rancho e instalaciones
 */
router.post('/ranch/photos',
  authenticateToken,
  uploadImage.array('photos', 50),
  [
    body('photoCategory')
      .isIn(['aerial', 'facilities', 'pastures', 'buildings', 'equipment', 'boundaries', 'infrastructure'])
      .withMessage('Categoría de foto inválida'),
    body('facilityId')
      .optional()
      .isUUID()
      .withMessage('ID de instalación debe ser un UUID válido'),
    body('isMainPhoto')
      .optional()
      .isBoolean()
      .withMessage('isMainPhoto debe ser verdadero o falso'),
    ...validateFileLocation
  ],
  validateRequest,
  auditLog('upload.ranch_photos.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const photos = req.files as Express.Multer.File[];
      const photoData = req.body;
      const userId = req.user?.id;

      if (!photos || photos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron fotos para subir'
        });
      }

      const uploadedPhotos = await MediaController.uploadRanchPhotos({
        photos,
        photoData,
        userId
      });

      res.status(201).json({
        success: true,
        data: uploadedPhotos,
        message: 'Fotos del rancho subidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS PARA PROCESAMIENTO DE IMÁGENES
// ===================================================================

/**
 * POST /api/upload/images/resize
 * Redimensiona imágenes
 */
router.post('/images/resize',
  authenticateToken,
  rateLimitByUserId(50, 60), // 50 procesamientos por hora
  [
    body('imageIds')
      .isArray({ min: 1, max: 20 })
      .withMessage('Debe proporcionar entre 1 y 20 IDs de imagen'),
    body('imageIds.*')
      .isUUID()
      .withMessage('Cada ID de imagen debe ser un UUID válido'),
    body('dimensions')
      .isArray({ min: 1, max: 5 })
      .withMessage('Debe especificar entre 1 y 5 dimensiones'),
    body('dimensions.*.width')
      .isInt({ min: 50, max: 4000 })
      .withMessage('Ancho debe estar entre 50 y 4000 píxeles'),
    body('dimensions.*.height')
      .isInt({ min: 50, max: 4000 })
      .withMessage('Alto debe estar entre 50 y 4000 píxeles'),
    body('dimensions.*.quality')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Calidad debe estar entre 1 y 100'),
    body('format')
      .optional()
      .isIn(['jpeg', 'png', 'webp'])
      .withMessage('Formato inválido')
  ],
  validateRequest,
  auditLog('upload.images.resize'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageIds, dimensions, format = 'jpeg' } = req.body;
      const userId = req.user?.id;

      const resizedImages = await MediaController.resizeImages({
        imageIds,
        dimensions,
        format,
        userId
      });

      res.json({
        success: true,
        data: resizedImages,
        message: 'Imágenes redimensionadas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/upload/images/optimize
 * Optimiza imágenes para web
 */
router.post('/images/optimize',
  authenticateToken,
  rateLimitByUserId(30, 60), // 30 optimizaciones por hora
  [
    body('imageIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('Debe proporcionar entre 1 y 10 IDs de imagen'),
    body('imageIds.*')
      .isUUID()
      .withMessage('Cada ID de imagen debe ser un UUID válido'),
    body('optimizationLevel')
      .optional()
      .isIn(['low', 'medium', 'high', 'lossless'])
      .withMessage('Nivel de optimización inválido'),
    body('generateThumbnails')
      .optional()
      .isBoolean()
      .withMessage('generateThumbnails debe ser verdadero o falso')
  ],
  validateRequest,
  auditLog('upload.images.optimize'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        imageIds, 
        optimizationLevel = 'medium', 
        generateThumbnails = true 
      } = req.body;
      const userId = req.user?.id;

      const optimizedImages = await MediaController.optimizeImages({
        imageIds,
        optimizationLevel,
        generateThumbnails,
        userId
      });

      res.json({
        success: true,
        data: optimizedImages,
        message: 'Imágenes optimizadas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS PARA PROCESAMIENTO DE VIDEOS
// ===================================================================

/**
 * POST /api/upload/videos/compress
 * Comprime videos para reducir tamaño
 */
router.post('/videos/compress',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'veterinarian']),
  rateLimitByUserId(10, 60), // 10 compresiones por hora
  [
    body('videoIds')
      .isArray({ min: 1, max: 5 })
      .withMessage('Debe proporcionar entre 1 y 5 IDs de video'),
    body('videoIds.*')
      .isUUID()
      .withMessage('Cada ID de video debe ser un UUID válido'),
    body('quality')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Calidad inválida'),
    body('resolution')
      .optional()
      .isIn(['480p', '720p', '1080p'])
      .withMessage('Resolución inválida'),
    body('generateThumbnail')
      .optional()
      .isBoolean()
      .withMessage('generateThumbnail debe ser verdadero o falso')
  ],
  validateRequest,
  auditLog('upload.videos.compress'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        videoIds, 
        quality = 'medium', 
        resolution = '720p',
        generateThumbnail = true 
      } = req.body;
      const userId = req.user?.id;

      const compressedVideos = await MediaController.compressVideos({
        videoIds,
        quality,
        resolution,
        generateThumbnail,
        userId
      });

      res.json({
        success: true,
        data: compressedVideos,
        message: 'Videos comprimidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE ESTADÍSTICAS Y GESTIÓN
// ===================================================================

/**
 * GET /api/upload/storage/stats
 * Obtiene estadísticas de almacenamiento del usuario
 */
router.get('/storage/stats',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      const storageStats = await FileController.getStorageStats(userId);

      res.json({
        success: true,
        data: storageStats,
        message: 'Estadísticas de almacenamiento obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/upload/cleanup
 * Limpia archivos temporales y huérfanos
 */
router.post('/cleanup',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('olderThan')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('olderThan debe estar entre 1 y 365 días'),
    body('includeDeleted')
      .optional()
      .isBoolean()
      .withMessage('includeDeleted debe ser verdadero o falso'),
    body('dryRun')
      .optional()
      .isBoolean()
      .withMessage('dryRun debe ser verdadero o falso')
  ],
  validateRequest,
  auditLog('upload.cleanup'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        olderThan = 30, 
        includeDeleted = true, 
        dryRun = false 
      } = req.body;
      const userId = req.user?.id;

      const cleanupResult = await FileController.cleanupFiles({
        olderThan,
        includeDeleted,
        dryRun,
        userId
      });

      res.json({
        success: true,
        data: cleanupResult,
        message: dryRun ? 'Simulación de limpieza completada' : 'Limpieza completada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE EXPORTACIÓN MASIVA
// ===================================================================

/**
 * POST /api/upload/export
 * Exporta archivos seleccionados como ZIP
 */
router.post('/export',
  authenticateToken,
  rateLimitByUserId(5, 60), // 5 exportaciones por hora
  [
    body('fileIds')
      .isArray({ min: 1, max: 100 })
      .withMessage('Debe seleccionar entre 1 y 100 archivos'),
    body('fileIds.*')
      .isUUID()
      .withMessage('Cada ID de archivo debe ser un UUID válido'),
    body('includeMetadata')
      .optional()
      .isBoolean()
      .withMessage('includeMetadata debe ser verdadero o falso'),
    body('compressionLevel')
      .optional()
      .isInt({ min: 0, max: 9 })
      .withMessage('Nivel de compresión debe estar entre 0 y 9')
  ],
  validateRequest,
  auditLog('upload.export'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        fileIds, 
        includeMetadata = true, 
        compressionLevel = 6 
      } = req.body;
      const userId = req.user?.id;

      const exportResult = await FileController.exportFiles({
        fileIds,
        includeMetadata,
        compressionLevel,
        userId
      });

      res.json({
        success: true,
        data: exportResult,
        message: 'Exportación preparada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// MIDDLEWARE DE MANEJO DE ERRORES ESPECÍFICO PARA MULTER
// ===================================================================

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos enviados',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado',
          error: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error en la subida de archivos',
          error: error.code
        });
    }
  }

  if (error.message && error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
});

// ===================================================================
// EXPORTAR ROUTER
// ===================================================================

export default router;