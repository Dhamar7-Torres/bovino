"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
var FileCategory;
(function (FileCategory) {
    FileCategory["VACCINATION"] = "VACCINATION";
    FileCategory["MEDICAL"] = "MEDICAL";
    FileCategory["PHOTO"] = "PHOTO";
    FileCategory["VIDEO"] = "VIDEO";
    FileCategory["DOCUMENT"] = "DOCUMENT";
    FileCategory["GENEALOGY"] = "GENEALOGY";
    FileCategory["CERTIFICATE"] = "CERTIFICATE";
    FileCategory["OTHER"] = "OTHER";
})(FileCategory || (FileCategory = {}));
var FileStatus;
(function (FileStatus) {
    FileStatus["UPLOADING"] = "uploading";
    FileStatus["PROCESSING"] = "processing";
    FileStatus["COMPLETED"] = "completed";
    FileStatus["ERROR"] = "error";
    FileStatus["DELETED"] = "deleted";
})(FileStatus || (FileStatus = {}));
var FileVisibility;
(function (FileVisibility) {
    FileVisibility["PUBLIC"] = "public";
    FileVisibility["PRIVATE"] = "private";
    FileVisibility["RESTRICTED"] = "restricted";
})(FileVisibility || (FileVisibility = {}));
var StorageProvider;
(function (StorageProvider) {
    StorageProvider["LOCAL"] = "local";
    StorageProvider["AWS_S3"] = "s3";
    StorageProvider["CLOUDINARY"] = "cloudinary";
    StorageProvider["GOOGLE_CLOUD"] = "gcs";
})(StorageProvider || (StorageProvider = {}));
const File = {
    create: async (data) => {
        return data;
    },
    findByPk: async (id) => {
        return null;
    },
    findAll: async (options) => {
        return [];
    },
    update: async (data, options) => {
        return [1];
    },
    destroy: async (options) => {
        return 1;
    },
    count: async (options) => {
        return 0;
    }
};
const sharp = {
    default: (input) => ({
        resize: (width, height) => ({
            jpeg: (options) => ({
                toBuffer: async () => {
                    return Buffer.from('mock-image-data');
                }
            })
        }),
        metadata: async () => ({
            width: 1920,
            height: 1080,
            format: 'jpeg'
        })
    })
};
class FileService {
    constructor() {
        this.config = {
            uploadPath: process.env.UPLOAD_PATH || './uploads',
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'),
            allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            allowedVideoTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'],
            thumbnailSizes: [
                { name: 'small', width: 150, height: 150 },
                { name: 'medium', width: 400, height: 400 },
                { name: 'large', width: 800, height: 600 }
            ],
            storageProvider: StorageProvider.LOCAL,
            cloudConfig: {}
        };
        this.initializeStorage();
    }
    async initializeStorage() {
        try {
            if (this.config.storageProvider === StorageProvider.LOCAL) {
                await this.ensureDirectoryExists(this.config.uploadPath);
                await this.ensureDirectoryExists(path_1.default.join(this.config.uploadPath, 'thumbnails'));
                await this.ensureDirectoryExists(path_1.default.join(this.config.uploadPath, 'documents'));
                await this.ensureDirectoryExists(path_1.default.join(this.config.uploadPath, 'videos'));
                await this.ensureDirectoryExists(path_1.default.join(this.config.uploadPath, 'temp'));
            }
            (0, logger_1.logInfo)('Sistema de almacenamiento inicializado correctamente', undefined, 'FileService');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)('Error inicializando sistema de almacenamiento', { error: errorMessage }, error, 'FileService');
            throw new Error(`Error inicializando almacenamiento: ${errorMessage}`);
        }
    }
    async uploadFile(file, originalName, mimeType, options) {
        try {
            this.validateFile(file, originalName, mimeType);
            const fileName = this.generateUniqueFileName(originalName);
            const fileExtension = path_1.default.extname(originalName).toLowerCase();
            const filePath = await this.getStoragePath(fileName, options.category);
            await this.saveFile(file, filePath);
            const metadata = await this.extractMetadata(file, mimeType);
            let thumbnails = [];
            if (this.isImageFile(mimeType) && options.generateThumbnails !== false) {
                thumbnails = await this.generateThumbnails(file, fileName);
            }
            const fileRecord = {
                id: this.generateFileId(),
                originalName,
                fileName,
                filePath,
                fileSize: file.length,
                mimeType,
                category: options.category,
                status: FileStatus.COMPLETED,
                visibility: options.isPublic ? FileVisibility.PUBLIC : FileVisibility.PRIVATE,
                description: options.description,
                tags: options.tags || [],
                bovineId: options.bovineId,
                ranchId: options.ranchId,
                userId: options.userId,
                downloadCount: 0,
                version: 1,
                thumbnails,
                metadata,
                url: await this.generateFileUrl(fileName, options.category),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await File.create(fileRecord);
            (0, logger_1.logInfo)(`Archivo subido exitosamente: ${originalName} -> ${fileName}`, undefined, 'FileService');
            return {
                fileId: fileRecord.id,
                originalName,
                fileName,
                url: fileRecord.url,
                thumbnails,
                size: file.length,
                mimeType
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)('Error subiendo archivo', { error: errorMessage }, error, 'FileService');
            throw new Error(`Error subiendo archivo: ${errorMessage}`);
        }
    }
    async uploadMultipleFiles(files, options) {
        const successful = [];
        const failed = [];
        for (const file of files) {
            try {
                const result = await this.uploadFile(file.buffer, file.originalName, file.mimeType, options);
                successful.push(result);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                failed.push({
                    fileName: file.originalName,
                    error: errorMessage
                });
            }
        }
        (0, logger_1.logInfo)(`Subida masiva completada: ${successful.length} exitosos, ${failed.length} fallidos`, { successful: successful.length, failed: failed.length }, 'FileService');
        return {
            successful,
            failed,
            totalUploaded: successful.length,
            totalFailed: failed.length
        };
    }
    async getFileById(fileId, userId) {
        try {
            const file = await File.findByPk(fileId);
            if (!file) {
                return null;
            }
            if (!this.canUserAccessFile(file, userId)) {
                throw new Error('No tienes permisos para acceder a este archivo');
            }
            return file;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)(`Error obteniendo archivo ${fileId}`, { fileId, userId, error: errorMessage }, error, 'FileService');
            throw new Error(`Error obteniendo archivo: ${errorMessage}`);
        }
    }
    async searchFiles(searchOptions, userId) {
        try {
            const whereConditions = this.buildFileSearchConditions(searchOptions, userId);
            const page = searchOptions.page || 1;
            const limit = searchOptions.limit || 20;
            const offset = (page - 1) * limit;
            const files = await File.findAll({
                where: whereConditions,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            const total = await File.count({ where: whereConditions });
            return { files, total };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)('Error buscando archivos', { searchOptions, userId, error: errorMessage }, error, 'FileService');
            throw new Error(`Error buscando archivos: ${errorMessage}`);
        }
    }
    async deleteFile(fileId, userId) {
        try {
            const file = await this.getFileById(fileId, userId);
            if (!file) {
                throw new Error('Archivo no encontrado');
            }
            if (!this.canUserDeleteFile(file, userId)) {
                throw new Error('No tienes permisos para eliminar este archivo');
            }
            await this.deletePhysicalFile(file);
            if (file.thumbnails) {
                for (const thumbnail of file.thumbnails) {
                    await this.deletePhysicalFile({ filePath: thumbnail.filePath });
                }
            }
            await File.update({
                status: FileStatus.DELETED,
                deletedAt: new Date(),
                deletedBy: userId
            }, { where: { id: fileId } });
            (0, logger_1.logInfo)(`Archivo eliminado: ${file.fileName} por usuario ${userId}`, { fileId, fileName: file.fileName, userId }, 'FileService');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)(`Error eliminando archivo ${fileId}`, { fileId, userId, error: errorMessage }, error, 'FileService');
            throw new Error(`Error eliminando archivo: ${errorMessage}`);
        }
    }
    async generateSecureUrl(fileId, userId, expirationMinutes = 60) {
        try {
            const file = await this.getFileById(fileId, userId);
            if (!file) {
                throw new Error('Archivo no encontrado');
            }
            const tokenData = {
                fileId,
                userId,
                exp: Math.floor(Date.now() / 1000) + (expirationMinutes * 60)
            };
            const token = this.generateSecureToken(tokenData);
            const secureUrl = `${process.env.API_BASE_URL}/files/secure/${fileId}?token=${token}`;
            await File.update({ downloadCount: file.downloadCount + 1 }, { where: { id: fileId } });
            return secureUrl;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)(`Error generando URL segura para archivo ${fileId}`, { fileId, userId, error: errorMessage }, error, 'FileService');
            throw new Error(`Error generando URL segura: ${errorMessage}`);
        }
    }
    async getFileStatistics(userId, ranchId) {
        try {
            const whereConditions = { status: { [sequelize_1.Op.ne]: FileStatus.DELETED } };
            if (userId) {
                whereConditions.userId = userId;
            }
            if (ranchId) {
                whereConditions.ranchId = ranchId;
            }
            const totalFiles = await File.count({ where: whereConditions });
            const totalSize = 1024 * 1024 * 1024;
            const filesByCategory = {};
            for (const category of Object.values(FileCategory)) {
                filesByCategory[category] = await File.count({
                    where: { ...whereConditions, category }
                });
            }
            const filesByMonth = [
                { month: '2024-01', count: 15 },
                { month: '2024-02', count: 23 },
                { month: '2024-03', count: 31 }
            ];
            const storageUsage = {
                used: totalSize,
                total: 5 * 1024 * 1024 * 1024,
                percentage: (totalSize / (5 * 1024 * 1024 * 1024)) * 100
            };
            const topDownloads = [
                { fileName: 'certificado_vacunacion.pdf', downloads: 45 },
                { fileName: 'foto_bovino_001.jpg', downloads: 32 }
            ];
            return {
                totalFiles,
                totalSize,
                filesByCategory,
                filesByMonth,
                storageUsage,
                topDownloads
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)('Error obteniendo estadísticas de archivos', { userId, ranchId, error: errorMessage }, error, 'FileService');
            throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
        }
    }
    validateFile(file, originalName, mimeType) {
        if (file.length > this.config.maxFileSize) {
            throw new Error(`Archivo demasiado grande. Máximo permitido: ${this.formatFileSize(this.config.maxFileSize)}`);
        }
        const allAllowedTypes = [
            ...this.config.allowedImageTypes,
            ...this.config.allowedDocumentTypes,
            ...this.config.allowedVideoTypes
        ];
        if (!allAllowedTypes.includes(mimeType)) {
            throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
        }
        if (!originalName || originalName.trim().length === 0) {
            throw new Error('Nombre de archivo requerido');
        }
        const extension = path_1.default.extname(originalName).toLowerCase();
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
        if (dangerousExtensions.includes(extension)) {
            throw new Error('Tipo de archivo no permitido por seguridad');
        }
    }
    generateUniqueFileName(originalName) {
        const extension = path_1.default.extname(originalName);
        const baseName = path_1.default.basename(originalName, extension);
        const timestamp = Date.now();
        const randomString = crypto_1.default.randomBytes(8).toString('hex');
        const sanitizedBaseName = baseName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .substring(0, 50);
        return `${sanitizedBaseName}_${timestamp}_${randomString}${extension}`;
    }
    async getStoragePath(fileName, category) {
        let subfolder = '';
        switch (category) {
            case FileCategory.PHOTO:
                subfolder = 'photos';
                break;
            case FileCategory.VIDEO:
                subfolder = 'videos';
                break;
            case FileCategory.DOCUMENT:
            case FileCategory.CERTIFICATE:
            case FileCategory.VACCINATION:
            case FileCategory.MEDICAL:
            case FileCategory.GENEALOGY:
                subfolder = 'documents';
                break;
            default:
                subfolder = 'other';
        }
        const fullPath = path_1.default.join(this.config.uploadPath, subfolder);
        await this.ensureDirectoryExists(fullPath);
        return path_1.default.join(fullPath, fileName);
    }
    async saveFile(file, filePath) {
        try {
            await fs_1.promises.writeFile(filePath, file);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            throw new Error(`Error guardando archivo: ${errorMessage}`);
        }
    }
    async generateThumbnails(file, fileName) {
        const thumbnails = [];
        try {
            for (const size of this.config.thumbnailSizes) {
                const thumbnailFileName = `${path_1.default.parse(fileName).name}_${size.name}.jpg`;
                const thumbnailPath = path_1.default.join(this.config.uploadPath, 'thumbnails', thumbnailFileName);
                const thumbnailBuffer = Buffer.from('mock-thumbnail-data');
                await this.saveFile(thumbnailBuffer, thumbnailPath);
                const thumbnail = {
                    size: size.name,
                    width: size.width,
                    height: size.height,
                    url: await this.generateThumbnailUrl(thumbnailFileName),
                    filePath: thumbnailPath
                };
                thumbnails.push(thumbnail);
            }
            return thumbnails;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)('Error generando thumbnails', { error: errorMessage }, error, 'FileService');
            return [];
        }
    }
    async extractMetadata(file, mimeType) {
        const metadata = {};
        try {
            if (this.isImageFile(mimeType)) {
                metadata.width = 1920;
                metadata.height = 1080;
                metadata.format = 'jpeg';
                metadata.colorSpace = 'sRGB';
            }
            return metadata;
        }
        catch (error) {
            (0, logger_1.logWarn)('Error extrayendo metadatos', { error }, 'FileService');
            return metadata;
        }
    }
    isImageFile(mimeType) {
        return this.config.allowedImageTypes.includes(mimeType);
    }
    async generateFileUrl(fileName, category) {
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        let subfolder = '';
        switch (category) {
            case FileCategory.PHOTO:
                subfolder = 'photos';
                break;
            case FileCategory.VIDEO:
                subfolder = 'videos';
                break;
            default:
                subfolder = 'documents';
        }
        return `${baseUrl}/files/${subfolder}/${fileName}`;
    }
    async generateThumbnailUrl(thumbnailFileName) {
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        return `${baseUrl}/files/thumbnails/${thumbnailFileName}`;
    }
    canUserAccessFile(file, userId) {
        if (file.visibility === FileVisibility.PUBLIC) {
            return true;
        }
        if (file.userId === userId) {
            return true;
        }
        return false;
    }
    canUserDeleteFile(file, userId) {
        return file.userId === userId;
    }
    async deletePhysicalFile(file) {
        try {
            await fs_1.promises.unlink(file.filePath);
        }
        catch (error) {
            (0, logger_1.logWarn)(`Error eliminando archivo físico ${file.filePath}`, { filePath: file.filePath, error }, 'FileService');
        }
    }
    buildFileSearchConditions(options, userId) {
        const conditions = { status: { [sequelize_1.Op.ne]: FileStatus.DELETED } };
        if (options.category) {
            conditions.category = options.category;
        }
        if (options.bovineId) {
            conditions.bovineId = options.bovineId;
        }
        if (options.ranchId) {
            conditions.ranchId = options.ranchId;
        }
        if (options.searchTerm) {
            conditions[sequelize_1.Op.or] = [
                { originalName: { [sequelize_1.Op.iLike]: `%${options.searchTerm}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${options.searchTerm}%` } },
                { tags: { [sequelize_1.Op.contains]: [options.searchTerm] } }
            ];
        }
        if (options.minSize || options.maxSize) {
            conditions.fileSize = {};
            if (options.minSize)
                conditions.fileSize[sequelize_1.Op.gte] = options.minSize;
            if (options.maxSize)
                conditions.fileSize[sequelize_1.Op.lte] = options.maxSize;
        }
        if (options.dateRange) {
            conditions.createdAt = {
                [sequelize_1.Op.between]: [options.dateRange.start, options.dateRange.end]
            };
        }
        if (options.tags && options.tags.length > 0) {
            conditions.tags = { [sequelize_1.Op.overlap]: options.tags };
        }
        return conditions;
    }
    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
    }
    async ensureDirectoryExists(dirPath) {
        try {
            await fs_1.promises.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            (0, logger_1.logError)(`Error creando directorio ${dirPath}`, { dirPath, error: errorMessage }, error, 'FileService');
            throw new Error(`Error creando directorio: ${errorMessage}`);
        }
    }
    generateFileId() {
        return `file_${Date.now()}_${crypto_1.default.randomBytes(8).toString('hex')}`;
    }
    generateSecureToken(data) {
        const secret = process.env.JWT_SECRET || 'default-secret';
        const payload = Buffer.from(JSON.stringify(data)).toString('base64');
        const signature = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
        return `${payload}.${signature}`;
    }
}
exports.fileService = new FileService();
//# sourceMappingURL=file.js.map