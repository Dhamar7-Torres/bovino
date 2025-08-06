import React, { useState, useEffect, useMemo } from "react";
import {
  Baby,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Activity,
  FileText,
  X,
  Save,
  MapPin,
  Heart,
  User,
  Scale,
  Crown,
  AlertTriangle,
} from "lucide-react";

// ============================================================================
// CONFIGURACIÓN DE API
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';
const BIRTH_RECORDS_ENDPOINT = `${API_BASE_URL}/reproduction/birth-records`;

// Función para obtener token de autenticación (ajustar según tu implementación)
const getAuthToken = () => {
  return localStorage.getItem('authToken') || '';
};

// Función para headers de autenticación
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// ============================================================================
// INTERFACES OPTIMIZADAS PARA BACKEND
// ============================================================================

interface BirthRecord {
  id: string;
  motherId: string;
  motherName: string;
  motherEarTag: string;
  motherAge: number;
  pregnancyNumber: number;
  gestationDays: number;
  fatherId?: string;
  fatherName?: string;
  fatherEarTag?: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer";
  birthDate: string;
  birthTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock?: string;
  };
  laborDetails: {
    duration: number;
    type: "natural" | "assisted" | "cesarean";
    difficulty: "easy" | "moderate" | "difficult";
    assistedBy: {
      name: string;
      role: "veterinarian" | "technician" | "staff";
    };
    complications: string[];
  };
  calf: {
    id: string;
    tempEarTag?: string;
    gender: "male" | "female";
    birthWeight: number;
    healthStatus: "excellent" | "good" | "fair" | "poor";
    firstStanding: boolean;
    firstNursing: boolean;
  };
  motherPostBirth: {
    condition: "excellent" | "good" | "fair" | "poor";
    placentaExpelled: boolean;
    treatmentRequired: boolean;
  };
  economics: {
    totalCost: number;
    estimatedValue: number;
  };
  notes: string;
  status: "active" | "weaned" | "sold" | "deceased";
  outcome: "successful" | "complicated" | "loss";
  createdAt: string;
  updatedAt: string;
}

interface BirthFilters {
  searchTerm: string;
  birthType: string;
  gender: string;
  outcome: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

// ============================================================================
// SERVICIOS DE API
// ============================================================================

class BirthRecordsService {
  
