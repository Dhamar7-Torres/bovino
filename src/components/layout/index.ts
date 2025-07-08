// =================================================================
// EXPORTACIONES DE COMPONENTES DEL LAYOUT - BOVINO UJAT
// =================================================================

// Sistema de gestión ganadera con layout moderno y gradientes naturales
// Desarrollado para la Universidad Juárez Autónoma de Tabasco (UJAT)

// Exportaciones principales de los componentes del layout
export { default as Layout } from "./Layout";
export { default as Header } from "./Header";
export { default as Sidebar } from "./Sidebar";
export { default as Footer } from "./Footer";

// Exportaciones alternativas para mayor flexibilidad
export { default as MainLayout } from "./Layout";
export { default as AppHeader } from "./Header";
export { default as AppSidebar } from "./Sidebar";
export { default as AppFooter } from "./Footer";

// =================================================================
// TIPOS Y INTERFACES PRINCIPALES
// =================================================================

// Props para el componente Layout principal
export interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
}

// Props para el Header
export interface HeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

// Props para el Sidebar
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  className?: string;
}

// Props para el Footer
export interface FooterProps {
  className?: string;
  variant?: "full" | "minimal";
}

// =================================================================
// CONSTANTES DE DISEÑO - NUEVA PALETA NATURAL
// =================================================================

// Paleta de colores del sistema actualizada con colores tierra y naturales
export const THEME_COLORS = {
  // Gradiente principal layout con colores naturales
  layout: {
    background: "from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
    primary: "#519a7c", // Verde desaturado
    secondary: "#f2e9d8", // Beige claro
    tertiary: "#f4ac3a", // Naranja vibrante
  },

  // Colores del header con degradado verde
  header: {
    background: "from-[#2e8b57] to-[#3ca373]", // Verde selva a verde claro
    primary: "#2e8b57", // Verde selva medio
    secondary: "#3ca373", // Verde más claro y saturado
    text: "text-white",
    textSecondary: "text-white/90",
    hover: "hover:bg-white/10",
    border: "border-white/20",
  },

  // Colores del sidebar beige
  sidebar: {
    background: "#F5F5DC", // Beige claro/crema
    border: "#e0ddd0", // Borde beige más oscuro
    text: "#65625b", // Gris claro para textos de menú
    textDark: "text-gray-800", // Texto oscuro para títulos
    textSecondary: "#7a7a7a", // Texto gris claro para versión
    active: "bg-[#d9eddd] text-gray-800", // Fondo verde translúcido para activos
    activeIcon: "#4e9c75", // Verde medio para iconos activos
    icon: "#5c5b58", // Gris ligeramente más oscuro para iconos normales
    badge: "#2d5a41", // Verde oscuro para badges
    hover: "hover:bg-white/50",
  },

  // Colores del footer beige
  footer: {
    background: "#F5F5DC", // Beige claro consistente
    border: "#D3D3D3", // Borde gris claro
    text: "text-gray-800", // Texto principal gris oscuro
    textSecondary: "#7b766d", // Texto secundario gris tenue
    icon: "text-gray-600", // Iconos grises
    hover: "hover:text-gray-700",
  },

  // Colores específicos para widgets de dashboard
  widgets: {
    background: "#fffdf8", // Blanco marfil para fondos de módulos

    // Total Ganado
    ganado: {
      icon: "#9c6d3f", // Marrón
      background: "#c9a47e", // Fondo más claro marrón
      text: "text-gray-800",
    },

    // Vacunas Pendientes
    vacunas: {
      icon: "#e47b3e", // Naranja brillante
      indicator: "#d94343", // Rojo para "+3 hoy"
      progress: "#e6a066", // Naranja claro para barra
      text: "text-gray-800",
    },

    // Eventos Hoy
    eventos: {
      icon: "#9c6ad5", // Morado
      progress: "#bfa3ec", // Morado suave para barra
      text: "text-gray-800",
    },

    // Alertas Activas
    alertas: {
      icon: "#4a7cb1", // Azul
      indicator: "#71a9d6", // Azul claro para "-1 hoy"
      progress: "#a5c7e6", // Azul pastel para barra
      text: "text-gray-800",
    },
  },

  // Colores de estado del sistema
  status: {
    online: "#519a7c",
    offline: "#d94343",
    warning: "#f4ac3a",
    info: "#4a7cb1",
    accent: "#f4ac3a", // Nuevo color de acento naranja
  },
} as const;

// Breakpoints responsivos
export const BREAKPOINTS = {
  mobile: "640px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px",
  wide: "1536px",
} as const;

// Duraciones de animación
export const ANIMATIONS = {
  fast: "duration-200",
  normal: "duration-300",
  slow: "duration-500",
  sidebar: "duration-300 ease-in-out",
  spring: "type: 'spring', damping: 20, stiffness: 300",
} as const;

// =================================================================
// CONFIGURACIÓN DEL LAYOUT
// =================================================================

// Configuración por defecto del sidebar
export const SIDEBAR_CONFIG = {
  width: "w-80", // 320px
  mobileBreakpoint: 1024, // lg breakpoint
  defaultOpenOnDesktop: true,
  defaultClosedOnMobile: true,
  backgroundColor: THEME_COLORS.sidebar.background,
  borderColor: THEME_COLORS.sidebar.border,
} as const;

// Configuración del header
export const HEADER_CONFIG = {
  height: "h-16", // 64px
  zIndex: "z-50",
  backdropBlur: "backdrop-blur-md",
  gradient: THEME_COLORS.header.background,
} as const;

// Configuración del footer
export const FOOTER_CONFIG = {
  backgroundColor: THEME_COLORS.footer.background,
  borderColor: THEME_COLORS.footer.border,
  textColor: THEME_COLORS.footer.text,
  variants: ["full", "minimal"] as const,
} as const;

// =================================================================
// UTILIDADES PARA COMPONENTES
// =================================================================

// Función helper para clases CSS dinámicas del layout principal
export const getLayoutClasses = (
  isSidebarOpen: boolean,
  isMobile: boolean
): string => {
  let classes =
    "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0";
  if (isSidebarOpen && !isMobile) {
    classes += " ml-80"; // Margen para sidebar abierto en desktop
  } else {
    classes += " ml-0";
  }
  return classes;
};

// Función helper para detectar si es móvil
export const getIsMobile = (): boolean => {
  return typeof window !== "undefined" && window.innerWidth < 1024;
};

// Función helper para obtener el módulo actual
export const getCurrentModule = (pathname: string): string => {
  const pathSegments = pathname.split("/").filter(Boolean);
  return pathSegments[0] || "dashboard";
};

// Función helper para obtener colores de widget según el tipo
export const getWidgetColors = (
  type: "ganado" | "vacunas" | "eventos" | "alertas"
) => {
  return THEME_COLORS.widgets[type];
};

// Función helper para clase de botón principal
export const getPrimaryButtonClasses = (): string => {
  return "bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200";
};

// Función helper para clase de fondo principal
export const getMainBackgroundClasses = (): string => {
  return "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]";
};

// Función helper para degradado de texto
export const getTextGradientClasses = (): string => {
  return "bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] bg-clip-text text-transparent";
};

// Función helper para degradado de bordes
export const getBorderGradientClasses = (): string => {
  return "border-gradient-to-r from-[#519a7c] to-[#f4ac3a]";
};

// =================================================================
// CONSTANTES DE ESTILO ESPECÍFICAS
// =================================================================

// Clases CSS reutilizables para el sistema
export const CSS_CLASSES = {
  // Contenedores principales
  container: "max-w-7xl mx-auto px-6 lg:px-8",

  // Tarjetas y módulos
  card: "bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20",
  cardHover: "hover:shadow-xl hover:scale-105 transition-all duration-300",

  // Texto
  titlePrimary: "text-4xl font-bold text-white drop-shadow-sm",
  titleSecondary: "text-2xl font-semibold text-gray-800",
  titleGradient: getTextGradientClasses(),
  textMuted: "text-gray-600",

  // Botones
  buttonPrimary: getPrimaryButtonClasses(),
  buttonSecondary:
    "bg-white/20 text-gray-700 hover:bg-white/30 border border-gray-200",
  buttonGradient:
    "bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] text-white hover:from-[#457e68] hover:to-[#e8a234] transition-all duration-200",

  // Fondos
  backgroundMain: getMainBackgroundClasses(),
  backgroundCard: "bg-[#fffdf8]",

  // Estados
  loading: "animate-pulse",
  disabled: "opacity-50 cursor-not-allowed",
} as const;

// =================================================================
// TIPOS DE DATOS
// =================================================================

// Tipo para los colores de widgets
export type WidgetType = "ganado" | "vacunas" | "eventos" | "alertas";

// Tipo para variantes de componentes
export type ComponentVariant = "full" | "minimal" | "compact";

// Tipo para tamaños de pantalla
export type ScreenSize = "mobile" | "tablet" | "laptop" | "desktop" | "wide";

// =================================================================
// VERSIÓN Y METADATOS
// =================================================================

export const LAYOUT_VERSION = "2.1.0";
export const LAYOUT_AUTHOR = "UJAT - Universidad Juárez Autónoma de Tabasco";
export const LAYOUT_DESCRIPTION =
  "Sistema de layout moderno para gestión ganadera con paleta de colores naturales y naranja vibrante";
export const LAYOUT_LAST_UPDATED = "2025-01-06";

// Información del tema actual
export const CURRENT_THEME = {
  name: "Natural Tierra Vibrante",
  description:
    "Paleta de colores beige, verde y naranja vibrante para aplicación ganadera",
  primaryColor: "#519a7c",
  secondaryColor: "#F5F5DC",
  accentColor: "#f4ac3a",
  version: "2.1.0",
} as const;

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportar el Layout como default para importación simplificada
export { default } from "./Layout";
