"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer = {
    createTransporter: (config) => ({
        sendMail: async (options) => ({
            messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        })
    })
};
const handlebars = {
    compile: (template) => {
        return (variables) => {
            let result = template;
            Object.keys(variables).forEach(key => {
                const placeholder = new RegExp(`{{${key}}}`, 'g');
                result = result.replace(placeholder, String(variables[key] || ''));
            });
            return result;
        };
    }
};
const logger_1 = require("../utils/logger");
const logger = {
    info: (message, metadata) => (0, logger_1.logInfo)(message, metadata, 'EmailService'),
    error: (message, error) => (0, logger_1.logError)(message, { error }, error, 'EmailService'),
    warn: (message, metadata) => (0, logger_1.logWarn)(message, metadata, 'EmailService')
};
var EmailType;
(function (EmailType) {
    EmailType["WELCOME"] = "welcome";
    EmailType["PASSWORD_RESET"] = "password_reset";
    EmailType["VACCINATION_REMINDER"] = "vaccination_reminder";
    EmailType["HEALTH_ALERT"] = "health_alert";
    EmailType["SYSTEM_NOTIFICATION"] = "system_notification";
    EmailType["WEEKLY_REPORT"] = "weekly_report";
    EmailType["EMERGENCY_ALERT"] = "emergency_alert";
    EmailType["REGISTRATION_CONFIRMATION"] = "registration_confirmation";
    EmailType["ACCOUNT_LOCKED"] = "account_locked";
    EmailType["PROFILE_UPDATED"] = "profile_updated";
})(EmailType || (EmailType = {}));
var EmailPriority;
(function (EmailPriority) {
    EmailPriority["LOW"] = "low";
    EmailPriority["MEDIUM"] = "medium";
    EmailPriority["HIGH"] = "high";
    EmailPriority["CRITICAL"] = "critical";
})(EmailPriority || (EmailPriority = {}));
var EmailFrequency;
(function (EmailFrequency) {
    EmailFrequency["INSTANT"] = "instant";
    EmailFrequency["HOURLY"] = "hourly";
    EmailFrequency["DAILY"] = "daily";
    EmailFrequency["WEEKLY"] = "weekly";
})(EmailFrequency || (EmailFrequency = {}));
class EmailService {
    constructor() {
        this.emailQueue = [];
        this.templates = new Map();
        this.isProcessingQueue = false;
        this.initializeConfig();
        this.initializeTransporter();
        this.loadEmailTemplates();
        this.startQueueProcessor();
    }
    initializeConfig() {
        this.config = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER || '',
            password: process.env.SMTP_PASSWORD || '',
            fromName: process.env.FROM_NAME || 'Sistema Ganadero UJAT',
            fromEmail: process.env.FROM_EMAIL || 'noreply@ganadero-ujat.com'
        };
    }
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransporter({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.user,
                    pass: this.config.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            logger.info('Transportador de email inicializado correctamente', {
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure
            });
        }
        catch (error) {
            logger.error('Error inicializando transportador de email', error);
            throw error;
        }
    }
    async loadEmailTemplates() {
        try {
            this.templates.set(EmailType.WELCOME, {
                subject: '¡Bienvenido al Sistema Ganadero UJAT! 🐄',
                html: this.getWelcomeTemplate(),
                text: 'Bienvenido {{firstName}} al Sistema Ganadero UJAT. Tu cuenta ha sido creada exitosamente.',
                variables: {}
            });
            this.templates.set(EmailType.PASSWORD_RESET, {
                subject: 'Restablece tu contraseña - Sistema Ganadero UJAT',
                html: this.getPasswordResetTemplate(),
                text: 'Hola {{firstName}}, solicitas restablecer tu contraseña. Usa este enlace: {{resetLink}}',
                variables: {}
            });
            this.templates.set(EmailType.VACCINATION_REMINDER, {
                subject: '🏥 Recordatorio de Vacunación - {{vaccineType}}',
                html: this.getVaccinationReminderTemplate(),
                text: 'Recordatorio: El bovino {{bovineEarTag}} necesita vacunación de {{vaccineType}} para el {{dueDate}}.',
                variables: {}
            });
            this.templates.set(EmailType.HEALTH_ALERT, {
                subject: '🚨 ALERTA DE SALUD - Bovino {{bovineEarTag}}',
                html: this.getHealthAlertTemplate(),
                text: 'ALERTA: El bovino {{bovineEarTag}} presenta problemas de salud que requieren atención inmediata.',
                variables: {}
            });
            this.templates.set(EmailType.WEEKLY_REPORT, {
                subject: '📊 Reporte Semanal - {{ranchName}}',
                html: this.getWeeklyReportTemplate(),
                text: 'Reporte semanal de tu rancho {{ranchName}} del {{periodStart}} al {{periodEnd}}.',
                variables: {}
            });
            logger.info('Plantillas de email cargadas correctamente', {
                templateCount: this.templates.size
            });
        }
        catch (error) {
            logger.error('Error cargando plantillas de email', error);
            throw error;
        }
    }
    async sendWelcomeEmail(email, firstName) {
        try {
            const template = this.templates.get(EmailType.WELCOME);
            if (!template) {
                throw new Error('Plantilla de bienvenida no encontrada');
            }
            const emailOptions = {
                to: email,
                subject: template.subject,
                html: this.processTemplate(template.html, { firstName, year: new Date().getFullYear() }),
                text: this.processTemplate(template.text, { firstName }),
                priority: EmailPriority.LOW
            };
            await this.queueEmail(EmailType.WELCOME, emailOptions);
            logger.info(`Email de bienvenida encolado para ${email}`, { firstName });
        }
        catch (error) {
            logger.error(`Error enviando email de bienvenida a ${email}`, error);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, resetToken, firstName) {
        try {
            const template = this.templates.get(EmailType.PASSWORD_RESET);
            if (!template) {
                throw new Error('Plantilla de reset de contraseña no encontrada');
            }
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
            const emailOptions = {
                to: email,
                subject: template.subject,
                html: this.processTemplate(template.html, { firstName, resetLink, resetToken }),
                text: this.processTemplate(template.text, { firstName, resetLink }),
                priority: EmailPriority.HIGH
            };
            await this.queueEmail(EmailType.PASSWORD_RESET, emailOptions);
            logger.info(`Email de reset de contraseña encolado para ${email}`, { firstName, resetToken: 'hidden' });
        }
        catch (error) {
            logger.error(`Error enviando email de reset de contraseña a ${email}`, error);
            throw error;
        }
    }
    async sendVaccinationReminder(email, reminderData) {
        try {
            const template = this.templates.get(EmailType.VACCINATION_REMINDER);
            if (!template) {
                throw new Error('Plantilla de recordatorio de vacunación no encontrada');
            }
            const formattedDate = reminderData.dueDate.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const daysUntilDue = Math.ceil((reminderData.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const emailOptions = {
                to: email,
                subject: this.processTemplate(template.subject, {
                    vaccineType: reminderData.vaccineType,
                    bovineEarTag: reminderData.bovineEarTag
                }),
                html: this.processTemplate(template.html, {
                    ...reminderData,
                    formattedDate,
                    daysUntilDue
                }),
                text: this.processTemplate(template.text, { ...reminderData, dueDate: formattedDate }),
                priority: EmailPriority.HIGH
            };
            await this.queueEmail(EmailType.VACCINATION_REMINDER, emailOptions);
            logger.info(`Recordatorio de vacunación encolado para ${email}`, {
                bovineEarTag: reminderData.bovineEarTag,
                vaccineType: reminderData.vaccineType,
                daysUntilDue
            });
        }
        catch (error) {
            logger.error(`Error enviando recordatorio de vacunación a ${email}`, error);
            throw error;
        }
    }
    async sendHealthAlert(email, alertData) {
        try {
            const template = this.templates.get(EmailType.HEALTH_ALERT);
            if (!template) {
                throw new Error('Plantilla de alerta de salud no encontrada');
            }
            const emailOptions = {
                to: email,
                subject: this.processTemplate(template.subject, {
                    bovineEarTag: alertData.bovineEarTag,
                    severity: alertData.severity
                }),
                html: this.processTemplate(template.html, {
                    ...alertData,
                    symptomsList: alertData.symptoms?.join(', ') || 'No especificados',
                    reportedTime: alertData.reportedAt.toLocaleString('es-MX')
                }),
                text: this.processTemplate(template.text, alertData),
                priority: EmailPriority.CRITICAL
            };
            await this.sendEmailImmediate(emailOptions);
            logger.info(`Alerta de salud enviada inmediatamente a ${email}`, {
                bovineEarTag: alertData.bovineEarTag,
                severity: alertData.severity,
                healthStatus: alertData.healthStatus
            });
        }
        catch (error) {
            logger.error(`Error enviando alerta de salud a ${email}`, error);
            throw error;
        }
    }
    async sendWeeklyReport(email, reportData) {
        try {
            const template = this.templates.get(EmailType.WEEKLY_REPORT);
            if (!template) {
                throw new Error('Plantilla de reporte semanal no encontrada');
            }
            const healthPercentage = reportData.statistics.totalBovines > 0
                ? Math.round((reportData.statistics.healthyBovines / reportData.statistics.totalBovines) * 100)
                : 0;
            const emailOptions = {
                to: email,
                subject: this.processTemplate(template.subject, {
                    ranchName: reportData.ranchName
                }),
                html: this.processTemplate(template.html, {
                    ...reportData,
                    periodStart: reportData.period.start.toLocaleDateString('es-MX'),
                    periodEnd: reportData.period.end.toLocaleDateString('es-MX'),
                    healthPercentage
                }),
                text: this.processTemplate(template.text, reportData),
                priority: EmailPriority.LOW
            };
            await this.queueEmail(EmailType.WEEKLY_REPORT, emailOptions);
            logger.info(`Reporte semanal encolado para ${email}`, {
                ranchName: reportData.ranchName,
                totalBovines: reportData.statistics.totalBovines,
                healthPercentage
            });
        }
        catch (error) {
            logger.error(`Error enviando reporte semanal a ${email}`, error);
            throw error;
        }
    }
    async sendBulkEmails(bulkOptions) {
        try {
            const template = this.templates.get(bulkOptions.template);
            if (!template) {
                throw new Error(`Plantilla ${bulkOptions.template} no encontrada`);
            }
            for (const recipient of bulkOptions.recipients) {
                const variables = { ...bulkOptions.variables, ...recipient.variables };
                const emailOptions = {
                    to: recipient.email,
                    subject: this.processTemplate(template.subject, variables),
                    html: this.processTemplate(template.html, variables),
                    text: this.processTemplate(template.text, variables),
                    priority: bulkOptions.priority || EmailPriority.MEDIUM
                };
                if (bulkOptions.sendAt) {
                    await this.scheduleEmail(bulkOptions.template, emailOptions, bulkOptions.sendAt);
                }
                else {
                    await this.queueEmail(bulkOptions.template, emailOptions);
                }
            }
            logger.info(`${bulkOptions.recipients.length} emails en lote encolados`, {
                template: bulkOptions.template,
                recipientCount: bulkOptions.recipients.length,
                scheduledFor: bulkOptions.sendAt
            });
        }
        catch (error) {
            logger.error('Error enviando emails en lote', error);
            throw error;
        }
    }
    async queueEmail(type, options) {
        const queueItem = {
            id: this.generateEmailId(),
            type,
            options,
            priority: options.priority || EmailPriority.MEDIUM,
            attempts: 0,
            maxAttempts: 3,
            scheduledAt: new Date(),
            createdAt: new Date(),
            status: 'pending'
        };
        this.emailQueue.push(queueItem);
        this.emailQueue.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    }
    async scheduleEmail(type, options, sendAt) {
        const queueItem = {
            id: this.generateEmailId(),
            type,
            options,
            priority: options.priority || EmailPriority.MEDIUM,
            attempts: 0,
            maxAttempts: 3,
            scheduledAt: sendAt,
            createdAt: new Date(),
            status: 'pending'
        };
        this.emailQueue.push(queueItem);
    }
    async sendEmailImmediate(options) {
        try {
            const mailOptions = {
                from: `${this.config.fromName} <${this.config.fromEmail}>`,
                ...options
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger.info(`Email enviado inmediatamente a ${options.to}`, {
                messageId: result.messageId,
                subject: options.subject
            });
        }
        catch (error) {
            logger.error(`Error enviando email inmediato a ${options.to}`, error);
            throw error;
        }
    }
    async startQueueProcessor() {
        if (this.isProcessingQueue) {
            return;
        }
        this.isProcessingQueue = true;
        const processQueue = async () => {
            try {
                const now = new Date();
                const itemsToProcess = this.emailQueue.filter(item => item.status === 'pending' && item.scheduledAt <= now);
                for (const item of itemsToProcess) {
                    await this.processQueueItem(item);
                }
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                this.emailQueue = this.emailQueue
                    .filter(item => item.status === 'pending' || item.createdAt > oneDayAgo)
                    .slice(-1000);
            }
            catch (error) {
                logger.error('Error procesando cola de emails', error);
            }
            setTimeout(processQueue, 30000);
        };
        processQueue();
        logger.info('Procesador de cola de emails iniciado');
    }
    async processQueueItem(item) {
        try {
            item.status = 'processing';
            item.attempts++;
            const mailOptions = {
                from: `${this.config.fromName} <${this.config.fromEmail}>`,
                ...item.options
            };
            const result = await this.transporter.sendMail(mailOptions);
            item.status = 'sent';
            logger.info(`Email enviado desde cola a ${item.options.to}`, {
                messageId: result.messageId,
                type: item.type,
                attempts: item.attempts
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error enviando email desde cola (intento ${item.attempts})`, {
                error: errorMessage,
                emailTo: item.options.to,
                type: item.type
            });
            if (item.attempts >= item.maxAttempts) {
                item.status = 'failed';
                item.error = errorMessage;
            }
            else {
                item.status = 'pending';
                item.scheduledAt = new Date(Date.now() + (item.attempts * 300000));
            }
        }
    }
    processTemplate(template, variables) {
        const compiledTemplate = handlebars.compile(template);
        return compiledTemplate(variables);
    }
    async getEmailStatistics(days = 7) {
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        const recentEmails = this.emailQueue.filter(item => item.createdAt >= cutoffDate);
        const totalSent = recentEmails.filter(item => item.status === 'sent').length;
        const totalFailed = recentEmails.filter(item => item.status === 'failed').length;
        const totalPending = recentEmails.filter(item => item.status === 'pending').length;
        const totalEmails = recentEmails.length;
        const deliveryRate = totalEmails > 0 ? (totalSent / totalEmails) * 100 : 0;
        const lastSentEmail = recentEmails
            .filter(item => item.status === 'sent')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        return {
            totalSent,
            totalFailed,
            totalPending,
            deliveryRate: Math.round(deliveryRate * 100) / 100,
            bounceRate: 0,
            openRate: 0,
            clickRate: 0,
            lastSentAt: lastSentEmail?.createdAt
        };
    }
    getPriorityValue(priority) {
        switch (priority) {
            case EmailPriority.CRITICAL: return 4;
            case EmailPriority.HIGH: return 3;
            case EmailPriority.MEDIUM: return 2;
            case EmailPriority.LOW: return 1;
            default: return 2;
        }
    }
    generateEmailId() {
        return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    getWelcomeTemplate() {
        return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #16a34a;">¡Bienvenido al Sistema Ganadero UJAT! 🐄</h1>
        <p>Estimado/a <strong>{{firstName}}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes gestionar tu ganado de manera eficiente y segura.</p>
        <p>© {{year}} Universidad Juárez Autónoma de Tabasco</p>
      </div>
    `;
    }
    getPasswordResetTemplate() {
        return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #dc2626;">Restablece tu contraseña</h1>
        <p>Hola <strong>{{firstName}}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="{{resetLink}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Restablecer contraseña
        </a>
        <p><small>Este enlace expira en 1 hora.</small></p>
      </div>
    `;
    }
    getVaccinationReminderTemplate() {
        return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #3b82f6;">🏥 Recordatorio de Vacunación</h1>
        <p>Estimado/a <strong>{{ownerName}}</strong>,</p>
        <p>El bovino <strong>{{bovineEarTag}}</strong> necesita vacunación de <strong>{{vaccineType}}</strong>.</p>
        <p><strong>Fecha programada:</strong> {{formattedDate}}</p>
        <p><strong>Días restantes:</strong> {{daysUntilDue}}</p>
        <p><strong>Veterinario asignado:</strong> {{veterinarianName}}</p>
        <p><strong>Rancho:</strong> {{ranchName}}</p>
      </div>
    `;
    }
    getHealthAlertTemplate() {
        return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #dc2626;">🚨 ALERTA DE SALUD</h1>
        <p>Estimado/a <strong>{{ownerName}}</strong>,</p>
        <p>El bovino <strong>{{bovineEarTag}}</strong> presenta problemas de salud que requieren atención inmediata.</p>
        <p><strong>Estado:</strong> {{healthStatus}}</p>
        <p><strong>Severidad:</strong> {{severity}}</p>
        <p><strong>Síntomas:</strong> {{symptomsList}}</p>
        <p><strong>Ubicación:</strong> {{location}}</p>
        <p><strong>Reportado:</strong> {{reportedTime}}</p>
      </div>
    `;
    }
    getWeeklyReportTemplate() {
        return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #059669;">📊 Reporte Semanal</h1>
        <p>Estimado/a <strong>{{ownerName}}</strong>,</p>
        <p>Aquí está el resumen semanal de <strong>{{ranchName}}</strong> ({{periodStart}} - {{periodEnd}}):</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1;">Estadísticas Generales</h3>
          <ul style="list-style: none; padding: 0;">
            <li>📊 Total de bovinos: {{statistics.totalBovines}}</li>
            <li>✅ Bovinos sanos: {{statistics.healthyBovines}} ({{healthPercentage}}%)</li>
            <li>💉 Vacunaciones completadas: {{statistics.vaccinationsCompleted}}</li>
            <li>⏰ Vacunaciones pendientes: {{statistics.upcomingVaccinations}}</li>
            <li>🐄 Nuevos nacimientos: {{statistics.births}}</li>
          </ul>
        </div>
        <div style="background: #fef7cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #a16207;">Alertas</h3>
          <ul style="list-style: none; padding: 0;">
            <li>🚨 Alertas críticas: {{alerts.criticalAlerts}}</li>
            <li>💉 Vacunaciones vencidas: {{alerts.vaccinationsDue}}</li>
            <li>🏥 Problemas de salud: {{alerts.healthConcerns}}</li>
          </ul>
        </div>
      </div>
    `;
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.js.map