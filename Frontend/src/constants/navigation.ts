// Configuración de rutas y navegación para la aplicación de gestión ganadera

// Definición de iconos como strings (se importarán en los componentes)
export const ICONS = {
  HOME: "Home",
  BEEF: "Beef",
  SYRINGE: "Syringe",
  ACTIVITY: "Activity",
  MAP: "Map",
  CALENDAR: "Calendar",
  CHART: "BarChart3",
  SETTINGS: "Settings",
  FILE: "FileText",
  BELL: "Bell",
  PLUS: "Plus",
} as const;

// Definición de tipos para rutas
export interface Route {
  path: string;
  name: string;
  title: string;
  description?: string;
  icon?: string; // Cambiado de any a string
  exact?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  children?: Route[];
}

// Rutas principales de la aplicación
export const ROUTES = {
  // Ruta raíz
  ROOT: "/",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Gestión de ganado
  CATTLE: "/cattle",
  CATTLE_LIST: "/cattle/list",
  CATTLE_ADD: "/cattle/add",
  CATTLE_EDIT: "/cattle/edit/:id",
  CATTLE_VIEW: "/cattle/view/:id",

  // Vacunaciones
  VACCINATIONS: "/vaccinations",
  VACCINATIONS_LIST: "/vaccinations/list",
  VACCINATIONS_ADD: "/vaccinations/add",
  VACCINATIONS_EDIT: "/vaccinations/edit/:id",
  VACCINATIONS_SCHEDULE: "/vaccinations/schedule",
  VACCINATIONS_CALENDAR: "/vaccinations/calendar",

  // Enfermedades
  ILLNESSES: "/illnesses",
  ILLNESSES_LIST: "/illnesses/list",
  ILLNESSES_ADD: "/illnesses/add",
  ILLNESSES_EDIT: "/illnesses/edit/:id",
  ILLNESSES_REPORTS: "/illnesses/reports",

  // Mapas y ubicaciones
  MAPS: "/maps",
  MAPS_OVERVIEW: "/maps/overview",
  MAPS_VACCINATIONS: "/maps/vaccinations",
  MAPS_ILLNESSES: "/maps/illnesses",
  MAPS_LOCATIONS: "/maps/locations",

  // Reportes y análisis
  REPORTS: "/reports",
  REPORTS_HEALTH: "/reports/health",
  REPORTS_VACCINATIONS: "/reports/vaccinations",
  REPORTS_BREEDING: "/reports/breeding",
  REPORTS_FINANCIAL: "/reports/financial",

  // Configuraciones
  SETTINGS: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_SYSTEM: "/settings/system",

  // Autenticación
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Páginas de error
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  SERVER_ERROR: "/500",
} as const;

