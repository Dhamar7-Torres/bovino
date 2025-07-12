import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Scale, TrendingUp, Utensils, FileText } from "lucide-react";

// Importar componentes del módulo feeding
import Floors from "./Floors";

// Interfaces para el módulo de alimentación
interface FeedingStats {
  totalPlants: number;
  activeFeedingPlans: number;
  dailyConsumption: number;
  feedCost: number;
  nutritionalCompliance: number;
  pendingFeedings: number;
  alertsCount: number;
  lastUpdate: string;
}

// Componente de estadísticas del header
const HeaderStats: React.FC = () => {
  const [stats, setStats] = useState<FeedingStats>({
    totalPlants: 0,
    activeFeedingPlans: 0,
    dailyConsumption: 0,
    feedCost: 0,
    nutritionalCompliance: 0,
    pendingFeedings: 0,
    alertsCount: 0,
    lastUpdate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Simular carga de estadísticas
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStats({
          totalPlants: 47,
          activeFeedingPlans: 12,
          dailyConsumption: 2850,
          feedCost: 45600,
          nutritionalCompliance: 94,
          pendingFeedings: 8,
          alertsCount: 3,
          lastUpdate: new Date().toLocaleString(),
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-20"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Plantas Registradas</p>
            <p className="text-2xl font-bold text-white">{stats.totalPlants}</p>
          </div>
          <Sprout className="h-8 w-8 text-white/70" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Planes Activos</p>
            <p className="text-2xl font-bold text-white">
              {stats.activeFeedingPlans}
            </p>
          </div>
          <FileText className="h-8 w-8 text-white/70" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Consumo Diario (kg)</p>
            <p className="text-2xl font-bold text-white">
              {stats.dailyConsumption.toLocaleString()}
            </p>
          </div>
          <Scale className="h-8 w-8 text-white/70" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Cumplimiento (%)</p>
            <p className="text-2xl font-bold text-white">
              {stats.nutritionalCompliance}%
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-white/70" />
        </div>
      </motion.div>
    </div>
  );
};

// Componente principal FeedingPage
const FeedingPage: React.FC = () => {
  const location = useLocation();

  // Animaciones para transiciones de página
  const pageTransition = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header del módulo */}
      <div className="relative">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Información del módulo y estadísticas */}
            <div className="flex-1">
              {/* Título del módulo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-4 mb-6"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                    Módulo de Alimentación
                  </h1>
                  <p className="text-white/90 text-lg">
                    Sistema integral para la gestión nutricional del ganado
                  </p>
                </div>
              </motion.div>

              {/* Estadísticas */}
              <HeaderStats />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con animaciones */}
      <div className="relative container mx-auto px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            <Routes>
              {/* Ruta principal - Plantas (Floors) */}
              <Route index element={<Floors />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedingPage;
