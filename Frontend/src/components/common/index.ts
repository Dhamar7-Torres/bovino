// ============================================================================
// EXPORTACIONES DE COMPONENTES COMUNES
// ============================================================================
// Este archivo centraliza todas las exportaciones de componentes comunes
// para facilitar las importaciones en otros módulos de la aplicación.

// Componentes de texto y animación
export { default as AnimatedText } from "./AnimatedText";

// Componentes de diálogo y modales
export { default as ConfirmDialog } from "./ConfirmDialog";

// Componentes de estado
export { default as EmptyState } from "./EmptyState";
export { default as LoadingSpinner } from "./LoadingSpinner";

// Componentes de manejo de errores
export { default as ErrorBoundary, useErrorHandler } from "./ErrorBoundary";

// ============================================================================
// EXPORTACIONES DE TIPOS Y INTERFACES
// ============================================================================

// Tipos para AnimatedText
export type AnimatedTextVariant =
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "typewriter"
  | "bounce";

// Tipos para ConfirmDialog
export type DialogType = "warning" | "danger" | "success" | "info" | "custom";

// Tipos para EmptyState
export type EmptyStateType =
  | "no-cattle"
  | "no-search-results"
  | "no-vaccinations"
  | "no-illnesses"
  | "no-locations"
  | "no-connection"
  | "error"
  | "loading-failed"
  | "no-reports"
  | "no-veterinarians"
  | "custom";

// Tipos para LoadingSpinner
export type SpinnerType =
  | "default"
  | "pulse"
  | "bouncing-dots"
  | "rotating-squares"
  | "wave"
  | "orbit"
  | "heartbeat"
  | "custom";

export type LoadingContext =
  | "general"
  | "geolocation"
  | "vaccination"
  | "health-check"
  | "data-sync"
  | "connection"
  | "cattle-loading"
  | "file-upload"
  | "file-download"
  | "processing";

// Tipos para ErrorBoundary
export type ErrorType =
  | "component"
  | "network"
  | "permission"
  | "validation"
  | "unknown";

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

// Helper para crear mensajes de carga contextuales
export const createLoadingMessage = (
  context: LoadingContext,
  customMessage?: string
): string => {
  const defaultMessages = {
    general: "Cargando...",
    geolocation: "Obteniendo ubicación GPS...",
    vaccination: "Procesando información de vacunación...",
    "health-check": "Verificando estado de salud del ganado...",
    "data-sync": "Sincronizando datos con el servidor...",
    connection: "Estableciendo conexión...",
    "cattle-loading": "Cargando información del ganado...",
    "file-upload": "Subiendo archivo al servidor...",
    "file-download": "Descargando archivo...",
    processing: "Procesando información...",
  };

  return customMessage || defaultMessages[context];
};

// Helper para determinar el contexto de carga basado en la acción
export const getLoadingContextFromAction = (action: string): LoadingContext => {
  const actionMappings: Record<string, LoadingContext> = {
    "fetch-bovines": "cattle-loading",
    "get-location": "geolocation",
    "save-vaccination": "vaccination",
    "upload-file": "file-upload",
    "download-report": "file-download",
    "sync-data": "data-sync",
    "check-health": "health-check",
    connect: "connection",
    process: "processing",
  };

  return actionMappings[action] || "general";
};

// Helper para crear configuraciones de EmptyState específicas para bovinos
export const createCattleEmptyState = (
  type: EmptyStateType,
  customTitle?: string,
  customDescription?: string,
  onAction?: () => void
) => {
  return {
    type,
    title: customTitle,
    description: customDescription,
    onAction,
    variant: "card" as const,
    size: "medium" as const,
  };
};

// Helper para crear configuraciones de diálogo de confirmación
export const createConfirmDialog = (
  type: DialogType,
  title: string,
  message: string,
  onConfirm: () => void,
  onClose: () => void
) => {
  const confirmTexts = {
    warning: "Continuar",
    danger: "Eliminar",
    success: "Aceptar",
    info: "Entendido",
    custom: "Confirmar",
  };

  return {
    type,
    title,
    message,
    onConfirm,
    onClose,
    confirmText: confirmTexts[type],
    isOpen: true,
  };
};

// ============================================================================
// CONSTANTES ÚTILES
// ============================================================================

// Duraciones estándar para animaciones
export const ANIMATION_DURATIONS = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.2,
  typewriter: 0.05, // Por carácter
} as const;

// Colores estándar para componentes
export const COMPONENT_COLORS = {
  primary: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
  info: "purple",
  neutral: "gray",
} as const;

// Tamaños estándar
export const COMPONENT_SIZES = {
  xs: "small",
  sm: "small",
  md: "medium",
  lg: "large",
  xl: "extra-large",
} as const;

// ============================================================================
// HOOKS PERSONALIZADOS EXPORTADOS
// ============================================================================

// El hook useErrorHandler ya está exportado arriba junto con ErrorBoundary
// No necesitamos re-exportarlo aquí para evitar duplicados

// ============================================================================
// PROPIEDADES DE COMPONENTES (PARA REFERENCIA)
// ============================================================================

// Estas interfaces están disponibles pero no se exportan directamente
// ya que están definidas en sus respectivos archivos de componente:

/*
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: AnimatedTextVariant;
  staggerChildren?: number;
  once?: boolean;
  onAnimationComplete?: () => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: "primary" | "danger" | "success" | "warning";
  isLoading?: boolean;
  preventBackdropClose?: boolean;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "minimal" | "card";
  children?: React.ReactNode;
}

interface LoadingSpinnerProps {
  type?: SpinnerType;
  context?: LoadingContext;
  size?: "small" | "medium" | "large" | "extra-large";
  color?: "blue" | "green" | "amber" | "red" | "purple" | "gray" | "white";
  message?: string;
  submessage?: string;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
  overlay?: boolean;
  overlayBlur?: boolean;
  className?: string;
  duration?: number;
  onCancel?: () => void;
  cancelText?: string;
  progress?: number;
  showProgress?: boolean;
}
*/

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/*
// Ejemplo de uso de AnimatedText
<AnimatedText 
  text="Registro de Vacunación Completado"
  variant="slideUp"
  className="text-2xl font-bold text-green-600"
/>

// Ejemplo de uso de LoadingSpinner
<LoadingSpinner 
  context="vaccination"
  message="Guardando información de vacunación..."
  progress={75}
  showProgress
  onCancel={() => console.log("Cancelado")}
/>

// Ejemplo de uso de EmptyState
<EmptyState 
  type="no-cattle"
  onAction={() => navigate("/add-bovine")}
/>

// Ejemplo de uso de ConfirmDialog
<ConfirmDialog 
  isOpen={showDialog}
  type="danger"
  title="Eliminar Bovino"
  message="¿Estás seguro de eliminar este bovino? Esta acción no se puede deshacer."
  onConfirm={handleDelete}
  onClose={() => setShowDialog(false)}
/>

// Ejemplo de uso de ErrorBoundary
<ErrorBoundary 
  level="component"
  onError={(error, errorInfo, errorDetails) => {
    console.log("Error capturado:", error);
  }}
>
  <BovinesList />
</ErrorBoundary>
*/
