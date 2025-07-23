import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Syringe,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Shield,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Target,
} from "lucide-react";

// Interfaces TypeScript - Comentarios en español
interface VaccinationRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  administrationDate: Date;
  dose: string;
  route: AdministrationRoute;
  site: InjectionSite;
  administeredBy: string;
  veterinarianId?: string;
  veterinarianName?: string;
  cost: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reactions?: VaccinationReaction[];
  nextDueDate?: Date;
  status: VaccinationStatus;
  notes?: string;
  certificationNumber?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface VaccinationReaction {
  id: string;
  type: ReactionType;
  severity: ReactionSeverity;
  onset: Date;
  duration?: number; // en horas
  description: string;
  treatment?: string;
  resolved: boolean;
  resolvedDate?: Date;
}

// Enums para tipos específicos
enum AdministrationRoute {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous", 
  INTRAVENOUS = "intravenous",
  ORAL = "oral",
  NASAL = "nasal",
}

enum InjectionSite {
  NECK = "neck",
  SHOULDER = "shoulder",
  THIGH = "thigh",
  RUB = "rub",
  OTHER = "other",
}

enum VaccinationStatus {
  COMPLETED = "completed",
  SCHEDULED = "scheduled",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

enum ReactionType {
  LOCAL_SWELLING = "local_swelling",
  FEVER = "fever",
  LETHARGY = "lethargy",
  ANAPHYLAXIS = "anaphylaxis",
  INJECTION_SITE_ABSCESS = "injection_site_abscess",
  OTHER = "other",
}

enum ReactionSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  LIFE_THREATENING = "life_threatening",
}

// Interface para el formulario de vacunación
interface VaccinationFormData {
  animalId: string;
  animalName: string;
  animalTag: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  administrationDate: string;
  dose: string;
  route: AdministrationRoute;
  site: InjectionSite;
  administeredBy: string;
  veterinarianId: string;
  veterinarianName: string;
  cost: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  nextDueDate: string;
  status: VaccinationStatus;
  notes: string;
  certificationNumber: string;
}

