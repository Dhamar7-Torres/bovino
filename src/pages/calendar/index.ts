// Exportaciones principales del módulo Calendar
// Este archivo facilita las importaciones desde otros módulos

// Página principal del módulo
export { default as CalendarPage } from "./CalendarPage";

// Componentes de gestión de eventos
export { default as CreateEvent } from "./CreateEvent";
export { default as EditEvent } from "./EditEvent";
export { default as EventDetail } from "./EventDetail";

// Componentes de vistas y navegación
export { default as MonthView } from "./MonthView";

// Componentes especializados
export { default as EventReminder } from "./EventReminders";
export { default as VaccinationSchedule } from "./VaccinationSchedule";

// Tipos y interfaces principales del módulo calendar
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    section?: string;
  };
  bovineIds: string[];
  bovineNames: string[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "cancelled" | "in_progress";
  reminderSet: boolean;
  veterinarian?: string;
  cost?: number;
  actualCost?: number;
  tags: string[];
  notes?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  lastModifiedBy?: string;
  weather?: WeatherInfo;
  results?: EventResults;
}

export interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  textColor?: string;
  category: "health" | "reproduction" | "nutrition" | "general";
  description?: string;
}

export interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
  daysOfWeek?: number[]; // Para frecuencia semanal
  dayOfMonth?: number; // Para frecuencia mensual
  monthOfYear?: number; // Para frecuencia anual
}

export interface WeatherInfo {
  temperature: number;
  humidity?: number;
  condition: string;
  icon?: string;
  windSpeed?: number;
  description?: string;
}

export interface EventResults {
  success: boolean;
  notes: string;
  complications?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  medicationsAdministered?: string[];
  dosages?: Record<string, string>;
  sideEffects?: string[];
  certificateNumber?: string;
}

export interface ReminderData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  reminderType: ReminderType;
  reminderTime: string;
  status: "active" | "sent" | "dismissed" | "failed" | "scheduled";
  recipients: Recipient[];
  methods: NotificationMethod[];
  priority: "low" | "medium" | "high" | "urgent";
  message: string;
  customMessage?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  dismissedAt?: string;
  createdBy: string;
  metadata?: ReminderMetadata;
}

export interface ReminderType {
  id: string;
  name: string;
  timeOffset: number; // en minutos
  description: string;
  isDefault: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "owner" | "veterinarian" | "worker" | "admin" | "external";
  isActive: boolean;
  preferences: NotificationPreferences;
}

export interface NotificationMethod {
  type: "email" | "sms" | "push" | "whatsapp" | "call" | "system";
  isEnabled: boolean;
  settings?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: "immediate" | "daily_digest" | "weekly_summary";
}

export interface ReminderMetadata {
  bovineCount: number;
  location: string;
  estimatedCost?: number;
  urgencyLevel: number;
  weatherAlert?: boolean;
  equipmentNeeded?: string[];
}

