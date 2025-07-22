// Interfaces temporales para nodemailer
interface MockTransporter {
  sendMail: (options: any) => Promise<{ messageId: string }>;
}

interface MockNodemailer {
  createTransporter: (config: any) => MockTransporter;
}

// Mock temporal de nodemailer
const nodemailer: MockNodemailer = {
  createTransporter: (config: any) => ({
    sendMail: async (options: any) => ({
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    })
  })
};

// Mock temporal de handlebars
const handlebars = {
  compile: (template: string) => {
    return (variables: Record<string, any>) => {
      let result = template;
      Object.keys(variables).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(placeholder, String(variables[key] || ''));
      });
      return result;
    };
  }
};

// Usar el sistema de logging real
import { logInfo, logError, logWarn } from '../utils/logger';

// Logger adaptador para mantener compatibilidad
const logger = {
  info: (message: string, metadata?: any) => logInfo(message, metadata, 'EmailService'),
  error: (message: string, error?: any) => logError(message, { error }, error as Error, 'EmailService'),
  warn: (message: string, metadata?: any) => logWarn(message, metadata, 'EmailService')
};

// Enums para tipos de email
enum EmailType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  VACCINATION_REMINDER = 'vaccination_reminder',
  HEALTH_ALERT = 'health_alert',
  SYSTEM_NOTIFICATION = 'system_notification',
  WEEKLY_REPORT = 'weekly_report',
  EMERGENCY_ALERT = 'emergency_alert',
  REGISTRATION_CONFIRMATION = 'registration_confirmation',
  ACCOUNT_LOCKED = 'account_locked',
  PROFILE_UPDATED = 'profile_updated'
}

enum EmailPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum EmailFrequency {
  INSTANT = 'instant',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

// Interfaces principales
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  variables: Record<string, any>;
}

interface EmailOptions {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  priority?: EmailPriority;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer;
  contentType?: string;
}

interface BulkEmailOptions {
  recipients: EmailRecipient[];
  template: EmailType;
  variables: Record<string, any>;
  priority?: EmailPriority;
  sendAt?: Date;
}

interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
}

interface EmailQueueItem {
  id: string;
  type: EmailType;
  options: EmailOptions;
  priority: EmailPriority;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  createdAt: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
}

interface EmailStatistics {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  deliveryRate: number;
  bounceRate: number;
  openRate: number;
  clickRate: number;
  lastSentAt?: Date;
}

interface VaccinationReminderData {
  bovineEarTag: string;
  bovineName?: string;
  vaccineType: string;
  dueDate: Date;
  veterinarianName: string;
  ranchName: string;
  ownerName: string;
}

interface HealthAlertData {
  bovineEarTag: string;
  bovineName?: string;
  healthStatus: string;
  symptoms?: string[];
  severity: string;
  veterinarianName?: string;
  ranchName: string;
  ownerName: string;
  location: string;
  reportedAt: Date;
}

interface WeeklyReportData {
  ranchName: string;
  ownerName: string;
  period: {
    start: Date;
    end: Date;
  };
  statistics: {
    totalBovines: number;
    newBovines: number;
    healthyBovines: number;
    sickBovines: number;
    vaccinationsCompleted: number;
    upcomingVaccinations: number;
    births: number;
    deaths: number;
  };
  alerts: {
    criticalAlerts: number;
    vaccinationsDue: number;
    healthConcerns: number;
  };
}

class EmailService {
  private transporter!: MockTransporter; // Usamos definite assignment assertion
  private emailQueue: EmailQueueItem[] = [];
  private templates: Map<EmailType, EmailTemplate> = new Map();
  private isProcessingQueue = false;
  private config!: EmailConfig; // También para config

  constructor() {
    this.initializeConfig();
    this.initializeTransporter();
    this.loadEmailTemplates();
    this.startQueueProcessor();
  }

  /**
   * Inicializa la configuración de email
   */
  private initializeConfig(): void {
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

  /**
   * Inicializa el transportador de email con la configuración SMTP
   */
  private initializeTransporter(): void {
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
    } catch (error) {
      logger.error('Error inicializando transportador de email', error);
      throw error;
    }
  }

  /**
   * Carga las plantillas de email desde archivos o base de datos
   */
  private async loadEmailTemplates(): Promise<void> {
    try {
      // Cargar plantillas desde archivos (implementación simplificada)
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
    } catch (error) {
      logger.error('Error cargando plantillas de email', error);
      throw error;
    }
  }

