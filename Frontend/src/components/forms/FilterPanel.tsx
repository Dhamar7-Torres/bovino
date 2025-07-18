import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  Search,
  MapPin,
  Calendar,
  Heart,
  ChevronDown,
  RotateCcw,
  Check,
  Stethoscope,
  CircleDot,
} from "lucide-react";

// Interfaces para los filtros
interface FilterOptions {
  searchTerm: string;
  type: CattleType[];
  breed: string[];
  gender: Gender[];
  healthStatus: HealthStatus[];
  ageRange: {
    min: number | null;
    max: number | null;
  };
  weightRange: {
    min: number | null;
    max: number | null;
  };
  vaccinationStatus: VaccinationStatus[];
  locationRadius: number | null;
  centerLocation: Location | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Tipos para los filtros
type CattleType = "CATTLE" | "BULL" | "COW" | "CALF";
type Gender = "MALE" | "FEMALE";
type HealthStatus =
  | "HEALTHY"
  | "SICK"
  | "RECOVERING"
  | "QUARANTINE"
  | "DECEASED";
type VaccinationStatus = "UP_TO_DATE" | "PENDING" | "OVERDUE" | "NONE";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Props del FilterPanel
interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  cattleCount?: number;
  filteredCount?: number;
  isLoading?: boolean;
  className?: string;
}

