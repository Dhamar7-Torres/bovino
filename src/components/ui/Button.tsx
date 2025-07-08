import React from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes del botón
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
  | "info";

type ButtonSize = "sm" | "default" | "lg" | "xl" | "icon";

// Función para obtener las clases según la variante
const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline",

    // Variantes específicas para la aplicación ganadera
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning:
      "bg-yellow-500 text-yellow-900 hover:bg-yellow-600 focus:ring-yellow-500",
    info: "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500",
  };

  return variants[variant];
};

// Función para obtener las clases según el tamaño
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

// Interface para las props del componente Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Variante del botón
  variant?: ButtonVariant;
  // Tamaño del botón
  size?: ButtonSize;
  // Estado de carga
  loading?: boolean;
  // Icono a la izquierda del texto
  leftIcon?: React.ReactNode;
  // Icono a la derecha del texto
  rightIcon?: React.ReactNode;
  // Hacer el botón de ancho completo
  fullWidth?: boolean;
  // Solo icono (sin texto)
  iconOnly?: boolean;
  // Referencia al elemento DOM
  asChild?: boolean;
}

// Componente Button principal
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
      ...props
    },
    ref
  ) => {
    // Clases base que siempre se aplican
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    // Clases adicionales según props
    const fullWidthClasses = fullWidth ? "w-full" : "";
    const loadingClasses = loading ? "cursor-wait opacity-70" : "";

    // Combinamos todas las clases
    const buttonClasses = cn(
      baseClasses,
      getVariantClasses(variant),
      getSizeClasses(iconOnly ? "icon" : size),
      fullWidthClasses,
      loadingClasses,
      className
    );

    // Spinner de carga
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

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        type={type}
        {...props}
      >
        {/* Mostrar spinner si está cargando */}
        {loading && !iconOnly && <LoadingSpinner />}

        {/* Icono izquierdo */}
        {leftIcon && !loading && (
          <span className={iconOnly ? "" : "mr-2"}>{leftIcon}</span>
        )}

        {/* Contenido del botón */}
        {!iconOnly && <span className={loading ? "ml-2" : ""}>{children}</span>}

        {/* Solo icono (para botones de icono) */}
        {iconOnly && !loading && children}

        {/* Icono derecho */}
        {rightIcon && !loading && !iconOnly && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
