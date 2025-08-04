"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const Notification = {
    create: async (data) => ({ ...data, id: `notif_${Date.now()}` }),
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1],
    count: async (options) => 0
};
const NotificationPreference = {
    findOne: async (options) => null,
    create: async (data) => data,
    update: async (data, options) => [1]
};
const NotificationTemplateModel = {
    findAll: async (options) => [],
    findByPk: async (id) => null,
    findOne: async (options) => null
};
const User = {
    findAll: async (options) => [],
    findByPk: async (id) => null
};
const emailService = {
    sendNotificationEmail: async (email, subject, content, attachments) => {
        console.log(`📧 Email enviado a ${email}: ${subject}`);
    }
};
const smsService = {
    sendSMS: async (phone, message) => {
        console.log(`📱 SMS enviado a ${phone}: ${message}`);
        return { messageId: `sms_${Date.now()}`, status: 'sent' };
    }
};
const pushService = {
    sendPushNotification: async (deviceTokens, payload) => {
        console.log(`🔔 Push notification enviada a ${deviceTokens.length} dispositivos: ${payload.title}`);
    }
};
const notificationLogger = {
    info: (message, metadata) => logger_1.logger.info(message, metadata, 'NotificationService'),
    error: (message, error) => logger_1.logger.error(message, { error }, error, 'NotificationService'),
    warn: (message, metadata) => logger_1.logger.warn(message, metadata, 'NotificationService'),
    debug: (message, metadata) => logger_1.logger.debug(message, metadata, 'NotificationService')
};
var NotificationType;
(function (NotificationType) {
    NotificationType["HEALTH_ALERT"] = "health_alert";
    NotificationType["VACCINATION_REMINDER"] = "vaccination_reminder";
    NotificationType["TREATMENT_REMINDER"] = "treatment_reminder";
    NotificationType["HEALTH_REPORT_READY"] = "health_report_ready";
    NotificationType["LOW_STOCK_ALERT"] = "low_stock_alert";
    NotificationType["EXPIRATION_WARNING"] = "expiration_warning";
    NotificationType["INVENTORY_ADJUSTMENT"] = "inventory_adjustment";
    NotificationType["PURCHASE_ORDER_STATUS"] = "purchase_order_status";
    NotificationType["GEOFENCE_VIOLATION"] = "geofence_violation";
    NotificationType["LOCATION_ALERT"] = "location_alert";
    NotificationType["DEVICE_OFFLINE"] = "device_offline";
    NotificationType["MOVEMENT_ANOMALY"] = "movement_anomaly";
    NotificationType["BOVINE_EVENT"] = "bovine_event";
    NotificationType["REPRODUCTIVE_EVENT"] = "reproductive_event";
    NotificationType["WEIGHT_MILESTONE"] = "weight_milestone";
    NotificationType["AGE_MILESTONE"] = "age_milestone";
    NotificationType["SYSTEM_MAINTENANCE"] = "system_maintenance";
    NotificationType["USER_ACTIVITY"] = "user_activity";
    NotificationType["BACKUP_STATUS"] = "backup_status";
    NotificationType["SECURITY_ALERT"] = "security_alert";
    NotificationType["REPORT_READY"] = "report_ready";
    NotificationType["ANALYSIS_COMPLETE"] = "analysis_complete";
    NotificationType["EXPORT_COMPLETE"] = "export_complete";
    NotificationType["ANNOUNCEMENT"] = "announcement";
    NotificationType["MESSAGE"] = "message";
    NotificationType["REMINDER"] = "reminder";
})(NotificationType || (NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
    NotificationChannel["WHATSAPP"] = "whatsapp";
    NotificationChannel["WEBHOOK"] = "webhook";
})(NotificationChannel || (NotificationChannel = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["PROCESSING"] = "processing";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["READ"] = "read";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["CANCELLED"] = "cancelled";
    NotificationStatus["EXPIRED"] = "expired";
})(NotificationStatus || (NotificationStatus = {}));
var DeliveryFrequency;
(function (DeliveryFrequency) {
    DeliveryFrequency["INSTANT"] = "instant";
    DeliveryFrequency["HOURLY"] = "hourly";
    DeliveryFrequency["DAILY"] = "daily";
    DeliveryFrequency["WEEKLY"] = "weekly";
    DeliveryFrequency["MONTHLY"] = "monthly";
})(DeliveryFrequency || (DeliveryFrequency = {}));
var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["NONE"] = "none";
    RecurrencePattern["DAILY"] = "daily";
    RecurrencePattern["WEEKLY"] = "weekly";
    RecurrencePattern["MONTHLY"] = "monthly";
    RecurrencePattern["YEARLY"] = "yearly";
    RecurrencePattern["CUSTOM"] = "custom";
})(RecurrencePattern || (RecurrencePattern = {}));
class NotificationService extends events_1.EventEmitter {
    constructor() {
        super();
        this.notificationQueue = [];
        this.processingQueue = false;
        this.batchQueues = new Map();
        this.templates = new Map();
        this.rules = new Map();
        this.initializeService();
        this.startQueueProcessor();
        this.loadDefaultTemplates();
    }
    async initializeService() {
        try {
            for (const channel of Object.values(NotificationChannel)) {
                this.batchQueues.set(channel, []);
            }
            await this.loadNotificationRules();
            this.setupEventHandlers();
            notificationLogger.info('Servicio de notificaciones inicializado correctamente');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error inicializando servicio de notificaciones:', errorMessage);
            throw new Error(`Error inicializando servicio: ${errorMessage}`);
        }
    }
    async sendNotification(notificationData) {
        try {
            if (!notificationData.id) {
                notificationData.id = this.generateNotificationId();
            }
            this.validateNotificationData(notificationData);
            const filteredRecipients = await this.filterRecipientsByPreferences(notificationData.recipients, notificationData.type, notificationData.channels);
            if (filteredRecipients.length === 0) {
                notificationLogger.warn(`No hay destinatarios válidos para notificación ${notificationData.id}`);
                return notificationData.id;
            }
            notificationData.recipients = filteredRecipients;
            if (await this.isInQuietHours(notificationData)) {
                notificationData.scheduledAt = await this.getNextAvailableTime(notificationData);
            }
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
            if (notificationData.scheduledAt && notificationData.scheduledAt > new Date()) {
                setTimeout(() => {
                    this.notificationQueue.push(notificationData);
                }, notificationData.scheduledAt.getTime() - Date.now());
            }
            else {
                this.notificationQueue.push(notificationData);
            }
            this.emit('notification:created', notificationData);
            notificationLogger.info(`Notificación ${notificationData.id} encolada para ${filteredRecipients.length} destinatarios`);
            return notificationData.id;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando notificación:', errorMessage);
            throw new Error(`Error enviando notificación: ${errorMessage}`);
        }
    }
    async sendBulkNotification(type, data, recipientFilter = { all: true }) {
        try {
            const recipients = await this.getRecipientsFromFilter(recipientFilter);
            if (recipients.length === 0) {
                throw new Error('No se encontraron destinatarios para la notificación masiva');
            }
            const batchId = this.generateBatchId();
            const batch = {
                id: batchId,
                type,
                totalRecipients: recipients.length,
                sentCount: 0,
                failedCount: 0,
                status: 'pending',
                createdAt: new Date(),
                notifications: []
            };
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
                    }
                });
                batch.notifications.push(notificationId);
            }
            batch.status = 'processing';
            notificationLogger.info(`Notificación masiva ${batchId} creada para ${recipients.length} destinatarios en ${batches.length} lotes`);
            return batchId;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando notificación masiva:', errorMessage);
            throw new Error(`Error enviando notificación masiva: ${errorMessage}`);
        }
    }
    async sendHealthAlert(alertData) {
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
                    category: 'health',
                    tags: ['health', 'alert', alertData.alertType],
                    location: alertData.location
                }
            });
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
                        category: 'health',
                        tags: ['health', 'critical'],
                        location: alertData.location
                    }
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando alerta de salud:', errorMessage);
            throw new Error(`Error enviando alerta de salud: ${errorMessage}`);
        }
    }
    async sendVaccinationReminder(reminderData) {
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
                    category: 'health',
                    tags: ['vaccination', 'reminder'],
                    relatedIds: [reminderData.bovineId]
                }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando recordatorio de vacunación:', errorMessage);
            throw new Error(`Error enviando recordatorio: ${errorMessage}`);
        }
    }
    async sendInventoryAlert(alertData) {
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
                    category: 'inventory',
                    tags: ['inventory', alertData.alertType]
                }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando alerta de inventario:', errorMessage);
            throw new Error(`Error enviando alerta de inventario: ${errorMessage}`);
        }
    }
    async sendLocationAlert(alertData) {
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
                    category: 'location',
                    tags: ['location', alertData.alertType],
                    location: alertData.location
                }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error enviando alerta de ubicación:', errorMessage);
            throw new Error(`Error enviando alerta de ubicación: ${errorMessage}`);
        }
    }
    async getUserPreferences(userId) {
        try {
            const preferences = await NotificationPreference.findOne({
                where: { userId }
            });
            if (!preferences) {
                return await this.createDefaultPreferences(userId);
            }
            return preferences;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error(`Error obteniendo preferencias del usuario ${userId}:`, errorMessage);
            return null;
        }
    }
    async updateUserPreferences(userId, preferences) {
        try {
            const existingPreferences = await this.getUserPreferences(userId);
            if (!existingPreferences) {
                const newPreferences = {
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
            }
            else {
                await NotificationPreference.update(preferences, {
                    where: { userId }
                });
            }
            this.emit('preferences:updated', { userId, preferences });
            notificationLogger.info(`Preferencias actualizadas para usuario ${userId}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error(`Error actualizando preferencias del usuario ${userId}:`, errorMessage);
            throw new Error(`Error actualizando preferencias: ${errorMessage}`);
        }
    }
    async getNotificationStatistics(ranchId, days = 30) {
        try {
            const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
            const statistics = {
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
                },
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notificationLogger.error('Error obteniendo estadísticas de notificaciones:', errorMessage);
            throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
        }
    }
    async startQueueProcessor() {
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
            }
            catch (error) {
                notificationLogger.error('Error procesando cola de notificaciones:', error);
            }
            finally {
                this.processingQueue = false;
            }
        };
        setInterval(processQueue, 5000);
    }
    async processNotification(notification) {
        try {
            await this.updateNotificationStatus(notification.id, NotificationStatus.PROCESSING);
            const results = await Promise.allSettled(notification.channels.map(channel => this.sendToChannel(notification, channel)));
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const finalStatus = successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;
            await this.updateNotificationStatus(notification.id, finalStatus);
            this.emit('notification:processed', {
                id: notification.id,
                status: finalStatus,
                successCount,
                totalChannels: notification.channels.length
            });
            notificationLogger.info(`Notificación ${notification.id} procesada: ${successCount}/${notification.channels.length} canales exitosos`);
        }
        catch (error) {
            await this.updateNotificationStatus(notification.id, NotificationStatus.FAILED);
            notificationLogger.error(`Error procesando notificación ${notification.id}:`, error);
        }
    }
    async sendToChannel(notification, channel) {
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
    async sendEmailNotification(notification) {
        for (const recipient of notification.recipients) {
            if (recipient.email) {
                await emailService.sendNotificationEmail(recipient.email, notification.title, notification.message, notification.metadata?.attachments);
            }
        }
    }
    async sendSMSNotification(notification) {
        for (const recipient of notification.recipients) {
            if (recipient.phone) {
                await smsService.sendSMS(recipient.phone, `${notification.title}: ${notification.message}`);
            }
        }
    }
    async sendPushNotification(notification) {
        const deviceTokens = [];
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
    async sendInAppNotification(notification) {
        this.emit('notification:in_app', notification);
    }
    async sendWhatsAppNotification(notification) {
        notificationLogger.debug('WhatsApp notification not implemented yet');
    }
    async sendWebhookNotification(notification) {
        notificationLogger.debug('Webhook notification not implemented yet');
    }
    validateNotificationData(data) {
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
    async filterRecipientsByPreferences(recipients, type, channels) {
        const filtered = [];
        for (const recipient of recipients) {
            const preferences = await this.getUserPreferences(recipient.userId);
            if (!preferences) {
                filtered.push(recipient);
                continue;
            }
            const typePreference = preferences.categories[type];
            if (typePreference && !typePreference.enabled) {
                continue;
            }
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
    async isInQuietHours(notification) {
        for (const recipient of notification.recipients) {
            const preferences = await this.getUserPreferences(recipient.userId);
            if (preferences) {
                for (const channel of notification.channels) {
                    const channelPrefs = preferences.channels[channel];
                    if (channelPrefs?.quietHours?.enabled) {
                        const now = new Date();
                        const timezone = recipient.timezone || preferences.globalSettings.timezone;
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
    async getNextAvailableTime(notification) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        return tomorrow;
    }
    generateInventoryMessage(alertData) {
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
    async getHealthAlertRecipients(ranchId, veterinarianId) {
        const recipients = [
            { userId: 'owner_1', email: 'owner@ranch.com', phone: '+521234567890' }
        ];
        if (veterinarianId) {
            recipients.push({ userId: veterinarianId, email: 'vet@clinic.com' });
        }
        return recipients;
    }
    async getCriticalAlertRecipients(ranchId) {
        return [
            { userId: 'owner_1', phone: '+521234567890' },
            { userId: 'manager_1', phone: '+521234567891' }
        ];
    }
    async getVaccinationReminderRecipients(ranchId, ownerEmail) {
        const recipients = [];
        if (ownerEmail) {
            recipients.push({ userId: 'owner_1', email: ownerEmail });
        }
        return recipients;
    }
    async getInventoryAlertRecipients(ranchId) {
        return [
            { userId: 'inventory_manager', email: 'inventario@ranch.com' }
        ];
    }
    async getLocationAlertRecipients(ranchId) {
        return [
            { userId: 'ranch_manager', email: 'manager@ranch.com' }
        ];
    }
    async getRecipientsFromFilter(filter) {
        return [
            { userId: 'user_1', email: 'user1@ranch.com' },
            { userId: 'user_2', email: 'user2@ranch.com' }
        ];
    }
    async createDefaultPreferences(userId) {
        const defaultPreferences = {
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
    async loadNotificationRules() {
        notificationLogger.debug('Cargando reglas de notificación');
    }
    async loadDefaultTemplates() {
        notificationLogger.debug('Cargando templates de notificación');
    }
    setupEventHandlers() {
        this.on('notification:created', (data) => {
            notificationLogger.debug(`Evento: Notificación ${data.id} creada`);
        });
        this.on('notification:processed', (data) => {
            notificationLogger.debug(`Evento: Notificación ${data.id} procesada`);
        });
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    async updateNotificationStatus(id, status) {
        await Notification.update({ status, updatedAt: new Date() }, { where: { id } });
    }
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.js.map