// Configuraciones para opciones de filtro
const filterConfigs = {
  cattleTypes: [
    {
      value: "CATTLE",
      label: "Ganado General",
      icon: <CircleDot className="w-4 h-4" />,
      color: "text-amber-600",
    },
    {
      value: "BULL",
      label: "Toro",
      icon: <CircleDot className="w-4 h-4" />,
      color: "text-red-600",
    },
    {
      value: "COW",
      label: "Vaca",
      icon: <CircleDot className="w-4 h-4" />,
      color: "text-pink-600",
    },
    {
      value: "CALF",
      label: "Ternero",
      icon: <CircleDot className="w-4 h-4" />,
      color: "text-blue-600",
    },
  ],

  breeds: [
    "Holstein",
    "Jersey",
    "Angus",
    "Hereford",
    "Simmental",
    "Charolais",
    "Brahman",
    "Limousin",
    "Gelbvieh",
    "Red Angus",
    "Brown Swiss",
    "Otra",
  ],

  genders: [
    { value: "MALE", label: "Macho", icon: "♂", color: "text-blue-600" },
    { value: "FEMALE", label: "Hembra", icon: "♀", color: "text-pink-600" },
  ],

  healthStatuses: [
    {
      value: "HEALTHY",
      label: "Saludable",
      icon: <Heart className="w-4 h-4" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      value: "SICK",
      label: "Enfermo",
      icon: <Stethoscope className="w-4 h-4" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      value: "RECOVERING",
      label: "Recuperándose",
      icon: <Heart className="w-4 h-4" />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      value: "QUARANTINE",
      label: "Cuarentena",
      icon: <Heart className="w-4 h-4" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      value: "DECEASED",
      label: "Fallecido",
      icon: <X className="w-4 h-4" />,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ],

  vaccinationStatuses: [
    {
      value: "UP_TO_DATE",
      label: "Al día",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      value: "PENDING",
      label: "Pendiente",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      value: "OVERDUE",
      label: "Vencida",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      value: "NONE",
      label: "Sin vacunas",
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
  ],
};

// Componente de sección de filtro colapsable
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  count,
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <motion.button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
        onClick={onToggle}
        whileHover={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="flex items-center space-x-3">
          <div className="text-gray-500">{icon}</div>
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de checkbox personalizado
interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  bg?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  icon,
  color = "text-gray-600",
  bg = "bg-gray-50",
}) => {
  return (
    <motion.label
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        checked
          ? `${bg} border-2 border-current ${color}`
          : "hover:bg-gray-50 border-2 border-transparent"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
          }`}
          animate={{ scale: checked ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex items-center space-x-2 flex-1">
        {icon && <div className={color}>{icon}</div>}
        <span
          className={`text-sm font-medium ${checked ? color : "text-gray-700"}`}
        >
          {label}
        </span>
      </div>
    </motion.label>
  );
};

// Animaciones para el panel
const panelVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: "100%",
    opacity: 0,
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Componente FilterPanel para filtrar bovinos
 * Panel lateral deslizable con múltiples opciones de filtrado
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  cattleCount = 0,
  filteredCount = 0,
  isLoading = false,
  className = "",
}) => {
  // Estado para secciones colapsadas
  const [openSections, setOpenSections] = useState({
    search: true,
    type: false,
    breed: false,
    characteristics: false,
    health: false,
    vaccination: false,
    location: false,
    date: false,
  });

  // Calcular conteo de filtros activos por sección
  const getActiveFiltersCount = useCallback(() => {
    const counts = {
      search: filters.searchTerm ? 1 : 0,
      type: filters.type.length,
      breed: filters.breed.length,
      characteristics:
        filters.ageRange.min !== null ||
        filters.ageRange.max !== null ||
        filters.weightRange.min !== null ||
        filters.weightRange.max !== null
          ? 1
          : 0,
      health: filters.healthStatus.length,
      vaccination: filters.vaccinationStatus.length,
      location: filters.locationRadius !== null ? 1 : 0,
      date: filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    };

    return counts;
  }, [filters]);

  // Manejar toggle de secciones
  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Manejar cambios en filtros
  const updateFilters = useCallback(
    (updates: Partial<FilterOptions>) => {
      onFiltersChange({ ...filters, ...updates });
    },
    [filters, onFiltersChange]
  );

  // Manejar cambio en arrays de filtros
  const updateArrayFilter = useCallback(
    <T,>(key: keyof FilterOptions, value: T, checked: boolean) => {
      const currentArray = filters[key] as T[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item) => item !== value);

      updateFilters({ [key]: newArray });
    },
    [filters, updateFilters]
  );

  // Efecto para abrir búsqueda por defecto
  useEffect(() => {
    if (isOpen && !openSections.search) {
      setOpenSections((prev) => ({ ...prev, search: true }));
    }
  }, [isOpen, openSections.search]);

  const activeCounts = getActiveFiltersCount();
  const totalActiveFilters = Object.values(activeCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col ${className}`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                {totalActiveFilters > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {totalActiveFilters}
                  </span>
                )}
              </div>

              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {/* Búsqueda */}
              <FilterSection
                title="Búsqueda"
                icon={<Search className="w-4 h-4" />}
                isOpen={openSections.search}
                onToggle={() => toggleSection("search")}
                count={activeCounts.search}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por arete, nombre..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      updateFilters({ searchTerm: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FilterSection>

              {/* Tipo de ganado */}
              <FilterSection
                title="Tipo de Ganado"
                icon={<CircleDot className="w-4 h-4" />}
                isOpen={openSections.type}
                onToggle={() => toggleSection("type")}
                count={activeCounts.type}
              >
                <div className="space-y-2">
                  {filterConfigs.cattleTypes.map((type) => (
                    <CustomCheckbox
                      key={type.value}
                      checked={filters.type.includes(type.value as CattleType)}
                      onChange={(checked) =>
                        updateArrayFilter(
                          "type",
                          type.value as CattleType,
                          checked
                        )
                      }
                      label={type.label}
                      icon={type.icon}
                      color={type.color}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Raza */}
              <FilterSection
                title="Raza"
                icon={<CircleDot className="w-4 h-4" />}
                isOpen={openSections.breed}
                onToggle={() => toggleSection("breed")}
                count={activeCounts.breed}
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterConfigs.breeds.map((breed) => (
                    <CustomCheckbox
                      key={breed}
                      checked={filters.breed.includes(breed)}
                      onChange={(checked) =>
                        updateArrayFilter("breed", breed, checked)
                      }
                      label={breed}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Género */}
              <FilterSection
                title="Género"
                icon={<Heart className="w-4 h-4" />}
                isOpen={openSections.characteristics}
                onToggle={() => toggleSection("characteristics")}
                count={activeCounts.characteristics}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Género
                    </h4>
                    {filterConfigs.genders.map((gender) => (
                      <CustomCheckbox
                        key={gender.value}
                        checked={filters.gender.includes(
                          gender.value as Gender
                        )}
                        onChange={(checked) =>
                          updateArrayFilter(
                            "gender",
                            gender.value as Gender,
                            checked
                          )
                        }
                        label={gender.label}
                        color={gender.color}
                      />
                    ))}
                  </div>

                  {/* Rangos de edad y peso */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Edad (años)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.ageRange.min ?? ""}
                        onChange={(e) =>
                          updateFilters({
                            ageRange: {
                              ...filters.ageRange,
                              min: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.ageRange.max ?? ""}
                        onChange={(e) =>
                          updateFilters({
                            ageRange: {
                              ...filters.ageRange,
                              max: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Peso (kg)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.weightRange.min ?? ""}
                        onChange={(e) =>
                          updateFilters({
                            weightRange: {
                              ...filters.weightRange,
                              min: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.weightRange.max ?? ""}
                        onChange={(e) =>
                          updateFilters({
                            weightRange: {
                              ...filters.weightRange,
                              max: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Estado de salud */}
              <FilterSection
                title="Estado de Salud"
                icon={<Stethoscope className="w-4 h-4" />}
                isOpen={openSections.health}
                onToggle={() => toggleSection("health")}
                count={activeCounts.health}
              >
                <div className="space-y-2">
                  {filterConfigs.healthStatuses.map((status) => (
                    <CustomCheckbox
                      key={status.value}
                      checked={filters.healthStatus.includes(
                        status.value as HealthStatus
                      )}
                      onChange={(checked) =>
                        updateArrayFilter(
                          "healthStatus",
                          status.value as HealthStatus,
                          checked
                        )
                      }
                      label={status.label}
                      icon={status.icon}
                      color={status.color}
                      bg={status.bg}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Estado de vacunación */}
              <FilterSection
                title="Estado de Vacunación"
                icon={<Stethoscope className="w-4 h-4" />}
                isOpen={openSections.vaccination}
                onToggle={() => toggleSection("vaccination")}
                count={activeCounts.vaccination}
              >
                <div className="space-y-2">
                  {filterConfigs.vaccinationStatuses.map((status) => (
                    <CustomCheckbox
                      key={status.value}
                      checked={filters.vaccinationStatus.includes(
                        status.value as VaccinationStatus
                      )}
                      onChange={(checked) =>
                        updateArrayFilter(
                          "vaccinationStatus",
                          status.value as VaccinationStatus,
                          checked
                        )
                      }
                      label={status.label}
                      color={status.color}
                      bg={status.bg}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Ubicación */}
              <FilterSection
                title="Ubicación"
                icon={<MapPin className="w-4 h-4" />}
                isOpen={openSections.location}
                onToggle={() => toggleSection("location")}
                count={activeCounts.location}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radio de búsqueda (km)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 5"
                      value={filters.locationRadius ?? ""}
                      onChange={(e) =>
                        updateFilters({
                          locationRadius: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Filtra bovinos dentro del radio especificado desde tu
                    ubicación actual
                  </p>
                </div>
              </FilterSection>

              {/* Rango de fechas */}
              <FilterSection
                title="Fecha de Registro"
                icon={<Calendar className="w-4 h-4" />}
                isOpen={openSections.date}
                onToggle={() => toggleSection("date")}
                count={activeCounts.date}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={
                        filters.dateRange.from?.toISOString().split("T")[0] ??
                        ""
                      }
                      onChange={(e) =>
                        updateFilters({
                          dateRange: {
                            ...filters.dateRange,
                            from: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={
                        filters.dateRange.to?.toISOString().split("T")[0] ?? ""
                      }
                      onChange={(e) =>
                        updateFilters({
                          dateRange: {
                            ...filters.dateRange,
                            to: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </FilterSection>
            </div>

            {/* Footer con acciones */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
              {/* Contador de resultados */}
              <div className="text-sm text-gray-600 text-center">
                Mostrando {filteredCount} de {cattleCount} bovinos
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={onResetFilters}
                  disabled={totalActiveFilters === 0 || isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  whileHover={{ scale: totalActiveFilters > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: totalActiveFilters > 0 ? 0.98 : 1 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpiar</span>
                </motion.button>

                <motion.button
                  onClick={onApplyFilters}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>Aplicando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Aplicar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterPanel;
