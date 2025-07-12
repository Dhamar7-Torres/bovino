import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

// Interfaces para tipado de datos
interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
}

interface FinancialMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  format: "currency" | "percentage";
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface QuarterlyReport {
  quarter: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  margin: number;
  roi: number;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const ProfitLoss: React.FC = () => {
  // Estados del componente
  const [selectedPeriod, setSelectedPeriod] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [selectedView, setSelectedView] = useState<"profit" | "margin" | "roi">(
    "profit"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  // Datos de ganancias y pérdidas mensuales
  const profitLossData: ProfitLossData[] = [
    {
      month: "Ene",
      revenue: 140000,
      expenses: 90000,
      grossProfit: 50000,
      netProfit: 45000,
      margin: 32.1,
    },
    {
      month: "Feb",
      revenue: 160000,
      expenses: 98000,
      grossProfit: 62000,
      netProfit: 56000,
      margin: 35.0,
    },
    {
      month: "Mar",
      revenue: 185000,
      expenses: 128000,
      grossProfit: 57000,
      netProfit: 52000,
      margin: 28.1,
    },
    {
      month: "Abr",
      revenue: 157000,
      expenses: 101000,
      grossProfit: 56000,
      netProfit: 51000,
      margin: 32.5,
    },
    {
      month: "May",
      revenue: 198000,
      expenses: 140000,
      grossProfit: 58000,
      netProfit: 53000,
      margin: 26.8,
    },
    {
      month: "Jun",
      revenue: 212000,
      expenses: 157000,
      grossProfit: 55000,
      netProfit: 50000,
      margin: 23.6,
    },
  ];

  // Métricas financieras principales
  const financialMetrics: FinancialMetric[] = [
    {
      id: "total-revenue",
      title: "Ingresos Totales",
      value: 1152000,
      change: 18.5,
      changeType: "increase",
      format: "currency",
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-400 to-green-600",
      description: "Ingresos acumulados en 6 meses",
    },
    {
      id: "total-expenses",
      title: "Gastos Totales",
      value: 714000,
      change: 12.3,
      changeType: "increase",
      format: "currency",
      icon: <TrendingDown className="w-6 h-6" />,
      color: "from-red-400 to-red-600",
      description: "Gastos operativos acumulados",
    },
    {
      id: "net-profit",
      title: "Ganancia Neta",
      value: 307000,
      change: 8.7,
      changeType: "increase",
      format: "currency",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-blue-400 to-blue-600",
      description: "Utilidad después de impuestos",
    },
    {
      id: "profit-margin",
      title: "Margen de Ganancia",
      value: 29.6,
      change: -2.4,
      changeType: "decrease",
      format: "percentage",
      icon: <Target className="w-6 h-6" />,
      color: "from-purple-400 to-purple-600",
      description: "Porcentaje de ganancia promedio",
    },
    {
      id: "roi",
      title: "ROI Semestral",
      value: 24.8,
      change: 6.2,
      changeType: "increase",
      format: "percentage",
      icon: <Calculator className="w-6 h-6" />,
      color: "from-orange-400 to-orange-600",
      description: "Retorno sobre inversión",
    },
    {
      id: "break-even",
      title: "Punto de Equilibrio",
      value: 85000,
      change: -5.1,
      changeType: "decrease",
      format: "currency",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-indigo-400 to-indigo-600",
      description: "Ingresos mínimos mensuales",
    },
  ];

  // Reportes trimestrales
  const quarterlyReports: QuarterlyReport[] = [
    {
      quarter: "Q1 2024",
      revenue: 485000,
      expenses: 316000,
      netProfit: 153000,
      margin: 31.5,
      roi: 22.1,
    },
    {
      quarter: "Q2 2024",
      revenue: 567000,
      expenses: 398000,
      netProfit: 154000,
      margin: 27.2,
      roi: 18.9,
    },
    {
      quarter: "Q3 2023",
      revenue: 420000,
      expenses: 285000,
      netProfit: 125000,
      margin: 29.8,
      roi: 19.5,
    },
    {
      quarter: "Q4 2023",
      revenue: 395000,
      expenses: 265000,
      netProfit: 118000,
      margin: 29.9,
      roi: 21.2,
    },
  ];

  // Desglose de costos
  const costBreakdown: CostBreakdown[] = [
    {
      category: "Alimentación",
      amount: 307000,
      percentage: 43.0,
      color: "#F97316",
    },
    {
      category: "Mano de Obra",
      amount: 142000,
      percentage: 19.9,
      color: "#3B82F6",
    },
    {
      category: "Instalaciones",
      amount: 125000,
      percentage: 17.5,
      color: "#EF4444",
    },
    {
      category: "Sanidad Animal",
      amount: 85000,
      percentage: 11.9,
      color: "#8B5CF6",
    },
    {
      category: "Transporte",
      amount: 35000,
      percentage: 4.9,
      color: "#10B981",
    },
    { category: "Otros", amount: 20000, percentage: 2.8, color: "#6B7280" },
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);

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

  // Función para formatear porcentajes
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Función para formatear valores según el tipo
  const formatValue = (
    value: number,
    format: "currency" | "percentage"
  ): string => {
    return format === "currency"
      ? formatCurrency(value)
      : formatPercentage(value);
  };

  // Calcular salud financiera
  const getFinancialHealth = (): {
    status: "excellent" | "good" | "warning" | "poor";
    message: string;
  } => {
    const currentMargin = profitLossData[profitLossData.length - 1].margin;

    if (currentMargin >= 30) {
      return { status: "excellent", message: "Excelente salud financiera" };
    } else if (currentMargin >= 25) {
      return { status: "good", message: "Buena rentabilidad" };
    } else if (currentMargin >= 15) {
      return {
        status: "warning",
        message: "Márgenes en declive - requiere atención",
      };
    } else {
      return {
        status: "poor",
        message: "Márgenes críticos - acción inmediata",
      };
    }
  };

  const financialHealth = getFinancialHealth();

  // Componente de Loading
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header del Estado de Ganancias y Pérdidas */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Estado de Ganancias y Pérdidas
            </h1>
            <p className="text-gray-300 text-lg">
              Análisis integral de rentabilidad y rendimiento financiero
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowDetailedReport(!showDetailedReport)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Reporte Detallado
            </button>
            <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg">
              <Download className="w-5 h-5 mr-2" />
              Exportar PDF
            </button>
          </div>
        </motion.div>

        {/* Indicador de salud financiera */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-full ${
                  financialHealth.status === "excellent"
                    ? "bg-green-500"
                    : financialHealth.status === "good"
                    ? "bg-blue-500"
                    : financialHealth.status === "warning"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {financialHealth.status === "excellent" ||
                financialHealth.status === "good" ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Salud Financiera
                </h3>
                <p className="text-gray-300">{financialHealth.message}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {formatPercentage(
                  profitLossData[profitLossData.length - 1].margin
                )}
              </p>
              <p className="text-gray-300 text-sm">Margen actual</p>
            </div>
          </div>
        </motion.div>

        {/* Métricas financieras principales */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {financialMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}
                >
                  {metric.icon}
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    metric.changeType === "increase"
                      ? "text-green-400"
                      : "text-red-400"
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

              <h3 className="text-gray-300 text-sm font-medium mb-1">
                {metric.title}
              </h3>
              <p className="text-white text-2xl font-bold mb-2">
                {formatValue(metric.value, metric.format)}
              </p>
              <p className="text-gray-400 text-xs">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Controles de vista */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Selector de vista */}
            <div className="flex space-x-2">
              <span className="text-gray-300 font-medium mr-4">Vista:</span>
              {(["profit", "margin", "roi"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedView === view
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {view === "profit"
                    ? "Ganancia"
                    : view === "margin"
                    ? "Margen"
                    : "ROI"}
                </button>
              ))}
            </div>

            {/* Selector de período */}
            <div className="flex space-x-2">
              <span className="text-gray-300 font-medium mr-4">Período:</span>
              {(["monthly", "quarterly", "yearly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedPeriod === period
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {period === "monthly"
                    ? "Mensual"
                    : period === "quarterly"
                    ? "Trimestral"
                    : "Anual"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Gráfico principal - Ingresos vs Gastos vs Ganancia */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Análisis de Rentabilidad Mensual
            </h3>
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={profitLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string) => [
                  name === "margin" ? `${value}%` : formatCurrency(value),
                  name === "revenue"
                    ? "Ingresos"
                    : name === "expenses"
                    ? "Gastos"
                    : name === "netProfit"
                    ? "Ganancia Neta"
                    : "Margen",
                ]}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#10B981"
                name="Ingresos"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#EF4444"
                name="Gastos"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="netProfit"
                fill="#3B82F6"
                name="Ganancia Neta"
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#F59E0B"
                strokeWidth={3}
                yAxisId="right"
                name="Margen %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Análisis trimestral y desglose de costos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparación trimestral */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Evolución Trimestral
              </h3>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={quarterlyReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="quarter" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "margin" || name === "roi"
                      ? `${value}%`
                      : formatCurrency(value),
                    name === "revenue"
                      ? "Ingresos"
                      : name === "netProfit"
                      ? "Ganancia Neta"
                      : name === "margin"
                      ? "Margen"
                      : "ROI",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Ingresos"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stackId="2"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Ganancia Neta"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Desglose de costos */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Desglose de Costos
              </h3>
              <PieChart className="w-6 h-6 text-orange-400" />
            </div>

            <div className="space-y-4">
              {costBreakdown.map((cost) => (
                <div key={cost.category}>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cost.color }}
                    ></div>
                    <span className="text-gray-300">{cost.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatCurrency(cost.amount)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {cost.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reporte detallado (condicional) */}
        {showDetailedReport && (
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Reporte Financiero Detallado
              </h3>
              <FileText className="w-6 h-6 text-purple-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resumen ejecutivo */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Resumen Ejecutivo
                </h4>
                <div className="space-y-3 text-gray-300">
                  <p>
                    • Los ingresos totales del semestre alcanzaron{" "}
                    {formatCurrency(1152000)}
                  </p>
                  <p>• El margen de ganancia promedio fue del 29.6%</p>
                  <p>
                    • La rentabilidad muestra una tendencia estable con
                    variaciones estacionales
                  </p>
                  <p>
                    • Los costos de alimentación representan el 43% del total de
                    gastos
                  </p>
                  <p>
                    • ROI semestral del 24.8% supera las expectativas del sector
                  </p>
                </div>
              </div>

              {/* Recomendaciones */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Recomendaciones
                </h4>
                <div className="space-y-3 text-gray-300">
                  <p>
                    • Optimizar costos de alimentación mediante compras por
                    volumen
                  </p>
                  <p>
                    • Diversificar fuentes de ingresos con productos lácteos
                  </p>
                  <p>• Implementar programa de eficiencia energética</p>
                  <p>
                    • Considerar inversión en tecnología de precision farming
                  </p>
                  <p>
                    • Establecer reserva de emergencia equivalente a 3 meses de
                    gastos
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Proyecciones y objetivos */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Objetivo Anual
              </h4>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(2400000)}
              </p>
              <div className="flex items-center justify-center mt-2 text-green-400">
                <Target className="w-4 h-4 mr-1" />
                <span className="text-sm">48% alcanzado</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Margen Objetivo
              </h4>
              <p className="text-3xl font-bold text-blue-400">32%</p>
              <p className="text-gray-300 text-sm mt-2">meta de rentabilidad</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                ROI Proyectado
              </h4>
              <p className="text-3xl font-bold text-purple-400">28%</p>
              <p className="text-gray-300 text-sm mt-2">
                retorno anual esperado
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Tiempo a Equilibrio
              </h4>
              <p className="text-3xl font-bold text-orange-400">2.8</p>
              <p className="text-gray-300 text-sm mt-2">
                años para recuperar inversión
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfitLoss;
