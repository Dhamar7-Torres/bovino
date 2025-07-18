import { api, apiClient } from "./api";

// Interfaces para eventos
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

interface BaseEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  priority: EventPriority;
  location: Location;
  scheduledDate: Date;
  completedDate?: Date;
  status: EventStatus;
  bovineId?: string;
  veterinarianId?: string;
  notes?: string;
  attachments?: EventAttachment[];
  reminders?: EventReminder[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface VaccinationEvent extends BaseEvent {
  eventType: EventType.VACCINATION;
  vaccinationData: {
    vaccineType: string;
    vaccineName: string;
    manufacturer: string;
    batchNumber: string;
    dose: string;
    administrationRoute: AdministrationRoute;
    nextDueDate?: Date;
    reactions?: string[];
  };
}

interface IllnessEvent extends BaseEvent {
  eventType: EventType.ILLNESS;
  illnessData: {
    diseaseName: string;
    symptoms: string[];
    severity: IllnessSeverity;
    diagnosisMethod: string;
    treatment?: string;
    medications?: Medication[];
    quarantineRequired: boolean;
    isContagious: boolean;
    expectedRecoveryDate?: Date;
  };
}

interface RoutineCheckEvent extends BaseEvent {
  eventType: EventType.ROUTINE_CHECK;
  checkupData: {
    weight?: number;
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    bodyConditionScore?: number;
    findings: string[];
    recommendations: string[];
  };
}

interface BreedingEvent extends BaseEvent {
  eventType: EventType.BREEDING;
  breedingData: {
    breedingType: "natural" | "artificial_insemination";
    sireId?: string;
    expectedCalvingDate?: Date;
    pregnancyStatus?: "confirmed" | "suspected" | "negative";
    gestationDays?: number;
  };
}

interface ManagementEvent extends BaseEvent {
  eventType: EventType.MANAGEMENT;
  managementData: {
    activityType: ManagementActivity;
    equipment?: string[];
    materials?: string[];
    duration?: number; // en minutos
    cost?: number;
    laborHours?: number;
  };
}

// Union type para todos los tipos de eventos
type Event =
  | VaccinationEvent
  | IllnessEvent
  | RoutineCheckEvent
  | BreedingEvent
  | ManagementEvent;

// Enums y tipos
enum EventType {
  VACCINATION = "vaccination",
  ILLNESS = "illness",
  ROUTINE_CHECK = "routine_check",
  BREEDING = "breeding",
  MANAGEMENT = "management",
  FEEDING = "feeding",
  TREATMENT = "treatment",
  EMERGENCY = "emergency",
}

enum EventStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DELAYED = "delayed",
  OVERDUE = "overdue",
}

enum EventPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

enum IllnessSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

enum AdministrationRoute {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  ORAL = "oral",
  TOPICAL = "topical",
  INTRANASAL = "intranasal",
}

enum ManagementActivity {
  WEIGHING = "weighing",
  DEWORMING = "deworming",
  HOOF_TRIMMING = "hoof_trimming",
  EAR_TAGGING = "ear_tagging",
  PREGNANCY_CHECK = "pregnancy_check",
  MILKING = "milking",
  FEEDING = "feeding",
  PASTURE_ROTATION = "pasture_rotation",
  TRANSPORTATION = "transportation",
  GROOMING = "grooming",
}

interface EventAttachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  size: number;
  uploadedAt: Date;
}

interface EventReminder {
  id: string;
  type: "email" | "sms" | "push" | "in_app";
  scheduledTime: Date;
  message: string;
  sent: boolean;
  sentAt?: Date;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string; // ej: "5 días"
  administrationRoute: AdministrationRoute;
  prescribedBy: string;
}

