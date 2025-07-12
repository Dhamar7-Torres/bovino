import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Target,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Eye,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";

// Interfaces para tipado de datos
interface IncomeRecord {
  id: string;
  date: string;
  description: string;
  category:
    | "venta_ganado"
    | "productos_lacteos"
    | "servicios_veterinarios"
    | "otros";
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animalId?: string;
  status: "completed" | "pending" | "cancelled";
}

interface IncomeCategory {
  name: string;
  total: number;
  count: number;
  color: string;
  icon: React.ReactNode;
}

interface MonthlyIncomeData {
  month: string;
  ganado: number;
  lacteos: number;
  servicios: number;
  otros: number;
  total: number;
}

const IncomeTracker: React.FC = () => {
  // Estados del componente
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [, setShowAddModal] = useState(false);

  // Datos de ejemplo para ingresos
  const incomeRecords: IncomeRecord[] = [
    {
      id: "inc_001",
      date: "2024-06-15",
      description: "Venta de 5 cabezas de ganado Holstein",
      category: "venta_ganado",
      amount: 125000,
      location: {
        lat: 17.9895,
        lng: -92.9475,
        address: "Rancho San José, Villahermosa",
      },
      animalId: "cow_015",
      status: "completed",
    },
    {
      id: "inc_002",
      date: "2024-06-14",
      description: "Venta de leche orgánica - 500L",
      category: "productos_lacteos",
      amount: 8500,
      location: {
        lat: 17.9995,
        lng: -92.9375,
        address: "Lechería La Esperanza",
      },
      status: "completed",
    },
    {
      id: "inc_003",
      date: "2024-06-13",
      description: "Servicios veterinarios a rancho vecino",
      category: "servicios_veterinarios",
      amount: 15000,
      location: { lat: 17.9795, lng: -92.9575, address: "Rancho El Mirador" },
      status: "completed",
    },
  ];

  // Datos para gráfico de ingresos mensuales
  const monthlyIncomeData: MonthlyIncomeData[] = [
    {
      month: "Ene",
      ganado: 95000,
      lacteos: 25000,
      servicios: 12000,
      otros: 8000,
      total: 140000,
    },
    {
      month: "Feb",
      ganado: 110000,
      lacteos: 28000,
      servicios: 15000,
      otros: 7000,
      total: 160000,
    },
    {
      month: "Mar",
      ganado: 125000,
      lacteos: 30000,
      servicios: 18000,
      otros: 12000,
      total: 185000,
    },
    {
      month: "Abr",
      ganado: 108000,
      lacteos: 26000,
      servicios: 14000,
      otros: 9000,
      total: 157000,
    },
    {
      month: "May",
      ganado: 135000,
      lacteos: 32000,
      servicios: 20000,
      otros: 11000,
      total: 198000,
    },
    {
      month: "Jun",
      ganado: 142000,
      lacteos: 35000,
      servicios: 22000,
      otros: 13000,
      total: 212000,
    },
  ];

  // Categorías de ingresos con colores verdes
  const incomeCategories: IncomeCategory[] = [
    {
      name: "Venta de Ganado",
      total: 680000,
      count: 24,
      color: "from-green-400 to-green-600",
      icon: <Target className="w-5 h-5" />,
    },
    {
      name: "Productos Lácteos",
      total: 176000,
      count: 156,
      color: "from-emerald-400 to-emerald-600",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      name: "Servicios Veterinarios",
      total: 101000,
      count: 32,
      color: "from-teal-400 to-teal-600",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Otros Ingresos",
      total: 55000,
      count: 18,
      color: "from-lime-400 to-lime-600",
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Función para formatear números a moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      venta_ganado: "Venta de Ganado",
      productos_lacteos: "Productos Lácteos",
      servicios_veterinarios: "Servicios Veterinarios",
      otros: "Otros",
    };
    return categoryMap[category] || category;
  };

  // Obtener el color del estado
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  // Filtrar registros de ingresos
  const filteredRecords = incomeRecords.filter((record) => {
    const matchesSearch = record.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header del Seguimiento de Ingresos */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Seguimiento de Ingresos
            </h1>
            <p className="text-white/80 text-lg">
              Control detallado de todos los ingresos del rancho
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ingreso
            </button>
            <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm">
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          </div>
        </motion.div>

        {/* Tarjetas de resumen */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {incomeCategories.map((category) => (
            <motion.div
              key={category.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}
                >
                  {category.icon}
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">
                    {category.count} registros
                  </p>
                </div>
              </div>

              <h3 className="text-gray-700 text-sm font-medium mb-1">
                {category.name}
              </h3>
              <p className="text-gray-900 text-2xl font-bold">
                {formatCurrency(category.total)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                <option value="all">Todas las categorías</option>
                <option value="venta_ganado">Venta de Ganado</option>
                <option value="productos_lacteos">Productos Lácteos</option>
                <option value="servicios_veterinarios">
                  Servicios Veterinarios
                </option>
                <option value="otros">Otros</option>
              </select>
            </div>

            {/* Selector de período */}
            <div className="flex space-x-2">
              {(["weekly", "monthly", "yearly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedPeriod === period
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period === "weekly"
                    ? "Semanal"
                    : period === "monthly"
                    ? "Mensual"
                    : "Anual"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Gráficos de ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de área - Evolución de ingresos */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Evolución de Ingresos
              </h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyIncomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#111827",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Total Ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de barras - Ingresos por categoría */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Ingresos por Categoría
              </h3>
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyIncomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#111827",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="ganado"
                  fill="#10B981"
                  name="Ganado"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="lacteos"
                  fill="#059669"
                  name="Lácteos"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="servicios"
                  fill="#0D9488"
                  name="Servicios"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="otros"
                  fill="#65A30D"
                  name="Otros"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabla de registros de ingresos */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Registros Recientes
            </h3>
            <div className="text-sm text-gray-600">
              {filteredRecords.length} de {incomeRecords.length} registros
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Descripción
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Categoría
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-medium">
                    Monto
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 font-medium">
                    Estado
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <motion.tr
                    key={record.id}
                    whileHover={{
                      backgroundColor: "#F9FAFB",
                    }}
                    className="border-b border-gray-100 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      {record.description}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {getCategoryName(record.category)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 font-semibold">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                          record.status
                        )}`}
                      ></span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Resumen financiero */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Ingresos Este Mes
              </h4>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(212000)}
              </p>
              <div className="flex items-center justify-center mt-2 text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">+12.5% vs mes anterior</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Promedio Diario
              </h4>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(7067)}
              </p>
              <p className="text-gray-600 text-sm mt-2">ingresos por día</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Meta Mensual
              </h4>
              <p className="text-3xl font-bold text-teal-600">89%</p>
              <p className="text-gray-600 text-sm mt-2">de la meta alcanzada</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IncomeTracker;
