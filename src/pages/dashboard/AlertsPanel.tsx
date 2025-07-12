import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  MapPin,
  Filter,
  Search,
  X,
  CheckCircle,
  ExternalLink,
  Bell,
  Calendar,
  Thermometer,
  Activity,
} from "lucide-react";

// Tipos de alertas disponibles
type AlertType = "critical" | "warning" | "info" | "overdue";
type AlertCategory =
  | "health"
  | "vaccination"
  | "medication"
  | "environmental"
  | "system";

// Interfaz para las alertas
interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  description: string;
  animal_id?: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  timestamp: string;
  isRead: boolean;
  priority: number; // 1-5, siendo 5 la máxima prioridad
  due_date?: string;
  metadata?: {
    temperature?: number;
    last_vaccination?: string;
    symptoms?: string[];
  };
}

// Interfaz para filtros
interface AlertFilter {
  type: AlertType | "all";
  category: AlertCategory | "all";
  isRead: boolean | "all";
  search: string;
}

const AlertsPanel: React.FC = () => {
  // Estados principales
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState<AlertFilter>({
    type: "all",
    category: "all",
    isRead: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos simulados
  useEffect(() => {
    const loadAlerts = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockAlerts: Alert[] = [
        {
          id: "alert-001",
          type: "critical",
          category: "health",
          title: "High Fever Detected",
          description:
            "COW-087 showing elevated body temperature (40.5°C). Immediate veterinary attention required.",
          animal_id: "COW-087",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            name: "Pasture B - Section 3",
          },
          timestamp: "2025-07-11T08:30:00Z",
          isRead: false,
          priority: 5,
          metadata: {
            temperature: 40.5,
            symptoms: ["fever", "lethargy", "loss_of_appetite"],
          },
        },
        {
          id: "alert-002",
          type: "warning",
          category: "vaccination",
          title: "Vaccination Overdue",
          description:
            "BULL-023 vaccination schedule is 3 days overdue. Please schedule immediately.",
          animal_id: "BULL-023",
          location: {
            lat: 14.632,
            lng: -90.5055,
            name: "Barn 1 - Stall 15",
          },
          timestamp: "2025-07-10T14:15:00Z",
          isRead: false,
          priority: 4,
          due_date: "2025-07-08T00:00:00Z",
          metadata: {
            last_vaccination: "2025-04-08T00:00:00Z",
          },
        },
        {
          id: "alert-003",
          type: "info",
          category: "environmental",
          title: "Water Level Low",
          description:
            "Water trough in North Field requires refilling. Current level at 15%.",
          location: {
            lat: 14.6355,
            lng: -90.508,
            name: "North Field - Trough 2",
          },
          timestamp: "2025-07-11T06:45:00Z",
          isRead: true,
          priority: 2,
        },
        {
          id: "alert-004",
          type: "overdue",
          category: "medication",
          title: "Medication Schedule Missed",
          description:
            "COW-045 antibiotic treatment scheduled for yesterday was not administered.",
          animal_id: "COW-045",
          location: {
            lat: 14.634,
            lng: -90.507,
            name: "Medical Bay - Treatment Room",
          },
          timestamp: "2025-07-10T16:00:00Z",
          isRead: false,
          priority: 5,
          due_date: "2025-07-10T09:00:00Z",
        },
        {
          id: "alert-005",
          type: "warning",
          category: "system",
          title: "GPS Collar Offline",
          description:
            "GPS tracking collar for COW-102 has been offline for 2 hours.",
          animal_id: "COW-102",
          location: {
            lat: 14.633,
            lng: -90.5065,
            name: "Last Known: East Pasture",
          },
          timestamp: "2025-07-11T07:20:00Z",
          isRead: false,
          priority: 3,
        },
      ];

      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
      setIsLoading(false);
    };

    loadAlerts();
  }, []);

  // Filtrar alertas cuando cambien los filtros
  useEffect(() => {
    let filtered = alerts;

    // Filtro por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((alert) => alert.type === filters.type);
    }

    // Filtro por categoría
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (alert) => alert.category === filters.category
      );
    }

    // Filtro por estado de lectura
    if (filters.isRead !== "all") {
      filtered = filtered.filter((alert) => alert.isRead === filters.isRead);
    }

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(
        (alert) =>
          alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          alert.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          alert.animal_id
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          alert.location.name
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Ordenar por prioridad y fecha
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, filters]);

  // Función para obtener el color del tipo de alerta
  const getAlertTypeColor = (type: AlertType): string => {
    switch (type) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "info":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "overdue":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Función para obtener el ícono del tipo de alerta
  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "info":
        return <Bell className="w-4 h-4" />;
      case "overdue":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Función para obtener el ícono de la categoría
  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case "health":
        return <Activity className="w-4 h-4" />;
      case "vaccination":
        return <CheckCircle className="w-4 h-4" />;
      case "medication":
        return <Thermometer className="w-4 h-4" />;
      case "environmental":
        return <MapPin className="w-4 h-4" />;
      case "system":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Marcar alerta como leída
  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  // Componente para el card de alerta
  const AlertCard: React.FC<{ alert: Alert; index: number }> = ({
    alert,
    index,
  }) => {
    const timeAgo = React.useMemo(() => {
      const now = new Date();
      const alertTime = new Date(alert.timestamp);
      const diffMs = now.getTime() - alertTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }, [alert.timestamp]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => {
          setSelectedAlert(alert);
          if (!alert.isRead) markAsRead(alert.id);
        }}
        className={`relative p-4 rounded-xl border backdrop-blur-xl cursor-pointer
                   transition-all duration-300 hover:shadow-lg
                   ${
                     alert.isRead
                       ? "bg-white/5 border-white/10"
                       : "bg-white/10 border-white/20 shadow-md"
                   }
                   ${getAlertTypeColor(alert.type)}`}
      >
        {/* Indicador de prioridad */}
        <div
          className={`absolute top-2 right-2 w-2 h-2 rounded-full
                        ${
                          alert.priority >= 4
                            ? "bg-red-500"
                            : alert.priority >= 3
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
        />

        {/* Header del alert */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-lg ${
                getAlertTypeColor(alert.type).split(" ")[1]
              } ${getAlertTypeColor(alert.type).split(" ")[0]}`}
            >
              {getAlertTypeIcon(alert.type)}
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  alert.isRead ? "text-white/70" : "text-white"
                }`}
              >
                {alert.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                {getCategoryIcon(alert.category)}
                <span className="capitalize">{alert.category}</span>
                {alert.animal_id && (
                  <>
                    <span>•</span>
                    <span>{alert.animal_id}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-white/50">{timeAgo}</span>
        </div>

        {/* Descripción */}
        <p
          className={`text-sm mb-3 ${
            alert.isRead ? "text-white/60" : "text-white/80"
          }`}
        >
          {alert.description}
        </p>

        {/* Ubicación */}
        <div className="flex items-center text-xs text-white/60">
          <MapPin className="w-3 h-3 mr-1" />
          {alert.location.name}
          {alert.due_date && (
            <>
              <span className="mx-2">•</span>
              <Calendar className="w-3 h-3 mr-1" />
              Due: {new Date(alert.due_date).toLocaleDateString()}
            </>
          )}
        </div>

        {/* Indicador de no leído */}
        {!alert.isRead && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full"
          />
        )}
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Alerts Panel</h1>
            <p className="text-white/70">
              Monitor critical events and system notifications
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {alerts.filter((a) => a.type === "critical").length}
              </div>
              <div className="text-xs text-white/60">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {alerts.filter((a) => !a.isRead).length}
              </div>
              <div className="text-xs text-white/60">Unread</div>
            </div>
          </div>
        </motion.div>

        {/* Controles de filtro y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-purple-600/20 border border-purple-500/30
                       rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Panel de filtros expandible */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por tipo */}
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: e.target.value as AlertType | "all",
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                             focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  {/* Filtro por categoría */}
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value as AlertCategory | "all",
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                             focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="health">Health</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="medication">Medication</option>
                    <option value="environmental">Environmental</option>
                    <option value="system">System</option>
                  </select>

                  {/* Filtro por estado */}
                  <select
                    value={filters.isRead.toString()}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isRead:
                          e.target.value === "all"
                            ? "all"
                            : e.target.value === "true",
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                             focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Lista de alertas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No alerts found
              </h3>
              <p className="text-white/50">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} index={index} />
            ))
          )}
        </motion.div>

        {/* Modal de detalle de alerta */}
        <AnimatePresence>
          {selectedAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAlert(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 
                         p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header del modal */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 rounded-xl ${getAlertTypeColor(
                        selectedAlert.type
                      )}`}
                    >
                      {getAlertTypeIcon(selectedAlert.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedAlert.title}
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-white/60">
                        {getCategoryIcon(selectedAlert.category)}
                        <span className="capitalize">
                          {selectedAlert.category}
                        </span>
                        {selectedAlert.animal_id && (
                          <>
                            <span>•</span>
                            <span>{selectedAlert.animal_id}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="space-y-4">
                  <p className="text-white/80">{selectedAlert.description}</p>

                  {/* Metadata */}
                  {selectedAlert.metadata && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-2">
                        Additional Information
                      </h3>
                      {selectedAlert.metadata.temperature && (
                        <p className="text-white/70 text-sm">
                          Temperature: {selectedAlert.metadata.temperature}°C
                        </p>
                      )}
                      {selectedAlert.metadata.symptoms && (
                        <div className="text-white/70 text-sm">
                          Symptoms: {selectedAlert.metadata.symptoms.join(", ")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ubicación */}
                  <div className="flex items-center text-white/70">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedAlert.location.name}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center text-white/70">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 
                                     rounded-lg transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Location
                    </button>
                    <button
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white 
                                     rounded-lg transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPanel;
