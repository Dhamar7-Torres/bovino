import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Calendar,
  Search,
  Filter,
  Plus,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: "antibiotic" | "vaccine" | "antiparasitic" | "antiinflammatory" | "vitamin" | "hormone" | "anesthetic" | "other";
  manufacturer: string;
  supplier: string;
  description: string;
  activeIngredient: string;
  concentration: string;
  presentation: "injectable" | "oral" | "topical" | "powder" | "tablet" | "suspension";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: {
    warehouse: string;
    shelf: string;
    position: string;
  };
  expirationDate: Date;
  batchNumber: string;
  registrationNumber: string;
  storageConditions: string;
  withdrawalPeriod?: number;
  requiresPrescription: boolean;
  isControlled: boolean;
  lastUpdated: Date;
  status: "available" | "low_stock" | "out_of_stock" | "expired" | "near_expiry";
}

interface InventoryMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type: "purchase" | "usage" | "adjustment" | "transfer" | "disposal" | "return";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  reason: string;
  animalId?: string;
  animalName?: string;
  veterinarian?: string;
  supplier?: string;
  batchNumber?: string;
  expirationDate?: Date;
  location: string;
  performedBy: string;
  notes: string;
  referenceDocument?: string;
}

interface InventoryStats {
  totalMedications: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
  categoriesCount: number;
  monthlyConsumption: number;
  averageStockDays: number;
}

interface NewMedicationForm {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  supplier: string;
  description: string;
  activeIngredient: string;
  concentration: string;
  presentation: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  warehouse: string;
  shelf: string;
  position: string;
  expirationDate: string;
  batchNumber: string;
  registrationNumber: string;
  storageConditions: string;
  withdrawalPeriod: number;
  requiresPrescription: boolean;
  isControlled: boolean;
}

