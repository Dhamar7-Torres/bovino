import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { logInfo, logError, logWarn } from '../utils/logger';

// Enums para tipos de archivos
enum FileCategory {
  VACCINATION = 'VACCINATION',
  MEDICAL = 'MEDICAL',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  GENEALOGY = 'GENEALOGY',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER'
}

enum FileStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  DELETED = 'deleted'
}

enum FileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

enum StorageProvider {
  LOCAL = 'local',
  AWS_S3 = 's3',
  CLOUDINARY = 'cloudinary',
  GOOGLE_CLOUD = 'gcs'
}

// Interfaces principales
interface FileConfig {
  uploadPath: string;
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  allowedVideoTypes: string[];
  thumbnailSizes: ThumbnailSize[];
  storageProvider: StorageProvider;
  cloudConfig?: CloudStorageConfig;
}

interface CloudStorageConfig {
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  cloudName?: string; // Para Cloudinary
}

interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  quality?: number;
}

interface FileUploadOptions {
  category: FileCategory;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  bovineId?: string;
  ranchId?: string;
  userId: string;
  generateThumbnails?: boolean;
  overrideFileName?: string;
}

interface FileModel {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: FileCategory;
  status: FileStatus;
  visibility: FileVisibility;
  description?: string;
  tags: string[];
  bovineId?: string;
  ranchId?: string;
  userId: string;
  downloadCount: number;
  version: number;
  thumbnails?: FileThumbnail[];
  metadata?: FileMetadata;
  url: string;
  secureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Agregado para soft delete
  deletedBy?: string; // Agregado para soft delete
}

interface FileThumbnail {
  size: string;
  width: number;
  height: number;
  url: string;
  filePath: string;
}

interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number; // Para videos
  pages?: number; // Para PDFs
  format?: string;
  colorSpace?: string;
  exif?: Record<string, any>;
}

interface UploadResult {
  fileId: string;
  originalName: string;
  fileName: string;
  url: string;
  thumbnails?: FileThumbnail[];
  size: number;
  mimeType: string;
}

interface BulkUploadResult {
  successful: UploadResult[];
  failed: { fileName: string; error: string }[];
  totalUploaded: number;
  totalFailed: number;
}

interface FileSearchOptions {
  category?: FileCategory;
  bovineId?: string;
  ranchId?: string;
  userId?: string;
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minSize?: number;
  maxSize?: number;
  page?: number;
  limit?: number;
}

interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  filesByCategory: Record<FileCategory, number>;
  filesByMonth: { month: string; count: number }[];
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  topDownloads: { fileName: string; downloads: number }[];
}

// Mock del modelo File
const File = {
  create: async (data: any): Promise<FileModel> => {
    return data as FileModel;
  },
  findByPk: async (id: string): Promise<FileModel | null> => {
    return null;
  },
  findAll: async (options: any): Promise<FileModel[]> => {
    return [];
  },
  update: async (data: any, options: any): Promise<[number]> => {
    return [1];
  },
  destroy: async (options: any): Promise<number> => {
    return 1;
  },
  count: async (options?: any): Promise<number> => {
    return 0;
  }
};

