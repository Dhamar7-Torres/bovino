import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout, Scale, TrendingUp, Utensils, FileText, AlertCircle, RefreshCw } from "lucide-react";

// Importar componentes del módulo feeding
import Floors from "./Floors";

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Configuración de la API
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
  }
};

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

interface FeedingPlan {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  bovineCount: number;
  dailyAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface NutritionalAlert {
  id: string;
  type: 'LOW_FEED' | 'NUTRITIONAL_DEFICIENCY' | 'OVERCONSUMPTION' | 'QUALITY_ISSUE';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bovineId?: string;
  planId?: string;
  createdAt: string;
}

// Funciones de API para alimentación
class FeedingAPI {
  
  // Obtener estadísticas de alimentación
  static async getFeedingStats(): Promise<FeedingStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/feeding/statistics`, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener estadísticas de alimentación');
      }

      return data.data.statistics;
    } catch (error) {
      console.error('Error al obtener estadísticas de alimentación:', error);
      // Retornar datos por defecto en caso de error
      return {
        totalPlants: 0,
        activeFeedingPlans: 0,
        dailyConsumption: 0,
        feedCost: 0,
        nutritionalCompliance: 0,
        pendingFeedings: 0,
        alertsCount: 0,
        lastUpdate: new Date().toISOString(),
      };
    }
  }

  // Obtener planes de alimentación activos
  static async getActiveFeedingPlans(): Promise<FeedingPlan[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/feeding/plans?status=ACTIVE`, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener planes de alimentación');
      }

      return data.data.plans || [];
    } catch (error) {
      console.error('Error al obtener planes de alimentación:', error);
      return [];
    }
  }

  // Obtener alertas nutricionales
  static async getNutritionalAlerts(): Promise<NutritionalAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/feeding/alerts?limit=10`, {
        method: 'GET',
        ...apiConfig
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener alertas nutricionales');
      }

      return data.data.alerts || [];
    } catch (error) {
      console.error('Error al obtener alertas nutricionales:', error);
      return [];
    }
  }

  // Verificar conectividad del backend
  static async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('Backend no disponible:', error);
      return false;
    }
  }
}

// Hook personalizado para conexión del backend
const useFeedingData = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexión al backend
      const backendConnected = await FeedingAPI.checkBackendConnection();
      setIsConnected(backendConnected);

      if (!backendConnected) {
        throw new Error('No se puede conectar al backend. Verifique que esté ejecutándose en el puerto 5000.');
      }

      // Cargar estadísticas desde el backend
      const feedingStats = await FeedingAPI.getFeedingStats();
      
      setStats({
        ...feedingStats,
        lastUpdate: new Date().toLocaleString('es-ES'),
      });

    } catch (error) {
      console.error('Error cargando datos de alimentación:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Fallback a datos simulados si el backend no responde
      setStats({
        totalPlants: 47,
        activeFeedingPlans: 12,
        dailyConsumption: 2850,
        feedCost: 45600,
        nutritionalCompliance: 94,
        pendingFeedings: 8,
        alertsCount: 3,
        lastUpdate: new Date().toLocaleString('es-ES') + ' (Simulado)',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, isConnected, refetch: loadData };
};

// Componente de indicador de conexión
const ConnectionIndicator: React.FC<{ 
  isConnected: boolean | null; 
  onRetry: () => void;
  loading: boolean;
}> = ({ isConnected, onRetry, loading }) => {
  if (isConnected === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2"
    >
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>
          {isConnected ? 'Conectado al Backend' : 'Backend Desconectado'}
        </span>
      </div>
      
      {!loading && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRetry}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Actualizar datos"
        >
          <RefreshCw className="h-4 w-4 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
};

// Componente de estadísticas del header
const HeaderStats: React.FC = () => {
  const { stats, loading, error, isConnected, refetch } = useFeedingData();

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Indicador de carga */}
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-white/80 text-sm">Conectando con el backend...</span>
        </div>
        
        {/* Skeleton de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-20 border border-white/20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicador de conexión y botón de actualizar */}
      <div className="flex items-center justify-between">
        <ConnectionIndicator 
          isConnected={isConnected} 
          onRetry={refetch} 
          loading={loading}
        />
        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Error de conexión</span>
          </motion.div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
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
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
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
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
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
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
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

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Costo de Alimentación</p>
              <p className="text-xl font-bold text-white">
                ${stats.feedCost.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-white/70" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Alimentaciones Pendientes</p>
              <p className="text-xl font-bold text-white">
                {stats.pendingFeedings}
              </p>
            </div>
            <Utensils className="h-6 w-6 text-white/70" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Alertas Activas</p>
              <p className="text-xl font-bold text-white">
                {stats.alertsCount}
              </p>
            </div>
            <AlertCircle className="h-6 w-6 text-white/70" />
          </div>
        </motion.div>
      </div>

      {/* Timestamp de última actualización */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <p className="text-white/60 text-xs">
          Última actualización: {stats.lastUpdate}
        </p>
      </motion.div>
    </div>
  );
};

// Componente principal FeedingPage
const FeedingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header del módulo con fondo verde sólido */}
      <div className="bg-[#519a7c] relative">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
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

      {/* Contenido principal - Mostrar Floors directamente */}
      <div className="relative">
        <Floors />
      </div>
    </div>
  );
};

export default FeedingPage;