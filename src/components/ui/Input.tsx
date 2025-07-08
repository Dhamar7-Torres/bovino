import React, { useState, forwardRef } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes del input
type InputVariant = "default" | "outline" | "filled" | "ghost" | "underline";
type InputSize = "sm" | "default" | "lg";

// Props del componente Input
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // Variante visual
  variant?: InputVariant;
  // Tamaño del input
  size?: InputSize;
  // Label del input
  label?: string;
  // Descripción/ayuda
  description?: string;
  // Texto de error
  error?: string;
  // Icono a la izquierda
  leftIcon?: React.ReactNode;
  // Icono a la derecha
  rightIcon?: React.ReactNode;
  // Elemento a la izquierda (como prefijo)
  leftElement?: React.ReactNode;
  // Elemento a la derecha (como sufijo)
  rightElement?: React.ReactNode;
  // Ancho completo
  fullWidth?: boolean;
  // Estado de carga
  loading?: boolean;
  // Clearable (botón para limpiar)
  clearable?: boolean;
  // Callback cuando se limpia
  onClear?: () => void;
  // Requerido
  required?: boolean;
  // Contador de caracteres
  showCharCount?: boolean;
  // Máximo de caracteres
  maxLength?: number;
  // Tooltip
  tooltip?: string;
}

// Función para obtener las clases según la variante
const getVariantClasses = (
  variant: InputVariant,
  error?: string,
  disabled?: boolean
): string => {
  if (error) {
    return "border-red-500 focus:border-red-500 focus:ring-red-500 bg-white";
  }

  if (disabled) {
    return "border-gray-200 bg-gray-50 text-gray-500";
  }

  const variants = {
    default:
      "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
    outline:
      "border-2 border-gray-400 bg-white focus:border-blue-600 focus:ring-blue-600",
    filled:
      "border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
    ghost:
      "border-transparent bg-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-gray-300",
    underline:
      "border-0 border-b-2 border-gray-300 bg-transparent rounded-none focus:border-blue-500 focus:ring-0 px-0",
  };

  return variants[variant];
};

// Función para obtener las clases según el tamaño
const getSizeClasses = (size: InputSize, variant: InputVariant): string => {
  if (variant === "underline") {
    const sizes = {
      sm: "py-1 text-sm",
      default: "py-2 text-sm",
      lg: "py-3 text-base",
    };
    return sizes[size];
  }

  const sizes = {
    sm: "px-2 py-1 text-sm h-8",
    default: "px-3 py-2 text-sm h-10",
    lg: "px-4 py-3 text-base h-12",
  };
  return sizes[size];
};

// Componente principal Input
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "text",
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      fullWidth = false,
      loading = false,
      clearable = false,
      onClear,
      required = false,
      showCharCount = false,
      maxLength,
      tooltip,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    // Estado para mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);

    // Estado para focus
    const [] = useState(false);

    // Determinar si mostrar el botón de limpiar
    const showClearButton = clearable && value && !disabled && !loading;

    // Clases base del input
    const baseClasses =
      "w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

    // Clases del contenedor
    const containerClasses = cn(
      "relative",
      fullWidth ? "w-full" : "w-auto",
      className
    );

    // Clases del input
    const leftPadding = leftIcon || leftElement ? "pl-10" : undefined;
    const rightPadding =
      rightIcon ||
      rightElement ||
      showClearButton ||
      loading ||
      type === "password"
        ? "pr-10"
        : undefined;

    const inputClasses = cn(
      baseClasses,
      getVariantClasses(variant, error, disabled),
      getSizeClasses(size, variant),
      leftPadding,
      rightPadding
    );

    // Manejar cambio de valor
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maxLength && e.target.value.length > maxLength) {
        return;
      }
      onChange?.(e);
    };

    // Manejar limpiar input
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    // Componente de icono o elemento
    const IconOrElement = ({
      icon,
      element,
      position,
    }: {
      icon?: React.ReactNode;
      element?: React.ReactNode;
      position: "left" | "right";
    }) => {
      const content = element || icon;
      if (!content) return null;

      const positionClasses =
        position === "left" ? "left-0 pl-3" : "right-0 pr-3";

      return (
        <div
          className={cn(
            "absolute inset-y-0 flex items-center pointer-events-none",
            positionClasses
          )}
        >
          <div className="text-gray-400 flex items-center">{content}</div>
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {tooltip && (
              <div className="group relative">
                <svg
                  className="w-4 h-4 text-gray-400 cursor-help"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon/element */}
          <IconOrElement
            icon={leftIcon}
            element={leftElement}
            position="left"
          />

          {/* Input field */}
          <input
            ref={ref}
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
            className={inputClasses}
            disabled={disabled || loading}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {/* Right side controls */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {/* Loading spinner */}
            {loading && (
              <svg
                className="w-4 h-4 text-gray-400 animate-spin"
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
            )}

            {/* Clear button */}
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                <svg
                  className="w-4 h-4"
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

            {/* Password toggle */}
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Right icon/element */}
            {!loading && !showClearButton && (
              <IconOrElement
                icon={rightIcon}
                element={rightElement}
                position="right"
              />
            )}
          </div>
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                "text-xs",
                value &&
                  typeof value === "string" &&
                  value.length > maxLength * 0.9
                  ? "text-red-500"
                  : "text-gray-500"
              )}
            >
              {typeof value === "string" ? value.length : 0}/{maxLength}
            </span>
          </div>
        )}

        {/* Description */}
        {description && !error && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
