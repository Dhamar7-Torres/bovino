import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Plus,
  TrendingDown,
  BarChart3,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  MapPin,
  User,
  X,
  Save,
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

interface ExpiryAlert {
  id: string;
  medicationName: string;
  batchNumber: string;
  expirationDate: Date;
  currentStock: number;
  daysToExpiry: number;
  priority: "high" | "medium" | "low";
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

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`px-4 sm:px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`px-4 sm:px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}> = ({ children, onClick, variant = "default", size = "default", className = "", type = "button", disabled = false }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "low_stock": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "out_of_stock": return "bg-red-100 text-red-800 border-red-200";
      case "expired": return "bg-red-100 text-red-800 border-red-200";
      case "near_expiry": return "bg-orange-100 text-orange-800 border-orange-200";
      case "antibiotic": return "bg-blue-100 text-blue-800 border-blue-200";
      case "vaccine": return "bg-purple-100 text-purple-800 border-purple-200";
      case "antiparasitic": return "bg-green-100 text-green-800 border-green-200";
      case "antiinflammatory": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "vitamin": return "bg-orange-100 text-orange-800 border-orange-200";
      case "hormone": return "bg-pink-100 text-pink-800 border-pink-200";
      case "anesthetic": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "other": return "bg-gray-100 text-gray-800 border-gray-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "success": return "bg-green-100 text-green-800 border-green-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Componente ExpiryAlertCard corregido
const ExpiryAlertCard: React.FC<{ alert: ExpiryAlert }> = ({ alert }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return AlertTriangle;
      case "medium": return AlertCircle;
      case "low": return Clock;
      default: return Clock;
    }
  };

  const IconComponent = getPriorityIcon(alert.priority);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.priority === "high" ? "border-red-500 bg-red-50" :
        alert.priority === "medium" ? "border-yellow-500 bg-yellow-50" : "border-blue-500 bg-blue-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${
          alert.priority === "high" ? "text-red-600" :
          alert.priority === "medium" ? "text-yellow-600" : "text-blue-600"
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.medicationName}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p>Lote: {alert.batchNumber}</p>
            <p>Vence: {alert.expirationDate.toLocaleDateString()}</p>
            <p>Stock: {alert.currentStock} unidades</p>
            <p className="font-medium">
              {alert.daysToExpiry > 0 ? `${alert.daysToExpiry} días restantes` : "VENCIDO"}
            </p>
          </div>
        </div>
        <Badge variant={alert.priority}>
          {alert.priority === "high" ? "Urgente" : alert.priority === "medium" ? "Atención" : "Información"}
        </Badge>
      </div>
    </motion.div>
  );
};

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

  // Cargar datos del medicamento cuando se está editando
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
      // Reset form for new medication
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingMedication ? "Editar Medicamento" : "Agregar Nuevo Medicamento"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Genérico</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Principio Activo *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.activeIngredient}
                onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concentración *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.concentration}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Presentación *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Máximo *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad *</label>
              <input
                type="text"
                required
                placeholder="ej: frascos 100ml, tabletas, kg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Costo Unitario ($) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Almacén *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              >
                <option value="Almacén Principal">Almacén Principal</option>
                <option value="Almacén Secundario">Almacén Secundario</option>
                <option value="Refrigerador">Refrigerador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estante *</label>
              <input
                type="text"
                required
                placeholder="ej: A-1, B-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posición *</label>
              <input
                type="text"
                required
                placeholder="ej: 01, 02, 03"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Lote *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registro SENASA</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Retiro (días)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.withdrawalPeriod}
                onChange={(e) => setFormData({ ...formData, withdrawalPeriod: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones de Almacenamiento *</label>
            <textarea
              required
              rows={2}
              placeholder="ej: Refrigeración 2-8°C, proteger de la luz"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.storageConditions}
              onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresPrescription"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
              />
              <label htmlFor="requiresPrescription" className="ml-2 text-sm text-gray-700">
                Requiere Prescripción Veterinaria
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isControlled"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isControlled}
                onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
              />
              <label htmlFor="isControlled" className="ml-2 text-sm text-gray-700">
                Sustancia Controlada
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingMedication ? "Actualizar Medicamento" : "Guardar Medicamento"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MedicationDetailsModal: React.FC<{
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ medication, isOpen, onClose }) => {
  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Medicamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nombre Comercial</label>
                <p className="font-medium">{medication.name}</p>
              </div>
              {medication.genericName && (
                <div>
                  <label className="text-sm text-gray-600">Nombre Genérico</label>
                  <p className="font-medium">{medication.genericName}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Categoría</label>
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
              <div>
                <label className="text-sm text-gray-600">Estado</label>
                <div className="mt-1">
                  <Badge variant={medication.status}>
                    {medication.status === "available" ? "Disponible" :
                     medication.status === "low_stock" ? "Stock bajo" :
                     medication.status === "out_of_stock" ? "Sin stock" :
                     medication.status === "near_expiry" ? "Por vencer" : "Vencido"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Fabricante</label>
                <p className="font-medium">{medication.manufacturer}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Proveedor</label>
                <p className="font-medium">{medication.supplier}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Farmacológica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Principio Activo</label>
                <p className="font-medium">{medication.activeIngredient}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Concentración</label>
                <p className="font-medium">{medication.concentration}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Presentación</label>
                <p className="font-medium">
                  {medication.presentation === "injectable" ? "Inyectable" :
                   medication.presentation === "oral" ? "Oral" :
                   medication.presentation === "topical" ? "Tópico" :
                   medication.presentation === "powder" ? "Polvo" :
                   medication.presentation === "tablet" ? "Tableta" : "Suspensión"}
                </p>
              </div>
              {medication.withdrawalPeriod && (
                <div>
                  <label className="text-sm text-gray-600">Período de Retiro</label>
                  <p className="font-medium">{medication.withdrawalPeriod} días</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Stock Actual</label>
                <p className={`text-2xl font-bold ${
                  medication.currentStock <= medication.minStock ? "text-red-600" :
                  medication.currentStock <= medication.minStock * 1.5 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {medication.currentStock} {medication.unit}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Stock Mínimo</label>
                <p className="font-medium">{medication.minStock} {medication.unit}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Stock Máximo</label>
                <p className="font-medium">{medication.maxStock} {medication.unit}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Costo Unitario</label>
                <p className="font-medium">${medication.unitCost.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Valor Total</label>
                <p className="font-medium">${medication.totalValue.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Ubicación</label>
                <p className="font-medium">
                  {medication.location.warehouse} - {medication.location.shelf}-{medication.location.position}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Lote</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Número de Lote</label>
                <p className="font-medium">{medication.batchNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Fecha de Vencimiento</label>
                <p className={`font-medium ${
                  new Date(medication.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 ? "text-red-600" :
                  new Date(medication.expirationDate).getTime() - new Date().getTime() < 60 * 24 * 60 * 60 * 1000 ? "text-yellow-600" : "text-gray-900"
                }`}>
                  {medication.expirationDate.toLocaleDateString()}
                </p>
              </div>
              {medication.registrationNumber && (
                <div>
                  <label className="text-sm text-gray-600">Registro SENASA</label>
                  <p className="font-medium">{medication.registrationNumber}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Última Actualización</label>
                <p className="font-medium">{medication.lastUpdated.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Descripción</label>
                <p className="font-medium">{medication.description}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Condiciones de Almacenamiento</label>
                <p className="font-medium">{medication.storageConditions}</p>
              </div>
              {(medication.requiresPrescription || medication.isControlled) && (
                <div>
                  <label className="text-sm text-gray-600">Restricciones</label>
                  <div className="flex gap-2 mt-1">
                    {medication.requiresPrescription && <Badge variant="other">Requiere Receta</Badge>}
                    {medication.isControlled && <Badge variant="other">Sustancia Controlada</Badge>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de confirmación para eliminar
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medicationName: string;
}> = ({ isOpen, onClose, onConfirm, medicationName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Eliminar Medicamento</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que deseas eliminar el medicamento <strong>"{medicationName}"</strong>? 
            Esta acción eliminará permanentemente toda la información relacionada.
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
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
      console.log("Medicamento actualizado:", updatedMedication);
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

      console.log("Nuevo medicamento creado:", newMedication);
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

      console.log("Medicamento eliminado:", medicationToDelete.name);
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

      const mockAlerts: ExpiryAlert[] = [
        {
          id: "1",
          medicationName: "Ivermectina 1%",
          batchNumber: "IVE-2024-203",
          expirationDate: new Date("2025-07-25"),
          currentStock: 8,
          daysToExpiry: 13,
          priority: "medium",
        },
        {
          id: "2",
          medicationName: "Vacuna Triple Bovina",
          batchNumber: "VAC-2024-156",
          expirationDate: new Date("2025-08-20"),
          currentStock: 3,
          daysToExpiry: 39,
          priority: "low",
        },
      ];

      setMedications(mockMedications);
      setMovements(mockMovements);
      setStats(mockStats);
      setExpiryAlerts(mockAlerts);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventario de Medicamentos</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestión y control de medicamentos veterinarios</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowMovements(!showMovements)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                {showMovements ? "Inventario" : "Movimientos"}
              </Button>
              <Button size="sm" onClick={() => setShowNewMedicationModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Medicamento
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {expiryAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="bg-white/80 backdrop-blur-md border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Alertas de Vencimiento
                </CardTitle>
                <CardDescription>Medicamentos próximos a vencer o que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiryAlerts.map((alert) => (
                    <ExpiryAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Medicamentos</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Valor Total</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Stock Bajo</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Por Vencer</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.nearExpiryItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4 space-y-4 sm:space-y-6">
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Medicamento, principio activo..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">Todas las ubicaciones</option>
                    <option value="Almacén Principal">Almacén Principal</option>
                    <option value="Almacén Secundario">Almacén Secundario</option>
                    <option value="Refrigerador">Refrigerador</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!showMovements ? (
                <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        Inventario de Medicamentos ({filteredMedications.length})
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Lista detallada de todos los medicamentos en inventario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredMedications.length > 0 ? (
                        <div className="space-y-4">
                          {filteredMedications.map((med) => (
                            <motion.div
                              key={med.id}
                              whileHover={{ scale: 1.01 }}
                              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                      {med.name}
                                    </h4>
                                    <Badge variant={med.category}>
                                      {med.category === "antibiotic" ? "Antibiótico" :
                                       med.category === "vaccine" ? "Vacuna" :
                                       med.category === "antiparasitic" ? "Antiparasitario" :
                                       med.category === "antiinflammatory" ? "Antiinflamatorio" :
                                       med.category === "vitamin" ? "Vitamina" :
                                       med.category === "hormone" ? "Hormona" :
                                       med.category === "anesthetic" ? "Anestésico" : "Otro"}
                                    </Badge>
                                    <Badge variant={med.status}>
                                      {med.status === "available" ? "Disponible" :
                                       med.status === "low_stock" ? "Stock bajo" :
                                       med.status === "out_of_stock" ? "Sin stock" :
                                       med.status === "near_expiry" ? "Por vencer" : "Vencido"}
                                    </Badge>
                                    {med.requiresPrescription && <Badge variant="other">Receta</Badge>}
                                  </div>

                                  <p className="text-gray-600 mb-3 text-sm sm:text-base">{med.description}</p>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                                    <div>
                                      <p className="text-gray-600">Principio activo:</p>
                                      <p className="font-medium break-words">{med.activeIngredient}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Concentración:</p>
                                      <p className="font-medium">{med.concentration}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Presentación:</p>
                                      <p className="font-medium">
                                        {med.presentation === "injectable" ? "Inyectable" :
                                         med.presentation === "oral" ? "Oral" :
                                         med.presentation === "topical" ? "Tópico" :
                                         med.presentation === "powder" ? "Polvo" :
                                         med.presentation === "tablet" ? "Tableta" : "Suspensión"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                                    <div>
                                      <p className="text-gray-600">Stock actual:</p>
                                      <p className={`font-bold text-base sm:text-lg ${
                                        med.currentStock <= med.minStock ? "text-red-600" :
                                        med.currentStock <= med.minStock * 1.5 ? "text-yellow-600" : "text-green-600"
                                      }`}>
                                        {med.currentStock} {med.unit}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Stock mínimo:</p>
                                      <p className="font-medium">{med.minStock} {med.unit}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Costo unitario:</p>
                                      <p className="font-medium">${med.unitCost.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Valor total:</p>
                                      <p className="font-medium">${med.totalValue.toFixed(2)}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                                    <div>
                                      <p className="text-gray-600">Ubicación:</p>
                                      <p className="font-medium">{med.location.warehouse} - {med.location.shelf}-{med.location.position}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Lote:</p>
                                      <p className="font-medium">{med.batchNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Vencimiento:</p>
                                      <p className={`font-medium ${
                                        new Date(med.expirationDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 ? "text-red-600" :
                                        new Date(med.expirationDate).getTime() - new Date().getTime() < 60 * 24 * 60 * 60 * 1000 ? "text-yellow-600" : "text-gray-900"
                                      }`}>
                                        {med.expirationDate.toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-xs sm:text-sm text-gray-600">
                                    <p><strong>Fabricante:</strong> {med.manufacturer}</p>
                                    <p><strong>Proveedor:</strong> {med.supplier}</p>
                                    <p><strong>Condiciones de almacenamiento:</strong> {med.storageConditions}</p>
                                    {med.withdrawalPeriod && (
                                      <p><strong>Período de retiro:</strong> {med.withdrawalPeriod} días</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-2 sm:ml-4 flex-shrink-0">
                                  <Button variant="outline" size="sm" onClick={() => handleViewMedication(med)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleEditMedication(med)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="danger" size="sm" onClick={() => handleDeleteMedication(med)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay medicamentos</h3>
                          <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            No se encontraron medicamentos que coincidan con los filtros seleccionados.
                          </p>
                          <Button onClick={() => setShowNewMedicationModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Primer Medicamento
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="movements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        Movimientos de Inventario ({movements.length})
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Historial de entradas, salidas y ajustes de inventario
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {movements.map((movement) => (
                          <motion.div
                            key={movement.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                    {movement.medicationName}
                                  </h4>
                                  <Badge variant={movement.type === "purchase" ? "success" : movement.type === "usage" ? "warning" : "other"}>
                                    {movement.type === "purchase" ? "Compra" :
                                     movement.type === "usage" ? "Uso" :
                                     movement.type === "adjustment" ? "Ajuste" :
                                     movement.type === "transfer" ? "Transferencia" :
                                     movement.type === "disposal" ? "Descarte" : "Devolución"}
                                  </Badge>
                                  <span className={`text-base sm:text-lg font-bold ${
                                    movement.quantity > 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{movement.date.toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{movement.performedBy}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{movement.location}</span>
                                  </div>
                                </div>

                                <p className="text-gray-600 mb-2 text-sm">
                                  <strong>Motivo:</strong> {movement.reason}
                                </p>

                                {movement.notes && (
                                  <p className="text-gray-600 mb-2 text-sm">
                                    <strong>Notas:</strong> {movement.notes}
                                  </p>
                                )}

                                {movement.animalName && (
                                  <p className="text-gray-600 mb-2 text-sm">
                                    <strong>Animal:</strong> {movement.animalName} ({movement.animalId})
                                  </p>
                                )}

                                {movement.supplier && (
                                  <p className="text-gray-600 mb-2 text-sm">
                                    <strong>Proveedor:</strong> {movement.supplier}
                                  </p>
                                )}

                                {movement.totalCost && (
                                  <p className="text-gray-600 mb-2 text-sm">
                                    <strong>Costo total:</strong> ${movement.totalCost.toLocaleString()}
                                  </p>
                                )}

                                {movement.batchNumber && (
                                  <p className="text-gray-600 text-sm">
                                    <strong>Lote:</strong> {movement.batchNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

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
  );
};

export default MedicationInventory;