// Componentes base ajustados para evitar overflow
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden w-full max-w-full ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`p-2 sm:p-3 w-full max-w-full ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, variant = "default", size = "default", className = "", type = "button", disabled = false, fullWidth = false }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-w-0";
  const variantClasses = {
    default: "bg-[#519a7c] text-white hover:bg-[#4a8770] focus:ring-[#519a7c] shadow-lg hover:shadow-xl",
    outline: "border-2 border-[#519a7c] bg-white/80 text-[#519a7c] hover:bg-[#519a7c] hover:text-white focus:ring-[#519a7c]",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg",
    warning: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg",
  };
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm",
    default: "px-3 sm:px-4 py-2 text-xs sm:text-sm",
    lg: "px-4 sm:px-6 py-3 text-sm sm:text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
    >
      <span className="truncate">{children}</span>
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "available": return "bg-green-100 text-green-800 ring-green-600/30";
      case "low_stock": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      case "out_of_stock": return "bg-red-100 text-red-800 ring-red-600/30";
      case "expired": return "bg-red-100 text-red-800 ring-red-600/30";
      case "near_expiry": return "bg-orange-100 text-orange-800 ring-orange-600/30";
      case "antibiotic": return "bg-blue-100 text-blue-800 ring-blue-600/30";
      case "vaccine": return "bg-purple-100 text-purple-800 ring-purple-600/30";
      case "antiparasitic": return "bg-green-100 text-green-800 ring-green-600/30";
      case "antiinflammatory": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      case "vitamin": return "bg-orange-100 text-orange-800 ring-orange-600/30";
      case "hormone": return "bg-pink-100 text-pink-800 ring-pink-600/30";
      case "anesthetic": return "bg-indigo-100 text-indigo-800 ring-indigo-600/30";
      case "other": return "bg-gray-100 text-gray-800 ring-gray-600/30";
      case "success": return "bg-green-100 text-green-800 ring-green-600/30";
      case "warning": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      default: return "bg-gray-100 text-gray-800 ring-gray-600/30";
    }
  };

  return (
    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ring-inset whitespace-nowrap max-w-full truncate ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Modal completamente responsivo
const NewMedicationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: NewMedicationForm) => void;
  editingMedication?: Medication | null;
}> = ({ isOpen, onClose, onSave, editingMedication }) => {
  const [formData, setFormData] = useState<NewMedicationForm>({
    name: "",
    genericName: "",
    category: "antibiotic",
    manufacturer: "",
    supplier: "",
    description: "",
    activeIngredient: "",
    concentration: "",
    presentation: "injectable",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    unitCost: 0,
    warehouse: "Almacén Principal",
    shelf: "",
    position: "",
    expirationDate: "",
    batchNumber: "",
    registrationNumber: "",
    storageConditions: "",
    withdrawalPeriod: 0,
    requiresPrescription: false,
    isControlled: false,
  });

  useEffect(() => {
    if (editingMedication && isOpen) {
      setFormData({
        name: editingMedication.name,
        genericName: editingMedication.genericName || "",
        category: editingMedication.category,
        manufacturer: editingMedication.manufacturer,
        supplier: editingMedication.supplier,
        description: editingMedication.description,
        activeIngredient: editingMedication.activeIngredient,
        concentration: editingMedication.concentration,
        presentation: editingMedication.presentation,
        currentStock: editingMedication.currentStock,
        minStock: editingMedication.minStock,
        maxStock: editingMedication.maxStock,
        unit: editingMedication.unit,
        unitCost: editingMedication.unitCost,
        warehouse: editingMedication.location.warehouse,
        shelf: editingMedication.location.shelf,
        position: editingMedication.location.position,
        expirationDate: editingMedication.expirationDate.toISOString().split('T')[0],
        batchNumber: editingMedication.batchNumber,
        registrationNumber: editingMedication.registrationNumber,
        storageConditions: editingMedication.storageConditions,
        withdrawalPeriod: editingMedication.withdrawalPeriod || 0,
        requiresPrescription: editingMedication.requiresPrescription,
        isControlled: editingMedication.isControlled,
      });
    } else if (!editingMedication && isOpen) {
      setFormData({
        name: "",
        genericName: "",
        category: "antibiotic",
        manufacturer: "",
        supplier: "",
        description: "",
        activeIngredient: "",
        concentration: "",
        presentation: "injectable",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: "",
        unitCost: 0,
        warehouse: "Almacén Principal",
        shelf: "",
        position: "",
        expirationDate: "",
        batchNumber: "",
        registrationNumber: "",
        storageConditions: "",
        withdrawalPeriod: 0,
        requiresPrescription: false,
        isControlled: false,
      });
    }
  }, [editingMedication, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-end justify-center p-0 sm:p-2 text-center sm:items-center">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-3xl sm:max-h-[90vh] max-h-full"
        >
          {/* Fixed header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                {editingMedication ? "Editar Medicamento" : "Nuevo Medicamento"}
              </h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(90vh-140px)] overflow-x-hidden">
            <form onSubmit={handleSubmit} className="p-3 sm:p-6 w-full max-w-full">
              <div className="space-y-4 sm:space-y-6 w-full max-w-full">
                {/* Basic Info Section */}
                <div className="space-y-2 sm:space-y-3 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Básica
                  </h4>
                  
                  <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                    <div className="w-full max-w-full">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nombre Comercial *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Nombre Genérico
                        </label>
                        <input
                          type="text"
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.genericName}
                          onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                        />
                      </div>

                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="antibiotic">Antibiótico</option>
                          <option value="vaccine">Vacuna</option>
                          <option value="antiparasitic">Antiparasitario</option>
                          <option value="antiinflammatory">Antiinflamatorio</option>
                          <option value="vitamin">Vitamina</option>
                          <option value="hormone">Hormona</option>
                          <option value="anesthetic">Anestésico</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Fabricante *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.manufacturer}
                          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        />
                      </div>

                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Proveedor *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pharmaceutical Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Farmacológica
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Principio Activo *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.activeIngredient}
                        onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Concentración *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.concentration}
                        onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2 w-full max-w-full">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Presentación *
                      </label>
                      <select
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.presentation}
                        onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                      >
                        <option value="injectable">Inyectable</option>
                        <option value="oral">Oral</option>
                        <option value="topical">Tópico</option>
                        <option value="powder">Polvo</option>
                        <option value="tablet">Tableta</option>
                        <option value="suspension">Suspensión</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inventory Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información de Inventario
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Actual *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Mínimo *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Máximo *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Unidad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: frascos 100ml"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Costo Unitario ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.unitCost}
                        onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Ubicación
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Almacén *
                      </label>
                      <select
                        required
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.warehouse}
                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                      >
                        <option value="Almacén Principal">Principal</option>
                        <option value="Almacén Secundario">Secundario</option>
                        <option value="Refrigerador">Refrigerador</option>
                      </select>
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Estante *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="A-1"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.shelf}
                        onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Posición *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="01"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Batch Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información del Lote
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Número de Lote *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Registro SENASA
                      </label>
                      <input
                        type="text"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Período de Retiro (días)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.withdrawalPeriod}
                        onChange={(e) => setFormData({ ...formData, withdrawalPeriod: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Adicional
                  </h4>
                  
                  <div className="w-full max-w-full">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="w-full max-w-full">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Condiciones de Almacenamiento *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="ej: Refrigeración 2-8°C"
                      className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm resize-none"
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 w-full max-w-full">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requiresPrescription"
                        className="h-4 w-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                        checked={formData.requiresPrescription}
                        onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                      />
                      <label htmlFor="requiresPrescription" className="ml-2 text-xs sm:text-sm text-gray-700">
                        Requiere Prescripción Veterinaria
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isControlled"
                        className="h-4 w-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                        checked={formData.isControlled}
                        onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
                      />
                      <label htmlFor="isControlled" className="ml-2 text-xs sm:text-sm text-gray-700">
                        Sustancia Controlada
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed bottom buttons */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full max-w-full">
              <Button variant="outline" onClick={onClose} fullWidth className="sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" fullWidth className="sm:w-auto">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="truncate">{editingMedication ? "Actualizar" : "Guardar"}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente de tarjeta totalmente responsivo
const MedicationCard: React.FC<{
  medication: Medication;
  onView: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}> = ({ medication, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 w-full max-w-full">
      {/* Compact header for mobile */}
      <div className="p-3 bg-gradient-to-r from-[#519a7c]/10 to-[#f4ac3a]/10 border-b border-gray-100 w-full max-w-full">
        <div className="flex items-start justify-between gap-2 min-w-0 w-full max-w-full">
          <div className="min-w-0 flex-1 max-w-full">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate min-w-0 max-w-full">
                {medication.name}
              </h3>
              <Badge variant={medication.status}>
                {medication.status === "available" ? "✓" :
                 medication.status === "low_stock" ? "⚠" :
                 medication.status === "out_of_stock" ? "✗" :
                 medication.status === "near_expiry" ? "⏰" : "❌"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-600 w-full max-w-full">
              <span className="flex items-center gap-1 min-w-0 flex-1">
                <Package className="w-3 h-3 flex-shrink-0" />
                <span className={`font-medium ${
                  medication.currentStock <= medication.minStock ? "text-red-600" :
                  medication.currentStock <= medication.minStock * 1.5 ? "text-amber-600" : "text-green-600"
                }`}>
                  {medication.currentStock}
                </span>
                <span className="truncate">/ {medication.minStock} {medication.unit}</span>
              </span>
              <span className="font-medium flex-shrink-0">${medication.totalValue.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onView(medication)}
              className="p-1.5 rounded-lg hover:bg-[#519a7c]/10 text-[#519a7c] transition-colors"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onEdit(medication)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onDelete(medication)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden w-full max-w-full"
          >
            <div className="p-3 space-y-3 text-xs bg-gradient-to-r from-white to-gray-50/50 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Categoría:</span>
                  <div className="mt-1">
                    <Badge variant={medication.category}>
                      {medication.category === "antibiotic" ? "Antibiótico" :
                       medication.category === "vaccine" ? "Vacuna" :
                       medication.category === "antiparasitic" ? "Antiparasitario" :
                       medication.category === "antiinflammatory" ? "Antiinflamatorio" :
                       medication.category === "vitamin" ? "Vitamina" :
                       medication.category === "hormone" ? "Hormona" :
                       medication.category === "anesthetic" ? "Anestésico" : "Otro"}
                    </Badge>
                  </div>
                </div>
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Presentación:</span>
                  <p className="font-medium mt-1 break-words">
                    {medication.presentation === "injectable" ? "Inyectable" :
                     medication.presentation === "oral" ? "Oral" :
                     medication.presentation === "topical" ? "Tópico" :
                     medication.presentation === "powder" ? "Polvo" :
                     medication.presentation === "tablet" ? "Tableta" : "Suspensión"}
                  </p>
                </div>
              </div>

              <div className="min-w-0 max-w-full">
                <span className="text-gray-500">Principio Activo:</span>
                <p className="font-medium break-words">{medication.activeIngredient}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Concentración:</span>
                  <p className="font-medium break-words">{medication.concentration}</p>
                </div>
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Lote:</span>
                  <p className="font-medium break-words">{medication.batchNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Ubicación:</span>
                  <p className="font-medium break-words">
                    {medication.location.warehouse} - {medication.location.shelf}-{medication.location.position}
                  </p>
                </div>
                <div className="min-w-0 max-w-full">
                  <span className="text-gray-500">Vencimiento:</span>
                  <p className={`font-medium ${
                    new Date(medication.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 ? "text-red-600" :
                    new Date(medication.expirationDate).getTime() - new Date().getTime() < 60 * 24 * 60 * 60 * 1000 ? "text-amber-600" : "text-gray-900"
                  }`}>
                    {medication.expirationDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="min-w-0 max-w-full">
                <span className="text-gray-500">Descripción:</span>
                <p className="text-gray-700 break-words">{medication.description}</p>
              </div>

              {(medication.requiresPrescription || medication.isControlled) && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100 w-full max-w-full">
                  {medication.requiresPrescription && <Badge variant="other">Receta</Badge>}
                  {medication.isControlled && <Badge variant="other">Controlada</Badge>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Modal de detalles responsivo
const MedicationDetailsModal: React.FC<{
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ medication, isOpen, onClose }) => {
  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-end justify-center p-0 sm:p-2 text-center sm:items-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-xl max-h-full"
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                {medication.name}
              </h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-120px)] p-3 sm:p-4 space-y-4 overflow-x-hidden">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#519a7c]/10 to-[#519a7c]/5 rounded-xl border border-[#519a7c]/20 min-w-0 max-w-full">
                <div className={`text-xl sm:text-2xl font-bold ${
                  medication.currentStock <= medication.minStock ? "text-red-600" :
                  medication.currentStock <= medication.minStock * 1.5 ? "text-amber-600" : "text-green-600"
                }`}>
                  {medication.currentStock}
                </div>
                <div className="text-xs text-gray-600 break-words">{medication.unit} en stock</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#f4ac3a]/10 to-[#f4ac3a]/5 rounded-xl border border-[#f4ac3a]/20 min-w-0 max-w-full">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${medication.totalValue.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600">Valor total</div>
              </div>
            </div>

            {/* Status and category */}
            <div className="flex flex-wrap gap-2 w-full max-w-full">
              <Badge variant={medication.status}>
                {medication.status === "available" ? "Disponible" :
                 medication.status === "low_stock" ? "Stock bajo" :
                 medication.status === "out_of_stock" ? "Sin stock" :
                 medication.status === "near_expiry" ? "Por vencer" : "Vencido"}
              </Badge>
              <Badge variant={medication.category}>
                {medication.category === "antibiotic" ? "Antibiótico" :
                 medication.category === "vaccine" ? "Vacuna" :
                 medication.category === "antiparasitic" ? "Antiparasitario" :
                 medication.category === "antiinflammatory" ? "Antiinflamatorio" :
                 medication.category === "vitamin" ? "Vitamina" :
                 medication.category === "hormone" ? "Hormona" :
                 medication.category === "anesthetic" ? "Anestésico" : "Otro"}
              </Badge>
              {medication.requiresPrescription && <Badge variant="other">Requiere Receta</Badge>}
              {medication.isControlled && <Badge variant="other">Controlada</Badge>}
            </div>

            {/* Details sections */}
            <div className="space-y-4 text-xs sm:text-sm w-full max-w-full">
              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Información Farmacológica</h4>
                <div className="space-y-2 w-full max-w-full">
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Principio Activo: </span>
                    <span className="font-medium break-words">{medication.activeIngredient}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Concentración: </span>
                    <span className="font-medium break-words">{medication.concentration}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Presentación: </span>
                    <span className="font-medium">
                      {medication.presentation === "injectable" ? "Inyectable" :
                       medication.presentation === "oral" ? "Oral" :
                       medication.presentation === "topical" ? "Tópico" :
                       medication.presentation === "powder" ? "Polvo" :
                       medication.presentation === "tablet" ? "Tableta" : "Suspensión"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Inventario</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Mínimo: </span>
                    <span className="font-medium break-words">{medication.minStock} {medication.unit}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Máximo: </span>
                    <span className="font-medium break-words">{medication.maxStock} {medication.unit}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Costo unitario: </span>
                    <span className="font-medium">${medication.unitCost.toFixed(2)}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Ubicación: </span>
                    <span className="font-medium break-words">
                      {medication.location.warehouse} - {medication.location.shelf}-{medication.location.position}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Lote y Vencimiento</h4>
                <div className="space-y-2 w-full max-w-full">
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Número de Lote: </span>
                    <span className="font-medium break-words">{medication.batchNumber}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Vencimiento: </span>
                    <span className={`font-medium ${
                      new Date(medication.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 ? "text-red-600" :
                      new Date(medication.expirationDate).getTime() - new Date().getTime() < 60 * 24 * 60 * 60 * 1000 ? "text-amber-600" : "text-gray-900"
                    }`}>
                      {medication.expirationDate.toLocaleDateString()}
                    </span>
                  </div>
                  {medication.registrationNumber && (
                    <div className="min-w-0 max-w-full">
                      <span className="text-gray-600">Registro SENASA: </span>
                      <span className="font-medium break-words">{medication.registrationNumber}</span>
                    </div>
                  )}
                  {medication.withdrawalPeriod && (
                    <div className="min-w-0 max-w-full">
                      <span className="text-gray-600">Período de Retiro: </span>
                      <span className="font-medium">{medication.withdrawalPeriod} días</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700 break-words">{medication.description}</p>
              </div>

              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Almacenamiento</h4>
                <p className="text-gray-700 break-words">{medication.storageConditions}</p>
              </div>

              <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                <h4 className="font-medium text-gray-900 mb-2">Proveedor</h4>
                <div className="space-y-1 w-full max-w-full">
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Fabricante: </span>
                    <span className="font-medium break-words">{medication.manufacturer}</span>
                  </div>
                  <div className="min-w-0 max-w-full">
                    <span className="text-gray-600">Proveedor: </span>
                    <span className="font-medium break-words">{medication.supplier}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 px-3 sm:px-4 py-3 sm:py-4">
            <Button variant="outline" onClick={onClose} fullWidth>
              Cerrar
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Modal de confirmación responsivo
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medicationName: string;
}> = ({ isOpen, onClose, onConfirm, medicationName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-md"
        >
          <div className="p-4 sm:p-6 w-full max-w-full">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 min-w-0 w-full max-w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Eliminar Medicamento</h3>
                <p className="text-xs sm:text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-4 sm:mb-6 w-full max-w-full">
              ¿Estás seguro de que deseas eliminar <strong className="break-words">"{medicationName}"</strong>?
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full max-w-full">
              <Button variant="outline" onClick={onClose} fullWidth className="sm:w-auto">
                Cancelar
              </Button>
              <Button variant="danger" onClick={onConfirm} fullWidth className="sm:w-auto">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="truncate">Eliminar</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente principal totalmente responsivo
const MedicationInventory: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalMedications: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0,
    nearExpiryItems: 0,
    categoriesCount: 0,
    monthlyConsumption: 0,
    averageStockDays: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showMovements, setShowMovements] = useState(false);
  const [showNewMedicationModal, setShowNewMedicationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleNewMedication = (medicationData: NewMedicationForm) => {
    if (editingMedication) {
      // Actualizar medicamento existente
      const updatedMedication: Medication = {
        ...editingMedication,
        name: medicationData.name,
        genericName: medicationData.genericName || undefined,
        category: medicationData.category as any,
        manufacturer: medicationData.manufacturer,
        supplier: medicationData.supplier,
        description: medicationData.description,
        activeIngredient: medicationData.activeIngredient,
        concentration: medicationData.concentration,
        presentation: medicationData.presentation as any,
        currentStock: medicationData.currentStock,
        minStock: medicationData.minStock,
        maxStock: medicationData.maxStock,
        unit: medicationData.unit,
        unitCost: medicationData.unitCost,
        totalValue: medicationData.currentStock * medicationData.unitCost,
        location: {
          warehouse: medicationData.warehouse,
          shelf: medicationData.shelf,
          position: medicationData.position,
        },
        expirationDate: new Date(medicationData.expirationDate),
        batchNumber: medicationData.batchNumber,
        registrationNumber: medicationData.registrationNumber,
        storageConditions: medicationData.storageConditions,
        withdrawalPeriod: medicationData.withdrawalPeriod > 0 ? medicationData.withdrawalPeriod : undefined,
        requiresPrescription: medicationData.requiresPrescription,
        isControlled: medicationData.isControlled,
        lastUpdated: new Date(),
        status: medicationData.currentStock <= medicationData.minStock ? "low_stock" :
                 medicationData.currentStock === 0 ? "out_of_stock" : "available",
      };

      setMedications(prev => prev.map(med => med.id === editingMedication.id ? updatedMedication : med));
      
      // Recalcular estadísticas
      setStats(prev => {
        const oldValue = editingMedication.totalValue;
        const newValue = updatedMedication.totalValue;
        const oldLowStock = editingMedication.status === "low_stock" ? 1 : 0;
        const newLowStock = updatedMedication.status === "low_stock" ? 1 : 0;
        
        return {
          ...prev,
          totalValue: prev.totalValue - oldValue + newValue,
          lowStockItems: prev.lowStockItems - oldLowStock + newLowStock,
        };
      });

      setEditingMedication(null);
    } else {
      // Crear nuevo medicamento
      const newMedication: Medication = {
        id: generateId(),
        name: medicationData.name,
        genericName: medicationData.genericName || undefined,
        category: medicationData.category as any,
        manufacturer: medicationData.manufacturer,
        supplier: medicationData.supplier,
        description: medicationData.description,
        activeIngredient: medicationData.activeIngredient,
        concentration: medicationData.concentration,
        presentation: medicationData.presentation as any,
        currentStock: medicationData.currentStock,
        minStock: medicationData.minStock,
        maxStock: medicationData.maxStock,
        unit: medicationData.unit,
        unitCost: medicationData.unitCost,
        totalValue: medicationData.currentStock * medicationData.unitCost,
        location: {
          warehouse: medicationData.warehouse,
          shelf: medicationData.shelf,
          position: medicationData.position,
        },
        expirationDate: new Date(medicationData.expirationDate),
        batchNumber: medicationData.batchNumber,
        registrationNumber: medicationData.registrationNumber,
        storageConditions: medicationData.storageConditions,
        withdrawalPeriod: medicationData.withdrawalPeriod > 0 ? medicationData.withdrawalPeriod : undefined,
        requiresPrescription: medicationData.requiresPrescription,
        isControlled: medicationData.isControlled,
        lastUpdated: new Date(),
        status: medicationData.currentStock <= medicationData.minStock ? "low_stock" :
                 medicationData.currentStock === 0 ? "out_of_stock" : "available",
      };

      setMedications(prev => [newMedication, ...prev]);
      setStats(prev => ({
        ...prev,
        totalMedications: prev.totalMedications + 1,
        totalValue: prev.totalValue + newMedication.totalValue,
        lowStockItems: newMedication.status === "low_stock" ? prev.lowStockItems + 1 : prev.lowStockItems,
      }));
    }
  };

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowDetailsModal(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowNewMedicationModal(true);
  };

  const handleDeleteMedication = (medication: Medication) => {
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedication = () => {
    if (medicationToDelete) {
      setMedications(prev => prev.filter(med => med.id !== medicationToDelete.id));
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalMedications: prev.totalMedications - 1,
        totalValue: prev.totalValue - medicationToDelete.totalValue,
        lowStockItems: medicationToDelete.status === "low_stock" ? prev.lowStockItems - 1 : prev.lowStockItems,
      }));

      setMedicationToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewMedicationModal(false);
    setEditingMedication(null);
  };

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockMedications: Medication[] = [
        {
          id: "1",
          name: "Penicilina G Procaínica",
          genericName: "Penicilina",
          category: "antibiotic",
          manufacturer: "Laboratorios Veterinarios SA",
          supplier: "Distribuidora Animal Health",
          description: "Antibiótico de amplio espectro para infecciones bacterianas",
          activeIngredient: "Penicilina G Procaínica",
          concentration: "300,000 UI/ml",
          presentation: "injectable",
          currentStock: 15,
          minStock: 5,
          maxStock: 50,
          unit: "frascos 100ml",
          unitCost: 45.5,
          totalValue: 682.5,
          location: { warehouse: "Almacén Principal", shelf: "A-2", position: "03" },
          expirationDate: new Date("2025-12-15"),
          batchNumber: "PEN-2024-089",
          registrationNumber: "SENASA-001234",
          storageConditions: "Refrigeración 2-8°C",
          withdrawalPeriod: 14,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-10"),
          status: "available",
        },
        {
          id: "2",
          name: "Vacuna Triple Bovina",
          category: "vaccine",
          manufacturer: "BioVet Labs",
          supplier: "Suministros Pecuarios",
          description: "Vacuna contra IBR, BVD y PI3",
          activeIngredient: "Virus inactivados IBR, BVD, PI3",
          concentration: "1 dosis/2ml",
          presentation: "injectable",
          currentStock: 3,
          minStock: 10,
          maxStock: 100,
          unit: "frascos 50 dosis",
          unitCost: 125.0,
          totalValue: 375.0,
          location: { warehouse: "Almacén Principal", shelf: "B-1", position: "07" },
          expirationDate: new Date("2025-08-20"),
          batchNumber: "VAC-2024-156",
          registrationNumber: "SENASA-005678",
          storageConditions: "Refrigeración 2-8°C, no congelar",
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-08"),
          status: "low_stock",
        },
        {
          id: "3",
          name: "Ivermectina 1%",
          category: "antiparasitic",
          manufacturer: "PharmaVet",
          supplier: "Distribuidora Animal Health",
          description: "Antiparasitario interno y externo",
          activeIngredient: "Ivermectina",
          concentration: "10mg/ml",
          presentation: "injectable",
          currentStock: 8,
          minStock: 5,
          maxStock: 30,
          unit: "frascos 50ml",
          unitCost: 28.75,
          totalValue: 230.0,
          location: { warehouse: "Almacén Principal", shelf: "A-3", position: "12" },
          expirationDate: new Date("2025-07-25"),
          batchNumber: "IVE-2024-203",
          registrationNumber: "SENASA-009876",
          storageConditions: "Temperatura ambiente, proteger de luz",
          withdrawalPeriod: 28,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-11"),
          status: "near_expiry",
        },
        {
          id: "4",
          name: "Meloxicam 2%",
          category: "antiinflammatory",
          manufacturer: "VetPharm Solutions",
          supplier: "Suministros Pecuarios",
          description: "Antiinflamatorio no esteroideo",
          activeIngredient: "Meloxicam",
          concentration: "20mg/ml",
          presentation: "injectable",
          currentStock: 0,
          minStock: 3,
          maxStock: 20,
          unit: "frascos 100ml",
          unitCost: 67.25,
          totalValue: 0,
          location: { warehouse: "Almacén Principal", shelf: "C-1", position: "05" },
          expirationDate: new Date("2026-03-10"),
          batchNumber: "MEL-2024-445",
          registrationNumber: "SENASA-012345",
          storageConditions: "Temperatura ambiente",
          withdrawalPeriod: 5,
          requiresPrescription: true,
          isControlled: false,
          lastUpdated: new Date("2025-07-09"),
          status: "out_of_stock",
        },
        {
          id: "5",
          name: "Complejo B + Hierro",
          category: "vitamin",
          manufacturer: "NutriVet",
          supplier: "Distribuidora Animal Health",
          description: "Complejo vitamínico con hierro",
          activeIngredient: "Vitaminas B1, B6, B12 + Hierro",
          concentration: "Multivitamínico",
          presentation: "injectable",
          currentStock: 22,
          minStock: 8,
          maxStock: 40,
          unit: "frascos 50ml",
          unitCost: 18.9,
          totalValue: 415.8,
          location: { warehouse: "Almacén Principal", shelf: "D-2", position: "18" },
          expirationDate: new Date("2026-01-30"),
          batchNumber: "VIT-2024-678",
          registrationNumber: "SENASA-054321",
          storageConditions: "Proteger de luz y humedad",
          requiresPrescription: false,
          isControlled: false,
          lastUpdated: new Date("2025-07-12"),
          status: "available",
        },
      ];

      const mockMovements: InventoryMovement[] = [
        {
          id: "1",
          medicationId: "1",
          medicationName: "Penicilina G Procaínica",
          type: "usage",
          quantity: -2,
          date: new Date("2025-07-10"),
          reason: "Tratamiento mastitis",
          animalId: "COW002",
          animalName: "Luna",
          veterinarian: "Dr. López",
          batchNumber: "PEN-2024-089",
          location: "Establo B",
          performedBy: "Dr. López",
          notes: "Aplicación según protocolo de mastitis",
        },
        {
          id: "2",
          medicationId: "2",
          medicationName: "Vacuna Triple Bovina",
          type: "purchase",
          quantity: 5,
          unitCost: 125.0,
          totalCost: 625.0,
          date: new Date("2025-07-08"),
          reason: "Reposición de stock",
          supplier: "Suministros Pecuarios",
          batchNumber: "VAC-2024-156",
          expirationDate: new Date("2025-08-20"),
          location: "Almacén Principal",
          performedBy: "Admin",
          notes: "Compra de emergencia por bajo stock",
          referenceDocument: "FAC-2025-00456",
        },
      ];

      const mockStats: InventoryStats = {
        totalMedications: 48,
        totalValue: 15750.3,
        lowStockItems: 8,
        expiredItems: 2,
        nearExpiryItems: 5,
        categoriesCount: 7,
        monthlyConsumption: 3245.8,
        averageStockDays: 45,
      };

      setMedications(mockMedications);
      setMovements(mockMovements);
      setStats(mockStats);
    };

    loadData();
  }, []);

  const filteredMedications = medications.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || med.status === selectedStatus;
    const matchesLocation = selectedLocation === "all" || med.location.warehouse === selectedLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] overflow-x-hidden max-w-screen">
      {/* Layout totalmente responsivo */}
      <div className="w-full max-w-5xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
        {/* Header mejorado */}
        <Card>
          <CardContent className="p-3 sm:p-4 w-full max-w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4 min-w-0 w-full max-w-full">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#519a7c] to-[#4a8770] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 max-w-full">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Inventario de Medicamentos</h1>
                  <p className="text-xs text-gray-600 truncate">Gestión y control veterinario</p>
                </div>
              </div>
              <Button onClick={() => setShowNewMedicationModal(true)} className="flex-shrink-0">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Agregar</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>

            {/* Stats grid mejorado */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 w-full max-w-full">
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalMedications}</div>
                <div className="text-xs text-blue-600 truncate">Total</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">$</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</div>
                <div className="text-xs text-green-600 truncate">Valor</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">⚠</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-amber-600">{stats.lowStockItems}</div>
                <div className="text-xs text-amber-600 truncate">Stock Bajo</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">⏰</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.nearExpiryItems}</div>
                <div className="text-xs text-red-600 truncate">Por Vencer</div>
              </div>
            </div>

            {/* Controles de búsqueda */}
            <div className="space-y-3 sm:space-y-4 w-full max-w-full">
              <div className="relative w-full max-w-full">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar medicamentos..."
                  className="w-full max-w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 sm:gap-3 w-full max-w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 min-w-0"
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="truncate">Filtros</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMovements(!showMovements)}
                  className="flex-1 min-w-0"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="truncate">{showMovements ? "Inventario" : "Movimientos"}</span>
                </Button>
              </div>
            </div>

            {/* Filtros colapsables */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden w-full max-w-full"
                >
                  <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 w-full max-w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">Todas las categorías</option>
                        <option value="antibiotic">Antibióticos</option>
                        <option value="vaccine">Vacunas</option>
                        <option value="antiparasitic">Antiparasitarios</option>
                        <option value="vitamin">Vitaminas</option>
                        <option value="hormone">Hormonas</option>
                        <option value="anesthetic">Anestésicos</option>
                        <option value="other">Otros</option>
                      </select>

                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="available">Disponible</option>
                        <option value="low_stock">Stock bajo</option>
                        <option value="out_of_stock">Sin stock</option>
                        <option value="near_expiry">Por vencer</option>
                        <option value="expired">Vencido</option>
                      </select>

                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        <option value="all">Todas las ubicaciones</option>
                        <option value="Almacén Principal">Almacén Principal</option>
                        <option value="Almacén Secundario">Almacén Secundario</option>
                        <option value="Refrigerador">Refrigerador</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        <AnimatePresence mode="wait">
          {!showMovements ? (
            <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredMedications.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  {filteredMedications.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onView={handleViewMedication}
                      onEdit={handleEditMedication}
                      onDelete={handleDeleteMedication}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center w-full max-w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay medicamentos</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-full break-words">
                      No se encontraron medicamentos que coincidan con los filtros seleccionados.
                    </p>
                    <Button onClick={() => setShowNewMedicationModal(true)}>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">Agregar Primer Medicamento</span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div key="movements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                {movements.map((movement) => (
                  <Card key={movement.id}>
                    <CardContent className="p-3 sm:p-4 w-full max-w-full">
                      <div className="flex items-start justify-between gap-3 min-w-0 w-full max-w-full">
                        <div className="min-w-0 flex-1 max-w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate min-w-0 max-w-full">
                              {movement.medicationName}
                            </h3>
                            <Badge variant={movement.type === "purchase" ? "success" : movement.type === "usage" ? "warning" : "other"}>
                              {movement.type === "purchase" ? "Compra" :
                               movement.type === "usage" ? "Uso" :
                               movement.type === "adjustment" ? "Ajuste" :
                               movement.type === "transfer" ? "Transferencia" :
                               movement.type === "disposal" ? "Descarte" : "Devolución"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2 w-full max-w-full">
                            <span className="flex items-center gap-1 min-w-0 flex-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{movement.date.toLocaleDateString()}</span>
                            </span>
                            <span className={`font-medium text-sm ${
                              movement.quantity > 0 ? "text-green-600" : "text-red-600"
                            } flex-shrink-0`}>
                              {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 break-words w-full max-w-full">
                            <strong>Motivo:</strong> {movement.reason}
                          </p>

                          {movement.notes && (
                            <p className="text-xs text-gray-600 break-words mt-1 w-full max-w-full">
                              <strong>Notas:</strong> {movement.notes}
                            </p>
                          )}

                          {movement.totalCost && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Costo:</strong> ${movement.totalCost.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <NewMedicationModal
          isOpen={showNewMedicationModal}
          onClose={handleCloseModal}
          onSave={handleNewMedication}
          editingMedication={editingMedication}
        />

        <MedicationDetailsModal
          medication={selectedMedication}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteMedication}
          medicationName={medicationToDelete?.name || ""}
        />
      </div>
    </div>
  );
};

export default MedicationInventory;