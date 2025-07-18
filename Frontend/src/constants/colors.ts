// Paleta de colores para la aplicación de gestión ganadera

// Colores primarios del tema
export const PRIMARY_COLORS = {
  // Verde principal - representa naturaleza y agricultura
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Color principal
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  // Azul secundario - representa confianza y tecnología
  secondary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  // Grises neutrales
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
} as const;

// Colores para estados de salud del ganado
export const HEALTH_STATUS_COLORS = {
  healthy: {
    background: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
    icon: "#16a34a",
  },
  sick: {
    background: "#fee2e2",
    border: "#ef4444",
    text: "#dc2626",
    icon: "#b91c1c",
  },
  quarantine: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
    icon: "#c2410c",
  },
  recovering: {
    background: "#ddd6fe",
    border: "#8b5cf6",
    text: "#7c3aed",
    icon: "#6d28d9",
  },
  dead: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
    icon: "#4b5563",
  },
} as const;

// Colores para severidad de enfermedades
export const ILLNESS_SEVERITY_COLORS = {
  mild: {
    background: "#fef3c7",
    border: "#fbbf24",
    text: "#f59e0b",
    icon: "#d97706",
  },
  moderate: {
    background: "#fed7aa",
    border: "#fb923c",
    text: "#ea580c",
    icon: "#c2410c",
  },
  severe: {
    background: "#fecaca",
    border: "#f87171",
    text: "#dc2626",
    icon: "#b91c1c",
  },
  critical: {
    background: "#fde68a",
    border: "#dc2626",
    text: "#991b1b",
    icon: "#7f1d1d",
  },
} as const;

// Colores para tipos de ganado bovino
export const BOVINE_TYPE_COLORS = {
  dairy_cow: {
    background: "#e0f2fe",
    border: "#0891b2",
    text: "#0e7490",
    icon: "#155e75",
  },
  beef_cow: {
    background: "#fef2f2",
    border: "#dc2626",
    text: "#b91c1c",
    icon: "#991b1b",
  },
  bull: {
    background: "#f3f4f6",
    border: "#374151",
    text: "#1f2937",
    icon: "#111827",
  },
  calf: {
    background: "#fdf4ff",
    border: "#d946ef",
    text: "#c026d3",
    icon: "#a21caf",
  },
  heifer: {
    background: "#f0f9ff",
    border: "#0284c7",
    text: "#0369a1",
    icon: "#075985",
  },
  steer: {
    background: "#f7fee7",
    border: "#65a30d",
    text: "#4d7c0f",
    icon: "#365314",
  },
} as const;

// Colores para el mapa
export const MAP_COLORS = {
  // Marcadores para diferentes eventos
  vaccination: {
    primary: "#22c55e",
    secondary: "#dcfce7",
    accent: "#15803d",
  },
  illness: {
    primary: "#ef4444",
    secondary: "#fee2e2",
    accent: "#dc2626",
  },
  location: {
    primary: "#3b82f6",
    secondary: "#dbeafe",
    accent: "#1d4ed8",
  },
  // Zonas de riesgo
  lowRisk: {
    fill: "#dcfce7",
    stroke: "#22c55e",
    opacity: 0.3,
  },
  mediumRisk: {
    fill: "#fef3c7",
    stroke: "#f59e0b",
    opacity: 0.4,
  },
  highRisk: {
    fill: "#fee2e2",
    stroke: "#ef4444",
    opacity: 0.5,
  },
} as const;

// Colores para alertas y notificaciones
export const ALERT_COLORS = {
  success: {
    background: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
  },
  warning: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
  },
  error: {
    background: "#fee2e2",
    border: "#ef4444",
    text: "#dc2626",
  },
  info: {
    background: "#dbeafe",
    border: "#3b82f6",
    text: "#1d4ed8",
  },
} as const;

// Gradientes para fondos y elementos decorativos
export const GRADIENTS = {
  primary: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  secondary: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  neutral: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
  // Gradientes especiales para la aplicación ganadera
  pasture: "linear-gradient(135deg, #84cc16 0%, #22c55e 50%, #16a34a 100%)",
  sky: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)",
  earth: "linear-gradient(135deg, #a3a3a3 0%, #737373 50%, #525252 100%)",
} as const;

// Colores para estados interactivos
export const INTERACTIVE_COLORS = {
  hover: {
    primary: "#16a34a",
    secondary: "#1d4ed8",
    neutral: "#525252",
  },
  active: {
    primary: "#15803d",
    secondary: "#1e40af",
    neutral: "#404040",
  },
  focus: {
    ring: "#22c55e",
    offset: "#ffffff",
  },
  disabled: {
    background: "#f5f5f5",
    text: "#a3a3a3",
    border: "#e5e5e5",
  },
} as const;

// Colores para gráficos y visualizaciones
export const CHART_COLORS = [
  "#22c55e", // Verde principal
  "#3b82f6", // Azul
  "#f59e0b", // Amarillo
  "#ef4444", // Rojo
  "#8b5cf6", // Púrpura
  "#06b6d4", // Cian
  "#f97316", // Naranja
  "#ec4899", // Rosa
  "#84cc16", // Lima
  "#6366f1", // Índigo
] as const;

// Función helper para obtener colores de estado de salud
export const getHealthStatusColor = (status: string) => {
  return (
    HEALTH_STATUS_COLORS[status as keyof typeof HEALTH_STATUS_COLORS] ||
    HEALTH_STATUS_COLORS.healthy
  );
};

// Función helper para obtener colores de severidad de enfermedad
export const getIllnessSeverityColor = (severity: string) => {
  return (
    ILLNESS_SEVERITY_COLORS[severity as keyof typeof ILLNESS_SEVERITY_COLORS] ||
    ILLNESS_SEVERITY_COLORS.mild
  );
};

// Función helper para obtener colores de tipo de ganado
export const getBovineTypeColor = (type: string) => {
  return (
    BOVINE_TYPE_COLORS[type as keyof typeof BOVINE_TYPE_COLORS] ||
    BOVINE_TYPE_COLORS.dairy_cow
  );
};
