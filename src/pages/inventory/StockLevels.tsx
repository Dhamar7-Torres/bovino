import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Target,
  Settings,
  RefreshCw,
  Download,
  Search,
  Filter,
  Edit,
  X,
  Check,
  Clock,
  MapPin,
  Calculator,
  Zap,
  Activity,
  Gauge,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Sliders,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Interfaces para gestión de niveles de stock
interface StockLevel {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;

  // Puntos de control
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  safetyStock: number;
  optimalStock: number;

  // Métricas de rendimiento
  turnoverRate: number; // rotaciones por año
  averageDemand: number; // consumo promedio mensual
  leadTime: number; // tiempo de reposición en días
  serviceLevel: number; // nivel de servicio %

  // Información financiera
  unitCost: number;
  totalValue: number;
  averageCost: number;

  // Ubicación y organización
  location: {
    warehouse: string;
    zone?: string;
    shelf: string;
    position: string;
  };

  // Estado y alertas
  status: StockStatus;
  riskLevel: RiskLevel;
  lastMovementDate: Date;
  lastReorderDate?: Date;
  nextReorderDate?: Date;

  // Configuración automática
  autoReorder: boolean;
  reorderQuantity: number;
  preferredSupplier: string;

  // Análisis temporal
  stockDays: number; // días de stock disponible
  velocity: StockVelocity;
  seasonality: SeasonalPattern;

  // Metadatos
  lastUpdated: Date;
  updatedBy: string;
  notes?: string;
}

interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  adjustmentType: AdjustmentType;
  previousValue: number;
  newValue: number;
  difference: number;
  reason: string;
  appliedBy: string;
  appliedAt: Date;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  batchAffected?: string;
  location: string;
  notes?: string;
}

interface StockRecommendation {
  id: string;
  itemId: string;
  itemName: string;
  recommendationType: RecommendationType;
  currentValue: number;
  recommendedValue: number;
  impact: string;
  priority: Priority;
  reasoning: string[];
  potentialSavings?: number;
  implementationEffort: ImplementationEffort;
  expectedResult: string;
  validUntil: Date;
  confidence: number; // 0-100%
}

interface StockAnalytics {
  totalItems: number;
  totalValue: number;
  averageTurnover: number;
  totalStockDays: number;

  // Distribución por estado
  statusDistribution: {
    optimal: number;
    adequate: number;
    low: number;
    critical: number;
    overstock: number;
  };

  // Distribución por velocidad
  velocityDistribution: {
    fast: number;
    medium: number;
    slow: number;
    obsolete: number;
  };

  // Métricas financieras
  inventoryTurnover: number;
  daysOfSupply: number;
  carryingCost: number;
  stockoutRisk: number;

  // Recomendaciones activas
  activeRecommendations: number;
  potentialSavings: number;

  // Tendencias
  trends: {
    period: string;
    totalValue: number;
    turnover: number;
    stockouts: number;
  }[];
}

// Enums
enum StockStatus {
  OPTIMAL = "optimal",
  ADEQUATE = "adequate",
  LOW = "low",
  CRITICAL = "critical",
  OVERSTOCK = "overstock",
  OUT_OF_STOCK = "out_of_stock",
}

enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

enum StockVelocity {
  FAST = "fast", // >12 rotaciones/año
  MEDIUM = "medium", // 4-12 rotaciones/año
  SLOW = "slow", // 1-4 rotaciones/año
  OBSOLETE = "obsolete", // <1 rotación/año
}

enum SeasonalPattern {
  NONE = "none",
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
  YEAR_ROUND = "year_round",
}

enum AdjustmentType {
  MINIMUM_STOCK = "minimum_stock",
  MAXIMUM_STOCK = "maximum_stock",
  REORDER_POINT = "reorder_point",
  SAFETY_STOCK = "safety_stock",
  REORDER_QUANTITY = "reorder_quantity",
}

