import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Calendar,
  MapPin,
  User,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Bell,
  FileText,
  MoreVertical,
  Activity,
  Target,
  Scale,
  Wheat,
  Zap,
  DollarSign,
  CheckCircle,
  BarChart3,
  LineChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces para TypeScript
interface FeedingEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: FeedingEventType;
  status: "scheduled" | "completed" | "in_progress" | "cancelled" | "pending";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  feedingData: {
    feedType: FeedType;
    quantity: number;
    unit: "kg" | "lbs" | "tons";
    nutritionalValue?: NutritionalInfo;
    provider?: string;
    batchNumber?: string;
    expirationDate?: string;
    costPerUnit?: number;
    totalCost?: number;
    feedingMethod: "manual" | "automatic" | "mixed";
    frequency: "once" | "daily" | "twice_daily" | "three_times" | "custom";
    customSchedule?: string[];
    supplements?: Supplement[];
  };
  consumptionData?: {
    actualConsumed: number;
    wasteAmount?: number;
    consumptionRate: "excellent" | "good" | "fair" | "poor";
    behaviorNotes?: string;
    healthObservations?: string[];
  };
  notes?: string;
  weather?: WeatherConditions;
  cost?: number;
  responsible: string;
  reminders: EventReminder[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  nutritionalAnalysis?: NutritionalAnalysis;
}

interface FeedingEventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: "concentrate" | "forage" | "supplement" | "treatment" | "mineral";
  requiresApproval: boolean;
}

interface FeedType {
  id: string;
  name: string;
  category:
    | "hay"
    | "silage"
    | "concentrate"
    | "grain"
    | "supplement"
    | "mineral"
    | "protein"
    | "energy";
  description: string;
  nutritionalProfile: NutritionalInfo;
  storageRequirements: string;
  shelfLife: number; // días
  averageCost: number;
  supplier?: string;
  qualityGrade: "premium" | "standard" | "basic";
  organicCertified: boolean;
}

interface NutritionalInfo {
  dryMatter: number; // %
  crudeProtein: number; // %
  crudeeFiber: number; // %
  metabolizableEnergy: number; // Mcal/kg
  calcium: number; // %
  phosphorus: number; // %
  potassium: number; // %
  sodium: number; // %
  vitaminA?: number; // IU/kg
  vitaminD?: number; // IU/kg
  vitaminE?: number; // IU/kg
}

interface Supplement {
  id: string;
  name: string;
  type: "mineral" | "vitamin" | "probiotic" | "antibiotic" | "growth_promoter";
  dosage: number;
  unit: "g" | "ml" | "cc" | "pills";
  frequency: string;
  purpose: string;
  cost: number;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
  feedingArea?: string;
}

interface EventReminder {
  id: string;
  type: "notification" | "email" | "sms";
  timeBeforeEvent: number; // horas
  message: string;
  sent: boolean;
}

interface WeatherConditions {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
}

interface NutritionalAnalysis {
  totalProteinProvided: number;
  totalEnergyProvided: number;
  proteinRequirement: number;
  energyRequirement: number;
  proteinBalance: number;
  energyBalance: number;
  recommendations: string[];
}

interface FeedingStatistics {
  totalEvents: number;
  totalFeedConsumed: number; // kg
  averageDailyConsumption: number; // kg/día
  totalCost: number;
  averageCostPerKg: number;
  feedEfficiency: number; // %
  mostUsedFeedType: string;
  nutritionalCompliance: number; // %
  wastePercentage: number;
  scheduledVsCompleted: number;
}