  /**
   * Obtener todos los registros de nacimientos
   */
  static async getAll(page = 1, limit = 50, filters?: any): Promise<ApiResponse<BirthRecord[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      console.log(`🔄 Obteniendo registros: ${BIRTH_RECORDS_ENDPOINT}?${queryParams}`);
      
      const response = await fetch(`${BIRTH_RECORDS_ENDPOINT}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Registros obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo registros:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo registro de nacimiento
   */
  static async create(record: Partial<BirthRecord>): Promise<ApiResponse<BirthRecord>> {
    try {
      console.log('🔄 Creando registro:', record);
      
      const response = await fetch(BIRTH_RECORDS_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Registro creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando registro:', error);
      throw error;
    }
  }

  /**
   * Actualizar registro existente
   */
  static async update(id: string, record: Partial<BirthRecord>): Promise<ApiResponse<BirthRecord>> {
    try {
      console.log(`🔄 Actualizando registro ${id}:`, record);
      
      const response = await fetch(`${BIRTH_RECORDS_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Registro actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error actualizando registro:', error);
      throw error;
    }
  }

  /**
   * Eliminar registro
   */
  static async delete(id: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🔄 Eliminando registro ${id}`);
      
      const response = await fetch(`${BIRTH_RECORDS_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Registro eliminado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error eliminando registro:', error);
      throw error;
    }
  }

  /**
   * Probar conectividad con el backend
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Probando conexión con backend...');
      
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      console.log('✅ Conexión exitosa:', data);
      return response.ok;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const BirthRecords: React.FC = () => {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<BirthRecord | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<BirthRecord | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<BirthFilters>({
    searchTerm: "",
    birthType: "",
    gender: "",
    outcome: "",
    dateRange: { start: "", end: "" },
  });

  const [formData, setFormData] = useState<Partial<BirthRecord>>({});

  // ============================================================================
  // EFECTOS DE INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        // Probar conexión
        console.log('🔄 Inicializando aplicación...');
        const isConnectedToBackend = await BirthRecordsService.testConnection();
        setIsConnected(isConnectedToBackend);

        if (isConnectedToBackend) {
          // Cargar datos del backend
          await loadDataFromBackend();
        } else {
          setConnectionError('No se pudo conectar con el backend en puerto 5000');
          // Cargar datos mock como fallback
          loadMockData();
        }
      } catch (error) {
        console.error('❌ Error inicializando:', error);
        setConnectionError(error instanceof Error ? error.message : 'Error desconocido');
        loadMockData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadDataFromBackend = async () => {
    try {
      console.log('🔄 Cargando datos del backend...');
      const response = await BirthRecordsService.getAll();
      
      if (response.success && Array.isArray(response.data)) {
        setRecords(response.data);
        setFilteredRecords(response.data);
        console.log(`✅ ${response.data.length} registros cargados desde backend`);
      } else {
        console.warn('⚠️ Respuesta inesperada del backend:', response);
        loadMockData();
      }
    } catch (error) {
      console.error('❌ Error cargando datos del backend:', error);
      setConnectionError('Error cargando datos del servidor');
      loadMockData();
    }
  };

  const loadMockData = () => {
    console.log('🔄 Cargando datos mock...');
    const mockRecords: BirthRecord[] = [
      {
        id: "birth-001",
        motherId: "cow-123",
        motherName: "Bella",
        motherEarTag: "MX-001",
        motherAge: 4,
        pregnancyNumber: 3,
        gestationDays: 285,
        fatherId: "bull-001",
        fatherName: "Campeón",
        fatherEarTag: "T-001",
        breedingType: "natural",
        birthDate: "2025-07-15",
        birthTime: "06:30",
        location: {
          lat: 17.989,
          lng: -92.247,
          address: "Rancho San Miguel",
          paddock: "Corral de Partos",
        },
        laborDetails: {
          duration: 45,
          type: "natural",
          difficulty: "easy",
          assistedBy: { name: "Miguel Hernández", role: "staff" },
          complications: [],
        },
        calf: {
          id: "calf-001",
          tempEarTag: "TEMP-001",
          gender: "male",
          birthWeight: 42.5,
          healthStatus: "excellent",
          firstStanding: true,
          firstNursing: true,
        },
        motherPostBirth: {
          condition: "excellent",
          placentaExpelled: true,
          treatmentRequired: false,
        },
        economics: {
          totalCost: 2500,
          estimatedValue: 15000,
        },
        notes: "Nacimiento exitoso sin complicaciones.",
        status: "active",
        outcome: "successful",
        createdAt: "2025-07-15T06:30:00.000Z",
        updatedAt: "2025-07-15T08:00:00.000Z",
      }
    ];
    
    setRecords(mockRecords);
    setFilteredRecords(mockRecords);
    console.log('✅ Datos mock cargados');
  };

  // ============================================================================
  // FILTRADO DE REGISTROS
  // ============================================================================

  useEffect(() => {
    let filtered = records;

    if (filters.searchTerm) {
      filtered = filtered.filter(record =>
        record.motherName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.motherEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.birthType) {
      filtered = filtered.filter(record => record.laborDetails.type === filters.birthType);
    }

    if (filters.gender) {
      filtered = filtered.filter(record => record.calf.gender === filters.gender);
    }

    if (filters.outcome) {
      filtered = filtered.filter(record => record.outcome === filters.outcome);
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.birthDate + 'T12:00:00');
        const startDate = new Date(filters.dateRange.start + 'T12:00:00');
        const endDate = new Date(filters.dateRange.end + 'T12:00:00');
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  const stats = useMemo(() => {
    const total = records.length;
    const males = records.filter(r => r.calf.gender === "male").length;
    const females = records.filter(r => r.calf.gender === "female").length;
    const successful = records.filter(r => r.outcome === "successful").length;
    const averageWeight = records.length > 0 ? 
      (records.reduce((sum, r) => sum + r.calf.birthWeight, 0) / records.length).toFixed(1) : "0";

    return {
      total,
      males,
      females,
      successful,
      averageWeight: `${averageWeight} kg`,
      successRate: total > 0 ? `${((successful / total) * 100).toFixed(1)}%` : "0%",
    };
  }, [records]);

  // ============================================================================
  // MANEJO DE FORMULARIOS
  // ============================================================================

  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 10);
    const currentTime = now.toTimeString().substr(0, 5);
    
    setFormData({
      breedingType: "natural",
      pregnancyNumber: 1,
      gestationDays: 283,
      birthDate: today,
      birthTime: currentTime,
      laborDetails: {
        duration: 0,
        type: "natural",
        difficulty: "easy",
        assistedBy: { name: "", role: "staff" },
        complications: [],
      },
      calf: {
        id: "",
        gender: "male",
        birthWeight: 0,
        healthStatus: "good",
        firstStanding: false,
        firstNursing: false,
      },
      motherPostBirth: {
        condition: "good",
        placentaExpelled: false,
        treatmentRequired: false,
      },
      economics: {
        totalCost: 0,
        estimatedValue: 0,
      },
      status: "active",
      outcome: "successful",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "",
      },
    });
  };

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  const handleCreate = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (isConnected) {
        // Crear en backend
        const response = await BirthRecordsService.create(formData);
        if (response.success) {
          setRecords(prev => [response.data, ...prev]);
          alert("✅ Registro creado exitosamente en el servidor");
        }
      } else {
        // Crear localmente
        const newRecord: BirthRecord = {
          id: `birth-${Date.now()}`,
          motherId: formData.motherId || `cow-${Date.now()}`,
          motherName: formData.motherName || "",
          motherEarTag: formData.motherEarTag || "",
          motherAge: formData.motherAge || 0,
          pregnancyNumber: formData.pregnancyNumber || 1,
          gestationDays: formData.gestationDays || 283,
          breedingType: formData.breedingType || "natural",
          birthDate: formData.birthDate || new Date().toISOString().substr(0, 10),
          birthTime: formData.birthTime || new Date().toTimeString().substr(0, 5),
          location: formData.location || {
            lat: 17.989,
            lng: -92.247,
            address: "Villahermosa, Tabasco",
          },
          laborDetails: formData.laborDetails || {
            duration: 0,
            type: "natural",
            difficulty: "easy",
            assistedBy: { name: "", role: "staff" },
            complications: [],
          },
          calf: formData.calf || {
            id: `calf-${Date.now()}`,
            gender: "male",
            birthWeight: 0,
            healthStatus: "good",
            firstStanding: false,
            firstNursing: false,
          },
          motherPostBirth: formData.motherPostBirth || {
            condition: "good",
            placentaExpelled: false,
            treatmentRequired: false,
          },
          economics: formData.economics || {
            totalCost: 0,
            estimatedValue: 0,
          },
          notes: formData.notes || "",
          status: formData.status || "active",
          outcome: formData.outcome || "successful",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setRecords(prev => [newRecord, ...prev]);
        alert("✅ Registro creado localmente (sin conexión al servidor)");
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error creando registro:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRecord || isSaving) return;

    setIsSaving(true);
    try {
      if (isConnected) {
        // Actualizar en backend
        const response = await BirthRecordsService.update(editingRecord.id, formData);
        if (response.success) {
          setRecords(prev => prev.map(record => 
            record.id === editingRecord.id ? response.data : record
          ));
          alert("✅ Registro actualizado exitosamente en el servidor");
        }
      } else {
        // Actualizar localmente
        setRecords(prev => prev.map(record => 
          record.id === editingRecord.id 
            ? { ...record, ...formData, updatedAt: new Date().toISOString() }
            : record
        ));
        alert("✅ Registro actualizado localmente (sin conexión al servidor)");
      }

      setEditingRecord(null);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error actualizando registro:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete || isSaving) return;

    setIsSaving(true);
    try {
      if (isConnected) {
        // Eliminar en backend
        const response = await BirthRecordsService.delete(recordToDelete.id);
        if (response.success) {
          setRecords(currentRecords => 
            currentRecords.filter(r => r.id !== recordToDelete.id)
          );
          alert("✅ Registro eliminado exitosamente del servidor");
        }
      } else {
        // Eliminar localmente
        setRecords(currentRecords => 
          currentRecords.filter(r => r.id !== recordToDelete.id)
        );
        alert("✅ Registro eliminado localmente (sin conexión al servidor)");
      }

      if (selectedRecord?.id === recordToDelete.id) {
        setSelectedRecord(null);
      }
      
      if (editingRecord?.id === recordToDelete.id) {
        setEditingRecord(null);
        setShowForm(false);
      }

      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error('❌ Error eliminando registro:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // MANEJO DE EVENTOS UI
  // ============================================================================

  const initiateDelete = (record: BirthRecord) => {
    console.log("🗑️ Iniciando eliminación para:", record.id);
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    console.log("❌ Eliminación cancelada");
    setShowDeleteConfirm(false);
    setRecordToDelete(null);
  };

  const handleEdit = (record: BirthRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingRecord(null);
    resetForm();
    setShowForm(true);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await BirthRecordsService.testConnection();
      setIsConnected(connected);
      if (connected) {
        setConnectionError(null);
        await loadDataFromBackend();
        alert('✅ Conexión exitosa con el backend');
      } else {
        setConnectionError('No se pudo conectar con el backend');
        alert('❌ No se pudo conectar con el backend');
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Error desconocido');
      alert('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const getHealthColor = (health: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return colors[health as keyof typeof colors] || colors.good;
  };

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      successful: "bg-green-100 text-green-800",
      complicated: "bg-yellow-100 text-yellow-800",
      loss: "bg-red-100 text-red-800",
    };
    return colors[outcome as keyof typeof colors] || colors.successful;
  };

  const getBirthTypeColor = (type: string) => {
    const colors = {
      natural: "bg-green-100 text-green-800",
      assisted: "bg-yellow-100 text-yellow-800",
      cesarean: "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || colors.natural;
  };

  const getGenderIcon = (gender: string) => {
    return gender === "male" ? (
      <Crown className="w-4 h-4 text-blue-600" />
    ) : (
      <Heart className="w-4 h-4 text-pink-600" />
    );
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("❌ No hay registros para exportar");
      return;
    }

    try {
      const csvData = filteredRecords.map(record => ({
        'ID': record.id,
        'Madre': record.motherName,
        'Arete Madre': record.motherEarTag,
        'Edad Madre': record.motherAge,
        'Gestación #': record.pregnancyNumber,
        'Días Gestación': record.gestationDays,
        'Fecha Nacimiento': formatDate(record.birthDate),
        'Hora Nacimiento': record.birthTime,
        'Tipo Parto': record.laborDetails.type,
        'Dificultad': record.laborDetails.difficulty,
        'Duración (min)': record.laborDetails.duration,
        'Asistido Por': record.laborDetails.assistedBy.name,
        'Género Becerro': record.calf.gender === 'male' ? 'Macho' : 'Hembra',
        'Peso Becerro (kg)': record.calf.birthWeight,
        'Estado Salud': record.calf.healthStatus,
        'Arete Temporal': record.calf.tempEarTag || '',
        'Ubicación': record.location.address,
        'Costo Total': record.economics.totalCost,
        'Valor Estimado': record.economics.estimatedValue,
        'Resultado': record.outcome,
        'Notas': record.notes,
        'Fecha Creación': formatDate(record.createdAt.split('T')[0])
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            const stringValue = String(value || '');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const filename = `registros_nacimientos_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert(`✅ Archivo exportado: ${filename}\n📊 ${filteredRecords.length} registros exportados`);
      
    } catch (error) {
      console.error("❌ Error en exportación:", error);
      alert("❌ Error al exportar los datos");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-MX');
  };

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Cargando registros de nacimientos...</p>
            {connectionError && (
              <div className="text-center">
                <p className="text-red-600 text-sm mb-2">⚠️ {connectionError}</p>
                <button
                  onClick={testConnection}
                  className="text-sm bg-[#519a7c] text-white px-4 py-2 rounded-lg hover:bg-[#4a8970]"
                >
                  Reintentar conexión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Registros de Nacimientos
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">
                    Gestión de nacimientos y seguimiento neonatal bovino
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isConnected ? 'Conectado' : 'Sin conexión'}
                    </span>
                    {!isConnected && (
                      <button
                        onClick={testConnection}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        Reconectar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                  showFilters 
                    ? "bg-[#519a7c] text-white border-[#519a7c]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#519a7c]"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              <button
                type="button"
                onClick={handleNew}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Nacimiento</span>
              </button>
            </div>
          </div>

          {/* Indicador de conexión más visible */}
          {connectionError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">Error de conexión:</p>
                  <p className="text-red-600">{connectionError}</p>
                </div>
                <button
                  onClick={testConnection}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                >
                  Reconectar
                </button>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Machos", value: stats.males, icon: Crown, color: "text-blue-600" },
              { label: "Hembras", value: stats.females, icon: Heart, color: "text-pink-600" },
              { label: "Peso Promedio", value: stats.averageWeight, icon: Scale, color: "text-purple-600" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Nombre de madre..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Parto
                </label>
                <select
                  value={filters.birthType}
                  onChange={(e) => setFilters(prev => ({ ...prev, birthType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="natural">Natural</option>
                  <option value="assisted">Asistido</option>
                  <option value="cesarean">Cesárea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado
                </label>
                <select
                  value={filters.outcome}
                  onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="successful">Exitoso</option>
                  <option value="complicated">Complicado</option>
                  <option value="loss">Pérdida</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setFilters({
                  searchTerm: "",
                  birthType: "",
                  gender: "",
                  outcome: "",
                  dateRange: { start: "", end: "" },
                })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Controles de vista */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              Mostrando {filteredRecords.length} de {records.length} nacimientos
              {!isConnected && (
                <span className="ml-2 text-orange-600">(Modo offline)</span>
              )}
            </span>

            <button 
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-[#519a7c] hover:text-[#519a7c] transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Lista de registros */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{record.motherName}</h3>
                      <p className="text-white/80 text-sm">Arete: {record.motherEarTag}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBirthTypeColor(record.laborDetails.type)}`}>
                      {record.laborDetails.type === "natural" && "Natural"}
                      {record.laborDetails.type === "assisted" && "Asistido"}
                      {record.laborDetails.type === "cesarean" && "Cesárea"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(record.outcome)}`}>
                      {record.outcome === "successful" && "Exitoso"}
                      {record.outcome === "complicated" && "Complicado"}
                      {record.outcome === "loss" && "Pérdida"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Fecha:</p>
                    <p className="text-gray-900">{formatDate(record.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Hora:</p>
                    <p className="text-gray-900">{record.birthTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Gestación:</p>
                    <p className="text-gray-900">{record.gestationDays} días</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Gestación #:</p>
                    <p className="text-gray-900">{record.pregnancyNumber}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    {getGenderIcon(record.calf.gender)}
                    <span className="ml-2">
                      Becerr{record.calf.gender === "male" ? "o" : "a"}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Peso:</p>
                      <p className="font-bold text-[#519a7c]">{record.calf.birthWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Salud:</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.calf.healthStatus)}`}>
                        {record.calf.healthStatus === "excellent" && "Excelente"}
                        {record.calf.healthStatus === "good" && "Bueno"}
                        {record.calf.healthStatus === "fair" && "Regular"}
                        {record.calf.healthStatus === "poor" && "Malo"}
                      </span>
                    </div>
                    {record.calf.tempEarTag && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Arete:</p>
                        <p className="font-medium">{record.calf.tempEarTag}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-yellow-600" />
                    Asistencia
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Por:</span> {record.laborDetails.assistedBy.name}</p>
                    <p><span className="text-gray-600">Duración:</span> {record.laborDetails.duration} min</p>
                    <p><span className="text-gray-600">Dificultad:</span> 
                      <span className={`ml-1 font-medium ${
                        record.laborDetails.difficulty === "easy" ? "text-green-600" :
                        record.laborDetails.difficulty === "moderate" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {record.laborDetails.difficulty === "easy" && "Fácil"}
                        {record.laborDetails.difficulty === "moderate" && "Moderada"}
                        {record.laborDetails.difficulty === "difficult" && "Difícil"}
                      </span>
                    </p>
                  </div>
                </div>

                {record.laborDetails.complications.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-red-600" />
                      Complicaciones ({record.laborDetails.complications.length})
                    </h4>
                    <div className="space-y-1">
                      {record.laborDetails.complications.slice(0, 2).map((comp, idx) => (
                        <p key={idx} className="text-sm text-red-700">• {comp}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{record.location.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${record.economics.totalCost.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-600">Costo total</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      ${record.economics.estimatedValue.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-600">Valor estimado</p>
                  </div>
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" />
                      Notas
                    </h4>
                    <p className="text-sm text-gray-700 line-clamp-2">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="p-2 text-gray-600 hover:text-[#519a7c] hover:bg-white rounded-lg transition-all duration-200"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(record)}
                    disabled={isSaving}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      initiateDelete(record);
                    }}
                    disabled={isSaving}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(record.createdAt.split('T')[0])}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        {showDeleteConfirm && recordToDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                ¿Eliminar Registro?
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Madre:</span> {recordToDelete.motherName}</p>
                  <p><span className="font-medium">Arete:</span> {recordToDelete.motherEarTag}</p>
                  <p><span className="font-medium">Fecha:</span> {formatDate(recordToDelete.birthDate)}</p>
                  <p><span className="font-medium">Becerr{recordToDelete.calf.gender === "male" ? "o" : "a"}:</span> {recordToDelete.calf.birthWeight} kg</p>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mb-6">
                Esta acción no se puede deshacer. Se perderán todos los datos del nacimiento.
              </p>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Modal - Simplificado */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? "Editar" : "Nuevo"} Nacimiento
                  {!isConnected && <span className="text-orange-600 ml-2">(Offline)</span>}
                </h2>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSaving}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la madre *
                    </label>
                    <input
                      type="text"
                      value={formData.motherName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      placeholder="Ej: Bella"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arete de la madre *
                    </label>
                    <input
                      type="text"
                      value={formData.motherEarTag || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherEarTag: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      placeholder="Ej: MX-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || new Date().toISOString().substr(0, 10)}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de nacimiento *
                    </label>
                    <input
                      type="time"
                      value={formData.birthTime || new Date().toTimeString().substr(0, 5)}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Becerro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género *
                      </label>
                      <select
                        value={formData.calf?.gender || "male"}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          calf: { ...prev.calf!, gender: e.target.value as "male" | "female" }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="male">Macho</option>
                        <option value="female">Hembra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso al nacer (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.calf?.birthWeight || ""}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          calf: { ...prev.calf!, birthWeight: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        min="0"
                        placeholder="Ej: 42.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSaving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={editingRecord ? handleUpdate : handleCreate}
                    disabled={isSaving}
                    className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? "Guardando..." : (editingRecord ? "Actualizar" : "Guardar")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles - {selectedRecord.motherName}
                </h2>
                <button 
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Fecha:</span> {formatDate(selectedRecord.birthDate)}</p>
                      <p><span className="font-medium">Hora:</span> {selectedRecord.birthTime}</p>
                      <p><span className="font-medium">Madre:</span> {selectedRecord.motherName} ({selectedRecord.motherEarTag})</p>
                      <p><span className="font-medium">Edad madre:</span> {selectedRecord.motherAge} años</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Becerro</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Género:</span> {selectedRecord.calf.gender === "male" ? "Macho" : "Hembra"}</p>
                      <p><span className="font-medium">Peso:</span> {selectedRecord.calf.birthWeight} kg</p>
                      <p><span className="font-medium">Estado salud:</span> {selectedRecord.calf.healthStatus}</p>
                      {selectedRecord.calf.tempEarTag && (
                        <p><span className="font-medium">Arete temporal:</span> {selectedRecord.calf.tempEarTag}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                    handleEdit(selectedRecord);
                  }}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay registros */}
        {filteredRecords.length === 0 && !isLoading && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron nacimientos</h3>
            <p className="text-gray-600 mb-6">
              No hay registros que coincidan con los filtros aplicados.
              {!isConnected && (
                <span className="block text-orange-600 mt-2">Trabajando en modo offline.</span>
              )}
            </p>
            <button
              type="button"
              onClick={handleNew}
              className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Primer Nacimiento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthRecords;