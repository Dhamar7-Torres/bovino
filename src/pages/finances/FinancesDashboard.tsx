import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Syringe,
  AlertTriangle,
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
interface FinancialMetric {
  id: string;
  title: string;
  value: number;
  currency: string;
  change: number;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  vaccinations: number;
  treatments: number;
}

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

const FinancesDashboard: React.FC = () => {
  // Estados para datos del dashboard
  const [selectedPeriod, setSelectedPeriod] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo para métricas financieras con colores verdes
  const financialMetrics: FinancialMetric[] = [
    {
      id: "total-revenue",
      title: "Ingresos Totales",
      value: 125000,
      currency: "MXN",
      change: 12.5,
      changeType: "increase",
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-400 to-green-600",
    },
    {
      id: "vaccination-costs",
      title: "Costos de Vacunación",
      value: 25000,
      currency: "MXN",
      change: -8.2,
      changeType: "decrease",
      icon: <Syringe className="w-6 h-6" />,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "treatment-expenses",
      title: "Gastos en Tratamientos",
      value: 18500,
      currency: "MXN",
      change: 15.3,
      changeType: "increase",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-teal-400 to-teal-600",
    },
    {
      id: "net-profit",
      title: "Ganancia Neta",
      value: 81500,
      currency: "MXN",
      change: 9.7,
      changeType: "increase",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-lime-400 to-lime-600",
    },
  ];

  // Datos para gráfico de líneas - flujo de caja mensual
  const monthlyData: ChartData[] = [
    {
      month: "Ene",
      income: 105000,
      expenses: 45000,
      vaccinations: 12000,
      treatments: 8000,
    },
    {
      month: "Feb",
      income: 112000,
      expenses: 48000,
      vaccinations: 10000,
      treatments: 12000,
    },
    {
      month: "Mar",
      income: 125000,
      expenses: 52000,
      vaccinations: 15000,
      treatments: 9000,
    },
    {
      month: "Abr",
      income: 118000,
      expenses: 49000,
      vaccinations: 11000,
      treatments: 14000,
    },
    {
      month: "May",
      income: 135000,
      expenses: 55000,
      vaccinations: 13000,
      treatments: 7000,
    },
    {
      month: "Jun",
      income: 142000,
      expenses: 58000,
      vaccinations: 16000,
      treatments: 11000,
    },
  ];

  // Datos para gráfico de torta - distribución de gastos con colores verdes
  const expenseCategories: ExpenseCategory[] = [
    { name: "Vacunación", value: 35, color: "#10B981" },
    { name: "Tratamientos", value: 25, color: "#059669" },
    { name: "Alimentación", value: 20, color: "#0D9488" },
    { name: "Instalaciones", value: 15, color: "#65A30D" },
    { name: "Otros", value: 5, color: "#6B7280" },
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
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
  const formatCurrency = (value: number, currency: string = "MXN"): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
        {/* Header del Dashboard */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard Financiero
            </h1>
            <p className="text-white/80 text-lg">
              Control y seguimiento de finanzas ganaderas
            </p>
          </div>

          {/* Selector de período */}
          <div className="flex space-x-2 mt-4 md:mt-0">
            {(["monthly", "quarterly", "yearly"] as const).map(
              (period: "monthly" | "quarterly" | "yearly") => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedPeriod === period
                      ? "bg-white/30 text-white shadow-lg"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {period === "monthly"
                    ? "Mensual"
                    : period === "quarterly"
                    ? "Trimestral"
                    : "Anual"}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Métricas principales */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {financialMetrics.map((metric: FinancialMetric) => (
            <motion.div
              key={metric.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} text-white`}
                >
                  {metric.icon}
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    metric.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {metric.changeType === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>

              <h3 className="text-gray-700 text-sm font-medium mb-1">
                {metric.title}
              </h3>
              <p className="text-gray-900 text-2xl font-bold">
                {formatCurrency(metric.value, metric.currency)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de líneas - Flujo de caja */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Flujo de Caja Mensual
              </h3>
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Ingresos"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Gastos"
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
              <PieChart className="w-6 h-6 text-green-600" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {expenseCategories.map(
                    (entry: ExpenseCategory, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Pie>
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
              </RechartsPieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Gráfico de barras - Costos por categoría */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Análisis de Costos Veterinarios
            </h3>
            <Users className="w-6 h-6 text-green-600" />
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
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
                dataKey="vaccinations"
                fill="#10B981"
                name="Vacunaciones"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="treatments"
                fill="#059669"
                name="Tratamientos"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Footer con resumen */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Total de Animales
              </h4>
              <p className="text-3xl font-bold text-green-600">1,247</p>
              <p className="text-gray-600 text-sm">cabezas de ganado</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Vacunaciones Este Mes
              </h4>
              <p className="text-3xl font-bold text-emerald-600">156</p>
              <p className="text-gray-600 text-sm">
                procedimientos completados
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                ROI Proyectado
              </h4>
              <p className="text-3xl font-bold text-teal-600">24.5%</p>
              <p className="text-gray-600 text-sm">
                retorno de inversión anual
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FinancesDashboard;
