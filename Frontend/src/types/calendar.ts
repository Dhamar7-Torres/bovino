// Tipos específicos para el módulo de calendario de la aplicación de gestión ganadera
// Integra con los tipos existentes de eventos y componentes

// Importación de tipos existentes (se asume que están en el mismo nivel de carpeta)
// import { EventType, AnyEvent } from '../constants/eventTypes';

// Modos de vista del calendario
export enum CalendarViewMode {
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
  AGENDA = "agenda",
  TIMELINE = "timeline",
}

// Tipos de selección para el calendario
export enum CalendarSelectionMode {
  SINGLE = "single",
  MULTIPLE = "multiple",
  RANGE = "range",
}

// Estados posibles para un día en el calendario
export enum DayState {
  NORMAL = "normal",
  TODAY = "today",
  SELECTED = "selected",
  DISABLED = "disabled",
  HIGHLIGHTED = "highlighted",
  HAS_EVENTS = "has_events",
  WEEKEND = "weekend",
  OUTSIDE_MONTH = "outside_month",
}

// Tipos de filtros para eventos en el calendario
export enum EventFilter {
  ALL = "all",
  VACCINATIONS = "vaccinations",
  ILLNESSES = "illnesses",
  HEALTH_CHECKS = "health_checks",
  REPRODUCTIVE = "reproductive",
  MANAGEMENT = "management",
  TRANSFERS = "transfers",
}

// Prioridades para eventos del calendario
export enum EventPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// Estado de recordatorio para eventos
export enum ReminderStatus {
  NONE = "none",
  PENDING = "pending",
  SENT = "sent",
  OVERDUE = "overdue",
}

// Configuración base del calendario
export interface CalendarConfig {
  // Configuración de vista
  defaultView: CalendarViewMode;
  allowedViews: CalendarViewMode[];

  // Configuración de selección
  selectionMode: CalendarSelectionMode;
  allowMultipleSelection: boolean;

  // Configuración de fechas
  minSelectableDate?: Date;
  maxSelectableDate?: Date;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[]; // 0-6 (Domingo a Sábado)

  // Configuración de idioma y formato
  locale: string;
  firstDayOfWeek: number; // 0-6 (Domingo a Sábado)
  timeFormat: "12" | "24";
  dateFormat: string;

  // Configuración de eventos
  showEvents: boolean;
  allowEventCreation: boolean;
  allowEventEditing: boolean;
  eventFilters: EventFilter[];
  defaultEventFilter: EventFilter;

  // Configuración de recordatorios
  enableReminders: boolean;
  defaultReminderTime: number; // minutos antes del evento

  // Configuración visual
  showWeekNumbers: boolean;
  showOutsideDays: boolean;
  highlightWeekends: boolean;
  highlightToday: boolean;

  // Configuración de animaciones
  enableAnimations: boolean;
  transitionDuration: number; // en milisegundos
}

// Posición en el calendario
export interface CalendarPosition {
  row: number;
  column: number;
  week: number;
}

// Información detallada de un día en el calendario
export interface CalendarDay {
  // Información básica de la fecha
  date: Date;
  dayNumber: number;
  month: number;
  year: number;
  dayOfWeek: number;

  // Estados del día
  states: DayState[];
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isOutsideCurrentMonth: boolean;
  isWeekend: boolean;

  // Eventos del día
  events: CalendarEvent[];
  eventCount: number;
  hasUrgentEvents: boolean;
  hasOverdueEvents: boolean;

  // Posición en la grilla del calendario
  position: CalendarPosition;

  // Metadatos adicionales
  tooltipText?: string;
  customClass?: string;
  customData?: Record<string, any>;
}

// Evento específico del calendario (extiende los eventos base)
export interface CalendarEvent {
  // Identificación única
  id: string;

  // Información temporal
  startDate: Date;
  endDate?: Date;
  isAllDay: boolean;
  duration?: number; // en minutos