export interface VaccinationScheduleData {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  vaccineId: string;
  vaccineName: string;
  vaccineType: VaccineType;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "completed" | "overdue" | "cancelled" | "rescheduled";
  doseNumber: number;
  totalDoses: number;
  nextDueDate?: string;
  completedDate?: string;
  veterinarian?: string;
  location: string;
  batchNumber?: string;
  expirationDate?: string;
  sideEffects?: string;
  notes?: string;
  cost: number;
  reminderSent: boolean;
  certificateGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface VaccineType {
  id: string;
  name: string;
  manufacturer: string;
  category: "viral" | "bacterial" | "parasitic" | "multivalent" | "other";
  description: string;
  dosageInstructions: string;
  storageRequirements: string;
  sideEffects: string[];
  contraindications: string[];
  withdrawalPeriod: number; // días
  boosterRequired: boolean;
  boosterInterval: number; // días
  ageRestrictions: {
    minAge: number; // meses
    maxAge?: number; // meses
  };
  seasonalRecommendation?: string;
  regulatoryApproval: string;
  costPerDose: number;
  isGovernmentRequired: boolean;
}

export interface VaccinationProtocol {
  id: string;
  name: string;
  description: string;
  targetCategory: "calves" | "adults" | "breeding" | "all";
  vaccines: {
    vaccineId: string;
    sequence: number;
    ageInMonths: number;
    intervalDays?: number;
  }[];
  isGovernmentRequired: boolean;
  seasonality?: {
    startMonth: number;
    endMonth: number;
  };
  frequency: "annual" | "biannual" | "as_needed";
  createdBy: string;
  lastUpdated: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  eventCount: number;
  hasUrgentEvents: boolean;
  isPastDue: boolean;
}

export interface CalendarFilter {
  eventTypes: string[];
  priorities: string[];
  statuses: string[];
  showCompleted: boolean;
  showCancelled: boolean;
  searchQuery: string;
  veterinarian?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarStats {
  totalEvents: number;
  todayEvents: number;
  upcomingWeek: number;
  overdueEvents: number;
  completedThisWeek: number;
  vaccinationsScheduled: number;
  remindersActive: number;
  complianceRate: number;
}

export interface VaccinationStats {
  totalScheduled: number;
  completed: number;
  overdue: number;
  upcomingWeek: number;
  complianceRate: number;
  costThisMonth: number;
  mostUsedVaccine: string;
  overdueAnimals: number;
  certificatesIssued: number;
  averageCostPerAnimal: number;
}

// Utilidades y constantes del módulo
export const CALENDAR_ROUTES = {
  HOME: "/calendar",
  CREATE: "/calendar/create",
  EDIT: "/calendar/edit",
  DETAIL: "/calendar/events",
  MONTH_VIEW: "/calendar/month",
  REMINDERS: "/calendar/reminders",
  VACCINATION: "/calendar/vaccination",
} as const;

export const EVENT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const EVENT_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const VACCINATION_STATUSES = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

export const REMINDER_STATUSES = {
  ACTIVE: "active",
  SENT: "sent",
  DISMISSED: "dismissed",
  FAILED: "failed",
  SCHEDULED: "scheduled",
} as const;

export const NOTIFICATION_METHODS = {
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  WHATSAPP: "whatsapp",
  CALL: "call",
  SYSTEM: "system",
} as const;

export const VACCINE_CATEGORIES = {
  VIRAL: "viral",
  BACTERIAL: "bacterial",
  PARASITIC: "parasitic",
  MULTIVALENT: "multivalent",
  OTHER: "other",
} as const;

export const EVENT_CATEGORIES = {
  HEALTH: "health",
  REPRODUCTION: "reproduction",
  NUTRITION: "nutrition",
  GENERAL: "general",
} as const;

// Funciones de utilidad exportadas
export const formatEventDate = (date: string): string => {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatEventTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

export const getEventPriorityColor = (priority: string): string => {
  switch (priority) {
    case EVENT_PRIORITIES.LOW:
      return "text-green-600 bg-green-100";
    case EVENT_PRIORITIES.MEDIUM:
      return "text-yellow-600 bg-yellow-100";
    case EVENT_PRIORITIES.HIGH:
      return "text-orange-600 bg-orange-100";
    case EVENT_PRIORITIES.URGENT:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case EVENT_STATUSES.PENDING:
      return "text-yellow-600 bg-yellow-100";
    case EVENT_STATUSES.IN_PROGRESS:
      return "text-blue-600 bg-blue-100";
    case EVENT_STATUSES.COMPLETED:
      return "text-green-600 bg-green-100";
    case EVENT_STATUSES.CANCELLED:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const isEventOverdue = (event: CalendarEvent): boolean => {
  const eventDate = new Date(`${event.date} ${event.time}`);
  const now = new Date();
  return event.status === EVENT_STATUSES.PENDING && eventDate < now;
};

export const isEventUpcoming = (
  event: CalendarEvent,
  days: number = 7
): boolean => {
  const eventDate = new Date(`${event.date} ${event.time}`);
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return (
    event.status === EVENT_STATUSES.PENDING &&
    eventDate >= now &&
    eventDate <= futureDate
  );
};

export const calculateEventDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return Math.abs(end.getTime() - start.getTime()) / (1000 * 60); // minutos
};

export const generateEventEndTime = (
  startTime: string,
  duration: number
): string => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  return end.toTimeString().slice(0, 5);
};

// Re-exportar tipos comunes que podrían ser necesarios en otros módulos
export type {
  CalendarEvent as Event,
  EventType as Type,
  CalendarStats as Stats,
  VaccinationScheduleData as VaccineScheduleData,
  VaccineType as Vaccine,
  ReminderData as Reminder,
};

// Metadatos del módulo
export const CALENDAR_MODULE_INFO = {
  name: "Calendar",
  version: "1.0.0",
  description: "Módulo completo de gestión de calendario para ganado bovino",
  components: [
    "CalendarPage",
    "CreateEvent",
    "EditEvent",
    "EventDetail",
    "MonthView",
    "EventReminder",
    "VaccinationSchedule",
  ],
  features: [
    "Gestión de eventos",
    "Programación de vacunaciones",
    "Sistema de recordatorios",
    "Vista de calendario mensual",
    "Seguimiento de cumplimiento",
    "Certificados de vacunación",
    "Integración con mapas",
    "Notificaciones automáticas",
  ],
  lastUpdated: "2025-07-08",
} as const;
