import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  Eye,
  Plus,
  Minus,
  BarChart3,
  Truck,
  Scale,
  Clock,
  Search,
} from "lucide-react";

// Tipos de alimento disponibles
type FeedType =
  | "hay"
  | "grain"
  | "pellets"
  | "silage"
  | "supplements"
  | "mineral";

// Interfaz para los elementos del inventario
interface FeedItem {
  id: string;
  name: string;
  type: FeedType;
  current_stock: number;
  min_threshold: number;
  max_capacity: number;
  unit: "kg" | "tons" | "bags" | "units";
  cost_per_unit: number;
  supplier: string;
  location: {
    lat: number;
    lng: number;
    storage_name: string;
    building: string;
  };
  last_updated: string;
  expiry_date?: string;
  batch_number?: string;
  consumption_rate: number; // por día
  days_remaining: number;
  status: "adequate" | "low" | "critical" | "overstocked";
  nutritional_info?: {
    protein_percent: number;
    fiber_percent: number;
    energy_value: number; // MJ/kg
  };
}

// Interfaz para movimientos de inventario
interface InventoryMovement {
  id: string;
  feed_id: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  timestamp: string;
  reason: string;
  user: string;
  location: string;
}

// Interfaz para filtros
interface InventoryFilter {
  type: FeedType | "all";
  status: "adequate" | "low" | "critical" | "overstocked" | "all";
  search: string;
  location: string | "all";
}

