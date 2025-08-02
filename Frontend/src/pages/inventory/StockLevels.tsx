import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Target,
  Search,
  X,
  Check,
  Clock,
  MapPin,
  Zap,
  Activity,
  Gauge,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Tipos específicos para formularios
interface StockLevelFormData {
  itemName?: string;
  category?: string;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  unitCost?: number;
  location?: {
    warehouse?: string;
    zone?: string;
    shelf?: string;
    position?: string;
  };
  autoReorder?: boolean;
  preferredSupplier?: string;
}

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

const StockLevels: React.FC = () => {
  // Estados del componente
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [analytics, setAnalytics] = useState<StockAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de UI
  const [showNewModal, setShowNewModal] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para formularios
  const [newFormData, setNewFormData] = useState<StockLevelFormData>({
    itemName: "",
    category: "",
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    unitCost: 0,
    location: {
      warehouse: "",
      shelf: "",
      position: "",
    },
    autoReorder: false,
    preferredSupplier: "",
  });

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

        setStockLevels(mockStockLevels);
        setAnalytics(mockAnalytics);
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

  // Funciones de CRUD
  const handleNewItem = () => {
    setNewFormData({
      itemName: "",
      category: "",
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      reorderPoint: 0,
      unitCost: 0,
      location: {
        warehouse: "",
        shelf: "",
        position: "",
      },
      autoReorder: false,
      preferredSupplier: "",
    });
    setShowNewModal(true);
  };

  const handleSaveNew = async () => {
    try {
      // Validar campos requeridos
      if (!newFormData.itemName || !newFormData.category || !newFormData.location?.warehouse) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      // Aquí iría la llamada a la API para crear el nuevo item
      console.log("Creando nuevo item:", newFormData);

      // Simular creación en el estado local
      const newItem: StockLevel = {
        id: Math.random().toString(36).substr(2, 9),
        itemId: `item-${Date.now()}`,
        itemName: newFormData.itemName,
        category: newFormData.category,
        currentStock: newFormData.currentStock || 0,
        availableStock: newFormData.currentStock || 0,
        reservedStock: 0,
        inTransitStock: 0,
        minimumStock: newFormData.minimumStock || 0,
        maximumStock: newFormData.maximumStock || 0,
        reorderPoint: newFormData.reorderPoint || 0,
        safetyStock: Math.round((newFormData.minimumStock || 0) * 0.5),
        optimalStock: Math.round(((newFormData.minimumStock || 0) + (newFormData.maximumStock || 0)) / 2),
        turnoverRate: 0,
        averageDemand: 0,
        leadTime: 7,
        serviceLevel: 95,
        unitCost: newFormData.unitCost || 0,
        totalValue: (newFormData.currentStock || 0) * (newFormData.unitCost || 0),
        averageCost: newFormData.unitCost || 0,
        location: {
          warehouse: newFormData.location?.warehouse || "",
          zone: newFormData.location?.zone,
          shelf: newFormData.location?.shelf || "",
          position: newFormData.location?.position || "",
        },
        status: StockStatus.ADEQUATE,
        riskLevel: RiskLevel.LOW,
        lastMovementDate: new Date(),
        autoReorder: newFormData.autoReorder || false,
        reorderQuantity: newFormData.maximumStock || 0,
        preferredSupplier: newFormData.preferredSupplier || "",
        stockDays: 30,
        velocity: StockVelocity.MEDIUM,
        seasonality: SeasonalPattern.YEAR_ROUND,
        lastUpdated: new Date(),
        updatedBy: "Usuario Actual",
      };

      setStockLevels(prev => [...prev, newItem]);
      setShowNewModal(false);
      setNewFormData({
        itemName: "",
        category: "",
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        reorderPoint: 0,
        unitCost: 0,
        location: {
          warehouse: "",
          shelf: "",
          position: "",
        },
        autoReorder: false,
        preferredSupplier: "",
      });
      
      // Mostrar mensaje de éxito
      alert("Item creado exitosamente");
    } catch (error) {
      console.error("Error creando item:", error);
      alert("Error al crear el item");
    }
  };

  // Filtrado de items
  const filteredStockLevels = stockLevels.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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
              <button
                onClick={handleNewItem}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
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

        {/* Controles y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${CSS_CLASSES.card} p-6 mb-6`}
        >
          {/* Barra superior */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              {/* Espacio reservado para futuras funcionalidades */}
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
            </div>
          </div>
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
                                      : item.currentStock >= item.optimalStock
                                      ? "text-green-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.currentStock.toLocaleString()}
                                </span>
                                <span className="text-gray-600">unidades</span>
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
                                    {item.location.shelf}-{item.location.position}
                                  </span>
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(item.totalValue)}
                                </div>
                                {item.nextReorderDate && (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      Reorden: {formatDate(item.nextReorderDate)}
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
                                  (item.currentStock / item.maximumStock) * 100
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
                                      : item.currentStock <= item.reorderPoint
                                      ? "bg-yellow-500"
                                      : item.currentStock <= item.optimalStock
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (item.currentStock / item.maximumStock) *
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
                                      (item.minimumStock / item.maximumStock) *
                                      100
                                    }%`,
                                  }}
                                />
                                {/* Punto de reorden */}
                                <div
                                  className="absolute top-0 w-0.5 h-3 bg-yellow-600"
                                  style={{
                                    left: `${
                                      (item.reorderPoint / item.maximumStock) *
                                      100
                                    }%`,
                                  }}
                                />
                                {/* Punto óptimo */}
                                <div
                                  className="absolute top-0 w-0.5 h-3 bg-green-600"
                                  style={{
                                    left: `${
                                      (item.optimalStock / item.maximumStock) *
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
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal de Nuevo Item */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nuevo Item de Stock
                  </h2>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Item *
                      </label>
                      <input
                        type="text"
                        value={newFormData.itemName || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            itemName: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        value={newFormData.category || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Vacunas">Vacunas</option>
                        <option value="Suplementos">Suplementos</option>
                        <option value="Equipos">Equipos</option>
                        <option value="Vitaminas">Vitaminas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        value={newFormData.currentStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            currentStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Mínimo *
                      </label>
                      <input
                        type="number"
                        value={newFormData.minimumStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            minimumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Máximo *
                      </label>
                      <input
                        type="number"
                        value={newFormData.maximumStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            maximumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Punto de Reorden *
                      </label>
                      <input
                        type="number"
                        value={newFormData.reorderPoint || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            reorderPoint: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Unitario *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newFormData.unitCost || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            unitCost: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Almacén *
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.warehouse || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: e.target.value,
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estante
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.shelf || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: e.target.value,
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posición
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.position || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor Preferido
                      </label>
                      <input
                        type="text"
                        value={newFormData.preferredSupplier || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            preferredSupplier: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newFormData.autoReorder || false}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            autoReorder: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Auto-Reorden Habilitado
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNew}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Item</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLevels;