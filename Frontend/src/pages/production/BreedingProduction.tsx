// src/pages/production/BreedingProduction.tsx
import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  BarChart3,
  X,
  Save,
  Search,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';

// Interfaces y tipos
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
  title?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

interface BreedingRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowBreed: string;
  cowAge: number;
  bullId?: string;
  bullName?: string;
  bullBreed?: string;
  matingType: 'Natural' | 'Inseminación Artificial';
  matingDate: string;
  expectedBirthDate: string;
  actualBirthDate?: string;
  gestationDays: number;
  pregnancyStatus: 'Confirmado' | 'Probable' | 'No Confirmado' | 'Fallido';
  birthStatus: 'Pendiente' | 'Nacido Vivo' | 'Nacido Muerto' | 'Aborto';
  calfId?: string;
  calfName?: string;
  calfGender?: 'Macho' | 'Hembra';
  calfWeight?: number;
  calfHealth?: 'Excelente' | 'Buena' | 'Regular' | 'Crítica';
  veterinarianNotes?: string;
  complications?: string;
  nextCycleExpected?: string;
  status: 'Activo' | 'Completado' | 'Fallido' | 'Cancelado';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface FormData {
  cowId: string;
  cowName: string;
  cowBreed: string;
  cowAge: string;
  bullId: string;
  bullName: string;
  bullBreed: string;
  matingType: 'Natural' | 'Inseminación Artificial';
  matingDate: string;
  expectedBirthDate: string;
  actualBirthDate: string;
  gestationDays: string;
  pregnancyStatus: 'Confirmado' | 'Probable' | 'No Confirmado' | 'Fallido';
  birthStatus: 'Pendiente' | 'Nacido Vivo' | 'Nacido Muerto' | 'Aborto';
  calfId: string;
  calfName: string;
  calfGender: 'Macho' | 'Hembra';
  calfWeight: string;
  calfHealth: 'Excelente' | 'Buena' | 'Regular' | 'Crítica';
  veterinarianNotes: string;
  complications: string;
  nextCycleExpected: string;
  status: 'Activo' | 'Completado' | 'Fallido' | 'Cancelado';
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Token management (assumiendo que tienes el token guardado)
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// API Service
class BreedingAPI {
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

  // Obtener todos los registros de reproducción
  static async getBreedingRecords(filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BreedingRecord[], total: number }> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/reproduction/mating-records${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest(endpoint);
    return {
      data: response.data || [],
      total: response.total || 0
    };
  }

  // Crear un nuevo registro
  static async createBreedingRecord(record: Omit<BreedingRecord, 'id'>): Promise<BreedingRecord> {
    const response = await this.makeRequest('/reproduction/mating-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return response.data;
  }

  // Actualizar un registro existente
  static async updateBreedingRecord(id: string, record: Partial<BreedingRecord>): Promise<BreedingRecord> {
    const response = await this.makeRequest(`/reproduction/mating-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
    return response.data;
  }

  // Eliminar un registro
  static async deleteBreedingRecord(id: string): Promise<void> {
    await this.makeRequest(`/reproduction/mating-records/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener estadísticas del dashboard
  static async getDashboardStats(): Promise<any> {
    const response = await this.makeRequest('/reproduction/dashboard');
    return response.data;
  }
}

// Componentes básicos con tipado correcto
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-4 lg:p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg lg:text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-4 lg:p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  title 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] focus-visible:ring-[#519a7c]',
    destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500'
  };

  const sizeClasses: Record<string, string> = {
    default: 'h-9 px-4 py-2 min-w-[2.25rem]',
    sm: 'h-8 px-3 text-xs min-w-[2rem]',
    lg: 'h-11 px-8 text-base min-w-[2.75rem]'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Select: React.FC<SelectProps> = ({ children, value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${className}`}
  >
    {children}
  </select>
);

const Textarea: React.FC<TextareaProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  rows = 3 
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none ${className}`}
  />
);

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Componente para mostrar errores
const ErrorAlert: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-red-800 font-medium">Error de conexión</h4>
      <p className="text-red-700 text-sm mt-1">{message}</p>
    </div>
    {onClose && (
      <Button variant="ghost" size="sm" onClick={onClose} className="text-red-500 hover:text-red-700">
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
);

// Componente para dropdown de acciones en móvil
const ActionDropdown: React.FC<{
  record: BreedingRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver
          </button>
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

// Componente de tarjeta para vista móvil
const MobileBreedingCard: React.FC<{
  record: BreedingRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getStatusColor: (status: string) => 'default' | 'success' | 'warning' | 'error' | 'info';
}> = ({ record, onView, onEdit, onDelete, getStatusColor }) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#519a7c]/10 rounded-full">
              <Heart className="h-3.5 w-3.5 text-[#519a7c]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate text-sm">{record.cowName}</h3>
              <p className="text-xs text-gray-500 truncate">{record.cowId} - {record.cowBreed}</p>
            </div>
          </div>
          <ActionDropdown
            record={record}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Apareamiento:</span>
            <span className="font-medium truncate ml-2">{record.matingDate}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Gestación:</span>
            <span className="font-medium">{record.gestationDays} días</span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Estado Embarazo:</span>
            <Badge variant={getStatusColor(record.pregnancyStatus)} className="text-xs px-1.5 py-0.5">
              {record.pregnancyStatus}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Parto:</span>
            <Badge variant={getStatusColor(record.birthStatus)} className="text-xs px-1.5 py-0.5">
              {record.birthStatus}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Estado:</span>
            <Badge variant={getStatusColor(record.status)} className="text-xs px-1.5 py-0.5">
              {record.status}
            </Badge>
          </div>
        </div>

        {record.calfName && record.birthStatus === 'Nacido Vivo' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Cría:</span>
              <span className="font-medium truncate ml-2">{record.calfName} ({record.calfGender})</span>
            </div>
          </div>
        )}

        {/* Botones de acción para desktop */}
        <div className="hidden lg:flex gap-1 mt-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={onView} className="text-blue-600 hover:text-blue-800 text-xs h-7">
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-green-600 hover:text-green-800 text-xs h-7">
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-800 text-xs h-7">
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BreedingProduction: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, name: string}>({
    lat: 16.7569,
    lng: -92.6348,
    name: 'Ubicación actual'
  });

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMobileView, setShowMobileView] = useState<boolean>(false);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<BreedingRecord | null>(null);

  // Estado del formulario
  const [form, setForm] = useState<FormData>({
    cowId: '',
    cowName: '',
    cowBreed: '',
    cowAge: '',
    bullId: '',
    bullName: '',
    bullBreed: '',
    matingType: 'Natural',
    matingDate: '',
    expectedBirthDate: '',
    actualBirthDate: '',
    gestationDays: '',
    pregnancyStatus: 'No Confirmado',
    birthStatus: 'Pendiente',
    calfId: '',
    calfName: '',
    calfGender: 'Hembra',
    calfWeight: '',
    calfHealth: 'Buena',
    veterinarianNotes: '',
    complications: '',
    nextCycleExpected: '',
    status: 'Activo'
  });

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setShowMobileView(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Cargar datos al inicio y obtener ubicación
  useEffect(() => {
    const initializeComponent = async () => {
      // Obtener ubicación actual
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              name: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            });
          },
          (error) => {
            console.log('Error obteniendo ubicación:', error);
            // Mantener ubicación por defecto
          }
        );
      }

      // Cargar registros de reproducción
      await loadBreedingRecords();
    };

    initializeComponent();
  }, []);

  // Filtrar registros cuando cambian los filtros
  useEffect(() => {
    let filtered = records;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cowBreed.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, statusFilter]);

  // Calcular fecha esperada cuando cambia fecha de apareamiento
  useEffect(() => {
    if (form.matingDate) {
      const matingDate = new Date(form.matingDate);
      const expectedDate = new Date(matingDate.getTime() + (280 * 24 * 60 * 60 * 1000));
      setForm(prev => ({
        ...prev,
        expectedBirthDate: expectedDate.toISOString().split('T')[0]
      }));
    }
  }, [form.matingDate]);

  // Calcular días de gestación
  useEffect(() => {
    if (form.matingDate) {
      const matingDate = new Date(form.matingDate);
      let days = 0;
      
      if (form.actualBirthDate) {
        const birthDate = new Date(form.actualBirthDate);
        days = Math.ceil((birthDate.getTime() - matingDate.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        const today = new Date();
        days = Math.ceil((today.getTime() - matingDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      setForm(prev => ({
        ...prev,
        gestationDays: days.toString()
      }));
    }
  }, [form.matingDate, form.actualBirthDate]);

  // Funciones de API
  const loadBreedingRecords = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await BreedingAPI.getBreedingRecords();
      setRecords(result.data);
      setFilteredRecords(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los registros';
      setError(`No se pudieron cargar los registros: ${errorMessage}`);
      console.error('Error loading breeding records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones principales
  const resetForm = (): void => {
    setForm({
      cowId: '',
      cowName: '',
      cowBreed: '',
      cowAge: '',
      bullId: '',
      bullName: '',
      bullBreed: '',
      matingType: 'Natural',
      matingDate: '',
      expectedBirthDate: '',
      actualBirthDate: '',
      gestationDays: '',
      pregnancyStatus: 'No Confirmado',
      birthStatus: 'Pendiente',
      calfId: '',
      calfName: '',
      calfGender: 'Hembra',
      calfWeight: '',
      calfHealth: 'Buena',
      veterinarianNotes: '',
      complications: '',
      nextCycleExpected: '',
      status: 'Activo'
    });
  };

  const openCreateModal = (): void => {
    resetForm();
    setEditingRecord(null);
    setShowCreateModal(true);
    setError(null);
  };

  const openEditModal = (record: BreedingRecord): void => {
    setEditingRecord(record);
    setForm({
      cowId: record.cowId,
      cowName: record.cowName,
      cowBreed: record.cowBreed,
      cowAge: record.cowAge.toString(),
      bullId: record.bullId || '',
      bullName: record.bullName || '',
      bullBreed: record.bullBreed || '',
      matingType: record.matingType,
      matingDate: record.matingDate,
      expectedBirthDate: record.expectedBirthDate,
      actualBirthDate: record.actualBirthDate || '',
      gestationDays: record.gestationDays.toString(),
      pregnancyStatus: record.pregnancyStatus,
      birthStatus: record.birthStatus,
      calfId: record.calfId || '',
      calfName: record.calfName || '',
      calfGender: record.calfGender || 'Hembra',
      calfWeight: record.calfWeight?.toString() || '',
      calfHealth: record.calfHealth || 'Buena',
      veterinarianNotes: record.veterinarianNotes || '',
      complications: record.complications || '',
      nextCycleExpected: record.nextCycleExpected || '',
      status: record.status
    });
    setShowEditModal(true);
    setError(null);
  };

  const saveRecord = async (): Promise<void> => {
    if (!form.cowId || !form.cowName || !form.matingDate) {
      setError('Por favor complete los campos obligatorios: ID de la vaca, nombre y fecha de apareamiento');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const recordData: BreedingRecord = {
        id: editingRecord ? editingRecord.id : '', // El backend generará el ID
        cowId: form.cowId,
        cowName: form.cowName,
        cowBreed: form.cowBreed,
        cowAge: parseInt(form.cowAge) || 0,
        bullId: form.bullId || undefined,
        bullName: form.bullName || undefined,
        bullBreed: form.bullBreed || undefined,
        matingType: form.matingType,
        matingDate: form.matingDate,
        expectedBirthDate: form.expectedBirthDate,
        actualBirthDate: form.actualBirthDate || undefined,
        gestationDays: parseInt(form.gestationDays) || 0,
        pregnancyStatus: form.pregnancyStatus,
        birthStatus: form.birthStatus,
        calfId: form.calfId || undefined,
        calfName: form.calfName || undefined,
        calfGender: form.calfGender || undefined,
        calfWeight: parseFloat(form.calfWeight) || undefined,
        calfHealth: form.calfHealth || undefined,
        veterinarianNotes: form.veterinarianNotes || undefined,
        complications: form.complications || undefined,
        nextCycleExpected: form.nextCycleExpected || undefined,
        status: form.status,
        location: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          name: currentLocation.name
        }
      };

      if (editingRecord) {
        await BreedingAPI.updateBreedingRecord(editingRecord.id, recordData);
        alert('Registro actualizado exitosamente');
      } else {
        await BreedingAPI.createBreedingRecord(recordData);
        alert('Registro creado exitosamente');
      }

      await loadBreedingRecords(); // Recargar los datos
      closeModals();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar el registro: ${errorMessage}`);
      console.error('Error saving record:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string): Promise<void> => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      return;
    }

    try {
      setError(null);
      await BreedingAPI.deleteBreedingRecord(id);
      alert('Registro eliminado exitosamente');
      await loadBreedingRecords(); // Recargar los datos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar el registro: ${errorMessage}`);
      console.error('Error deleting record:', err);
    }
  };

  const viewRecord = (record: BreedingRecord): void => {
    setEditingRecord(record);
    setShowViewModal(true);
    setError(null);
  };

  const closeModals = (): void => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingRecord(null);
    setError(null);
    resetForm();
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'Confirmado': return 'success';
      case 'Probable': return 'warning';
      case 'No Confirmado': return 'info';
      case 'Fallido': return 'error';
      case 'Nacido Vivo': return 'success';
      case 'Pendiente': return 'warning';
      case 'Nacido Muerto': return 'error';
      case 'Aborto': return 'error';
      case 'Activo': return 'info';
      case 'Completado': return 'success';
      case 'Cancelado': return 'default';
      default: return 'default';
    }
  };

  // Componente de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
          </div>
          <p className="text-white text-lg font-medium">Cargando Reproducción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-3 lg:p-4">
      <div className="max-w-6xl mx-auto space-y-3 lg:space-y-4">
        {/* Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-white drop-shadow-sm mb-1 flex items-center gap-2">
              <Heart className="h-6 w-6 lg:h-8 lg:w-8" />
              Reproducción y Cría
            </h1>
            <p className="text-white/90 text-sm lg:text-base">
              Gestión integral del programa reproductivo del ganado
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={openCreateModal} className="flex-1 lg:flex-none text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert 
            message={error} 
            onClose={() => setError(null)}
          />
        )}

        {/* Filtros y búsqueda */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
          <CardContent className="p-3">
            <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-3 lg:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, ID o raza..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="min-w-[130px] text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Completado">Completado</option>
                  <option value="Fallido">Fallido</option>
                  <option value="Cancelado">Cancelado</option>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={loadBreedingRecords}
                  className="text-sm"
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
          <CardHeader className="p-3 lg:p-4">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-[#519a7c]" />
              Registros de Reproducción ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 lg:p-4 lg:pt-0">
            {/* Vista móvil - tarjetas */}
            {showMobileView ? (
              <div className="p-3 space-y-3">
                {filteredRecords.map((record) => (
                  <MobileBreedingCard
                    key={record.id}
                    record={record}
                    onView={() => viewRecord(record)}
                    onEdit={() => openEditModal(record)}
                    onDelete={() => deleteRecord(record.id)}
                    getStatusColor={getStatusColor}
                  />
                ))}
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No hay registros</h3>
                    <p className="text-gray-500 text-sm">No se encontraron registros que coincidan con los filtros.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Vista desktop - tabla compacta */
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[22%]">
                        Vaca
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[18%]">
                        Apareamiento
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[13%]">
                        Gestación
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[12%]">
                        Estado Embarazo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[15%]">
                        Parto
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[10%]">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-[10%]">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#519a7c]/10 rounded-full flex-shrink-0">
                              <Heart className="h-3.5 w-3.5 text-[#519a7c]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">{record.cowName}</div>
                              <div className="text-xs text-gray-500 truncate">{record.cowId} - {record.cowBreed} ({record.cowAge}a)</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate text-xs">{record.matingDate}</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {record.matingType}
                            {record.bullName && ` - ${record.bullName}`}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.gestationDays} días
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {record.expectedBirthDate ? record.expectedBirthDate : 'Sin fecha'}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={getStatusColor(record.pregnancyStatus)} className="text-xs px-2 py-0.5">
                            {record.pregnancyStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={getStatusColor(record.birthStatus)} className="text-xs px-2 py-0.5">
                            {record.birthStatus}
                          </Badge>
                          {record.calfName && record.birthStatus === 'Nacido Vivo' && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {record.calfName} ({record.calfGender})
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={getStatusColor(record.status)} className="text-xs px-2 py-0.5">
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewRecord(record)}
                              className="text-blue-600 hover:text-blue-800 h-7 w-7 p-0"
                              title="Ver detalles"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(record)}
                              className="text-green-600 hover:text-green-800 h-7 w-7 p-0"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-600 hover:text-red-800 h-7 w-7 p-0"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No hay registros</h3>
                    <p className="text-gray-500 text-sm">No se encontraron registros que coincidan con los filtros.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para crear/editar */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 lg:p-4 border-b border-gray-200 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#519a7c]" />
                  <span className="truncate">
                    {showCreateModal ? 'Nuevo Registro de Reproducción' : 'Editar Registro de Reproducción'}
                  </span>
                </h2>
                <Button variant="ghost" onClick={closeModals} className="flex-shrink-0 h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 lg:p-4 space-y-4">
              {/* Error en modal */}
              {error && (
                <ErrorAlert 
                  message={error} 
                  onClose={() => setError(null)}
                />
              )}

              {/* Información de la vaca */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Información de la Vaca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ID de la Vaca *
                    </label>
                    <Input
                      placeholder="Ej: COW001"
                      value={form.cowId}
                      onChange={(e) => setForm({...form, cowId: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre de la Vaca *
                    </label>
                    <Input
                      placeholder="Ej: Esperanza"
                      value={form.cowName}
                      onChange={(e) => setForm({...form, cowName: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Raza
                    </label>
                    <Input
                      placeholder="Ej: Holstein, Angus..."
                      value={form.cowBreed}
                      onChange={(e) => setForm({...form, cowBreed: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Edad (años)
                    </label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={form.cowAge}
                      onChange={(e) => setForm({...form, cowAge: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Información del toro */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Información del Toro/Semental</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo de Apareamiento
                    </label>
                    <Select
                      value={form.matingType}
                      onChange={(value) => setForm({...form, matingType: value as FormData['matingType']})}
                      className="text-sm"
                    >
                      <option value="Natural">Natural</option>
                      <option value="Inseminación Artificial">Inseminación Artificial</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ID del Toro
                    </label>
                    <Input
                      placeholder="Ej: BULL001"
                      value={form.bullId}
                      onChange={(e) => setForm({...form, bullId: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre del Toro
                    </label>
                    <Input
                      placeholder="Ej: Campeón"
                      value={form.bullName}
                      onChange={(e) => setForm({...form, bullName: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Raza del Toro
                    </label>
                    <Input
                      placeholder="Ej: Holstein, Angus..."
                      value={form.bullBreed}
                      onChange={(e) => setForm({...form, bullBreed: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Fechas y gestación */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Fechas y Gestación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha de Apareamiento *
                    </label>
                    <Input
                      type="date"
                      value={form.matingDate}
                      onChange={(e) => setForm({...form, matingDate: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha Esperada de Parto
                    </label>
                    <Input
                      type="date"
                      value={form.expectedBirthDate}
                      readOnly
                      className="bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha Real de Parto
                    </label>
                    <Input
                      type="date"
                      value={form.actualBirthDate}
                      onChange={(e) => setForm({...form, actualBirthDate: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Días de Gestación
                    </label>
                    <Input
                      type="number"
                      value={form.gestationDays}
                      readOnly
                      className="bg-gray-50 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Estados reproductivos */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Estados Reproductivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado de Embarazo
                    </label>
                    <Select
                      value={form.pregnancyStatus}
                      onChange={(value) => setForm({...form, pregnancyStatus: value as FormData['pregnancyStatus']})}
                      className="text-sm"
                    >
                      <option value="No Confirmado">No Confirmado</option>
                      <option value="Probable">Probable</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Fallido">Fallido</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado de Nacimiento
                    </label>
                    <Select
                      value={form.birthStatus}
                      onChange={(value) => setForm({...form, birthStatus: value as FormData['birthStatus']})}
                      className="text-sm"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Nacido Vivo">Nacido Vivo</option>
                      <option value="Nacido Muerto">Nacido Muerto</option>
                      <option value="Aborto">Aborto</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado General
                    </label>
                    <Select
                      value={form.status}
                      onChange={(value) => setForm({...form, status: value as FormData['status']})}
                      className="text-sm"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Completado">Completado</option>
                      <option value="Fallido">Fallido</option>
                      <option value="Cancelado">Cancelado</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Información de la cría */}
              {(form.birthStatus === 'Nacido Vivo' || form.birthStatus === 'Nacido Muerto') && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Información de la Cría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ID de la Cría
                      </label>
                      <Input
                        placeholder="Ej: CALF001"
                        value={form.calfId}
                        onChange={(e) => setForm({...form, calfId: e.target.value})}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre de la Cría
                      </label>
                      <Input
                        placeholder="Ej: Pequeño"
                        value={form.calfName}
                        onChange={(e) => setForm({...form, calfName: e.target.value})}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Sexo
                      </label>
                      <Select
                        value={form.calfGender}
                        onChange={(value) => setForm({...form, calfGender: value as FormData['calfGender']})}
                        className="text-sm"
                      >
                        <option value="Hembra">Hembra</option>
                        <option value="Macho">Macho</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Peso al Nacer (kg)
                      </label>
                      <Input
                        type="number"
                        placeholder="35"
                        value={form.calfWeight}
                        onChange={(e) => setForm({...form, calfWeight: e.target.value})}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado de Salud de la Cría
                    </label>
                    <Select
                      value={form.calfHealth}
                      onChange={(value) => setForm({...form, calfHealth: value as FormData['calfHealth']})}
                      className="text-sm"
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Buena">Buena</option>
                      <option value="Regular">Regular</option>
                      <option value="Crítica">Crítica</option>
                    </Select>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Ubicación</h3>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-[#519a7c] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium truncate block">{currentLocation.name}</span>
                    <div className="text-xs text-gray-500">
                      Ubicación obtenida automáticamente
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas veterinarias */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Observaciones</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notas Veterinarias
                    </label>
                    <Textarea
                      placeholder="Observaciones del veterinario..."
                      value={form.veterinarianNotes}
                      onChange={(e) => setForm({...form, veterinarianNotes: e.target.value})}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Complicaciones
                    </label>
                    <Textarea
                      placeholder="Describir cualquier complicación..."
                      value={form.complications}
                      onChange={(e) => setForm({...form, complications: e.target.value})}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Próximo ciclo */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Planificación</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Próximo Ciclo Esperado
                  </label>
                  <Input
                    type="date"
                    value={form.nextCycleExpected}
                    onChange={(e) => setForm({...form, nextCycleExpected: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-3 lg:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={closeModals} className="order-2 sm:order-1 text-sm" disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={saveRecord} className="order-1 sm:order-2 text-sm" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Registro'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 lg:p-4 border-b border-gray-200 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#519a7c]" />
                  <span className="truncate">Detalles del Registro Reproductivo</span>
                </h2>
                <Button variant="ghost" onClick={closeModals} className="flex-shrink-0 h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 lg:p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Información de la vaca */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Información de la Vaca</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium truncate ml-2">{editingRecord.cowName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium truncate ml-2">{editingRecord.cowId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Raza:</span>
                        <span className="font-medium truncate ml-2">{editingRecord.cowBreed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium">{editingRecord.cowAge} años</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Apareamiento</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium truncate ml-2">{editingRecord.matingType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{editingRecord.matingDate}</span>
                      </div>
                      {editingRecord.bullName && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Toro:</span>
                            <span className="font-medium truncate ml-2">{editingRecord.bullName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Raza del Toro:</span>
                            <span className="font-medium truncate ml-2">{editingRecord.bullBreed}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gestación y parto */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Gestación y Parto</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Días de Gestación:</span>
                        <span className="font-medium">{editingRecord.gestationDays} días</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha Esperada:</span>
                        <span className="font-medium">{editingRecord.expectedBirthDate}</span>
                      </div>
                      {editingRecord.actualBirthDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fecha Real:</span>
                          <span className="font-medium">{editingRecord.actualBirthDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Estado Embarazo:</span>
                        <Badge variant={getStatusColor(editingRecord.pregnancyStatus)} className="text-xs px-2 py-0.5">
                          {editingRecord.pregnancyStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Estado Parto:</span>
                        <Badge variant={getStatusColor(editingRecord.birthStatus)} className="text-xs px-2 py-0.5">
                          {editingRecord.birthStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {editingRecord.calfName && editingRecord.birthStatus === 'Nacido Vivo' && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Información de la Cría</h3>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium truncate ml-2">{editingRecord.calfName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sexo:</span>
                          <span className="font-medium">{editingRecord.calfGender}</span>
                        </div>
                        {editingRecord.calfWeight && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Peso al Nacer:</span>
                            <span className="font-medium">{editingRecord.calfWeight} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Salud:</span>
                          <span className="font-medium truncate ml-2">{editingRecord.calfHealth}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {(editingRecord.veterinarianNotes || editingRecord.complications) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {editingRecord.veterinarianNotes && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Notas Veterinarias</h3>
                      <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded-lg break-words">
                        {editingRecord.veterinarianNotes}
                      </p>
                    </div>
                  )}
                  {editingRecord.complications && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Complicaciones</h3>
                      <p className="text-gray-600 text-xs bg-red-50 p-2 rounded-lg break-words">
                        {editingRecord.complications}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Estado general */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Estado General</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Badge variant={getStatusColor(editingRecord.status)} className="text-xs px-2 py-1 w-fit">
                    {editingRecord.status}
                  </Badge>
                  {editingRecord.nextCycleExpected && (
                    <span className="text-xs text-gray-600">
                      Próximo ciclo: {editingRecord.nextCycleExpected}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-3 lg:p-4 border-t border-gray-200 flex justify-end">
              <Button onClick={closeModals} className="text-sm">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreedingProduction;