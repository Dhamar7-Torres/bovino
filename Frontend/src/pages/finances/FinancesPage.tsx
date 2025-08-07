import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

// Importar los componentes hijos del módulo de finanzas
import IncomeTracker from "./IncomeTracker";
import ExpenseTracker from "./ExpenseTracker";

// Interfaces para tipado
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const FinancesPage: React.FC = () => {
  // Hooks de navegación
  const location = useLocation();
  const navigate = useNavigate();

  // Estados del componente
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
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

  // Definición de navegación del módulo con colores verdes (SIN P&L)
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Vista general del estado financiero",
      color: "from-green-400 to-green-600",
    },
    {
      id: "income-tracker",
      label: "Ingresos",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Seguimiento detallado de ingresos",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "expense-tracker",
      label: "Gastos",
      icon: <TrendingDown className="w-5 h-5" />,
      description: "Control de gastos operativos",
      color: "from-teal-400 to-teal-600",
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

  // Componente de Loading con degradado verde oscuro
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
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
    <div className="min-h-screen bg-green-600">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-screen"
      >
        {/* Header principal del módulo con fondo verde */}
        <motion.div
          variants={itemVariants}
          className="bg-green-500/90 backdrop-blur-md border-b border-green-400 shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* Título y navegación principal */}
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Módulo de Finanzas
                  </h1>
                  <p className="text-white/80 text-sm lg:text-base">
                    Gestión integral de finanzas ganaderas
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación de pestañas con colores verdes */}
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
                      ? "bg-white text-green-700 shadow-lg border border-white"
                      : "bg-white/20 text-white hover:bg-white/30 hover:text-white"
                  }`}
                >
                  <div
                    className={`p-1 rounded ${
                      activeTab === item.id ? `bg-green-100` : "bg-white/20"
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

            {/* Información de actualización simplificada */}
            <div className="mt-4 flex justify-between items-center text-xs text-white/70">
              <div>Última actualización: {formatLastUpdated(lastUpdated)}</div>
              <div className="flex items-center space-x-4">
                <button className="hover:text-white transition-colors duration-200">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenido principal - Sistema de rutas */}
        <div className="flex-1 overflow-auto">
          <Routes>
            {/* Rutas específicas para cada componente */}
            <Route path="income-tracker" element={<IncomeTracker />} />
            <Route path="expense-tracker" element={<ExpenseTracker />} />
            {/* Ruta 404 para rutas no encontradas dentro del módulo */}
          </Routes>
        </div>
      </motion.div>
    </div>
  );
};

export default FinancesPage;