import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Plus,
  DollarSign,
  Clock,
  ShoppingCart,
  Archive,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Interfaces para el dashboard de inventario
interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  pendingOrders: number;
  recentMovements: number;
  alertsCount: number;
  topCategories: CategoryStat[];
}

interface CategoryStat {
  category: string;
  itemCount: number;
  totalValue: number;
  percentage: number;
  color: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  expirationDate?: Date;
  lastMovement: Date;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired";
  location: string;
}

interface RecentMovement {
  id: string;
  itemName: string;
  type: "entrada" | "salida" | "ajuste" | "transferencia";
  quantity: number;
  location: string;
  date: Date;
  performedBy: string;
  reason?: string;
}

interface InventoryAlert {
  id: string;
  type: "stock_bajo" | "vencimiento" | "sin_stock" | "sobrestockeado";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  itemName: string;
  createdAt: Date;
  status: "active" | "acknowledged" | "resolved";
}

const InventoryDashboard: React.FC = () => {
  // Estados del componente
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(
    null
  );
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [criticalItems, setCriticalItems] = useState<InventoryItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [] = useState("");
  const [] = useState("all");

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos del backend
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados para el dashboard
        const mockStats: InventoryStats = {
          totalItems: 245,
          totalValue: 85420.5,
          lowStockItems: 12,
          expiringItems: 8,
          pendingOrders: 5,
          recentMovements: 34,
          alertsCount: 6,
          topCategories: [
            {
              category: "Medicamentos",
              itemCount: 45,
              totalValue: 25300,
              percentage: 29.6,
              color: "#ef4444",
            },
            {
              category: "Vacunas",
              itemCount: 38,
              totalValue: 22150,
              percentage: 25.9,
              color: "#22c55e",
            },
            {
              category: "Alimentos",
              itemCount: 52,
              totalValue: 18200,
              percentage: 21.3,
              color: "#f59e0b",
            },
            {
              category: "Suplementos",
              itemCount: 28,
              totalValue: 12800,
              percentage: 15.0,
              color: "#3b82f6",
            },
            {
              category: "Equipos",
              itemCount: 15,
              totalValue: 6970,
              percentage: 8.2,
              color: "#8b5cf6",
            },
          ],
        };

        const mockMovements: RecentMovement[] = [
          {
            id: "1",
            itemName: "Ivermectina 1%",
            type: "entrada",
            quantity: 20,
            location: "Almacén Principal",
            date: new Date("2025-07-12T08:30:00"),
            performedBy: "Dr. García",
            reason: "Compra programada",
          },
          {
            id: "2",
            itemName: "Vacuna Triple Bovina",
            type: "salida",
            quantity: 15,
            location: "Potrero Norte",
            date: new Date("2025-07-12T10:15:00"),
            performedBy: "Veterinario López",
            reason: "Vacunación mensual",
          },
          {
            id: "3",
            itemName: "Concentrado Proteico",
            type: "transferencia",
            quantity: 100,
            location: "Potrero Sur → Corral 3",
            date: new Date("2025-07-11T16:45:00"),
            performedBy: "José Martínez",
            reason: "Redistribución",
          },
        ];

        const mockCriticalItems: InventoryItem[] = [
          {
            id: "1",
            name: "Antibiótico Penicilina",
            category: "Medicamentos",
            currentStock: 5,
            minStock: 15,
            maxStock: 50,
            unit: "frascos",
            costPerUnit: 45.8,
            totalValue: 229,
            expirationDate: new Date("2025-08-15"),
            lastMovement: new Date("2025-07-10"),
            status: "low_stock",
            location: "Farmacia Veterinaria",
          },
          {
            id: "2",
            name: "Desparasitante Oral",
            category: "Medicamentos",
            currentStock: 0,
            minStock: 10,
            maxStock: 30,
            unit: "litros",
            costPerUnit: 120.5,
            totalValue: 0,
            lastMovement: new Date("2025-07-08"),
            status: "out_of_stock",
            location: "Almacén Principal",
          },
        ];

        const mockAlerts: InventoryAlert[] = [
          {
            id: "1",
            type: "stock_bajo",
            priority: "high",
            title: "Stock Bajo - Antibiótico",
            description: "Penicilina por debajo del mínimo requerido",
            itemName: "Antibiótico Penicilina",
            createdAt: new Date("2025-07-12T07:20:00"),
            status: "active",
          },
          {
            id: "2",
            type: "vencimiento",
            priority: "medium",
            title: "Próximo a Vencer",
            description: "Vacuna Triple vence en 15 días",
            itemName: "Vacuna Triple Bovina",
            createdAt: new Date("2025-07-11T14:30:00"),
            status: "active",
          },
        ];

        setInventoryStats(mockStats);
        setRecentMovements(mockMovements);
        setCriticalItems(mockCriticalItems);
        setActiveAlerts(mockAlerts);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedTimeRange]);

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "low_stock":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "out_of_stock":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "expired":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "in_stock":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "low_stock":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "out_of_stock":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "expired":
        return `${baseClasses} bg-red-100 text-red-900`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "salida":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "ajuste":
        return <Settings className="w-4 h-4 text-blue-500" />;
      case "transferencia":
        return <Archive className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-600 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-400 bg-gray-50";
    }
  };

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
        {/* Header del Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Dashboard de Inventario
              </h1>
              <p className="text-white/90 text-lg">
                Gestión y control de inventario de medicamentos, alimentos y
                suministros
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Selector de tiempo */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 backdrop-blur-sm"
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>

              {/* Botón de actualizar */}
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>

              {/* Botón de nuevo item */}
              <button className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nuevo Item</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de Estadísticas Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total de Items */}
          <div className={`${CSS_CLASSES.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {inventoryStats?.totalItems.toLocaleString()}
                </p>
                <p className="text-green-600 text-sm mt-1">+12 este mes</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className={`${CSS_CLASSES.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(inventoryStats?.totalValue || 0)}
                </p>
                <p className="text-green-600 text-sm mt-1">
                  +5.2% vs mes anterior
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Stock Bajo */}
          <div className={`${CSS_CLASSES.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {inventoryStats?.lowStockItems}
                </p>
                <p className="text-red-600 text-sm mt-1">Requiere atención</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Por Vencer */}
          <div className={`${CSS_CLASSES.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Por Vencer</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {inventoryStats?.expiringItems}
                </p>
                <p className="text-orange-600 text-sm mt-1">Próximos 30 días</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenido Principal del Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-8">
            {/* Distribución por Categorías */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${CSS_CLASSES.card} p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Distribución por Categorías
                </h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <PieChart className="w-4 h-4" />
                  <span>Ver Detalle</span>
                </button>
              </div>

              <div className="space-y-4">
                {inventoryStats?.topCategories.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {category.category}
                      </span>
                      <span className="text-gray-600 text-sm">
                        ({category.itemCount} items)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(category.totalValue)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {category.percentage}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Movimientos Recientes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${CSS_CLASSES.card} p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Movimientos Recientes
                </h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>Ver Todos</span>
                </button>
              </div>

              <div className="space-y-4">
                {recentMovements.map((movement, index) => (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="mt-1">
                      {getMovementTypeIcon(movement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {movement.itemName}
                        </h4>
                        <span className="text-sm text-gray-600">
                          {formatDate(movement.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="capitalize">{movement.type}</span> de{" "}
                        {movement.quantity} unidades
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{movement.location}</span>
                        </span>
                        <span>Por: {movement.performedBy}</span>
                      </div>
                      {movement.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          {movement.reason}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-8">
            {/* Alertas Activas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${CSS_CLASSES.card} p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Alertas Activas
                </h3>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {activeAlerts.length}
                </span>
              </div>

              <div className="space-y-4">
                {activeAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`border-l-4 p-4 rounded-r-lg ${getAlertPriorityColor(
                      alert.priority
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {alert.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          {alert.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {alert.itemName} • {formatDate(alert.createdAt)}
                        </p>
                      </div>
                      <Bell className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors duration-200 text-sm">
                Ver Todas las Alertas
              </button>
            </motion.div>

            {/* Items Críticos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${CSS_CLASSES.card} p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Items Críticos
                </h3>
                <button className="text-red-600 hover:text-red-700 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Gestionar</span>
                </button>
              </div>

              <div className="space-y-4">
                {criticalItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </h4>
                          {getStatusIcon(item.status)}
                        </div>
                        <p className="text-gray-600 text-xs mt-1">
                          {item.category} • {item.location}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Stock: {item.currentStock} {item.unit}
                          </span>
                          <span className={getStatusBadge(item.status)}>
                            {item.status === "low_stock"
                              ? "Stock Bajo"
                              : item.status === "out_of_stock"
                              ? "Sin Stock"
                              : item.status === "expired"
                              ? "Vencido"
                              : "En Stock"}
                          </span>
                        </div>
                        {item.expirationDate && (
                          <p className="text-xs text-orange-600 mt-1">
                            Vence: {formatDate(item.expirationDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg transition-colors duration-200 text-sm">
                Ver Reporte Completo
              </button>
            </motion.div>

            {/* Acciones Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`${CSS_CLASSES.card} p-6`}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Acciones Rápidas
              </h3>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Registrar Entrada</span>
                </button>

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Nueva Orden</span>
                </button>

                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Generar Reporte</span>
                </button>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exportar Datos</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
