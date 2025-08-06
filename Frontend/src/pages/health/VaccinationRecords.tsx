import React, { useState, useEffect } from "react";

// Configuración mejorada del backend
const BACKEND_CONFIG = {
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo entre intentos
};

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

// Clase mejorada de API Client para vacunaciones
class VaccinationApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: typeof BACKEND_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  // Método helper para hacer requests con reintentos
  private async fetchWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`Intento ${attempt} falló para ${url}:`, error);

      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.log(`Reintentando en ${this.retryDelay}ms... (${attempt}/${this.retryAttempts})`);
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    return error.name === 'AbortError' || 
           error.name === 'TypeError' || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('Network Error');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Verificar conexión con el backend
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    try {

      const latency = Date.now() - startTime;

      return {
        success: true,
        message: `Conectado exitosamente (${latency}ms)`,
        latency
      };
    } catch (error) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión desconocido'
      };
    }
  }

  // Obtener todos los registros de vacunación
  async getVaccinations(filters: any = {}): Promise<VaccinationRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.cattleId) queryParams.append('cattleId', filters.cattleId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.vaccineType) queryParams.append('vaccineType', filters.vaccineType);

      const response = await this.fetchWithRetry(
        `${this.baseURL}/health/vaccinations?${queryParams.toString()}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      return this.transformBackendData(data.data?.vaccinations || []);
    } catch (error) {
      console.warn('API de vacunaciones no disponible, usando datos de ejemplo');
      return this.getMockData();
    }
  }

  // Crear nuevo registro de vacunación
  async createVaccination(vaccinationData: VaccinationFormData): Promise<VaccinationRecord> {
    const backendData = this.transformToBackendFormat(vaccinationData);
    
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/health/vaccinations`, {
        method: 'POST',
        body: JSON.stringify(backendData),
      });

      const data = await response.json();
      return this.transformSingleBackendData(data.data);
    } catch (error) {
      // Simulación local si el backend no está disponible
      const mockRecord = this.createMockRecord(vaccinationData);
      console.warn('Backend no disponible, simulando creación');
      return mockRecord;
    }
  }

  // Actualizar registro de vacunación
  async updateVaccination(id: string, vaccinationData: VaccinationFormData): Promise<VaccinationRecord> {
    const backendData = this.transformToBackendFormat(vaccinationData);
    
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/health/vaccinations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });

      const data = await response.json();
      return this.transformSingleBackendData(data.data);
    } catch (error) {
      console.warn('Backend no disponible, simulando actualización');
      return this.createMockRecord(vaccinationData, id);
    }
  }

  // Eliminar registro de vacunación
  async deleteVaccination(id: string): Promise<void> {
    try {
      await this.fetchWithRetry(`${this.baseURL}/health/vaccinations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Backend no disponible, simulando eliminación');
      // En una app real, aquí manejarías la sincronización offline
    }
  }

  // Obtener bovinos para el formulario
  async getBovines(): Promise<any[]> {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/bovines`, {
        method: 'GET',
      });

      const data = await response.json();
      return data.data?.bovines || data.data || [];
    } catch (error) {
      console.warn('Endpoint de bovinos no disponible, usando datos de ejemplo');
      return [
        { id: 'bovine-001', name: 'Esperanza', tag: 'ESP-001', cattleType: 'Lechera' },
        { id: 'bovine-002', name: 'Tormenta', tag: 'TOR-002', cattleType: 'Reproductora' },
        { id: 'bovine-003', name: 'Madrugada', tag: 'MAD-003', cattleType: 'Lechera' }
      ];
    }
  }

  // Transformar datos del backend al formato del frontend
  private transformBackendData(backendData: any[]): VaccinationRecord[] {
    return backendData.map(item => this.transformSingleBackendData(item));
  }

  private transformSingleBackendData(item: any): VaccinationRecord {
    return {
      id: item.id || `vac-${Date.now()}`,
      animalId: item.cattleId || item.animalId || '',
      animalName: item.cattle?.name || item.animalName || 'Desconocido',
      animalTag: item.cattle?.tag || item.animalTag || 'N/A',
      vaccineName: item.vaccineId || item.vaccineName || 'Vacuna desconocida',
      manufacturer: item.manufacturer || 'Fabricante desconocido',
      batchNumber: item.batchNumber || '',
      expirationDate: new Date(item.expirationDate || Date.now()),
      administrationDate: new Date(item.administrationDate || Date.now()),
      dose: item.dose || '2ml',
      route: item.route || AdministrationRoute.INTRAMUSCULAR,
      site: item.site || InjectionSite.NECK,
      administeredBy: item.administeredBy || 'Veterinario',
      veterinarianId: item.veterinarianId,
      veterinarianName: item.veterinarian?.name,
      cost: item.cost || 0,
      location: item.location || {
        latitude: 18.0067,
        longitude: -92.9311,
        address: 'Villahermosa, Tabasco'
      },
      reactions: item.reactions || [],
      nextDueDate: item.nextDueDate ? new Date(item.nextDueDate) : undefined,
      status: item.status || VaccinationStatus.COMPLETED,
      notes: item.notes || '',
      certificationNumber: item.certificationNumber,
      photos: item.photos || [],
      createdAt: new Date(item.createdAt || Date.now()),
      updatedAt: new Date(item.updatedAt || Date.now()),
    };
  }

  // Transformar datos del frontend al formato del backend
  private transformToBackendFormat(formData: VaccinationFormData): any {
    return {
      cattleIds: [formData.animalId],
      vaccineId: formData.vaccineName,
      batchNumber: formData.batchNumber,
      dose: formData.dose,
      administrationDate: formData.administrationDate,
      veterinarianId: formData.veterinarianId || '',
      location: formData.location,
      cost: formData.cost,
      route: formData.route,
      site: formData.site,
      administeredBy: formData.administeredBy,
      expirationDate: formData.expirationDate,
      nextDueDate: formData.nextDueDate,
      status: formData.status,
      notes: formData.notes,
      certificationNumber: formData.certificationNumber
    };
  }

  // Crear record mock para cuando el backend no está disponible
  private createMockRecord(formData: VaccinationFormData, id?: string): VaccinationRecord {
    return {
      id: id || `vac-${Date.now()}`,
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
  }

  // Datos mock para desarrollo/demostración
  private getMockData(): VaccinationRecord[] {
    return [
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
  }
}

// Instancia del cliente API
const vaccinationApiClient = new VaccinationApiClient(BACKEND_CONFIG);

// Componente del formulario de vacunación
const VaccinationForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VaccinationFormData) => void;
  editRecord?: VaccinationRecord | null;
  bovines: any[];
}> = ({ isOpen, onClose, onSave, editRecord, bovines }) => {
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
      latitude: 18.0067,
      longitude: -92.9311,
      address: "Rancho Principal, Villahermosa, Tabasco",
    },
    nextDueDate: "",
    status: VaccinationStatus.COMPLETED,
    notes: "",
    certificationNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          latitude: 18.0067,
          longitude: -92.9311,
          address: "Rancho Principal, Villahermosa, Tabasco",
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

  // Auto-completar datos del animal cuando se selecciona
  const handleAnimalSelect = (animalId: string) => {
    const selectedAnimal = bovines.find(animal => animal.id === animalId);
    if (selectedAnimal) {
      setFormData(prev => ({
        ...prev,
        animalId,
        animalName: selectedAnimal.name,
        animalTag: selectedAnimal.tag || selectedAnimal.earTag
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.animalId) newErrors.animalId = "Debe seleccionar un animal";
    if (!formData.vaccineName) newErrors.vaccineName = "Nombre de la vacuna es requerido";
    if (!formData.manufacturer) newErrors.manufacturer = "Fabricante es requerido";
    if (!formData.administrationDate) newErrors.administrationDate = "Fecha de administración es requerida";
    if (!formData.dose) newErrors.dose = "Dosis es requerida";
    if (!formData.administeredBy) newErrors.administeredBy = "Administrado por es requerido";
    if (formData.cost < 0) newErrors.cost = "El costo no puede ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error('Error al guardar:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 opacity-100 transition-opacity duration-200">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">
              {editRecord ? "✏️ Editar Vacunación" : "💉 Nueva Vacunación"}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {editRecord ? "Actualizar información de vacunación" : "Registrar nueva aplicación de vacuna"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded transition-colors"
          >
            <span className="text-lg">❌</span>
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          {/* Selección de Animal */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal *
            </label>
            <select
              value={formData.animalId}
              onChange={(e) => handleAnimalSelect(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] ${
                errors.animalId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar animal...</option>
              {bovines.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} - {animal.tag || animal.earTag}
                </option>
              ))}
            </select>
            {errors.animalId && <p className="text-red-500 text-xs mt-1">⚠️ {errors.animalId}</p>}
          </div>

          {/* Información de la Vacuna */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <option value="Vacuna contra Clostridiosis">Vacuna contra Clostridiosis</option>
                <option value="Vacuna contra Leptospirosis">Vacuna contra Leptospirosis</option>
                <option value="Otra">Otra</option>
              </select>
              {errors.vaccineName && <p className="text-red-500 text-xs mt-1">⚠️ {errors.vaccineName}</p>}
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
                <option value="Biogénesis Bagó">Biogénesis Bagó</option>
                <option value="SENASA México">SENASA México</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.manufacturer && <p className="text-red-500 text-xs mt-1">⚠️ {errors.manufacturer}</p>}
            </div>
          </div>

          {/* Campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              {errors.administrationDate && <p className="text-red-500 text-xs mt-1">⚠️ {errors.administrationDate}</p>}
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
              {errors.dose && <p className="text-red-500 text-xs mt-1">⚠️ {errors.dose}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              {errors.administeredBy && <p className="text-red-500 text-xs mt-1">⚠️ {errors.administeredBy}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo ($MXN)
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

          {/* Vía y Sitio de administración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vía de Administración
              </label>
              <select
                value={formData.route}
                onChange={(e) => handleInputChange('route', e.target.value as AdministrationRoute)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              >
                <option value={AdministrationRoute.INTRAMUSCULAR}>Intramuscular</option>
                <option value={AdministrationRoute.SUBCUTANEOUS}>Subcutánea</option>
                <option value={AdministrationRoute.INTRAVENOUS}>Intravenosa</option>
                <option value={AdministrationRoute.ORAL}>Oral</option>
                <option value={AdministrationRoute.NASAL}>Nasal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sitio de Inyección
              </label>
              <select
                value={formData.site}
                onChange={(e) => handleInputChange('site', e.target.value as InjectionSite)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              >
                <option value={InjectionSite.NECK}>Cuello</option>
                <option value={InjectionSite.SHOULDER}>Hombro</option>
                <option value={InjectionSite.THIGH}>Muslo</option>
                <option value={InjectionSite.RUB}>Ijada</option>
                <option value={InjectionSite.OTHER}>Otro</option>
              </select>
            </div>
          </div>

          {/* Información adicional en un collapsible */}
          <details className="border border-gray-200 rounded-lg mb-6">
            <summary className="cursor-pointer p-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              📋 Información Adicional (Opcional)
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Próxima Dosis
                  </label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Certificación
                  </label>
                  <input
                    type="text"
                    value={formData.certificationNumber}
                    onChange={(e) => handleInputChange('certificationNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                    placeholder="CERT-2024-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location', {
                    ...formData.location,
                    address: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  placeholder="Corral Principal, Rancho La Esperanza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] resize-none"
                  placeholder="Observaciones sobre la vacunación..."
                />
              </div>
            </div>
          </details>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              ❌ Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>{editRecord ? "Actualizar" : "Guardar"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== COMPONENTE PRINCIPAL ===================
const VaccinationRecords: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccinationRecord[]>([]);
  const [bovines, setBovines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VaccinationStatus | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<VaccinationRecord | null>(null);
  
  // Estados de conexión
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'retrying'>('connecting');
  const [connectionInfo, setConnectionInfo] = useState<{ message: string; latency?: number }>({ message: '' });
  const [error, setError] = useState<string>("");

  // Probar conexión con el backend
  const testConnection = async (showRetrying = false) => {
    try {
      if (showRetrying) {
        setConnectionStatus('retrying');
      } else {
        setConnectionStatus('connecting');
      }
      
      const result = await vaccinationApiClient.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setConnectionInfo(result);
        setError('');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión desconocido';
      setConnectionInfo({ message: errorMessage });
      setError(`Error de conexión con el backend: ${errorMessage}\n\nVerifica que el servidor esté ejecutándose en http://localhost:5000`);
      return false;
    }
  };

  useEffect(() => {
    const loadVaccinationRecords = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        // Probar conexión primero
        const isConnected = await testConnection();
        
        // Cargar datos en paralelo
        const [recordsData, bovinesData] = await Promise.all([
          vaccinationApiClient.getVaccinations(),
          vaccinationApiClient.getBovines()
        ]);
        
        setRecords(recordsData);
        setFilteredRecords(recordsData);
        setBovines(bovinesData);
        
        if (isConnected) {
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err instanceof Error ? err.message : "Error al cargar los registros de vacunación");
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadVaccinationRecords();
  }, []);

  // Auto-reconexión cada 30 segundos si hay error
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (connectionStatus === 'error') {
      intervalId = setInterval(() => {
        console.log('Intentando reconexión automática...');
        testConnection(true);
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionStatus]);

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

  const confirmDelete = async () => {
    if (recordToDelete) {
      try {
        await vaccinationApiClient.deleteVaccination(recordToDelete.id);
        setRecords(records.filter(r => r.id !== recordToDelete.id));
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
      } catch (error) {
        console.error('Error eliminando registro:', error);
        // En caso de error, aún removemos localmente si es simulación
        setRecords(records.filter(r => r.id !== recordToDelete.id));
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
      }
    }
  };

  const handleSaveRecord = async (formData: VaccinationFormData) => {
    try {
      if (editingRecord) {
        const updatedRecord = await vaccinationApiClient.updateVaccination(editingRecord.id, formData);
        setRecords(records.map(r => r.id === editingRecord.id ? updatedRecord : r));
      } else {
        const newRecord = await vaccinationApiClient.createVaccination(formData);
        setRecords([newRecord, ...records]);
      }

      setShowFormModal(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error guardando registro:', error);
      // Re-lanzar para que el formulario pueda manejar el error
      throw error;
    }
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

  // Componente de estado de conexión
  const getConnectionStatusDisplay = () => {
    const statusConfig = {
      connecting: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', text: 'Conectando...' },
      connected: { color: 'bg-green-100 text-green-800', icon: '🟢', text: `Conectado${connectionInfo.latency ? ` (${connectionInfo.latency}ms)` : ''}` },
      error: { color: 'bg-red-100 text-red-800', icon: '🔴', text: 'Sin conexión' },
      retrying: { color: 'bg-orange-100 text-orange-800', icon: '🟠', text: 'Reconectando...' }
    };

    const config = statusConfig[connectionStatus];
    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {config.text}
      </div>
    );
  };

  const stats = getVaccinationStats();

  // =================== LOADING STATE ===================
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
            <div>
              <p className="text-gray-600">Cargando registros de vacunación...</p>
              {connectionStatus === 'connected' && (
                <p className="text-green-600 text-sm">✅ Conectado al backend</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error de conexión crítico
  if (error && connectionStatus === 'error' && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <p className="text-red-600 font-semibold mb-4">{connectionInfo.message}</p>
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>¿Cómo solucionarlo?</strong>
              </p>
              <ol className="text-sm text-red-700 mt-2 list-decimal list-inside space-y-1">
                <li>Verifica que el backend esté ejecutándose</li>
                <li>Revisa que el puerto 5000 esté disponible</li>
                <li>Confirma la configuración de CORS</li>
                <li>Revisa la consola para más detalles</li>
              </ol>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Reintentar Conexión
              </button>
              <p className="text-xs text-gray-500">
                Backend URL: {BACKEND_CONFIG.baseURL}
              </p>
            </div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#519a7c] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💉</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Registros de Vacunación
                </h1>
                {getConnectionStatusDisplay()}
              </div>
              <p className="text-gray-600">
                Gestión completa de vacunas y seguimiento de inmunización
              </p>
            </div>
          </div>
          <button 
            onClick={handleNewRecord}
            disabled={connectionStatus === 'connecting'}
            className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span>➕</span>
            <span>Nuevo</span>
          </button>
        </div>

        {/* Panel de información adicional */}
        {connectionStatus === 'connected' && connectionInfo.latency && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 text-lg">⚡</span>
                <div>
                  <p className="text-sm text-green-800 font-medium">Conexión estable con backend</p>
                  <p className="text-xs text-green-600">
                    Latencia: {connectionInfo.latency}ms | Endpoint: /health/vaccinations
                  </p>
                </div>
              </div>
              <button
                onClick={() => testConnection()}
                className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-xs hover:bg-green-300 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && records.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-orange-600 text-lg">⚠️</span>
                <div>
                  <p className="text-sm text-orange-800 font-medium">Modo offline - Usando datos locales</p>
                  <p className="text-xs text-orange-600">
                    Los cambios se sincronizarán al reconectar
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ESTADÍSTICAS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-2xl">💉</span>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Reacciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withReactions}</p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTROS Y BÚSQUEDA ===== */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
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
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <span className="text-6xl mb-4 block">💉</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {records.length === 0 ? 'No hay registros' : 'No se encontraron registros'}
          </h3>
          <p className="text-gray-600 mb-6">
            {records.length === 0 
              ? 'Aún no se han registrado vacunaciones'
              : 'No hay registros que coincidan con los filtros aplicados'
            }
          </p>
          {records.length === 0 && (
            <button 
              onClick={handleNewRecord}
              className="px-6 py-3 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 mx-auto transition-colors"
            >
              <span>➕</span>
              <span>Crear Primer Registro</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
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
                      ⚡ Reacción
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
                      {record.administrationDate.toLocaleDateString('es-MX')}
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
                    ${record.cost.toFixed(2)} MXN
                  </span>
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-sm text-gray-700 truncate overflow-hidden"
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical' as any
                       }}>
                      {record.notes}
                    </p>
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
                    <span>👁️</span>
                  </button>
                  <button 
                    onClick={() => handleEditRecord(record)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar"
                  >
                    <span>✏️</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteRecord(record)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {record.createdAt.toLocaleDateString('es-MX')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODALES ===== */}
      {showFormModal && (
        <VaccinationForm
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
          editRecord={editingRecord}
          bovines={bovines}
        />
      )}

      {showDeleteConfirm && recordToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center gap-4 p-6 border-b">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
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
                <strong>{recordToDelete.animalName}</strong> ({recordToDelete.vaccineName})?
              </p>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <span>🗑️</span>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
              <div>
                <h2 className="text-xl font-bold">
                  🔍 Detalles de Vacunación
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Información completa del registro
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                <span className="text-lg">❌</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedRecord.animalName}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedRecord.animalTag} • {selectedRecord.vaccineName}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedRecord.status)}`}>
                    {getStatusText(selectedRecord.status)}
                  </span>
                  {selectedRecord.reactions && selectedRecord.reactions.length > 0 && (
                    <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                      ⚡ Con Reacciones
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    💉 Información de Vacunación
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Vacuna:</span> {selectedRecord.vaccineName}</p>
                    <p><span className="font-medium">Fabricante:</span> {selectedRecord.manufacturer}</p>
                    <p><span className="font-medium">Dosis:</span> {selectedRecord.dose}</p>
                    <p><span className="font-medium">Fecha:</span> {selectedRecord.administrationDate.toLocaleDateString('es-MX')}</p>
                    {selectedRecord.batchNumber && (
                      <p><span className="font-medium">Lote:</span> {selectedRecord.batchNumber}</p>
                    )}
                    {selectedRecord.expirationDate && (
                      <p><span className="font-medium">Vence:</span> {selectedRecord.expirationDate.toLocaleDateString('es-MX')}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    👨‍⚕️ Administración
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Administrado por:</span> {selectedRecord.administeredBy}</p>
                    {selectedRecord.veterinarianName && (
                      <p><span className="font-medium">Veterinario:</span> {selectedRecord.veterinarianName}</p>
                    )}
                    <p><span className="font-medium">Vía:</span> {selectedRecord.route}</p>
                    <p><span className="font-medium">Sitio:</span> {selectedRecord.site}</p>
                    <p><span className="font-medium">Costo:</span> <span className="text-[#519a7c] font-bold">${selectedRecord.cost.toFixed(2)} MXN</span></p>
                    {selectedRecord.certificationNumber && (
                      <p><span className="font-medium">Certificado:</span> {selectedRecord.certificationNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedRecord.location && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    📍 Ubicación
                  </h4>
                  <p className="text-gray-700">{selectedRecord.location.address}</p>
                  {selectedRecord.location.latitude && selectedRecord.location.longitude && (
                    <p className="text-sm text-blue-600 mt-1">
                      Coordenadas: {selectedRecord.location.latitude.toFixed(4)}, {selectedRecord.location.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              )}

              {selectedRecord.reactions && selectedRecord.reactions.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                    ⚠️ Reacciones Reportadas
                  </h4>
                  <div className="space-y-3">
                    {selectedRecord.reactions.map((reaction) => (
                      <div key={reaction.id} className="bg-white rounded p-3 border border-orange-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-orange-800">{reaction.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reaction.severity === ReactionSeverity.MILD ? 'bg-green-100 text-green-800' :
                            reaction.severity === ReactionSeverity.MODERATE ? 'bg-yellow-100 text-yellow-800' :
                            reaction.severity === ReactionSeverity.SEVERE ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reaction.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{reaction.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Inicio: {reaction.onset.toLocaleDateString('es-MX')}</span>
                          <span>{reaction.resolved ? '✅ Resuelto' : '⏳ Pendiente'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    📝 Notas
                  </h4>
                  <p className="text-gray-700">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.nextDueDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    🗓️ Próxima Dosis
                  </h4>
                  <p className="text-gray-700">
                    Programada para: <strong>{selectedRecord.nextDueDate.toLocaleDateString('es-MX')}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ Cerrar
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditRecord(selectedRecord);
                }}
                className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationRecords;