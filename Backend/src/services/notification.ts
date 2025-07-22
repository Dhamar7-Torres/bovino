import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { logger as appLogger } from '../utils/logger';

// Mock de modelos - Usar mocks hasta que los modelos reales estén disponibles
const Notification = {
  create: async (data: any): Promise<any> => ({...data, id: `notif_${Date.now()}`}),
  findAll: async (options: any): Promise<any[]> => [],
  findByPk: async (id: string): Promise<any | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1],
  count: async (options?: any): Promise<number> => 0
};

const NotificationPreference = {
  findOne: async (options: any): Promise<NotificationPreferences | null> => null,
  create: async (data: NotificationPreferences): Promise<NotificationPreferences> => data,
  update: async (data: any, options: any): Promise<[number]> => [1]
};

const NotificationTemplateModel = {
  findAll: async (options: any): Promise<NotificationTemplate[]> => [],
  findByPk: async (id: string): Promise<NotificationTemplate | null> => null,
  findOne: async (options: any): Promise<NotificationTemplate | null> => null
};

const User = {
  findAll: async (options: any): Promise<any[]> => [],
  findByPk: async (id: string): Promise<any | null> => null
};

// Mock de servicios externos
const emailService = {
  sendNotificationEmail: async (email: string, subject: string, content: string, attachments?: any[]): Promise<void> => {
    console.log(`📧 Email enviado a ${email}: ${subject}`);
  }
};

const smsService = {
  sendSMS: async (phone: string, message: string): Promise<{ messageId: string; status: string }> => {
    console.log(`📱 SMS enviado a ${phone}: ${message}`);
    return { messageId: `sms_${Date.now()}`, status: 'sent' };
  }
};

const pushService = {
  sendPushNotification: async (deviceTokens: string[], payload: PushNotificationPayload): Promise<void> => {
    console.log(`🔔 Push notification enviada a ${deviceTokens.length} dispositivos: ${payload.title}`);
  }
};

// Logger específico para el servicio de notificaciones
const notificationLogger = {
  info: (message: string, metadata?: any) => appLogger.info(message, metadata, 'NotificationService'),
  error: (message: string, error?: any) => appLogger.error(message, { error }, error as Error, 'NotificationService'),
  warn: (message: string, metadata?: any) => appLogger.warn(message, metadata, 'NotificationService'),
  debug: (message: string, metadata?: any) => appLogger.debug(message, metadata, 'NotificationService')
};

// Enums para el sistema de notificaciones
enum NotificationType {
  // Alertas de salud
  HEALTH_ALERT = 'health_alert',
  VACCINATION_REMINDER = 'vaccination_reminder',
  TREATMENT_REMINDER = 'treatment_reminder',
  HEALTH_REPORT_READY = 'health_report_ready',
  
  // Alertas de inventario
  LOW_STOCK_ALERT = 'low_stock_alert',
  EXPIRATION_WARNING = 'expiration_warning',
  INVENTORY_ADJUSTMENT = 'inventory_adjustment',
  PURCHASE_ORDER_STATUS = 'purchase_order_status',
  
  // Alertas de geolocalización
  GEOFENCE_VIOLATION = 'geofence_violation',
  LOCATION_ALERT = 'location_alert',
  DEVICE_OFFLINE = 'device_offline',
  MOVEMENT_ANOMALY = 'movement_anomaly',
  
  // Eventos del ganado
  BOVINE_EVENT = 'bovine_event',
  REPRODUCTIVE_EVENT = 'reproductive_event',
  WEIGHT_MILESTONE = 'weight_milestone',
  AGE_MILESTONE = 'age_milestone',
  
  // Sistema y administrativos
  SYSTEM_MAINTENANCE = 'system_maintenance',
  USER_ACTIVITY = 'user_activity',
  BACKUP_STATUS = 'backup_status',
  SECURITY_ALERT = 'security_alert',
  
  // Reportes y análisis
  REPORT_READY = 'report_ready',
  ANALYSIS_COMPLETE = 'analysis_complete',
  EXPORT_COMPLETE = 'export_complete',
  