// Estructura de navegación principal
export const NAVIGATION_ITEMS: Route[] = [
  {
    path: ROUTES.DASHBOARD,
    name: "dashboard",
    title: "Panel Principal",
    description: "Vista general del sistema",
    icon: ICONS.HOME,
    exact: true,
    requiresAuth: true,
  },
  {
    path: ROUTES.CATTLE,
    name: "cattle",
    title: "Ganado",
    description: "Gestión de animales",
    icon: ICONS.BEEF,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.CATTLE_LIST,
        name: "cattle-list",
        title: "Lista de Animales",
        description: "Ver todos los animales registrados",
        requiresAuth: true,
      },
      {
        path: ROUTES.CATTLE_ADD,
        name: "cattle-add",
        title: "Registrar Animal",
        description: "Agregar nuevo animal al sistema",
        icon: ICONS.PLUS,
        requiresAuth: true,
      },
    ],
  },
  {
    path: ROUTES.VACCINATIONS,
    name: "vaccinations",
    title: "Vacunaciones",
    description: "Control de vacunas",
    icon: ICONS.SYRINGE,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.VACCINATIONS_LIST,
        name: "vaccinations-list",
        title: "Historial de Vacunas",
        description: "Ver todas las vacunaciones",
        requiresAuth: true,
      },
      {
        path: ROUTES.VACCINATIONS_ADD,
        name: "vaccinations-add",
        title: "Registrar Vacunación",
        description: "Aplicar nueva vacuna",
        icon: ICONS.PLUS,
        requiresAuth: true,
      },
      {
        path: ROUTES.VACCINATIONS_SCHEDULE,
        name: "vaccinations-schedule",
        title: "Programar Vacunas",
        description: "Planificar próximas vacunaciones",
        requiresAuth: true,
      },
      {
        path: ROUTES.VACCINATIONS_CALENDAR,
        name: "vaccinations-calendar",
        title: "Calendario de Vacunas",
        description: "Vista de calendario",
        icon: ICONS.CALENDAR,
        requiresAuth: true,
      },
    ],
  },
  {
    path: ROUTES.ILLNESSES,
    name: "illnesses",
    title: "Enfermedades",
    description: "Registro sanitario",
    icon: ICONS.ACTIVITY,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.ILLNESSES_LIST,
        name: "illnesses-list",
        title: "Historial Médico",
        description: "Ver enfermedades registradas",
        requiresAuth: true,
      },
      {
        path: ROUTES.ILLNESSES_ADD,
        name: "illnesses-add",
        title: "Registrar Enfermedad",
        description: "Nuevo diagnóstico",
        icon: ICONS.PLUS,
        requiresAuth: true,
      },
      {
        path: ROUTES.ILLNESSES_REPORTS,
        name: "illnesses-reports",
        title: "Reportes Sanitarios",
        description: "Análisis epidemiológico",
        icon: ICONS.FILE,
        requiresAuth: true,
      },
    ],
  },
  {
    path: ROUTES.MAPS,
    name: "maps",
    title: "Mapas",
    description: "Ubicaciones y zonas",
    icon: ICONS.MAP,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.MAPS_OVERVIEW,
        name: "maps-overview",
        title: "Vista General",
        description: "Mapa completo del rancho",
        requiresAuth: true,
      },
      {
        path: ROUTES.MAPS_VACCINATIONS,
        name: "maps-vaccinations",
        title: "Mapa de Vacunaciones",
        description: "Ubicaciones de vacunación",
        requiresAuth: true,
      },
      {
        path: ROUTES.MAPS_ILLNESSES,
        name: "maps-illnesses",
        title: "Mapa Epidemiológico",
        description: "Zonas de enfermedades",
        requiresAuth: true,
      },
      {
        path: ROUTES.MAPS_LOCATIONS,
        name: "maps-locations",
        title: "Ubicaciones de Ganado",
        description: "Posición actual del ganado",
        requiresAuth: true,
      },
    ],
  },
  {
    path: ROUTES.REPORTS,
    name: "reports",
    title: "Reportes",
    description: "Análisis y estadísticas",
    icon: ICONS.CHART,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.REPORTS_HEALTH,
        name: "reports-health",
        title: "Estado Sanitario",
        description: "Reportes de salud",
        requiresAuth: true,
      },
      {
        path: ROUTES.REPORTS_VACCINATIONS,
        name: "reports-vaccinations",
        title: "Cobertura de Vacunas",
        description: "Estadísticas de vacunación",
        requiresAuth: true,
      },
      {
        path: ROUTES.REPORTS_BREEDING,
        name: "reports-breeding",
        title: "Reproducción",
        description: "Reportes reproductivos",
        requiresAuth: true,
      },
      {
        path: ROUTES.REPORTS_FINANCIAL,
        name: "reports-financial",
        title: "Costos Veterinarios",
        description: "Análisis financiero",
        requiresAuth: true,
      },
    ],
  },
  {
    path: ROUTES.SETTINGS,
    name: "settings",
    title: "Configuración",
    description: "Ajustes del sistema",
    icon: ICONS.SETTINGS,
    requiresAuth: true,
    children: [
      {
        path: ROUTES.SETTINGS_PROFILE,
        name: "settings-profile",
        title: "Perfil de Usuario",
        description: "Información personal",
        requiresAuth: true,
      },
      {
        path: ROUTES.SETTINGS_NOTIFICATIONS,
        name: "settings-notifications",
        title: "Notificaciones",
        description: "Preferencias de alertas",
        icon: ICONS.BELL,
        requiresAuth: true,
      },
      {
        path: ROUTES.SETTINGS_SYSTEM,
        name: "settings-system",
        title: "Sistema",
        description: "Configuraciones generales",
        requiresAuth: true,
        roles: ["admin"],
      },
    ],
  },
];

