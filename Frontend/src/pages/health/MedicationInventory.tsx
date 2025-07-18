import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Plus,
  TrendingDown,
  BarChart3,
  DollarSign,
  Clock,
  Eye,
  Edit,
  ShoppingCart,
  Truck,
  Archive,
  AlertCircle,
  MapPin,
  User,
  FileText,
  Download,
  Settings,
} from "lucide-react";

// Interfaces para tipos de datos
interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category:
    | "antibiotic"
    | "vaccine"
    | "antiparasitic"
    | "antiinflammatory"
    | "vitamin"
    | "hormone"
    | "anesthetic"
    | "other";
  manufacturer: string;
  supplier: string;
  description: string;
  activeIngredient: string;
  concentration: string;
  presentation:
    | "injectable"
    | "oral"
    | "topical"
    | "powder"
    | "tablet"
    | "suspension";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: {
    warehouse: string;
    shelf: string;
    position: string;
  };
  expirationDate: Date;
  batchNumber: string;
  registrationNumber: string;
  storageConditions: string;
  withdrawalPeriod?: number; // días
  requiresPrescription: boolean;
  isControlled: boolean;
  lastUpdated: Date;
  status:
    | "available"
    | "low_stock"
    | "out_of_stock"
    | "expired"
    | "near_expiry";
}

interface InventoryMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type:
    | "purchase"
    | "usage"
    | "adjustment"
    | "transfer"
    | "disposal"
    | "return";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  reason: string;
  animalId?: string;
  animalName?: string;
  veterinarian?: string;
  supplier?: string;
  batchNumber?: string;
  expirationDate?: Date;
  location: string;
  performedBy: string;
  notes: string;
  referenceDocument?: string;
}

interface InventoryStats {
  totalMedications: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
  categoriesCount: number;
  monthlyConsumption: number;
  averageStockDays: number;
}

interface ExpiryAlert {
  id: string;
  medicationName: string;
  batchNumber: string;
  expirationDate: Date;
  currentStock: number;
  daysToExpiry: number;
  priority: "high" | "medium" | "low";
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-gray-600 mt-1">{children}</p>;

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant: string;
  className?: string;
}> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "near_expiry":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "antibiotic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "vaccine":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "antiparasitic":
        return "bg-green-100 text-green-800 border-green-200";
      case "antiinflammatory":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "vitamin":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "hormone":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "anesthetic":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Componente de Alerta de Vencimiento
const ExpiryAlertCard: React.FC<{ alert: ExpiryAlert }> = ({ alert }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return AlertTriangle;
      case "medium":
        return AlertCircle;
      case "low":
        return Clock;
      default:
        return Clock;
    }
  };

  const Icon = getPriorityIcon(alert.priority);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.priority === "high"
          ? "border-red-500 bg-red-50"
          : alert.priority === "medium"
          ? "border-yellow-500 bg-yellow-50"
          : "border-blue-500 bg-blue-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`w-5 h-5 ${
            alert.priority === "high"
              ? "text-red-600"
              : alert.priority === "medium"
              ? "text-yellow-600"
              : "text-blue-600"
          } flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.medicationName}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p>Lote: {alert.batchNumber}</p>
            <p>Vence: {alert.expirationDate.toLocaleDateString()}</p>
            <p>Stock: {alert.currentStock} unidades</p>
            <p className="font-medium">
              {alert.daysToExpiry > 0
                ? `${alert.daysToExpiry} días restantes`
                : "VENCIDO"}
            </p>
          </div>
        </div>
        <Badge variant={alert.priority}>
          {alert.priority === "high"
            ? "Urgente"
            : alert.priority === "medium"
            ? "Atención"
            : "Información"}
        </Badge>
      </div>
    </motion.div>
  );
};

