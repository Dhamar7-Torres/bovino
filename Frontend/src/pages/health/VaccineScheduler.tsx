import React, { useState, useEffect, useMemo } from "react";
import {
  Syringe,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Edit3,
  Trash2,
  Search,
  Bell,
  FileText,
  User,
  DollarSign,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
  Save,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS ADAPTADOS AL BACKEND
// ============================================================================

interface VaccinationSchedule {
  id: string;
  cattleId: string;
  cattleName: string;
  cattleEarTag: string;
  vaccineId: string;
  vaccineName: string;
  vaccineType: VaccineType;
  scheduledDate: string;
  scheduledTime: string;
  status: ScheduleStatus;
  doseNumber: number;
  totalDoses: number;
  nextDueDate?: string;
  completedDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
  cost: number;
  reminderSent: boolean;
  certificateGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  priority: Priority;
}

interface VaccineType {
  id: string;
  name: string;
  manufacturer: string;
  category: VaccineCategory;
  description: string;
  dosageInstructions: string;
  storageRequirements: string;
  sideEffects: string[];
  contraindications: string[];
  withdrawalPeriod: number;
  boosterRequired: boolean;
  boosterInterval: number;
  ageRestrictions: {
    minAge: number;
    maxAge?: number;
  };
  seasonalRecommendation?: string;
  regulatoryApproval: string;
  costPerDose: number;
  isGovernmentRequired: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  schedules: VaccinationSchedule[];
  hasScheduled: boolean;
  hasOverdue: boolean;
  hasCompleted: boolean;
}

interface ScheduleFormData {
  cattleId: string;
  cattleName: string;
  cattleEarTag: string;
  vaccineId: string;
  vaccineName: string;
  scheduledDate: string;
  scheduledTime: string;
  veterinarianId: string;
  veterinarianName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  priority: Priority;
  notes: string;
  cost: number;
  doseNumber: number;
  totalDoses: number;
}

// Enums para tipos específicos
enum ScheduleStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
  RESCHEDULED = "rescheduled",
}

enum VaccineCategory {
  VIRAL = "viral",
  BACTERIAL = "bacterial",
  PARASITIC = "parasitic",
  MULTIVALENT = "multivalent",
  OTHER = "other",
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// ============================================================================
// SERVICIO API
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

class VaccinationApiService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Programaciones de vacunación
  static async getVaccinationSchedules(params?: {
    period?: string;
    includeOverdue?: boolean;
    cattleId?: string;
    vaccineType?: string;
    status?: string;
  }): Promise<{ data: { schedules: VaccinationSchedule[]; total: number; }; message: string }> {
    const queryParams = new URLSearchParams();
    
    if (params?.period) queryParams.append('period', params.period);
    if (params?.includeOverdue) queryParams.append('includeOverdue', params.includeOverdue.toString());
    if (params?.cattleId) queryParams.append('cattleId', params.cattleId);
    if (params?.vaccineType) queryParams.append('vaccineType', params.vaccineType);
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.fetchWithAuth(`/health/vaccinations/schedule?${queryParams}`);
    return response.json();
  }