// Breadcrumbs configuration
export const BREADCRUMB_LABELS = {
  [ROUTES.DASHBOARD]: "Inicio",
  [ROUTES.CATTLE]: "Ganado",
  [ROUTES.CATTLE_LIST]: "Lista",
  [ROUTES.CATTLE_ADD]: "Agregar",
  [ROUTES.CATTLE_EDIT]: "Editar",
  [ROUTES.CATTLE_VIEW]: "Ver Detalles",
  [ROUTES.VACCINATIONS]: "Vacunaciones",
  [ROUTES.VACCINATIONS_LIST]: "Historial",
  [ROUTES.VACCINATIONS_ADD]: "Nueva Vacuna",
  [ROUTES.VACCINATIONS_SCHEDULE]: "Programar",
  [ROUTES.VACCINATIONS_CALENDAR]: "Calendario",
  [ROUTES.ILLNESSES]: "Enfermedades",
  [ROUTES.ILLNESSES_LIST]: "Historial",
  [ROUTES.ILLNESSES_ADD]: "Nuevo Diagnóstico",
  [ROUTES.ILLNESSES_REPORTS]: "Reportes",
  [ROUTES.MAPS]: "Mapas",
  [ROUTES.MAPS_OVERVIEW]: "Vista General",
  [ROUTES.MAPS_VACCINATIONS]: "Vacunaciones",
  [ROUTES.MAPS_ILLNESSES]: "Enfermedades",
  [ROUTES.MAPS_LOCATIONS]: "Ubicaciones",
  [ROUTES.REPORTS]: "Reportes",
  [ROUTES.REPORTS_HEALTH]: "Salud",
  [ROUTES.REPORTS_VACCINATIONS]: "Vacunas",
  [ROUTES.REPORTS_BREEDING]: "Reproducción",
  [ROUTES.REPORTS_FINANCIAL]: "Financiero",
  [ROUTES.SETTINGS]: "Configuración",
  [ROUTES.SETTINGS_PROFILE]: "Perfil",
  [ROUTES.SETTINGS_NOTIFICATIONS]: "Notificaciones",
  [ROUTES.SETTINGS_SYSTEM]: "Sistema",
} as const;

// Rutas públicas que no requieren autenticación
export const PUBLIC_ROUTES = [
  ROUTES.ROOT,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.NOT_FOUND,
  ROUTES.UNAUTHORIZED,
  ROUTES.SERVER_ERROR,
];

// Rutas protegidas que requieren autenticación
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.CATTLE,
  ROUTES.VACCINATIONS,
  ROUTES.ILLNESSES,
  ROUTES.MAPS,
  ROUTES.REPORTS,
  ROUTES.SETTINGS,
];

// Funciones helper para navegación
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path as any);
};

export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
};

export const getRouteTitle = (path: string): string => {
  const route = NAVIGATION_ITEMS.find(
    (item) =>
      item.path === path || item.children?.some((child) => child.path === path)
  );

  if (route) return route.title;

  // Buscar en children
  for (const item of NAVIGATION_ITEMS) {
    if (item.children) {
      const childRoute = item.children.find((child) => child.path === path);
      if (childRoute) return childRoute.title;
    }
  }

  return "Página no encontrada";
};

// Configuración de animaciones para transiciones de ruta
export const ROUTE_ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
} as const;
