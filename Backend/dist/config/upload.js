"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadConfigs = exports.uploadErrorHandler = exports.getStorageStats = exports.getFileUrl = exports.deleteFile = exports.validateFile = exports.getUploadConfig = exports.createThumbnails = exports.processImage = exports.createUploadMiddleware = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let multer;
let sharp;
try {
    multer = require('multer');
    sharp = require('sharp');
}
catch (error) {
    console.warn('⚠️  Dependencias de upload no instaladas aún. Ejecuta: npm install multer sharp @types/multer');
}
const fileTypeConfigs = {
    cattle_images: {
        maxFileSize: 10 * 1024 * 1024,
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif'
        ],
        uploadPath: 'uploads/cattle/images',
        maxFiles: 10
    },
    veterinary_docs: {
        maxFileSize: 25 * 1024 * 1024,
        allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        uploadPath: 'uploads/veterinary/documents',
        maxFiles: 5
    },
    reports: {
        maxFileSize: 50 * 1024 * 1024,
        allowedMimeTypes: [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/json'
        ],
        uploadPath: 'uploads/reports',
        maxFiles: 3
    },
    data_import: {
        maxFileSize: 100 * 1024 * 1024,
        allowedMimeTypes: [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'text/plain'
        ],
        uploadPath: 'uploads/imports',
        maxFiles: 1
    },
    location_images: {
        maxFileSize: 15 * 1024 * 1024,
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ],
        uploadPath: 'uploads/locations/images',
        maxFiles: 8
    },
    legal_docs: {
        maxFileSize: 30 * 1024 * 1024,
        allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ],
        uploadPath: 'uploads/legal/documents',
        maxFiles: 5
    },
    user_avatars: {
        maxFileSize: 5 * 1024 * 1024,
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ],
        uploadPath: 'uploads/users/avatars',
        maxFiles: 1
    }
};
const ensureUploadDirectory = (uploadPath) => {
    try {
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
            console.log(`📁 Directorio de subida creado: ${uploadPath}`);
        }
    }
    catch (error) {
        console.error(`❌ Error creando directorio ${uploadPath}:`, error);
    }
};
const generateUniqueFilename = (originalName, uploadType) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path_1.default.extname(originalName).toLowerCase();
    const baseName = path_1.default.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    return `${uploadType}_${timestamp}_${randomString}_${baseName}${extension}`;
};
const createStorageConfig = (uploadType) => {
    if (!multer) {
        throw new Error('Multer not available');
    }
    const config = fileTypeConfigs[uploadType];
    if (!config) {
        throw new Error(`Configuración no encontrada para tipo: ${uploadType}`);
    }
    return multer.diskStorage({
        destination: (req, file, cb) => {
            ensureUploadDirectory(config.uploadPath);
            cb(null, config.uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = generateUniqueFilename(file.originalname, uploadType);
            cb(null, uniqueName);
        }
    });
};
const createFileFilter = (uploadType) => {
    const config = fileTypeConfigs[uploadType];
    return (req, file, cb) => {
        if (config.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${config.allowedMimeTypes.join(', ')}`);
            error.name = 'INVALID_FILE_TYPE';
            cb(error, false);
        }
    };
};
const createUploadMiddleware = (uploadType, fieldName = 'file', multiple = false) => {
    if (!multer) {
        return (req, res, next) => {
            console.warn('⚠️  Upload middleware not available - dependencies not installed');
            next();
        };
    }
    const config = fileTypeConfigs[uploadType];
    if (!config) {
        throw new Error(`Configuración no encontrada para tipo: ${uploadType}`);
    }
    const upload = multer({
        storage: createStorageConfig(uploadType),
        fileFilter: createFileFilter(uploadType),
        limits: {
            fileSize: config.maxFileSize,
            files: config.maxFiles
        }
    });
    return multiple ? upload.array(fieldName, config.maxFiles) : upload.single(fieldName);
};
exports.createUploadMiddleware = createUploadMiddleware;
const processImage = async (filePath, options = {}) => {
    if (!sharp) {
        console.warn('⚠️  Sharp not available - returning original file');
        return filePath;
    }
    try {
        const { width = 1920, height = 1080, quality = 85, format = 'jpeg', resize = true } = options;
        const parsedPath = path_1.default.parse(filePath);
        const outputPath = path_1.default.join(parsedPath.dir, `${parsedPath.name}_processed.${format}`);
        let sharpInstance = sharp(filePath);
        if (resize) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        switch (format) {
            case 'jpeg':
                sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ quality, progressive: true });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality });
                break;
        }
        await sharpInstance.toFile(outputPath);
        fs_1.default.unlinkSync(filePath);
        console.log(`✅ Imagen procesada: ${outputPath}`);
        return outputPath;
    }
    catch (error) {
        console.error('❌ Error procesando imagen:', error);
        return filePath;
    }
};
exports.processImage = processImage;
const createThumbnails = async (filePath, sizes = [150, 300, 600]) => {
    if (!sharp) {
        console.warn('⚠️  Sharp not available - cannot create thumbnails');
        return [];
    }
    const thumbnails = [];
    const parsedPath = path_1.default.parse(filePath);
    try {
        for (const size of sizes) {
            const thumbnailPath = path_1.default.join(parsedPath.dir, `${parsedPath.name}_thumb_${size}x${size}.jpeg`);
            await sharp(filePath)
                .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            thumbnails.push(thumbnailPath);
        }
        console.log(`✅ Thumbnails creados: ${thumbnails.length}`);
        return thumbnails;
    }
    catch (error) {
        console.error('❌ Error creando thumbnails:', error);
        return [];
    }
};
exports.createThumbnails = createThumbnails;
const getUploadConfig = (uploadType) => {
    const config = fileTypeConfigs[uploadType];
    if (!config) {
        throw new Error(`Configuración no encontrada para tipo: ${uploadType}`);
    }
    return config;
};
exports.getUploadConfig = getUploadConfig;
const validateFile = (file, uploadType) => {
    const config = fileTypeConfigs[uploadType];
    const errors = [];
    if (!config) {
        errors.push(`Tipo de subida no válido: ${uploadType}`);
        return { isValid: false, errors };
    }
    if (file.size > config.maxFileSize) {
        errors.push(`Archivo demasiado grande. Máximo: ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
        errors.push(`Tipo de archivo no permitido: ${file.mimetype}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateFile = validateFile;
const deleteFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            console.log(`🗑️  Archivo eliminado: ${filePath}`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`❌ Error eliminando archivo ${filePath}:`, error);
        return false;
    }
};
exports.deleteFile = deleteFile;
const getFileUrl = (filePath) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const relativePath = filePath.replace(/^uploads\//, '');
    return `${baseUrl}/uploads/${relativePath}`;
};
exports.getFileUrl = getFileUrl;
const getStorageStats = () => {
    const stats = {
        totalSize: 0,
        fileCount: 0,
        byType: {}
    };
    try {
        Object.keys(fileTypeConfigs).forEach(uploadType => {
            const config = fileTypeConfigs[uploadType];
            const uploadPath = config.uploadPath;
            if (fs_1.default.existsSync(uploadPath)) {
                const files = fs_1.default.readdirSync(uploadPath);
                let typeSize = 0;
                let typeCount = 0;
                files.forEach(file => {
                    const filePath = path_1.default.join(uploadPath, file);
                    const fileStat = fs_1.default.statSync(filePath);
                    if (fileStat.isFile()) {
                        typeSize += fileStat.size;
                        typeCount++;
                    }
                });
                stats.byType[uploadType] = { size: typeSize, count: typeCount };
                stats.totalSize += typeSize;
                stats.fileCount += typeCount;
            }
        });
    }
    catch (error) {
        console.error('❌ Error obteniendo estadísticas de almacenamiento:', error);
    }
    return stats;
};
exports.getStorageStats = getStorageStats;
const uploadErrorHandler = (error, req, res, next) => {
    if (error instanceof multer?.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    error: 'Archivo demasiado grande',
                    message: 'El tamaño del archivo excede el límite permitido'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    error: 'Demasiados archivos',
                    message: 'Se excedió el número máximo de archivos permitidos'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    error: 'Campo de archivo inesperado',
                    message: 'El campo de archivo no es válido'
                });
            default:
                return res.status(400).json({
                    error: 'Error de subida',
                    message: error.message
                });
        }
    }
    if (error.name === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            error: 'Tipo de archivo no válido',
            message: error.message
        });
    }
    next(error);
};
exports.uploadErrorHandler = uploadErrorHandler;
exports.uploadConfigs = fileTypeConfigs;
//# sourceMappingURL=upload.js.map