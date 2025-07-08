import React from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes del badge
type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "healthy"
  | "sick"
  | "vaccinated"
  | "quarantine"
  | "pregnant"
  | "breeding"
  | "treatment"
  | "sold"
  | "active"
  | "inactive";

type BadgeSize = "sm" | "default" | "lg" | "xl";

// Función para obtener las clases según la variante
const getVariantClasses = (variant: BadgeVariant): string => {
  const variants = {
    default:
      "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary:
      "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive:
      "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
    outline: "text-slate-950 border-slate-200",

    // Variantes específicas para la aplicación ganadera
    healthy: "border-transparent bg-green-500 text-white hover:bg-green-600",
    sick: "border-transparent bg-red-500 text-white hover:bg-red-600",
    vaccinated: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
    quarantine:
      "border-transparent bg-orange-500 text-white hover:bg-orange-600",
    pregnant: "border-transparent bg-pink-500 text-white hover:bg-pink-600",
    breeding: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
    treatment:
      "border-transparent bg-yellow-500 text-yellow-900 hover:bg-yellow-600",
    sold: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
    active: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
    inactive: "border-transparent bg-slate-400 text-white hover:bg-slate-500",
  };

  return variants[variant];
};

// Función para obtener las clases según el tamaño
const getSizeClasses = (size: BadgeSize): string => {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
    xl: "px-4 py-1.5 text-base",
  };

  return sizes[size];
};

// Interface para las props del componente Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Variante del badge
  variant?: BadgeVariant;
  // Tamaño del badge
  size?: BadgeSize;
  // Prop opcional para añadir un icono
  icon?: React.ReactNode;
  // Prop para hacer el badge clickeable
  clickable?: boolean;
  // Callback para cuando se hace click
  onClick?: () => void;
}

// Componente Badge principal
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      icon,
      clickable = false,
      onClick,
      ...props
    },
    ref
  ) => {
    // Clases base que siempre se aplican
    const baseClasses =
      "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

    // Clases adicionales si el badge es clickeable
    const clickableClasses = clickable
      ? "cursor-pointer hover:scale-105 transform transition-transform duration-150"
      : "";

    // Combinamos todas las clases
    const badgeClasses = cn(
      baseClasses,
      getVariantClasses(variant),
      getSizeClasses(size),
      clickableClasses,
      className
    );

    return (
      <div
        className={badgeClasses}
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
        {/* Renderizar icono si se proporciona */}
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