  // Comunicación general
  ANNOUNCEMENT = 'announcement',
  MESSAGE = 'message',
  REMINDER = 'reminder'
}

enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WHATSAPP = 'whatsapp',
  WEBHOOK = 'webhook'
}

enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

enum DeliveryFrequency {
  INSTANT = 'instant',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

enum RecurrencePattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

// Interfaces principales
interface NotificationData {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  data?: Record<string, any>;
  templateId?: string;
  templateVariables?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: NotificationMetadata;
}

interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  deviceTokens?: string[];
  preferredChannels?: NotificationChannel[];
  timezone?: string;
  language?: string;
}

interface NotificationMetadata {
  source?: string;
  sourceId?: string;
  ranchId?: string;
  bovineId?: string;
  category?: 'health' | 'inventory' | 'location' | 'system' | 'general';
  tags?: string[];
  relatedIds?: string[];
  batchId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  attachments?: NotificationAttachment[];
}

interface NotificationAttachment {
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
}

interface ChannelSettings {
  enabled: boolean;
  frequency: DeliveryFrequency;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  settings?: Record<string, any>;
}

interface NotificationPreferences {
  userId: string;
  channels: Record<string, ChannelSettings>;
  categories: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
      priority: NotificationPriority;
    }
  };
  globalSettings: {
    enableWeekendNotifications: boolean;
    enableHolidayNotifications: boolean;
    timezone: string;
    language: string;
    digestMode: boolean;
    digestTime: string; // HH:mm
  };
}

interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  variables: string[];
  isActive: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationBatch {
  id: string;
  type: NotificationType;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  notifications: string[]; // IDs de notificaciones
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    event: string;
    conditions: Record<string, any>;
  };
  action: {
    notificationType: NotificationType;
    channels: NotificationChannel[];
    recipients: 'all' | 'role' | 'custom';
    recipientFilter?: Record<string, any>;
    templateId: string;
    delay?: number; // minutos
  };
  schedule?: {
    pattern: RecurrencePattern;
    interval?: number;
    daysOfWeek?: number[];
    timeOfDay?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    rate: number;
  }>;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  responseTime: {
    average: number;
    min: number;
    max: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: number;
  sound?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

class NotificationService extends EventEmitter {
  private notificationQueue: NotificationData[] = [];
  private processingQueue = false;
  private batchQueues: Map<NotificationChannel, NotificationData[]> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private rules: Map<string, NotificationRule> = new Map();

  constructor() {
    super();
    this.initializeService();
    this.startQueueProcessor();
    this.loadDefaultTemplates();
  }

  /**
   * Inicializa el servicio de notificaciones
   */
  private async initializeService(): Promise<void> {
    try {
      // Inicializar colas por canal
      for (const channel of Object.values(NotificationChannel)) {
        this.batchQueues.set(channel, []);
      }

      // Cargar reglas de notificación
      await this.loadNotificationRules();

      // Configurar manejadores de eventos
      this.setupEventHandlers();

      notificationLogger.info('Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error inicializando servicio de notificaciones:', errorMessage);
      throw new Error(`Error inicializando servicio: ${errorMessage}`);
    }
  }

  /**
   * Envía una notificación
   * @param notificationData - Datos de la notificación
   * @returns Promise con ID de notificación
   */
  async sendNotification(notificationData: NotificationData): Promise<string> {
    try {
      // Generar ID si no se proporciona
      if (!notificationData.id) {
        notificationData.id = this.generateNotificationId();
      }

      // Validar datos
      this.validateNotificationData(notificationData);

      // Filtrar destinatarios según preferencias
      const filteredRecipients = await this.filterRecipientsByPreferences(
        notificationData.recipients,
        notificationData.type,
        notificationData.channels
      );

      if (filteredRecipients.length === 0) {
        notificationLogger.warn(`No hay destinatarios válidos para notificación ${notificationData.id}`);
        return notificationData.id;
      }

      notificationData.recipients = filteredRecipients;

      // Verificar horarios de silencio
      if (await this.isInQuietHours(notificationData)) {
        notificationData.scheduledAt = await this.getNextAvailableTime(notificationData);
      }

      // Crear registro en base de datos
      await Notification.create({
        id: notificationData.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        channels: notificationData.channels,
        recipients: notificationData.recipients.map(r => r.userId),
        data: notificationData.data,
        status: NotificationStatus.PENDING,
        scheduledAt: notificationData.scheduledAt || new Date(),
        expiresAt: notificationData.expiresAt,
        metadata: notificationData.metadata,
        createdAt: new Date()
      });

      // Encolar para procesamiento
      if (notificationData.scheduledAt && notificationData.scheduledAt > new Date()) {
        // Programar para más tarde
        setTimeout(() => {
          this.notificationQueue.push(notificationData);
        }, notificationData.scheduledAt.getTime() - Date.now());
      } else {
        // Procesar inmediatamente
        this.notificationQueue.push(notificationData);
      }

      // Emitir evento
      this.emit('notification:created', notificationData);

      notificationLogger.info(`Notificación ${notificationData.id} encolada para ${filteredRecipients.length} destinatarios`);
      return notificationData.id;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando notificación:', errorMessage);
      throw new Error(`Error enviando notificación: ${errorMessage}`);
    }
  }

  /**
   * Envía notificación masiva
   * @param type - Tipo de notificación
   * @param data - Datos de la notificación
   * @param recipientFilter - Filtros para destinatarios
   * @returns Promise con ID de lote
   */
  async sendBulkNotification(
    type: NotificationType,
    data: {
      title: string;
      message: string;
      priority: NotificationPriority;
      channels: NotificationChannel[];
      templateId?: string;
      templateVariables?: Record<string, any>;
      metadata?: NotificationMetadata;
    },
    recipientFilter: {
      ranchIds?: string[];
      roles?: string[];
      userIds?: string[];
      all?: boolean;
    } = { all: true }
  ): Promise<string> {
    try {
      // Obtener destinatarios
      const recipients = await this.getRecipientsFromFilter(recipientFilter);

      if (recipients.length === 0) {
        throw new Error('No se encontraron destinatarios para la notificación masiva');
      }

      // Crear lote
      const batchId = this.generateBatchId();
      const batch: NotificationBatch = {
        id: batchId,
        type,
        totalRecipients: recipients.length,
        sentCount: 0,
        failedCount: 0,
        status: 'pending',
        createdAt: new Date(),
        notifications: []
      };

      // Procesar en grupos pequeños para evitar sobrecarga
      const batchSize = 50;
      const batches = this.chunkArray(recipients, batchSize);

      for (const recipientBatch of batches) {
        const notificationId = await this.sendNotification({
          type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          channels: data.channels,
          recipients: recipientBatch,
          templateId: data.templateId,
          templateVariables: data.templateVariables,
          metadata: {
            ...data.metadata,
            batchId
          } as NotificationMetadata
        });

        batch.notifications.push(notificationId);
      }

      batch.status = 'processing';

      notificationLogger.info(`Notificación masiva ${batchId} creada para ${recipients.length} destinatarios en ${batches.length} lotes`);
      return batchId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando notificación masiva:', errorMessage);
      throw new Error(`Error enviando notificación masiva: ${errorMessage}`);
    }
  }

  /**
   * Envía alertas específicas de salud
   * @param alertData - Datos de la alerta de salud
   * @returns Promise<void>
   */
  async sendHealthAlert(alertData: {
    bovineId: string;
    bovineEarTag: string;
    alertType: 'critical' | 'vaccination_due' | 'treatment_overdue' | 'health_deterioration';
    message: string;
    details: string;
    veterinarianId?: string;
    ranchId: string;
    location?: { latitude: number; longitude: number };
  }): Promise<void> {
    try {
      const priority = alertData.alertType === 'critical' ? NotificationPriority.CRITICAL : NotificationPriority.HIGH;
      
      await this.sendNotification({
        type: NotificationType.HEALTH_ALERT,
        title: `🚨 Alerta de Salud - ${alertData.bovineEarTag}`,
        message: alertData.message,
        priority,
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
        recipients: await this.getHealthAlertRecipients(alertData.ranchId, alertData.veterinarianId),
        data: {
          bovineId: alertData.bovineId,
          bovineEarTag: alertData.bovineEarTag,
          alertType: alertData.alertType,
          details: alertData.details
        },
        metadata: {
          source: 'health_service',
          sourceId: alertData.bovineId,
          ranchId: alertData.ranchId,
          bovineId: alertData.bovineId,
          category: 'health' as const,
          tags: ['health', 'alert', alertData.alertType],
          location: alertData.location
        }
      });

      // Si es crítica, enviar también por SMS
      if (alertData.alertType === 'critical') {
        await this.sendNotification({
          type: NotificationType.HEALTH_ALERT,
          title: `CRÍTICO: ${alertData.bovineEarTag}`,
          message: alertData.message,
          priority: NotificationPriority.CRITICAL,
          channels: [NotificationChannel.SMS],
          recipients: await this.getCriticalAlertRecipients(alertData.ranchId),
          data: alertData,
          metadata: {
            source: 'health_service',
            sourceId: alertData.bovineId,
            ranchId: alertData.ranchId,
            bovineId: alertData.bovineId,
            category: 'health' as const,
            tags: ['health', 'critical'],
            location: alertData.location
          }
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando alerta de salud:', errorMessage);
      throw new Error(`Error enviando alerta de salud: ${errorMessage}`);
    }
  }

  /**
   * Envía recordatorio de vacunación
   * @param reminderData - Datos del recordatorio
   * @returns Promise<void>
   */
  async sendVaccinationReminder(reminderData: {
    bovineId: string;
    bovineEarTag: string;
    vaccineName: string;
    dueDate: Date;
    veterinarianName: string;
    ranchId: string;
    ownerEmail?: string;
  }): Promise<void> {
    try {
      const daysUntilDue = Math.ceil((reminderData.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      await this.sendNotification({
        type: NotificationType.VACCINATION_REMINDER,
        title: `💉 Recordatorio de Vacunación`,
        message: `El bovino ${reminderData.bovineEarTag} necesita vacunación de ${reminderData.vaccineName} en ${daysUntilDue} días`,
        priority: daysUntilDue <= 3 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        recipients: await this.getVaccinationReminderRecipients(reminderData.ranchId, reminderData.ownerEmail),
        templateId: 'vaccination_reminder',
        templateVariables: {
          bovineEarTag: reminderData.bovineEarTag,
          vaccineName: reminderData.vaccineName,
          dueDate: reminderData.dueDate.toLocaleDateString('es-MX'),
          daysUntilDue: daysUntilDue.toString(),
          veterinarianName: reminderData.veterinarianName
        },
        metadata: {
          source: 'health_service',
          sourceId: reminderData.bovineId,
          ranchId: reminderData.ranchId,
          bovineId: reminderData.bovineId,
          category: 'health' as const,
          tags: ['vaccination', 'reminder'],
          relatedIds: [reminderData.bovineId]
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando recordatorio de vacunación:', errorMessage);
      throw new Error(`Error enviando recordatorio: ${errorMessage}`);
    }
  }

  /**
   * Envía alerta de inventario
   * @param alertData - Datos de la alerta
   * @returns Promise<void>
   */
  async sendInventoryAlert(alertData: {
    itemId: string;
    itemName: string;
    alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
    currentStock: number;
    minStock?: number;
    expirationDate?: Date;
    ranchId: string;
  }): Promise<void> {
    try {
      let title = '';
      let priority = NotificationPriority.MEDIUM;

      switch (alertData.alertType) {
        case 'out_of_stock':
          title = `📦 Sin Stock - ${alertData.itemName}`;
          priority = NotificationPriority.HIGH;
          break;
        case 'low_stock':
          title = `📉 Stock Bajo - ${alertData.itemName}`;
          priority = NotificationPriority.MEDIUM;
          break;
        case 'expired':
          title = `⚠️ Producto Vencido - ${alertData.itemName}`;
          priority = NotificationPriority.CRITICAL;
          break;
        case 'expiring_soon':
          title = `📅 Vencimiento Próximo - ${alertData.itemName}`;
          priority = NotificationPriority.MEDIUM;
          break;
      }

      await this.sendNotification({
        type: NotificationType.LOW_STOCK_ALERT,
        title,
        message: this.generateInventoryMessage(alertData),
        priority,
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        recipients: await this.getInventoryAlertRecipients(alertData.ranchId),
        data: alertData,
        metadata: {
          source: 'inventory_service',
          sourceId: alertData.itemId,
          ranchId: alertData.ranchId,
          category: 'inventory' as const,
          tags: ['inventory', alertData.alertType]
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando alerta de inventario:', errorMessage);
      throw new Error(`Error enviando alerta de inventario: ${errorMessage}`);
    }
  }

  /**
   * Envía alerta de ubicación/geolocalización
   * @param alertData - Datos de la alerta de ubicación
   * @returns Promise<void>
   */
  async sendLocationAlert(alertData: {
    bovineId: string;
    bovineEarTag: string;
    alertType: 'geofence_violation' | 'device_offline' | 'unusual_movement';
    message: string;
    location: { latitude: number; longitude: number };
    ranchId: string;
  }): Promise<void> {
    try {
      await this.sendNotification({
        type: NotificationType.GEOFENCE_VIOLATION,
        title: `🗺️ Alerta de Ubicación - ${alertData.bovineEarTag}`,
        message: alertData.message,
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
        recipients: await this.getLocationAlertRecipients(alertData.ranchId),
        data: alertData,
        metadata: {
          source: 'geolocation_service',
          sourceId: alertData.bovineId,
          ranchId: alertData.ranchId,
          bovineId: alertData.bovineId,
          category: 'location' as const,
          tags: ['location', alertData.alertType],
          location: alertData.location
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error enviando alerta de ubicación:', errorMessage);
      throw new Error(`Error enviando alerta de ubicación: ${errorMessage}`);
    }
  }

  /**
   * Obtiene las preferencias de notificación de un usuario
   * @param userId - ID del usuario
   * @returns Promise con preferencias
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferences = await NotificationPreference.findOne({
        where: { userId }
      });

      if (!preferences) {
        // Crear preferencias por defecto
        return await this.createDefaultPreferences(userId);
      }

      return preferences;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error(`Error obteniendo preferencias del usuario ${userId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Actualiza las preferencias de notificación de un usuario
   * @param userId - ID del usuario
   * @param preferences - Nuevas preferencias
   * @returns Promise<void>
   */
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const existingPreferences = await this.getUserPreferences(userId);

      if (!existingPreferences) {
        const newPreferences: NotificationPreferences = {
          userId,
          channels: {},
          categories: {},
          globalSettings: {
            enableWeekendNotifications: true,
            enableHolidayNotifications: false,
            timezone: 'America/Mexico_City',
            language: 'es',
            digestMode: false,
            digestTime: '08:00'
          },
          ...preferences
        };
        await NotificationPreference.create(newPreferences);
      } else {
        await NotificationPreference.update(preferences, {
          where: { userId }
        });
      }

      this.emit('preferences:updated', { userId, preferences });
      notificationLogger.info(`Preferencias actualizadas para usuario ${userId}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error(`Error actualizando preferencias del usuario ${userId}:`, errorMessage);
      throw new Error(`Error actualizando preferencias: ${errorMessage}`);
    }
  }

  /**
   * Obtiene estadísticas de notificaciones
   * @param ranchId - ID del rancho (opcional)
   * @param days - Días hacia atrás para calcular
   * @returns Promise con estadísticas
   */
  async getNotificationStatistics(ranchId?: string, days = 30): Promise<NotificationStatistics> {
    try {
      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      
      // Mock de estadísticas - en producción se calcularían con datos reales
      const statistics: NotificationStatistics = {
        totalSent: 1548,
        totalDelivered: 1489,
        totalFailed: 59,
        deliveryRate: 96.2,
        byChannel: {
          [NotificationChannel.EMAIL]: { sent: 892, delivered: 856, failed: 36, rate: 96.0 },
          [NotificationChannel.SMS]: { sent: 234, delivered: 228, failed: 6, rate: 97.4 },
          [NotificationChannel.PUSH]: { sent: 456, delivered: 439, failed: 17, rate: 96.3 },
          [NotificationChannel.IN_APP]: { sent: 678, delivered: 678, failed: 0, rate: 100.0 },
          [NotificationChannel.WHATSAPP]: { sent: 0, delivered: 0, failed: 0, rate: 0 },
          [NotificationChannel.WEBHOOK]: { sent: 0, delivered: 0, failed: 0, rate: 0 }
        },
        byType: {
          [NotificationType.HEALTH_ALERT]: 234,
          [NotificationType.VACCINATION_REMINDER]: 189,
          [NotificationType.LOW_STOCK_ALERT]: 145,
          [NotificationType.GEOFENCE_VIOLATION]: 89,
          [NotificationType.SYSTEM_MAINTENANCE]: 56
        } as any,
        byPriority: {
          [NotificationPriority.CRITICAL]: 123,
          [NotificationPriority.HIGH]: 345,
          [NotificationPriority.MEDIUM]: 789,
          [NotificationPriority.LOW]: 291
        },
        responseTime: {
          average: 2.3,
          min: 0.8,
          max: 15.6
        },
        timeRange: {
          start: cutoffDate,
          end: new Date()
        }
      };

      return statistics;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notificationLogger.error('Error obteniendo estadísticas de notificaciones:', errorMessage);
      throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
    }
  }

  // Métodos privados de utilidad

  private async startQueueProcessor(): Promise<void> {
    const processQueue = async () => {
      if (this.processingQueue || this.notificationQueue.length === 0) {
        return;
      }

      this.processingQueue = true;

      try {
        const notification = this.notificationQueue.shift();
        if (notification) {
          await this.processNotification(notification);
        }
      } catch (error) {
        notificationLogger.error('Error procesando cola de notificaciones:', error);
      } finally {
        this.processingQueue = false;
      }
    };

    // Procesar cada 5 segundos
    setInterval(processQueue, 5000);
  }

  private async processNotification(notification: NotificationData): Promise<void> {
    try {
      await this.updateNotificationStatus(notification.id!, NotificationStatus.PROCESSING);

      const results = await Promise.allSettled(
        notification.channels.map(channel => 
          this.sendToChannel(notification, channel)
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const finalStatus = successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;

      await this.updateNotificationStatus(notification.id!, finalStatus);

      this.emit('notification:processed', {
        id: notification.id,
        status: finalStatus,
        successCount,
        totalChannels: notification.channels.length
      });

      notificationLogger.info(`Notificación ${notification.id} procesada: ${successCount}/${notification.channels.length} canales exitosos`);

    } catch (error) {
      await this.updateNotificationStatus(notification.id!, NotificationStatus.FAILED);
      notificationLogger.error(`Error procesando notificación ${notification.id}:`, error);
    }
  }

  private async sendToChannel(notification: NotificationData, channel: NotificationChannel): Promise<void> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmailNotification(notification);
        break;
      case NotificationChannel.SMS:
        await this.sendSMSNotification(notification);
        break;
      case NotificationChannel.PUSH:
        await this.sendPushNotification(notification);
        break;
      case NotificationChannel.IN_APP:
        await this.sendInAppNotification(notification);
        break;
      case NotificationChannel.WHATSAPP:
        await this.sendWhatsAppNotification(notification);
        break;
      case NotificationChannel.WEBHOOK:
        await this.sendWebhookNotification(notification);
        break;
    }
  }

  private async sendEmailNotification(notification: NotificationData): Promise<void> {
    for (const recipient of notification.recipients) {
      if (recipient.email) {
        await emailService.sendNotificationEmail(
          recipient.email,
          notification.title,
          notification.message,
          notification.metadata?.attachments
        );
      }
    }
  }

  private async sendSMSNotification(notification: NotificationData): Promise<void> {
    for (const recipient of notification.recipients) {
      if (recipient.phone) {
        await smsService.sendSMS(recipient.phone, `${notification.title}: ${notification.message}`);
      }
    }
  }

  private async sendPushNotification(notification: NotificationData): Promise<void> {
    const deviceTokens: string[] = [];
    
    for (const recipient of notification.recipients) {
      if (recipient.deviceTokens) {
        deviceTokens.push(...recipient.deviceTokens);
      }
    }

    if (deviceTokens.length > 0) {
      await pushService.sendPushNotification(deviceTokens, {
        title: notification.title,
        body: notification.message,
        data: notification.data
      });
    }
  }

  private async sendInAppNotification(notification: NotificationData): Promise<void> {
    // Para notificaciones in-app, solo guardamos en base de datos
    // El frontend las consultará vía WebSocket o polling
    this.emit('notification:in_app', notification);
  }

  private async sendWhatsAppNotification(notification: NotificationData): Promise<void> {
    // Implementación futura para WhatsApp Business API
    notificationLogger.debug('WhatsApp notification not implemented yet');
  }

  private async sendWebhookNotification(notification: NotificationData): Promise<void> {
    // Implementación futura para webhooks
    notificationLogger.debug('Webhook notification not implemented yet');
  }

  private validateNotificationData(data: NotificationData): void {
    if (!data.type || !data.title || !data.message) {
      throw new Error('Tipo, título y mensaje son requeridos');
    }

    if (!data.channels || data.channels.length === 0) {
      throw new Error('Se debe especificar al menos un canal');
    }

    if (!data.recipients || data.recipients.length === 0) {
      throw new Error('Se debe especificar al menos un destinatario');
    }
  }

  private async filterRecipientsByPreferences(
    recipients: NotificationRecipient[],
    type: NotificationType,
    channels: NotificationChannel[]
  ): Promise<NotificationRecipient[]> {
    const filtered: NotificationRecipient[] = [];

    for (const recipient of recipients) {
      const preferences = await this.getUserPreferences(recipient.userId);
      
      if (!preferences) {
        // Si no hay preferencias, incluir por defecto
        filtered.push(recipient);
        continue;
      }

      // Verificar si el tipo de notificación está habilitado
      const typePreference = preferences.categories[type];
      if (typePreference && !typePreference.enabled) {
        continue;
      }

      // Verificar canales habilitados
      const enabledChannels = channels.filter(channel => {
        const channelConfig = preferences.channels[channel];
        return channelConfig?.enabled || false;
      });

      if (enabledChannels.length > 0) {
        filtered.push({
          ...recipient,
          preferredChannels: enabledChannels
        });
      }
    }

    return filtered;
  }

  private async isInQuietHours(notification: NotificationData): Promise<boolean> {
    // Verificar horarios de silencio para cada destinatario
    for (const recipient of notification.recipients) {
      const preferences = await this.getUserPreferences(recipient.userId);
      
      if (preferences) {
        for (const channel of notification.channels) {
          const channelPrefs = preferences.channels[channel];
          if (channelPrefs?.quietHours?.enabled) {
            const now = new Date();
            const timezone = recipient.timezone || preferences.globalSettings.timezone;
            
            // Lógica simplificada - en producción se usaría una librería como moment-timezone
            const currentHour = now.getHours();
            const quietStart = parseInt(channelPrefs.quietHours.start.split(':')[0]);
            const quietEnd = parseInt(channelPrefs.quietHours.end.split(':')[0]);
            
            if (currentHour >= quietStart || currentHour <= quietEnd) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private async getNextAvailableTime(notification: NotificationData): Promise<Date> {
    // Calcular próximo horario disponible - implementación simplificada
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8:00 AM del día siguiente
    return tomorrow;
  }

  private generateInventoryMessage(alertData: any): string {
    switch (alertData.alertType) {
      case 'out_of_stock':
        return `El medicamento ${alertData.itemName} está sin stock (0 unidades)`;
      case 'low_stock':
        return `Stock bajo de ${alertData.itemName}: ${alertData.currentStock} unidades (mínimo: ${alertData.minStock})`;
      case 'expired':
        return `El medicamento ${alertData.itemName} ha vencido y debe ser retirado del inventario`;
      case 'expiring_soon':
        const days = alertData.expirationDate ? 
          Math.ceil((alertData.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        return `${alertData.itemName} vence en ${days} días`;
      default:
        return `Alerta de inventario para ${alertData.itemName}`;
    }
  }

  private async getHealthAlertRecipients(ranchId: string, veterinarianId?: string): Promise<NotificationRecipient[]> {
    // Mock - en producción se consultaría la base de datos
    const recipients: NotificationRecipient[] = [
      { userId: 'owner_1', email: 'owner@ranch.com', phone: '+521234567890' }
    ];

    if (veterinarianId) {
      recipients.push({ userId: veterinarianId, email: 'vet@clinic.com' });
    }

    return recipients;
  }

  private async getCriticalAlertRecipients(ranchId: string): Promise<NotificationRecipient[]> {
    // Mock - destinatarios para alertas críticas
    return [
      { userId: 'owner_1', phone: '+521234567890' },
      { userId: 'manager_1', phone: '+521234567891' }
    ];
  }

  private async getVaccinationReminderRecipients(ranchId: string, ownerEmail?: string): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];
    
    if (ownerEmail) {
      recipients.push({ userId: 'owner_1', email: ownerEmail });
    }

    return recipients;
  }

  private async getInventoryAlertRecipients(ranchId: string): Promise<NotificationRecipient[]> {
    return [
      { userId: 'inventory_manager', email: 'inventario@ranch.com' }
    ];
  }

  private async getLocationAlertRecipients(ranchId: string): Promise<NotificationRecipient[]> {
    return [
      { userId: 'ranch_manager', email: 'manager@ranch.com' }
    ];
  }

  private async getRecipientsFromFilter(filter: any): Promise<NotificationRecipient[]> {
    // Mock - en producción se consultaría la base de datos
    return [
      { userId: 'user_1', email: 'user1@ranch.com' },
      { userId: 'user_2', email: 'user2@ranch.com' }
    ];
  }

  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPreferences: NotificationPreferences = {
      userId,
      channels: {
        [NotificationChannel.EMAIL]: {
          enabled: true,
          frequency: DeliveryFrequency.INSTANT,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
            timezone: 'America/Mexico_City'
          }
        },
        [NotificationChannel.SMS]: {
          enabled: false,
          frequency: DeliveryFrequency.INSTANT
        },
        [NotificationChannel.PUSH]: {
          enabled: true,
          frequency: DeliveryFrequency.INSTANT
        },
        [NotificationChannel.IN_APP]: {
          enabled: true,
          frequency: DeliveryFrequency.INSTANT
        },
        [NotificationChannel.WHATSAPP]: {
          enabled: false,
          frequency: DeliveryFrequency.INSTANT
        },
        [NotificationChannel.WEBHOOK]: {
          enabled: false,
          frequency: DeliveryFrequency.INSTANT
        }
      },
      categories: {},
      globalSettings: {
        enableWeekendNotifications: true,
        enableHolidayNotifications: false,
        timezone: 'America/Mexico_City',
        language: 'es',
        digestMode: false,
        digestTime: '08:00'
      }
    };

    const createdPreferences = await NotificationPreference.create(defaultPreferences);
    return createdPreferences;
  }

  private async loadNotificationRules(): Promise<void> {
    // Mock - cargar reglas de notificación
    notificationLogger.debug('Cargando reglas de notificación');
  }

  private async loadDefaultTemplates(): Promise<void> {
    // Mock - cargar templates por defecto
    notificationLogger.debug('Cargando templates de notificación');
  }

  private setupEventHandlers(): void {
    this.on('notification:created', (data) => {
      notificationLogger.debug(`Evento: Notificación ${data.id} creada`);
    });

    this.on('notification:processed', (data) => {
      notificationLogger.debug(`Evento: Notificación ${data.id} procesada`);
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async updateNotificationStatus(id: string, status: NotificationStatus): Promise<void> {
    await Notification.update({ status, updatedAt: new Date() }, { where: { id } });
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Exportar instancia única del servicio
export const notificationService = new NotificationService();