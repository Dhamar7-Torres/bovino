import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  CreditCard,
  Calculator,
  ArrowLeft,
  Settings,
  HelpCircle,
  Download,
  Bell,
  Filter,
  RefreshCw,
} from "lucide-react";

// Importar los componentes hijos del módulo de finanzas
import FinancesDashboard from "./FinancesDashboard";
import IncomeTracker from "./IncomeTracker";
import ExpenseTracker from "./ExpenseTracker";
import ProfitLoss from "./ProfitLoss";

// Interfaces para tipado
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface QuickStat {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
  color: string;
}

const FinancesPage: React.FC = () => {
  // Hooks de navegación
  const location = useLocation();
  const navigate = useNavigate();

  // Estados del componente
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickStats, setShowQuickStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Efecto para detectar la ruta actual y establecer el tab correcto
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.includes("/finances/dashboard")) {
      setActiveTab("dashboard");
    } else if (currentPath.includes("/finances/income-tracker")) {
      setActiveTab("income-tracker");
    } else if (currentPath.includes("/finances/expense-tracker")) {
      setActiveTab("expense-tracker");
    } else if (currentPath.includes("/finances/profit-loss")) {
      setActiveTab("profit-loss");
    } else if (currentPath === "/finances" || currentPath === "/finances/") {
      // Si está en la ruta base, establecer dashboard pero NO navegar automáticamente
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  // Función para manejar cambio de tab y navegación
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/finances/${tabId}`);
  };

  // Definición de navegación del módulo - RUTAS CORREGIDAS PARA COINCIDIR CON SIDEBAR
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Vista general del estado financiero",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "income-tracker",
      label: "Ingresos",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Seguimiento detallado de ingresos",
      color: "from-green-400 to-green-600",
    },
    {
      id: "expense-tracker",
      label: "Gastos",
      icon: <TrendingDown className="w-5 h-5" />,
      description: "Control de gastos operativos",
      color: "from-red-400 to-red-600",
    },
    {
      id: "profit-loss",
      label: "P&L",
      icon: <PieChart className="w-5 h-5" />,
      description: "Estado de ganancias y pérdidas",
      color: "from-purple-400 to-purple-600",
    },
  ];

  // Estadísticas rápidas para mostrar en el header
  const quickStats: QuickStat[] = [
    {
      title: "Ingresos del Mes",
      value: "$212,000",
      change: "+12.5%",
      changeType: "positive",
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-green-400",
    },
    {
      title: "Gastos del Mes",
      value: "$157,000",
      change: "+8.2%",
      changeType: "negative",
      icon: <CreditCard className="w-4 h-4" />,
      color: "text-red-400",
    },
    {
      title: "Ganancia Neta",
      value: "$55,000",
      change: "+23.6%",
      changeType: "positive",
      icon: <Calculator className="w-4 h-4" />,
      color: "text-blue-400",
    },
  ];

  // Efecto para simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para actualizar timestamp cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
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

  const tabVariants: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Función para formatear tiempo
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para manejar actualización manual
  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Componente de Loading
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-screen"
      >
        {/* Header principal del módulo */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* Título y navegación principal */}
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Módulo de Finanzas
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Gestión integral de finanzas ganaderas
                  </p>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              {showQuickStats && (
                <div className="flex flex-wrap gap-4">
                  {quickStats.map((stat) => (
                    <motion.div
                      key={stat.title}
                      variants={itemVariants}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[140px] border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className={stat.color}>{stat.icon}</div>
                        <span
                          className={`text-xs font-medium ${
                            stat.changeType === "positive"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-gray-800 font-semibold text-sm">
                          {stat.value}
                        </p>
                        <p className="text-gray-600 text-xs">{stat.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Controles del header */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-700 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                </motion.button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200">
                  <Bell className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200">
                  <Filter className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200">
                  <Download className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200">
                  <Settings className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Navegación de pestañas */}
            <div className="mt-6 flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  variants={tabVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg border border-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800"
                  }`}
                >
                  <div
                    className={`p-1 rounded ${
                      activeTab === item.id ? `bg-white/20` : "bg-gray-300"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Información de actualización */}
            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
              <div>Última actualización: {formatLastUpdated(lastUpdated)}</div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowQuickStats(!showQuickStats)}
                  className="hover:text-gray-200 transition-colors duration-200"
                >
                  {showQuickStats ? "Ocultar" : "Mostrar"} estadísticas
                </button>
                <button className="hover:text-gray-200 transition-colors duration-200">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenido principal - Sistema de rutas */}
        <div className="flex-1 overflow-auto">
          <Routes>
            {/* Ruta por defecto - redirige al dashboard SOLO si está en /finances exacto */}
            <Route index element={<FinancesDashboard />} />

            {/* Rutas específicas para cada componente */}
            <Route path="dashboard" element={<FinancesDashboard />} />
            <Route path="income-tracker" element={<IncomeTracker />} />
            <Route path="expense-tracker" element={<ExpenseTracker />} />
            <Route path="profit-loss" element={<ProfitLoss />} />

            {/* Ruta 404 para rutas no encontradas dentro del módulo */}
            <Route path="*" element={<FinancesDashboard />} />
          </Routes>
        </div>

        {/* Footer del módulo */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-3"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>© 2024 Sistema de Gestión Ganadera</span>
              <span>•</span>
              <span>Módulo de Finanzas v2.1.0</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Estado: Operativo</span>
              <span>•</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Conectado
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FinancesPage;
