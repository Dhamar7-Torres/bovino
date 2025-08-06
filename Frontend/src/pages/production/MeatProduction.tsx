// src/pages/production/MeatProduction.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Beef,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  Loader
} from 'lucide-react';

// Interfaces
interface MeatRecord {
  id: string;
  animalId: string;
  animalName: string;
  breed: string;
  birthDate: string;
  slaughterDate: string;
  liveWeight: number;
  carcassWeight: number;
  yieldPercentage: number;
  grade: 'AAA' | 'AA' | 'A' | 'B' | 'C';
  cuts: {
    name: string;
    weight: number;
    pricePerKg: number;
  }[];
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  processor: string;
  destination: 'Venta Directa' | 'Frigorífico' | 'Exportación' | 'Consumo Propio';
  notes?: string;
  status: 'Programado' | 'Procesado' | 'Vendido' | 'Almacenado';
  totalValue: number;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  breed: string;
  grade: string;
  destination: string;
  status: string;
}

interface FormData {
  animalId: string;
  animalName: string;
  breed: string;
  birthDate: string;
  slaughterDate: string;
  liveWeight: string;
  carcassWeight: string;
  yieldPercentage: string;
  grade: string;
  cuts: {
    name: string;
    weight: string;
    pricePerKg: string;
  }[];
  processor: string;
  destination: string;
  notes: string;
  status: string;
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Token management
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// API Service
class MeatAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Obtener registros de producción cárnica
  static async getMeatRecords(filters?: {
    dateFrom?: string;
    dateTo?: string;
    breed?: string;
    grade?: string;
    status?: string;
  }): Promise<{ data: MeatRecord[], total: number }> {
    const params = new URLSearchParams();
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.breed) params.append('breed', filters.breed);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/production/meat${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest(endpoint);
    return {
      data: response.data || [],
      total: response.total || 0
    };
  }

