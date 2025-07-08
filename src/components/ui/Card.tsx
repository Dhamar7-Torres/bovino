import React from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes de la card
type CardVariant = "default" | "outlined" | "elevated" | "gradient" | "glass";
type CardSize = "sm" | "default" | "lg" | "xl";

// Props base para el contenedor Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  // Hacer la card clickeable
  clickable?: boolean;
  // Callback cuando se hace click
  onClick?: () => void;
  // Mostrar estado de carga
  loading?: boolean;
  // Añadir hover effect
  hoverable?: boolean;
  // Card de ancho completo
  fullWidth?: boolean;
}

// Props para CardHeader
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Icono para el header
  icon?: React.ReactNode;
  // Acciones en el header (botones, badges, etc.)
  actions?: React.ReactNode;
}

// Props para CardTitle
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  // Nivel de heading (h1, h2, h3, etc.)
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Props para CardDescription
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

// Props para CardContent
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Padding personalizado
  padding?: "none" | "sm" | "default" | "lg";
}

// Props para CardFooter
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Justificación del contenido
  justify?: "start" | "center" | "end" | "between" | "around";
}

// Función para obtener las clases según la variante
const getVariantClasses = (variant: CardVariant): string => {
  const variants = {
    default: "bg-white border border-gray-200",
    outlined: "bg-white border-2 border-gray-300",
    elevated: "bg-white shadow-lg border border-gray-100",
    gradient:
      "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl",
  };
  return variants[variant];
};

// Función para obtener las clases según el tamaño
const getSizeClasses = (size: CardSize): string => {
  const sizes = {
    sm: "p-3 rounded-md",
    default: "p-4 rounded-lg",
    lg: "p-6 rounded-lg",
    xl: "p-8 rounded-xl",
  };
  return sizes[size];
};

// Componente principal Card
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      clickable = false,
      onClick,
      loading = false,
      hoverable = false,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    // Clases base
    const baseClasses = "relative transition-all duration-200";

    // Clases adicionales según props
    const clickableClasses = clickable
      ? "cursor-pointer hover:shadow-md transform hover:-translate-y-1"
      : "";
    const hoverableClasses = hoverable && !clickable ? "hover:shadow-md" : "";
    const fullWidthClasses = fullWidth ? "w-full" : "";
    const loadingClasses = loading ? "opacity-60 pointer-events-none" : "";

    // Combinamos todas las clases
    const cardClasses = cn(
      baseClasses,
      getVariantClasses(variant),
      getSizeClasses(size),
      clickableClasses,
      hoverableClasses,
      fullWidthClasses,
      loadingClasses,
      className
    );

    // Spinner de carga
    const LoadingSpinner = () => (
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
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
      </div>
    );

    return (
      <div
        className={cardClasses}
        ref={ref}
        onClick={clickable ? onClick : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
        {loading && <LoadingSpinner />}
      </div>
    );
  }
);

// Componente CardHeader
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, icon, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between space-y-1.5 pb-3",
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="flex items-center text-gray-600">{icon}</div>
          )}
          <div className="flex-1">{children}</div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
    );
  }
);

// Componente CardTitle
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, level = 3, ...props }, ref) => {
    const sizeClasses = {
      1: "text-2xl font-bold",
      2: "text-xl font-bold",
      3: "text-lg font-semibold",
      4: "text-base font-semibold",
      5: "text-sm font-semibold",
      6: "text-xs font-semibold",
    };

    const commonClasses = cn(
      "text-gray-900 leading-none tracking-tight",
      sizeClasses[level],
      className
    );

    // Crear el elemento apropiado según el nivel
    switch (level) {
      case 1:
        return (
          <h1 ref={ref} className={commonClasses} {...props}>
            {children}
          </h1>
        );
      case 2:
        return (
          <h2 ref={ref} className={commonClasses} {...props}>
            {children}
          </h2>
        );
      case 3:
        return (
          <h3 ref={ref} className={commonClasses} {...props}>
            {children}
          </h3>
        );
      case 4:
        return (
          <h4 ref={ref} className={commonClasses} {...props}>
            {children}
          </h4>
        );
      case 5:
        return (
          <h5 ref={ref} className={commonClasses} {...props}>
            {children}
          </h5>
        );
      case 6:
        return (
          <h6 ref={ref} className={commonClasses} {...props}>
            {children}
          </h6>
        );
      default:
        return (
          <h3 ref={ref} className={commonClasses} {...props}>
            {children}
          </h3>
        );
    }
  }
);

// Componente CardDescription
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
});

// Componente CardContent
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, padding = "default", ...props }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "pt-2",
      default: "pt-4",
      lg: "pt-6",
    };

    return (
      <div
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Componente CardFooter
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, justify = "start", ...props }, ref) => {
    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center pt-4 border-t border-gray-100",
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Asignar displayName a todos los componentes
Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
