import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Info, X } from "lucide-react";

// Tipos de diálogo disponibles
type DialogType = "warning" | "danger" | "success" | "info" | "custom";

// Propiedades del componente ConfirmDialog
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

// Configuraciones para cada tipo de diálogo
const dialogConfig = {
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
    bgColor: "bg-yellow-50",
    confirmVariant: "warning" as const,
  },
  danger: {
    icon: <XCircle className="w-6 h-6" />,
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    confirmVariant: "danger" as const,
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconColor: "text-green-500",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    confirmVariant: "success" as const,
  },
  info: {
    icon: <Info className="w-6 h-6" />,
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    confirmVariant: "primary" as const,
  },
  custom: {
    icon: null,
    iconColor: "text-gray-500",
    borderColor: "border-gray-200",
    bgColor: "bg-gray-50",
    confirmVariant: "primary" as const,
  },
};

// Variantes de animación para el diálogo
const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
  },
};

// Variantes para los botones
const buttonVariants = {
  hover: {
    scale: 1.02,
    y: -1,
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

/**
 * Componente ConfirmDialog para mostrar diálogos de confirmación
 * Incluye animaciones suaves y diferentes tipos visuales
 *
 * @param isOpen - Si el diálogo está abierto
 * @param onClose - Función para cerrar el diálogo
 * @param onConfirm - Función para confirmar la acción
 * @param title - Título del diálogo
 * @param message - Mensaje principal
 * @param type - Tipo visual del diálogo
 * @param confirmText - Texto del botón de confirmación
 * @param cancelText - Texto del botón de cancelación
 * @param confirmButtonVariant - Variante del botón de confirmación
 * @param isLoading - Si está en estado de carga
 * @param preventBackdropClose - Prevenir cerrar al hacer clic en el fondo
 * @param showCloseButton - Mostrar botón X de cerrar
 * @param icon - Ícono personalizado
 * @param children - Contenido adicional
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonVariant,
  isLoading = false,
  preventBackdropClose = false,
  showCloseButton = true,
  icon,
  children,
}) => {
  const config = dialogConfig[type];
  const finalConfirmVariant = confirmButtonVariant || config.confirmVariant;
  const finalIcon = icon || config.icon;

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isLoading]);

  // Manejar clic en el backdrop
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (
      event.target === event.currentTarget &&
      !preventBackdropClose &&
      !isLoading
    ) {
      onClose();
    }
  };

  // Manejar confirmación
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  // Estilos para los botones según la variante
  const getButtonStyles = (variant: string) => {
    const baseStyles =
      "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    switch (variant) {
      case "danger":
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-200`;
      case "success":
        return `${baseStyles} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-green-200`;
      case "warning":
        return `${baseStyles} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-yellow-200`;
      case "primary":
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200`;
    }
  };

  const cancelButtonStyles =
    "px-6 py-3 rounded-lg font-semibold text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          onClick={handleBackdropClick}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl border ${config.borderColor} overflow-hidden`}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              willChange: "transform",
            }}
          >
            {/* Header con ícono y botón de cerrar */}
            <div className={`relative px-6 pt-6 pb-4 ${config.bgColor}`}>
              {showCloseButton && (
                <motion.button
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50 transition-colors duration-200"
                  onClick={onClose}
                  disabled={isLoading}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}

              <div className="flex items-start space-x-4">
                {finalIcon && (
                  <motion.div
                    className={`flex-shrink-0 ${config.iconColor}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 300,
                      delay: 0.1,
                    }}
                  >
                    {finalIcon}
                  </motion.div>
                )}

                <div className="min-w-0 flex-1">
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {title}
                  </motion.h3>

                  <motion.p
                    className="text-sm text-gray-600 leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {message}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Contenido adicional */}
            {children && (
              <motion.div
                className="px-6 py-4 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.25 }}
              >
                {children}
              </motion.div>
            )}

            {/* Botones de acción */}
            <motion.div
              className="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                className={cancelButtonStyles}
                onClick={onClose}
                disabled={isLoading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{ type: "tween", duration: 0.15 }}
              >
                {cancelText}
              </motion.button>

              <motion.button
                className={getButtonStyles(finalConfirmVariant)}
                onClick={handleConfirm}
                disabled={isLoading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{ type: "tween", duration: 0.15 }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