  // Crear registro de producción cárnica
  static async createMeatRecord(record: Omit<MeatRecord, 'id'>): Promise<MeatRecord> {
    const response = await this.makeRequest('/production/meat', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return response.data;
  }

  // Actualizar registro
  static async updateMeatRecord(id: string, record: Partial<MeatRecord>): Promise<MeatRecord> {
    const response = await this.makeRequest(`/production/meat/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
    return response.data;
  }

  // Eliminar registro
  static async deleteMeatRecord(id: string): Promise<void> {
    await this.makeRequest(`/production/meat/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas
  static async getProductionStats(): Promise<any> {
    const response = await this.makeRequest('/production/stats/meat');
    return response.data;
  }

  // Obtener registros de peso (para obtener datos de animales)
  static async getWeightRecords(): Promise<any[]> {
    const response = await this.makeRequest('/production/weight');
    return response.data || [];
  }
}

// Error Alert Component
const ErrorAlert: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-red-800 font-medium">Error de conexión</h4>
      <p className="text-red-700 text-sm mt-1">{message}</p>
    </div>
    {onClose && (
      <button 
        onClick={onClose}
        className="text-red-500 hover:text-red-700 p-1 rounded"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const MeatProduction: React.FC = () => {
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meatRecords, setMeatRecords] = useState<MeatRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MeatRecord[]>([]);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MeatRecord | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Estados para filtros
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    breed: '',
    grade: '',
    destination: '',
    status: ''
  });

  // Estado para formulario
  const [formData, setFormData] = useState<FormData>({
    animalId: '',
    animalName: '',
    breed: '',
    birthDate: '',
    slaughterDate: new Date().toISOString().split('T')[0],
    liveWeight: '',
    carcassWeight: '',
    yieldPercentage: '',
    grade: 'A',
    cuts: [
      { name: 'Lomo', weight: '', pricePerKg: '' },
      { name: 'Costilla', weight: '', pricePerKg: '' },
      { name: 'Pierna', weight: '', pricePerKg: '' }
    ],
    processor: '',
    destination: 'Venta Directa',
    notes: '',
    status: 'Programado'
  });

  // Efectos
  useEffect(() => {
    loadMeatRecords();
  }, []);

  useEffect(() => {
    let filtered = meatRecords.filter(record => {
      const matchesDateFrom = !filters.dateFrom || record.slaughterDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || record.slaughterDate <= filters.dateTo;
      const matchesBreed = !filters.breed || record.breed.toLowerCase().includes(filters.breed.toLowerCase());
      const matchesGrade = !filters.grade || record.grade === filters.grade;
      const matchesDestination = !filters.destination || record.destination === filters.destination;
      const matchesStatus = !filters.status || record.status === filters.status;

      return matchesDateFrom && matchesDateTo && matchesBreed && matchesGrade && matchesDestination && matchesStatus;
    });
    setFilteredRecords(filtered);
  }, [meatRecords, filters]);

  useEffect(() => {
    if (formData.liveWeight && formData.carcassWeight) {
      const live = parseFloat(formData.liveWeight);
      const carcass = parseFloat(formData.carcassWeight);
      if (live > 0) {
        const yield_percent = (carcass / live) * 100;
        setFormData(prev => ({ ...prev, yieldPercentage: yield_percent.toFixed(1) }));
      }
    }
  }, [formData.liveWeight, formData.carcassWeight]);

  // Funciones de API
  const loadMeatRecords = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await MeatAPI.getMeatRecords();
      setMeatRecords(result.data);
      setFilteredRecords(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los registros';
      setError(`No se pudieron cargar los registros: ${errorMessage}`);
      console.error('Error loading meat records:', err);
      
      // Fallback a datos de ejemplo en caso de error
      const mockData: MeatRecord[] = [
        {
          id: '1',
          animalId: 'BULL001',
          animalName: 'Tornado',
          breed: 'Angus',
          birthDate: '2021-03-15',
          slaughterDate: '2025-07-15',
          liveWeight: 580,
          carcassWeight: 348,
          yieldPercentage: 60,
          grade: 'AAA',
          cuts: [
            { name: 'Lomo', weight: 45, pricePerKg: 180 },
            { name: 'Costilla', weight: 78, pricePerKg: 120 }
          ],
          location: { lat: 16.7569, lng: -92.6348, name: 'Matadero TIF 001' },
          processor: 'Frigorífico Los Altos',
          destination: 'Exportación',
          notes: 'Animal de excelente calidad',
          status: 'Procesado',
          totalValue: 38250
        }
      ];
      setMeatRecords(mockData);
      setFilteredRecords(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para manejar modales
  const openCreateModal = () => {
    setFormData({
      animalId: '',
      animalName: '',
      breed: '',
      birthDate: '',
      slaughterDate: new Date().toISOString().split('T')[0],
      liveWeight: '',
      carcassWeight: '',
      yieldPercentage: '',
      grade: 'A',
      cuts: [
        { name: 'Lomo', weight: '', pricePerKg: '' },
        { name: 'Costilla', weight: '', pricePerKg: '' },
        { name: 'Pierna', weight: '', pricePerKg: '' }
      ],
      processor: '',
      destination: 'Venta Directa',
      notes: '',
      status: 'Programado'
    });
    setSelectedRecord(null);
    setError(null);
    setShowCreateModal(true);
  };

  const openEditModal = (record: MeatRecord) => {
    setFormData({
      animalId: record.animalId,
      animalName: record.animalName,
      breed: record.breed,
      birthDate: record.birthDate,
      slaughterDate: record.slaughterDate,
      liveWeight: record.liveWeight.toString(),
      carcassWeight: record.carcassWeight.toString(),
      yieldPercentage: record.yieldPercentage.toString(),
      grade: record.grade,
      cuts: record.cuts.map(cut => ({
        name: cut.name,
        weight: cut.weight.toString(),
        pricePerKg: cut.pricePerKg.toString()
      })),
      processor: record.processor,
      destination: record.destination,
      notes: record.notes || '',
      status: record.status
    });
    setSelectedRecord(record);
    setError(null);
    setShowEditModal(true);
  };

  const openViewModal = (record: MeatRecord) => {
    setSelectedRecord(record);
    setError(null);
    setShowViewModal(true);
  };

  // Funciones CRUD
  const handleCreate = async (): Promise<void> => {
    if (!formData.animalId.trim() || !formData.animalName.trim()) {
      setError('Por favor complete los campos obligatorios: ID del animal y nombre');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const newRecord: MeatRecord = {
        id: '', // El backend generará el ID
        animalId: formData.animalId,
        animalName: formData.animalName,
        breed: formData.breed,
        birthDate: formData.birthDate,
        slaughterDate: formData.slaughterDate,
        liveWeight: parseFloat(formData.liveWeight) || 0,
        carcassWeight: parseFloat(formData.carcassWeight) || 0,
        yieldPercentage: parseFloat(formData.yieldPercentage) || 0,
        grade: formData.grade as MeatRecord['grade'],
        cuts: formData.cuts.map(cut => ({
          name: cut.name,
          weight: parseFloat(cut.weight) || 0,
          pricePerKg: parseFloat(cut.pricePerKg) || 0
        })),
        location: { lat: 16.7569, lng: -92.6348, name: 'Matadero Principal' },
        processor: formData.processor,
        destination: formData.destination as MeatRecord['destination'],
        notes: formData.notes,
        status: formData.status as MeatRecord['status'],
        totalValue: formData.cuts.reduce((sum, cut) => 
          sum + (parseFloat(cut.weight) || 0) * (parseFloat(cut.pricePerKg) || 0), 0
        )
      };

      await MeatAPI.createMeatRecord(newRecord);
      await loadMeatRecords(); // Recargar datos
      setShowCreateModal(false);
      alert('Registro creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al crear el registro: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (): Promise<void> => {
    if (!selectedRecord || !formData.animalId.trim() || !formData.animalName.trim()) {
      setError('Por favor complete los campos obligatorios');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updatedRecord: MeatRecord = {
        ...selectedRecord,
        animalId: formData.animalId,
        animalName: formData.animalName,
        breed: formData.breed,
        birthDate: formData.birthDate,
        slaughterDate: formData.slaughterDate,
        liveWeight: parseFloat(formData.liveWeight) || 0,
        carcassWeight: parseFloat(formData.carcassWeight) || 0,
        yieldPercentage: parseFloat(formData.yieldPercentage) || 0,
        grade: formData.grade as MeatRecord['grade'],
        cuts: formData.cuts.map(cut => ({
          name: cut.name,
          weight: parseFloat(cut.weight) || 0,
          pricePerKg: parseFloat(cut.pricePerKg) || 0
        })),
        processor: formData.processor,
        destination: formData.destination as MeatRecord['destination'],
        notes: formData.notes,
        status: formData.status as MeatRecord['status'],
        totalValue: formData.cuts.reduce((sum, cut) => 
          sum + (parseFloat(cut.weight) || 0) * (parseFloat(cut.pricePerKg) || 0), 0
        )
      };

      await MeatAPI.updateMeatRecord(selectedRecord.id, updatedRecord);
      await loadMeatRecords(); // Recargar datos
      setShowEditModal(false);
      alert('Registro actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al actualizar el registro: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('¿Está seguro que desea eliminar este registro?')) {
      return;
    }

    try {
      setError(null);
      await MeatAPI.deleteMeatRecord(id);
      await loadMeatRecords(); // Recargar datos
      alert('Registro eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar el registro: ${errorMessage}`);
    }
  };

  // Funciones auxiliares
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'AAA': return 'bg-green-100 text-green-800';
      case 'AA': return 'bg-blue-100 text-blue-800';
      case 'A': return 'bg-yellow-100 text-yellow-800';
      case 'B': return 'bg-orange-100 text-orange-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Procesado': return 'bg-green-100 text-green-800';
      case 'Vendido': return 'bg-blue-100 text-blue-800';
      case 'Programado': return 'bg-yellow-100 text-yellow-800';
      case 'Almacenado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Componente Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Beef className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
          </div>
          <p className="text-white text-lg font-medium">Cargando Producción Cárnica...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2 flex items-center gap-3">
              <Beef className="h-10 w-10" />
              Producción Cárnica
            </h1>
            <p className="text-white/90 text-lg">
              Gestión integral de procesamiento y comercialización de ganado
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button 
              onClick={() => loadMeatRecords()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-md hover:from-[#265a44] hover:to-[#3d7a5c] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert 
            message={error} 
            onClose={() => setError(null)}
          />
        )}

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raza</label>
                <input
                  type="text"
                  placeholder="Filtrar por raza..."
                  value={filters.breed}
                  onChange={(e) => setFilters({...filters, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                >
                  <option value="">Todos</option>
                  <option value="AAA">AAA</option>
                  <option value="AA">AA</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                >
                  <option value="">Todos</option>
                  <option value="Programado">Programado</option>
                  <option value="Procesado">Procesado</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Almacenado">Almacenado</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setFilters({
                    dateFrom: '', dateTo: '', breed: '', grade: '', destination: '', status: ''
                  })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de registros */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#519a7c]" />
              Registros de Producción ({filteredRecords.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Sacrificio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso / Rendimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-[#519a7c]/10 rounded-full mr-3">
                          <Beef className="h-4 w-4 text-[#519a7c]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.animalName}</div>
                          <div className="text-sm text-gray-500">{record.animalId} - {record.breed}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {record.slaughterDate}
                      </div>
                      <div className="text-sm text-gray-500">{record.processor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.liveWeight} kg vivo</div>
                      <div className="text-sm text-gray-500">{record.carcassWeight} kg canal ({record.yieldPercentage}%)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(record.grade)}`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(record.totalValue)}</div>
                      <div className="text-sm text-gray-500">{record.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openViewModal(record)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(record)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Beef className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
              <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Modal para Crear/Editar */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Beef className="h-6 w-6 text-[#519a7c]" />
                    {showCreateModal ? 'Nuevo Registro de Producción Cárnica' : 'Editar Registro de Producción Cárnica'}
                  </h2>
                  <button 
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setError(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Error en modal */}
                {error && (
                  <ErrorAlert 
                    message={error} 
                    onClose={() => setError(null)}
                  />
                )}

                {/* Información del animal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID del Animal *</label>
                    <input
                      type="text"
                      placeholder="Ej: BULL001"
                      value={formData.animalId}
                      onChange={(e) => setFormData({...formData, animalId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Animal *</label>
                    <input
                      type="text"
                      placeholder="Ej: Tornado"
                      value={formData.animalName}
                      onChange={(e) => setFormData({...formData, animalName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Raza</label>
                    <input
                      type="text"
                      placeholder="Ej: Angus, Holstein, Charolais..."
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Sacrificio *</label>
                    <input
                      type="date"
                      value={formData.slaughterDate}
                      onChange={(e) => setFormData({...formData, slaughterDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                </div>

                {/* Pesos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso Vivo (kg) *</label>
                    <input
                      type="number"
                      placeholder="580"
                      value={formData.liveWeight}
                      onChange={(e) => setFormData({...formData, liveWeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso Canal (kg)</label>
                    <input
                      type="number"
                      placeholder="348"
                      value={formData.carcassWeight}
                      onChange={(e) => setFormData({...formData, carcassWeight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rendimiento (%)</label>
                    <input
                      type="number"
                      value={formData.yieldPercentage}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    >
                      <option value="AAA">AAA - Premium</option>
                      <option value="AA">AA - Superior</option>
                      <option value="A">A - Buena</option>
                      <option value="B">B - Regular</option>
                      <option value="C">C - Comercial</option>
                    </select>
                  </div>
                </div>

                {/* Cortes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Despiece</h3>
                  <div className="space-y-3">
                    {formData.cuts.map((cut, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          placeholder="Nombre del corte"
                          value={cut.name}
                          onChange={(e) => {
                            const newCuts = [...formData.cuts];
                            newCuts[index] = { ...newCuts[index], name: e.target.value };
                            setFormData({ ...formData, cuts: newCuts });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                        />
                        <input
                          type="number"
                          placeholder="Peso (kg)"
                          value={cut.weight}
                          onChange={(e) => {
                            const newCuts = [...formData.cuts];
                            newCuts[index] = { ...newCuts[index], weight: e.target.value };
                            setFormData({ ...formData, cuts: newCuts });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                        />
                        <input
                          type="number"
                          placeholder="Precio/kg"
                          value={cut.pricePerKg}
                          onChange={(e) => {
                            const newCuts = [...formData.cuts];
                            newCuts[index] = { ...newCuts[index], pricePerKg: e.target.value };
                            setFormData({ ...formData, cuts: newCuts });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            {formatCurrency((parseFloat(cut.weight) || 0) * (parseFloat(cut.pricePerKg) || 0))}
                          </span>
                          {formData.cuts.length > 1 && (
                            <button
                              onClick={() => {
                                const newCuts = formData.cuts.filter((_, i) => i !== index);
                                setFormData({ ...formData, cuts: newCuts });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newCuts = [...formData.cuts, { name: '', weight: '', pricePerKg: '' }];
                        setFormData({ ...formData, cuts: newCuts });
                      }}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Corte
                    </button>
                  </div>
                </div>

                {/* Otros campos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procesador</label>
                    <input
                      type="text"
                      placeholder="Ej: Frigorífico Los Altos"
                      value={formData.processor}
                      onChange={(e) => setFormData({...formData, processor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    >
                      <option value="Venta Directa">Venta Directa</option>
                      <option value="Frigorífico">Frigorífico</option>
                      <option value="Exportación">Exportación</option>
                      <option value="Consumo Propio">Consumo Propio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                    >
                      <option value="Programado">Programado</option>
                      <option value="Procesado">Procesado</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Almacenado">Almacenado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                  <textarea
                    placeholder="Observaciones adicionales..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#519a7c]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  onClick={showCreateModal ? handleCreate : handleEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-md hover:from-[#265a44] hover:to-[#3d7a5c] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Ver Detalles */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="h-6 w-6 text-[#519a7c]" />
                    Detalles del Registro
                  </h2>
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Información del Animal</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{selectedRecord.animalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium">{selectedRecord.animalId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Raza:</span>
                        <span className="font-medium">{selectedRecord.breed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peso Vivo:</span>
                        <span className="font-medium">{selectedRecord.liveWeight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peso Canal:</span>
                        <span className="font-medium">{selectedRecord.carcassWeight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rendimiento:</span>
                        <span className="font-medium">{selectedRecord.yieldPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grado:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(selectedRecord.grade)}`}>
                          {selectedRecord.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cortes y Valoración</h3>
                    <div className="space-y-2">
                      {selectedRecord.cuts.map((cut, index) => (
                        <div key={index} className="flex justify-between text-sm border-b pb-2">
                          <span className="text-gray-600 font-medium">{cut.name}:</span>
                          <div className="text-right">
                            <div className="font-medium">
                              {cut.weight} kg × {formatCurrency(cut.pricePerKg)}
                            </div>
                            <div className="text-[#519a7c] font-semibold">
                              = {formatCurrency(cut.weight * cut.pricePerKg)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-[#519a7c]">{formatCurrency(selectedRecord.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Procesamiento</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Sacrificio:</span>
                      <span className="font-medium">{selectedRecord.slaughterDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Procesador:</span>
                      <span className="font-medium">{selectedRecord.processor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-medium">{selectedRecord.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lugar:</span>
                      <span className="font-medium">{selectedRecord.location.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coordenadas:</span>
                      <span className="font-mono">
                        {selectedRecord.location.lat.toFixed(4)}, {selectedRecord.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeatProduction;