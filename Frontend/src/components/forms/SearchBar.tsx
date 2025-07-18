import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Filter,
  Zap,
  Clock,
  CircleDot,
  Tag,
  MapPin,
  Stethoscope,
  Calendar,
  TrendingUp,
  Star,
} from "lucide-react";

// Tipos de búsqueda disponibles
type SearchType =
  | "all"
  | "ear-tag"
  | "name"
  | "breed"
  | "location"
  | "vaccination"
  | "health";

// Resultado de búsqueda
interface SearchResult {
  id: string;
  type: "bovine" | "vaccination" | "illness" | "location" | "veterinarian";
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  icon?: React.ReactNode;
  url?: string;
  metadata?: Record<string, any>;
  relevance?: number;
  highlighted?: boolean;
}

// Sugerencia de búsqueda
interface SearchSuggestion {
  id: string;
  text: string;
  type: SearchType;
  count?: number;
  recent?: boolean;
  popular?: boolean;
}

// Filtro de búsqueda
interface SearchFilter {
  id: string;
  label: string;
  type: SearchType;
  icon: React.ReactNode;
  active: boolean;
  count?: number;
}

// Props del SearchBar
interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string, filters: SearchType[]) => void;
  onResultSelect?: (result: SearchResult) => void;
  onClear?: () => void;

  // Resultados y sugerencias
  results?: SearchResult[];
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;

  // Configuración
  showFilters?: boolean;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  maxResults?: number;
  maxSuggestions?: number;

  // Estilo
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "bordered";
  className?: string;

  // Funcionalidad específica para ganado
  cattleContext?: boolean;
  enableGeoSearch?: boolean;
  enableVoiceSearch?: boolean;

  // Estados
  disabled?: boolean;
  autoFocus?: boolean;
}

// Configuraciones de tamaño
const sizeConfigs = {
  small: {
    container: "h-10",
    input: "text-sm px-4 py-2",
    icon: "w-4 h-4",
    dropdown: "text-sm",
  },
  medium: {
    container: "h-12",
    input: "text-base px-5 py-3",
    icon: "w-5 h-5",
    dropdown: "text-base",
  },
  large: {
    container: "h-14",
    input: "text-lg px-6 py-4",
    icon: "w-6 h-6",
    dropdown: "text-lg",
  },
};

// Configuraciones de variante
const variantConfigs = {
  default: {
    container:
      "bg-white border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
    dropdown: "bg-white border border-gray-200 shadow-lg",
  },
  filled: {
    container:
      "bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
    dropdown: "bg-white border border-gray-200 shadow-lg",
  },
  bordered: {
    container: "bg-white border-2 border-gray-300 focus-within:border-blue-500",
    dropdown: "bg-white border-2 border-gray-300 shadow-xl",
  },
};

// Filtros predefinidos para ganado
const defaultCattleFilters: SearchFilter[] = [
  {
    id: "all",
    label: "Todo",
    type: "all",
    icon: <Search className="w-full h-full" />,
    active: true,
  },
  {
    id: "ear-tag",
    label: "Arete",
    type: "ear-tag",
    icon: <Tag className="w-full h-full" />,
    active: false,
  },
  {
    id: "breed",
    label: "Raza",
    type: "breed",
    icon: <CircleDot className="w-full h-full" />,
    active: false,
  },
  {
    id: "location",
    label: "Ubicación",
    type: "location",
    icon: <MapPin className="w-full h-full" />,
    active: false,
  },
  {
    id: "health",
    label: "Salud",
    type: "health",
    icon: <Stethoscope className="w-full h-full" />,
    active: false,
  },
  {
    id: "vaccination",
    label: "Vacunas",
    type: "vaccination",
    icon: <Calendar className="w-full h-full" />,
    active: false,
  },
];

// Animaciones
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
};

const resultVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/**
 * Componente SearchBar avanzado para la aplicación de ganado
 * Incluye filtros específicos, autocompletado y búsqueda contextual
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar bovinos, vacunas, ubicaciones...",
  value: controlledValue,
  onChange,
  onSearch,
  onResultSelect,
  onClear,

  // Datos
  results = [],
  suggestions = [],
  isLoading = false,

  // Configuración
  showFilters = true,
  showSuggestions = true,
  showRecentSearches = true,
  maxResults = 10,
  maxSuggestions = 5,

  // Estilo
  size = "medium",
  variant = "default",
  className = "",

  // Estados
  disabled = false,
  autoFocus = false,
}) => {
  // Estados locales
  const [internalValue, setInternalValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setIsFocused] = useState(false);
  const [filters, setFilters] = useState<SearchFilter[]>(defaultCattleFilters);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Configuraciones
  const sizeConfig = sizeConfigs[size];
  const variantConfig = variantConfigs[variant];
  const currentValue =
    controlledValue !== undefined ? controlledValue : internalValue;

  // Obtener filtros activos
  const activeFilters = filters.filter((filter) => filter.active);
  const activeFilterTypes = activeFilters.map((filter) => filter.type);

  // Manejar cambio de valor
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      // Abrir dropdown cuando hay texto
      if (newValue.trim() && !isOpen) {
        setIsOpen(true);
      }

      // Cerrar dropdown cuando no hay texto
      if (!newValue.trim() && isOpen) {
        setIsOpen(false);
      }

      // Reset highlighted index
      setHighlightedIndex(-1);
    },
    [controlledValue, onChange, isOpen]
  );

  // Manejar búsqueda
  const handleSearch = useCallback(
    (query?: string) => {
      const searchQuery = query || currentValue;
      if (!searchQuery.trim()) return;

      // Agregar a búsquedas recientes
      setRecentSearches((prev) => {
        const filtered = prev.filter((search) => search !== searchQuery);
        return [searchQuery, ...filtered].slice(0, 5);
      });

      // Ejecutar búsqueda
      onSearch?.(searchQuery, activeFilterTypes);

      // Cerrar dropdown
      setIsOpen(false);
    },
    [currentValue, activeFilterTypes, onSearch]
  );

  // Manejar selección de resultado
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      onResultSelect?.(result);
      setIsOpen(false);

      // Opcional: actualizar el valor del input con el título del resultado
      handleValueChange(result.title);
    },
    [onResultSelect, handleValueChange]
  );

  // Manejar limpiar búsqueda
  const handleClear = useCallback(() => {
    handleValueChange("");
    setIsOpen(false);
    onClear?.();
    inputRef.current?.focus();
  }, [handleValueChange, onClear]);

  // Manejar toggle de filtro
  const handleFilterToggle = useCallback((filterId: string) => {
    setFilters((prevFilters) => {
      return prevFilters.map((filter) => {
        if (filter.id === filterId) {
          // Si es "all", desactivar otros filtros
          if (filterId === "all") {
            return { ...filter, active: true };
          }
          return { ...filter, active: !filter.active };
        } else if (filterId !== "all" && filter.id === "all") {
          // Si se activa otro filtro, desactivar "all"
          return { ...filter, active: false };
        }
        return filter;
      });
    });
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const totalItems = showSuggestions
        ? suggestions.length
        : 0 + results.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % totalItems);
          break;

        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;

        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            if (showSuggestions && highlightedIndex < suggestions.length) {
              const suggestion = suggestions[highlightedIndex];
              handleValueChange(suggestion.text);
              handleSearch(suggestion.text);
            } else {
              const resultIndex =
                highlightedIndex - (showSuggestions ? suggestions.length : 0);
              if (results[resultIndex]) {
                handleResultSelect(results[resultIndex]);
              }
            }
          } else {
            handleSearch();
          }
          break;

        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [
      isOpen,
      highlightedIndex,
      suggestions,
      results,
      showSuggestions,
      handleValueChange,
      handleSearch,
      handleResultSelect,
    ]
  );

  // Efecto para manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Efecto para auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Renderizar íconos de tipo de resultado
  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case "bovine":
        return <CircleDot className="w-4 h-4 text-amber-500" />;
      case "vaccination":
        return <Calendar className="w-4 h-4 text-green-500" />;
      case "illness":
        return <Stethoscope className="w-4 h-4 text-red-500" />;
      case "location":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "veterinarian":
        return <Stethoscope className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Contenedor principal */}
      <div
        className={`
        relative flex items-center rounded-lg transition-all duration-200
        ${sizeConfig.container}
        ${variantConfig.container}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
      `}
      >
        {/* Ícono de búsqueda */}
        <div className={`flex-shrink-0 ml-4 text-gray-400 ${sizeConfig.icon}`}>
          <Search className="w-full h-full" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (currentValue.trim()) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 bg-transparent border-none outline-none
            ${sizeConfig.input}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        />

        {/* Botones de acción */}
        <div className="flex items-center space-x-2 mr-4">
          {/* Indicador de carga */}
          {isLoading && (
            <motion.div
              className={`text-blue-500 ${sizeConfig.icon}`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-full h-full" />
            </motion.div>
          )}

          {/* Botón limpiar */}
          {currentValue && !disabled && (
            <motion.button
              type="button"
              onClick={handleClear}
              className={`text-gray-400 hover:text-gray-600 ${sizeConfig.icon}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-full h-full" />
            </motion.button>
          )}

          {/* Botón de filtros */}
          {showFilters && (
            <motion.button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`text-gray-400 hover:text-gray-600 ${
                sizeConfig.icon
              } ${activeFilters.length > 1 ? "text-blue-500" : ""}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-full h-full" />
              {activeFilters.length > 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`
              absolute top-full left-0 right-0 mt-2 z-50 rounded-lg overflow-hidden
              ${variantConfig.dropdown}
              ${sizeConfig.dropdown}
            `}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Filtros */}
            {showFilters && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <motion.button
                      key={filter.id}
                      onClick={() => handleFilterToggle(filter.id)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          filter.active
                            ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-4 h-4">{filter.icon}</div>
                      <span>{filter.label}</span>
                      {filter.count && (
                        <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                          {filter.count}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {/* Sugerencias */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sugerencias
                  </h4>
                  {suggestions
                    .slice(0, maxSuggestions)
                    .map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        onClick={() => {
                          handleValueChange(suggestion.text);
                          handleSearch(suggestion.text);
                        }}
                        className={`
                        w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg
                        ${
                          index === highlightedIndex
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }
                      `}
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center space-x-2">
                          {suggestion.popular && (
                            <TrendingUp className="w-3 h-3 text-orange-500" />
                          )}
                          {suggestion.recent && (
                            <Clock className="w-3 h-3 text-blue-500" />
                          )}
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="flex-1 text-sm">
                          {suggestion.text}
                        </span>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">
                            {suggestion.count} resultados
                          </span>
                        )}
                      </motion.button>
                    ))}
                </div>
              )}

              {/* Búsquedas recientes */}
              {showRecentSearches &&
                recentSearches.length > 0 &&
                !currentValue.trim() && (
                  <div className="p-2 border-t border-gray-100">
                    <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Búsquedas recientes
                    </h4>
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          handleValueChange(search);
                          handleSearch(search);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-600">
                          {search}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

              {/* Resultados */}
              {results.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Resultados
                  </h4>
                  {results.slice(0, maxResults).map((result, index) => {
                    const adjustedIndex =
                      (showSuggestions ? suggestions.length : 0) + index;
                    return (
                      <motion.button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className={`
                          w-full flex items-start space-x-3 px-3 py-3 text-left hover:bg-gray-50 rounded-lg
                          ${
                            adjustedIndex === highlightedIndex
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : ""
                          }
                        `}
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {result.icon || getResultIcon(result)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h5>
                            {result.highlighted && (
                              <Star className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-gray-600 truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Estado vacío */}
              {currentValue.trim() &&
                !isLoading &&
                results.length === 0 &&
                suggestions.length === 0 && (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Sin resultados
                    </h4>
                    <p className="text-xs text-gray-500">
                      No encontramos resultados para "{currentValue}". Intenta
                      con otros términos.
                    </p>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