  /**
   * Envía un email de bienvenida al usuario
   * @param email - Email del destinatario
   * @param firstName - Nombre del usuario
   * @returns Promise<void>
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const template = this.templates.get(EmailType.WELCOME);
      if (!template) {
        throw new Error('Plantilla de bienvenida no encontrada');
      }

      const emailOptions: EmailOptions = {
        to: email,
        subject: template.subject,
        html: this.processTemplate(template.html, { firstName, year: new Date().getFullYear() }),
        text: this.processTemplate(template.text, { firstName }),
        priority: EmailPriority.LOW
      };

      await this.queueEmail(EmailType.WELCOME, emailOptions);
      logger.info(`Email de bienvenida encolado para ${email}`, { firstName });

    } catch (error) {
      logger.error(`Error enviando email de bienvenida a ${email}`, error);
      throw error;
    }
  }

  /**
   * Envía un email para restablecer contraseña
   * @param email - Email del destinatario
   * @param resetToken - Token de restablecimiento
   * @param firstName - Nombre del usuario
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<void> {
    try {
      const template = this.templates.get(EmailType.PASSWORD_RESET);
      if (!template) {
        throw new Error('Plantilla de reset de contraseña no encontrada');
      }

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

      const emailOptions: EmailOptions = {
        to: email,
        subject: template.subject,
        html: this.processTemplate(template.html, { firstName, resetLink, resetToken }),
        text: this.processTemplate(template.text, { firstName, resetLink }),
        priority: EmailPriority.HIGH
      };

      await this.queueEmail(EmailType.PASSWORD_RESET, emailOptions);
      logger.info(`Email de reset de contraseña encolado para ${email}`, { firstName, resetToken: 'hidden' });

    } catch (error) {
      logger.error(`Error enviando email de reset de contraseña a ${email}`, error);
      throw error;
    }
  }

  /**
   * Envía recordatorio de vacunación
   * @param email - Email del destinatario
   * @param reminderData - Datos del recordatorio
   * @returns Promise<void>
   */
  async sendVaccinationReminder(email: string, reminderData: VaccinationReminderData): Promise<void> {
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

      const emailOptions: EmailOptions = {
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

    } catch (error) {
      logger.error(`Error enviando recordatorio de vacunación a ${email}`, error);
      throw error;
    }
  }

