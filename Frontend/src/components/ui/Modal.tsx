import React, { useEffect, useRef } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes del modal
type ModalSize = "sm" | "default" | "lg" | "xl" | "full";
type ModalVariant = "default" | "danger" | "success" | "warning" | "info";

// Props base del Modal
export interface ModalProps {
  // Control de visibilidad
  isOpen: boolean;
  // Callback al cerrar
  onClose: () => void;
  // Contenido del modal
  children: React.ReactNode;
  // Tamaño del modal
  size?: ModalSize;
  // Variante visual
  variant?: ModalVariant;
  // Título del modal
  title?: string;
  // Descripción/subtítulo
  description?: string;
  // Cerrar al hacer click en overlay
  closeOnOverlayClick?: boolean;
  // Cerrar con tecla Escape
  closeOnEscape?: boolean;
  // Mostrar botón de cerrar
  showCloseButton?: boolean;
  // Icono personalizado en el header
  icon?: React.ReactNode;
  // Clase CSS personalizada
  className?: string;
  // Clase CSS para el overlay
  overlayClassName?: string;
  // Clase CSS para el contenido
  contentClassName?: string;
  // Desactivar scroll del body cuando está abierto
  preventBodyScroll?: boolean;
  // Focus inicial en elemento específico
  initialFocus?: React.RefObject<HTMLElement>;
  // Callback cuando se completa la animación de apertura
  onAfterOpen?: () => void;
  // Callback cuando se completa la animación de cierre
  onAfterClose?: () => void;
}

// Props para ModalHeader
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  variant?: ModalVariant;
}

// Props para ModalBody
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "default" | "lg";
}

// Props para ModalFooter
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  justify?: "start" | "center" | "end" | "between";
}

// Función para obtener las clases según el tamaño
const getSizeClasses = (size: ModalSize): string => {
  const sizes = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };
  return sizes[size];
};

// Función para obtener las clases según la variante
const getVariantClasses = (variant: ModalVariant): string => {
  const variants = {
    default: "border-gray-200",
    danger: "border-red-200",
    success: "border-green-200",
    warning: "border-yellow-200",
    info: "border-blue-200",
  };
  return variants[variant];
};

// Función para obtener el color del icono según la variante
const getIconColor = (variant: ModalVariant): string => {
  const colors = {
    default: "text-gray-500",
    danger: "text-red-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };
  return colors[variant];
};

// Hook para manejar la tecla Escape
const useEscapeKey = (
  isOpen: boolean,
  onClose: () => void,
  closeOnEscape: boolean
) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);
};

// Hook para prevenir scroll del body
const usePreventBodyScroll = (isOpen: boolean, prevent: boolean) => {
  useEffect(() => {
    if (!prevent) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, prevent]);
};

// Hook para focus management
const useFocusManagement = (
  isOpen: boolean,
  initialFocus?: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus inicial
    setTimeout(() => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        // Focus en el primer elemento focuseable del modal
        const modal = document.querySelector('[role="dialog"]');
        const focusableElement = modal?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        focusableElement?.focus();
      }
    }, 100);

    // Restaurar focus al cerrar
    return () => {
      previousActiveElement?.focus();
    };
  }, [isOpen, initialFocus]);
};

// Componente principal Modal
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "default",
  variant = "default",
  title,
  description,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  icon,
  className,
  overlayClassName,
  contentClassName,
  preventBodyScroll = true,
  initialFocus,
  onAfterOpen,
  onAfterClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Hooks
  useEscapeKey(isOpen, onClose, closeOnEscape);
  usePreventBodyScroll(isOpen, preventBodyScroll);
  useFocusManagement(isOpen, initialFocus);

  // Efectos para callbacks de apertura/cierre
  useEffect(() => {
    if (isOpen && onAfterOpen) {
      const timer = setTimeout(onAfterOpen, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onAfterOpen]);

  useEffect(() => {
    if (!isOpen && onAfterClose) {
      const timer = setTimeout(onAfterClose, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onAfterClose]);

  // Manejar click en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // No renderizar si está cerrado
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black bg-opacity-50 backdrop-blur-sm",
        "animate-in fade-in duration-200",
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-xl",
          "animate-in zoom-in-95 duration-200",
          "border",
          getSizeClasses(size),
          getVariantClasses(variant),
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header por defecto si hay título */}
        {(title || description || showCloseButton) && (
          <ModalHeader
            onClose={onClose}
            showCloseButton={showCloseButton}
            icon={icon}
            variant={variant}
          >
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </ModalHeader>
        )}

        {/* Contenido */}
        <div className={cn("relative", contentClassName)}>{children}</div>
      </div>
    </div>
  );
};

// Componente ModalHeader
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
  onClose,
  showCloseButton = true,
  icon,
  variant = "default",
}) => {
  return (
    <div
      className={cn(
        "flex items-start justify-between p-6 border-b border-gray-200",
        className
      )}
    >
      <div className="flex items-start space-x-3 flex-1">
        {icon && (
          <div className={cn("flex-shrink-0 mt-0.5", getIconColor(variant))}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Componente ModalBody
const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  padding = "default",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div className={cn(paddingClasses[padding], className)}>{children}</div>
  );
};

// Componente ModalFooter
const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  justify = "end",
}) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg",
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};

// Asignar displayName
Modal.displayName = "Modal";
ModalHeader.displayName = "ModalHeader";
ModalBody.displayName = "ModalBody";
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalHeader, ModalBody, ModalFooter };