// Mock de sharp para procesamiento de imágenes
const sharp = {
  default: (input: Buffer) => ({
    resize: (width: number, height: number) => ({
      jpeg: (options?: any) => ({
        toBuffer: async (): Promise<Buffer> => {
          // Mock implementation
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
  private config: FileConfig;

  constructor() {
    this.config = {
      uploadPath: process.env.UPLOAD_PATH || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
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

  /**
   * Inicializa el sistema de almacenamiento
   */
  private async initializeStorage(): Promise<void> {
    try {
      // Crear directorios necesarios para almacenamiento local
      if (this.config.storageProvider === StorageProvider.LOCAL) {
        await this.ensureDirectoryExists(this.config.uploadPath);
        await this.ensureDirectoryExists(path.join(this.config.uploadPath, 'thumbnails'));
        await this.ensureDirectoryExists(path.join(this.config.uploadPath, 'documents'));
        await this.ensureDirectoryExists(path.join(this.config.uploadPath, 'videos'));
        await this.ensureDirectoryExists(path.join(this.config.uploadPath, 'temp'));
      }

      logInfo('Sistema de almacenamiento inicializado correctamente', undefined, 'FileService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('Error inicializando sistema de almacenamiento', { error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error inicializando almacenamiento: ${errorMessage}`);
    }
  }

  /**
   * Sube un archivo único
   * @param file - Buffer o datos del archivo
   * @param options - Opciones de subida
   * @returns Promise con resultado de la subida
   */
  async uploadFile(file: Buffer, originalName: string, mimeType: string, options: FileUploadOptions): Promise<UploadResult> {
    try {
      // Validar archivo
      this.validateFile(file, originalName, mimeType);

      // Generar nombre único para el archivo
      const fileName = this.generateUniqueFileName(originalName);
      const fileExtension = path.extname(originalName).toLowerCase();

      // Determinar ruta de almacenamiento
      const filePath = await this.getStoragePath(fileName, options.category);

      // Guardar archivo principal
      await this.saveFile(file, filePath);

      // Procesar metadatos
      const metadata = await this.extractMetadata(file, mimeType);

      // Generar thumbnails si es imagen
      let thumbnails: FileThumbnail[] = [];
      if (this.isImageFile(mimeType) && options.generateThumbnails !== false) {
        thumbnails = await this.generateThumbnails(file, fileName);
      }

      // Crear registro en base de datos
      const fileRecord: FileModel = {
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

      logInfo(`Archivo subido exitosamente: ${originalName} -> ${fileName}`, undefined, 'FileService');

      return {
        fileId: fileRecord.id,
        originalName,
        fileName,
        url: fileRecord.url,
        thumbnails,
        size: file.length,
        mimeType
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('Error subiendo archivo', { error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error subiendo archivo: ${errorMessage}`);
    }
  }

  /**
   * Sube múltiples archivos
   * @param files - Array de archivos
   * @param options - Opciones de subida
   * @returns Promise con resultados de subida masiva
   */
  async uploadMultipleFiles(
    files: { buffer: Buffer; originalName: string; mimeType: string }[],
    options: FileUploadOptions
  ): Promise<BulkUploadResult> {
    const successful: UploadResult[] = [];
    const failed: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file.buffer, file.originalName, file.mimeType, options);
        successful.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        failed.push({
          fileName: file.originalName,
          error: errorMessage
        });
      }
    }

    logInfo(`Subida masiva completada: ${successful.length} exitosos, ${failed.length} fallidos`, 
      { successful: successful.length, failed: failed.length }, 'FileService');

    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    };
  }

  /**
   * Obtiene un archivo por ID
   * @param fileId - ID del archivo
   * @param userId - ID del usuario que solicita
   * @returns Promise con datos del archivo
   */
  async getFileById(fileId: string, userId: string): Promise<FileModel | null> {
    try {
      const file = await File.findByPk(fileId);

      if (!file) {
        return null;
      }

      // Verificar permisos de acceso
      if (!this.canUserAccessFile(file, userId)) {
        throw new Error('No tienes permisos para acceder a este archivo');
      }

      return file;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError(`Error obteniendo archivo ${fileId}`, { fileId, userId, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error obteniendo archivo: ${errorMessage}`);
    }
  }

  /**
   * Busca archivos con filtros
   * @param searchOptions - Opciones de búsqueda
   * @param userId - ID del usuario
   * @returns Promise con archivos encontrados
   */
  async searchFiles(searchOptions: FileSearchOptions, userId: string): Promise<{ files: FileModel[]; total: number }> {
    try {
      // Construir condiciones de búsqueda
      const whereConditions = this.buildFileSearchConditions(searchOptions, userId);

      // Configurar paginación
      const page = searchOptions.page || 1;
      const limit = searchOptions.limit || 20;
      const offset = (page - 1) * limit;

      // Buscar archivos
      const files = await File.findAll({
        where: whereConditions,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Contar total
      const total = await File.count({ where: whereConditions });

      return { files, total };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('Error buscando archivos', { searchOptions, userId, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error buscando archivos: ${errorMessage}`);
    }
  }

  /**
   * Elimina un archivo
   * @param fileId - ID del archivo
   * @param userId - ID del usuario
   * @returns Promise<void>
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const file = await this.getFileById(fileId, userId);

      if (!file) {
        throw new Error('Archivo no encontrado');
      }

      // Verificar permisos de eliminación
      if (!this.canUserDeleteFile(file, userId)) {
        throw new Error('No tienes permisos para eliminar este archivo');
      }

      // Eliminar archivo físico
      await this.deletePhysicalFile(file);

      // Eliminar thumbnails
      if (file.thumbnails) {
        for (const thumbnail of file.thumbnails) {
          await this.deletePhysicalFile({ filePath: thumbnail.filePath } as FileModel);
        }
      }

      // Marcar como eliminado en base de datos (soft delete)
      await File.update(
        {
          status: FileStatus.DELETED,
          deletedAt: new Date(),
          deletedBy: userId
        },
        { where: { id: fileId } }
      );

      logInfo(`Archivo eliminado: ${file.fileName} por usuario ${userId}`, 
        { fileId, fileName: file.fileName, userId }, 'FileService');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError(`Error eliminando archivo ${fileId}`, { fileId, userId, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error eliminando archivo: ${errorMessage}`);
    }
  }

  /**
   * Genera una URL segura para descargar un archivo
   * @param fileId - ID del archivo
   * @param userId - ID del usuario
   * @param expirationMinutes - Minutos hasta expiración
   * @returns Promise con URL segura
   */
  async generateSecureUrl(fileId: string, userId: string, expirationMinutes = 60): Promise<string> {
    try {
      const file = await this.getFileById(fileId, userId);

      if (!file) {
        throw new Error('Archivo no encontrado');
      }

      // Generar token temporal
      const tokenData = {
        fileId,
        userId,
        exp: Math.floor(Date.now() / 1000) + (expirationMinutes * 60)
      };

      const token = this.generateSecureToken(tokenData);
      const secureUrl = `${process.env.API_BASE_URL}/files/secure/${fileId}?token=${token}`;

      // Actualizar contador de descargas
      await File.update(
        { downloadCount: file.downloadCount + 1 },
        { where: { id: fileId } }
      );

      return secureUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError(`Error generando URL segura para archivo ${fileId}`, 
        { fileId, userId, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error generando URL segura: ${errorMessage}`);
    }
  }

  /**
   * Obtiene estadísticas de archivos
   * @param userId - ID del usuario (opcional)
   * @param ranchId - ID del rancho (opcional)
   * @returns Promise con estadísticas
   */
  async getFileStatistics(userId?: string, ranchId?: string): Promise<FileStatistics> {
    try {
      const whereConditions: any = { status: { [Op.ne]: FileStatus.DELETED } };

      if (userId) {
        whereConditions.userId = userId;
      }

      if (ranchId) {
        whereConditions.ranchId = ranchId;
      }

      // Obtener estadísticas básicas
      const totalFiles = await File.count({ where: whereConditions });

      // Calcular tamaño total (mock)
      const totalSize = 1024 * 1024 * 1024; // 1GB mock

      // Conteos por categoría
      const filesByCategory = {} as Record<FileCategory, number>;
      for (const category of Object.values(FileCategory)) {
        filesByCategory[category] = await File.count({
          where: { ...whereConditions, category }
        });
      }

      // Mock de otros datos estadísticos
      const filesByMonth = [
        { month: '2024-01', count: 15 },
        { month: '2024-02', count: 23 },
        { month: '2024-03', count: 31 }
      ];

      const storageUsage = {
        used: totalSize,
        total: 5 * 1024 * 1024 * 1024, // 5GB total
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('Error obteniendo estadísticas de archivos', 
        { userId, ranchId, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
    }
  }

  /**
   * Valida un archivo antes de subirlo
   * @param file - Buffer del archivo
   * @param originalName - Nombre original
   * @param mimeType - Tipo MIME
   */
  private validateFile(file: Buffer, originalName: string, mimeType: string): void {
    // Validar tamaño
    if (file.length > this.config.maxFileSize) {
      throw new Error(`Archivo demasiado grande. Máximo permitido: ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    // Validar tipo de archivo
    const allAllowedTypes = [
      ...this.config.allowedImageTypes,
      ...this.config.allowedDocumentTypes,
      ...this.config.allowedVideoTypes
    ];

    if (!allAllowedTypes.includes(mimeType)) {
      throw new Error(`Tipo de archivo no permitido: ${mimeType}`);
    }

    // Validar nombre de archivo
    if (!originalName || originalName.trim().length === 0) {
      throw new Error('Nombre de archivo requerido');
    }

    // Verificar extensión peligrosa
    const extension = path.extname(originalName).toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    if (dangerousExtensions.includes(extension)) {
      throw new Error('Tipo de archivo no permitido por seguridad');
    }
  }

  /**
   * Genera un nombre único para el archivo
   * @param originalName - Nombre original
   * @returns Nombre único
   */
  private generateUniqueFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');

    // Sanitizar nombre base
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 50);

    return `${sanitizedBaseName}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Obtiene la ruta de almacenamiento según la categoría
   * @param fileName - Nombre del archivo
   * @param category - Categoría del archivo
   * @returns Ruta de almacenamiento
   */
  private async getStoragePath(fileName: string, category: FileCategory): Promise<string> {
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

    const fullPath = path.join(this.config.uploadPath, subfolder);
    await this.ensureDirectoryExists(fullPath);

    return path.join(fullPath, fileName);
  }

  /**
   * Guarda el archivo en el sistema de archivos
   * @param file - Buffer del archivo
   * @param filePath - Ruta donde guardar
   */
  private async saveFile(file: Buffer, filePath: string): Promise<void> {
    try {
      await fs.writeFile(filePath, file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error guardando archivo: ${errorMessage}`);
    }
  }

  /**
   * Genera thumbnails para imágenes
   * @param file - Buffer de la imagen
   * @param fileName - Nombre del archivo
   * @returns Array de thumbnails generados
   */
  private async generateThumbnails(file: Buffer, fileName: string): Promise<FileThumbnail[]> {
    const thumbnails: FileThumbnail[] = [];

    try {
      for (const size of this.config.thumbnailSizes) {
        const thumbnailFileName = `${path.parse(fileName).name}_${size.name}.jpg`;
        const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', thumbnailFileName);

        // Mock de generación de thumbnail (se reemplazará por Sharp real)
        const thumbnailBuffer = Buffer.from('mock-thumbnail-data');
        await this.saveFile(thumbnailBuffer, thumbnailPath);

        const thumbnail: FileThumbnail = {
          size: size.name,
          width: size.width,
          height: size.height,
          url: await this.generateThumbnailUrl(thumbnailFileName),
          filePath: thumbnailPath
        };

        thumbnails.push(thumbnail);
      }

      return thumbnails;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('Error generando thumbnails', { error: errorMessage }, error as Error, 'FileService');
      return [];
    }
  }

  /**
   * Extrae metadatos del archivo
   * @param file - Buffer del archivo
   * @param mimeType - Tipo MIME
   * @returns Metadatos extraídos
   */
  private async extractMetadata(file: Buffer, mimeType: string): Promise<FileMetadata> {
    const metadata: FileMetadata = {};

    try {
      if (this.isImageFile(mimeType)) {
        // Mock de extracción de metadatos de imagen
        metadata.width = 1920;
        metadata.height = 1080;
        metadata.format = 'jpeg';
        metadata.colorSpace = 'sRGB';
      }

      return metadata;

    } catch (error) {
      logWarn('Error extrayendo metadatos', { error }, 'FileService');
      return metadata;
    }
  }

  /**
   * Verifica si un archivo es una imagen
   * @param mimeType - Tipo MIME
   * @returns true si es imagen
   */
  private isImageFile(mimeType: string): boolean {
    return this.config.allowedImageTypes.includes(mimeType);
  }

  /**
   * Genera URL para acceder al archivo
   * @param fileName - Nombre del archivo
   * @param category - Categoría del archivo
   * @returns URL del archivo
   */
  private async generateFileUrl(fileName: string, category: FileCategory): Promise<string> {
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

  /**
   * Genera URL para thumbnail
   * @param thumbnailFileName - Nombre del thumbnail
   * @returns URL del thumbnail
   */
  private async generateThumbnailUrl(thumbnailFileName: string): Promise<string> {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/files/thumbnails/${thumbnailFileName}`;
  }

  /**
   * Verifica si un usuario puede acceder a un archivo
   * @param file - Archivo
   * @param userId - ID del usuario
   * @returns true si puede acceder
   */
  private canUserAccessFile(file: FileModel, userId: string): boolean {
    // Archivo público
    if (file.visibility === FileVisibility.PUBLIC) {
      return true;
    }

    // Propietario del archivo
    if (file.userId === userId) {
      return true;
    }

    // TODO: Verificar permisos adicionales por rancho, rol, etc.

    return false;
  }

  /**
   * Verifica si un usuario puede eliminar un archivo
   * @param file - Archivo
   * @param userId - ID del usuario
   * @returns true si puede eliminar
   */
  private canUserDeleteFile(file: FileModel, userId: string): boolean {
    // Solo el propietario o admin pueden eliminar
    return file.userId === userId; // TODO: Agregar verificación de rol admin
  }

  /**
   * Elimina el archivo físico del sistema de archivos
   * @param file - Archivo a eliminar
   */
  private async deletePhysicalFile(file: FileModel): Promise<void> {
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      logWarn(`Error eliminando archivo físico ${file.filePath}`, { filePath: file.filePath, error }, 'FileService');
    }
  }

  /**
   * Construye condiciones de búsqueda para archivos
   * @param options - Opciones de búsqueda
   * @param userId - ID del usuario
   * @returns Condiciones de Sequelize
   */
  private buildFileSearchConditions(options: FileSearchOptions, userId: string): any {
    const conditions: any = { status: { [Op.ne]: FileStatus.DELETED } };

    // Filtros básicos
    if (options.category) {
      conditions.category = options.category;
    }

    if (options.bovineId) {
      conditions.bovineId = options.bovineId;
    }

    if (options.ranchId) {
      conditions.ranchId = options.ranchId;
    }

    // Búsqueda por texto
    if (options.searchTerm) {
      conditions[Op.or] = [
        { originalName: { [Op.iLike]: `%${options.searchTerm}%` } },
        { description: { [Op.iLike]: `%${options.searchTerm}%` } },
        { tags: { [Op.contains]: [options.searchTerm] } }
      ];
    }

    // Filtros de tamaño
    if (options.minSize || options.maxSize) {
      conditions.fileSize = {};
      if (options.minSize) conditions.fileSize[Op.gte] = options.minSize;
      if (options.maxSize) conditions.fileSize[Op.lte] = options.maxSize;
    }

    // Filtro de fechas
    if (options.dateRange) {
      conditions.createdAt = {
        [Op.between]: [options.dateRange.start, options.dateRange.end]
      };
    }

    // Filtros de tags
    if (options.tags && options.tags.length > 0) {
      conditions.tags = { [Op.overlap]: options.tags };
    }

    return conditions;
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   * @param bytes - Tamaño en bytes
   * @returns Tamaño formateado
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }

  /**
   * Asegura que un directorio existe
   * @param dirPath - Ruta del directorio
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError(`Error creando directorio ${dirPath}`, { dirPath, error: errorMessage }, error as Error, 'FileService');
      throw new Error(`Error creando directorio: ${errorMessage}`);
    }
  }

  /**
   * Genera un ID único para el archivo
   * @returns ID único
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Genera un token seguro para URLs temporales
   * @param data - Datos a incluir en el token
   * @returns Token seguro
   */
  private generateSecureToken(data: any): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const payload = Buffer.from(JSON.stringify(data)).toString('base64');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `${payload}.${signature}`;
  }
}

// Exportar instancia única del servicio
export const fileService = new FileService();