// Componente del formulario de vacunación
const VaccinationForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VaccinationFormData) => void;
  editRecord?: VaccinationRecord | null;
}> = ({ isOpen, onClose, onSave, editRecord }) => {
  const [formData, setFormData] = useState<VaccinationFormData>({
    animalId: "",
    animalName: "",
    animalTag: "",
    vaccineName: "",
    manufacturer: "",
    batchNumber: "",
    expirationDate: "",
    administrationDate: new Date().toISOString().split('T')[0],
    dose: "",
    route: AdministrationRoute.INTRAMUSCULAR,
    site: InjectionSite.NECK,
    administeredBy: "",
    veterinarianId: "",
    veterinarianName: "",
    cost: 0,
    location: {
      latitude: 0,
      longitude: 0,
      address: "",
    },
    nextDueDate: "",
    status: VaccinationStatus.COMPLETED,
    notes: "",
    certificationNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (editRecord) {
      setFormData({
        animalId: editRecord.animalId,
        animalName: editRecord.animalName,
        animalTag: editRecord.animalTag,
        vaccineName: editRecord.vaccineName,
        manufacturer: editRecord.manufacturer,
        batchNumber: editRecord.batchNumber,
        expirationDate: editRecord.expirationDate.toISOString().split('T')[0],
        administrationDate: editRecord.administrationDate.toISOString().split('T')[0],
        dose: editRecord.dose,
        route: editRecord.route,
        site: editRecord.site,
        administeredBy: editRecord.administeredBy,
        veterinarianId: editRecord.veterinarianId || "",
        veterinarianName: editRecord.veterinarianName || "",
        cost: editRecord.cost,
        location: editRecord.location,
        nextDueDate: editRecord.nextDueDate ? editRecord.nextDueDate.toISOString().split('T')[0] : "",
        status: editRecord.status,
        notes: editRecord.notes || "",
        certificationNumber: editRecord.certificationNumber || "",
      });
    } else {
      // Reset form for new record
      setFormData({
        animalId: "",
        animalName: "",
        animalTag: "",
        vaccineName: "",
        manufacturer: "",
        batchNumber: "",
        expirationDate: "",
        administrationDate: new Date().toISOString().split('T')[0],
        dose: "",
        route: AdministrationRoute.INTRAMUSCULAR,
        site: InjectionSite.NECK,
        administeredBy: "",
        veterinarianId: "",
        veterinarianName: "",
        cost: 0,
        location: {
          latitude: 0,
          longitude: 0,
          address: "",
        },
        nextDueDate: "",
        status: VaccinationStatus.COMPLETED,
        notes: "",
        certificationNumber: "",
      });
    }
  }, [editRecord, isOpen]);

  const handleInputChange = (field: keyof VaccinationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleLocationChange = (field: keyof VaccinationFormData['location'], value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange('latitude', position.coords.latitude);
          handleLocationChange('longitude', position.coords.longitude);
          handleLocationChange('address', `${position.coords.latitude}, ${position.coords.longitude}`);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.animalId) newErrors.animalId = "ID del animal es requerido";
    if (!formData.animalName) newErrors.animalName = "Nombre del animal es requerido";
    if (!formData.animalTag) newErrors.animalTag = "Etiqueta del animal es requerida";
    if (!formData.vaccineName) newErrors.vaccineName = "Nombre de la vacuna es requerido";
    if (!formData.manufacturer) newErrors.manufacturer = "Fabricante es requerido";
    if (!formData.batchNumber) newErrors.batchNumber = "Número de lote es requerido";
    if (!formData.expirationDate) newErrors.expirationDate = "Fecha de vencimiento es requerida";
    if (!formData.administrationDate) newErrors.administrationDate = "Fecha de administración es requerida";
    if (!formData.dose) newErrors.dose = "Dosis es requerida";
    if (!formData.administeredBy) newErrors.administeredBy = "Administrado por es requerido";
    if (formData.cost < 0) newErrors.cost = "El costo no puede ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {editRecord ? "Editar Registro de Vacunación" : "Nuevo Registro de Vacunación"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Información del Animal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Animal *
              </label>
              <input
                type="text"
                value={formData.animalId}
                onChange={(e) => handleInputChange('animalId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.animalId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="BOV-001"
              />
              {errors.animalId && <p className="text-red-500 text-xs mt-1">{errors.animalId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Animal *
              </label>
              <input
                type="text"
                value={formData.animalName}
                onChange={(e) => handleInputChange('animalName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.animalName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Esperanza"
              />
              {errors.animalName && <p className="text-red-500 text-xs mt-1">{errors.animalName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta del Animal *
              </label>
              <input
                type="text"
                value={formData.animalTag}
                onChange={(e) => handleInputChange('animalTag', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.animalTag ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ESP-001"
              />
              {errors.animalTag && <p className="text-red-500 text-xs mt-1">{errors.animalTag}</p>}
            </div>
          </div>

          {/* Información de la Vacuna */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Vacuna *
              </label>
              <select
                value={formData.vaccineName}
                onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.vaccineName ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar vacuna</option>
                <option value="Triple Viral Bovina">Triple Viral Bovina</option>
                <option value="Vacuna contra Brucelosis">Vacuna contra Brucelosis</option>
                <option value="Vacuna Pentavalente">Vacuna Pentavalente</option>
                <option value="Vacuna contra Fiebre Aftosa">Vacuna contra Fiebre Aftosa</option>
                <option value="Vacuna contra Rabia">Vacuna contra Rabia</option>
                <option value="Otra">Otra</option>
              </select>
              {errors.vaccineName && <p className="text-red-500 text-xs mt-1">{errors.vaccineName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabricante *
              </label>
              <select
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar fabricante</option>
                <option value="Zoetis">Zoetis</option>
                <option value="Colorado Serum Company">Colorado Serum Company</option>
                <option value="MSD Animal Health">MSD Animal Health</option>
                <option value="Boehringer Ingelheim">Boehringer Ingelheim</option>
                <option value="Hipra">Hipra</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>}
            </div>
          </div>

          {/* Detalles de la Vacuna */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Lote *
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.batchNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ZO-2024-001"
              />
              {errors.batchNumber && <p className="text-red-500 text-xs mt-1">{errors.batchNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.expirationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosis *
              </label>
              <input
                type="text"
                value={formData.dose}
                onChange={(e) => handleInputChange('dose', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.dose ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2 ml"
              />
              {errors.dose && <p className="text-red-500 text-xs mt-1">{errors.dose}</p>}
            </div>
          </div>

          {/* Administración */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Administración *
              </label>
              <input
                type="date"
                value={formData.administrationDate}
                onChange={(e) => handleInputChange('administrationDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.administrationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.administrationDate && <p className="text-red-500 text-xs mt-1">{errors.administrationDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vía de Administración
              </label>
              <select
                value={formData.route}
                onChange={(e) => handleInputChange('route', e.target.value as AdministrationRoute)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={AdministrationRoute.INTRAMUSCULAR}>Intramuscular</option>
                <option value={AdministrationRoute.SUBCUTANEOUS}>Subcutánea</option>
                <option value={AdministrationRoute.INTRAVENOUS}>Intravenosa</option>
                <option value={AdministrationRoute.ORAL}>Oral</option>
                <option value={AdministrationRoute.NASAL}>Nasal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio de Inyección
              </label>
              <select
                value={formData.site}
                onChange={(e) => handleInputChange('site', e.target.value as InjectionSite)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={InjectionSite.NECK}>Cuello</option>
                <option value={InjectionSite.SHOULDER}>Hombro</option>
                <option value={InjectionSite.THIGH}>Muslo</option>
                <option value={InjectionSite.RUB}>Nalga</option>
                <option value={InjectionSite.OTHER}>Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.cost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
            </div>
          </div>

          {/* Personal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administrado por *
              </label>
              <input
                type="text"
                value={formData.administeredBy}
                onChange={(e) => handleInputChange('administeredBy', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.administeredBy ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Dr. García"
              />
              {errors.administeredBy && <p className="text-red-500 text-xs mt-1">{errors.administeredBy}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Veterinario
              </label>
              <input
                type="text"
                value={formData.veterinarianName}
                onChange={(e) => handleInputChange('veterinarianName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Dr. María García"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Sector Norte, Rancho La Esperanza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitud
              </label>
              <input
                type="number"
                step="any"
                value={formData.location.latitude}
                onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="17.9889"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="-92.9303"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  title="Obtener ubicación actual"
                >
                  <Target size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Fechas adicionales y estado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próxima Dosis
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as VaccinationStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={VaccinationStatus.COMPLETED}>Completada</option>
                <option value={VaccinationStatus.SCHEDULED}>Programada</option>
                <option value={VaccinationStatus.OVERDUE}>Vencida</option>
                <option value={VaccinationStatus.CANCELLED}>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Certificado
              </label>
              <input
                type="text"
                value={formData.certificationNumber}
                onChange={(e) => handleInputChange('certificationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="CERT-2024-001"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Observaciones, reacciones, seguimiento..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Save size={16} />
              {editRecord ? "Actualizar" : "Guardar"} Registro
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Componente principal de registros de vacunación
const VaccinationRecords: React.FC = () => {

  // Estados del componente - Comentarios en español
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VaccinationStatus | "all">("all");
  const [selectedAnimal, setSelectedAnimal] = useState<string | "all">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<VaccinationRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(12);

  // Simulación de carga de datos - Datos de ejemplo
  useEffect(() => {
    const loadVaccinationRecords = async () => {
      setIsLoading(true);
      
      // Simulación de datos - En producción vendría de la API
      const mockRecords: VaccinationRecord[] = [
        {
          id: "vac-001",
          animalId: "bovine-001",
          animalName: "Esperanza",
          animalTag: "ESP-001",
          vaccineName: "Triple Viral Bovina",
          manufacturer: "Zoetis",
          batchNumber: "ZO-2024-001",
          expirationDate: new Date("2025-06-15"),
          administrationDate: new Date("2024-03-15"),
          dose: "2 ml",
          route: AdministrationRoute.INTRAMUSCULAR,
          site: InjectionSite.NECK,
          administeredBy: "Dr. García",
          veterinarianId: "vet-001",
          veterinarianName: "Dr. María García",
          cost: 45.50,
          location: {
            latitude: 17.9889,
            longitude: -92.9303,
            address: "Sector Norte, Rancho La Esperanza"
          },
          nextDueDate: new Date("2025-03-15"),
          status: VaccinationStatus.COMPLETED,
          notes: "Vacunación rutinaria. Animal en perfecto estado.",
          certificationNumber: "CERT-2024-001",
          createdAt: new Date("2024-03-15"),
          updatedAt: new Date("2024-03-15"),
        },
        {
          id: "vac-002",
          animalId: "bovine-002",
          animalName: "Tormenta",
          animalTag: "TOR-002",
          vaccineName: "Vacuna contra Brucelosis",
          manufacturer: "Colorado Serum Company",
          batchNumber: "CSC-2024-089",
          expirationDate: new Date("2025-12-20"),
          administrationDate: new Date("2024-04-10"),
          dose: "5 ml",
          route: AdministrationRoute.SUBCUTANEOUS,
          site: InjectionSite.SHOULDER,
          administeredBy: "Dr. Rodríguez",
          veterinarianId: "vet-002",
          veterinarianName: "Dr. Carlos Rodríguez",
          cost: 65.00,
          location: {
            latitude: 17.9920,
            longitude: -92.9250,
            address: "Corral Principal, Rancho La Esperanza"
          },
          status: VaccinationStatus.COMPLETED,
          reactions: [
            {
              id: "react-001",
              type: ReactionType.LOCAL_SWELLING,
              severity: ReactionSeverity.MILD,
              onset: new Date("2024-04-11"),
              duration: 24,
              description: "Ligera inflamación en el sitio de inyección",
              treatment: "Antiinflamatorio local",
              resolved: true,
              resolvedDate: new Date("2024-04-12"),
            }
          ],
          nextDueDate: new Date("2025-04-10"),
          notes: "Reacción leve esperada. Seguimiento completado.",
          certificationNumber: "CERT-2024-002",
          createdAt: new Date("2024-04-10"),
          updatedAt: new Date("2024-04-12"),
        },
        {
          id: "vac-003",
          animalId: "bovine-003",
          animalName: "Madrugada",
          animalTag: "MAD-003",
          vaccineName: "Vacuna Pentavalente",
          manufacturer: "MSD Animal Health",
          batchNumber: "MSD-2024-156",
          expirationDate: new Date("2025-08-30"),
          administrationDate: new Date("2024-07-05"),
          dose: "3 ml",
          route: AdministrationRoute.INTRAMUSCULAR,
          site: InjectionSite.THIGH,
          administeredBy: "Dr. García",
          veterinarianId: "vet-001",
          veterinarianName: "Dr. María García",
          cost: 58.75,
          location: {
            latitude: 17.9850,
            longitude: -92.9400,
            address: "Potrero Sur, Rancho La Esperanza"
          },
          status: VaccinationStatus.COMPLETED,
          nextDueDate: new Date("2025-01-05"),
          notes: "Parte del programa de vacunación anual.",
          certificationNumber: "CERT-2024-003",
          createdAt: new Date("2024-07-05"),
          updatedAt: new Date("2024-07-05"),
        }
      ];

      // Simular retraso de red
      setTimeout(() => {
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
        setIsLoading(false);
      }, 1500);
    };

    loadVaccinationRecords();
  }, []);

  // Filtrado de registros basado en criterios de búsqueda
  useEffect(() => {
    let filtered = records;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    // Filtro por animal
    if (selectedAnimal !== "all") {
      filtered = filtered.filter(record => record.animalId === selectedAnimal);
    }

    // Filtro por rango de fechas
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.administrationDate);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [records, searchTerm, selectedStatus, selectedAnimal, dateRange]);

  // Función para abrir el formulario de nuevo registro
  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowFormModal(true);
  };

  // Función para editar un registro
  const handleEditRecord = (record: VaccinationRecord) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  // Función para confirmar eliminación
  const handleDeleteRecord = (record: VaccinationRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  // Función para ejecutar eliminación
  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter(r => r.id !== recordToDelete.id));
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    }
  };

  // Función para guardar registro (nuevo o editado)
  const handleSaveRecord = (formData: VaccinationFormData) => {
    if (editingRecord) {
      // Actualizar registro existente
      const updatedRecord: VaccinationRecord = {
        ...editingRecord,
        animalId: formData.animalId,
        animalName: formData.animalName,
        animalTag: formData.animalTag,
        vaccineName: formData.vaccineName,
        manufacturer: formData.manufacturer,
        batchNumber: formData.batchNumber,
        expirationDate: new Date(formData.expirationDate),
        administrationDate: new Date(formData.administrationDate),
        dose: formData.dose,
        route: formData.route,
        site: formData.site,
        administeredBy: formData.administeredBy,
        veterinarianId: formData.veterinarianId,
        veterinarianName: formData.veterinarianName,
        cost: formData.cost,
        location: formData.location,
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
        status: formData.status,
        notes: formData.notes,
        certificationNumber: formData.certificationNumber,
        updatedAt: new Date(),
      };

      setRecords(records.map(r => r.id === editingRecord.id ? updatedRecord : r));
    } else {
      // Crear nuevo registro
      const newRecord: VaccinationRecord = {
        id: `vac-${Date.now()}`,
        animalId: formData.animalId,
        animalName: formData.animalName,
        animalTag: formData.animalTag,
        vaccineName: formData.vaccineName,
        manufacturer: formData.manufacturer,
        batchNumber: formData.batchNumber,
        expirationDate: new Date(formData.expirationDate),
        administrationDate: new Date(formData.administrationDate),
        dose: formData.dose,
        route: formData.route,
        site: formData.site,
        administeredBy: formData.administeredBy,
        veterinarianId: formData.veterinarianId,
        veterinarianName: formData.veterinarianName,
        cost: formData.cost,
        location: formData.location,
        nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
        status: formData.status,
        notes: formData.notes,
        certificationNumber: formData.certificationNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRecords([newRecord, ...records]);
    }

    setShowFormModal(false);
    setEditingRecord(null);
  };

  // Calcular estadísticas de vacunación
  const getVaccinationStats = () => {
    const total = records.length;
    const completed = records.filter(r => r.status === VaccinationStatus.COMPLETED).length;
    const overdue = records.filter(r => r.status === VaccinationStatus.OVERDUE).length;
    const withReactions = records.filter(r => r.reactions && r.reactions.length > 0).length;
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    return { total, completed, overdue, withReactions, totalCost };
  };

  // Obtener registros para la página actual
  const getCurrentPageRecords = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  };

  // Número total de páginas
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const stats = getVaccinationStats();

  // Función para obtener color de estado
  const getStatusColor = (status: VaccinationStatus) => {
    switch (status) {
      case VaccinationStatus.COMPLETED:
        return "text-green-600 bg-green-100";
      case VaccinationStatus.SCHEDULED:
        return "text-blue-600 bg-blue-100";
      case VaccinationStatus.OVERDUE:
        return "text-red-600 bg-red-100";
      case VaccinationStatus.CANCELLED:
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Función para obtener color de severidad de reacción
  const getReactionSeverityColor = (severity: ReactionSeverity) => {
    switch (severity) {
      case ReactionSeverity.MILD:
        return "text-yellow-600 bg-yellow-100";
      case ReactionSeverity.MODERATE:
        return "text-orange-600 bg-orange-100";
      case ReactionSeverity.SEVERE:
        return "text-red-600 bg-red-100";
      case ReactionSeverity.LIFE_THREATENING:
        return "text-red-800 bg-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Componente de tarjeta de registro para vista móvil
  const RecordCard: React.FC<{ record: VaccinationRecord; index: number }> = ({ record, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3"
    >
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-semibold text-sm">
              {record.animalName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">{record.animalName}</h3>
            <p className="text-xs text-gray-500">{record.animalTag}</p>
          </div>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
          {record.status === VaccinationStatus.COMPLETED && "Completada"}
          {record.status === VaccinationStatus.SCHEDULED && "Programada"}
          {record.status === VaccinationStatus.OVERDUE && "Vencida"}
          {record.status === VaccinationStatus.CANCELLED && "Cancelada"}
        </span>
      </div>

      {/* Información de la vacuna */}
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{record.vaccineName}</p>
          <p className="text-xs text-gray-500">{record.manufacturer}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Fecha:</span>
            <p className="font-medium">{record.administrationDate.toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Costo:</span>
            <p className="font-medium">${record.cost.toFixed(2)}</p>
          </div>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Veterinario:</span>
          <p className="font-medium">{record.veterinarianName || record.administeredBy}</p>
        </div>
      </div>

      {/* Reacciones */}
      {record.reactions && record.reactions.length > 0 && (
        <div className="flex items-center space-x-1">
          <AlertTriangle size={14} className="text-orange-500" />
          <span className="text-xs text-orange-600 font-medium">Reacción registrada</span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSelectedRecord(record);
            setShowDetailModal(true);
          }}
          className="text-emerald-600 hover:text-emerald-700 p-1.5 rounded"
          title="Ver detalles"
        >
          <Eye size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleEditRecord(record)}
          className="text-blue-600 hover:text-blue-700 p-1.5 rounded"
          title="Editar"
        >
          <Edit size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDeleteRecord(record)}
          className="text-red-600 hover:text-red-700 p-1.5 rounded"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con título y acciones principales */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Registros de Vacunación
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Gestión completa de vacunas y seguimiento de inmunización
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewRecord}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 shadow-lg transition-colors text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Nuevo Registro
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-colors text-sm sm:text-base"
              >
                <Filter size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de estadísticas - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Registros</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Syringe className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Completadas</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Vencidas</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Con Reacciones</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{stats.withReactions}</p>
              </div>
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Costo Total</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">${stats.totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel de filtros colapsible */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-6 sm:mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda general */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Nombre, etiqueta, vacuna..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as VaccinationStatus | "all")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value={VaccinationStatus.COMPLETED}>Completada</option>
                    <option value={VaccinationStatus.SCHEDULED}>Programada</option>
                    <option value={VaccinationStatus.OVERDUE}>Vencida</option>
                    <option value={VaccinationStatus.CANCELLED}>Cancelada</option>
                  </select>
                </div>

                {/* Fecha inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                {/* Fecha fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Botones de acción de filtros */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedAnimal("all");
                    setDateRange({ start: "", end: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                >
                  Limpiar Filtros
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Aplicar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-8 sm:p-12 shadow-lg border border-white/20 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 text-base sm:text-lg">Cargando registros de vacunación...</p>
          </motion.div>
        ) : (
          <>
            {/* Lista de registros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden mb-6 sm:mb-8"
            >
              {filteredRecords.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <Syringe className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                    No se encontraron registros
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Intenta ajustar los filtros o agregar un nuevo registro de vacunación
                  </p>
                </div>
              ) : (
                <>
                  {/* Vista de tabla para desktop */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Animal
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vacuna
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Veterinario
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Costo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getCurrentPageRecords().map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 font-semibold text-sm">
                                    {record.animalName.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.animalName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.animalTag}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {record.vaccineName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.manufacturer}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {record.administrationDate.toLocaleDateString()}
                              </div>
                              {record.nextDueDate && (
                                <div className="text-xs text-gray-500">
                                  Próxima: {record.nextDueDate.toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                {record.status === VaccinationStatus.COMPLETED && "Completada"}
                                {record.status === VaccinationStatus.SCHEDULED && "Programada"}
                                {record.status === VaccinationStatus.OVERDUE && "Vencida"}
                                {record.status === VaccinationStatus.CANCELLED && "Cancelada"}
                              </span>
                              {record.reactions && record.reactions.length > 0 && (
                                <div className="mt-1">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-orange-600 bg-orange-100">
                                    <AlertTriangle size={12} className="mr-1" />
                                    Reacción
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.veterinarianName || record.administeredBy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${record.cost.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowDetailModal(true);
                                  }}
                                  className="text-emerald-600 hover:text-emerald-900 p-1 rounded"
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditRecord(record)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteRecord(record)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista de tarjetas para móvil y tablet */}
                  <div className="lg:hidden p-4 space-y-3">
                    {getCurrentPageRecords().map((record, index) => (
                      <RecordCard key={record.id} record={record} index={index} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Paginación */}
            {filteredRecords.length > 0 && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center items-center space-x-2 mb-6 sm:mb-8"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                
                {/* Páginas - Responsive */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === currentPage
                            ? "bg-emerald-600 text-white"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Modal del formulario de vacunación */}
        <AnimatePresence>
          {showFormModal && (
            <VaccinationForm
              isOpen={showFormModal}
              onClose={() => {
                setShowFormModal(false);
                setEditingRecord(null);
              }}
              onSave={handleSaveRecord}
              editRecord={editingRecord}
            />
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteConfirm && recordToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Eliminar registro de vacunación?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta acción eliminará permanentemente el registro de vacunación de{" "}
                    <span className="font-medium">{recordToDelete.animalName}</span> con la vacuna{" "}
                    <span className="font-medium">{recordToDelete.vaccineName}</span>.
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors order-1 sm:order-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de detalles del registro */}
        <AnimatePresence>
          {showDetailModal && selectedRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Detalles de Vacunación
                    </h3>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Información del animal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User size={20} />
                        Información del Animal
                      </h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Nombre:</span> {selectedRecord.animalName}</p>
                        <p><span className="font-medium">Etiqueta:</span> {selectedRecord.animalTag}</p>
                        <p><span className="font-medium">ID:</span> {selectedRecord.animalId}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Syringe size={20} />
                        Información de la Vacuna
                      </h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Vacuna:</span> {selectedRecord.vaccineName}</p>
                        <p><span className="font-medium">Fabricante:</span> {selectedRecord.manufacturer}</p>
                        <p><span className="font-medium">Lote:</span> {selectedRecord.batchNumber}</p>
                        <p><span className="font-medium">Dosis:</span> {selectedRecord.dose}</p>
                        <p><span className="font-medium">Vía:</span> {selectedRecord.route}</p>
                        <p><span className="font-medium">Sitio:</span> {selectedRecord.site}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar size={20} />
                        Información Temporal
                      </h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Fecha de aplicación:</span> {selectedRecord.administrationDate.toLocaleDateString()}</p>
                        <p><span className="font-medium">Fecha de vencimiento:</span> {selectedRecord.expirationDate.toLocaleDateString()}</p>
                        {selectedRecord.nextDueDate && (
                          <p><span className="font-medium">Próxima dosis:</span> {selectedRecord.nextDueDate.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={20} />
                        Ubicación y Administración
                      </h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Aplicada por:</span> {selectedRecord.administeredBy}</p>
                        {selectedRecord.veterinarianName && (
                          <p><span className="font-medium">Veterinario:</span> {selectedRecord.veterinarianName}</p>
                        )}
                        <p><span className="font-medium">Ubicación:</span> {selectedRecord.location.address}</p>
                        <p><span className="font-medium">Costo:</span> ${selectedRecord.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reacciones adversas */}
                  {selectedRecord.reactions && selectedRecord.reactions.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Reacciones Adversas
                      </h4>
                      <div className="space-y-3">
                        {selectedRecord.reactions.map((reaction) => (
                          <div key={reaction.id} className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReactionSeverityColor(reaction.severity)}`}>
                                {reaction.severity === ReactionSeverity.MILD && "Leve"}
                                {reaction.severity === ReactionSeverity.MODERATE && "Moderada"}
                                {reaction.severity === ReactionSeverity.SEVERE && "Severa"}
                                {reaction.severity === ReactionSeverity.LIFE_THREATENING && "Grave"}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                reaction.resolved ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                              }`}>
                                {reaction.resolved ? "Resuelta" : "Activa"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Tipo:</span> {reaction.type}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Descripción:</span> {reaction.description}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">Inicio:</span> {reaction.onset.toLocaleDateString()}
                            </p>
                            {reaction.duration && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Duración:</span> {reaction.duration} horas
                              </p>
                            )}
                            {reaction.treatment && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Tratamiento:</span> {reaction.treatment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas adicionales */}
                  {selectedRecord.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <FileText size={20} />
                        Notas Adicionales
                      </h4>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}

                  {/* Información de certificación */}
                  {selectedRecord.certificationNumber && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Shield size={20} />
                        Certificación
                      </h4>
                      <p className="text-gray-700">
                        <span className="font-medium">Número de certificado:</span> {selectedRecord.certificationNumber}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
                  >
                    Cerrar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditRecord(selectedRecord);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    <Edit size={16} />
                    Editar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VaccinationRecords;