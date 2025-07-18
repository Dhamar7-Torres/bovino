import React from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  Stethoscope,
  Database,
  Wifi,
  CircleDot,
  Download,
  Upload,
  Zap,
} from "lucide-react";

// Tipos de spinner disponibles
type SpinnerType =
  | "default"
  | "pulse"
  | "bouncing-dots"
  | "rotating-squares"
  | "wave"
  | "orbit"
  | "heartbeat"
  | "custom";

// Tipos de contexto para mostrar íconos relevantes
type LoadingContext =
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

// Propiedades del componente LoadingSpinner
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
  progress?: number; // 0-100 para barra de progreso
  showProgress?: boolean;
}

// Configuraciones de tamaño
const sizeConfigs = {
  small: {
    spinner: "w-6 h-6",
    icon: "w-5 h-5",
    container: "p-3",
    text: "text-sm",
    gap: "space-y-2",
  },
  medium: {
    spinner: "w-8 h-8",
    icon: "w-6 h-6",
    container: "p-4",
    text: "text-base",
    gap: "space-y-3",
  },
  large: {
    spinner: "w-12 h-12",
    icon: "w-8 h-8",
    container: "p-6",
    text: "text-lg",
    gap: "space-y-4",
  },
  "extra-large": {
    spinner: "w-16 h-16",
    icon: "w-10 h-10",
    container: "p-8",
    text: "text-xl",
    gap: "space-y-5",
  },
};

