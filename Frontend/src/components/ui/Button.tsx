import React, { useState } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos de variantes y tamaños
type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "gradient";

type ButtonSize = "sm" | "default" | "lg" | "xl" | "icon";

// Clases por variante
const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 focus:ring-red-500",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning:
      "bg-yellow-500 text-yellow-900 hover:bg-yellow-600 focus:ring-yellow-500",
    info: "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500",
    gradient:
      "bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] text-white hover:brightness-110",
  };

  return variants[variant];
};

// Clases por tamaño
const getSizeClasses = (size: ButtonSize): string => {
  const sizes = {
    sm: "h-9 rounded-md px-3 text-xs",
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-11 rounded-md px-8 text-base",
    xl: "h-12 rounded-md px-10 text-lg",
    icon: "h-10 w-10 p-0",
  };

  return sizes[size];
};

// Props del Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
  asChild?: boolean;
  // Props específicas para funcionalidad de eliminar
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  onConfirm?: () => void | Promise<void>;
  deleteTarget?: string; // Nombre del item a eliminar para el mensaje
}

// Componente de Confirmación
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message, 
  target,
  loading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  target?: string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar eliminación</h3>
          <p className="text-sm text-gray-500 mb-6">
            {message} {target && `"${target}"`}? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              loading={loading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Button
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      iconOnly = false,
      disabled,
      children,
      type = "button",
      onClick,
      requireConfirmation = false,
      confirmationMessage = "¿Estás seguro de que quieres eliminar",
      onConfirm,
      deleteTarget,
      ...props
    },
    ref
  ) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const fullWidthClasses = fullWidth ? "w-full" : "";
    const loadingClasses = (loading || isDeleting) ? "cursor-wait opacity-70" : "";

    const buttonClasses = cn(
      baseClasses,
      getVariantClasses(variant),
      getSizeClasses(iconOnly ? "icon" : size),
      fullWidthClasses,
      loadingClasses,
      className
    );

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Si es un botón destructive y requiere confirmación
      if (variant === "destructive" && requireConfirmation) {
        setShowConfirmation(true);
        return;
      }

      // Si no requiere confirmación, ejecutar onClick normal
      if (onClick) {
        onClick(e);
      }
    };

    const handleConfirm = async () => {
      setIsDeleting(true);
      try {
        if (onConfirm) {
          await onConfirm();
        }
        setShowConfirmation(false);
      } catch (error) {
        console.error("Error al eliminar:", error);
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <>
        <button
          className={buttonClasses}
          ref={ref}
          disabled={disabled || loading || isDeleting}
          type={type}
          onClick={handleClick}
          {...props}
        >
          {(loading || isDeleting) && !iconOnly && <LoadingSpinner />}
          {leftIcon && !(loading || isDeleting) && (
            <span className={iconOnly ? "" : "mr-2"}>{leftIcon}</span>
          )}
          {!iconOnly && <span className={(loading || isDeleting) ? "ml-2" : ""}>{children}</span>}
          {iconOnly && !(loading || isDeleting) && children}
          {rightIcon && !(loading || isDeleting) && !iconOnly && (
            <span className="ml-2">{rightIcon}</span>
          )}
        </button>

        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirm}
          message={confirmationMessage}
          target={deleteTarget}
          loading={isDeleting}
        />
      </>
    );
  }
);

Button.displayName = "Button";

// Ejemplo de uso
const DeleteButtonExample = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Producto A" },
    { id: 2, name: "Producto B" },
    { id: 3, name: "Producto C" },
  ]);

  const handleDelete = async (id: number) => {
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setItems(items.filter(item => item.id !== id));
  };

  const TrashIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Lista de Productos</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-gray-700">{item.name}</span>
            <div className="flex gap-2">
              {/* Botón eliminar sin confirmación */}
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<TrashIcon />}
                onClick={() => handleDelete(item.id)}
              >
                Eliminar
              </Button>
              
              {/* Botón eliminar con confirmación */}
              <Button
                variant="destructive"
                size="icon"
                requireConfirmation={true}
                confirmationMessage="¿Estás seguro de que quieres eliminar"
                deleteTarget={item.name}
                onConfirm={() => handleDelete(item.id)}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay productos disponibles
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Ejemplos de botones:</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" size="sm">
            Eliminar simple
          </Button>
          <Button 
            variant="destructive" 
            requireConfirmation={true}
            confirmationMessage="¿Confirmas la eliminación?"
            onConfirm={() => alert("¡Eliminado!")}
          >
            Con confirmación
          </Button>
          <Button variant="destructive" loading={true}>
            Eliminando...
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Button, DeleteButtonExample };
export default DeleteButtonExample;