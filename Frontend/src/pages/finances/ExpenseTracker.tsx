import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingDown,
  PieChart,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Eye,
  Syringe,
  Utensils,
  Home,
  Truck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

// Interfaces para tipado de datos
interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category:
    | "vacunacion"
    | "tratamientos"
    | "alimentacion"
    | "instalaciones"
    | "transporte"
    | "otros";
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animalId?: string;
  supplier: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod: "efectivo" | "transferencia" | "cheque" | "credito";
}

interface ExpenseCategory {
  name: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

interface MonthlyExpenseData {
  month: string;
  vacunacion: number;
  tratamientos: number;
  alimentacion: number;
  instalaciones: number;
  transporte: number;
  otros: number;
  total: number;
}

interface ExpensePieData {
  name: string;
  value: number;
  color: string;
}

const ExpenseTracker: React.FC = () => {
  // Estados del componente
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [, setShowAddModal] = useState(false);

  // Datos de ejemplo para gastos
  const expenseRecords: ExpenseRecord[] = [
    {
      id: "exp_001",
      date: "2024-06-15",
      description: "Vacuna contra brucelosis - 50 dosis",
      category: "vacunacion",
      amount: 12500,
      location: {
        lat: 17.9895,
        lng: -92.9475,
        address: "Rancho San José, Villahermosa",
      },
      animalId: "cow_015",
      supplier: "Veterinaria La Ganadería",
      status: "paid",
      paymentMethod: "transferencia",
    },
    {
      id: "exp_002",
      date: "2024-06-14",
      description: "Alimento concentrado - 2 toneladas",
      category: "alimentacion",
      amount: 18500,
      location: { lat: 17.9995, lng: -92.9375, address: "Bodega Central" },
      supplier: "Alimentos Pecuarios del Sureste",
      status: "paid",
      paymentMethod: "cheque",
    },
    {
      id: "exp_003",
      date: "2024-06-13",
      description: "Tratamiento antibiótico para mastitis",
      category: "tratamientos",
      amount: 8900,
      location: { lat: 17.9795, lng: -92.9575, address: "Establo 3" },
      animalId: "cow_028",
      supplier: "Farmacia Veterinaria Central",
      status: "pending",
      paymentMethod: "credito",
    },
    {
      id: "exp_004",
      date: "2024-06-12",
      description: "Reparación de cerca perimetral",
      category: "instalaciones",
      amount: 25000,
      location: {
        lat: 17.9695,
        lng: -92.9675,
        address: "Sector Norte del Rancho",
      },
      supplier: "Construcciones Rurales SA",
      status: "overdue",
      paymentMethod: "transferencia",
    },
    {
      id: "exp_005",
      date: "2024-06-11",
      description: "Transporte de ganado al mercado",
      category: "transporte",
      amount: 5500,
      location: {
        lat: 17.9595,
        lng: -92.9775,
        address: "Mercado de Ganado Regional",
      },
      supplier: "Transportes Ganaderos Unidos",
      status: "paid",
      paymentMethod: "efectivo",
    },
  ];

  // Datos para gráfico de gastos mensuales
  const monthlyExpenseData: MonthlyExpenseData[] = [
    {
      month: "Ene",
      vacunacion: 15000,
      tratamientos: 8000,
      alimentacion: 45000,
      instalaciones: 12000,
      transporte: 6000,
      otros: 4000,
      total: 90000,
    },
    {
      month: "Feb",
      vacunacion: 18000,
      tratamientos: 12000,
      alimentacion: 48000,
      instalaciones: 8000,
      transporte: 7000,
      otros: 5000,
      total: 98000,
    },
    {
      month: "Mar",
      vacunacion: 22000,
      tratamientos: 15000,
      alimentacion: 52000,
      instalaciones: 25000,
      transporte: 8000,
      otros: 6000,
      total: 128000,
    },
    {
      month: "Abr",
      vacunacion: 16000,
      tratamientos: 9000,
      alimentacion: 49000,
      instalaciones: 15000,
      transporte: 7500,
      otros: 4500,
      total: 101000,
    },
    {
      month: "May",
      vacunacion: 20000,
      tratamientos: 18000,
      alimentacion: 55000,
      instalaciones: 30000,
      transporte: 9000,
      otros: 8000,
      total: 140000,
    },
    {
      month: "Jun",
      vacunacion: 25000,
      tratamientos: 22000,
      alimentacion: 58000,
      instalaciones: 35000,
      transporte: 10000,
      otros: 7000,
      total: 157000,
    },
  ];

  // Categorías de gastos con colores verdes
  const expenseCategories: ExpenseCategory[] = [
    {
      name: "Alimentación",
      total: 307000,
      count: 48,
      percentage: 42.1,
      color: "from-green-400 to-green-600",
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      name: "Instalaciones",
      total: 125000,
      count: 15,
      percentage: 17.1,
      color: "from-emerald-400 to-emerald-600",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Vacunación",
      total: 116000,
      count: 32,
      percentage: 15.9,
      color: "from-teal-400 to-teal-600",
      icon: <Syringe className="w-5 h-5" />,
    },
    {
      name: "Tratamientos",
      total: 84000,
      count: 24,
      percentage: 11.5,
      color: "from-lime-400 to-lime-600",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      name: "Transporte",
      total: 47500,
      count: 18,
      percentage: 6.5,
      color: "from-green-500 to-green-700",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      name: "Otros",
      total: 34500,
      count: 12,
      percentage: 4.7,
      color: "from-gray-400 to-gray-600",
      icon: <Search className="w-5 h-5" />,
    },
  ];

  // Datos para gráfico de torta con colores verdes
  const pieData: ExpensePieData[] = [
    { name: "Alimentación", value: 42.1, color: "#10B981" },
    { name: "Instalaciones", value: 17.1, color: "#059669" },
    { name: "Vacunación", value: 15.9, color: "#0D9488" },
    { name: "Tratamientos", value: 11.5, color: "#65A30D" },
    { name: "Transporte", value: 6.5, color: "#16A34A" },
    { name: "Otros", value: 4.7, color: "#6B7280" },
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);

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
      vacunacion: "Vacunación",
      tratamientos: "Tratamientos",
      alimentacion: "Alimentación",
      instalaciones: "Instalaciones",
      transporte: "Transporte",
      otros: "Otros",
    };
    return categoryMap[category] || category;
  };

  // Obtener el color del estado
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      paid: "bg-green-500",
      pending: "bg-yellow-500",
      overdue: "bg-red-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  // Obtener el texto del estado
  const getStatusText = (status: string): string => {
    const statusTexts: Record<string, string> = {
      paid: "Pagado",
      pending: "Pendiente",
      overdue: "Vencido",
    };
    return statusTexts[status] || status;
  };

  // Obtener el método de pago
  const getPaymentMethodText = (method: string): string => {
    const methodTexts: Record<string, string> = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      cheque: "Cheque",
      credito: "Crédito",
    };
    return methodTexts[method] || method;
  };

  // Filtrar registros de gastos
  const filteredRecords = expenseRecords.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || record.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calcular totales
  const totalExpenses = expenseCategories.reduce(
    (sum, cat) => sum + cat.total,
    0
  );
  const monthlyAverage = totalExpenses / 6; // 6 meses de datos
  const pendingPayments = expenseRecords
    .filter(
      (record) => record.status === "pending" || record.status === "overdue"
    )
    .reduce((sum, record) => sum + record.amount, 0);

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
        {/* Botones de acción principales */}
        <motion.div
          variants={itemVariants}
          className="flex justify-end space-x-3 mb-6"
        >
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Gasto
          </button>
          <button className="flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg">
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </motion.div>

        {/* Tarjetas de resumen */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {expenseCategories.slice(0, 6).map((category) => (
            <motion.div
              key={category.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
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
                  <p className="text-gray-500 text-xs">
                    {category.percentage}% del total
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por descripción o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                <option value="all">Todas las categorías</option>
                <option value="vacunacion">Vacunación</option>
                <option value="tratamientos">Tratamientos</option>
                <option value="alimentacion">Alimentación</option>
                <option value="instalaciones">Instalaciones</option>
                <option value="transporte">Transporte</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="lg:w-40">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                <option value="all">Todos los estados</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="overdue">Vencido</option>
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

        {/* Gráficos de gastos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de líneas - Tendencia de gastos */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Tendencia de Gastos Mensuales
              </h3>
              <TrendingDown className="w-6 h-6 text-green-500" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyExpenseData}>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#059669"
                  strokeWidth={3}
                  name="Total Gastos"
                />
                <Line
                  type="monotone"
                  dataKey="alimentacion"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Alimentación"
                />
                <Line
                  type="monotone"
                  dataKey="vacunacion"
                  stroke="#0D9488"
                  strokeWidth={2}
                  name="Vacunación"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de torta - Distribución de gastos */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Distribución de Gastos
              </h3>
              <PieChart className="w-6 h-6 text-green-500" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry: ExpensePieData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    color: "#111827",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [`${value}%`, "Porcentaje"]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Gráfico de barras - Gastos por categoría mensual */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Gastos por Categoría - Evolución Mensual
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyExpenseData}>
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
                dataKey="alimentacion"
                fill="#10B981"
                name="Alimentación"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="instalaciones"
                fill="#059669"
                name="Instalaciones"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="vacunacion"
                fill="#0D9488"
                name="Vacunación"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="tratamientos"
                fill="#65A30D"
                name="Tratamientos"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="transporte"
                fill="#16A34A"
                name="Transporte"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="otros"
                fill="#6B7280"
                name="Otros"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabla de registros de gastos */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Registros de Gastos Recientes
            </h3>
            <div className="text-sm text-gray-600">
              {filteredRecords.length} de {expenseRecords.length} registros
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
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Proveedor
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-medium">
                    Monto
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 font-medium">
                    Pago
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
                    <td className="py-4 px-4 text-gray-600">
                      {record.supplier}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 font-semibold">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 text-sm">
                      {getPaymentMethodText(record.paymentMethod)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        ></span>
                        <span className="text-gray-600 text-sm">
                          {getStatusText(record.status)}
                        </span>
                      </div>
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

        {/* Resumen financiero - simplificado sin pie de página */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Gastos Este Mes
              </h4>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(157000)}
              </p>
              <div className="flex items-center justify-center mt-2 text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">+12.1% vs mes anterior</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Promedio Mensual
              </h4>
              <p className="text-3xl font-bold text-teal-600">
                {formatCurrency(monthlyAverage)}
              </p>
              <p className="text-gray-600 text-sm mt-2">últimos 6 meses</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Pagos Pendientes
              </h4>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(pendingPayments)}
              </p>
              <p className="text-gray-600 text-sm mt-2">requieren atención</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExpenseTracker;
