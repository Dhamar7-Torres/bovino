// src/pages/production/BreedingProduction.tsx
import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
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

// Componentes básicos con tipado correcto
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses: Record<string, string> = {
    default: 'bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c]',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100'
  };

  const sizeClasses: Record<string, string> = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#519a7c] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Select: React.FC<SelectProps> = ({ children, value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#519a7c] ${className}`}
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
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#519a7c] ${className}`}
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
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const BreedingProduction: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, name: string}>({
    lat: 16.7569,
    lng: -92.6348,
    name: 'Ubicación actual'
  });

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

  // Datos de ejemplo
  const mockData: BreedingRecord[] = [
    {
      id: '1',
      cowId: 'COW001',
      cowName: 'Esperanza',
      cowBreed: 'Holstein',
      cowAge: 4,
      bullId: 'BULL001',
      bullName: 'Campeón',
      bullBreed: 'Holstein',
      matingType: 'Natural',
      matingDate: '2024-10-15',
      expectedBirthDate: '2025-07-22',
      gestationDays: 280,
      pregnancyStatus: 'Confirmado',
      birthStatus: 'Pendiente',
      veterinarianNotes: 'Embarazo confirmado por ultrasonido.',
      status: 'Activo',
      location: { lat: 16.7569, lng: -92.6348, name: 'Potrero A-1' }
    },
    {
      id: '2',
      cowId: 'COW002',
      cowName: 'Maravilla',
      cowBreed: 'Angus',
      cowAge: 3,
      matingType: 'Inseminación Artificial',
      matingDate: '2024-08-10',
      expectedBirthDate: '2025-05-17',
      actualBirthDate: '2025-05-15',
      gestationDays: 278,
      pregnancyStatus: 'Confirmado',
      birthStatus: 'Nacido Vivo',
      calfId: 'CALF001',
      calfName: 'Pequeño',
      calfGender: 'Macho',
      calfWeight: 35,
      calfHealth: 'Excelente',
      veterinarianNotes: 'Parto sin complicaciones.',
      status: 'Completado',
      location: { lat: 16.7580, lng: -92.6360, name: 'Potrero B-2' }
    }
  ];

  // Cargar datos al inicio y obtener ubicación
  useEffect(() => {
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

    // Cargar datos simulados
    const timer = setTimeout(() => {
      setRecords(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
  };

  const saveRecord = (): void => {
    if (!form.cowId || !form.cowName || !form.matingDate) {
      alert('Por favor complete los campos obligatorios: ID de la vaca, nombre y fecha de apareamiento');
      return;
    }

    const recordData: BreedingRecord = {
      id: editingRecord ? editingRecord.id : Date.now().toString(),
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
      setRecords(records.map(record => 
        record.id === editingRecord.id ? recordData : record
      ));
      alert('Registro actualizado exitosamente');
    } else {
      setRecords([recordData, ...records]);
      alert('Registro creado exitosamente');
    }

    closeModals();
  };

  const deleteRecord = (id: string): void => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      setRecords(records.filter(record => record.id !== id));
      alert('Registro eliminado exitosamente');
    }
  };

  const viewRecord = (record: BreedingRecord): void => {
    setEditingRecord(record);
    setShowViewModal(true);
  };

  const closeModals = (): void => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingRecord(null);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2 flex items-center gap-3">
              <Heart className="h-10 w-10" />
              Reproducción y Cría
            </h1>
            <p className="text-white/90 text-lg">
              Gestión integral del programa reproductivo del ganado
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* Tabla de registros */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#519a7c]" />
              Registros de Reproducción ({records.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apareamiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gestación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Embarazo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-[#519a7c]/10 rounded-full mr-3">
                            <Heart className="h-4 w-4 text-[#519a7c]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.cowName}</div>
                            <div className="text-sm text-gray-500">{record.cowId} - {record.cowBreed} ({record.cowAge}a)</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {record.matingDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.matingType}
                          {record.bullName && ` - ${record.bullName}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.gestationDays} días
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.expectedBirthDate ? `Esperado: ${record.expectedBirthDate}` : 'Sin fecha'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(record.pregnancyStatus)}>
                          {record.pregnancyStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(record.birthStatus)}>
                          {record.birthStatus}
                        </Badge>
                        {record.calfName && record.birthStatus === 'Nacido Vivo' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {record.calfName} ({record.calfGender})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewRecord(record)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(record)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {records.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                <p className="text-gray-500">No se han creado registros de reproducción aún.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para crear/editar */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-[#519a7c]" />
                  {showCreateModal ? 'Nuevo Registro de Reproducción' : 'Editar Registro de Reproducción'}
                </h2>
                <Button variant="ghost" onClick={closeModals}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información de la vaca */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Vaca</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID de la Vaca *
                    </label>
                    <Input
                      placeholder="Ej: COW001"
                      value={form.cowId}
                      onChange={(e) => setForm({...form, cowId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Vaca *
                    </label>
                    <Input
                      placeholder="Ej: Esperanza"
                      value={form.cowName}
                      onChange={(e) => setForm({...form, cowName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raza
                    </label>
                    <Input
                      placeholder="Ej: Holstein, Angus, Charolais..."
                      value={form.cowBreed}
                      onChange={(e) => setForm({...form, cowBreed: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edad (años)
                    </label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={form.cowAge}
                      onChange={(e) => setForm({...form, cowAge: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Información del toro */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Toro/Semental</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Apareamiento
                    </label>
                    <Select
                      value={form.matingType}
                      onChange={(value) => setForm({...form, matingType: value as FormData['matingType']})}
                    >
                      <option value="Natural">Natural</option>
                      <option value="Inseminación Artificial">Inseminación Artificial</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID del Toro
                    </label>
                    <Input
                      placeholder="Ej: BULL001"
                      value={form.bullId}
                      onChange={(e) => setForm({...form, bullId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Toro
                    </label>
                    <Input
                      placeholder="Ej: Campeón"
                      value={form.bullName}
                      onChange={(e) => setForm({...form, bullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raza del Toro
                    </label>
                    <Input
                      placeholder="Ej: Holstein, Angus, Charolais..."
                      value={form.bullBreed}
                      onChange={(e) => setForm({...form, bullBreed: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Fechas y gestación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Gestación</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Apareamiento *
                    </label>
                    <Input
                      type="date"
                      value={form.matingDate}
                      onChange={(e) => setForm({...form, matingDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Esperada de Parto
                    </label>
                    <Input
                      type="date"
                      value={form.expectedBirthDate}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Real de Parto
                    </label>
                    <Input
                      type="date"
                      value={form.actualBirthDate}
                      onChange={(e) => setForm({...form, actualBirthDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Gestación
                    </label>
                    <Input
                      type="number"
                      value={form.gestationDays}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Estados reproductivos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados Reproductivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Embarazo
                    </label>
                    <Select
                      value={form.pregnancyStatus}
                      onChange={(value) => setForm({...form, pregnancyStatus: value as FormData['pregnancyStatus']})}
                    >
                      <option value="No Confirmado">No Confirmado</option>
                      <option value="Probable">Probable</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Fallido">Fallido</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Nacimiento
                    </label>
                    <Select
                      value={form.birthStatus}
                      onChange={(value) => setForm({...form, birthStatus: value as FormData['birthStatus']})}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Nacido Vivo">Nacido Vivo</option>
                      <option value="Nacido Muerto">Nacido Muerto</option>
                      <option value="Aborto">Aborto</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado General
                    </label>
                    <Select
                      value={form.status}
                      onChange={(value) => setForm({...form, status: value as FormData['status']})}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID de la Cría
                      </label>
                      <Input
                        placeholder="Ej: CALF001"
                        value={form.calfId}
                        onChange={(e) => setForm({...form, calfId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Cría
                      </label>
                      <Input
                        placeholder="Ej: Pequeño"
                        value={form.calfName}
                        onChange={(e) => setForm({...form, calfName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo
                      </label>
                      <Select
                        value={form.calfGender}
                        onChange={(value) => setForm({...form, calfGender: value as FormData['calfGender']})}
                      >
                        <option value="Hembra">Hembra</option>
                        <option value="Macho">Macho</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso al Nacer (kg)
                      </label>
                      <Input
                        type="number"
                        placeholder="35"
                        value={form.calfWeight}
                        onChange={(e) => setForm({...form, calfWeight: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Salud de la Cría
                    </label>
                    <Select
                      value={form.calfHealth}
                      onChange={(value) => setForm({...form, calfHealth: value as FormData['calfHealth']})}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#519a7c]" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{currentLocation.name}</span>
                    <div className="text-xs text-gray-500">
                      Ubicación obtenida automáticamente
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas veterinarias */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Veterinarias
                    </label>
                    <Textarea
                      placeholder="Observaciones del veterinario..."
                      value={form.veterinarianNotes}
                      onChange={(e) => setForm({...form, veterinarianNotes: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complicaciones
                    </label>
                    <Textarea
                      placeholder="Describir cualquier complicación..."
                      value={form.complications}
                      onChange={(e) => setForm({...form, complications: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Próximo ciclo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Planificación</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximo Ciclo Esperado
                  </label>
                  <Input
                    type="date"
                    value={form.nextCycleExpected}
                    onChange={(e) => setForm({...form, nextCycleExpected: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModals}>
                Cancelar
              </Button>
              <Button onClick={saveRecord}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Registro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-[#519a7c]" />
                  Detalles del Registro Reproductivo
                </h2>
                <Button variant="ghost" onClick={closeModals}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de la vaca */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Vaca</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{editingRecord.cowName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium">{editingRecord.cowId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Raza:</span>
                        <span className="font-medium">{editingRecord.cowBreed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium">{editingRecord.cowAge} años</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Apareamiento</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{editingRecord.matingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{editingRecord.matingDate}</span>
                      </div>
                      {editingRecord.bullName && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Toro:</span>
                            <span className="font-medium">{editingRecord.bullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Raza del Toro:</span>
                            <span className="font-medium">{editingRecord.bullBreed}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gestación y parto */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Gestación y Parto</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Días de Gestación:</span>
                        <span className="font-medium">{editingRecord.gestationDays} días</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha Esperada:</span>
                        <span className="font-medium">{editingRecord.expectedBirthDate}</span>
                      </div>
                      {editingRecord.actualBirthDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha Real:</span>
                          <span className="font-medium">{editingRecord.actualBirthDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado Embarazo:</span>
                        <Badge variant={getStatusColor(editingRecord.pregnancyStatus)}>
                          {editingRecord.pregnancyStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado Parto:</span>
                        <Badge variant={getStatusColor(editingRecord.birthStatus)}>
                          {editingRecord.birthStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {editingRecord.calfName && editingRecord.birthStatus === 'Nacido Vivo' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Cría</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium">{editingRecord.calfName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sexo:</span>
                          <span className="font-medium">{editingRecord.calfGender}</span>
                        </div>
                        {editingRecord.calfWeight && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso al Nacer:</span>
                            <span className="font-medium">{editingRecord.calfWeight} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salud:</span>
                          <span className="font-medium">{editingRecord.calfHealth}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {(editingRecord.veterinarianNotes || editingRecord.complications) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingRecord.veterinarianNotes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Veterinarias</h3>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {editingRecord.veterinarianNotes}
                      </p>
                    </div>
                  )}
                  {editingRecord.complications && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Complicaciones</h3>
                      <p className="text-gray-600 text-sm bg-red-50 p-3 rounded-lg">
                        {editingRecord.complications}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Estado general */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado General</h3>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusColor(editingRecord.status)} className="text-sm px-3 py-1">
                    {editingRecord.status}
                  </Badge>
                  {editingRecord.nextCycleExpected && (
                    <span className="text-sm text-gray-600">
                      Próximo ciclo: {editingRecord.nextCycleExpected}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={closeModals}>
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