const MedicationInventory: React.FC = () => {
  // Estados del componente
  const [medications, setMedications] = useState<Medication[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalMedications: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0,
    nearExpiryItems: 0,
    categoriesCount: 0,
    monthlyConsumption: 0,
    averageStockDays: 0,
  });
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showMovements, setShowMovements] = useState(false);

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para medicamentos
      const mockMedications: Medication[] = [
        {
          id: "1",
          name: "Penicilina G Procaínica",
          genericName: "Penicilina",
          category: "antibiotic",
          manufacturer: "Laboratorios Veterinarios SA",
          supplier: "Distribuidora Animal Health",
          description:
            "Antibiótico de amplio espectro para infecciones bacterianas",
          activeIngredient: "Penicilina G Procaínica",
          concentration: "300,000 UI/ml",
          presentation: "injectable",
          currentStock: 15,
          minStock: 5,
          maxStock: 50,
          unit: "frascos 100ml",
          unitCost: 45.5,
          totalValue: 682.5,
          location: {
            warehouse: "Almacén Principal",
            shelf: "A-2",
            position: "03",
          },
          expirationDate: new Date("2025-12-15"),
          batchNumber: "PEN-2024-089",
          registrationNumber: "SENASA-001234",
          storageConditions: "Refrigeración 2-8°C",
          withdrawalPeriod: 14,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-10"),
          status: "available",
        },
        {
          id: "2",
          name: "Vacuna Triple Bovina",
          category: "vaccine",
          manufacturer: "BioVet Labs",
          supplier: "Suministros Pecuarios",
          description: "Vacuna contra IBR, BVD y PI3",
          activeIngredient: "Virus inactivados IBR, BVD, PI3",
          concentration: "1 dosis/2ml",
          presentation: "injectable",
          currentStock: 3,
          minStock: 10,
          maxStock: 100,
          unit: "frascos 50 dosis",
          unitCost: 125.0,
          totalValue: 375.0,
          location: {
            warehouse: "Almacén Principal",
            shelf: "B-1",
            position: "07",
          },
          expirationDate: new Date("2025-08-20"),
          batchNumber: "VAC-2024-156",
          registrationNumber: "SENASA-005678",
          storageConditions: "Refrigeración 2-8°C, no congelar",
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-08"),
          status: "low_stock",
        },
        {
          id: "3",
          name: "Ivermectina 1%",
          category: "antiparasitic",
          manufacturer: "PharmaVet",
          supplier: "Distribuidora Animal Health",
          description: "Antiparasitario interno y externo",
          activeIngredient: "Ivermectina",
          concentration: "10mg/ml",
          presentation: "injectable",
          currentStock: 8,
          minStock: 5,
          maxStock: 30,
          unit: "frascos 50ml",
          unitCost: 28.75,
          totalValue: 230.0,
          location: {
            warehouse: "Almacén Principal",
            shelf: "A-3",
            position: "12",
          },
          expirationDate: new Date("2025-07-25"),
          batchNumber: "IVE-2024-203",
          registrationNumber: "SENASA-009876",
          storageConditions: "Temperatura ambiente, proteger de luz",
          withdrawalPeriod: 28,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-11"),
          status: "near_expiry",
        },
        {
          id: "4",
          name: "Meloxicam 2%",
          category: "antiinflammatory",
          manufacturer: "VetPharm Solutions",
          supplier: "Suministros Pecuarios",
          description: "Antiinflamatorio no esteroideo",
          activeIngredient: "Meloxicam",
          concentration: "20mg/ml",
          presentation: "injectable",
          currentStock: 0,
          minStock: 3,
          maxStock: 20,
          unit: "frascos 100ml",
          unitCost: 67.25,
          totalValue: 0,
          location: {
            warehouse: "Almacén Principal",
            shelf: "C-1",
            position: "05",
          },
          expirationDate: new Date("2026-03-10"),
          batchNumber: "MEL-2024-445",
          registrationNumber: "SENASA-012345",
          storageConditions: "Temperatura ambiente",
          withdrawalPeriod: 5,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-09"),
          status: "out_of_stock",
        },
        {
          id: "5",
          name: "Complejo B + Hierro",
          category: "vitamin",
          manufacturer: "NutriVet",
          supplier: "Distribuidora Animal Health",
          description: "Complejo vitamínico con hierro",
          activeIngredient: "Vitaminas B1, B6, B12 + Hierro",
          concentration: "Multivitamínico",
          presentation: "injectable",
          currentStock: 22,
          minStock: 8,
          maxStock: 40,
          unit: "frascos 50ml",
          unitCost: 18.9,
          totalValue: 415.8,
          location: {
            warehouse: "Almacén Principal",
            shelf: "D-2",
            position: "18",
          },
          expirationDate: new Date("2026-01-30"),
          batchNumber: "VIT-2024-678",
          registrationNumber: "SENASA-054321",
          storageConditions: "Proteger de luz y humedad",
          requiresPrescription: false,
          isControlled: false,
          lastUpdated: new Date("2025-07-12"),
          status: "available",
        },
      ];

      // Datos de ejemplo para movimientos
      const mockMovements: InventoryMovement[] = [
        {
          id: "1",
          medicationId: "1",
          medicationName: "Penicilina G Procaínica",
          type: "usage",
          quantity: -2,
          date: new Date("2025-07-10"),
          reason: "Tratamiento mastitis",
          animalId: "COW002",
          animalName: "Luna",
          veterinarian: "Dr. López",
          batchNumber: "PEN-2024-089",
          location: "Establo B",
          performedBy: "Dr. López",
          notes: "Aplicación según protocolo de mastitis",
        },
        {
          id: "2",
          medicationId: "2",
          medicationName: "Vacuna Triple Bovina",
          type: "purchase",
          quantity: 5,
          unitCost: 125.0,
          totalCost: 625.0,
          date: new Date("2025-07-08"),
          reason: "Reposición de stock",
          supplier: "Suministros Pecuarios",
          batchNumber: "VAC-2024-156",
          expirationDate: new Date("2025-08-20"),
          location: "Almacén Principal",
          performedBy: "Admin",
          notes: "Compra de emergencia por bajo stock",
          referenceDocument: "FAC-2025-00456",
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: InventoryStats = {
        totalMedications: 48,
        totalValue: 15750.3,
        lowStockItems: 8,
        expiredItems: 2,
        nearExpiryItems: 5,
        categoriesCount: 7,
        monthlyConsumption: 3245.8,
        averageStockDays: 45,
      };

      // Alertas de vencimiento
      const mockAlerts: ExpiryAlert[] = [
        {
          id: "1",
          medicationName: "Ivermectina 1%",
          batchNumber: "IVE-2024-203",
          expirationDate: new Date("2025-07-25"),
          currentStock: 8,
          daysToExpiry: 13,
          priority: "medium",
        },
        {
          id: "2",
          medicationName: "Vacuna Triple Bovina",
          batchNumber: "VAC-2024-156",
          expirationDate: new Date("2025-08-20"),
          currentStock: 3,
          daysToExpiry: 39,
          priority: "low",
        },
      ];

      setMedications(mockMedications);
      setMovements(mockMovements);
      setStats(mockStats);
      setExpiryAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar medicamentos
  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || med.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || med.status === selectedStatus;
    const matchesLocation =
      selectedLocation === "all" || med.location.warehouse === selectedLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inventario de Medicamentos
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión y control de medicamentos veterinarios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMovements(!showMovements)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showMovements ? "Inventario" : "Movimientos"}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Medicamento
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Vencimiento */}
        {expiryAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-white/80 backdrop-blur-md border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Alertas de Vencimiento
                </CardTitle>
                <CardDescription>
                  Medicamentos próximos a vencer o que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiryAlerts.map((alert) => (
                    <ExpiryAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas del Inventario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Medicamentos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalMedications}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Valor Total
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${stats.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Stock Bajo
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.lowStockItems}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Por Vencer
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.nearExpiryItems}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Medicamento, principio activo..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="antibiotic">Antibióticos</option>
                    <option value="vaccine">Vacunas</option>
                    <option value="antiparasitic">Antiparasitarios</option>
                    <option value="antiinflammatory">Antiinflamatorios</option>
                    <option value="vitamin">Vitaminas</option>
                    <option value="hormone">Hormonas</option>
                    <option value="anesthetic">Anestésicos</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="available">Disponible</option>
                    <option value="low_stock">Stock bajo</option>
                    <option value="out_of_stock">Sin stock</option>
                    <option value="near_expiry">Por vencer</option>
                    <option value="expired">Vencido</option>
                  </select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">Todas las ubicaciones</option>
                    <option value="Almacén Principal">Almacén Principal</option>
                    <option value="Almacén Secundario">
                      Almacén Secundario
                    </option>
                    <option value="Refrigerador">Refrigerador</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Generar Orden de Compra
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="w-4 h-4 mr-2" />
                  Registrar Recepción
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Dar de Baja
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Reporte de Inventario
                </Button>
              </CardContent>
            </Card>

            {/* Estadísticas Adicionales */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Categorías:</span>
                  <span className="font-medium">{stats.categoriesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Consumo mensual:
                  </span>
                  <span className="font-medium">
                    ${stats.monthlyConsumption.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Días promedio stock:
                  </span>
                  <span className="font-medium">{stats.averageStockDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Artículos vencidos:
                  </span>
                  <span className="font-medium text-red-600">
                    {stats.expiredItems}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Medicamentos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <AnimatePresence mode="wait">
              {!showMovements ? (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                    <CardHeader>
                      <CardTitle>
                        Inventario de Medicamentos ({filteredMedications.length}
                        )
                      </CardTitle>
                      <CardDescription>
                        Lista detallada de todos los medicamentos en inventario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredMedications.map((med) => (
                          <motion.div
                            key={med.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {med.name}
                                  </h4>
                                  <Badge variant={med.category}>
                                    {med.category === "antibiotic"
                                      ? "Antibiótico"
                                      : med.category === "vaccine"
                                      ? "Vacuna"
                                      : med.category === "antiparasitic"
                                      ? "Antiparasitario"
                                      : med.category === "antiinflammatory"
                                      ? "Antiinflamatorio"
                                      : med.category === "vitamin"
                                      ? "Vitamina"
                                      : med.category === "hormone"
                                      ? "Hormona"
                                      : med.category === "anesthetic"
                                      ? "Anestésico"
                                      : "Otro"}
                                  </Badge>
                                  <Badge variant={med.status}>
                                    {med.status === "available"
                                      ? "Disponible"
                                      : med.status === "low_stock"
                                      ? "Stock bajo"
                                      : med.status === "out_of_stock"
                                      ? "Sin stock"
                                      : med.status === "near_expiry"
                                      ? "Por vencer"
                                      : "Vencido"}
                                  </Badge>
                                  {med.requiresPrescription && (
                                    <Badge variant="other">Receta</Badge>
                                  )}
                                </div>

                                <p className="text-gray-600 mb-3">
                                  {med.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                                  <div>
                                    <p className="text-gray-600">
                                      Principio activo:
                                    </p>
                                    <p className="font-medium">
                                      {med.activeIngredient}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Concentración:
                                    </p>
                                    <p className="font-medium">
                                      {med.concentration}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Presentación:
                                    </p>
                                    <p className="font-medium">
                                      {med.presentation === "injectable"
                                        ? "Inyectable"
                                        : med.presentation === "oral"
                                        ? "Oral"
                                        : med.presentation === "topical"
                                        ? "Tópico"
                                        : med.presentation === "powder"
                                        ? "Polvo"
                                        : med.presentation === "tablet"
                                        ? "Tableta"
                                        : "Suspensión"}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                                  <div>
                                    <p className="text-gray-600">
                                      Stock actual:
                                    </p>
                                    <p
                                      className={`font-bold text-lg ${
                                        med.currentStock <= med.minStock
                                          ? "text-red-600"
                                          : med.currentStock <=
                                            med.minStock * 1.5
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {med.currentStock} {med.unit}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Stock mínimo:
                                    </p>
                                    <p className="font-medium">
                                      {med.minStock} {med.unit}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Costo unitario:
                                    </p>
                                    <p className="font-medium">
                                      ${med.unitCost.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Valor total:
                                    </p>
                                    <p className="font-medium">
                                      ${med.totalValue.toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                                  <div>
                                    <p className="text-gray-600">Ubicación:</p>
                                    <p className="font-medium">
                                      {med.location.warehouse} -{" "}
                                      {med.location.shelf}-
                                      {med.location.position}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Lote:</p>
                                    <p className="font-medium">
                                      {med.batchNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Vencimiento:
                                    </p>
                                    <p
                                      className={`font-medium ${
                                        new Date(med.expirationDate).getTime() -
                                          new Date().getTime() <
                                        30 * 24 * 60 * 60 * 1000
                                          ? "text-red-600"
                                          : new Date(
                                              med.expirationDate
                                            ).getTime() -
                                              new Date().getTime() <
                                            60 * 24 * 60 * 60 * 1000
                                          ? "text-yellow-600"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {med.expirationDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                  <p>
                                    <strong>Fabricante:</strong>{" "}
                                    {med.manufacturer}
                                  </p>
                                  <p>
                                    <strong>Proveedor:</strong> {med.supplier}
                                  </p>
                                  <p>
                                    <strong>
                                      Condiciones de almacenamiento:
                                    </strong>{" "}
                                    {med.storageConditions}
                                  </p>
                                  {med.withdrawalPeriod && (
                                    <p>
                                      <strong>Período de retiro:</strong>{" "}
                                      {med.withdrawalPeriod} días
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="success" size="sm">
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="movements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                    <CardHeader>
                      <CardTitle>
                        Movimientos de Inventario ({movements.length})
                      </CardTitle>
                      <CardDescription>
                        Historial de entradas, salidas y ajustes de inventario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {movements.map((movement) => (
                          <motion.div
                            key={movement.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {movement.medicationName}
                                  </h4>
                                  <Badge
                                    variant={
                                      movement.type === "purchase"
                                        ? "success"
                                        : movement.type === "usage"
                                        ? "warning"
                                        : "other"
                                    }
                                  >
                                    {movement.type === "purchase"
                                      ? "Compra"
                                      : movement.type === "usage"
                                      ? "Uso"
                                      : movement.type === "adjustment"
                                      ? "Ajuste"
                                      : movement.type === "transfer"
                                      ? "Transferencia"
                                      : movement.type === "disposal"
                                      ? "Descarte"
                                      : "Devolución"}
                                  </Badge>
                                  <span
                                    className={`text-lg font-bold ${
                                      movement.quantity > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {movement.quantity > 0 ? "+" : ""}
                                    {movement.quantity}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>
                                      {movement.date.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>{movement.performedBy}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{movement.location}</span>
                                  </div>
                                </div>

                                <p className="text-gray-600 mb-2">
                                  <strong>Motivo:</strong> {movement.reason}
                                </p>

                                {movement.notes && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Notas:</strong> {movement.notes}
                                  </p>
                                )}

                                {movement.animalName && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Animal:</strong>{" "}
                                    {movement.animalName} ({movement.animalId})
                                  </p>
                                )}

                                {movement.supplier && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Proveedor:</strong>{" "}
                                    {movement.supplier}
                                  </p>
                                )}

                                {movement.totalCost && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Costo total:</strong> $
                                    {movement.totalCost.toLocaleString()}
                                  </p>
                                )}

                                {movement.batchNumber && (
                                  <p className="text-gray-600">
                                    <strong>Lote:</strong>{" "}
                                    {movement.batchNumber}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MedicationInventory;
