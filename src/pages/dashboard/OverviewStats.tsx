import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Heart,
  Shield,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";

// Interfaz para las estadísticas principales
interface StatCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend: number;
  color: string;
  bgGradient: string;
}

// Interfaz para eventos recientes
interface RecentEvent {
  id: string;
  type: "vaccination" | "health_check" | "treatment";
  animal_id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  date: string;
  status: "completed" | "pending" | "overdue";
}

const OverviewStats: React.FC = () => {
  // Estados para manejo de datos y animaciones
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulación de carga de datos (en producción vendría del backend)
  useEffect(() => {
    const loadData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos estadísticos simulados
      const mockStats: StatCardData[] = [
        {
          title: "Total Livestock",
          value: 247,
          subtitle: "Active animals",
          icon: <Users className="w-6 h-6" />,
          trend: 5.2,
          color: "text-blue-600",
          bgGradient: "from-blue-500/20 to-blue-600/5",
        },
        {
          title: "Health Status",
          value: "94%",
          subtitle: "Healthy animals",
          icon: <Heart className="w-6 h-6" />,
          trend: 2.1,
          color: "text-green-600",
          bgGradient: "from-green-500/20 to-green-600/5",
        },
        {
          title: "Vaccinations",
          value: 189,
          subtitle: "This month",
          icon: <Shield className="w-6 h-6" />,
          trend: 12.5,
          color: "text-purple-600",
          bgGradient: "from-purple-500/20 to-purple-600/5",
        },
        {
          title: "Productivity",
          value: "87%",
          subtitle: "Above target",
          icon: <TrendingUp className="w-6 h-6" />,
          trend: 8.3,
          color: "text-orange-600",
          bgGradient: "from-orange-500/20 to-orange-600/5",
        },
      ];

      // Eventos recientes simulados
      const mockEvents: RecentEvent[] = [
        {
          id: "1",
          type: "vaccination",
          animal_id: "COW-001",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            name: "Pasture A - North Field",
          },
          date: "2025-07-10T14:30:00Z",
          status: "completed",
        },
        {
          id: "2",
          type: "health_check",
          animal_id: "BULL-005",
          location: {
            lat: 14.632,
            lng: -90.5055,
            name: "Barn 2 - Medical Bay",
          },
          date: "2025-07-11T09:15:00Z",
          status: "pending",
        },
      ];

      setStats(mockStats);
      setRecentEvents(mockEvents);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const StatCard: React.FC<{ stat: StatCardData; index: number }> = ({
    stat,
    index,
  }) => {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{
          scale: 1.02,
          y: -5,
        }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} 
                   backdrop-blur-xl border border-white/10 p-6 shadow-xl 
                   hover:shadow-2xl transition-all duration-300`}
      >
        {/* Efecto de brillo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 2,
            delay: index * 0.2,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        />

        <div className="relative z-10">
          {/* Header del card con icono */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} ${stat.color}`}
            >
              {stat.icon}
            </div>
            <motion.div
              className={`flex items-center text-sm font-medium ${
                stat.trend > 0 ? "text-green-500" : "text-red-500"
              }`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${stat.trend < 0 ? "rotate-180" : ""}`}
              />
              {Math.abs(stat.trend)}%
            </motion.div>
          </div>

          {/* Valor principal animado */}
          <motion.div
            className="text-3xl font-bold text-white mb-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.8 + index * 0.1,
              type: "spring" as const,
              stiffness: 200,
              damping: 15,
            }}
          >
            {stat.value}
          </motion.div>

          {/* Título y subtítulo */}
          <motion.h3
            className="text-lg font-semibold text-white/90 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.1 }}
          >
            {stat.title}
          </motion.h3>
          <motion.p
            className="text-sm text-white/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1 }}
          >
            {stat.subtitle}
          </motion.p>
        </div>
      </motion.div>
    );
  };

  const RecentEventCard: React.FC<{ event: RecentEvent; index: number }> = ({
    event,
    index,
  }) => {
    const getEventIcon = (type: string) => {
      switch (type) {
        case "vaccination":
          return <Shield className="w-4 h-4" />;
        case "health_check":
          return <Heart className="w-4 h-4" />;
        case "treatment":
          return <Activity className="w-4 h-4" />;
        default:
          return <AlertTriangle className="w-4 h-4" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "text-green-500 bg-green-500/10";
        case "pending":
          return "text-yellow-500 bg-yellow-500/10";
        case "overdue":
          return "text-red-500 bg-red-500/10";
        default:
          return "text-gray-500 bg-gray-500/10";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 + index * 0.1 }}
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-xl 
                   border border-white/10 hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(event.status)}`}>
            {getEventIcon(event.type)}
          </div>
          <div>
            <p className="font-medium text-white/90">{event.animal_id}</p>
            <div className="flex items-center text-sm text-white/60">
              <MapPin className="w-3 h-3 mr-1" />
              {event.location.name}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-medium capitalize ${
              getStatusColor(event.status).split(" ")[0]
            }`}
          >
            {event.status}
          </p>
          <div className="flex items-center text-xs text-white/60">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(event.date).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-white/70 text-lg">
            Monitor your livestock health and vaccination status in real-time
          </p>
        </motion.div>

        {/* Grid de estadísticas principales */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </motion.div>

        {/* Sección de eventos recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <RecentEventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Indicador de actualización en tiempo real */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center mt-6 text-white/60 text-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full mr-2"
          />
          Live updates active • Last updated: {new Date().toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OverviewStats;