  /**
   * Envía alerta de salud crítica
   * @param email - Email del destinatario
   * @param alertData - Datos de la alerta
   * @returns Promise<void>
   */
  async sendHealthAlert(email: string, alertData: HealthAlertData): Promise<void> {
    try {
      const template = this.templates.get(EmailType.HEALTH_ALERT);
      if (!template) {
        throw new Error('Plantilla de alerta de salud no encontrada');
      }

      const emailOptions: EmailOptions = {
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

      // Las alertas críticas se envían inmediatamente
      await this.sendEmailImmediate(emailOptions);
      logger.info(`Alerta de salud enviada inmediatamente a ${email}`, {
        bovineEarTag: alertData.bovineEarTag,
        severity: alertData.severity,
        healthStatus: alertData.healthStatus
      });

    } catch (error) {
      logger.error(`Error enviando alerta de salud a ${email}`, error);
      throw error;
    }
  }

  /**
   * Envía reporte semanal
   * @param email - Email del destinatario
   * @param reportData - Datos del reporte
   * @returns Promise<void>
   */
  async sendWeeklyReport(email: string, reportData: WeeklyReportData): Promise<void> {
    try {
      const template = this.templates.get(EmailType.WEEKLY_REPORT);
      if (!template) {
        throw new Error('Plantilla de reporte semanal no encontrada');
      }

      const healthPercentage = reportData.statistics.totalBovines > 0 
        ? Math.round((reportData.statistics.healthyBovines / reportData.statistics.totalBovines) * 100)
        : 0;

      const emailOptions: EmailOptions = {
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

    } catch (error) {
      logger.error(`Error enviando reporte semanal a ${email}`, error);
      throw error;
    }
  }

  /**
   * Envía emails en lotes
   * @param bulkOptions - Opciones de envío masivo
   * @returns Promise<void>
   */
  async sendBulkEmails(bulkOptions: BulkEmailOptions): Promise<void> {
    try {
      const template = this.templates.get(bulkOptions.template);
      if (!template) {
        throw new Error(`Plantilla ${bulkOptions.template} no encontrada`);
      }

      for (const recipient of bulkOptions.recipients) {
        const variables = { ...bulkOptions.variables, ...recipient.variables };
        
        const emailOptions: EmailOptions = {
          to: recipient.email,
          subject: this.processTemplate(template.subject, variables),
          html: this.processTemplate(template.html, variables),
          text: this.processTemplate(template.text, variables),
          priority: bulkOptions.priority || EmailPriority.MEDIUM
        };

        if (bulkOptions.sendAt) {
          await this.scheduleEmail(bulkOptions.template, emailOptions, bulkOptions.sendAt);
        } else {
          await this.queueEmail(bulkOptions.template, emailOptions);
        }
      }

      logger.info(`${bulkOptions.recipients.length} emails en lote encolados`, {
        template: bulkOptions.template,
        recipientCount: bulkOptions.recipients.length,
        scheduledFor: bulkOptions.sendAt
      });

    } catch (error) {
      logger.error('Error enviando emails en lote', error);
      throw error;
    }
  }

  /**
   * Encola un email para procesamiento posterior
   * @param type - Tipo de email
   * @param options - Opciones de email
   * @returns Promise<void>
   */
  private async queueEmail(type: EmailType, options: EmailOptions): Promise<void> {
    const queueItem: EmailQueueItem = {
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

  /**
   * Programa un email para envío futuro
   * @param type - Tipo de email
   * @param options - Opciones de email
   * @param sendAt - Fecha de envío
   * @returns Promise<void>
   */
  private async scheduleEmail(type: EmailType, options: EmailOptions, sendAt: Date): Promise<void> {
    const queueItem: EmailQueueItem = {
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

  /**
   * Envía un email inmediatamente (para alertas críticas)
   * @param options - Opciones de email
   * @returns Promise<void>
   */
  private async sendEmailImmediate(options: EmailOptions): Promise<void> {
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

    } catch (error) {
      logger.error(`Error enviando email inmediato a ${options.to}`, error);
      throw error;
    }
  }

  /**
   * Procesa la cola de emails
   */
  private async startQueueProcessor(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;

    const processQueue = async () => {
      try {
        const now = new Date();
        const itemsToProcess = this.emailQueue.filter(
          item => item.status === 'pending' && item.scheduledAt <= now
        );

        for (const item of itemsToProcess) {
          await this.processQueueItem(item);
        }

        // Limpiar items enviados o fallados (mantener solo los últimos 1000)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.emailQueue = this.emailQueue
          .filter(item => item.status === 'pending' || item.createdAt > oneDayAgo)
          .slice(-1000);

      } catch (error) {
        logger.error('Error procesando cola de emails', error);
      }

      // Procesar cada 30 segundos
      setTimeout(processQueue, 30000);
    };

    processQueue();
    logger.info('Procesador de cola de emails iniciado');
  }

  /**
   * Procesa un item individual de la cola
   * @param item - Item de la cola
   */
  private async processQueueItem(item: EmailQueueItem): Promise<void> {
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error enviando email desde cola (intento ${item.attempts})`, {
        error: errorMessage,
        emailTo: item.options.to,
        type: item.type
      });
      
      if (item.attempts >= item.maxAttempts) {
        item.status = 'failed';
        item.error = errorMessage;
      } else {
        item.status = 'pending';
        // Retry después de 5min * número de intentos
        item.scheduledAt = new Date(Date.now() + (item.attempts * 300000));
      }
    }
  }

  /**
   * Procesa plantilla con variables usando Handlebars
   * @param template - Plantilla a procesar
   * @param variables - Variables para reemplazar
   * @returns Plantilla procesada
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(variables);
  }

  /**
   * Obtiene estadísticas de envío de emails
   * @param days - Días hacia atrás para calcular estadísticas
   * @returns Estadísticas de email
   */
  async getEmailStatistics(days: number = 7): Promise<EmailStatistics> {
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
      bounceRate: 0, // Se implementará con webhooks del proveedor de email
      openRate: 0,   // Se implementará con tracking de apertura
      clickRate: 0,  // Se implementará con tracking de clicks
      lastSentAt: lastSentEmail?.createdAt
    };
  }

  /**
   * Obtiene valor numérico de prioridad para ordenamiento
   * @param priority - Prioridad del email
   * @returns Valor numérico
   */
  private getPriorityValue(priority: EmailPriority): number {
    switch (priority) {
      case EmailPriority.CRITICAL: return 4;
      case EmailPriority.HIGH: return 3;
      case EmailPriority.MEDIUM: return 2;
      case EmailPriority.LOW: return 1;
      default: return 2;
    }
  }

  /**
   * Genera un ID único para el email
   * @returns ID único
   */
  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Templates HTML simplificados (en producción estarían en archivos separados)
  private getWelcomeTemplate(): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #16a34a;">¡Bienvenido al Sistema Ganadero UJAT! 🐄</h1>
        <p>Estimado/a <strong>{{firstName}}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes gestionar tu ganado de manera eficiente y segura.</p>
        <p>© {{year}} Universidad Juárez Autónoma de Tabasco</p>
      </div>
    `;
  }

  private getPasswordResetTemplate(): string {
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

  private getVaccinationReminderTemplate(): string {
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

  private getHealthAlertTemplate(): string {
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

  private getWeeklyReportTemplate(): string {
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

// Exportar instancia única del servicio
export const emailService = new EmailService();