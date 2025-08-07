import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Syringe,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Activity,
  X,
  Save,
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
  duration?: number;
  description: string;
  treatment?: string;
  resolved: boolean;
  resolvedDate?: Date;
}

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
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {editRecord ? "Editar Vacunación" : "Nueva Vacunación"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información del Animal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Animal *
              </label>
              <input
                type="text"
                value={formData.animalId}
                onChange={(e) => handleInputChange('animalId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.animalId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="BOV-001"
              />
              {errors.animalId && <p className="text-red-500 text-xs mt-1">{errors.animalId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Animal *
              </label>
              <input
                type="text"
                value={formData.animalName}
                onChange={(e) => handleInputChange('animalName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.animalName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Esperanza"
              />
              {errors.animalName && <p className="text-red-500 text-xs mt-1">{errors.animalName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiqueta del Animal *
              </label>
              <input
                type="text"
                value={formData.animalTag}
                onChange={(e) => handleInputChange('animalTag', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.animalTag ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ESP-001"
              />
              {errors.animalTag && <p className="text-red-500 text-xs mt-1">{errors.animalTag}</p>}
            </div>
          </div>

          {/* Información de la Vacuna */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Vacuna *
              </label>
              <select
                value={formData.vaccineName}
                onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fabricante *
              </label>
              <select
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
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

          {/* Campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Administración *
              </label>
              <input
                type="date"
                value={formData.administrationDate}
                onChange={(e) => handleInputChange('administrationDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.administrationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.administrationDate && <p className="text-red-500 text-xs mt-1">{errors.administrationDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosis *
              </label>
              <input
                type="text"
                value={formData.dose}
                onChange={(e) => handleInputChange('dose', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.dose ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2 ml"
              />
              {errors.dose && <p className="text-red-500 text-xs mt-1">{errors.dose}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Administrado por *
              </label>
              <input
                type="text"
                value={formData.administeredBy}
                onChange={(e) => handleInputChange('administeredBy', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                  errors.administeredBy ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Dr. García"
              />
              {errors.administeredBy && <p className="text-red-500 text-xs mt-1">{errors.administeredBy}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Campos adicionales */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="cursor-pointer p-3 bg-gray-50 text-sm font-medium text-gray-700">
              Información Adicional (Opcional)
            </summary>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Lote
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                    placeholder="ZO-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  placeholder="Observaciones..."
                />
              </div>
            </div>
          </details>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editRecord ? "Actualizar" : "Guardar"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// =================== COMPONENTE PRINCIPAL ===================
const VaccinationRecords: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VaccinationStatus | "all">("all");
  const [] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<VaccinationRecord | null>(null);

  useEffect(() => {
    const loadVaccinationRecords = async () => {
      setIsLoading(true);
      
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

      setTimeout(() => {
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
        setIsLoading(false);
      }, 500);
    };

    loadVaccinationRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, selectedStatus]);

  // =================== FUNCIONES DE MANEJO ===================
  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowFormModal(true);
  };

  const handleEditRecord = (record: VaccinationRecord) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  const handleDeleteRecord = (record: VaccinationRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter(r => r.id !== recordToDelete.id));
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    }
  };

  const handleSaveRecord = (formData: VaccinationFormData) => {
    if (editingRecord) {
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

  // =================== FUNCIONES AUXILIARES ===================
  const getVaccinationStats = () => {
    const total = records.length;
    const completed = records.filter(r => r.status === VaccinationStatus.COMPLETED).length;
    const overdue = records.filter(r => r.status === VaccinationStatus.OVERDUE).length;
    const withReactions = records.filter(r => r.reactions && r.reactions.length > 0).length;
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    return { total, completed, overdue, withReactions, totalCost };
  };

  const getStatusColor = (status: VaccinationStatus) => {
    switch (status) {
      case VaccinationStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case VaccinationStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800";
      case VaccinationStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case VaccinationStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: VaccinationStatus) => {
    switch (status) {
      case VaccinationStatus.COMPLETED:
        return "Completada";
      case VaccinationStatus.SCHEDULED:
        return "Programada";
      case VaccinationStatus.OVERDUE:
        return "Vencida";
      case VaccinationStatus.CANCELLED:
        return "Cancelada";
      default:
        return status;
    }
  };

  const stats = getVaccinationStats();

  // =================== LOADING STATE ===================
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
            <p className="text-gray-600">Cargando registros...</p>
          </div>
        </div>
      </div>
    );
  }

  // =================== RENDER PRINCIPAL ===================
  return (
    <div className="p-6 space-y-6">
      {/* ===== HEADER INTEGRADO AL LAYOUT ===== */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#519a7c] rounded-lg flex items-center justify-center">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Registros de Vacunación
              </h1>
              <p className="text-gray-600">
                Gestión completa de vacunas y seguimiento de inmunización
              </p>
            </div>
          </div>
          <button 
            onClick={handleNewRecord}
            className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* ===== ESTADÍSTICAS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Syringe className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Reacciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withReactions}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTROS Y BÚSQUEDA ===== */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por animal, etiqueta o vacuna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as VaccinationStatus | "all")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
            >
              <option value="all">Todos los estados</option>
              <option value={VaccinationStatus.COMPLETED}>Completadas</option>
              <option value={VaccinationStatus.SCHEDULED}>Programadas</option>
              <option value={VaccinationStatus.OVERDUE}>Vencidas</option>
              <option value={VaccinationStatus.CANCELLED}>Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== LISTA DE REGISTROS ===== */}
      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay registros
          </h3>
          <p className="text-gray-600 mb-6">
            Aún no se han registrado vacunaciones
          </p>
          <button 
            onClick={handleNewRecord}
            className="px-6 py-3 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Primer Registro</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                <h3 className="font-bold text-lg">
                  {record.animalName}
                </h3>
                <p className="text-white/80 text-sm">
                  {record.animalTag} • {record.vaccineName}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {getStatusText(record.status)}
                  </span>
                  {record.reactions && record.reactions.length > 0 && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Reacción
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Fecha:</p>
                    <p className="font-medium">
                      {record.administrationDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dosis:</p>
                    <p className="font-medium">{record.dose}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Fabricante:</span> {record.manufacturer}</p>
                  <p><span className="font-medium">Administrado por:</span> {record.administeredBy}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#519a7c]">
                    ${record.cost.toFixed(2)}
                  </span>
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-sm text-gray-700 line-clamp-2">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedRecord(record);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditRecord(record)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteRecord(record)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {record.createdAt.toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== MODALES ===== */}
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

      <AnimatePresence>
        {showDeleteConfirm && recordToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="flex items-center gap-4 p-6 border-b">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Registro
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar el registro de vacunación de{" "}
                  <strong>{recordToDelete.animalName}</strong>?
                </p>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                <h2 className="text-xl font-bold">
                  Detalles de Vacunación
                </h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRecord.animalName}
                  </h3>
                  <p className="text-gray-600">
                    {selectedRecord.animalTag} • {selectedRecord.vaccineName}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Información de Vacunación
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Vacuna:</span> {selectedRecord.vaccineName}</p>
                      <p><span className="font-medium">Fabricante:</span> {selectedRecord.manufacturer}</p>
                      <p><span className="font-medium">Dosis:</span> {selectedRecord.dose}</p>
                      <p><span className="font-medium">Fecha:</span> {selectedRecord.administrationDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Administración
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Administrado por:</span> {selectedRecord.administeredBy}</p>
                      {selectedRecord.veterinarianName && (
                        <p><span className="font-medium">Veterinario:</span> {selectedRecord.veterinarianName}</p>
                      )}
                      <p><span className="font-medium">Costo:</span> <span className="text-[#519a7c] font-bold">${selectedRecord.cost.toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Notas</h4>
                    <p className="text-gray-700">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditRecord(selectedRecord);
                  }}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VaccinationRecords;