const FeedInventory: React.FC = () => {
  // Estados principales
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>(
    []
  );
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Estados para filtros y vista
  const [filters, setFilters] = useState<InventoryFilter>({
    type: "all",
    status: "all",
    search: "",
    location: "all",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Cargar datos simulados
  useEffect(() => {
    const loadInventoryData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockFeedItems: FeedItem[] = [
        {
          id: "feed-001",
          name: "Premium Alfalfa Hay",
          type: "hay",
          current_stock: 2.5,
          min_threshold: 1.0,
          max_capacity: 10.0,
          unit: "tons",
          cost_per_unit: 450,
          supplier: "Green Valley Farms",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            storage_name: "Hay Barn A",
            building: "Storage Building 1",
          },
          last_updated: "2025-07-11T08:00:00Z",
          expiry_date: "2026-01-15T00:00:00Z",
          batch_number: "HB-2024-089",
          consumption_rate: 0.35,
          days_remaining: 7,
          status: "low",
          nutritional_info: {
            protein_percent: 18.5,
            fiber_percent: 32.0,
            energy_value: 8.5,
          },
        },
        {
          id: "feed-002",
          name: "Corn Grain Feed",
          type: "grain",
          current_stock: 850,
          min_threshold: 200,
          max_capacity: 1500,
          unit: "kg",
          cost_per_unit: 2.8,
          supplier: "AgriCorp Solutions",
          location: {
            lat: 14.632,
            lng: -90.5055,
            storage_name: "Grain Silo 2",
            building: "Central Silo Complex",
          },
          last_updated: "2025-07-11T06:30:00Z",
          expiry_date: "2025-12-20T00:00:00Z",
          batch_number: "CG-2024-156",
          consumption_rate: 45,
          days_remaining: 19,
          status: "adequate",
          nutritional_info: {
            protein_percent: 8.2,
            fiber_percent: 2.8,
            energy_value: 14.2,
          },
        },
        {
          id: "feed-003",
          name: "Cattle Pellets Premium",
          type: "pellets",
          current_stock: 45,
          min_threshold: 50,
          max_capacity: 200,
          unit: "bags",
          cost_per_unit: 28.5,
          supplier: "NutriCattle Inc.",
          location: {
            lat: 14.6355,
            lng: -90.508,
            storage_name: "Feed Store Room",
            building: "Main Feed Building",
          },
          last_updated: "2025-07-10T16:45:00Z",
          expiry_date: "2025-09-30T00:00:00Z",
          batch_number: "CP-2024-078",
          consumption_rate: 3.2,
          days_remaining: 14,
          status: "critical",
          nutritional_info: {
            protein_percent: 16.0,
            fiber_percent: 12.5,
            energy_value: 11.8,
          },
        },
        {
          id: "feed-004",
          name: "Mineral Supplement Mix",
          type: "supplements",
          current_stock: 180,
          min_threshold: 25,
          max_capacity: 300,
          unit: "kg",
          cost_per_unit: 8.2,
          supplier: "VitaMin Livestock",
          location: {
            lat: 14.634,
            lng: -90.507,
            storage_name: "Supplement Storage",
            building: "Veterinary Building",
          },
          last_updated: "2025-07-11T09:15:00Z",
          expiry_date: "2026-03-15T00:00:00Z",
          batch_number: "MS-2024-203",
          consumption_rate: 2.1,
          days_remaining: 86,
          status: "overstocked",
          nutritional_info: {
            protein_percent: 0,
            fiber_percent: 0,
            energy_value: 0,
          },
        },
        {
          id: "feed-005",
          name: "Corn Silage Fresh",
          type: "silage",
          current_stock: 15.2,
          min_threshold: 8.0,
          max_capacity: 25.0,
          unit: "tons",
          cost_per_unit: 180,
          supplier: "Local Farm Cooperative",
          location: {
            lat: 14.633,
            lng: -90.5065,
            storage_name: "Silage Pit 1",
            building: "Outdoor Storage Area",
          },
          last_updated: "2025-07-11T07:20:00Z",
          expiry_date: "2025-08-30T00:00:00Z",
          batch_number: "CS-2024-042",
          consumption_rate: 1.8,
          days_remaining: 8,
          status: "low",
          nutritional_info: {
            protein_percent: 7.5,
            fiber_percent: 28.0,
            energy_value: 10.2,
          },
        },
      ];

      const mockMovements: InventoryMovement[] = [
        {
          id: "mov-001",
          feed_id: "feed-002",
          type: "out",
          quantity: 120,
          timestamp: "2025-07-11T08:30:00Z",
          reason: "Daily feeding - Morning shift",
          user: "Juan García",
          location: "Pasture B",
        },
        {
          id: "mov-002",
          feed_id: "feed-001",
          type: "out",
          quantity: 0.8,
          timestamp: "2025-07-11T07:15:00Z",
          reason: "Feeding cattle group A",
          user: "María López",
          location: "Barn 1",
        },
        {
          id: "mov-003",
          feed_id: "feed-003",
          type: "in",
          quantity: 20,
          timestamp: "2025-07-10T14:00:00Z",
          reason: "New delivery from supplier",
          user: "Carlos Mendoza",
          location: "Feed Store Room",
        },
      ];

      setFeedItems(mockFeedItems);
      setFilteredItems(mockFeedItems);
      setRecentMovements(mockMovements);
      setIsLoading(false);
    };

    loadInventoryData();
  }, []);

  // Filtrar elementos cuando cambien los filtros
  useEffect(() => {
    let filtered = feedItems;

    if (filters.type !== "all") {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.supplier.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.location.storage_name
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    if (filters.location !== "all") {
      filtered = filtered.filter((item) =>
        item.location.building
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [feedItems, filters]);

  // Función para obtener el color del estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "adequate":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "low":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "overstocked":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Función para obtener el ícono del tipo de alimento
  const getFeedTypeIcon = (type: FeedType) => {
    switch (type) {
      case "hay":
        return <Package className="w-5 h-5" />;
      case "grain":
        return <Scale className="w-5 h-5" />;
      case "pellets":
        return <Package className="w-5 h-5" />;
      case "silage":
        return <Truck className="w-5 h-5" />;
      case "supplements":
        return <Plus className="w-5 h-5" />;
      case "mineral":
        return <Plus className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Calcular estadísticas generales
  const totalValue = feedItems.reduce(
    (sum, item) => sum + item.current_stock * item.cost_per_unit,
    0
  );
  const criticalItems = feedItems.filter(
    (item) => item.status === "critical"
  ).length;
  const lowStockItems = feedItems.filter(
    (item) => item.status === "low"
  ).length;

  // Componente para el card de inventario
  const InventoryCard: React.FC<{ item: FeedItem; index: number }> = ({
    item,
    index,
  }) => {
    const stockPercentage = (item.current_stock / item.max_capacity) * 100;
    const isExpiringSoon =
      item.expiry_date &&
      new Date(item.expiry_date).getTime() - new Date().getTime() <
        30 * 24 * 60 * 60 * 1000; // 30 días

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => {
          setSelectedItem(item);
          setShowDetails(true);
        }}
        className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                   cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-lg"
      >
        {/* Header del card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${getStatusColor(item.status)}`}>
              {getFeedTypeIcon(item.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{item.name}</h3>
              <p className="text-white/60 text-sm capitalize">{item.type}</p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              item.status
            )}`}
          >
            {item.status}
          </div>
        </div>

        {/* Información de stock */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Current Stock</span>
            <span className="text-white font-semibold">
              {item.current_stock} {item.unit}
            </span>
          </div>

          {/* Barra de progreso del stock */}
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
              className={`h-full rounded-full ${
                stockPercentage < 20
                  ? "bg-red-500"
                  : stockPercentage < 40
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between mt-1 text-xs text-white/50">
            <span>
              Min: {item.min_threshold} {item.unit}
            </span>
            <span>
              Max: {item.max_capacity} {item.unit}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Days remaining:</span>
            <span
              className={`font-medium ${
                item.days_remaining < 7
                  ? "text-red-400"
                  : item.days_remaining < 14
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {item.days_remaining} days
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/60">Cost per {item.unit}:</span>
            <span className="text-white font-medium">
              ${item.cost_per_unit}
            </span>
          </div>

          <div className="flex items-center text-white/60">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{item.location.storage_name}</span>
          </div>
        </div>

        {/* Alertas de expiración */}
        {isExpiringSoon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 p-2 bg-red-500/20 rounded-lg"
          >
            <Clock className="w-4 h-4 text-red-400" />
          </motion.div>
        )}

        {/* Indicador de movimiento reciente */}
        {recentMovements.some((mov) => mov.feed_id === item.id) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full"
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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Feed Inventory
            </h1>
            <p className="text-white/70">
              Monitor feed stock levels and consumption rates
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex space-x-6 mt-4 lg:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                ${totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-white/60">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {criticalItems}
              </div>
              <div className="text-xs text-white/60">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {lowStockItems}
              </div>
              <div className="text-xs text-white/60">Low Stock</div>
            </div>
          </div>
        </motion.div>

        {/* Controles de filtro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search feed items..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex space-x-3">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value as FeedType | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="hay">Hay</option>
                <option value="grain">Grain</option>
                <option value="pellets">Pellets</option>
                <option value="silage">Silage</option>
                <option value="supplements">Supplements</option>
                <option value="mineral">Mineral</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as typeof filters.status,
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="adequate">Adequate</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="overstocked">Overstocked</option>
              </select>

              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg
                         text-purple-300 hover:bg-purple-600/30 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid de inventario */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No items found
              </h3>
              <p className="text-white/50">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <InventoryCard key={item.id} item={item} index={index} />
            ))
          )}
        </motion.div>

        {/* Modal de detalles */}
        <AnimatePresence>
          {showDetails && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 
                         p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header del modal */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl ${getStatusColor(
                        selectedItem.status
                      )}`}
                    >
                      {getFeedTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedItem.name}
                      </h2>
                      <p className="text-white/60 capitalize">
                        {selectedItem.type} • {selectedItem.supplier}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Minus className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información de stock */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Stock Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Current Stock:</span>
                        <span className="text-white font-medium">
                          {selectedItem.current_stock} {selectedItem.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Min Threshold:</span>
                        <span className="text-white font-medium">
                          {selectedItem.min_threshold} {selectedItem.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Max Capacity:</span>
                        <span className="text-white font-medium">
                          {selectedItem.max_capacity} {selectedItem.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          Daily Consumption:
                        </span>
                        <span className="text-white font-medium">
                          {selectedItem.consumption_rate} {selectedItem.unit}
                          /day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información financiera */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Financial Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          Cost per {selectedItem.unit}:
                        </span>
                        <span className="text-white font-medium">
                          ${selectedItem.cost_per_unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Total Value:</span>
                        <span className="text-white font-medium">
                          $
                          {(
                            selectedItem.current_stock *
                            selectedItem.cost_per_unit
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Supplier:</span>
                        <span className="text-white font-medium">
                          {selectedItem.supplier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información nutricional */}
                  {selectedItem.nutritional_info && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">
                        Nutritional Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Protein:</span>
                          <span className="text-white font-medium">
                            {selectedItem.nutritional_info.protein_percent}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Fiber:</span>
                          <span className="text-white font-medium">
                            {selectedItem.nutritional_info.fiber_percent}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Energy Value:</span>
                          <span className="text-white font-medium">
                            {selectedItem.nutritional_info.energy_value} MJ/kg
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información de ubicación */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Location Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-white/60 mr-2" />
                        <span className="text-white">
                          {selectedItem.location.storage_name}
                        </span>
                      </div>
                      <div className="text-white/60">
                        Building: {selectedItem.location.building}
                      </div>
                      <div className="text-white/60">
                        Coordinates: {selectedItem.location.lat},{" "}
                        {selectedItem.location.lng}
                      </div>
                      {selectedItem.batch_number && (
                        <div className="text-white/60">
                          Batch: {selectedItem.batch_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-3 mt-6">
                  <button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 
                                   rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Location
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-300 
                                   rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 
                                   rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedInventory;
