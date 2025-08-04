"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldFiles = exports.getFileInfo = exports.deleteFile = exports.handleUploadErrors = exports.processUploadedFiles = exports.createUploadMiddleware = exports.FileCategory = void 0;
const multer_1 = __importStar(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("./auth");
const logging_1 = require("./logging");
var FileCategory;
(function (FileCategory) {
    FileCategory["CATTLE_PHOTOS"] = "cattle_photos";
    FileCategory["VETERINARY_DOCS"] = "veterinary_docs";
    FileCategory["VACCINATION_RECORDS"] = "vaccination_records";
    FileCategory["HEALTH_REPORTS"] = "health_reports";
    FileCategory["BREEDING_DOCS"] = "breeding_docs";
    FileCategory["PRODUCTION_DATA"] = "production_data";
    FileCategory["FEED_REPORTS"] = "feed_reports";
    FileCategory["FINANCIAL_DOCS"] = "financial_docs";
    FileCategory["GENERAL_DOCS"] = "general_docs";
    FileCategory["SYSTEM_BACKUPS"] = "system_backups";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
const FILE_CONFIGS = {
    [FileCategory.CATTLE_PHOTOS]: {
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
        maxSize: 10 * 1024 * 1024,
        maxFiles: 10,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: false
    },
    [FileCategory.VETERINARY_DOCS]: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
        maxSize: 25 * 1024 * 1024,
        maxFiles: 5,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    },
    [FileCategory.VACCINATION_RECORDS]: {
        allowedTypes: ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        allowedExtensions: ['.pdf', '.csv', '.xls', '.xlsx'],
        maxSize: 15 * 1024 * 1024,
        maxFiles: 3,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    },
    [FileCategory.HEALTH_REPORTS]: {
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowedExtensions: ['.pdf', '.doc', '.docx'],
        maxSize: 20 * 1024 * 1024,
        maxFiles: 5,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    },
    [FileCategory.BREEDING_DOCS]: {
        allowedTypes: ['application/pdf', 'text/csv', 'image/jpeg', 'image/png'],
        allowedExtensions: ['.pdf', '.csv', '.jpg', '.jpeg', '.png'],
        maxSize: 15 * 1024 * 1024,
        maxFiles: 8,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: false
    },
    [FileCategory.PRODUCTION_DATA]: {
        allowedTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'],
        allowedExtensions: ['.csv', '.xls', '.xlsx', '.json'],
        maxSize: 50 * 1024 * 1024,
        maxFiles: 1,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.WORKER, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    },
    [FileCategory.FEED_REPORTS]: {
        allowedTypes: ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        allowedExtensions: ['.pdf', '.csv', '.xlsx'],
        maxSize: 10 * 1024 * 1024,
        maxFiles: 3,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.WORKER, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: false
    },
    [FileCategory.FINANCIAL_DOCS]: {
        allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        allowedExtensions: ['.pdf', '.xlsx'],
        maxSize: 30 * 1024 * 1024,
        maxFiles: 2,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    },
    [FileCategory.GENERAL_DOCS]: {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
        maxSize: 20 * 1024 * 1024,
        maxFiles: 5,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: false
    },
    [FileCategory.SYSTEM_BACKUPS]: {
        allowedTypes: ['application/zip', 'application/x-gzip', 'application/x-tar'],
        allowedExtensions: ['.zip', '.gz', '.tar', '.tar.gz'],
        maxSize: 500 * 1024 * 1024,
        maxFiles: 1,
        requiresAuth: true,
        allowedRoles: [auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER],
        virusScanRequired: true
    }
};
function generateUniqueFileName(originalName, category, userId) {
    const timestamp = Date.now();
    const randomString = crypto_1.default.randomBytes(8).toString('hex');
    const extension = path_1.default.extname(originalName).toLowerCase();
    const sanitizedName = path_1.default.basename(originalName, extension).replace(/[^a-zA-Z0-9-_]/g, '');
    return `${category}_${userId}_${timestamp}_${randomString}_${sanitizedName}${extension}`;
}
async function calculateChecksums(filePath) {
    return new Promise((resolve, reject) => {
        const md5Hash = crypto_1.default.createHash('md5');
        const sha256Hash = crypto_1.default.createHash('sha256');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', (data) => {
            md5Hash.update(data);
            sha256Hash.update(data);
        });
        stream.on('end', () => {
            resolve({
                md5: md5Hash.digest('hex'),
                sha256: sha256Hash.digest('hex')
            });
        });
        stream.on('error', reject);
    });
}
async function scanForVirus(filePath) {
    try {
        const suspiciousPatterns = ['virus', 'malware', 'trojan', 'backdoor'];
        const fileName = path_1.default.basename(filePath).toLowerCase();
        for (const pattern of suspiciousPatterns) {
            if (fileName.includes(pattern)) {
                return 'infected';
            }
        }
        return 'clean';
    }
    catch (error) {
        (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'virus_scan_error', `Error en escaneo de virus: ${error}`, { filePath });
        return 'error';
    }
}
function ensureDirectoryExists(dirPath) {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
}
const createStorage = (category) => {
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path_1.default.join(process.cwd(), 'uploads', category);
            ensureDirectoryExists(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const userId = req.userId || 'anonymous';
            const uniqueName = generateUniqueFileName(file.originalname, category, userId);
            cb(null, uniqueName);
        }
    });
};
const createFileFilter = (category) => {
    return (req, file, cb) => {
        const config = FILE_CONFIGS[category];
        if (config.requiresAuth && !req.user) {
            return cb(new Error('Autenticación requerida para subir archivos'));
        }
        if (req.userRole && !config.allowedRoles.includes(req.userRole)) {
            return cb(new Error(`Rol ${req.userRole} no autorizado para subir ${category}`));
        }
        if (!config.allowedTypes.includes(file.mimetype)) {
            return cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${config.allowedTypes.join(', ')}`));
        }
        const extension = path_1.default.extname(file.originalname).toLowerCase();
        if (!config.allowedExtensions.includes(extension)) {
            return cb(new Error(`Extensión no permitida: ${extension}. Extensiones permitidas: ${config.allowedExtensions.join(', ')}`));
        }
        cb(null, true);
    };
};
const createUploadMiddleware = (category) => {
    const config = FILE_CONFIGS[category];
    const upload = (0, multer_1.default)({
        storage: createStorage(category),
        fileFilter: createFileFilter(category),
        limits: {
            fileSize: config.maxSize,
            files: config.maxFiles
        }
    });
    return {
        single: (fieldName) => upload.single(fieldName),
        multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount || config.maxFiles),
        fields: (fields) => upload.fields(fields)
    };
};
exports.createUploadMiddleware = createUploadMiddleware;
const processUploadedFiles = (category) => {
    return async (req, res, next) => {
        try {
            const files = req.files || (req.file ? [req.file] : []);
            const config = FILE_CONFIGS[category];
            if (files.length === 0) {
                return next();
            }
            const processedFiles = [];
            for (const file of files) {
                try {
                    const checksums = await calculateChecksums(file.path);
                    let virusScanStatus = 'pending';
                    if (config.virusScanRequired) {
                        virusScanStatus = await scanForVirus(file.path);
                        if (virusScanStatus === 'infected') {
                            fs_1.default.unlinkSync(file.path);
                            (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'virus_detected', `Archivo infectado detectado y eliminado: ${file.originalname}`, {
                                userId: req.userId,
                                userEmail: req.user?.email,
                                filename: file.filename,
                                originalName: file.originalname,
                                category: category
                            });
                            return next(new Error(`Archivo infectado detectado: ${file.originalname}`));
                        }
                    }
                    else {
                        virusScanStatus = 'clean';
                    }
                    const metadata = {
                        originalName: file.originalname,
                        filename: file.filename,
                        mimetype: file.mimetype,
                        size: file.size,
                        category: category,
                        uploadedBy: req.userId || 'anonymous',
                        uploadedAt: new Date(),
                        cattleId: req.body.cattleId,
                        cattleEarTag: req.body.cattleEarTag,
                        description: req.body.description,
                        isPublic: req.body.isPublic === 'true',
                        checksumMD5: checksums.md5,
                        checksumSHA256: checksums.sha256,
                        virusScanStatus: virusScanStatus,
                        virusScanDate: config.virusScanRequired ? new Date() : undefined
                    };
                    const cattleFile = {
                        ...file,
                        category: category,
                        metadata: metadata
                    };
                    processedFiles.push(cattleFile);
                    (0, logging_1.logCattleEvent)(logging_1.CattleEventType.DATA_IMPORTED, `Archivo ${category} subido: ${file.originalname}`, req, {
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimetype: file.mimetype,
                        category: category,
                        cattleEarTag: req.body.cattleEarTag
                    });
                }
                catch (fileError) {
                    if (fs_1.default.existsSync(file.path)) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'file_processing_error', `Error procesando archivo ${file.originalname}: ${fileError}`, {
                        userId: req.userId,
                        filename: file.filename,
                        category: category,
                        error: fileError instanceof Error ? fileError.stack : fileError
                    });
                    return next(new Error(`Error procesando archivo ${file.originalname}: ${fileError instanceof Error ? fileError.message : fileError}`));
                }
            }
            req.processedFiles = processedFiles;
            next();
        }
        catch (error) {
            (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'upload_processing_error', `Error en post-procesamiento de uploads: ${error}`, {
                userId: req.userId,
                category: category,
                error: error instanceof Error ? error.stack : error
            });
            next(error);
        }
    };
};
exports.processUploadedFiles = processUploadedFiles;
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer_1.MulterError) {
        let message = 'Error en la carga de archivo';
        let code = 'UPLOAD_ERROR';
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'Archivo demasiado grande';
                code = 'FILE_TOO_LARGE';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Demasiados archivos';
                code = 'TOO_MANY_FILES';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Campo de archivo inesperado';
                code = 'UNEXPECTED_FILE_FIELD';
                break;
            case 'LIMIT_PART_COUNT':
                message = 'Demasiadas partes en el formulario';
                code = 'TOO_MANY_PARTS';
                break;
        }
        (0, logging_1.logMessage)(logging_1.LogLevel.WARN, 'upload_error', `Error de upload: ${message}`, {
            userId: req.userId,
            userEmail: req.user?.email,
            errorCode: error.code,
            path: req.originalUrl
        });
        res.status(400).json({
            success: false,
            error: {
                code: code,
                message: message,
                details: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
        return;
    }
    if (error.message) {
        (0, logging_1.logMessage)(logging_1.LogLevel.WARN, 'file_validation_error', `Error de validación de archivo: ${error.message}`, {
            userId: req.userId,
            userEmail: req.user?.email,
            path: req.originalUrl
        });
        res.status(400).json({
            success: false,
            error: {
                code: 'FILE_VALIDATION_ERROR',
                message: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
        return;
    }
    next(error);
};
exports.handleUploadErrors = handleUploadErrors;
const deleteFile = async (filename, category) => {
    try {
        const filePath = path_1.default.join(process.cwd(), 'uploads', category, filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            (0, logging_1.logMessage)(logging_1.LogLevel.INFO, 'file_deleted', `Archivo eliminado: ${filename}`, { filename, category, filePath });
            return true;
        }
        return false;
    }
    catch (error) {
        (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'file_deletion_error', `Error eliminando archivo ${filename}: ${error}`, { filename, category, error: error instanceof Error ? error.stack : error });
        return false;
    }
};
exports.deleteFile = deleteFile;
const getFileInfo = (filename, category) => {
    try {
        const filePath = path_1.default.join(process.cwd(), 'uploads', category, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return null;
        }
        const stats = fs_1.default.statSync(filePath);
        return {
            originalName: filename,
            filename: filename,
            mimetype: 'application/octet-stream',
            size: stats.size,
            category: category,
            uploadedBy: 'unknown',
            uploadedAt: stats.birthtime,
            isPublic: false,
            checksumMD5: 'unknown',
            checksumSHA256: 'unknown',
            virusScanStatus: 'pending'
        };
    }
    catch (error) {
        (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'file_info_error', `Error obteniendo información de archivo ${filename}: ${error}`, { filename, category });
        return null;
    }
};
exports.getFileInfo = getFileInfo;
const cleanupOldFiles = (category, daysOld = 30) => {
    try {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads', category);
        if (!fs_1.default.existsSync(uploadDir)) {
            return 0;
        }
        const files = fs_1.default.readdirSync(uploadDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        let deletedCount = 0;
        for (const file of files) {
            const filePath = path_1.default.join(uploadDir, file);
            const stats = fs_1.default.statSync(filePath);
            if (stats.birthtime < cutoffDate) {
                fs_1.default.unlinkSync(filePath);
                deletedCount++;
            }
        }
        (0, logging_1.logMessage)(logging_1.LogLevel.INFO, 'file_cleanup', `Limpieza de archivos completada: ${deletedCount} archivos eliminados`, { category, daysOld, deletedCount });
        return deletedCount;
    }
    catch (error) {
        (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'file_cleanup_error', `Error en limpieza de archivos: ${error}`, { category, daysOld });
        return 0;
    }
};
exports.cleanupOldFiles = cleanupOldFiles;
//# sourceMappingURL=upload.js.map