interface EventSearchParams {
  eventType?: EventType;
  status?: EventStatus;
  priority?: EventPriority;
  bovineId?: string;
  veterinarianId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // en kilómetros
  };
  tags?: string[];
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface EventStats {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  eventsByStatus: Record<EventStatus, number>;
  eventsByPriority: Record<EventPriority, number>;
  overdueEvents: number;
  completionRate: number;
  averageResponseTime: number; // en horas
  upcomingEvents: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface RecurringEventTemplate {
  id: string;
  title: string;
  eventType: EventType;
  description?: string;
  recurrencePattern: {
    type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    interval: number; // cada X días/semanas/meses/años
    daysOfWeek?: number[]; // para recurrencia semanal
    dayOfMonth?: number; // para recurrencia mensual
    endDate?: Date;
    maxOccurrences?: number;
  };
  template: Partial<BaseEvent>;
  isActive: boolean;
  createdAt: Date;
  lastGenerated?: Date;
  nextGeneration?: Date;
}

// Configuración del servicio de eventos
const EVENTS_CONFIG = {
  CACHE_DURATION: 3 * 60 * 1000, // 3 minutos
  BATCH_SIZE: 25,
  MAX_ATTACHMENT_SIZE: 20 * 1024 * 1024, // 20MB
  SUPPORTED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
  REMINDER_LEAD_TIMES: {
    [EventPriority.LOW]: [24 * 60], // 1 día en minutos
    [EventPriority.MEDIUM]: [4 * 60, 24 * 60], // 4 horas y 1 día
    [EventPriority.HIGH]: [60, 4 * 60, 24 * 60], // 1 hora, 4 horas y 1 día
    [EventPriority.URGENT]: [15, 60, 4 * 60], // 15 min, 1 hora, 4 horas
    [EventPriority.EMERGENCY]: [5, 15, 60], // 5 min, 15 min, 1 hora
  },
  SYNC_INTERVAL: 30 * 1000, // 30 segundos para eventos
  LOCATION_ACCURACY_THRESHOLD: 50, // metros
} as const;

// Etiquetas en español
const EVENT_TYPE_LABELS = {
  [EventType.VACCINATION]: "Vacunación",
  [EventType.ILLNESS]: "Enfermedad",
  [EventType.ROUTINE_CHECK]: "Revisión Rutinaria",
  [EventType.BREEDING]: "Reproducción",
  [EventType.MANAGEMENT]: "Manejo",
  [EventType.FEEDING]: "Alimentación",
  [EventType.TREATMENT]: "Tratamiento",
  [EventType.EMERGENCY]: "Emergencia",
} as const;

const EVENT_STATUS_LABELS = {
  [EventStatus.SCHEDULED]: "Programado",
  [EventStatus.IN_PROGRESS]: "En Progreso",
  [EventStatus.COMPLETED]: "Completado",
  [EventStatus.CANCELLED]: "Cancelado",
  [EventStatus.DELAYED]: "Retrasado",
  [EventStatus.OVERDUE]: "Vencido",
} as const;

const EVENT_PRIORITY_LABELS = {
  [EventPriority.LOW]: "Baja",
  [EventPriority.MEDIUM]: "Media",
  [EventPriority.HIGH]: "Alta",
  [EventPriority.URGENT]: "Urgente",
  [EventPriority.EMERGENCY]: "Emergencia",
} as const;

// Clase principal del servicio de eventos
class EventsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncTimer: number | null = null;
  private pendingOperations: any[] = [];
  private notificationQueue: EventReminder[] = [];

  constructor() {
    this.startAutoSync();
    this.setupEventListeners();
    this.initializeNotificationSystem();
  }

  // MÉTODOS BÁSICOS DE CACHE Y SINCRONIZACIÓN

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > EVENTS_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private startAutoSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = window.setInterval(async () => {
      if (navigator.onLine) {
        await this.syncPendingOperations();
        await this.checkOverdueEvents();
        await this.processNotificationQueue();
      }
    }, EVENTS_CONFIG.SYNC_INTERVAL);
  }

  private setupEventListeners(): void {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    console.log("🌐 Conexión restaurada - Sincronizando eventos...");
    await this.syncPendingOperations();
  }

  private handleOffline(): void {
    console.log(
      "📱 Modo offline - Los eventos se guardarán para sincronización"
    );
  }

  private async syncPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      console.log(
        `🔄 Sincronizando ${this.pendingOperations.length} eventos pendientes...`
      );

      for (const operation of this.pendingOperations) {
        await this.executePendingOperation(operation);
      }

      this.pendingOperations = [];
      console.log("✅ Sincronización de eventos completada");
    } catch (error) {
      console.error("❌ Error en sincronización de eventos:", error);
    }
  }

  private async executePendingOperation(operation: any): Promise<void> {
    try {
      switch (operation.type) {
        case "create_event":
          await this.createEvent(operation.data, false);
          break;
        case "update_event":
          await this.updateEvent(operation.id, operation.data, false);
          break;
        case "complete_event":
          await this.completeEvent(operation.id, operation.data, false);
          break;
        case "cancel_event":
          await this.cancelEvent(operation.id, operation.reason, false);
          break;
      }
    } catch (error) {
      console.error(
        "❌ Error ejecutando operación pendiente de evento:",
        error
      );
    }
  }

  // MÉTODOS DE GEOLOCALIZACIÓN

  private async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          let message = "Error obteniendo ubicación";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Permiso de ubicación denegado";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Ubicación no disponible";
              break;
            case error.TIMEOUT:
              message = "Tiempo de espera agotado obteniendo ubicación";
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // MÉTODOS CRUD DE EVENTOS

  // Obtener eventos con filtros
  public async getEvents(
    params?: EventSearchParams
  ): Promise<{ events: Event[]; pagination: any }> {
    try {
      const cacheKey = `events_${JSON.stringify(params || {})}`;
      const cached = this.getFromCache<{ events: Event[]; pagination: any }>(
        cacheKey
      );

      if (cached) {
        console.log("📦 Eventos obtenidos del cache");
        return cached;
      }

      console.log("📅 Obteniendo eventos...");

      const response = await api.get<{ events: Event[]; pagination: any }>(
        "/events",
        {
          params,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo eventos");
      }

      // Procesar fechas
      const processedData = {
        ...response.data,
        events: response.data.events.map((event) => ({
          ...event,
          scheduledDate: new Date(event.scheduledDate),
          completedDate: event.completedDate
            ? new Date(event.completedDate)
            : undefined,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        })),
      };

      this.setCache(cacheKey, processedData);

      console.log(`✅ ${processedData.events.length} eventos obtenidos`);
      return processedData;
    } catch (error) {
      console.error("❌ Error obteniendo eventos:", error);
      throw error;
    }
  }

  // Crear nuevo evento
  public async createEvent(
    eventData: Partial<Event>,
    sync: boolean = true
  ): Promise<Event> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!eventData.location?.latitude || !eventData.location?.longitude) {
        eventData.location = await this.getCurrentLocation();
      }

      console.log(`🆕 Creando evento: ${eventData.title}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_event",
          data: eventData,
          timestamp: Date.now(),
        });

        console.log("📱 Evento guardado para sincronización offline");
        throw new Error("Evento guardado para cuando se restaure la conexión");
      }

      const response = await api.post<Event>("/events", eventData, {
        includeLocation: true,
      });

      if (!response.success || !response.data) {
        throw new Error("Error creando evento");
      }

      // Programar recordatorios automáticos
      await this.scheduleReminders(response.data);

      this.clearCache();
      console.log(`✅ Evento creado: ${response.data.title}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando evento:", error);
      throw error;
    }
  }

  // Crear evento de vacunación específico
  public async createVaccinationEvent(
    bovineId: string,
    vaccinationData: VaccinationEvent["vaccinationData"],
    scheduledDate: Date,
    location?: Location
  ): Promise<VaccinationEvent> {
    try {
      const eventLocation = location || (await this.getCurrentLocation());

      const eventData: Partial<VaccinationEvent> = {
        title: `Vacunación: ${vaccinationData.vaccineName}`,
        description: `Aplicación de ${vaccinationData.vaccineType} - Lote: ${vaccinationData.batchNumber}`,
        eventType: EventType.VACCINATION,
        priority: EventPriority.HIGH,
        location: eventLocation,
        scheduledDate,
        status: EventStatus.SCHEDULED,
        bovineId,
        vaccinationData,
        tags: ["vacunación", vaccinationData.vaccineType],
      };

      console.log(`💉 Creando evento de vacunación para bovino: ${bovineId}`);

      return (await this.createEvent(eventData)) as VaccinationEvent;
    } catch (error) {
      console.error("❌ Error creando evento de vacunación:", error);
      throw error;
    }
  }

  // Crear evento de enfermedad específico
  public async createIllnessEvent(
    bovineId: string,
    illnessData: IllnessEvent["illnessData"],
    diagnosisDate: Date,
    location?: Location
  ): Promise<IllnessEvent> {
    try {
      const eventLocation = location || (await this.getCurrentLocation());

      // Determinar prioridad basada en severidad
      let priority = EventPriority.MEDIUM;
      switch (illnessData.severity) {
        case IllnessSeverity.CRITICAL:
          priority = EventPriority.EMERGENCY;
          break;
        case IllnessSeverity.SEVERE:
          priority = EventPriority.URGENT;
          break;
        case IllnessSeverity.MODERATE:
          priority = EventPriority.HIGH;
          break;
        case IllnessSeverity.MILD:
          priority = EventPriority.MEDIUM;
          break;
      }

      const eventData: Partial<IllnessEvent> = {
        title: `Diagnóstico: ${illnessData.diseaseName}`,
        description: `Síntomas: ${illnessData.symptoms.join(", ")}`,
        eventType: EventType.ILLNESS,
        priority,
        location: eventLocation,
        scheduledDate: diagnosisDate,
        status: EventStatus.IN_PROGRESS,
        bovineId,
        illnessData,
        tags: [
          "enfermedad",
          illnessData.severity,
          ...(illnessData.isContagious ? ["contagioso"] : []),
        ],
      };

      console.log(`🏥 Creando evento de enfermedad para bovino: ${bovineId}`);

      return (await this.createEvent(eventData)) as IllnessEvent;
    } catch (error) {
      console.error("❌ Error creando evento de enfermedad:", error);
      throw error;
    }
  }

  // Completar evento
  public async completeEvent(
    eventId: string,
    completionData: {
      notes?: string;
      attachments?: File[];
      location?: Location;
      actualDuration?: number;
    },
    sync: boolean = true
  ): Promise<Event> {
    try {
      const completionLocation =
        completionData.location || (await this.getCurrentLocation());

      console.log(`✅ Completando evento: ${eventId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "complete_event",
          id: eventId,
          data: { ...completionData, location: completionLocation },
          timestamp: Date.now(),
        });

        console.log(
          "📱 Finalización de evento guardada para sincronización offline"
        );
        throw new Error(
          "Finalización guardada para cuando se restaure la conexión"
        );
      }

      // Subir archivos adjuntos si existen
      let attachmentUrls: string[] = [];
      if (completionData.attachments && completionData.attachments.length > 0) {
        attachmentUrls = await Promise.all(
          completionData.attachments.map((file) =>
            this.uploadAttachment(eventId, file)
          )
        );
      }

      const updateData = {
        status: EventStatus.COMPLETED,
        completedDate: new Date(),
        location: completionLocation,
        notes: completionData.notes,
        attachments: attachmentUrls,
        actualDuration: completionData.actualDuration,
      };

      const response = await api.put<Event>(
        `/events/${eventId}/complete`,
        updateData,
        {
          includeLocation: true,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error completando evento");
      }

      this.clearCache();
      console.log("✅ Evento completado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error completando evento:", error);
      throw error;
    }
  }

  // Cancelar evento
  public async cancelEvent(
    eventId: string,
    reason: string,
    sync: boolean = true
  ): Promise<void> {
    try {
      console.log(`❌ Cancelando evento: ${eventId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "cancel_event",
          id: eventId,
          reason,
          timestamp: Date.now(),
        });

        console.log("📱 Cancelación guardada para sincronización offline");
        return;
      }

      const response = await api.put(`/events/${eventId}/cancel`, { reason });

      if (!response.success) {
        throw new Error("Error cancelando evento");
      }

      this.clearCache();
      console.log("✅ Evento cancelado exitosamente");
    } catch (error) {
      console.error("❌ Error cancelando evento:", error);
      throw error;
    }
  }

  // MÉTODOS DE BÚSQUEDA Y FILTRADO

  // Obtener eventos por bovino
  public async getEventsByBovine(bovineId: string): Promise<Event[]> {
    try {
      const response = await api.get<Event[]>(`/events/bovine/${bovineId}`);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo eventos del bovino");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo eventos del bovino:", error);
      throw error;
    }
  }

  // Obtener eventos próximos
  public async getUpcomingEvents(days: number = 7): Promise<Event[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const params = {
        dateFrom: new Date(),
        dateTo: endDate,
        status: EventStatus.SCHEDULED,
        sortBy: "scheduledDate",
        sortOrder: "asc" as const,
      };

      const result = await this.getEvents(params);
      return result.events;
    } catch (error) {
      console.error("❌ Error obteniendo eventos próximos:", error);
      throw error;
    }
  }

  // Obtener eventos vencidos
  public async getOverdueEvents(): Promise<Event[]> {
    try {
      const params = {
        dateTo: new Date(),
        status: EventStatus.SCHEDULED,
        sortBy: "scheduledDate",
        sortOrder: "asc" as const,
      };

      const result = await this.getEvents(params);
      return result.events;
    } catch (error) {
      console.error("❌ Error obteniendo eventos vencidos:", error);
      throw error;
    }
  }

  // Verificar eventos vencidos automáticamente
  private async checkOverdueEvents(): Promise<void> {
    try {
      const overdueEvents = await this.getOverdueEvents();

      for (const event of overdueEvents) {
        if (event.status === EventStatus.SCHEDULED) {
          await this.updateEvent(
            event.id,
            { status: EventStatus.OVERDUE },
            false
          );
        }
      }
    } catch (error) {
      console.error("❌ Error verificando eventos vencidos:", error);
    }
  }

  // MÉTODOS DE ESTADÍSTICAS

  // Obtener estadísticas de eventos
  public async getEventStats(period?: {
    startDate: Date;
    endDate: Date;
  }): Promise<EventStats> {
    try {
      console.log("📊 Obteniendo estadísticas de eventos...");

      const response = await api.get<EventStats>("/events/stats", {
        params: period,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo estadísticas de eventos");
      }

      console.log("✅ Estadísticas de eventos obtenidas");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas de eventos:", error);
      throw error;
    }
  }

  // MÉTODOS DE RECORDATORIOS Y NOTIFICACIONES

  private initializeNotificationSystem(): void {
    // Verificar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // Programar recordatorios para un evento
  private async scheduleReminders(event: Event): Promise<void> {
    try {
      const leadTimes = EVENTS_CONFIG.REMINDER_LEAD_TIMES[event.priority] || [
        60,
      ];

      for (const leadTimeMinutes of leadTimes) {
        const reminderTime = new Date(event.scheduledDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - leadTimeMinutes);

        // Solo programar si es en el futuro
        if (reminderTime > new Date()) {
          const reminder: EventReminder = {
            id: `${event.id}_${leadTimeMinutes}`,
            type: "in_app",
            scheduledTime: reminderTime,
            message: `Recordatorio: ${event.title} en ${
              leadTimeMinutes === 60 ? "1 hora" : `${leadTimeMinutes} minutos`
            }`,
            sent: false,
          };

          this.notificationQueue.push(reminder);
        }
      }

      console.log(
        `📅 ${leadTimes.length} recordatorios programados para: ${event.title}`
      );
    } catch (error) {
      console.error("❌ Error programando recordatorios:", error);
    }
  }

  // Procesar cola de notificaciones
  private async processNotificationQueue(): Promise<void> {
    const now = new Date();
    const dueReminders = this.notificationQueue.filter(
      (reminder) => !reminder.sent && reminder.scheduledTime <= now
    );

    for (const reminder of dueReminders) {
      await this.sendNotification(reminder);
      reminder.sent = true;
      reminder.sentAt = new Date();
    }

    // Limpiar recordatorios enviados antiguos
    this.notificationQueue = this.notificationQueue.filter(
      (reminder) =>
        !reminder.sent ||
        now.getTime() - reminder.sentAt!.getTime() < 24 * 60 * 60 * 1000
    );
  }

  // Enviar notificación
  private async sendNotification(reminder: EventReminder): Promise<void> {
    try {
      switch (reminder.type) {
        case "in_app":
          this.showInAppNotification(reminder.message);
          break;
        case "push":
          this.showPushNotification(reminder.message);
          break;
      }
    } catch (error) {
      console.error("❌ Error enviando notificación:", error);
    }
  }

  // Mostrar notificación en la app
  private showInAppNotification(message: string): void {
    // Emitir evento personalizado para que la UI lo maneje
    window.dispatchEvent(
      new CustomEvent("event:notification", {
        detail: { message, type: "reminder" },
      })
    );
  }

  // Mostrar notificación push
  private showPushNotification(message: string): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("BovinesCare - Recordatorio", {
        body: message,
        icon: "/favicon.ico",
        badge: "/badge-icon.png",
      });
    }
  }

  // MÉTODOS DE ARCHIVOS

  // Subir archivo adjunto
  public async uploadAttachment(eventId: string, file: File): Promise<string> {
    try {
      // Validar archivo
      if (file.size > EVENTS_CONFIG.MAX_ATTACHMENT_SIZE) {
        throw new Error("El archivo es demasiado grande (máximo 20MB)");
      }

      const supportedTypes = EVENTS_CONFIG.SUPPORTED_FILE_TYPES;
      if (!supportedTypes.includes(file.type as any)) {
        throw new Error("Tipo de archivo no soportado");
      }

      console.log(`📎 Subiendo archivo para evento: ${eventId}`);

      const response = await apiClient.upload<{ url: string }>(
        `/events/${eventId}/attachments`,
        file,
        "attachment"
      );

      if (!response.success || !response.data) {
        throw new Error("Error subiendo archivo");
      }

      console.log("✅ Archivo subido exitosamente");
      return response.data.url;
    } catch (error) {
      console.error("❌ Error subiendo archivo:", error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIDAD

  // Actualizar evento
  public async updateEvent(
    eventId: string,
    updates: Partial<Event>,
    sync: boolean = true
  ): Promise<Event> {
    try {
      console.log(`✏️ Actualizando evento: ${eventId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "update_event",
          id: eventId,
          data: updates,
          timestamp: Date.now(),
        });

        console.log("📱 Actualización guardada para sincronización offline");
        throw new Error(
          "Actualización guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<Event>(`/events/${eventId}`, updates);

      if (!response.success || !response.data) {
        throw new Error("Error actualizando evento");
      }

      this.clearCache();
      console.log("✅ Evento actualizado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando evento:", error);
      throw error;
    }
  }

  // Obtener color para tipo de evento
  public getEventTypeColor(eventType: EventType): string {
    const colors = {
      [EventType.VACCINATION]: "#10B981", // Verde
      [EventType.ILLNESS]: "#EF4444", // Rojo
      [EventType.ROUTINE_CHECK]: "#3B82F6", // Azul
      [EventType.BREEDING]: "#8B5CF6", // Púrpura
      [EventType.MANAGEMENT]: "#F59E0B", // Amarillo
      [EventType.FEEDING]: "#06B6D4", // Cian
      [EventType.TREATMENT]: "#EC4899", // Rosa
      [EventType.EMERGENCY]: "#DC2626", // Rojo oscuro
    };

    return colors[eventType] || "#6B7280";
  }

  // Obtener color para prioridad de evento
  public getEventPriorityColor(priority: EventPriority): string {
    const colors = {
      [EventPriority.LOW]: "#9CA3AF", // Gris
      [EventPriority.MEDIUM]: "#3B82F6", // Azul
      [EventPriority.HIGH]: "#F59E0B", // Amarillo
      [EventPriority.URGENT]: "#EF4444", // Rojo
      [EventPriority.EMERGENCY]: "#DC2626", // Rojo oscuro
    };

    return colors[priority] || "#6B7280";
  }

  // Calcular duración del evento
  public calculateEventDuration(event: Event): number | null {
    if (!event.completedDate || !event.scheduledDate) return null;

    const duration =
      event.completedDate.getTime() - event.scheduledDate.getTime();
    return Math.round(duration / (1000 * 60)); // en minutos
  }

  // MÉTODOS DE EVENTOS RECURRENTES

  // Crear plantilla de evento recurrente
  public async createRecurringTemplate(
    templateData: Omit<
      RecurringEventTemplate,
      "id" | "createdAt" | "lastGenerated" | "nextGeneration"
    >
  ): Promise<RecurringEventTemplate> {
    try {
      console.log(`🔄 Creando plantilla recurrente: ${templateData.title}`);

      const response = await api.post<RecurringEventTemplate>(
        "/events/recurring-templates",
        templateData
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando plantilla recurrente");
      }

      // Generar primeros eventos automáticamente
      await this.generateEventsFromTemplate(response.data.id);

      console.log("✅ Plantilla recurrente creada");
      return response.data;
    } catch (error) {
      console.error("❌ Error creando plantilla recurrente:", error);
      throw error;
    }
  }

  // Generar eventos desde plantilla recurrente
  public async generateEventsFromTemplate(
    templateId: string
  ): Promise<Event[]> {
    try {
      console.log(`🔄 Generando eventos desde plantilla: ${templateId}`);

      const response = await api.post<Event[]>(
        `/events/recurring-templates/${templateId}/generate`
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando eventos desde plantilla");
      }

      console.log(
        `✅ ${response.data.length} eventos generados desde plantilla`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error generando eventos desde plantilla:", error);
      throw error;
    }
  }

  // Obtener plantillas recurrentes
  public async getRecurringTemplates(): Promise<RecurringEventTemplate[]> {
    try {
      const response = await api.get<RecurringEventTemplate[]>(
        "/events/recurring-templates"
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo plantillas recurrentes");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo plantillas recurrentes:", error);
      throw error;
    }
  }

  // MÉTODOS DE CALENDARIO Y PROGRAMACIÓN

  // Obtener eventos para calendario (formato específico)
  public async getCalendarEvents(
    startDate: Date,
    endDate: Date,
    eventTypes?: EventType[]
  ): Promise<
    {
      id: string;
      title: string;
      start: Date;
      end?: Date;
      allDay: boolean;
      color: string;
      extendedProps: any;
    }[]
  > {
    try {
      const params: EventSearchParams = {
        dateFrom: startDate,
        dateTo: endDate,
        eventType: eventTypes?.length === 1 ? eventTypes[0] : undefined,
      };

      const result = await this.getEvents(params);

      return result.events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.scheduledDate,
        end: event.completedDate,
        allDay: false,
        color: this.getEventTypeColor(event.eventType),
        extendedProps: {
          eventType: event.eventType,
          priority: event.priority,
          status: event.status,
          bovineId: event.bovineId,
          location: event.location,
          description: event.description,
        },
      }));
    } catch (error) {
      console.error("❌ Error obteniendo eventos para calendario:", error);
      throw error;
    }
  }

  // Obtener eventos disponibles para programar (slots libres)
  public async getAvailableTimeSlots(
    date: Date,
    durationMinutes: number = 60,
    veterinarianId?: string
  ): Promise<{ start: Date; end: Date }[]> {
    try {
      console.log(`📅 Buscando slots disponibles para: ${date.toDateString()}`);

      const response = await api.get<{ start: Date; end: Date }[]>(
        "/events/available-slots",
        {
          params: {
            date: date.toISOString(),
            duration: durationMinutes,
            veterinarianId,
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo slots disponibles");
      }

      return response.data.map((slot) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
      }));
    } catch (error) {
      console.error("❌ Error obteniendo slots disponibles:", error);
      throw error;
    }
  }

  // Verificar conflictos de programación
  public async checkScheduleConflict(
    scheduledDate: Date,
    durationMinutes: number,
    bovineId?: string,
    veterinarianId?: string,
    excludeEventId?: string
  ): Promise<{ hasConflict: boolean; conflictingEvents: Event[] }> {
    try {
      const endDate = new Date(scheduledDate);
      endDate.setMinutes(endDate.getMinutes() + durationMinutes);

      const params: EventSearchParams = {
        dateFrom: scheduledDate,
        dateTo: endDate,
        bovineId,
        veterinarianId,
      };

      const result = await this.getEvents(params);

      const conflictingEvents = result.events.filter(
        (event) =>
          event.id !== excludeEventId &&
          event.status !== EventStatus.CANCELLED &&
          event.status !== EventStatus.COMPLETED
      );

      return {
        hasConflict: conflictingEvents.length > 0,
        conflictingEvents,
      };
    } catch (error) {
      console.error("❌ Error verificando conflictos:", error);
      return { hasConflict: false, conflictingEvents: [] };
    }
  }

  // MÉTODOS DE ANÁLISIS Y PATRONES

  // Analizar patrones de eventos
  public async analyzeEventPatterns(
    bovineId?: string,
    period?: { startDate: Date; endDate: Date }
  ): Promise<{
    frequencyByType: Record<EventType, number>;
    averageTimeBetweenEvents: number;
    seasonalTrends: { month: number; count: number }[];
    healthTrends: { improving: boolean; riskScore: number };
    recommendations: string[];
  }> {
    try {
      console.log("📈 Analizando patrones de eventos...");

      const response = await api.get("/events/patterns", {
        params: { bovineId, ...period },
      });

      if (!response.success || !response.data) {
        throw new Error("Error analizando patrones");
      }

      console.log("✅ Análisis de patrones completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error analizando patrones:", error);
      throw error;
    }
  }

  // Predecir próximos eventos necesarios
  public async predictUpcomingEvents(bovineId: string): Promise<{
    suggestedEvents: {
      eventType: EventType;
      suggestedDate: Date;
      priority: EventPriority;
      reason: string;
      confidence: number;
    }[];
  }> {
    try {
      console.log(`🔮 Prediciendo eventos para bovino: ${bovineId}`);

      const response = await api.get(`/events/predictions/${bovineId}`);

      if (!response.success || !response.data) {
        throw new Error("Error prediciendo eventos");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error prediciendo eventos:", error);
      throw error;
    }
  }

  // MÉTODOS DE COLABORACIÓN

  // Asignar veterinario a evento
  public async assignVeterinarian(
    eventId: string,
    veterinarianId: string
  ): Promise<Event> {
    try {
      console.log(
        `👨‍⚕️ Asignando veterinario ${veterinarianId} al evento: ${eventId}`
      );

      const response = await api.put<Event>(
        `/events/${eventId}/assign-veterinarian`,
        {
          veterinarianId,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error asignando veterinario");
      }

      this.clearCache();
      console.log("✅ Veterinario asignado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error asignando veterinario:", error);
      throw error;
    }
  }

  // Obtener eventos asignados a veterinario
  public async getEventsByVeterinarian(
    veterinarianId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<Event[]> {
    try {
      const params: EventSearchParams = {
        veterinarianId,
        ...dateRange,
        sortBy: "scheduledDate",
        sortOrder: "asc",
      };

      const result = await this.getEvents(params);
      return result.events;
    } catch (error) {
      console.error("❌ Error obteniendo eventos del veterinario:", error);
      throw error;
    }
  }

  // Transferir evento a otro veterinario
  public async transferEvent(
    eventId: string,
    fromVeterinarianId: string,
    toVeterinarianId: string,
    reason: string
  ): Promise<Event> {
    try {
      console.log(
        `🔄 Transfiriendo evento ${eventId} de ${fromVeterinarianId} a ${toVeterinarianId}`
      );

      const response = await api.put<Event>(`/events/${eventId}/transfer`, {
        fromVeterinarianId,
        toVeterinarianId,
        reason,
      });

      if (!response.success || !response.data) {
        throw new Error("Error transfiriendo evento");
      }

      this.clearCache();
      console.log("✅ Evento transferido exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error transfiriendo evento:", error);
      throw error;
    }
  }

  // MÉTODOS DE TEMPLATES Y WORKFLOWS

  // Crear template de evento
  public async createEventTemplate(templateData: {
    name: string;
    eventType: EventType;
    defaultDuration: number;
    defaultPriority: EventPriority;
    requiredFields: string[];
    instructions: string;
    checklist: string[];
    estimatedCost?: number;
  }): Promise<{ id: string; name: string }> {
    try {
      console.log(`📝 Creando template: ${templateData.name}`);

      const response = await api.post("/events/templates", templateData);

      if (!response.success || !response.data) {
        throw new Error("Error creando template");
      }

      console.log("✅ Template creado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error creando template:", error);
      throw error;
    }
  }

  // Crear evento desde template
  public async createEventFromTemplate(
    templateId: string,
    overrides: {
      bovineId: string;
      scheduledDate: Date;
      location?: Location;
      customData?: any;
    }
  ): Promise<Event> {
    try {
      console.log(`📋 Creando evento desde template: ${templateId}`);

      const response = await api.post<Event>(
        `/events/templates/${templateId}/create`,
        overrides
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando evento desde template");
      }

      // Programar recordatorios automáticamente
      await this.scheduleReminders(response.data);

      this.clearCache();
      console.log("✅ Evento creado desde template");

      return response.data;
    } catch (error) {
      console.error("❌ Error creando evento desde template:", error);
      throw error;
    }
  }

  // MÉTODOS DE INTEGRACIÓN EXTERNA

  // Sincronizar con calendario externo (Google Calendar, Outlook, etc.)
  public async syncWithExternalCalendar(
    provider: "google" | "outlook" | "apple",
    calendarId: string,
    eventTypes?: EventType[]
  ): Promise<{ synced: number; errors: string[] }> {
    try {
      console.log(`🔄 Sincronizando con calendario ${provider}...`);

      const response = await api.post("/events/external-sync", {
        provider,
        calendarId,
        eventTypes,
      });

      if (!response.success || !response.data) {
        throw new Error("Error sincronizando con calendario externo");
      }

      console.log(`✅ ${response.data.synced} eventos sincronizados`);
      return response.data;
    } catch (error) {
      console.error("❌ Error sincronizando con calendario externo:", error);
      throw error;
    }
  }

  // Obtener información del clima para eventos de campo
  public async getWeatherForEvent(eventId: string): Promise<{
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    conditions: string;
    recommendation: string;
  } | null> {
    try {
      const event = await this.getEventById(eventId);
      if (!event.location) return null;

      console.log(`🌤️ Obteniendo clima para evento: ${eventId}`);

      const response = await api.get("/events/weather", {
        params: {
          latitude: event.location.latitude,
          longitude: event.location.longitude,
          date: event.scheduledDate.toISOString(),
        },
      });

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo clima:", error);
      return null;
    }
  }

  // MÉTODOS DE EXPORTACIÓN

  // Exportar eventos a diferentes formatos
  public async exportEvents(
    format: "csv" | "excel" | "pdf" | "ical"
  ): Promise<void> {
    try {
      console.log(`📤 Exportando eventos en formato: ${format}`);

      await apiClient.download(
        "/events/export",
        `eventos_${format}_${new Date().getTime()}.${format}`,
        (progress) => {
          console.log(`📥 Progreso de exportación: ${progress}%`);
        }
      );

      console.log("✅ Exportación completada");
    } catch (error) {
      console.error("❌ Error exportando eventos:", error);
      throw error;
    }
  }

  // Importar eventos desde archivo
  public async importEvents(
    file: File,
    options?: {
      validateBovineIds?: boolean;
      skipDuplicates?: boolean;
      defaultVeterinarianId?: string;
    }
  ): Promise<{
    imported: number;
    skipped: number;
    errors: { row: number; error: string }[];
  }> {
    try {
      console.log("📥 Importando eventos desde archivo...");

      const response = await apiClient.upload<{
        imported: number;
        skipped: number;
        errors: { row: number; error: string }[];
      }>("/events/import", file, "file", undefined, options);

      if (!response.success || !response.data) {
        throw new Error("Error importando eventos");
      }

      this.clearCache();
      console.log(`✅ ${response.data.imported} eventos importados`);

      return response.data;
    } catch (error) {
      console.error("❌ Error importando eventos:", error);
      throw error;
    }
  }

  // MÉTODOS AUXILIARES ADICIONALES

  // Obtener evento por ID
  private async getEventById(eventId: string): Promise<Event> {
    const cacheKey = `event_${eventId}`;
    const cached = this.getFromCache<Event>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get<Event>(`/events/${eventId}`);

    if (!response.success || !response.data) {
      throw new Error("Evento no encontrado");
    }

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  // Validar datos de evento
  public validateEventData(eventData: Partial<Event>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!eventData.title?.trim()) {
      errors.push("El título es obligatorio");
    }

    if (!eventData.eventType) {
      errors.push("El tipo de evento es obligatorio");
    }

    if (!eventData.scheduledDate) {
      errors.push("La fecha programada es obligatoria");
    } else if (eventData.scheduledDate < new Date()) {
      errors.push("La fecha programada no puede ser en el pasado");
    }

    if (!eventData.location?.latitude || !eventData.location?.longitude) {
      errors.push("La ubicación es obligatoria");
    }

    if (eventData.eventType === EventType.VACCINATION && !eventData.bovineId) {
      errors.push("El ID del bovino es obligatorio para eventos de vacunación");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calcular costo estimado de evento
  public async calculateEventCost(
    eventType: EventType,
    duration?: number
  ): Promise<number> {
    try {
      const response = await api.get("/events/cost-estimate", {
        params: { eventType, duration },
      });

      if (!response.success || !response.data) {
        return 0;
      }

      return response.data.estimatedCost || 0;
    } catch (error) {
      console.error("❌ Error calculando costo:", error);
      return 0;
    }
  }

  // Generar reporte de eventos
  public async generateEventReport(
    type: "summary" | "detailed" | "financial" | "veterinary",
    filters?: EventSearchParams
  ): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: Date;
  }> {
    try {
      console.log(`📊 Generando reporte de eventos: ${type}`);

      const response = await api.post("/events/reports", {
        type,
        filters,
      });

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte");
      }

      console.log("✅ Reporte generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte:", error);
      throw error;
    }
  }

  // MÉTODOS DE CONFIGURACIÓN Y LIMPIEZA

  // Configurar preferencias de notificación
  public async setNotificationPreferences(preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    reminderLeadTimes: Record<EventPriority, number[]>;
    quietHours: { start: string; end: string };
  }): Promise<void> {
    try {
      await api.put("/events/notification-preferences", preferences);
      console.log("✅ Preferencias de notificación actualizadas");
    } catch (error) {
      console.error("❌ Error actualizando preferencias:", error);
      throw error;
    }
  }

  // Limpiar eventos antiguos
  public async cleanupOldEvents(olderThanDays: number = 365): Promise<number> {
    try {
      console.log(`🧹 Limpiando eventos anteriores a ${olderThanDays} días...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const response = await api.delete("/events/cleanup", {
        params: { cutoffDate: cutoffDate.toISOString() },
      });

      if (!response.success) {
        throw new Error("Error limpiando eventos antiguos");
      }

      const deletedCount = response.data?.deletedCount || 0;
      console.log(`✅ ${deletedCount} eventos antiguos eliminados`);

      this.clearCache();
      return deletedCount;
    } catch (error) {
      console.error("❌ Error limpiando eventos:", error);
      throw error;
    }
  }

  // Obtener métricas de rendimiento del servicio
  public getPerformanceMetrics(): {
    cacheHitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    pendingOperations: number;
    queuedNotifications: number;
    lastSyncTime: Date | null;
  } {
    const totalCacheRequests = this.cache.size;
    const cacheHits = Array.from(this.cache.values()).filter(
      (item) => Date.now() - item.timestamp < EVENTS_CONFIG.CACHE_DURATION
    ).length;

    return {
      cacheHitRate:
        totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0,
      averageResponseTime: 0, // Podría implementarse con un histórico
      totalRequests: 0, // Podría implementarse con un contador
      pendingOperations: this.pendingOperations.length,
      queuedNotifications: this.notificationQueue.length,
      lastSyncTime: this.syncTimer ? new Date() : null,
    };
  }

  // Destructor
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.clearCache();
    this.notificationQueue = [];
    this.pendingOperations = [];

    console.log("🔒 EventsService destruido correctamente");
  }
}

// Instancia singleton del servicio de eventos
export const eventsService = new EventsService();

// Exports adicionales
export {
  EventType,
  EventStatus,
  EventPriority,
  IllnessSeverity,
  AdministrationRoute,
  ManagementActivity,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_PRIORITY_LABELS,
};

export type {
  Event,
  VaccinationEvent,
  IllnessEvent,
  RoutineCheckEvent,
  BreedingEvent,
  ManagementEvent,
  EventSearchParams,
  EventStats,
  RecurringEventTemplate,
  Location,
};

// Export default para compatibilidad
export default eventsService;
