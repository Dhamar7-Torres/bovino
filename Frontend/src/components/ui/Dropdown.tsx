import React, { useState, useRef, useEffect } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para opciones del dropdown
export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

// Tipos para las variantes del dropdown
type DropdownVariant = "default" | "outline" | "filled" | "ghost";
type DropdownSize = "sm" | "default" | "lg";

// Props del componente Dropdown
export interface DropdownProps {
  // Opciones a mostrar
  options: DropdownOption[];
  // Valor seleccionado
  value?: string | number | null;
  // Callback cuando cambia la selección
  onChange?: (value: string | number | null) => void;
  // Placeholder
  placeholder?: string;
  // Deshabilitado
  disabled?: boolean;
  // Texto de error
  error?: string;
  // Label del dropdown
  label?: string;
  // Descripción/ayuda
  description?: string;
  // Requerido
  required?: boolean;
  // Búsqueda en opciones
  searchable?: boolean;
  // Selección múltiple
  multiple?: boolean;
  // Valores múltiples seleccionados
  multipleValues?: (string | number)[];
  // Callback para múltiples valores
  onMultipleChange?: (values: (string | number)[]) => void;
  // Variante visual
  variant?: DropdownVariant;
  // Tamaño
  size?: DropdownSize;
  // Ancho completo
  fullWidth?: boolean;
  // Posición del dropdown
  position?: "bottom" | "top";
  // Máximo de opciones visibles
  maxVisibleOptions?: number;
  // Clases CSS adicionales
  className?: string;
  // Loading state
  loading?: boolean;
  // Crear nueva opción
  creatable?: boolean;
  // Callback para crear nueva opción
  onCreateOption?: (inputValue: string) => void;
}

// Función para obtener las clases según la variante
const getVariantClasses = (
  variant: DropdownVariant,
  error?: string
): string => {
  const baseClasses = "border rounded-md transition-colors";

  if (error) {
    return cn(
      baseClasses,
      "border-red-500 focus:border-red-500 focus:ring-red-500"
    );
  }

  const variants = {
    default:
      "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
    outline:
      "border-gray-400 bg-white focus:border-blue-600 focus:ring-blue-600",
    filled:
      "border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
    ghost:
      "border-transparent bg-transparent hover:bg-gray-50 focus:border-gray-300 focus:ring-gray-300",
  };

  return cn(baseClasses, variants[variant]);
};

// Función para obtener las clases según el tamaño
const getSizeClasses = (size: DropdownSize): string => {
  const sizes = {
    sm: "px-2 py-1 text-sm min-h-[32px]",
    default: "px-3 py-2 text-sm min-h-[40px]",
    lg: "px-4 py-3 text-base min-h-[48px]",
  };
  return sizes[size];
};

// Hook para detectar clicks fuera del componente
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};

// Componente principal Dropdown
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción...",
  disabled = false,
  error,
  label,
  description,
  required = false,
  searchable = false,
  multiple = false,
  multipleValues = [],
  onMultipleChange,
  variant = "default",
  size = "default",
  fullWidth = false,
  position = "bottom",
  maxVisibleOptions = 6,
  className,
  loading = false,
  creatable = false,
  onCreateOption,
}) => {
  // Estados
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Referencias
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Filtrar opciones según búsqueda
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // Agrupar opciones si tienen grupos
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || "default";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  // Obtener label de la opción seleccionada
  const getSelectedLabel = () => {
    if (multiple) {
      const selectedOptions = options.filter((opt) =>
        multipleValues.includes(opt.value)
      );
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} opciones seleccionadas`;
    }

    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Manejar selección de opción
  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    if (multiple) {
      const newValues = multipleValues.includes(option.value)
        ? multipleValues.filter((v) => v !== option.value)
        : [...multipleValues, option.value];
      onMultipleChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
    }
  };

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  // Crear nueva opción
  const handleCreateOption = () => {
    if (creatable && searchTerm && onCreateOption) {
      onCreateOption(searchTerm);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  // Clases del contenedor
  const containerClasses = cn(
    "relative",
    fullWidth ? "w-full" : "w-auto",
    className
  );

  // Clases del trigger
  const triggerClasses = cn(
    "w-full flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2",
    getVariantClasses(variant, error),
    getSizeClasses(size),
    disabled && "opacity-50 cursor-not-allowed",
    isOpen && "ring-2 ring-blue-500 ring-offset-2"
  );

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown container */}
      <div ref={dropdownRef} className="relative">
        {/* Trigger */}
        <div
          className={triggerClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span
            className={cn(
              "flex-1 text-left truncate",
              value === null ||
                value === undefined ||
                (multiple && multipleValues.length === 0)
                ? "text-gray-500"
                : "text-gray-900"
            )}
          >
            {getSelectedLabel()}
          </span>

          {loading ? (
            <svg
              className="w-4 h-4 animate-spin text-gray-400"
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
          ) : (
            <svg
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                isOpen && "transform rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg",
              position === "top" ? "bottom-full mb-1" : "top-full"
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  autoFocus
                />
              </div>
            )}

            {/* Options list */}
            <div
              className="max-h-60 overflow-auto py-1"
              role="listbox"
              style={{ maxHeight: `${maxVisibleOptions * 40}px` }}
            >
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {/* Group header */}
                  {group !== "default" && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                      {group}
                    </div>
                  )}

                  {/* Group options */}
                  {groupOptions.map((option) => {
                    const globalIndex = filteredOptions.indexOf(option);
                    const isSelected = multiple
                      ? multipleValues.includes(option.value)
                      : value === option.value;
                    const isHighlighted = globalIndex === highlightedIndex;

                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center px-3 py-2 cursor-pointer text-sm",
                          isSelected && "bg-blue-50 text-blue-600",
                          isHighlighted && "bg-gray-100",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => handleOptionSelect(option)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {/* Multiple selection checkbox */}
                        {multiple && (
                          <div
                            className={cn(
                              "w-4 h-4 mr-2 border rounded flex items-center justify-center",
                              isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        )}

                        {/* Option icon */}
                        {option.icon && (
                          <span className="mr-2 text-gray-400">
                            {option.icon}
                          </span>
                        )}

                        {/* Option content */}
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500">
                              {option.description}
                            </div>
                          )}
                        </div>

                        {/* Single selection checkmark */}
                        {!multiple && isSelected && (
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Create option */}
              {creatable && searchTerm && !filteredOptions.length && (
                <div
                  className="flex items-center px-3 py-2 cursor-pointer text-sm text-blue-600 hover:bg-blue-50"
                  onClick={handleCreateOption}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear "{searchTerm}"
                </div>
              )}

              {/* No options found */}
              {!loading && filteredOptions.length === 0 && !creatable && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No se encontraron opciones
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export { Dropdown };