  // Información básica del evento
  title: string;
  description?: string;
  type: string; // Correspondería a EventType del archivo existente
  category: EventFilter;
  priority: EventPriority;

  // Estados del evento
  isCompleted: boolean;
  isCancelled: boolean;
  isRecurring: boolean;

  // Información del animal
  animalId: string;
  animalTag?: string;
  animalName?: string;

  // Información de ubicación
  locationId?: string;
  locationName?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Información del veterinario/responsable
  veterinarianId?: string;
  veterinarianName?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;

  // Recordatorios
  reminders: EventReminder[];

  // Información visual
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  icon?: string;

  // Datos específicos según el tipo de evento
  eventData?: Record<string, any>;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  notes?: string;
}

// Configuración de recordatorios para eventos
export interface EventReminder {
  id: string;
  eventId: string;

  // Configuración temporal
  reminderTime: number; // minutos antes del evento
  scheduledAt: Date;

  // Estado del recordatorio
  status: ReminderStatus;
  sentAt?: Date;

  // Configuración del recordatorio
  type: "email" | "sms" | "push" | "system";
  message?: string;
  recipients: string[]; // IDs de usuarios

  // Metadatos
  createdAt: Date;
  attempts: number;
  lastAttemptAt?: Date;
}

// Configuración para eventos recurrentes
export interface RecurringEventConfig {
  // Patrón de recurrencia
  pattern: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number; // cada X días/semanas/meses/años

  // Días específicos (para patrones semanales)
  daysOfWeek?: number[]; // 0-6

  // Fecha específica del mes (para patrones mensuales)
  dayOfMonth?: number; // 1-31

  // Configuración de fin de recurrencia
  endType: "never" | "after_occurrences" | "on_date";
  endDate?: Date;
  maxOccurrences?: number;

  // Excepciones (fechas donde no debe ocurrir)
  exceptions?: Date[];
}

// Estado del calendario para manejo de estado global
export interface CalendarState {
  // Configuración actual
  config: CalendarConfig;

  // Vista actual
  currentView: CalendarViewMode;
  currentDate: Date; // Fecha que se está viendo actualmente
  selectedDates: Date[];
  selectedRange?: {
    start: Date;
    end: Date;
  };

  // Datos cargados
  events: CalendarEvent[];
  loadedDateRange: {
    start: Date;
    end: Date;
  };

  // Filtros activos
  activeFilters: EventFilter[];
  searchQuery?: string;

  // Estados de interfaz
  isLoading: boolean;
  isTransitioning: boolean;
  showEventModal: boolean;
  selectedEvent?: CalendarEvent;

  // Errores
  error?: string;

  // Cache de días calculados
  calculatedDays: Map<string, CalendarDay>; // key: YYYY-MM-DD
}

// Acciones para el calendario (para usar con reducers)
export enum CalendarActionType {
  // Configuración
  SET_CONFIG = "SET_CONFIG",
  UPDATE_CONFIG = "UPDATE_CONFIG",

  // Vista y navegación
  CHANGE_VIEW = "CHANGE_VIEW",
  NAVIGATE_TO_DATE = "NAVIGATE_TO_DATE",
  NAVIGATE_PREVIOUS = "NAVIGATE_PREVIOUS",
  NAVIGATE_NEXT = "NAVIGATE_NEXT",
  GO_TO_TODAY = "GO_TO_TODAY",

  // Selección
  SELECT_DATE = "SELECT_DATE",
  SELECT_MULTIPLE_DATES = "SELECT_MULTIPLE_DATES",
  SELECT_DATE_RANGE = "SELECT_DATE_RANGE",
  CLEAR_SELECTION = "CLEAR_SELECTION",