const EventFeeding: React.FC = () => {
  // Estados principales
  const [feedingEvents, setFeedingEvents] = useState<FeedingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<FeedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFeedType, setSelectedFeedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FeedingEvent | null>(null);
  const [statistics, setStatistics] = useState<FeedingStatistics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Hooks de React Router
  const navigate = useNavigate();

  // Tipos de eventos de alimentación
  const feedingEventTypes: FeedingEventType[] = [
    {
      id: "daily_feeding",
      name: "Alimentación Diaria",
      icon: Package,
      color: "text-green-600",
      description: "Alimentación rutinaria diaria",
      category: "concentrate",
      requiresApproval: false,
    },
    {
      id: "supplement_feeding",
      name: "Suplementación",
      icon: Zap,
      color: "text-blue-600",
      description: "Administración de suplementos nutricionales",
      category: "supplement",
      requiresApproval: true,
    },
    {
      id: "forage_feeding",
      name: "Alimentación con Forraje",
      icon: Wheat,
      color: "text-yellow-600",
      description: "Suministro de forrajes y pastos",
      category: "forage",
      requiresApproval: false,
    },
    {
      id: "mineral_feeding",
      name: "Suplemento Mineral",
      icon: Scale,
      color: "text-purple-600",
      description: "Administración de minerales y vitaminas",
      category: "mineral",
      requiresApproval: false,
    },
    {
      id: "treatment_feeding",
      name: "Alimentación Terapéutica",
      icon: Activity,
      color: "text-red-600",
      description: "Alimentación específica para tratamiento",
      category: "treatment",
      requiresApproval: true,
    },
  ];

  // Tipos de alimento disponibles
  const feedTypes: FeedType[] = [
    {
      id: "alfalfa_hay",
      name: "Heno de Alfalfa",
      category: "hay",
      description: "Heno de alfalfa de alta calidad",
      nutritionalProfile: {
        dryMatter: 88,
        crudeProtein: 18,
        crudeeFiber: 32,
        metabolizableEnergy: 2.4,
        calcium: 1.2,
        phosphorus: 0.25,
        potassium: 2.1,
        sodium: 0.05,
        vitaminA: 15000,
        vitaminE: 25,
      },
      storageRequirements: "Lugar seco y ventilado",
      shelfLife: 365,
      averageCost: 25.0,
      qualityGrade: "premium",
      organicCertified: false,
    },
    {
      id: "corn_silage",
      name: "Ensilaje de Maíz",
      category: "silage",
      description: "Ensilaje de maíz fermentado",
      nutritionalProfile: {
        dryMatter: 32,
        crudeProtein: 8,
        crudeeFiber: 25,
        metabolizableEnergy: 2.6,
        calcium: 0.25,
        phosphorus: 0.22,
        potassium: 1.0,
        sodium: 0.02,
        vitaminA: 8000,
      },
      storageRequirements: "Silo hermético",
      shelfLife: 180,
      averageCost: 18.5,
      qualityGrade: "standard",
      organicCertified: false,
    },
    {
      id: "protein_concentrate",
      name: "Concentrado Proteico",
      category: "concentrate",
      description: "Mezcla concentrada alta en proteína",
      nutritionalProfile: {
        dryMatter: 90,
        crudeProtein: 24,
        crudeeFiber: 8,
        metabolizableEnergy: 3.1,
        calcium: 0.8,
        phosphorus: 0.6,
        potassium: 1.2,
        sodium: 0.3,
        vitaminA: 12000,
        vitaminD: 2000,
        vitaminE: 40,
      },
      storageRequirements: "Lugar seco, libre de roedores",
      shelfLife: 90,
      averageCost: 45.0,
      qualityGrade: "premium",
      organicCertified: true,
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadFeedingEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados para desarrollo
        const mockEvents: FeedingEvent[] = [
          {
            id: "1",
            bovineId: "bov_001",
            bovineName: "Esperanza",
            bovineTag: "ESP-001",
            eventType: feedingEventTypes[0],
            status: "completed",
            scheduledDate: "2024-12-20T07:00:00Z",
            completedDate: "2024-12-20T07:15:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Corral Norte, Rancho El Progreso",
              farm: "El Progreso",
              section: "Corral Norte",
              feedingArea: "Área A",
            },
            feedingData: {
              feedType: feedTypes[0],
              quantity: 15,
              unit: "kg",
              nutritionalValue: feedTypes[0].nutritionalProfile,
              provider: "Forrajes del Sureste",
              batchNumber: "ALF2024-156",
              expirationDate: "2025-06-15",
              costPerUnit: 25.0,
              totalCost: 375.0,
              feedingMethod: "manual",
              frequency: "twice_daily",
              supplements: [
                {
                  id: "supp_001",
                  name: "Mineral Block",
                  type: "mineral",
                  dosage: 50,
                  unit: "g",
                  frequency: "daily",
                  purpose: "Complemento mineral",
                  cost: 2.5,
                },
              ],
            },
            consumptionData: {
              actualConsumed: 14.5,
              wasteAmount: 0.5,
              consumptionRate: "excellent",
              behaviorNotes: "Apetito normal, consumo completo",
              healthObservations: ["Buen estado general", "Rumia normal"],
            },
            notes:
              "Alimentación matutina completada satisfactoriamente. Animal en buen estado.",
            weather: {
              temperature: 24,
              humidity: 75,
              condition: "Despejado",
              windSpeed: 8,
              precipitation: 0,
            },
            cost: 375.0,
            responsible: "Juan Pérez - Operador",
            reminders: [],
            attachments: [],
            createdAt: "2024-12-19T10:00:00Z",
            updatedAt: "2024-12-20T07:15:00Z",
            createdBy: "user_001",
            nutritionalAnalysis: {
              totalProteinProvided: 2.7,
              totalEnergyProvided: 36,
              proteinRequirement: 2.5,
              energyRequirement: 32,
              proteinBalance: 0.2,
              energyBalance: 4,
              recommendations: [
                "Nivel de proteína adecuado",
                "Energía ligeramente por encima del requerimiento",
              ],
            },
          },
          {
            id: "2",
            bovineId: "bov_002",
            bovineName: "Paloma",
            bovineTag: "PAL-002",
            eventType: feedingEventTypes[1],
            status: "scheduled",
            scheduledDate: "2024-12-25T08:00:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Corral Sur, Rancho El Progreso",
              farm: "El Progreso",
              section: "Corral Sur",
              feedingArea: "Área B",
            },
            feedingData: {
              feedType: feedTypes[2],
              quantity: 8,
              unit: "kg",
              nutritionalValue: feedTypes[2].nutritionalProfile,
              provider: "Nutrición Bovina SA",
              batchNumber: "PROT2024-089",
              expirationDate: "2025-03-20",
              costPerUnit: 45.0,
              totalCost: 360.0,
              feedingMethod: "automatic",
              frequency: "daily",
              supplements: [],
            },
            notes:
              "Suplementación proteica programada para mejorar condición corporal",
            cost: 360.0,
            responsible: "María González - Nutricionista",
            reminders: [
              {
                id: "rem_001",
                type: "notification",
                timeBeforeEvent: 2,
                message: "Preparar suplemento proteico para PAL-002",
                sent: false,
              },
            ],
            attachments: [],
            createdAt: "2024-12-20T14:00:00Z",
            updatedAt: "2024-12-20T14:00:00Z",
            createdBy: "user_002",
          },
        ];

        setFeedingEvents(mockEvents);

        // Calcular estadísticas simuladas
        const mockStatistics: FeedingStatistics = {
          totalEvents: 156,
          totalFeedConsumed: 2340,
          averageDailyConsumption: 18.5,
          totalCost: 45600.0,
          averageCostPerKg: 19.5,
          feedEfficiency: 92.5,
          mostUsedFeedType: "Heno de Alfalfa",
          nutritionalCompliance: 87,
          wastePercentage: 3.2,
          scheduledVsCompleted: 94.8,
        };

        setStatistics(mockStatistics);
      } catch (error) {
        console.error("Error cargando eventos de alimentación:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedingEvents();
  }, []);

  // Filtrar eventos basado en los criterios seleccionados
  useEffect(() => {
    let filtered = feedingEvents;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventType.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event.feedingData.feedType.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de evento
    if (selectedEventType !== "all") {
      filtered = filtered.filter(
        (event) => event.eventType.id === selectedEventType
      );
    }

    // Filtro por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Filtro por tipo de alimento
    if (selectedFeedType !== "all") {
      filtered = filtered.filter(
        (event) => event.feedingData.feedType.category === selectedFeedType
      );
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      const now = new Date();

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= weekFromNow;
          });
          break;
        case "month":
          const monthFromNow = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          );
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= monthFromNow;
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [
    feedingEvents,
    searchTerm,
    selectedEventType,
    selectedStatus,
    selectedFeedType,
    dateFilter,
  ]);

  // Funciones para manejar eventos
  const handleCreateEvent = () => {
    navigate("/events/create?type=nutrition");
  };

  const handleViewEvent = (event: FeedingEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      window.confirm("¿Estás seguro de eliminar este evento de alimentación?")
    ) {
      setFeedingEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      in_progress: "text-yellow-600 bg-yellow-100",
      cancelled: "text-red-600 bg-red-100",
      pending: "text-purple-600 bg-purple-100",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener el color de la categoría de alimento
  const getFeedCategoryColor = (category: string) => {
    const colors = {
      hay: "bg-yellow-100 text-yellow-800",
      silage: "bg-green-100 text-green-800",
      concentrate: "bg-blue-100 text-blue-800",
      grain: "bg-orange-100 text-orange-800",
      supplement: "bg-purple-100 text-purple-800",
      mineral: "bg-gray-100 text-gray-800",
      protein: "bg-red-100 text-red-800",
      energy: "bg-pink-100 text-pink-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Cargando eventos de alimentación...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white"
              >
                <Package className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Alimentación
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona la nutrición y alimentación de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analíticas</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Consumo Total
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.totalFeedConsumed.toLocaleString()} kg
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.averageDailyConsumption} kg/día promedio
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Scale className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Costo Total
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${statistics.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${statistics.averageCostPerKg}/kg promedio
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Eficiencia Alimentaria
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statistics.feedEfficiency}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.wastePercentage}% desperdicio
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Cumplimiento
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {statistics.scheduledVsCompleted}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Programado vs Completado
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Panel de Analíticas (Expandible) */}
      <AnimatePresence>
        {showAnalytics && statistics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Panel de Analíticas
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Consumo */}
                <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Tendencia de Consumo
                  </h3>
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Gráfico de tendencias de consumo</p>
                      <p className="text-sm">Integración con Chart.js</p>
                    </div>
                  </div>
                </div>

                {/* Distribución por Tipo de Alimento */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    Distribución de Alimentos
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Heno de Alfalfa
                      </span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Concentrado</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ensilaje</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas Nutricionales */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    Cumplimiento Proteico
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-green-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${statistics.nutritionalCompliance}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-900">
                      {statistics.nutritionalCompliance}%
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Eficiencia Energética
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: "89%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-blue-900">
                      89%
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-medium text-purple-900 mb-2">
                    Balance Mineral
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-purple-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{ width: "94%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      94%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros y Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por vaca, alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo de evento */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {feedingEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="pending">Pendiente</option>
            </select>

            {/* Filtro por tipo de alimento */}
            <select
              value={selectedFeedType}
              onChange={(e) => setSelectedFeedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Tipos de alimento</option>
              <option value="hay">Heno</option>
              <option value="silage">Ensilaje</option>
              <option value="concentrate">Concentrado</option>
              <option value="grain">Grano</option>
              <option value="supplement">Suplemento</option>
              <option value="mineral">Mineral</option>
            </select>

            {/* Filtro por fecha */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Próxima semana</option>
              <option value="month">Próximo mes</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de Eventos */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {filteredEvents.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de alimentación
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedEventType !== "all" ||
              selectedStatus !== "all" ||
              selectedFeedType !== "all" ||
              dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de alimentación."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Crear Primer Evento
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleViewEvent(event)}
              >
                {/* Header del evento */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${
                        event.eventType.color.includes("green")
                          ? "from-green-500 to-green-600"
                          : event.eventType.color.includes("blue")
                          ? "from-blue-500 to-blue-600"
                          : event.eventType.color.includes("yellow")
                          ? "from-yellow-500 to-yellow-600"
                          : event.eventType.color.includes("purple")
                          ? "from-purple-500 to-purple-600"
                          : "from-red-500 to-red-600"
                      } text-white`}
                    >
                      <event.eventType.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.eventType.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.bovineName} • {event.bovineTag}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status === "scheduled"
                        ? "Programado"
                        : event.status === "completed"
                        ? "Completado"
                        : event.status === "in_progress"
                        ? "En Progreso"
                        : event.status === "cancelled"
                        ? "Cancelado"
                        : "Pendiente"}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mostrar menú de opciones
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Información del alimento */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {event.feedingData.feedType.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedCategoryColor(
                        event.feedingData.feedType.category
                      )}`}
                    >
                      {event.feedingData.feedType.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-medium ml-1">
                        {event.feedingData.quantity} {event.feedingData.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-medium ml-1">
                        ${event.cost?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del evento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.location.feedingArea || event.location.section}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{event.responsible}</span>
                  </div>
                </div>

                {/* Datos de consumo (si existe) */}
                {event.consumptionData && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">
                        Consumo Registrado
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.consumptionData.consumptionRate === "excellent"
                            ? "bg-green-100 text-green-800"
                            : event.consumptionData.consumptionRate === "good"
                            ? "bg-blue-100 text-blue-800"
                            : event.consumptionData.consumptionRate === "fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.consumptionData.consumptionRate === "excellent"
                          ? "Excelente"
                          : event.consumptionData.consumptionRate === "good"
                          ? "Bueno"
                          : event.consumptionData.consumptionRate === "fair"
                          ? "Regular"
                          : "Pobre"}
                      </span>
                    </div>
                    <div className="text-sm text-green-800">
                      <span>
                        {event.consumptionData.actualConsumed} kg consumidos
                      </span>
                      {event.consumptionData.wasteAmount && (
                        <span className="ml-2">
                          • {event.consumptionData.wasteAmount} kg desperdicio
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Análisis nutricional (si existe) */}
                {event.nutritionalAnalysis && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">
                      Balance Nutricional
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                      <div>
                        <span>Proteína: </span>
                        <span
                          className={`font-medium ${
                            event.nutritionalAnalysis.proteinBalance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {event.nutritionalAnalysis.proteinBalance > 0
                            ? "+"
                            : ""}
                          {event.nutritionalAnalysis.proteinBalance.toFixed(1)}{" "}
                          kg
                        </span>
                      </div>
                      <div>
                        <span>Energía: </span>
                        <span
                          className={`font-medium ${
                            event.nutritionalAnalysis.energyBalance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {event.nutritionalAnalysis.energyBalance > 0
                            ? "+"
                            : ""}
                          {event.nutritionalAnalysis.energyBalance.toFixed(1)}{" "}
                          Mcal
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {event.reminders.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Bell className="h-3 w-3" />
                        <span>{event.reminders.length}</span>
                      </div>
                    )}

                    {event.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FileText className="h-3 w-3" />
                        <span>{event.attachments.length}</span>
                      </div>
                    )}

                    {event.feedingData.supplements &&
                      event.feedingData.supplements.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-purple-600">
                          <Zap className="h-3 w-3" />
                          <span>{event.feedingData.supplements.length}</span>
                        </div>
                      )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de detalles del evento */}
      <AnimatePresence>
        {showDetailsModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedEvent.eventType.color.includes("green")
                        ? "bg-green-100 text-green-600"
                        : selectedEvent.eventType.color.includes("blue")
                        ? "bg-blue-100 text-blue-600"
                        : selectedEvent.eventType.color.includes("yellow")
                        ? "bg-yellow-100 text-yellow-600"
                        : selectedEvent.eventType.color.includes("purple")
                        ? "bg-purple-100 text-purple-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <selectedEvent.eventType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEvent.eventType.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedEvent.bovineName} • {selectedEvent.bovineTag}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Contenido del modal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del Alimento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Información del Alimento
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {selectedEvent.feedingData.feedType.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getFeedCategoryColor(
                          selectedEvent.feedingData.feedType.category
                        )}`}
                      >
                        {selectedEvent.feedingData.feedType.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <p className="font-medium">
                          {selectedEvent.feedingData.quantity}{" "}
                          {selectedEvent.feedingData.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Método:</span>
                        <p className="font-medium capitalize">
                          {selectedEvent.feedingData.feedingMethod}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Frecuencia:</span>
                        <p className="font-medium">
                          {selectedEvent.feedingData.frequency === "once"
                            ? "Una vez"
                            : selectedEvent.feedingData.frequency === "daily"
                            ? "Diario"
                            : selectedEvent.feedingData.frequency ===
                              "twice_daily"
                            ? "2 veces/día"
                            : selectedEvent.feedingData.frequency ===
                              "three_times"
                            ? "3 veces/día"
                            : "Personalizado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Costo Total:</span>
                        <p className="font-medium">
                          ${selectedEvent.cost?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información Nutricional */}
                  {selectedEvent.feedingData.nutritionalValue && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">
                        Perfil Nutricional
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-blue-700">Proteína Cruda:</span>
                          <span className="font-medium ml-1">
                            {
                              selectedEvent.feedingData.nutritionalValue
                                .crudeProtein
                            }
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Energía:</span>
                          <span className="font-medium ml-1">
                            {
                              selectedEvent.feedingData.nutritionalValue
                                .metabolizableEnergy
                            }{" "}
                            Mcal/kg
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Fibra Cruda:</span>
                          <span className="font-medium ml-1">
                            {
                              selectedEvent.feedingData.nutritionalValue
                                .crudeeFiber
                            }
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Materia Seca:</span>
                          <span className="font-medium ml-1">
                            {
                              selectedEvent.feedingData.nutritionalValue
                                .dryMatter
                            }
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suplementos */}
                  {selectedEvent.feedingData.supplements &&
                    selectedEvent.feedingData.supplements.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-3">
                          Suplementos
                        </h4>
                        <div className="space-y-2">
                          {selectedEvent.feedingData.supplements.map(
                            (supplement, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-purple-800">
                                  {supplement.name}
                                </span>
                                <span className="font-medium">
                                  {supplement.dosage} {supplement.unit}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Datos de Consumo y Resultados */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Datos del Evento
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">
                        Fecha Programada:
                      </span>
                      <p className="font-medium">
                        {formatDate(selectedEvent.scheduledDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ubicación:</span>
                      <p className="font-medium">
                        {selectedEvent.location.address}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Responsable:
                      </span>
                      <p className="font-medium">{selectedEvent.responsible}</p>
                    </div>
                  </div>

                  {/* Datos de Consumo */}
                  {selectedEvent.consumptionData && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3">
                        Datos de Consumo
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Consumo Real:</span>
                          <span className="font-medium">
                            {selectedEvent.consumptionData.actualConsumed} kg
                          </span>
                        </div>
                        {selectedEvent.consumptionData.wasteAmount && (
                          <div className="flex justify-between">
                            <span className="text-green-700">Desperdicio:</span>
                            <span className="font-medium">
                              {selectedEvent.consumptionData.wasteAmount} kg
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-green-700">
                            Tasa de Consumo:
                          </span>
                          <span
                            className={`font-medium capitalize ${
                              selectedEvent.consumptionData.consumptionRate ===
                              "excellent"
                                ? "text-green-600"
                                : selectedEvent.consumptionData
                                    .consumptionRate === "good"
                                ? "text-blue-600"
                                : selectedEvent.consumptionData
                                    .consumptionRate === "fair"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedEvent.consumptionData.consumptionRate ===
                            "excellent"
                              ? "Excelente"
                              : selectedEvent.consumptionData
                                  .consumptionRate === "good"
                              ? "Bueno"
                              : selectedEvent.consumptionData
                                  .consumptionRate === "fair"
                              ? "Regular"
                              : "Pobre"}
                          </span>
                        </div>
                        {selectedEvent.consumptionData.behaviorNotes && (
                          <div>
                            <span className="text-green-700">
                              Comportamiento:
                            </span>
                            <p className="text-green-800 mt-1">
                              {selectedEvent.consumptionData.behaviorNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Análisis Nutricional */}
                  {selectedEvent.nutritionalAnalysis && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-3">
                        Análisis Nutricional
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-orange-700">
                            Balance Proteico:
                          </span>
                          <span
                            className={`font-medium ${
                              selectedEvent.nutritionalAnalysis
                                .proteinBalance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedEvent.nutritionalAnalysis.proteinBalance >
                            0
                              ? "+"
                              : ""}
                            {selectedEvent.nutritionalAnalysis.proteinBalance.toFixed(
                              1
                            )}{" "}
                            kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700">
                            Balance Energético:
                          </span>
                          <span
                            className={`font-medium ${
                              selectedEvent.nutritionalAnalysis.energyBalance >=
                              0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedEvent.nutritionalAnalysis.energyBalance > 0
                              ? "+"
                              : ""}
                            {selectedEvent.nutritionalAnalysis.energyBalance.toFixed(
                              1
                            )}{" "}
                            Mcal
                          </span>
                        </div>
                        {selectedEvent.nutritionalAnalysis.recommendations
                          .length > 0 && (
                          <div>
                            <span className="text-orange-700 block mb-1">
                              Recomendaciones:
                            </span>
                            <ul className="text-orange-800 text-xs space-y-1">
                              {selectedEvent.nutritionalAnalysis.recommendations.map(
                                (rec, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start space-x-1"
                                  >
                                    <span className="text-orange-600">•</span>
                                    <span>{rec}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Condiciones Climáticas */}
                  {selectedEvent.weather && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">
                        Condiciones Climáticas
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-blue-700">Temperatura:</span>
                          <span className="font-medium ml-1">
                            {selectedEvent.weather.temperature}°C
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Humedad:</span>
                          <span className="font-medium ml-1">
                            {selectedEvent.weather.humidity}%
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Condición:</span>
                          <span className="font-medium ml-1">
                            {selectedEvent.weather.condition}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">Viento:</span>
                          <span className="font-medium ml-1">
                            {selectedEvent.weather.windSpeed} km/h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {selectedEvent.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Notas
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedEvent.notes}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditEvent(selectedEvent.id);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFeeding;
