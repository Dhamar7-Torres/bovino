"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const logging_1 = require("../middleware/logging");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'video/mp4',
        'video/avi',
        'video/mov'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 20
    }
});
const validateRequest = (req, res, next) => {
    next();
};
const auditLog = (action) => {
    return (req, res, next) => {
        if (req.user) {
            (0, logging_1.logMessage)(logging_1.LogLevel.INFO, 'user_action', `Usuario ${req.user.email} realizó acción: ${action}`, {
                userId: req.user.id,
                userRole: req.user.role,
                action,
                endpoint: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        }
        next();
    };
};
const rateLimitByUserId = (maxRequests, windowMinutes) => {
    return (req, res, next) => {
        next();
    };
};
router.post('/files', auth_1.authenticateToken, rateLimitByUserId(100, 60), upload.array('files', 20), validateRequest, auditLog('upload.files.create'), async (req, res, next) => {
    try {
        const files = req.files;
        const userId = req.user?.id;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron archivos para subir'
            });
        }
        const uploadedFiles = [];
        for (const file of files) {
            const fileData = {
                originalName: file.originalname,
                filename: `${(0, uuid_1.v4)()}_${file.originalname}`,
                mimetype: file.mimetype,
                size: file.size,
                uploadedBy: userId || 'anonymous',
                uploadedAt: new Date(),
                category: req.body.category,
                description: req.body.description,
                isPublic: req.body.isPublic === 'true'
            };
            uploadedFiles.push(fileData);
        }
        res.status(201).json({
            success: true,
            data: uploadedFiles,
            message: `${files.length} archivo(s) subido(s) exitosamente`
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/files', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, fileType = 'all', search } = req.query;
        const userId = req.user?.id;
        const files = {
            records: [],
            pagination: {
                currentPage: parseInt(page),
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: parseInt(limit)
            }
        };
        res.json({
            success: true,
            data: files,
            message: 'Archivos obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/files/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const file = {
            id: id,
            originalName: 'ejemplo.pdf',
            mimetype: 'application/pdf',
            size: 1024000,
            uploadedAt: new Date(),
            uploadedBy: userId
        };
        res.json({
            success: true,
            data: file,
            message: 'Archivo encontrado'
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/files/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.OWNER), auditLog('upload.file.delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const deleted = true;
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
    }
    catch (error) {
        next(error);
    }
});
router.post('/bovines/:bovineId/documents', auth_1.authenticateToken, upload.array('documents', 10), auditLog('upload.bovine_documents.create'), async (req, res, next) => {
    try {
        const { bovineId } = req.params;
        const documents = req.files;
        const userId = req.user?.id;
        if (!documents || documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron documentos para subir'
            });
        }
        const uploadedDocuments = documents.map((doc) => ({
            id: (0, uuid_1.v4)(),
            bovineId: bovineId,
            originalName: doc.originalname,
            mimetype: doc.mimetype,
            size: doc.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
            documentType: req.body.documentType
        }));
        res.status(201).json({
            success: true,
            data: uploadedDocuments,
            message: 'Documentos del bovino subidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/bovines/:bovineId/documents', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { bovineId } = req.params;
        const { documentType } = req.query;
        const documents = [];
        res.json({
            success: true,
            data: documents,
            message: 'Documentos del bovino obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/bovines/:bovineId/photos', auth_1.authenticateToken, upload.array('photos', 20), auditLog('upload.bovine_photos.create'), async (req, res, next) => {
    try {
        const { bovineId } = req.params;
        const photos = req.files;
        const userId = req.user?.id;
        if (!photos || photos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron fotos para subir'
            });
        }
        const uploadedPhotos = photos.map((photo) => ({
            id: (0, uuid_1.v4)(),
            bovineId: bovineId,
            originalName: photo.originalname,
            mimetype: photo.mimetype,
            size: photo.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
            photoType: req.body.photoType,
            isProfilePhoto: req.body.isProfilePhoto === 'true'
        }));
        res.status(201).json({
            success: true,
            data: uploadedPhotos,
            message: 'Fotos del bovino subidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/bovines/:bovineId/photos', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { bovineId } = req.params;
        const { photoType } = req.query;
        const photos = [];
        res.json({
            success: true,
            data: photos,
            message: 'Fotos del bovino obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/ranch/documents', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.OWNER), upload.array('documents', 10), auditLog('upload.ranch_documents.create'), async (req, res, next) => {
    try {
        const documents = req.files;
        const userId = req.user?.id;
        if (!documents || documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron documentos para subir'
            });
        }
        const uploadedDocuments = documents.map((doc) => ({
            id: (0, uuid_1.v4)(),
            originalName: doc.originalname,
            mimetype: doc.mimetype,
            size: doc.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
            documentType: req.body.documentType,
            issuer: req.body.issuer
        }));
        res.status(201).json({
            success: true,
            data: uploadedDocuments,
            message: 'Documentos del rancho subidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/ranch/photos', auth_1.authenticateToken, upload.array('photos', 50), auditLog('upload.ranch_photos.create'), async (req, res, next) => {
    try {
        const photos = req.files;
        const userId = req.user?.id;
        if (!photos || photos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron fotos para subir'
            });
        }
        const uploadedPhotos = photos.map((photo) => ({
            id: (0, uuid_1.v4)(),
            originalName: photo.originalname,
            mimetype: photo.mimetype,
            size: photo.size,
            uploadedBy: userId,
            uploadedAt: new Date(),
            photoCategory: req.body.photoCategory,
            isMainPhoto: req.body.isMainPhoto === 'true'
        }));
        res.status(201).json({
            success: true,
            data: uploadedPhotos,
            message: 'Fotos del rancho subidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/storage/stats', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const storageStats = {
            totalFiles: 0,
            totalSize: 0,
            usedSpace: '0 MB',
            availableSpace: '1 GB',
            filesByType: {
                images: 0,
                documents: 0,
                videos: 0
            }
        };
        res.json({
            success: true,
            data: storageStats,
            message: 'Estadísticas de almacenamiento obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/cleanup', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN), auditLog('upload.cleanup'), async (req, res, next) => {
    try {
        const { olderThan = 30, includeDeleted = true, dryRun = false } = req.body;
        const cleanupResult = {
            filesFound: 0,
            filesDeleted: 0,
            spaceFreed: '0 MB',
            dryRun: dryRun
        };
        res.json({
            success: true,
            data: cleanupResult,
            message: dryRun ? 'Simulación de limpieza completada' : 'Limpieza completada exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        let message = 'Error en la subida de archivo';
        let code = 'UPLOAD_ERROR';
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'El archivo excede el tamaño máximo permitido (50MB)';
                code = 'FILE_TOO_LARGE';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Demasiados archivos enviados';
                code = 'TOO_MANY_FILES';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Campo de archivo inesperado';
                code = 'UNEXPECTED_FILE';
                break;
            default:
                message = `Error en la subida: ${error.message}`;
        }
        (0, logging_1.logMessage)(logging_1.LogLevel.WARN, 'upload_error', message, {
            userId: req.user?.id,
            errorCode: error.code,
            path: req.originalUrl
        });
        return res.status(400).json({
            success: false,
            error: {
                code: code,
                message: message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }
    if (error.message && error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }
    (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'upload_route_error', `Error en ruta de upload: ${error.message}`, {
        path: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
        error: error.stack
    });
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'Error interno del servidor',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    });
});
exports.default = router;
//# sourceMappingURL=upload.js.map