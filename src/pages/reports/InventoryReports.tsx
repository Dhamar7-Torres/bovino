import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  Plus,
  ChevronRight,
  Pill,
  Wrench,
  Wheat,
  Archive,
  ShoppingCart,
  TruckIcon,
  Target,
  Zap,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componentes UI básicos (reemplazando ShadCN)
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}> = ({ children, onClick, disabled, className = "", variant = "default", size = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  }[variant];
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  }[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`rounded-lg border bg-white shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Funciones helper del layout
const getMainBackgroundClasses = () => "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]";
const CSS_CLASSES = {
  titlePrimary: "text-4xl font-bold text-white drop-shadow-sm",
  card: "bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20",
  cardHover: "hover:shadow-xl hover:scale-105 transition-all duration-300",
  buttonPrimary: "bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
};

// Interfaces para los datos de inventario
interface InventoryMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  critical?: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: "medicine" | "supplement" | "equipment" | "feed";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  expirationDate?: Date;
  supplier: string;
  location: {
    warehouse: string;
    section: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  lastMovement: Date;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired" | "near_expiry";
}

interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  unit: string;
  reason: string;
  date: Date;
  responsible: string;
  location: {
    from?: string;
    to: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  cost?: number;
  notes?: string;
}

interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "expiry_warning" | "expired" | "overstock";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  itemIds: string[];
  location: {
    warehouse: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

// Datos de ejemplo (fuera del componente para evitar recreación)
const sampleInventoryItems: InventoryItem[] = [
  {
    id: "item-001",
    name: "Ivermectina 1% Injectable",
    category: "medicine",
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    unit: "frascos",
    unitPrice: 25.50,
    totalValue: 382.50,
    expirationDate: new Date(2025, 11, 30),
    supplier: "Laboratorios Zoetis",
    location: {
      warehouse: "Almacén Principal",
      section: "Medicamentos - Estante A2",
      coordinates: {
        lat: 14.6349,
        lng: -90.5069
      }
    },
    lastMovement: new Date(2025, 5, 10),
    status: "low_stock"
  },
  {
    id: "item-002",
    name: "Concentrado Bovino 18% Proteína",
    category: "feed",
    currentStock: 2500,
    minStock: 1000,
    maxStock: 5000,
    unit: "kg",
    unitPrice: 0.85,
    totalValue: 2125.00,
    supplier: "Alimentos del Campo S.A.",
    location: {
      warehouse: "Bodega de Alimentos",
      section: "Silo 1",
      coordinates: {
        lat: 14.6355,
        lng: -90.5075
      }
    },
    lastMovement: new Date(2025, 5, 15),
    status: "in_stock"
  },
  {
    id: "item-003",
    name: "Jeringas Desechables 20ml",
    category: "equipment",
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: "unidades",
    unitPrice: 1.20,
    totalValue: 300.00,
    supplier: "Suministros Veterinarios Ltda.",
    location: {
      warehouse: "Almacén Veterinario",
      section: "Equipos - Gaveta B1",
      coordinates: {
        lat: 14.6340,
        lng: -90.5080
      }
    },
    lastMovement: new Date(2025, 5, 12),
    status: "in_stock"
  }
];

const sampleMovements: InventoryMovement[] = [
  {
    id: "mov-001",
    itemId: "item-001",
    itemName: "Ivermectina 1% Injectable",
    type: "out",
    quantity: 5,
    unit: "frascos",
    reason: "Aplicación de tratamiento antiparasitario",
    date: new Date(2025, 5, 16),
    responsible: "Dr. Carlos Mendoza",
    location: {
      from: "Almacén Principal",
      to: "Campo - Potrero 3",
      coordinates: {
        lat: 14.6345,
        lng: -90.5070
      }
    },
    cost: 127.50,
    notes: "Tratamiento preventivo para 25 animales"
  },
  {
    id: "mov-002",
    itemId: "item-002",
    itemName: "Concentrado Bovino 18% Proteína",
    type: "in",
    quantity: 1000,
    unit: "kg",
    reason: "Compra - Reposición de stock",
    date: new Date(2025, 5, 15),
    responsible: "Juan Pérez - Encargado de Compras",
    location: {
      to: "Bodega de Alimentos",
      coordinates: {
        lat: 14.6355,
        lng: -90.5075
      }
    },
    cost: 850.00,
    notes: "Factura #AF-2025-0156"
  }
];

const sampleAlerts: InventoryAlert[] = [
  {
    id: "alert-001",
    type: "low_stock",
    priority: "high",
    title: "Stock Bajo de Ivermectina",
    description: "Solo quedan 15 frascos de Ivermectina 1%, por debajo del mínimo requerido",
    itemIds: ["item-001"],
    location: {
      warehouse: "Almacén Principal",
      coordinates: {
        lat: 14.6349,
        lng: -90.5069
      }
    },
    createdAt: new Date(2025, 5, 16),
    status: "active"
  },
  {
    id: "alert-002",
    type: "expiry_warning",
    priority: "medium",
    title: "Medicamentos Próximos a Vencer",
    description: "3 lotes de medicamentos vencen en los próximos 30 días",
    itemIds: ["item-004", "item-005", "item-006"],
    location: {
      warehouse: "Almacén Principal",
      coordinates: {
        lat: 14.6349,
        lng: -90.5069
      }
    },
    createdAt: new Date(2025, 5, 14),
    status: "active"
  }
];

const InventoryReports: React.FC = () => {
  const navigate = useNavigate();

  // Estados del componente
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  // Métricas de inventario
  const inventoryMetrics: InventoryMetric[] = [
    {
      id: "total-items",
      title: "Productos en Stock",
      value: "342",
      change: 5.2,
      trend: "up",
      icon: Package,
      color: "text-blue-600",
      description: "Total de productos disponibles"
    },
    {
      id: "low-stock-items",
      title: "Stock Bajo",
      value: "8",
      change: -12.5,
      trend: "down",
      icon: AlertTriangle,
      color: "text-orange-600",
      description: "Productos por debajo del mínimo",
      critical: true
    },
    {
      id: "inventory-value",
      title: "Valor del Inventario",
      value: "Q89,245",
      change: 8.3,
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      description: "Valor total del stock actual"
    },
    {
      id: "daily-movements",
      title: "Movimientos Hoy",
      value: "15",
      change: 25.0,
      trend: "up",
      icon: TruckIcon,
      color: "text-purple-600",
      description: "Entradas y salidas del día"
    },
    {
      id: "expiring-items",
      title: "Por Vencer (30d)",
      value: "6",
      change: -20.0,
      trend: "down",
      icon: Calendar,
      color: "text-red-600",
      description: "Productos que vencen en 30 días"
    },
    {
      id: "rotation-efficiency",
      title: "Eficiencia de Rotación",
      value: "78.5%",
      change: 3.2,
      trend: "up",
      icon: Activity,
      color: "text-indigo-600",
      description: "Porcentaje de rotación optimal"
    }
  ];

  // Efectos y funciones
  useEffect(() => {
    // Inicializar con datos de ejemplo
    setInventoryItems(sampleInventoryItems);
    setMovements(sampleMovements);
    setAlerts(sampleAlerts);
  }, []);

  const handleRefreshData = () => {
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };


  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-orange-100 text-orange-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "near_expiry":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "medicine":
        return <Pill className="w-5 h-5 text-red-500" />;
      case "supplement":
        return <Shield className="w-5 h-5 text-green-500" />;
      case "equipment":
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case "feed":
        return <Wheat className="w-5 h-5 text-amber-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TruckIcon className="w-4 h-4 text-green-500" />;
      case "out":
        return <ShoppingCart className="w-4 h-4 text-red-500" />;
      case "transfer":
        return <Archive className="w-4 h-4 text-blue-500" />;
      case "adjustment":
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      {/* Contenedor principal */}
      <div className="p-6 space-y-6">
        
        {/* Header del módulo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className={`${CSS_CLASSES.titlePrimary} mb-2`}>
              Reportes de Inventario y Suministros
            </h1>
            <p className="text-white/90 text-lg">
              Control integral de stock, medicamentos, suministros y equipos veterinarios
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRefreshData}
              disabled={isLoading}
              className={`${CSS_CLASSES.buttonPrimary} shadow-lg`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button 
              onClick={() => navigate('/inventory/item/add')}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
            
            <Button 
              onClick={() => navigate('/inventory/movement/add')}
              className="bg-green-500/80 text-white hover:bg-green-500/90 backdrop-blur-sm shadow-lg"
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              Registrar Movimiento
            </Button>
          </div>
        </motion.div>

        {/* Métricas de inventario */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {inventoryMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${CSS_CLASSES.card} p-4 ${CSS_CLASSES.cardHover} ${
                metric.critical ? 'ring-2 ring-orange-400 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : (
                    <Activity className="w-3 h-3 mr-1" />
                  )}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 font-medium text-sm mb-1">
                  {metric.title}
                </p>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sistema de pestañas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-6">
            {/* Navegación de pestañas */}
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg flex flex-wrap gap-1">
              {[
                { id: "overview", label: "Vista General", icon: BarChart3 },
                { id: "medicines", label: "Medicamentos", icon: Pill },
                { id: "supplies", label: "Suministros", icon: Wrench },
                { id: "movements", label: "Movimientos", icon: TruckIcon },
                { id: "alerts", label: "Alertas", icon: AlertTriangle },
                { id: "analytics", label: "Análisis", icon: PieChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido de las pestañas */}
            <div>
              {selectedTab === "overview" && (
                <div className="space-y-6">
                  {/* Resumen general de inventario */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Productos con stock bajo */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Productos con Stock Bajo
                        </CardTitle>
                        <CardDescription>
                          Productos que requieren reposición urgente
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {inventoryItems.filter(item => item.status === 'low_stock').map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getCategoryIcon(item.category)}
                                  <span className="font-medium text-gray-900">
                                    {item.name}
                                  </span>
                                  <Badge className={getStatusBadgeColor(item.status)}>
                                    Stock Bajo
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Stock actual: {item.currentStock} {item.unit} / Mínimo: {item.minStock} {item.unit}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.location.warehouse} - {item.location.section}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button 
                            onClick={() => setSelectedTab("alerts")}
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Todas las Alertas
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Movimientos recientes */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TruckIcon className="w-5 h-5 text-blue-600" />
                          Movimientos Recientes
                        </CardTitle>
                        <CardDescription>
                          Últimas entradas y salidas del inventario
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {movements.slice(0, 5).map((movement) => (
                            <div key={movement.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getMovementTypeIcon(movement.type)}
                                  <span className="font-medium text-gray-900">
                                    {movement.itemName}
                                  </span>
                                  <Badge className={movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {movement.type === 'in' ? 'Entrada' : 
                                     movement.type === 'out' ? 'Salida' : 
                                     movement.type === 'transfer' ? 'Transferencia' : 'Ajuste'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {movement.quantity} {movement.unit} - {movement.reason}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {movement.date.toLocaleDateString()} - {movement.responsible}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button 
                            onClick={() => setSelectedTab("movements")}
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Todos los Movimientos
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertas activas del inventario */}
                  <Card className={`${CSS_CLASSES.card}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Alertas Activas del Inventario
                      </CardTitle>
                      <CardDescription>
                        Notificaciones importantes sobre el estado del inventario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {alerts.filter(alert => alert.status === 'active').map((alert) => (
                          <div key={alert.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(alert.priority)}>
                                  {alert.priority === 'low' ? 'Baja' :
                                   alert.priority === 'medium' ? 'Media' :
                                   alert.priority === 'high' ? 'Alta' : 'Crítica'}
                                </Badge>
                                <span className="font-medium text-gray-900">
                                  {alert.title}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {alert.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  <Package className="w-3 h-3 inline mr-1" />
                                  {alert.itemIds.length} productos afectados
                                </span>
                                <span>
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {alert.location.warehouse}
                                </span>
                                <span>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {alert.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button 
                          onClick={() => setSelectedTab("alerts")}
                          variant="outline" 
                          className="w-full"
                        >
                          Gestionar Todas las Alertas
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTab === "medicines" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-red-600" />
                      Inventario de Medicamentos
                    </CardTitle>
                    <CardDescription>
                      Control especializado de medicamentos veterinarios y fechas de vencimiento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de medicamentos con control de vencimientos, temperaturas de almacenamiento y trazabilidad...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "supplies" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-blue-600" />
                      Suministros y Equipos
                    </CardTitle>
                    <CardDescription>
                      Gestión de herramientas, equipos veterinarios y suministros generales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de suministros con control de mantenimiento, calibraciones y vida útil...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "movements" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TruckIcon className="w-5 h-5 text-green-600" />
                      Registro de Movimientos
                    </CardTitle>
                    <CardDescription>
                      Historial completo de entradas, salidas y transferencias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de movimientos con trazabilidad completa, costos y geolocalización...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "alerts" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Centro de Alertas de Inventario
                    </CardTitle>
                    <CardDescription>
                      Notificaciones automáticas y gestión de alertas críticas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sistema de alertas con notificaciones push, umbrales personalizables y escalamiento...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "analytics" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      Análisis y Estadísticas
                    </CardTitle>
                    <CardDescription>
                      Reportes avanzados, tendencias y optimización del inventario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Rotación de Inventario</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Medicamentos</span>
                              <span className="text-sm font-medium">85.2%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: '85.2%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-2 mt-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Alimentos</span>
                              <span className="text-sm font-medium">92.8%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '92.8%' }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Costo por Categoría</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Medicamentos</span>
                              <span className="text-sm font-medium">Q35,420</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Alimentos</span>
                              <span className="text-sm font-medium">Q28,650</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Equipos</span>
                              <span className="text-sm font-medium">Q18,240</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Suministros</span>
                              <span className="text-sm font-medium">Q6,935</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryReports;