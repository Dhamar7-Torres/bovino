import React, { useState, useEffect } from "react";
import {
  Sprout,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// Interfaces para plantas y tipos de datos
interface Plant {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  plantType: PlantType;
  nutritionalValue: NutritionalValue;
  toxicityLevel: ToxicityLevel;
  seasonality: Season[];
  growthConditions: GrowthConditions;
  harvestInfo: HarvestInfo;
  feedingNotes: string;
  imageUrl: string;
  isNative: boolean;
  isRecommended: boolean;
  lastUpdated: Date;
  createdBy: string;
}

interface NutritionalValue {
  protein: number; // %
  fiber: number; // %
  moisture: number; // %
  minerals: {
    calcium: number;
    phosphorus: number;
    potassium: number;
    magnesium: number;
  };
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminE: number;
  };
  digestibility: number; // %
  energyContent: number; // Mcal/kg
}

interface GrowthConditions {
  soilType: string[];
  phRange: { min: number; max: number };
  sunlightNeeds: "full" | "partial" | "shade";
  waterRequirements: "low" | "moderate" | "high";
  temperatureRange: { min: number; max: number };
  altitudeRange: { min: number; max: number };
}

interface HarvestInfo {
  bestHarvestTime: string;
  harvestFrequency: string;
  storageMethod: string;
  shelfLife: number; // días
  processingRequired: boolean;
}

enum PlantType {
  GRASS = "grass",
  LEGUME = "legume",
  HERB = "herb",
  TREE_LEAF = "tree_leaf",
  SHRUB = "shrub",
  AQUATIC = "aquatic",
}

enum ToxicityLevel {
  SAFE = "safe",
  CAUTION = "caution",
  MODERATE = "moderate",
  HIGH = "high",
  TOXIC = "toxic",
}

enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
}

const Floors: React.FC = () => {
  // Estados del componente
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<PlantType | "all">("all");
  const [selectedToxicity, setSelectedToxicity] = useState<ToxicityLevel | "all">("all");
  
  // Estados de formularios
  const [editingPlant, setEditingPlant] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Plant>>({});

  // Estado de notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info" as "success" | "error" | "info"
  });

  // Configuración del API
  const API_URL = 'http://localhost:5000/api';

  // Funciones del API para plantas
  const plantsAPI = {
    checkHealth: async () => {
      try {
        console.log('🔍 Verificando salud del servidor...');
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const isHealthy = response.ok;
        console.log('📊 Estado del servidor:', isHealthy ? 'SALUDABLE' : 'NO DISPONIBLE');
        return isHealthy;
      } catch (error) {
        console.error('❌ Error en health check:', error);
        return false;
      }
    },

    getPlants: async () => {
      try {
        console.log('🌱 Obteniendo plantas alimenticias...');
        const response = await fetch(`${API_URL}/events?eventType=plant_feeding&limit=100`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 Respuesta del servidor:', data);
        
        if (data.success && data.data && data.data.events) {
          console.log(`✅ ${data.data.events.length} registros de plantas obtenidos`);
          return data.data.events;
        }
        
        return [];
      } catch (error) {
        console.error('❌ Error obteniendo plantas:', error);
        throw error;
      }
    },

    createPlant: async (plantData: any) => {
      try {
        console.log('➕ Creando nueva planta:', plantData);
        
        const payload = {
          eventType: "plant_feeding",
          title: `Planta: ${plantData.name}`,
          description: plantData.feedingNotes || `${plantData.scientificName} - ${plantData.plantType}`,
          scheduledDate: new Date().toISOString(),
          bovineId: `plant_${Date.now()}`,
          status: "ACTIVE",
          priority: "MEDIUM",
          location: {
            latitude: 19.3371,
            longitude: -99.5660,
            address: "Catálogo de plantas"
          },
          cost: 0,
          currency: "MXN",
          eventData: {
            name: plantData.name,
            scientificName: plantData.scientificName,
            commonNames: plantData.commonNames || [],
            plantType: plantData.plantType,
            toxicityLevel: plantData.toxicityLevel,
            nutritionalValue: plantData.nutritionalValue || getDefaultNutritionalValue(),
            seasonality: plantData.seasonality || [],
            growthConditions: plantData.growthConditions || getDefaultGrowthConditions(),
            harvestInfo: plantData.harvestInfo || getDefaultHarvestInfo(),
            feedingNotes: plantData.feedingNotes,
            isNative: plantData.isNative || false,
            isRecommended: plantData.isRecommended || false
          }
        };

        console.log('📤 Payload enviado:', payload);

        const response = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Planta creada:', data);
        
        if (data.success && data.data && data.data.event) {
          return data.data.event;
        }
        
        throw new Error('Respuesta inválida del servidor');
      } catch (error) {
        console.error('❌ Error creando planta:', error);
        throw error;
      }
    },

    updatePlant: async (id: string, plantData: any) => {
      try {
        console.log('✏️ Actualizando planta:', id, plantData);
        
        const payload = {
          title: `Planta: ${plantData.name}`,
          description: plantData.feedingNotes || `${plantData.scientificName} - ${plantData.plantType}`,
          eventData: {
            name: plantData.name,
            scientificName: plantData.scientificName,
            commonNames: plantData.commonNames || [],
            plantType: plantData.plantType,
            toxicityLevel: plantData.toxicityLevel,
            nutritionalValue: plantData.nutritionalValue || getDefaultNutritionalValue(),
            seasonality: plantData.seasonality || [],
            growthConditions: plantData.growthConditions || getDefaultGrowthConditions(),
            harvestInfo: plantData.harvestInfo || getDefaultHarvestInfo(),
            feedingNotes: plantData.feedingNotes,
            isNative: plantData.isNative || false,
            isRecommended: plantData.isRecommended || false
          }
        };

        const response = await fetch(`${API_URL}/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Planta actualizada:', data);
        
        if (data.success && data.data && data.data.event) {
          return data.data.event;
        }
        
        throw new Error('Respuesta inválida del servidor');
      } catch (error) {
        console.error('❌ Error actualizando planta:', error);
        throw error;
      }
    },

    deletePlant: async (id: string) => {
      try {
        console.log('🗑️ Eliminando planta:', id);
        
        const response = await fetch(`${API_URL}/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Planta eliminada:', data);
        
        return data.success;
      } catch (error) {
        console.error('❌ Error eliminando planta:', error);
        throw error;
      }
    }
  };

  // Funciones para valores por defecto
  const getDefaultNutritionalValue = (): NutritionalValue => ({
    protein: 0,
    fiber: 0,
    moisture: 0,
    minerals: { calcium: 0, phosphorus: 0, potassium: 0, magnesium: 0 },
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminE: 0 },
    digestibility: 0,
    energyContent: 0,
  });

  const getDefaultGrowthConditions = (): GrowthConditions => ({
    soilType: [],
    phRange: { min: 0, max: 14 },
    sunlightNeeds: "full",
    waterRequirements: "moderate",
    temperatureRange: { min: 0, max: 50 },
    altitudeRange: { min: 0, max: 3000 },
  });

  const getDefaultHarvestInfo = (): HarvestInfo => ({
    bestHarvestTime: "",
    harvestFrequency: "",
    storageMethod: "",
    shelfLife: 0,
    processingRequired: false,
  });

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
    }, 5000);
  };

  // Función para mapear datos del backend a plantas
  const mapBackendPlant = (backendEvent: any): Plant => {
    const eventData = backendEvent.eventData || {};
    return {
      id: backendEvent.id,
      name: eventData.name || "Sin nombre",
      scientificName: eventData.scientificName || "Sin nombre científico",
      commonNames: eventData.commonNames || [],
      plantType: eventData.plantType || PlantType.GRASS,
      nutritionalValue: eventData.nutritionalValue || getDefaultNutritionalValue(),
      toxicityLevel: eventData.toxicityLevel || ToxicityLevel.SAFE,
      seasonality: eventData.seasonality || [],
      growthConditions: eventData.growthConditions || getDefaultGrowthConditions(),
      harvestInfo: eventData.harvestInfo || getDefaultHarvestInfo(),
      feedingNotes: eventData.feedingNotes || backendEvent.description || "",
      imageUrl: "/api/placeholder/300/200",
      isNative: eventData.isNative || false,
      isRecommended: eventData.isRecommended || false,
      lastUpdated: new Date(backendEvent.updatedAt || backendEvent.createdAt),
      createdBy: backendEvent.createdBy || "Usuario"
    };
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadPlants = async () => {
      console.log('🚀 Iniciando carga de plantas alimenticias...');
      setLoading(true);
      setError(null);

      try {
        // Verificar conexión
        console.log('🔍 Verificando conexión con el backend...');
        const isHealthy = await plantsAPI.checkHealth();
        setConnected(isHealthy);

        if (isHealthy) {
          console.log('✅ Conexión establecida, cargando plantas...');
          
          // Cargar plantas
          const backendPlants = await plantsAPI.getPlants();
          console.log('🌱 Plantas del backend:', backendPlants);
          
          // Mapear plantas
          const mappedPlants = backendPlants.map(mapBackendPlant);
          setPlants(mappedPlants);
          
          showNotification(`✅ ${mappedPlants.length} plantas cargadas correctamente`, "success");
          console.log(`📊 Total de plantas procesadas: ${mappedPlants.length}`);
        } else {
          setError("No se pudo conectar al servidor backend");
          showNotification("❌ Sin conexión al servidor en puerto 5000", "error");
        }
      } catch (error) {
        console.error('💥 Error cargando plantas:', error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        setError(errorMessage);
        setConnected(false);
        showNotification(`❌ Error: ${errorMessage}`, "error");
      } finally {
        setLoading(false);
        console.log('✨ Carga de plantas completada');
      }
    };

    loadPlants();
  }, []);

  // Filtrar plantas basado en criterios de búsqueda
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.commonNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesType =
      selectedType === "all" || plant.plantType === selectedType;
    const matchesToxicity =
      selectedToxicity === "all" || plant.toxicityLevel === selectedToxicity;

    return matchesSearch && matchesType && matchesToxicity;
  });

  // Funciones para obtener etiquetas en español
  const getPlantTypeLabel = (type: PlantType): string => {
    const labels = {
      [PlantType.GRASS]: "Pasto",
      [PlantType.LEGUME]: "Leguminosa",
      [PlantType.HERB]: "Hierba",
      [PlantType.TREE_LEAF]: "Hoja de Árbol",
      [PlantType.SHRUB]: "Arbusto",
      [PlantType.AQUATIC]: "Acuática",
    };
    return labels[type];
  };

  const getToxicityLabel = (toxicity: ToxicityLevel): string => {
    const labels = {
      [ToxicityLevel.SAFE]: "Segura",
      [ToxicityLevel.CAUTION]: "Precaución",
      [ToxicityLevel.MODERATE]: "Moderada",
      [ToxicityLevel.HIGH]: "Alta",
      [ToxicityLevel.TOXIC]: "Tóxica",
    };
    return labels[toxicity];
  };

  const getToxicityColor = (toxicity: ToxicityLevel): string => {
    const colors = {
      [ToxicityLevel.SAFE]: "text-green-600 bg-green-100",
      [ToxicityLevel.CAUTION]: "text-yellow-600 bg-yellow-100",
      [ToxicityLevel.MODERATE]: "text-orange-600 bg-orange-100",
      [ToxicityLevel.HIGH]: "text-red-600 bg-red-100",
      [ToxicityLevel.TOXIC]: "text-red-800 bg-red-200",
    };
    return colors[toxicity];
  };

  const getSeasonLabel = (season: Season): string => {
    const labels = {
      [Season.SPRING]: "Primavera",
      [Season.SUMMER]: "Verano",
      [Season.FALL]: "Otoño",
      [Season.WINTER]: "Invierno",
    };
    return labels[season];
  };

  // Función para agregar nueva planta
  const handleAddPlant = async () => {
    if (!formData.name || !formData.scientificName || !formData.plantType) {
      showNotification("⚠️ Por favor completa los campos requeridos", "error");
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Guardando nueva planta...');
      
      const newPlant = await plantsAPI.createPlant(formData);
      const mappedPlant = mapBackendPlant(newPlant);
      setPlants(prev => [...prev, mappedPlant]);
      
      setFormData({});
      setShowAddForm(false);
      showNotification("✅ Planta agregada correctamente", "success");
    } catch (error) {
      console.error('💥 Error agregando planta:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      showNotification(`❌ Error al agregar: ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Función para editar planta
  const handleEditPlant = async (plantId: string) => {
    try {
      setSaving(true);
      console.log('💾 Actualizando planta existente...');
      
      const updatedPlant = await plantsAPI.updatePlant(plantId, formData);
      const mappedPlant = mapBackendPlant(updatedPlant);
      setPlants(prev => prev.map(p => p.id === plantId ? mappedPlant : p));
      
      setEditingPlant(null);
      setFormData({});
      showNotification("✅ Planta actualizada correctamente", "success");
    } catch (error) {
      console.error('💥 Error actualizando planta:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      showNotification(`❌ Error al actualizar: ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar planta
  const handleDeletePlant = async (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;
    
    const confirmMessage = `¿Estás seguro de eliminar la planta "${plant.name}"?`;
    if (window.confirm(confirmMessage)) {
      try {
        setSaving(true);
        console.log('🗑️ Eliminando planta:', plantId);
        
        await plantsAPI.deletePlant(plantId);
        setPlants(prev => prev.filter(p => p.id !== plantId));
        showNotification("✅ Planta eliminada correctamente", "success");
      } catch (error) {
        console.error('💥 Error eliminando planta:', error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        showNotification(`❌ Error al eliminar: ${errorMessage}`, "error");
      } finally {
        setSaving(false);
      }
    }
  };

  // Función para iniciar edición
  const startEdit = (plant: Plant) => {
    setEditingPlant(plant.id);
    setFormData(plant);
  };

  // Función para cancelar edición
  const cancelEdit = () => {
    setEditingPlant(null);
    setFormData({});
  };

  // Función para reintentar conexión
  const handleRetryConnection = async () => {
    console.log('🔄 Reintentando conexión...');
    setLoading(true);
    setError(null);
    
    try {
      const isHealthy = await plantsAPI.checkHealth();
      setConnected(isHealthy);
      
      if (isHealthy) {
        const backendPlants = await plantsAPI.getPlants();
        const mappedPlants = backendPlants.map(mapBackendPlant);
        setPlants(mappedPlants);
        showNotification("🔄 Conexión restablecida correctamente", "success");
      } else {
        setError("Servidor no disponible");
        showNotification("❌ No se pudo establecer conexión", "error");
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      showNotification(`❌ Error de conexión: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent">
            </div>
            <div>
              <span className="text-lg font-medium text-gray-700">
                🔌 Conectando al Backend
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Verificando servidor en puerto 5000...
              </p>
              <p className="text-xs text-gray-400 font-mono">
                http://localhost:5000/api
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="container mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                🌱 Gestión de Plantas Alimenticias
              </h1>
              <p className="text-white/90 text-lg">
                Administra el catálogo completo de plantas para alimentación animal
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Indicador de conexión */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-2 rounded-full">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">✅ Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-2 rounded-full">
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">❌ Desconectado</span>
                    <button
                      onClick={handleRetryConnection}
                      disabled={loading}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "🔄"}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={!connected}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-3 rounded-lg shadow-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span>➕ Agregar Planta</span>
              </button>
            </div>
          </div>

          {/* Panel de estado de conexión */}
          {connected && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">🟢 Sistema Conectado</h3>
                  <p className="text-xs text-green-600 font-mono">
                    Backend: http://localhost:5000/api ✓
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-800">
                    🌱 {plants.length} plantas cargadas
                  </p>
                  <p className="text-xs text-green-600">
                    Filtradas: {filteredPlants.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de error de conexión */}
        {error && !connected && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-lg">🔌 Error de Conexión al Backend</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                
                <div className="mt-4 bg-red-100 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">🔧 Información técnica:</h4>
                  <div className="text-sm text-red-700 space-y-1 font-mono">
                    <p><strong>URL del Backend:</strong> http://localhost:5000/api</p>
                    <p><strong>Health Check:</strong> /health</p>
                    <p><strong>Endpoint Plantas:</strong> /events?eventType=plant_feeding</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleRetryConnection}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>{loading ? "🔄 Conectando..." : "🔄 Reintentar Conexión"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario para agregar planta */}
        {showAddForm && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ➕ Agregar Nueva Planta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="🌱 Nombre de la planta *"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
              <input
                type="text"
                placeholder="🔬 Nombre científico *"
                value={formData.scientificName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, scientificName: e.target.value })
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
              <select
                value={formData.plantType || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plantType: e.target.value as PlantType,
                  })
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="">📋 Seleccionar tipo *</option>
                <option value={PlantType.GRASS}>🌾 Pasto</option>
                <option value={PlantType.LEGUME}>🌿 Leguminosa</option>
                <option value={PlantType.HERB}>🌱 Hierba</option>
                <option value={PlantType.TREE_LEAF}>🍃 Hoja de Árbol</option>
                <option value={PlantType.SHRUB}>🌳 Arbusto</option>
                <option value={PlantType.AQUATIC}>💧 Acuática</option>
              </select>
              <select
                value={formData.toxicityLevel || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    toxicityLevel: e.target.value as ToxicityLevel,
                  })
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="">⚠️ Nivel de toxicidad</option>
                <option value={ToxicityLevel.SAFE}>✅ Segura</option>
                <option value={ToxicityLevel.CAUTION}>⚠️ Precaución</option>
                <option value={ToxicityLevel.MODERATE}>🟠 Moderada</option>
                <option value={ToxicityLevel.HIGH}>🔴 Alta</option>
                <option value={ToxicityLevel.TOXIC}>☠️ Tóxica</option>
              </select>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isNative || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isNative: e.target.checked })
                    }
                    className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
                  />
                  <span className="text-sm">🏞️ Nativa</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecommended || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isRecommended: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
                  />
                  <span className="text-sm">⭐ Recomendada</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                placeholder="📝 Notas de alimentación..."
                value={formData.feedingNotes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, feedingNotes: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPlant}
                disabled={saving || !connected}
                className="bg-[#519a7c] text-white px-6 py-2 rounded-lg hover:bg-[#457e68] transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? "💾 Guardando..." : "💾 Guardar"}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({});
                }}
                disabled={saving}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>❌ Cancelar</span>
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="🔍 Buscar plantas por nombre, nombre científico o común..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-3">
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as PlantType | "all")
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">📋 Todos los tipos</option>
                <option value={PlantType.GRASS}>🌾 Pastos</option>
                <option value={PlantType.LEGUME}>🌿 Leguminosas</option>
                <option value={PlantType.HERB}>🌱 Hierbas</option>
                <option value={PlantType.TREE_LEAF}>🍃 Hojas de Árbol</option>
                <option value={PlantType.SHRUB}>🌳 Arbustos</option>
                <option value={PlantType.AQUATIC}>💧 Acuáticas</option>
              </select>

              <select
                value={selectedToxicity}
                onChange={(e) =>
                  setSelectedToxicity(e.target.value as ToxicityLevel | "all")
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">⚠️ Todos los niveles</option>
                <option value={ToxicityLevel.SAFE}>✅ Seguras</option>
                <option value={ToxicityLevel.CAUTION}>⚠️ Precaución</option>
                <option value={ToxicityLevel.MODERATE}>🟠 Moderadas</option>
                <option value={ToxicityLevel.HIGH}>🔴 Altas</option>
                <option value={ToxicityLevel.TOXIC}>☠️ Tóxicas</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#519a7c]">
                {filteredPlants.length}
              </div>
              <div className="text-sm text-gray-600">🌱 Plantas mostradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredPlants.filter(
                    (p) => p.toxicityLevel === ToxicityLevel.SAFE
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">✅ Seguras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredPlants.filter((p) => p.isRecommended).length}
              </div>
              <div className="text-sm text-gray-600">⭐ Recomendadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredPlants.filter((p) => p.isNative).length}
              </div>
              <div className="text-sm text-gray-600">🏞️ Nativas</div>
            </div>
          </div>
        </div>

        {/* Grid de plantas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant, _index) => (
            <div
              key={plant.id}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen de la planta */}
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {plant.isRecommended && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ Recomendada
                    </span>
                  )}
                  {plant.isNative && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      🏞️ Nativa
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getToxicityColor(
                      plant.toxicityLevel
                    )}`}
                  >
                    {getToxicityLabel(plant.toxicityLevel)}
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6">
                {editingPlant === plant.id ? (
                  // Modo edición
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded text-lg font-bold"
                      placeholder="🌱 Nombre de la planta"
                    />
                    <input
                      type="text"
                      value={formData.scientificName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scientificName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm italic"
                      placeholder="🔬 Nombre científico"
                    />
                    <select
                      value={formData.plantType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plantType: e.target.value as PlantType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs"
                    >
                      <option value={PlantType.GRASS}>🌾 Pasto</option>
                      <option value={PlantType.LEGUME}>🌿 Leguminosa</option>
                      <option value={PlantType.HERB}>🌱 Hierba</option>
                      <option value={PlantType.TREE_LEAF}>🍃 Hoja de Árbol</option>
                      <option value={PlantType.SHRUB}>🌳 Arbusto</option>
                      <option value={PlantType.AQUATIC}>💧 Acuática</option>
                    </select>
                    <textarea
                      value={formData.feedingNotes || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          feedingNotes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      rows={3}
                      placeholder="📝 Notas de alimentación..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlant(plant.id)}
                        disabled={saving || !connected}
                        className="flex-1 bg-[#519a7c] text-white py-2 px-3 rounded-lg hover:bg-[#457e68] transition-colors duration-200 flex items-center justify-center space-x-1 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="text-sm">{saving ? "💾 Guardando..." : "💾 Guardar"}</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        🌱 {plant.name}
                      </h3>
                      <p className="text-sm text-gray-600 italic">
                        🔬 {plant.scientificName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📋 {getPlantTypeLabel(plant.plantType)}
                      </p>
                    </div>

                    {/* Información nutricional destacada */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-[#519a7c]">
                          {plant.nutritionalValue.protein}%
                        </div>
                        <div className="text-xs text-gray-600">🥩 Proteína</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">
                          {plant.nutritionalValue.digestibility}%
                        </div>
                        <div className="text-xs text-gray-600">
                          🔄 Digestibilidad
                        </div>
                      </div>
                    </div>

                    {/* Temporada */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {plant.seasonality.map((season) => (
                          <span
                            key={season}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                          >
                            {getSeasonLabel(season)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notas de alimentación */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      📝 {plant.feedingNotes}
                    </p>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(plant)}
                        disabled={!connected || saving}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-sm">✏️ Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePlant(plant.id)}
                        disabled={!connected || saving}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredPlants.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {connected ? "🌱 No se encontraron plantas" : "🔌 Sin conexión al servidor"}
            </h3>
            <p className="text-white/80">
              {connected 
                ? (searchTerm || selectedType !== "all" || selectedToxicity !== "all"
                   ? "Intenta ajustar los filtros de búsqueda"
                   : "Agrega tu primera planta al catálogo")
                : "Conecta al servidor para ver el catálogo de plantas"}
            </p>
          </div>
        )}
      </div>

      {/* Notificación */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`px-6 py-4 rounded-lg shadow-xl border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-500' 
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-500'
              : 'bg-blue-50 text-blue-800 border-blue-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {notification.type === 'info' && <Sprout className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floors;