// Configuraciones de color
const colorConfigs = {
  blue: {
    primary: "text-blue-600",
    secondary: "text-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  green: {
    primary: "text-green-600",
    secondary: "text-green-400",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  amber: {
    primary: "text-amber-600",
    secondary: "text-amber-400",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  red: {
    primary: "text-red-600",
    secondary: "text-red-400",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  purple: {
    primary: "text-purple-600",
    secondary: "text-purple-400",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  gray: {
    primary: "text-gray-600",
    secondary: "text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  white: {
    primary: "text-white",
    secondary: "text-white/70",
    bg: "bg-white/10",
    border: "border-white/20",
  },
};

// Configuraciones de contexto
const contextConfigs = {
  general: {
    icon: <Loader2 className="w-full h-full" />,
    message: "Cargando...",
    color: "blue" as const,
  },
  geolocation: {
    icon: <MapPin className="w-full h-full" />,
    message: "Obteniendo ubicación...",
    color: "purple" as const,
  },
  vaccination: {
    icon: <Stethoscope className="w-full h-full" />,
    message: "Procesando vacunación...",
    color: "green" as const,
  },
  "health-check": {
    icon: <Stethoscope className="w-full h-full" />,
    message: "Verificando estado de salud...",
    color: "blue" as const,
  },
  "data-sync": {
    icon: <Database className="w-full h-full" />,
    message: "Sincronizando datos...",
    color: "amber" as const,
  },
  connection: {
    icon: <Wifi className="w-full h-full" />,
    message: "Conectando...",
    color: "gray" as const,
  },
  "cattle-loading": {
    icon: <CircleDot className="w-full h-full" />,
    message: "Cargando información del ganado...",
    color: "amber" as const,
  },
  "file-upload": {
    icon: <Upload className="w-full h-full" />,
    message: "Subiendo archivo...",
    color: "blue" as const,
  },
  "file-download": {
    icon: <Download className="w-full h-full" />,
    message: "Descargando archivo...",
    color: "green" as const,
  },
  processing: {
    icon: <Zap className="w-full h-full" />,
    message: "Procesando...",
    color: "purple" as const,
  },
};

// Componentes de spinner según el tipo
const SpinnerComponents = {
  default: ({
    className,
    duration = 1,
  }: {
    className: string;
    duration?: number;
  }) => (
    <motion.div
      className={`border-4 border-current border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  ),

  pulse: ({
    className,
    duration = 1.5,
  }: {
    className: string;
    duration?: number;
  }) => (
    <motion.div
      className={`rounded-full bg-current ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  ),

  "bouncing-dots": ({
    className,
    duration = 1.4,
  }: {
    className: string;
    duration?: number;
  }) => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  ),

  "rotating-squares": ({
    className,
    duration = 1.2,
  }: {
    className: string;
    duration?: number;
  }) => (
    <div className={`relative ${className}`}>
      {[0, 1].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 border-2 border-current"
          animate={{ rotate: 360 }}
          transition={{
            duration: duration * (index + 1),
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            borderRadius: index === 0 ? "20%" : "50%",
          }}
        />
      ))}
    </div>
  ),

  wave: ({
    className,
    duration = 1.2,
  }: {
    className: string;
    duration?: number;
  }) => (
    <div className={`flex items-end space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-current rounded-full"
          animate={{
            height: ["20%", "100%", "20%"],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  ),

  orbit: ({
    className,
    duration = 2,
  }: {
    className: string;
    duration?: number;
  }) => (
    <div className={`relative ${className}`}>
      <motion.div className="absolute inset-0 border border-current rounded-full opacity-20" />
      <motion.div
        className="absolute w-2 h-2 bg-current rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformOrigin: "50% 200%",
        }}
      />
    </div>
  ),

  heartbeat: ({
    className,
    duration = 1,
  }: {
    className: string;
    duration?: number;
  }) => (
    <motion.div
      className={`bg-current ${className}`}
      animate={{
        scale: [1, 1.3, 1, 1.1, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.3, 0.5, 0.7, 1],
      }}
      style={{
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      }}
    />
  ),

  custom: ({ className }: { className: string }) => (
    <div className={className}>
      {/* Placeholder para spinner personalizado */}
    </div>
  ),
};

/**
 * Componente LoadingSpinner para mostrar estados de carga
 * Incluye múltiples tipos de animación y contextos específicos
 *
 * @param type - Tipo de animación del spinner
 * @param context - Contexto de carga para mostrar íconos relevantes
 * @param size - Tamaño del spinner
 * @param color - Color del spinner
 * @param message - Mensaje principal de carga
 * @param submessage - Mensaje secundario
 * @param showIcon - Si mostrar ícono contextual
 * @param customIcon - Ícono personalizado
 * @param overlay - Si mostrar como overlay de pantalla completa
 * @param overlayBlur - Si aplicar blur al fondo
 * @param className - Clases CSS adicionales
 * @param duration - Duración de la animación
 * @param onCancel - Función para cancelar la carga
 * @param cancelText - Texto del botón de cancelar
 * @param progress - Progreso actual (0-100)
 * @param showProgress - Si mostrar barra de progreso
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  type = "default",
  context = "general",
  size = "medium",
  color,
  message,
  submessage,
  showIcon = true,
  customIcon,
  overlay = false,
  overlayBlur = false,
  className = "",
  duration = 1,
  onCancel,
  cancelText = "Cancelar",
  progress,
  showProgress = false,
}) => {
  const sizeConfig = sizeConfigs[size];
  const contextConfig = contextConfigs[context];
  const finalColor = color || contextConfig.color;
  const colorConfig = colorConfigs[finalColor];
  const finalMessage = message || contextConfig.message;
  const finalIcon = customIcon || contextConfig.icon;

  const SpinnerComponent = SpinnerComponents[type];

  // Componente de progreso
  const ProgressBar = () => (
    <div className="w-full max-w-xs">
      <div
        className={`w-full h-2 rounded-full bg-gray-200 ${colorConfig.border} border overflow-hidden`}
      >
        <motion.div
          className={`h-full rounded-full ${colorConfig.primary.replace(
            "text-",
            "bg-"
          )}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress || 0}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {typeof progress === "number" && (
        <p className={`text-xs ${colorConfig.primary} text-center mt-1`}>
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );

  const content = (
    <motion.div
      className={`flex flex-col items-center justify-center ${sizeConfig.container} ${sizeConfig.gap} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Ícono contextual */}
      {showIcon && (
        <motion.div
          className={`${sizeConfig.icon} ${colorConfig.primary} mb-2`}
          animate={{
            rotate: context === "geolocation" ? [0, 10, -10, 0] : 0,
            scale: context === "health-check" ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {finalIcon}
        </motion.div>
      )}

      {/* Spinner principal */}
      <div className={`${colorConfig.primary}`}>
        <SpinnerComponent className={sizeConfig.spinner} duration={duration} />
      </div>

      {/* Mensaje principal */}
      {finalMessage && (
        <motion.p
          className={`${sizeConfig.text} font-medium ${colorConfig.primary} text-center`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {finalMessage}
        </motion.p>
      )}

      {/* Submensaje */}
      {submessage && (
        <motion.p
          className={`text-sm ${colorConfig.secondary} text-center max-w-xs`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {submessage}
        </motion.p>
      )}

      {/* Barra de progreso */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ProgressBar />
        </motion.div>
      )}

      {/* Botón de cancelar */}
      {onCancel && (
        <motion.button
          className={`mt-4 px-4 py-2 text-sm font-medium rounded-lg border ${colorConfig.border} ${colorConfig.secondary} hover:${colorConfig.primary} transition-colors duration-200`}
          onClick={onCancel}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {cancelText}
        </motion.button>
      )}
    </motion.div>
  );

  // Si es overlay, envolver en un contenedor de pantalla completa
  if (overlay) {
    return (
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          overlayBlur ? "backdrop-blur-sm" : ""
        }`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`bg-white rounded-xl shadow-2xl ${colorConfig.border} border-2`}
        >
          {content}
        </div>
      </motion.div>
    );
  }

  return content;
};

export default LoadingSpinner;