  static async createVaccinationSchedule(schedule: Omit<ScheduleFormData, 'id'>): Promise<{ data: VaccinationSchedule; message: string }> {
    const scheduleData = {
      cattleIds: [schedule.cattleId],
      vaccineId: schedule.vaccineId,
      scheduledDate: schedule.scheduledDate,
      scheduledTime: schedule.scheduledTime,
      veterinarianId: schedule.veterinarianId,
      priority: schedule.priority,
      autoReminders: true,
      location: schedule.location,
      notes: schedule.notes,
      cost: schedule.cost,
      doseNumber: schedule.doseNumber,
      totalDoses: schedule.totalDoses,
    };

    const response = await this.fetchWithAuth('/health/vaccinations/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
    return response.json();
  }

  static async updateVaccinationSchedule(id: string, schedule: Partial<ScheduleFormData>): Promise<{ data: VaccinationSchedule; message: string }> {
    const scheduleData = {
      cattleIds: schedule.cattleId ? [schedule.cattleId] : undefined,
      vaccineId: schedule.vaccineId,
      scheduledDate: schedule.scheduledDate,
      scheduledTime: schedule.scheduledTime,
      veterinarianId: schedule.veterinarianId,
      priority: schedule.priority,
      location: schedule.location,
      notes: schedule.notes,
      cost: schedule.cost,
      doseNumber: schedule.doseNumber,
      totalDoses: schedule.totalDoses,
    };

    const response = await this.fetchWithAuth(`/health/vaccinations/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
    return response.json();
  }

  static async deleteVaccinationSchedule(id: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(`/health/vaccinations/schedule/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Obtener bovinos (para autocompletado)
  static async getCattle(search?: string): Promise<{ data: any[]; message: string }> {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);

    const response = await this.fetchWithAuth(`/cattle?${queryParams}`);
    return response.json();
  }

  // Obtener veterinarios
  static async getVeterinarians(): Promise<{ data: any[]; message: string }> {
    const response = await this.fetchWithAuth('/users/veterinarians');
    return response.json();
  }
}

// Listas de opciones predefinidas para sugerencias
const VACCINE_SUGGESTIONS = [
  "Triple Viral Bovina",
  "Vacuna contra Brucelosis",
  "Vacuna Pentavalente",
  "Vacuna contra Fiebre Aftosa",
  "Vacuna contra Rabia",
  "Vacuna contra Carbón Bacteriano",
  "Vacuna contra Leptospirosis",
  "Vacuna contra Salmonella",
  "Vacuna contra Pasterelosis",
  "Vacuna contra IBR/DVB",
];

// ============================================================================
// COMPONENTES DE ERROR Y CARGA
// ============================================================================

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-white/20">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-6 h-6 text-red-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Error de Conexión</h3>
    <p className="text-sm text-gray-600 mb-4 max-w-full break-words">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
      >
        Intentar de nuevo
      </button>
    )}
  </div>
);

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-white/20">
    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

// ============================================================================
// COMPONENTE DEL FORMULARIO (CONECTADO)
// ============================================================================

const ScheduleForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => Promise<void>;
  editingSchedule?: VaccinationSchedule | null;
}> = ({ isOpen, onClose, onSave, editingSchedule = null }) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    cattleId: "",
    cattleName: "",
    cattleEarTag: "",
    vaccineId: "",
    vaccineName: "",
    scheduledDate: "",
    scheduledTime: "",
    veterinarianId: "",
    veterinarianName: "",
    location: {
      latitude: 0,
      longitude: 0,
      address: "",
    },
    priority: Priority.MEDIUM,
    notes: "",
    cost: 0,
    doseNumber: 1,
    totalDoses: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cattleSuggestions, setCattleSuggestions] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [cattleResponse, vetResponse] = await Promise.all([
          VaccinationApiService.getCattle(),
          VaccinationApiService.getVeterinarians()
        ]);
        setCattleSuggestions(cattleResponse.data || []);
        setVeterinarians(vetResponse.data || []);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Llenar formulario con datos de edición
  useEffect(() => {
    if (editingSchedule && isOpen) {
      setFormData({
        cattleId: editingSchedule.cattleId,
        cattleName: editingSchedule.cattleName,
        cattleEarTag: editingSchedule.cattleEarTag,
        vaccineId: editingSchedule.vaccineId,
        vaccineName: editingSchedule.vaccineName,
        scheduledDate: editingSchedule.scheduledDate,
        scheduledTime: editingSchedule.scheduledTime,
        veterinarianId: editingSchedule.veterinarianId || "",
        veterinarianName: editingSchedule.veterinarianName || "",
        location: editingSchedule.location,
        priority: editingSchedule.priority,
        notes: editingSchedule.notes || "",
        cost: editingSchedule.cost,
        doseNumber: editingSchedule.doseNumber,
        totalDoses: editingSchedule.totalDoses,
      });
    } else if (!editingSchedule && isOpen) {
      // Resetear formulario para nuevo registro
      setFormData({
        cattleId: "",
        cattleName: "",
        cattleEarTag: "",
        vaccineId: "",
        vaccineName: "",
        scheduledDate: "",
        scheduledTime: "",
        veterinarianId: "",
        veterinarianName: "",
        location: {
          latitude: 0,
          longitude: 0,
          address: "",
        },
        priority: Priority.MEDIUM,
        notes: "",
        cost: 0,
        doseNumber: 1,
        totalDoses: 1,
      });
    }
    setErrors({});
  }, [editingSchedule, isOpen]);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocalización no es soportada por este navegador.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Usar Nominatim de OpenStreetMap para geocodificación inversa
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setFormData(prev => ({
              ...prev,
              location: {
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
                address: address
              }
            }));
          } else {
            // Si falla la geocodificación, al menos usar las coordenadas
            setFormData(prev => ({
              ...prev,
              location: {
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              }
            }));
          }
        } catch (error) {
          console.error('Error al obtener la dirección:', error);
          // Usar solo coordenadas si falla todo
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: parseFloat(latitude.toFixed(6)),
              longitude: parseFloat(longitude.toFixed(6)),
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
          }));
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener la ubicación. Verifica los permisos.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleInputChange = (field: keyof ScheduleFormData, value: any) => {
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

  const handleLocationChange = (field: keyof ScheduleFormData['location'], value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleCattleSelect = (cattle: any) => {
    setFormData(prev => ({
      ...prev,
      cattleId: cattle.id,
      cattleName: cattle.name || cattle.earTag,
      cattleEarTag: cattle.earTag
    }));
  };

  const handleVeterinarianSelect = (vet: any) => {
    setFormData(prev => ({
      ...prev,
      veterinarianId: vet.id,
      veterinarianName: vet.name || vet.fullName
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cattleId) newErrors.cattleId = "Selecciona un bovino";
    if (!formData.cattleName) newErrors.cattleName = "Nombre del bovino es requerido";
    if (!formData.cattleEarTag) newErrors.cattleEarTag = "Etiqueta del bovino es requerida";
    if (!formData.vaccineName.trim()) newErrors.vaccineName = "Nombre de la vacuna es requerido";
    if (!formData.scheduledDate) newErrors.scheduledDate = "Fecha programada es requerida";
    if (!formData.scheduledTime) newErrors.scheduledTime = "Hora programada es requerida";
    if (!formData.veterinarianId) newErrors.veterinarianId = "Selecciona un veterinario";
    if (formData.cost < 0) newErrors.cost = "El costo no puede ser negativo";
    if (formData.doseNumber < 1) newErrors.doseNumber = "El número de dosis debe ser mayor a 0";
    if (formData.totalDoses < 1) newErrors.totalDoses = "El total de dosis debe ser mayor a 0";
    if (formData.doseNumber > formData.totalDoses) newErrors.doseNumber = "El número de dosis no puede ser mayor al total";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        // Generar ID de vacuna si no existe
        const vaccineId = formData.vaccineId || `vac-${Date.now()}`;
        await onSave({
          ...formData,
          vaccineId
        });
        onClose();
      } catch (error) {
        setErrors({ general: 'Error al guardar la programación' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-95"
        style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {editingSchedule ? 'Editar Programación de Vacuna' : 'Nueva Programación de Vacuna'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {errors.general && (
          <div className="px-4 sm:px-6 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* Información del Bovino */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bovino *
              </label>
              <select
                value={formData.cattleId}
                onChange={(e) => {
                  const selectedCattle = cattleSuggestions.find(c => c.id === e.target.value);
                  if (selectedCattle) {
                    handleCattleSelect(selectedCattle);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.cattleId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un bovino</option>
                {cattleSuggestions.map((cattle) => (
                  <option key={cattle.id} value={cattle.id}>
                    {cattle.earTag} - {cattle.name || 'Sin nombre'}
                  </option>
                ))}
              </select>
              {errors.cattleId && <p className="text-red-500 text-xs mt-1">{errors.cattleId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Bovino
              </label>
              <input
                type="text"
                value={formData.cattleName}
                onChange={(e) => handleInputChange('cattleName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Esperanza"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta del Bovino
              </label>
              <input
                type="text"
                value={formData.cattleEarTag}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="ESP-001"
                readOnly
              />
            </div>
          </div>

          {/* Información de la Vacuna */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Vacuna *
              </label>
              <input
                type="text"
                list="vaccine-suggestions"
                value={formData.vaccineName}
                onChange={(e) => handleInputChange('vaccineName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.vaccineName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Escribe o selecciona una vacuna"
              />
              <datalist id="vaccine-suggestions">
                {VACCINE_SUGGESTIONS.map((vaccine, index) => (
                  <option key={index} value={vaccine} />
                ))}
              </datalist>
              {errors.vaccineName && <p className="text-red-500 text-xs mt-1">{errors.vaccineName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinario *
              </label>
              <select
                value={formData.veterinarianId}
                onChange={(e) => {
                  const selectedVet = veterinarians.find(v => v.id === e.target.value);
                  if (selectedVet) {
                    handleVeterinarianSelect(selectedVet);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.veterinarianId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un veterinario</option>
                {veterinarians.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name || vet.fullName || vet.email}
                  </option>
                ))}
              </select>
              {errors.veterinarianId && <p className="text-red-500 text-xs mt-1">{errors.veterinarianId}</p>}
            </div>
          </div>

          {/* Programación */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Programada *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduledTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={Priority.LOW}>Baja</option>
                <option value={Priority.MEDIUM}>Media</option>
                <option value={Priority.HIGH}>Alta</option>
                <option value={Priority.URGENT}>Urgente</option>
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

          {/* Dosis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Dosis
              </label>
              <input
                type="number"
                min="1"
                value={formData.doseNumber}
                onChange={(e) => handleInputChange('doseNumber', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.doseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.doseNumber && <p className="text-red-500 text-xs mt-1">{errors.doseNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Dosis
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalDoses}
                onChange={(e) => handleInputChange('totalDoses', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.totalDoses ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.totalDoses && <p className="text-red-500 text-xs mt-1">{errors.totalDoses}</p>}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                {isGettingLocation ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Navigation size={14} />
                )}
                {isGettingLocation ? 'Obteniendo...' : 'Mi Ubicación'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
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
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="-92.9303"
                />
              </div>
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
              placeholder="Observaciones, instrucciones especiales..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Guardando...' : (editingSchedule ? 'Actualizar Programación' : 'Guardar Programación')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL DE CONFIRMACIÓN PARA ELIMINAR
// ============================================================================

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduleName: string;
  loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, scheduleName, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 scale-95"
        style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que deseas eliminar la programación de vacuna para <strong>{scheduleName}</strong>?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - CONECTADO AL BACKEND
// ============================================================================

const VaccineScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "protocols">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [selectedSchedule, setSelectedSchedule] = useState<VaccinationSchedule | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<VaccinationSchedule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<VaccinationSchedule | null>(null);
  
  // Estados de error y carga
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ============================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================================

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await VaccinationApiService.getVaccinationSchedules({
        period: 'year',
        includeOverdue: true,
      });

      // Adaptar los datos del backend a nuestras interfaces
      const schedulesData = (response.data.schedules || []).map((schedule: any) => ({
        ...schedule,
        // Adaptar nombres de campos del backend
        cattleId: schedule.cattleId || schedule.bovineId,
        cattleName: schedule.cattleName || schedule.bovineName,
        cattleEarTag: schedule.cattleEarTag || schedule.bovineTag,
        veterinarianName: schedule.veterinarianName || schedule.veterinarian,
        // Crear mock vaccine type si no existe
        vaccineType: schedule.vaccineType || {
          id: schedule.vaccineId,
          name: schedule.vaccineName,
          manufacturer: "Fabricante",
          category: VaccineCategory.VIRAL,
          description: "Vacuna programada",
          dosageInstructions: "Según protocolo",
          storageRequirements: "2-8°C",
          sideEffects: [],
          contraindications: [],
          withdrawalPeriod: 0,
          boosterRequired: false,
          boosterInterval: 0,
          ageRestrictions: { minAge: 0 },
          regulatoryApproval: "SENASA-2025",
          costPerDose: schedule.cost || 0,
          isGovernmentRequired: false,
        }
      }));

      setSchedules(schedulesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    loadSchedules();
  }, []);

  // ============================================================================
  // HANDLERS DE ACCIONES
  // ============================================================================

  const handleSaveSchedule = async (formData: ScheduleFormData) => {
    setActionLoading(true);
    try {
      if (editingSchedule) {
        await VaccinationApiService.updateVaccinationSchedule(editingSchedule.id, formData);
      } else {
        await VaccinationApiService.createVaccinationSchedule(formData);
      }
      
      await loadSchedules();
      setEditingSchedule(null);
    } catch (err) {
      throw err; // Re-throw para que el formulario maneje el error
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSchedule = (schedule: VaccinationSchedule) => {
    setEditingSchedule(schedule);
    setShowCreateModal(true);
    setShowDetailModal(false);
  };

  const handleDeleteSchedule = (schedule: VaccinationSchedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    setActionLoading(true);
    try {
      await VaccinationApiService.deleteVaccinationSchedule(scheduleToDelete.id);
      await loadSchedules();
      setScheduleToDelete(null);
      setShowDetailModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar programación');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setShowCreateModal(true);
  };

  const handleRetry = () => {
    loadSchedules();
  };

  // ============================================================================
  // FILTROS Y CÁLCULOS
  // ============================================================================

  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.cattleEarTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.veterinarianName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((schedule) => schedule.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((schedule) => schedule.priority === priorityFilter);
    }

    return filtered;
  }, [schedules, searchTerm, statusFilter, priorityFilter]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateStr = new Date().toDateString();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const daySchedules = filteredSchedules.filter(
        (schedule) =>
          new Date(schedule.scheduledDate).toDateString() === date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === currentDateStr,
        isSelected: selectedDate?.toDateString() === date.toDateString(),
        schedules: daySchedules,
        hasScheduled: daySchedules.some((s) => s.status === ScheduleStatus.SCHEDULED),
        hasOverdue: daySchedules.some((s) => s.status === ScheduleStatus.OVERDUE),
        hasCompleted: daySchedules.some((s) => s.status === ScheduleStatus.COMPLETED),
      });
    }

    return days;
  }, [currentDate, filteredSchedules, selectedDate]);

  const getSchedulerStats = () => {
    const total = schedules.length;
    const scheduled = schedules.filter((s) => s.status === ScheduleStatus.SCHEDULED).length;
    const completed = schedules.filter((s) => s.status === ScheduleStatus.COMPLETED).length;
    const overdue = schedules.filter((s) => s.status === ScheduleStatus.OVERDUE).length;
    const thisWeek = schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return scheduleDate >= now && scheduleDate <= weekFromNow;
    }).length;
    const totalCost = schedules.reduce((sum, s) => sum + s.cost, 0);

    return { total, scheduled, completed, overdue, thisWeek, totalCost };
  };

  const stats = getSchedulerStats();

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return "text-blue-600 bg-blue-100";
      case ScheduleStatus.COMPLETED:
        return "text-green-600 bg-green-100";
      case ScheduleStatus.OVERDUE:
        return "text-red-600 bg-red-100";
      case ScheduleStatus.CANCELLED:
        return "text-gray-600 bg-gray-100";
      case ScheduleStatus.RESCHEDULED:
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "text-gray-600 bg-gray-100";
      case Priority.MEDIUM:
        return "text-blue-600 bg-blue-100";
      case Priority.HIGH:
        return "text-orange-600 bg-orange-100";
      case Priority.URGENT:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return "Programada";
      case ScheduleStatus.COMPLETED:
        return "Completada";
      case ScheduleStatus.OVERDUE:
        return "Vencida";
      case ScheduleStatus.CANCELLED:
        return "Cancelada";
      case ScheduleStatus.RESCHEDULED:
        return "Reprogramada";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "Baja";
      case Priority.MEDIUM:
        return "Media";
      case Priority.HIGH:
        return "Alta";
      case Priority.URGENT:
        return "Urgente";
      default:
        return priority;
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  if (isLoading && schedules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-orange-200 to-orange-400 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Conectando con el servidor..." />
        </div>
      </div>
    );
  }

  if (error && schedules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-orange-200 to-orange-400 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-orange-200 to-orange-400 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Estilos CSS como clase interna */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { 
              opacity: 0; 
              transform: translateY(-20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes slideLeft {
            from { 
              opacity: 0; 
              transform: translateX(-20px); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0); 
            }
          }
        `}</style>

        {/* Header */}
        <div className="mb-6 sm:mb-8 transform transition-all duration-500" style={{ animation: 'slideDown 0.6s ease-out forwards' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Programador de Vacunas
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Gestión y planificación de calendarios de vacunación
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreateModal}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                )}
                Nueva Programación
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 transform transition-all duration-500 opacity-0" style={{ animation: 'slideUp 0.6s ease-out 0.1s forwards' }}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Programadas</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Programadas</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
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
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Esta Semana</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{stats.thisWeek}</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20">
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
        </div>

        {/* Panel de filtros */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-6 sm:mb-8 transform transition-all duration-500 opacity-0" style={{ animation: 'slideUp 0.6s ease-out 0.15s forwards' }}>
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                  >
                    Ocultar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Animal, vacuna, veterinario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                {isLoading && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value={ScheduleStatus.SCHEDULED}>Programada</option>
                <option value={ScheduleStatus.COMPLETED}>Completada</option>
                <option value={ScheduleStatus.OVERDUE}>Vencida</option>
                <option value={ScheduleStatus.CANCELLED}>Cancelada</option>
                <option value={ScheduleStatus.RESCHEDULED}>Reprogramada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="all">Todas las prioridades</option>
                <option value={Priority.LOW}>Baja</option>
                <option value={Priority.MEDIUM}>Media</option>
                <option value={Priority.HIGH}>Alta</option>
                <option value={Priority.URGENT}>Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as "calendar" | "list" | "protocols")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="calendar">Calendario</option>
                <option value="list">Lista</option>
                <option value="protocols">Protocolos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vista de Calendario */}
        {viewMode === "calendar" && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden transform transition-all duration-500 opacity-0" style={{ animation: 'slideUp 0.6s ease-out 0.2s forwards' }}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors transform hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors transform hover:scale-105 active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="p-2 sm:p-4 text-center text-xs sm:text-sm font-medium text-gray-500 bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-1 sm:p-2 h-16 sm:h-20 lg:h-24 border-r border-b border-gray-100 cursor-pointer transition-colors transform hover:scale-105 ${
                    !day.isCurrentMonth
                      ? "bg-gray-50 text-gray-400"
                      : day.isToday
                      ? "bg-blue-50"
                      : day.isSelected
                      ? "bg-emerald-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 ${
                        day.isToday ? "text-blue-600" : day.isSelected ? "text-emerald-600" : ""
                      }`}
                    >
                      {day.date.getDate()}
                    </div>

                    <div className="flex-1 space-y-1">
                      {day.schedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(schedule);
                            setShowDetailModal(true);
                          }}
                          className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer transform hover:scale-105 ${
                            schedule.status === ScheduleStatus.SCHEDULED
                              ? "bg-blue-100 text-blue-700"
                              : schedule.status === ScheduleStatus.OVERDUE
                              ? "bg-red-100 text-red-700"
                              : schedule.status === ScheduleStatus.COMPLETED
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {schedule.cattleName}
                        </div>
                      ))}

                      {day.schedules.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">+{day.schedules.length - 2} más</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista de Lista */}
        {viewMode === "list" && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden transform transition-all duration-500 opacity-0" style={{ animation: 'slideUp 0.6s ease-out 0.2s forwards' }}>
            {filteredSchedules.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Syringe className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No se encontraron programaciones</h3>
                <p className="text-gray-500 text-sm sm:text-base">Intenta ajustar los filtros o crear una nueva programación</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer transform duration-300 opacity-0"
                    style={{ animation: `slideLeft 0.3s ease-out ${index * 0.1}s forwards` }}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowDetailModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {schedule.cattleName} ({schedule.cattleEarTag})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  schedule.status
                                )}`}
                              >
                                {getStatusText(schedule.status)}
                              </span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                  schedule.priority
                                )}`}
                              >
                                {getPriorityText(schedule.priority)}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            {schedule.vaccineName}
                          </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span className="truncate">
                                {new Date(schedule.scheduledDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {schedule.scheduledTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span className="truncate">
                                {schedule.veterinarianName || "Sin asignar"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={14} />
                              ${schedule.cost.toFixed(2)}
                            </div>
                          </div>

                          {schedule.notes && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 italic truncate">
                              {schedule.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchedule(schedule);
                            setShowDetailModal(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-900 p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 transform hover:scale-110 active:scale-90"
                          title="Ver detalles"
                        >
                          <Eye size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transform hover:scale-110 active:scale-90"
                          title="Editar"
                        >
                          <Edit3 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule);
                          }}
                          className="text-red-600 hover:text-red-900 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transform hover:scale-110 active:scale-90"
                          title="Eliminar"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista de Protocolos - Simplificada para demo */}
        {viewMode === "protocols" && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center transform transition-all duration-500 opacity-0" style={{ animation: 'slideUp 0.6s ease-out 0.2s forwards' }}>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Vista de Protocolos</h3>
            <p className="text-gray-500">Esta sección estará disponible próximamente</p>
          </div>
        )}

        {/* Modales */}
        {showCreateModal && (
          <ScheduleForm
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setEditingSchedule(null);
            }}
            onSave={handleSaveSchedule}
            editingSchedule={editingSchedule}
          />
        )}

        {showDeleteModal && scheduleToDelete && (
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteSchedule}
            scheduleName={`${scheduleToDelete.cattleName} - ${scheduleToDelete.vaccineName}`}
            loading={actionLoading}
          />
        )}

        {/* Modal de detalles - Simplificado */}
        {showDetailModal && selectedSchedule && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
            <div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-95"
              style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Detalles de Programación
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity size={20} />
                      Información del Animal
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Nombre:</span> {selectedSchedule.cattleName}
                      </p>
                      <p>
                        <span className="font-medium">Etiqueta:</span> {selectedSchedule.cattleEarTag}
                      </p>
                      <p>
                        <span className="font-medium">ID:</span> {selectedSchedule.cattleId}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Syringe size={20} />
                      Información de la Vacuna
                    </h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Vacuna:</span> {selectedSchedule.vaccineName}
                      </p>
                      <p>
                        <span className="font-medium">Fabricante:</span>{" "}
                        {selectedSchedule.vaccineType.manufacturer}
                      </p>
                      <p>
                        <span className="font-medium">Categoría:</span>{" "}
                        {selectedSchedule.vaccineType.category}
                      </p>
                      <p>
                        <span className="font-medium">Dosis:</span> {selectedSchedule.doseNumber} de{" "}
                        {selectedSchedule.totalDoses}
                      </p>
                      <p>
                        <span className="font-medium">Costo:</span> ${selectedSchedule.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Estado:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedSchedule.status
                    )}`}
                  >
                    {getStatusText(selectedSchedule.status)}
                  </span>
                  <span className="font-medium ml-4">Prioridad:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                      selectedSchedule.priority
                    )}`}
                  >
                    {getPriorityText(selectedSchedule.priority)}
                  </span>
                </div>

                {selectedSchedule.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <FileText size={20} />
                      Notas Adicionales
                    </h4>
                    <p className="text-gray-700">{selectedSchedule.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors order-3 sm:order-1 transform hover:scale-105 active:scale-95"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDeleteSchedule(selectedSchedule)}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-2 sm:order-2 transform hover:scale-105 active:scale-95"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Eliminar
                </button>
                <button
                  onClick={() => handleEditSchedule(selectedSchedule)}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-3 transform hover:scale-105 active:scale-95"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Edit3 size={16} />
                  )}
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccineScheduler;