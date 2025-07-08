import React from "react";
import { motion } from "framer-motion";
import {
  CircleDot,
  Search,
  Plus,
  Database,
  Wifi,
  AlertCircle,
  MapPin,
  Stethoscope,
  FileText,
  Users,
} from "lucide-react";

// Tipos de estados vacíos disponibles
type EmptyStateType =
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

// Propiedades del componente EmptyState
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

// Configuraciones predefinidas para cada tipo
const emptyStateConfigs = {
  "no-cattle": {
    icon: <CircleDot className="w-full h-full" />,
    title: "No hay ganado registrado",
    description:
      "Comienza agregando tu primer bovino al sistema. Podrás registrar su ubicación, vacunas y estado de salud.",
    actionText: "Agregar Bovino",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  "no-search-results": {
    icon: <Search className="w-full h-full" />,
    title: "Sin resultados de búsqueda",
    description:
      "No encontramos bovinos que coincidan con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con términos diferentes.",
    actionText: "Limpiar Filtros",
    iconColor: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  "no-vaccinations": {
    icon: <Stethoscope className="w-full h-full" />,
    title: "Sin vacunaciones registradas",
    description:
      "Este bovino no tiene vacunaciones registradas. Mantén un control actualizado de las vacunas para garantizar su salud.",
    actionText: "Registrar Vacunación",
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
  },
  "no-illnesses": {
    icon: <AlertCircle className="w-full h-full" />,
    title: "Sin enfermedades registradas",
    description:
      "Este bovino no tiene enfermedades registradas. Esto es una buena señal de que se mantiene saludable.",
    actionText: "Registrar Enfermedad",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  "no-locations": {
    icon: <MapPin className="w-full h-full" />,
    title: "Sin ubicaciones registradas",
    description:
      "No hay ubicaciones de vacunación o enfermedad registradas. La geolocalización te ayudará a hacer seguimiento espacial.",
    actionText: "Agregar Ubicación",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  "no-connection": {
    icon: <Wifi className="w-full h-full" />,
    title: "Sin conexión a internet",
    description:
      "Verifica tu conexión a internet. Algunos datos pueden estar disponibles sin conexión.",
    actionText: "Reintentar",
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
  },
  error: {
    icon: <AlertCircle className="w-full h-full" />,
    title: "Error al cargar datos",
    description:
      "Ocurrió un error inesperado al cargar la información. Por favor, intenta nuevamente.",
    actionText: "Reintentar",
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
  },
  "loading-failed": {
    icon: <Database className="w-full h-full" />,
    title: "Error de carga",
    description:
      "No se pudo cargar la información desde el servidor. Verifica tu conexión e intenta nuevamente.",
    actionText: "Reintentar",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  "no-reports": {
    icon: <FileText className="w-full h-full" />,
    title: "Sin reportes disponibles",
    description:
      "No hay reportes generados para el período seleccionado. Comienza agregando datos para generar reportes útiles.",
    actionText: "Generar Reporte",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  "no-veterinarians": {
    icon: <Users className="w-full h-full" />,
    title: "Sin veterinarios registrados",
    description:
      "No hay veterinarios registrados en el sistema. Agrega profesionales de confianza para el cuidado de tu ganado.",
    actionText: "Agregar Veterinario",
    iconColor: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  custom: {
    icon: <Database className="w-full h-full" />,
    title: "Estado personalizado",
    description: "Configura este estado según tus necesidades.",
    actionText: "Acción",
    iconColor: "text-gray-500",
    bgColor: "bg-gray-50",
  },
};

// Configuraciones de tamaño
const sizeConfigs = {
  small: {
    container: "py-8 px-4",
    iconSize: "w-16 h-16",
    titleSize: "text-lg",
    descriptionSize: "text-sm",
    buttonSize: "px-4 py-2 text-sm",
  },
  medium: {
    container: "py-12 px-6",
    iconSize: "w-24 h-24",
    titleSize: "text-xl",
    descriptionSize: "text-base",
    buttonSize: "px-6 py-3 text-base",
  },
  large: {
    container: "py-16 px-8",
    iconSize: "w-32 h-32",
    titleSize: "text-2xl",
    descriptionSize: "text-lg",
    buttonSize: "px-8 py-4 text-lg",
  },
};

// Variantes de animación
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const iconVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
  },
};

const textVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    y: -2,
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Componente EmptyState para mostrar estados vacíos de manera atractiva
 * Incluye diferentes tipos predefinidos y animaciones suaves
 *
 * @param type - Tipo de estado vacío predefinido
 * @param title - Título personalizado (opcional)
 * @param description - Descripción personalizada (opcional)
 * @param actionText - Texto del botón de acción (opcional)
 * @param onAction - Función a ejecutar al hacer clic en el botón
 * @param showIcon - Si mostrar el ícono (por defecto true)
 * @param customIcon - Ícono personalizado
 * @param className - Clases CSS adicionales
 * @param size - Tamaño del componente
 * @param variant - Variante visual
 * @param children - Contenido adicional
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  showIcon = true,
  customIcon,
  className = "",
  size = "medium",
  variant = "default",
  children,
}) => {
  const config = emptyStateConfigs[type];
  const sizeConfig = sizeConfigs[size];

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;
  const finalIcon = customIcon || config.icon;

  // Clases base según la variante
  const getVariantClasses = () => {
    switch (variant) {
      case "minimal":
        return "text-center";
      case "card":
        return `bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200 text-center ${sizeConfig.container}`;
      default:
        return `text-center ${sizeConfig.container}`;
    }
  };

  // Configuración de transición escalonada
  const staggerConfig = {
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center min-h-32 ${getVariantClasses()} ${className}`}
      variants={{ ...containerVariants, ...staggerConfig }}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
    >
      {/* Ícono animado */}
      {showIcon && (
        <motion.div
          className={`${sizeConfig.iconSize} ${config.iconColor} mb-6 relative`}
          variants={iconVariants}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200,
            duration: 0.8,
          }}
        >
          {/* Círculo de fondo */}
          <motion.div
            className={`absolute inset-0 ${config.bgColor} rounded-full -z-10`}
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              ease: "easeOut",
            }}
          />

          {/* Ícono principal */}
          <div className="relative z-10 p-4">{finalIcon}</div>

          {/* Efecto de pulso sutil */}
          <motion.div
            className={`absolute inset-0 ${config.bgColor} rounded-full opacity-50`}
            animate={{
              scale: [1.2, 1.4, 1.2],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Título */}
      <motion.h3
        className={`font-semibold text-gray-900 mb-3 ${sizeConfig.titleSize}`}
        variants={textVariants}
        transition={{ duration: 0.5 }}
      >
        {finalTitle}
      </motion.h3>

      {/* Descripción */}
      <motion.p
        className={`text-gray-600 mb-6 max-w-sm leading-relaxed ${sizeConfig.descriptionSize}`}
        variants={textVariants}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {finalDescription}
      </motion.p>

      {/* Contenido adicional */}
      {children && (
        <motion.div
          className="mb-6"
          variants={textVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      )}

      {/* Botón de acción */}
      {onAction && (
        <motion.button
          className={`bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-lg hover:shadow-xl ${sizeConfig.buttonSize}`}
          onClick={onAction}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.span
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Plus className="w-4 h-4" />
            <span>{finalActionText}</span>
          </motion.span>
        </motion.button>
      )}

      {/* Decoración adicional para variant card */}
      {variant === "card" && (
        <motion.div
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full opacity-50"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      )}
    </motion.div>
  );
};

export default EmptyState;