enum RecommendationType {
  REDUCE_MINIMUM = "reduce_minimum",
  INCREASE_MINIMUM = "increase_minimum",
  REDUCE_MAXIMUM = "reduce_maximum",
  INCREASE_MAXIMUM = "increase_maximum",
  ADJUST_REORDER_POINT = "adjust_reorder_point",
  OPTIMIZE_QUANTITY = "optimize_quantity",
  CHANGE_SUPPLIER = "change_supplier",
  DISCONTINUE_ITEM = "discontinue_item",
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

enum ImplementationEffort {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

const StockLevels: React.FC = () => {
  // Estados del componente
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [analytics, setAnalytics] = useState<StockAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>(
    []
  );
  const [] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de UI
  const [activeView, setActiveView] = useState<
    "levels" | "analytics" | "recommendations" | "adjustments"
  >("levels");
  const [, setSelectedItem] = useState<StockLevel | null>(null);
  const [, setShowEditModal] = useState(false);
  const [, setShowBulkModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    velocity: "all",
    risk: "all",
    category: "all",
    location: "all",
    autoReorder: "all",
  });

  // Estados de acciones
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [] = useState(false);

  // Efecto para cargar datos
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados de niveles de stock
        const mockStockLevels: StockLevel[] = [
          {
            id: "1",
            itemId: "med-001",
            itemName: "Penicilina G Procaínica",
            category: "Medicamentos",
            currentStock: 15,
            availableStock: 13,
            reservedStock: 2,
            inTransitStock: 0,
            minimumStock: 8,
            maximumStock: 50,
            reorderPoint: 12,
            safetyStock: 5,
            optimalStock: 25,
            turnoverRate: 8.5,
            averageDemand: 4.2,
            leadTime: 7,
            serviceLevel: 95,
            unitCost: 45.5,
            totalValue: 682.5,
            averageCost: 44.8,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "A-2",
              position: "03",
            },
            status: StockStatus.ADEQUATE,
            riskLevel: RiskLevel.LOW,
            lastMovementDate: new Date("2025-07-10"),
            lastReorderDate: new Date("2025-06-15"),
            nextReorderDate: new Date("2025-08-15"),
            autoReorder: true,
            reorderQuantity: 30,
            preferredSupplier: "FarmVet Industries",
            stockDays: 45,
            velocity: StockVelocity.MEDIUM,
            seasonality: SeasonalPattern.YEAR_ROUND,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Dr. García",
          },
          {
            id: "2",
            itemId: "vac-003",
            itemName: "Vacuna Triple Bovina",
            category: "Vacunas",
            currentStock: 8,
            availableStock: 8,
            reservedStock: 0,
            inTransitStock: 25,
            minimumStock: 15,
            maximumStock: 100,
            reorderPoint: 20,
            safetyStock: 10,
            optimalStock: 40,
            turnoverRate: 12.3,
            averageDemand: 8.1,
            leadTime: 14,
            serviceLevel: 90,
            unitCost: 125.0,
            totalValue: 1000.0,
            averageCost: 122.5,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "B-1",
              position: "07",
            },
            status: StockStatus.LOW,
            riskLevel: RiskLevel.HIGH,
            lastMovementDate: new Date("2025-07-08"),
            lastReorderDate: new Date("2025-07-05"),
            autoReorder: true,
            reorderQuantity: 50,
            preferredSupplier: "BioVet Laboratories",
            stockDays: 12,
            velocity: StockVelocity.FAST,
            seasonality: SeasonalPattern.SPRING,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Dr. López",
          },
          {
            id: "3",
            itemId: "sup-005",
            itemName: "Concentrado Proteico 20kg",
            category: "Suplementos",
            currentStock: 0,
            availableStock: 0,
            reservedStock: 0,
            inTransitStock: 10,
            minimumStock: 20,
            maximumStock: 100,
            reorderPoint: 35,
            safetyStock: 15,
            optimalStock: 60,
            turnoverRate: 15.2,
            averageDemand: 12.5,
            leadTime: 5,
            serviceLevel: 85,
            unitCost: 85.0,
            totalValue: 0,
            averageCost: 83.2,
            location: {
              warehouse: "Almacén de Alimentos",
              zone: "Área Seca",
              shelf: "C-5",
              position: "12",
            },
            status: StockStatus.OUT_OF_STOCK,
            riskLevel: RiskLevel.CRITICAL,
            lastMovementDate: new Date("2025-07-12"),
            lastReorderDate: new Date("2025-07-10"),
            nextReorderDate: new Date("2025-07-15"),
            autoReorder: true,
            reorderQuantity: 80,
            preferredSupplier: "Nutrición Animal SA",
            stockDays: 0,
            velocity: StockVelocity.FAST,
            seasonality: SeasonalPattern.YEAR_ROUND,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Admin Sistema",
          },
          {
            id: "4",
            itemId: "equ-012",
            itemName: "Jeringas Desechables 10ml",
            category: "Equipos",
            currentStock: 450,
            availableStock: 450,
            reservedStock: 0,
            inTransitStock: 0,
            minimumStock: 100,
            maximumStock: 300,
            reorderPoint: 150,
            safetyStock: 50,
            optimalStock: 200,
            turnoverRate: 3.2,
            averageDemand: 25.0,
            leadTime: 10,
            serviceLevel: 98,
            unitCost: 2.5,
            totalValue: 1125.0,
            averageCost: 2.45,
            location: {
              warehouse: "Almacén General",
              zone: "Área Ambiente",
              shelf: "D-3",
              position: "08",
            },
            status: StockStatus.OVERSTOCK,
            riskLevel: RiskLevel.MEDIUM,
            lastMovementDate: new Date("2025-07-05"),
            lastReorderDate: new Date("2025-05-20"),
            autoReorder: false,
            reorderQuantity: 200,
            preferredSupplier: "Suministros Médicos",
            stockDays: 540,
            velocity: StockVelocity.SLOW,
            seasonality: SeasonalPattern.NONE,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Auxiliar Pérez",
          },
          {
            id: "5",
            itemId: "vit-007",
            itemName: "Complejo B + Hierro",
            category: "Vitaminas",
            currentStock: 25,
            availableStock: 23,
            reservedStock: 2,
            inTransitStock: 0,
            minimumStock: 8,
            maximumStock: 40,
            reorderPoint: 12,
            safetyStock: 4,
            optimalStock: 20,
            turnoverRate: 15.6,
            averageDemand: 5.2,
            leadTime: 7,
            serviceLevel: 97,
            unitCost: 18.9,
            totalValue: 472.5,
            averageCost: 18.5,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Ambiente",
              shelf: "E-2",
              position: "18",
            },
            status: StockStatus.OPTIMAL,
            riskLevel: RiskLevel.LOW,
            lastMovementDate: new Date("2025-07-11"),
            autoReorder: true,
            reorderQuantity: 25,
            preferredSupplier: "NutriVet Laboratories",
            stockDays: 144,
            velocity: StockVelocity.FAST,
            seasonality: SeasonalPattern.YEAR_ROUND,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Dr. Rodríguez",
          },
        ];

        // Analíticas simuladas
        const mockAnalytics: StockAnalytics = {
          totalItems: 48,
          totalValue: 85420.5,
          averageTurnover: 9.8,
          totalStockDays: 156,
          statusDistribution: {
            optimal: 15,
            adequate: 18,
            low: 8,
            critical: 4,
            overstock: 3,
          },
          velocityDistribution: {
            fast: 12,
            medium: 23,
            slow: 10,
            obsolete: 3,
          },
          inventoryTurnover: 8.5,
          daysOfSupply: 43,
          carryingCost: 15.2,
          stockoutRisk: 12.5,
          activeRecommendations: 15,
          potentialSavings: 12500.0,
          trends: [
            { period: "Ene", totalValue: 78500, turnover: 8.2, stockouts: 3 },
            { period: "Feb", totalValue: 81200, turnover: 8.6, stockouts: 2 },
            { period: "Mar", totalValue: 83100, turnover: 9.1, stockouts: 1 },
            { period: "Abr", totalValue: 84800, turnover: 9.4, stockouts: 2 },
            { period: "May", totalValue: 85200, turnover: 9.6, stockouts: 1 },
            { period: "Jun", totalValue: 85400, turnover: 9.8, stockouts: 0 },
          ],
        };

        // Recomendaciones simuladas
        const mockRecommendations: StockRecommendation[] = [
          {
            id: "1",
            itemId: "equ-012",
            itemName: "Jeringas Desechables 10ml",
            recommendationType: RecommendationType.REDUCE_MAXIMUM,
            currentValue: 300,
            recommendedValue: 200,
            impact: "Reducir inventario inmovilizado",
            priority: Priority.HIGH,
            reasoning: [
              "Rotación lenta (3.2 veces/año)",
              "Stock actual excede máximo por 150%",
              "Liberaría $2,500 en capital de trabajo",
            ],
            potentialSavings: 2500.0,
            implementationEffort: ImplementationEffort.LOW,
            expectedResult: "Mejora del flujo de caja",
            validUntil: new Date("2025-08-15"),
            confidence: 92,
          },
          {
            id: "2",
            itemId: "vac-003",
            itemName: "Vacuna Triple Bovina",
            recommendationType: RecommendationType.INCREASE_MINIMUM,
            currentValue: 15,
            recommendedValue: 25,
            impact: "Reducir riesgo de desabastecimiento",
            priority: Priority.URGENT,
            reasoning: [
              "Alta rotación (12.3 veces/año)",
              "Tiempo de entrega de 14 días",
              "Demanda estacional en primavera",
            ],
            implementationEffort: ImplementationEffort.LOW,
            expectedResult: "Mejora del nivel de servicio",
            validUntil: new Date("2025-09-01"),
            confidence: 95,
          },
        ];

        setStockLevels(mockStockLevels);
        setAnalytics(mockAnalytics);
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error("Error cargando datos de stock:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStockData();
  }, []);

  // Funciones auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return {
          bg: "bg-green-50",
          border: "border-l-green-500",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          icon: "text-green-500",
        };
      case StockStatus.ADEQUATE:
        return {
          bg: "bg-blue-50",
          border: "border-l-blue-500",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          icon: "text-blue-500",
        };
      case StockStatus.LOW:
        return {
          bg: "bg-yellow-50",
          border: "border-l-yellow-500",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          icon: "text-yellow-500",
        };
      case StockStatus.CRITICAL:
        return {
          bg: "bg-red-50",
          border: "border-l-red-500",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-500",
        };
      case StockStatus.OVERSTOCK:
        return {
          bg: "bg-purple-50",
          border: "border-l-purple-500",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
          icon: "text-purple-500",
        };
      case StockStatus.OUT_OF_STOCK:
        return {
          bg: "bg-gray-50",
          border: "border-l-gray-500",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-l-gray-500",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-500",
        };
    }
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return <CheckCircle className="w-4 h-4" />;
      case StockStatus.ADEQUATE:
        return <Check className="w-4 h-4" />;
      case StockStatus.LOW:
        return <AlertTriangle className="w-4 h-4" />;
      case StockStatus.CRITICAL:
        return <AlertCircle className="w-4 h-4" />;
      case StockStatus.OVERSTOCK:
        return <TrendingUp className="w-4 h-4" />;
      case StockStatus.OUT_OF_STOCK:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return "Óptimo";
      case StockStatus.ADEQUATE:
        return "Adecuado";
      case StockStatus.LOW:
        return "Bajo";
      case StockStatus.CRITICAL:
        return "Crítico";
      case StockStatus.OVERSTOCK:
        return "Exceso";
      case StockStatus.OUT_OF_STOCK:
        return "Agotado";
      default:
        return "Desconocido";
    }
  };

  const getVelocityIcon = (velocity: StockVelocity) => {
    switch (velocity) {
      case StockVelocity.FAST:
        return <Zap className="w-4 h-4 text-green-500" />;
      case StockVelocity.MEDIUM:
        return <Activity className="w-4 h-4 text-blue-500" />;
      case StockVelocity.SLOW:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case StockVelocity.OBSOLETE:
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVelocityLabel = (velocity: StockVelocity) => {
    switch (velocity) {
      case StockVelocity.FAST:
        return "Rápida";
      case StockVelocity.MEDIUM:
        return "Media";
      case StockVelocity.SLOW:
        return "Lenta";
      case StockVelocity.OBSOLETE:
        return "Obsoleta";
      default:
        return "Desconocida";
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return "bg-green-100 text-green-800";
      case RiskLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case RiskLevel.HIGH:
        return "bg-orange-100 text-orange-800";
      case RiskLevel.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "bg-blue-100 text-blue-800";
      case Priority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case Priority.HIGH:
        return "bg-orange-100 text-orange-800";
      case Priority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    const filteredItemIds = filteredStockLevels.map((item) => item.id);
    if (selectedItems.size === filteredItemIds.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredItemIds));
      setShowBulkActions(true);
    }
  };

  // Filtrado de items
  const filteredStockLevels = stockLevels.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || item.status === filters.status;
    const matchesVelocity =
      filters.velocity === "all" || item.velocity === filters.velocity;
    const matchesRisk =
      filters.risk === "all" || item.riskLevel === filters.risk;
    const matchesCategory =
      filters.category === "all" || item.category === filters.category;
    const matchesLocation =
      filters.location === "all" ||
      item.location.warehouse === filters.location;
    const matchesAutoReorder =
      filters.autoReorder === "all" ||
      (filters.autoReorder === "enabled" && item.autoReorder) ||
      (filters.autoReorder === "disabled" && !item.autoReorder);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesVelocity &&
      matchesRisk &&
      matchesCategory &&
      matchesLocation &&
      matchesAutoReorder
    );
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Niveles de Stock
              </h1>
              <p className="text-white/90 text-lg">
                Gestión y optimización de puntos de reorden y niveles de
                inventario
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Selector de vista */}
              <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setActiveView("levels")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "levels"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Niveles
                </button>
                <button
                  onClick={() => setActiveView("analytics")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "analytics"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Análisis
                </button>
                <button
                  onClick={() => setActiveView("recommendations")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "recommendations"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Recomendaciones
                </button>
                <button
                  onClick={() => setActiveView("adjustments")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "adjustments"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Ajustes
                </button>
              </div>

              {/* Acciones rápidas */}
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Ajuste Masivo</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Métricas Principales */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            {/* Total Items */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Items
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.totalItems}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    {formatCurrency(analytics.totalValue)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Rotación Promedio */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Rotación Prom.
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.averageTurnover.toFixed(1)}x
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {analytics.daysOfSupply} días suministro
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Items Críticos */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Críticos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.statusDistribution.critical +
                      analytics.statusDistribution.low}
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Requieren atención
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Recomendaciones
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.activeRecommendations}
                  </p>
                  <p className="text-purple-600 text-sm mt-1">
                    {formatCurrency(analytics.potentialSavings)} ahorro
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Riesgo de Desabasto */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Riesgo Desabasto
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.stockoutRisk.toFixed(1)}%
                  </p>
                  <p className="text-orange-600 text-sm mt-1">
                    {analytics.carryingCost.toFixed(1)}% costo mantenimiento
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Gauge className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista de Niveles */}
        {activeView === "levels" && (
          <>
            {/* Controles y Filtros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${CSS_CLASSES.card} p-6 mb-6`}
            >
              {/* Barra superior */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  {/* Checkbox para seleccionar todo */}
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.size === filteredStockLevels.length &&
                      filteredStockLevels.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedItems.size > 0
                      ? `${selectedItems.size} seleccionados`
                      : "Seleccionar todo"}
                  </span>

                  {showBulkActions && (
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors duration-200">
                        Ajustar Mínimos
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200">
                        Activar Auto-Reorden
                      </button>
                      <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors duration-200">
                        Calcular Óptimos
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                  </div>

                  {/* Botón de filtros */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                      showFilters
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Botón de exportar */}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Panel de filtros expandible */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="optimal">Óptimo</option>
                        <option value="adequate">Adecuado</option>
                        <option value="low">Bajo</option>
                        <option value="critical">Crítico</option>
                        <option value="overstock">Exceso</option>
                        <option value="out_of_stock">Agotado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Velocidad
                      </label>
                      <select
                        value={filters.velocity}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            velocity: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas</option>
                        <option value="fast">Rápida</option>
                        <option value="medium">Media</option>
                        <option value="slow">Lenta</option>
                        <option value="obsolete">Obsoleta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Riesgo
                      </label>
                      <select
                        value={filters.risk}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            risk: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="low">Bajo</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                        <option value="critical">Crítico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Vacunas">Vacunas</option>
                        <option value="Suplementos">Suplementos</option>
                        <option value="Equipos">Equipos</option>
                        <option value="Vitaminas">Vitaminas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas</option>
                        <option value="Farmacia Veterinaria">
                          Farmacia Veterinaria
                        </option>
                        <option value="Almacén de Alimentos">
                          Almacén de Alimentos
                        </option>
                        <option value="Almacén General">Almacén General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Reorden
                      </label>
                      <select
                        value={filters.autoReorder}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            autoReorder: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="enabled">Habilitado</option>
                        <option value="disabled">Deshabilitado</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Lista de Niveles de Stock */}
            <div className="space-y-4">
              {filteredStockLevels.length === 0 ? (
                <div className={`${CSS_CLASSES.card} p-12 text-center`}>
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No se encontraron items
                  </h3>
                  <p className="text-gray-500">
                    Ajusta los filtros para ver más resultados
                  </p>
                </div>
              ) : (
                filteredStockLevels.map((item, index) => {
                  const statusColors = getStatusColor(item.status);
                  const isExpanded = expandedItems.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className={`${CSS_CLASSES.card} border-l-4 ${statusColors.border} ${statusColors.bg} hover:shadow-lg transition-all duration-200`}
                    >
                      <div className="p-6">
                        {/* Header principal */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Checkbox de selección */}
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Icono de estado */}
                            <div className={`mt-1 ${statusColors.icon}`}>
                              {getStatusIcon(item.status)}
                            </div>

                            {/* Información principal */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3
                                  className={`text-lg font-semibold ${statusColors.text}`}
                                >
                                  {item.itemName}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.badge}`}
                                >
                                  {getStatusLabel(item.status)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {item.category}
                                </span>
                                {getVelocityIcon(item.velocity)}
                                <span className="text-xs text-gray-600">
                                  {getVelocityLabel(item.velocity)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                    item.riskLevel
                                  )}`}
                                >
                                  Riesgo {item.riskLevel.toUpperCase()}
                                </span>
                                {item.autoReorder && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Auto-Reorden
                                  </span>
                                )}
                              </div>

                              {/* Información de stock en grid */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Stock Actual:
                                  </span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span
                                      className={`text-lg font-bold ${
                                        item.currentStock <= item.minimumStock
                                          ? "text-red-600"
                                          : item.currentStock >=
                                            item.optimalStock
                                          ? "text-green-600"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {item.currentStock.toLocaleString()}
                                    </span>
                                    <span className="text-gray-600">
                                      unidades
                                    </span>
                                  </div>
                                  {item.reservedStock > 0 && (
                                    <div className="text-xs text-orange-600">
                                      {item.reservedStock} reservadas
                                    </div>
                                  )}
                                  {item.inTransitStock > 0 && (
                                    <div className="text-xs text-blue-600">
                                      {item.inTransitStock} en tránsito
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <span className="font-medium text-gray-700">
                                    Puntos de Control:
                                  </span>
                                  <div className="space-y-1 mt-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Mínimo:</span>
                                      <span className="font-medium">
                                        {item.minimumStock}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Reorden:</span>
                                      <span className="font-medium">
                                        {item.reorderPoint}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Óptimo:</span>
                                      <span className="font-medium">
                                        {item.optimalStock}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Máximo:</span>
                                      <span className="font-medium">
                                        {item.maximumStock}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-700">
                                    Rendimiento:
                                  </span>
                                  <div className="space-y-1 mt-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Rotación:</span>
                                      <span className="font-medium">
                                        {item.turnoverRate.toFixed(1)}x/año
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Demanda:</span>
                                      <span className="font-medium">
                                        {item.averageDemand.toFixed(1)}/mes
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Días stock:</span>
                                      <span className="font-medium">
                                        {item.stockDays}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Servicio:</span>
                                      <span className="font-medium">
                                        {item.serviceLevel}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-700">
                                    Información:
                                  </span>
                                  <div className="space-y-1 mt-1 text-xs">
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{item.location.warehouse}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Package className="w-3 h-3" />
                                      <span>
                                        {item.location.shelf}-
                                        {item.location.position}
                                      </span>
                                    </div>
                                    <div className="font-medium text-gray-900">
                                      {formatCurrency(item.totalValue)}
                                    </div>
                                    {item.nextReorderDate && (
                                      <div className="flex items-center space-x-1 text-blue-600">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          Reorden:{" "}
                                          {formatDate(item.nextReorderDate)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Barra de progreso de stock */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Nivel de Stock
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {Math.round(
                                      (item.currentStock / item.maximumStock) *
                                        100
                                    )}
                                    % del máximo
                                  </span>
                                </div>
                                <div className="relative">
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    {/* Barra principal de stock */}
                                    <div
                                      className={`h-3 rounded-full transition-all duration-300 ${
                                        item.currentStock <= item.minimumStock
                                          ? "bg-red-500"
                                          : item.currentStock <=
                                            item.reorderPoint
                                          ? "bg-yellow-500"
                                          : item.currentStock <=
                                            item.optimalStock
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(
                                          (item.currentStock /
                                            item.maximumStock) *
                                            100,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>

                                  {/* Marcadores de puntos críticos */}
                                  <div className="absolute top-0 h-3 w-full">
                                    {/* Punto mínimo */}
                                    <div
                                      className="absolute top-0 w-0.5 h-3 bg-red-600"
                                      style={{
                                        left: `${
                                          (item.minimumStock /
                                            item.maximumStock) *
                                          100
                                        }%`,
                                      }}
                                    />
                                    {/* Punto de reorden */}
                                    <div
                                      className="absolute top-0 w-0.5 h-3 bg-yellow-600"
                                      style={{
                                        left: `${
                                          (item.reorderPoint /
                                            item.maximumStock) *
                                          100
                                        }%`,
                                      }}
                                    />
                                    {/* Punto óptimo */}
                                    <div
                                      className="absolute top-0 w-0.5 h-3 bg-green-600"
                                      style={{
                                        left: `${
                                          (item.optimalStock /
                                            item.maximumStock) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Leyenda de la barra */}
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                      <span>Mín: {item.minimumStock}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                      <span>Reorden: {item.reorderPoint}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                      <span>Ópt: {item.optimalStock}</span>
                                    </div>
                                  </div>
                                  <span>Máx: {item.maximumStock}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                              <Calculator className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleExpanded(item.id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Sección expandible */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 pt-6 border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Configuración de Auto-Reorden */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Auto-Reorden
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Estado:
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.autoReorder
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {item.autoReorder
                                        ? "Habilitado"
                                        : "Deshabilitado"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Cantidad reorden:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.reorderQuantity} unidades
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Proveedor preferido:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.preferredSupplier}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Tiempo entrega:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.leadTime} días
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Métricas de Rendimiento */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Métricas de Rendimiento
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Rotación anual:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.turnoverRate.toFixed(1)} veces
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Demanda mensual:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.averageDemand.toFixed(1)} unidades
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Nivel de servicio:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {item.serviceLevel}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Días de suministro:
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${
                                        item.stockDays < 30
                                          ? "text-red-600"
                                          : item.stockDays < 60
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {item.stockDays} días
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Información Financiera */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Información Financiera
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Costo unitario:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {formatCurrency(item.unitCost)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Costo promedio:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {formatCurrency(item.averageCost)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Valor total:
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {formatCurrency(item.totalValue)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      Última actualización:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {formatDate(item.lastUpdated)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Notas adicionales */}
                            {item.notes && (
                              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h5 className="font-medium text-blue-900 mb-2">
                                  📝 Notas
                                </h5>
                                <p className="text-sm text-blue-800">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Vista de Análisis */}
        {activeView === "analytics" && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Distribución por Estado */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Distribución por Estado
              </h3>
              <div className="space-y-4">
                {[
                  {
                    status: "Óptimo",
                    count: analytics.statusDistribution.optimal,
                    color: "#22c55e",
                  },
                  {
                    status: "Adecuado",
                    count: analytics.statusDistribution.adequate,
                    color: "#3b82f6",
                  },
                  {
                    status: "Bajo",
                    count: analytics.statusDistribution.low,
                    color: "#f59e0b",
                  },
                  {
                    status: "Crítico",
                    count: analytics.statusDistribution.critical,
                    color: "#ef4444",
                  },
                  {
                    status: "Exceso",
                    count: analytics.statusDistribution.overstock,
                    color: "#8b5cf6",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        (
                        {((item.count / analytics.totalItems) * 100).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Distribución por Velocidad */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Distribución por Velocidad
              </h3>
              <div className="space-y-4">
                {[
                  {
                    velocity: "Rápida",
                    count: analytics.velocityDistribution.fast,
                    color: "#22c55e",
                  },
                  {
                    velocity: "Media",
                    count: analytics.velocityDistribution.medium,
                    color: "#3b82f6",
                  },
                  {
                    velocity: "Lenta",
                    count: analytics.velocityDistribution.slow,
                    color: "#f59e0b",
                  },
                  {
                    velocity: "Obsoleta",
                    count: analytics.velocityDistribution.obsolete,
                    color: "#ef4444",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.velocity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.velocity}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        (
                        {((item.count / analytics.totalItems) * 100).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tendencias */}
            <div className={`${CSS_CLASSES.card} p-6 lg:col-span-2`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Tendencias de Inventario - Últimos 6 Meses
              </h3>

              <div className="grid grid-cols-6 gap-4">
                {analytics.trends.map((trend, index) => (
                  <motion.div
                    key={trend.period}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div className="space-y-2">
                      {/* Valor del inventario */}
                      <div>
                        <div
                          className="w-full bg-blue-500 rounded-t-lg mb-1"
                          style={{
                            height: `${(trend.totalValue / 90000) * 80}px`,
                            minHeight: "20px",
                          }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(trend.totalValue / 1000)}K
                        </div>
                        <div className="text-xs text-gray-600">Valor</div>
                      </div>

                      {/* Rotación */}
                      <div>
                        <div
                          className="w-full bg-green-500 rounded-t-lg mb-1"
                          style={{
                            height: `${(trend.turnover / 12) * 50}px`,
                            minHeight: "15px",
                          }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {trend.turnover.toFixed(1)}x
                        </div>
                        <div className="text-xs text-gray-600">Rotación</div>
                      </div>

                      {/* Desabastos */}
                      <div>
                        <div
                          className="w-full bg-red-500 rounded-t-lg mb-1"
                          style={{
                            height: `${(trend.stockouts / 5) * 30}px`,
                            minHeight: "10px",
                          }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {trend.stockouts}
                        </div>
                        <div className="text-xs text-gray-600">Desabastos</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mt-2 font-medium">
                      {trend.period}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista de Recomendaciones */}
        {activeView === "recommendations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {recommendations.length === 0 ? (
              <div className={`${CSS_CLASSES.card} p-12 text-center`}>
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay recomendaciones activas
                </h3>
                <p className="text-gray-500">
                  El sistema está analizando tu inventario para generar
                  optimizaciones
                </p>
              </div>
            ) : (
              recommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.itemName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            recommendation.priority
                          )}`}
                        >
                          {recommendation.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {recommendation.confidence}% confianza
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {recommendation.impact}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Tipo de ajuste:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.recommendationType
                              .replace("_", " ")
                              .toUpperCase()}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Valor actual → Recomendado:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.currentValue} →{" "}
                            <span className="font-bold text-blue-600">
                              {recommendation.recommendedValue}
                            </span>
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Impacto esperado:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.expectedResult}
                          </p>
                        </div>
                      </div>

                      {recommendation.reasoning &&
                        recommendation.reasoning.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">
                              Razones:
                            </span>
                            <ul className="mt-2 space-y-1">
                              {recommendation.reasoning.map(
                                (reason, reasonIndex) => (
                                  <li
                                    key={reasonIndex}
                                    className="text-sm text-gray-600 flex items-start space-x-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{reason}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">
                            Esfuerzo de implementación:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              recommendation.implementationEffort === "low"
                                ? "bg-green-100 text-green-800"
                                : recommendation.implementationEffort ===
                                  "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {recommendation.implementationEffort.toUpperCase()}
                          </span>
                        </div>

                        {recommendation.potentialSavings && (
                          <div>
                            <span className="font-medium">
                              Ahorro potencial:
                            </span>
                            <span className="ml-2 font-bold text-green-600">
                              {formatCurrency(recommendation.potentialSavings)}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="font-medium">Válido hasta:</span>
                          <span className="ml-2">
                            {formatDate(recommendation.validUntil)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors duration-200">
                        Aplicar
                      </button>
                      <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors duration-200">
                        Revisar
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Vista de Ajustes */}
        {activeView === "adjustments" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${CSS_CLASSES.card} p-6`}
          >
            <div className="text-center py-12">
              <Sliders className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Historial de Ajustes
              </h3>
              <p className="text-gray-500 mb-6">
                Los ajustes realizados a los niveles de stock aparecerán aquí
              </p>
              <button className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-6 py-3 rounded-lg transition-all duration-200">
                Realizar Nuevo Ajuste
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StockLevels;
