import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Check,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<PlantType | "all">("all");
  const [selectedToxicity, setSelectedToxicity] = useState<
    ToxicityLevel | "all"
  >("all");
  const [editingPlant, setEditingPlant] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Plant>>({});

  // Datos simulados de plantas para desarrollo
  const mockPlants: Plant[] = [
    {
      id: "1",
      name: "Alfalfa",
      scientificName: "Medicago sativa",
      commonNames: ["Lucerna", "Mielga"],
      plantType: PlantType.LEGUME,
      nutritionalValue: {
        protein: 18.5,
        fiber: 32.0,
        moisture: 12.0,
        minerals: {
          calcium: 1.2,
          phosphorus: 0.25,
          potassium: 2.1,
          magnesium: 0.3,
        },
        vitamins: {
          vitaminA: 15000,
          vitaminC: 25,
          vitaminE: 8,
        },
        digestibility: 75,
        energyContent: 2.4,
      },
      toxicityLevel: ToxicityLevel.SAFE,
      seasonality: [Season.SPRING, Season.SUMMER, Season.FALL],
      growthConditions: {
        soilType: ["franco", "arcilloso", "arenoso"],
        phRange: { min: 6.5, max: 7.5 },
        sunlightNeeds: "full",
        waterRequirements: "moderate",
        temperatureRange: { min: 5, max: 35 },
        altitudeRange: { min: 0, max: 2000 },
      },
      harvestInfo: {
        bestHarvestTime: "Antes de floración completa",
        harvestFrequency: "Cada 30-40 días",
        storageMethod: "Henificado o ensilado",
        shelfLife: 365,
        processingRequired: true,
      },
      feedingNotes:
        "Excelente fuente de proteína. Introducir gradualmente para evitar timpanismo.",
      imageUrl: "/api/placeholder/300/200",
      isNative: false,
      isRecommended: true,
      lastUpdated: new Date(),
      createdBy: "Dr. García",
    },
    {
      id: "2",
      name: "Pasto Estrella",
      scientificName: "Cynodon nlemfuensis",
      commonNames: ["Estrella africana", "Bermuda estrella"],
      plantType: PlantType.GRASS,
      nutritionalValue: {
        protein: 12.0,
        fiber: 28.5,
        moisture: 75.0,
        minerals: {
          calcium: 0.4,
          phosphorus: 0.3,
          potassium: 2.8,
          magnesium: 0.2,
        },
        vitamins: {
          vitaminA: 8000,
          vitaminC: 15,
          vitaminE: 5,
        },
        digestibility: 65,
        energyContent: 2.1,
      },
      toxicityLevel: ToxicityLevel.SAFE,
      seasonality: [Season.SPRING, Season.SUMMER, Season.FALL],
      growthConditions: {
        soilType: ["franco", "arcilloso"],
        phRange: { min: 5.5, max: 7.0 },
        sunlightNeeds: "full",
        waterRequirements: "high",
        temperatureRange: { min: 15, max: 40 },
        altitudeRange: { min: 0, max: 1500 },
      },
      harvestInfo: {
        bestHarvestTime: "45-60 días de rebrote",
        harvestFrequency: "Cada 45 días",
        storageMethod: "Pastoreo directo o henificado",
        shelfLife: 180,
        processingRequired: false,
      },
      feedingNotes:
        "Pasto de alta productividad. Ideal para pastoreo rotacional.",
      imageUrl: "/api/placeholder/300/200",
      isNative: false,
      isRecommended: true,
      lastUpdated: new Date(),
      createdBy: "Ing. Martínez",
    },
    {
      id: "3",
      name: "Moringa",
      scientificName: "Moringa oleifera",
      commonNames: ["Árbol de la vida", "Ben", "Drumstick"],
      plantType: PlantType.TREE_LEAF,
      nutritionalValue: {
        protein: 25.0,
        fiber: 19.0,
        moisture: 8.0,
        minerals: {
          calcium: 2.0,
          phosphorus: 0.35,
          potassium: 1.3,
          magnesium: 0.4,
        },
        vitamins: {
          vitaminA: 38000,
          vitaminC: 200,
          vitaminE: 15,
        },
        digestibility: 80,
        energyContent: 2.8,
      },
      toxicityLevel: ToxicityLevel.SAFE,
      seasonality: [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
      growthConditions: {
        soilType: ["arenoso", "franco"],
        phRange: { min: 6.0, max: 8.0 },
        sunlightNeeds: "full",
        waterRequirements: "low",
        temperatureRange: { min: 20, max: 45 },
        altitudeRange: { min: 0, max: 1000 },
      },
      harvestInfo: {
        bestHarvestTime: "Hojas jóvenes cada 2-3 meses",
        harvestFrequency: "Cada 60-90 días",
        storageMethod: "Secado al sol o fresco",
        shelfLife: 90,
        processingRequired: true,
      },
      feedingNotes:
        "Suplemento nutricional excepcional. Rica en aminoácidos esenciales.",
      imageUrl: "/api/placeholder/300/200",
      isNative: false,
      isRecommended: true,
      lastUpdated: new Date(),
      createdBy: "Dr. Rodríguez",
    },
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadPlants = async () => {
      setLoading(true);
      try {
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setPlants(mockPlants);
      } catch (error) {
        console.error("Error cargando plantas:", error);
      } finally {
        setLoading(false);
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
  const handleAddPlant = () => {
    const newPlant: Plant = {
      id: Date.now().toString(),
      name: formData.name || "",
      scientificName: formData.scientificName || "",
      commonNames: formData.commonNames || [],
      plantType: formData.plantType || PlantType.GRASS,
      nutritionalValue: formData.nutritionalValue || {
        protein: 0,
        fiber: 0,
        moisture: 0,
        minerals: { calcium: 0, phosphorus: 0, potassium: 0, magnesium: 0 },
        vitamins: { vitaminA: 0, vitaminC: 0, vitaminE: 0 },
        digestibility: 0,
        energyContent: 0,
      },
      toxicityLevel: formData.toxicityLevel || ToxicityLevel.SAFE,
      seasonality: formData.seasonality || [],
      growthConditions: formData.growthConditions || {
        soilType: [],
        phRange: { min: 0, max: 14 },
        sunlightNeeds: "full",
        waterRequirements: "moderate",
        temperatureRange: { min: 0, max: 50 },
        altitudeRange: { min: 0, max: 3000 },
      },
      harvestInfo: formData.harvestInfo || {
        bestHarvestTime: "",
        harvestFrequency: "",
        storageMethod: "",
        shelfLife: 0,
        processingRequired: false,
      },
      feedingNotes: formData.feedingNotes || "",
      imageUrl: "/api/placeholder/300/200",
      isNative: formData.isNative || false,
      isRecommended: formData.isRecommended || false,
      lastUpdated: new Date(),
      createdBy: "Usuario Actual",
    };

    setPlants([...plants, newPlant]);
    setFormData({});
    setShowAddForm(false);
  };

  // Función para editar planta
  const handleEditPlant = (plantId: string) => {
    const updatedPlants = plants.map((plant) =>
      plant.id === plantId
        ? { ...plant, ...formData, lastUpdated: new Date() }
        : plant
    );
    setPlants(updatedPlants);
    setEditingPlant(null);
    setFormData({});
  };

  // Función para eliminar planta
  const handleDeletePlant = (plantId: string) => {
    setPlants(plants.filter((plant) => plant.id !== plantId));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sprout className="h-8 w-8 text-[#519a7c]" />
            </motion.div>
            <span className="text-lg font-medium text-gray-700">
              Cargando plantas disponibles...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="container mx-auto px-6 py-8">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Gestión de Plantas Alimenticias
              </h1>
              <p className="text-white/90 text-lg">
                Administra el catálogo completo de plantas para alimentación
                animal
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-3 rounded-lg shadow-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Planta</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Formulario para agregar planta */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Agregar Nueva Planta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre de la planta"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Nombre científico"
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
                  <option value="">Seleccionar tipo</option>
                  <option value={PlantType.GRASS}>Pasto</option>
                  <option value={PlantType.LEGUME}>Leguminosa</option>
                  <option value={PlantType.HERB}>Hierba</option>
                  <option value={PlantType.TREE_LEAF}>Hoja de Árbol</option>
                  <option value={PlantType.SHRUB}>Arbusto</option>
                  <option value={PlantType.AQUATIC}>Acuática</option>
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
                  <option value="">Nivel de toxicidad</option>
                  <option value={ToxicityLevel.SAFE}>Segura</option>
                  <option value={ToxicityLevel.CAUTION}>Precaución</option>
                  <option value={ToxicityLevel.MODERATE}>Moderada</option>
                  <option value={ToxicityLevel.HIGH}>Alta</option>
                  <option value={ToxicityLevel.TOXIC}>Tóxica</option>
                </select>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isNative || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isNative: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Nativa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isRecommended: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Recomendada
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <textarea
                  placeholder="Notas de alimentación"
                  value={formData.feedingNotes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, feedingNotes: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddPlant}
                  className="bg-[#519a7c] text-white px-6 py-2 rounded-lg hover:bg-[#457e68] transition-colors duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({});
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de búsqueda y filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar plantas por nombre, nombre científico o común..."
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
                <option value="all">Todos los tipos</option>
                <option value={PlantType.GRASS}>Pastos</option>
                <option value={PlantType.LEGUME}>Leguminosas</option>
                <option value={PlantType.HERB}>Hierbas</option>
                <option value={PlantType.TREE_LEAF}>Hojas de Árbol</option>
                <option value={PlantType.SHRUB}>Arbustos</option>
                <option value={PlantType.AQUATIC}>Acuáticas</option>
              </select>

              <select
                value={selectedToxicity}
                onChange={(e) =>
                  setSelectedToxicity(e.target.value as ToxicityLevel | "all")
                }
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                <option value={ToxicityLevel.SAFE}>Seguras</option>
                <option value={ToxicityLevel.CAUTION}>Precaución</option>
                <option value={ToxicityLevel.MODERATE}>Moderadas</option>
                <option value={ToxicityLevel.HIGH}>Altas</option>
                <option value={ToxicityLevel.TOXIC}>Tóxicas</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#519a7c]">
                {filteredPlants.length}
              </div>
              <div className="text-sm text-gray-600">Plantas mostradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredPlants.filter(
                    (p) => p.toxicityLevel === ToxicityLevel.SAFE
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Seguras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredPlants.filter((p) => p.isRecommended).length}
              </div>
              <div className="text-sm text-gray-600">Recomendadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredPlants.filter((p) => p.isNative).length}
              </div>
              <div className="text-sm text-gray-600">Nativas</div>
            </div>
          </div>
        </motion.div>

        {/* Grid de plantas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
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
                        Recomendada
                      </span>
                    )}
                    {plant.isNative && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Nativa
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
                        <option value={PlantType.GRASS}>Pasto</option>
                        <option value={PlantType.LEGUME}>Leguminosa</option>
                        <option value={PlantType.HERB}>Hierba</option>
                        <option value={PlantType.TREE_LEAF}>
                          Hoja de Árbol
                        </option>
                        <option value={PlantType.SHRUB}>Arbusto</option>
                        <option value={PlantType.AQUATIC}>Acuática</option>
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
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditPlant(plant.id)}
                          className="flex-1 bg-[#519a7c] text-white py-2 px-3 rounded-lg hover:bg-[#457e68] transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Guardar</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-gray-600 italic">
                          {plant.scientificName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getPlantTypeLabel(plant.plantType)}
                        </p>
                      </div>

                      {/* Información nutricional destacada */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-[#519a7c]">
                            {plant.nutritionalValue.protein}%
                          </div>
                          <div className="text-xs text-gray-600">Proteína</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-blue-600">
                            {plant.nutritionalValue.digestibility}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Digestibilidad
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
                        {plant.feedingNotes}
                      </p>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEdit(plant)}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm">Editar</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePlant(plant.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Mensaje cuando no hay resultados */}
        {filteredPlants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Sprout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No se encontraron plantas
            </h3>
            <p className="text-white/80">
              Intenta ajustar los filtros de búsqueda o agregar una nueva planta
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Floors;