  // Eventos
  LOAD_EVENTS = "LOAD_EVENTS",
  LOAD_EVENTS_SUCCESS = "LOAD_EVENTS_SUCCESS",
  LOAD_EVENTS_ERROR = "LOAD_EVENTS_ERROR",
  ADD_EVENT = "ADD_EVENT",
  UPDATE_EVENT = "UPDATE_EVENT",
  DELETE_EVENT = "DELETE_EVENT",

  // Filtros
  SET_FILTERS = "SET_FILTERS",
  ADD_FILTER = "ADD_FILTER",
  REMOVE_FILTER = "REMOVE_FILTER",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",

  // UI
  SET_LOADING = "SET_LOADING",
  SET_TRANSITIONING = "SET_TRANSITIONING",
  SHOW_EVENT_MODAL = "SHOW_EVENT_MODAL",
  HIDE_EVENT_MODAL = "HIDE_EVENT_MODAL",
  SELECT_EVENT = "SELECT_EVENT",
  SET_ERROR = "SET_ERROR",
  CLEAR_ERROR = "CLEAR_ERROR",
}

// Acciones del calendario
export interface CalendarAction {
  type: CalendarActionType;
  payload?: any;
}

// Props para componentes del calendario
export interface CalendarComponentProps {
  // Configuración
  config?: Partial<CalendarConfig>;

  // Estado
  currentDate?: Date;
  selectedDates?: Date[];
  selectedRange?: { start: Date; end: Date };

  // Datos
  events?: CalendarEvent[];

  // Callbacks
  onDateSelect?: (date: Date) => void;
  onDatesSelect?: (dates: Date[]) => void;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onViewChange?: (view: CalendarViewMode) => void;
  onDateChange?: (date: Date) => void;
  onFilterChange?: (filters: EventFilter[]) => void;

  // Estilos y clases
  className?: string;
  eventClassName?: string;
  dayClassName?: string;

  // Configuración de renderizado
  renderEvent?: (event: CalendarEvent) => React.ReactNode;
  renderDay?: (day: CalendarDay) => React.ReactNode;
  renderHeader?: (date: Date) => React.ReactNode;
}

// Utilidades para trabajar con fechas del calendario
export interface CalendarDateUtils {
  formatDate: (date: Date, format?: string) => string;
  parseDate: (dateString: string, format?: string) => Date;
  isSameDay: (date1: Date, date2: Date) => boolean;
  isSameWeek: (date1: Date, date2: Date) => boolean;
  isSameMonth: (date1: Date, date2: Date) => boolean;
  addDays: (date: Date, days: number) => Date;
  addWeeks: (date: Date, weeks: number) => Date;
  addMonths: (date: Date, months: number) => Date;
  getStartOfWeek: (date: Date, firstDayOfWeek?: number) => Date;
  getEndOfWeek: (date: Date, firstDayOfWeek?: number) => Date;
  getStartOfMonth: (date: Date) => Date;
  getEndOfMonth: (date: Date) => Date;
  getDaysInMonth: (date: Date) => number;
  getWeekNumber: (date: Date) => number;
  isWeekend: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  isInRange: (date: Date, start: Date, end: Date) => boolean;
}

// Configuración para exportar/importar eventos del calendario
export interface CalendarExportConfig {
  format: "ics" | "csv" | "json" | "excel";
  dateRange?: { start: Date; end: Date };
  includeFilters?: EventFilter[];
  includeFields?: string[];
  filename?: string;
}

// Configuración para sincronización con calendarios externos
export interface CalendarSyncConfig {
  provider: "google" | "outlook" | "apple" | "caldav";
  credentials: Record<string, any>;
  syncDirection: "import" | "export" | "bidirectional";
  autoSync: boolean;
  syncInterval: number; // en minutos
  lastSyncAt?: Date;
}

// Tipos auxiliares para facilitar el uso
export type CalendarEventType = keyof typeof EventFilter;
export type CalendarDateRange = { start: Date; end: Date };
export type CalendarEventHandler = (event: CalendarEvent) => void;
export type CalendarDateHandler = (date: Date) => void;
