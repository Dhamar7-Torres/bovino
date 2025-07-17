// src/pages/production/BreedingProduction.tsx
import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  BarChart3,
  X,
  Save,
  Download,
  Upload,
  RefreshCw,
  Target,
  Baby,
} from 'lucide-react';

// Componentes de shadcn/ui simulados
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
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

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c]',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100'
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  className = '',
  ...props
}) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.readOnly ? 'bg-gray-50' : ''} ${className}`}
  />
);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ children, value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

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
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos de reproducción
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
  gestationDays?: number;
  pregnancyStatus: 'Confirmado' | 'Probable' | 'No Confirmado' | 'Fallido';
  birthStatus: 'Pendiente' | 'Nacido Vivo' | 'Nacido Muerto' | 'Aborto';
  calfInfo?: {
    id?: string;
    name?: string;
    gender: 'Macho' | 'Hembra';
    weight?: number;
    health: 'Excelente' | 'Buena' | 'Regular' | 'Crítica';
  };
  veterinarianNotes?: string;
  complications?: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  nextCycleExpected?: string;
  status: 'Activo' | 'Completado' | 'Fallido' | 'Cancelado';
}

interface BreedingStats {
  totalActivePregnancies: number;
  expectedBirthsThisMonth: number;
  successRate: number;
  totalCalvesBorn: number;
  averageGestationDays: number;
  reproductiveCows: number;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  cowBreed: string;
  matingType: string;
  pregnancyStatus: string;
  birthStatus: string;
  status: string;
}

const BreedingProduction: React.FC = () => {
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BreedingRecord[]>([]);
  const [breedingStats, setBreedingStats] = useState<BreedingStats>({
    totalActivePregnancies: 0,
    expectedBirthsThisMonth: 0,
    successRate: 0,
    totalCalvesBorn: 0,
    averageGestationDays: 0,
    reproductiveCows: 0
  });

  // Estados para CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Estados para filtros
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    cowBreed: '',
    matingType: '',
    pregnancyStatus: '',
    birthStatus: '',
    status: ''
  });

  // Estado para formulario
  const [formData, setFormData] = useState<Partial<BreedingRecord>>({
    cowId: '',
    cowName: '',
    cowBreed: '',
    cowAge: 0,
    bullId: '',
    bullName: '',
    bullBreed: '',
    matingType: 'Natural',
    matingDate: new Date().toISOString().split('T')[0],
    expectedBirthDate: '',
    actualBirthDate: '',
    gestationDays: 0,
    pregnancyStatus: 'No Confirmado',
    birthStatus: 'Pendiente',
    calfInfo: {
      id: '',
      name: '',
      gender: 'Hembra',
      weight: 0,
      health: 'Buena'
    },
    veterinarianNotes: '',
    complications: '',
    location: {
      lat: 16.7569,
      lng: -92.6348,
      name: 'Potrero de Reproducción'
    },
    nextCycleExpected: '',
    status: 'Activo'
  });

  // Datos simulados para registros de reproducción
  const mockBreedingRecords: BreedingRecord[] = [
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
      veterinarianNotes: 'Embarazo confirmado por ultrasonido. Desarrollo normal.',
      location: { lat: 16.7569, lng: -92.6348, name: 'Potrero A-1' },
      nextCycleExpected: '2025-10-22',
      status: 'Activo'
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
      calfInfo: {
        id: 'CALF001',
        name: 'Pequeño',
        gender: 'Macho',
        weight: 35,
        health: 'Excelente'
      },
      veterinarianNotes: 'Parto sin complicaciones. Cría saludable.',
      location: { lat: 16.7580, lng: -92.6360, name: 'Potrero B-2' },
      nextCycleExpected: '2025-08-15',
      status: 'Completado'
    },
    {
      id: '3',
      cowId: 'COW003',
      cowName: 'Bonita',
      cowBreed: 'Charolais',
      cowAge: 5,
      bullId: 'BULL002',
      bullName: 'Valiente',
      bullBreed: 'Charolais',
      matingType: 'Natural',
      matingDate: '2025-01-20',
      expectedBirthDate: '2025-10-27',
      gestationDays: 125,
      pregnancyStatus: 'Probable',
      birthStatus: 'Pendiente',
      veterinarianNotes: 'Pendiente confirmación por ultrasonido.',
      location: { lat: 16.7550, lng: -92.6340, name: 'Potrero C-3' },
      status: 'Activo'
    },
    {
      id: '4',
      cowId: 'COW004',
      cowName: 'Dulce',
      cowBreed: 'Holstein',
      cowAge: 6,
      matingType: 'Inseminación Artificial',
      matingDate: '2024-12-05',
      expectedBirthDate: '2025-09-11',
      gestationDays: 158,
      pregnancyStatus: 'Confirmado',
      birthStatus: 'Pendiente',
      veterinarianNotes: 'Progreso normal. Próxima revisión en 2 semanas.',
      location: { lat: 16.7590, lng: -92.6370, name: 'Potrero D-1' },
      status: 'Activo'
    }
  ];

  // Estadísticas simuladas
  const mockBreedingStats: BreedingStats = {
    totalActivePregnancies: 3,
    expectedBirthsThisMonth: 1,
    successRate: 87.5,
    totalCalvesBorn: 8,
    averageGestationDays: 279,
    reproductiveCows: 45
  };

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setBreedingRecords(mockBreedingRecords);
      setFilteredRecords(mockBreedingRecords);
      setBreedingStats(mockBreedingStats);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para filtrar registros
  useEffect(() => {
    let filtered = breedingRecords.filter(record => {
      const matchesSearch = record.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.cowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.cowBreed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (record.bullName && record.bullName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDateFrom = !filters.dateFrom || record.matingDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || record.matingDate <= filters.dateTo;
      const matchesCowBreed = !filters.cowBreed || record.cowBreed === filters.cowBreed;
      const matchesMatingType = !filters.matingType || record.matingType === filters.matingType;
      const matchesPregnancyStatus = !filters.pregnancyStatus || record.pregnancyStatus === filters.pregnancyStatus;
      const matchesBirthStatus = !filters.birthStatus || record.birthStatus === filters.birthStatus;
      const matchesStatus = !filters.status || record.status === filters.status;

      return matchesSearch && matchesDateFrom && matchesDateTo && 
             matchesCowBreed && matchesMatingType && matchesPregnancyStatus && 
             matchesBirthStatus && matchesStatus;
    });

    setFilteredRecords(filtered);
  }, [breedingRecords, searchTerm, filters]);

  // Efecto para calcular fecha esperada de parto cuando cambia fecha de apareamiento
  useEffect(() => {
    if (formData.matingDate) {
      const matingDate = new Date(formData.matingDate);
      const expectedDate = new Date(matingDate.getTime() + (280 * 24 * 60 * 60 * 1000)); // 280 días después
      setFormData(prev => ({ 
        ...prev, 
        expectedBirthDate: expectedDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.matingDate]);

  // Efecto para calcular días de gestación
  useEffect(() => {
    if (formData.matingDate && formData.actualBirthDate) {
      const matingDate = new Date(formData.matingDate);
      const birthDate = new Date(formData.actualBirthDate);
      const diffTime = Math.abs(birthDate.getTime() - matingDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData(prev => ({ ...prev, gestationDays: diffDays }));
    } else if (formData.matingDate && !formData.actualBirthDate) {
      const matingDate = new Date(formData.matingDate);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - matingDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData(prev => ({ ...prev, gestationDays: diffDays }));
    }
  }, [formData.matingDate, formData.actualBirthDate]);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Funciones CRUD
  const handleCreate = (): void => {
    if (!formData.cowId || !formData.matingDate) return;
    
    const newRecord: BreedingRecord = {
      id: Date.now().toString(),
      cowId: formData.cowId!,
      cowName: formData.cowName!,
      cowBreed: formData.cowBreed!,
      cowAge: formData.cowAge!,
      bullId: formData.bullId,
      bullName: formData.bullName,
      bullBreed: formData.bullBreed,
      matingType: formData.matingType as BreedingRecord['matingType'],
      matingDate: formData.matingDate!,
      expectedBirthDate: formData.expectedBirthDate!,
      actualBirthDate: formData.actualBirthDate,
      gestationDays: formData.gestationDays,
      pregnancyStatus: formData.pregnancyStatus as BreedingRecord['pregnancyStatus'],
      birthStatus: formData.birthStatus as BreedingRecord['birthStatus'],
      calfInfo: formData.calfInfo,
      veterinarianNotes: formData.veterinarianNotes,
      complications: formData.complications,
      location: formData.location!,
      nextCycleExpected: formData.nextCycleExpected,
      status: formData.status as BreedingRecord['status']
    };

    setBreedingRecords([newRecord, ...breedingRecords]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (): void => {
    if (!selectedRecord || !formData.cowId || !formData.matingDate) return;

    const updatedRecord: BreedingRecord = {
      ...selectedRecord,
      cowId: formData.cowId!,
      cowName: formData.cowName!,
      cowBreed: formData.cowBreed!,
      cowAge: formData.cowAge!,
      bullId: formData.bullId,
      bullName: formData.bullName,
      bullBreed: formData.bullBreed,
      matingType: formData.matingType as BreedingRecord['matingType'],
      matingDate: formData.matingDate!,
      expectedBirthDate: formData.expectedBirthDate!,
      actualBirthDate: formData.actualBirthDate,
      gestationDays: formData.gestationDays,
      pregnancyStatus: formData.pregnancyStatus as BreedingRecord['pregnancyStatus'],
      birthStatus: formData.birthStatus as BreedingRecord['birthStatus'],
      calfInfo: formData.calfInfo,
      veterinarianNotes: formData.veterinarianNotes,
      complications: formData.complications,
      location: formData.location!,
      nextCycleExpected: formData.nextCycleExpected,
      status: formData.status as BreedingRecord['status']
    };

    setBreedingRecords(breedingRecords.map(record => 
      record.id === selectedRecord.id ? updatedRecord : record
    ));
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    resetForm();
  };

  const handleDelete = (id: string): void => {
    setBreedingRecords(breedingRecords.filter(record => record.id !== id));
  };

  const handleView = (record: BreedingRecord): void => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (record: BreedingRecord): void => {
    setSelectedRecord(record);
    setFormData({
      cowId: record.cowId,
      cowName: record.cowName,
      cowBreed: record.cowBreed,
      cowAge: record.cowAge,
      bullId: record.bullId,
      bullName: record.bullName,
      bullBreed: record.bullBreed,
      matingType: record.matingType,
      matingDate: record.matingDate,
      expectedBirthDate: record.expectedBirthDate,
      actualBirthDate: record.actualBirthDate,
      gestationDays: record.gestationDays,
      pregnancyStatus: record.pregnancyStatus,
      birthStatus: record.birthStatus,
      calfInfo: record.calfInfo,
      veterinarianNotes: record.veterinarianNotes,
      complications: record.complications,
      location: record.location,
      nextCycleExpected: record.nextCycleExpected,
      status: record.status
    });
    setIsEditModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData({
      cowId: '',
      cowName: '',
      cowBreed: '',
      cowAge: 0,
      bullId: '',
      bullName: '',
      bullBreed: '',
      matingType: 'Natural',
      matingDate: new Date().toISOString().split('T')[0],
      expectedBirthDate: '',
      actualBirthDate: '',
      gestationDays: 0,
      pregnancyStatus: 'No Confirmado',
      birthStatus: 'Pendiente',
      calfInfo: {
        id: '',
        name: '',
        gender: 'Hembra',
        weight: 0,
        health: 'Buena'
      },
      veterinarianNotes: '',
      complications: '',
      location: {
        lat: 16.7569,
        lng: -92.6348,
        name: 'Potrero de Reproducción'
      },
      nextCycleExpected: '',
      status: 'Activo'
    });
  };

  const resetFilters = (): void => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      cowBreed: '',
      matingType: '',
      pregnancyStatus: '',
      birthStatus: '',
      status: ''
    });
    setSearchTerm('');
  };

  // Función para formatear números
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-MX', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 1 
    }).format(value);
  };

  // Función para obtener color por estado de embarazo
  const getPregnancyStatusColor = (status: string): string => {
    switch (status) {
      case 'Confirmado': return 'success';
      case 'Probable': return 'warning';
      case 'No Confirmado': return 'info';
      case 'Fallido': return 'error';
      default: return 'default';
    }
  };

  // Función para obtener color por estado de nacimiento
  const getBirthStatusColor = (status: string): string => {
    switch (status) {
      case 'Nacido Vivo': return 'success';
      case 'Pendiente': return 'warning';
      case 'Nacido Muerto': return 'error';
      case 'Aborto': return 'error';
      default: return 'default';
    }
  };

  // Función para obtener color por estado general
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Activo': return 'info';
      case 'Completado': return 'success';
      case 'Fallido': return 'error';
      case 'Cancelado': return 'default';
      default: return 'default';
    }
  };

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
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
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
        </div>
        <motion.p
          className="text-white text-lg font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Cargando Reproducción...
        </motion.p>
      </motion.div>
    </div>
  );

  // Componente de Modal para formularios
  const FormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => void;
  }> = ({ isOpen, onClose, title, onSubmit }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-[#519a7c]" />
                  {title}
                </h2>
                <Button variant="ghost" onClick={onClose}>
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
                      value={formData.cowId}
                      onChange={(e) => setFormData({...formData, cowId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Vaca *
                    </label>
                    <Input
                      placeholder="Ej: Esperanza"
                      value={formData.cowName}
                      onChange={(e) => setFormData({...formData, cowName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raza
                    </label>
                    <Select
                      value={formData.cowBreed}
                      onChange={(value) => setFormData({...formData, cowBreed: value})}
                    >
                      <option value="">Seleccionar raza</option>
                      <option value="Holstein">Holstein</option>
                      <option value="Angus">Angus</option>
                      <option value="Charolais">Charolais</option>
                      <option value="Hereford">Hereford</option>
                      <option value="Simmental">Simmental</option>
                      <option value="Brahman">Brahman</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edad (años)
                    </label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={formData.cowAge?.toString() || ''}
                      onChange={(e) => setFormData({...formData, cowAge: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Información del toro/semental */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Toro/Semental</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Apareamiento
                    </label>
                    <Select
                      value={formData.matingType}
                      onChange={(value) => setFormData({...formData, matingType: value as any})}
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
                      value={formData.bullId}
                      onChange={(e) => setFormData({...formData, bullId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Toro
                    </label>
                    <Input
                      placeholder="Ej: Campeón"
                      value={formData.bullName}
                      onChange={(e) => setFormData({...formData, bullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raza del Toro
                    </label>
                    <Select
                      value={formData.bullBreed}
                      onChange={(value) => setFormData({...formData, bullBreed: value})}
                    >
                      <option value="">Seleccionar raza</option>
                      <option value="Holstein">Holstein</option>
                      <option value="Angus">Angus</option>
                      <option value="Charolais">Charolais</option>
                      <option value="Hereford">Hereford</option>
                      <option value="Simmental">Simmental</option>
                      <option value="Brahman">Brahman</option>
                    </Select>
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
                      value={formData.matingDate}
                      onChange={(e) => setFormData({...formData, matingDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Esperada de Parto
                    </label>
                    <Input
                      type="date"
                      value={formData.expectedBirthDate}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Real de Parto
                    </label>
                    <Input
                      type="date"
                      value={formData.actualBirthDate}
                      onChange={(e) => setFormData({...formData, actualBirthDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Gestación
                    </label>
                    <Input
                      type="number"
                      value={formData.gestationDays?.toString() || ''}
                      readOnly
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
                      value={formData.pregnancyStatus}
                      onChange={(value) => setFormData({...formData, pregnancyStatus: value as any})}
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
                      value={formData.birthStatus}
                      onChange={(value) => setFormData({...formData, birthStatus: value as any})}
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
                      value={formData.status}
                      onChange={(value) => setFormData({...formData, status: value as any})}
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
              {(formData.birthStatus === 'Nacido Vivo' || formData.birthStatus === 'Nacido Muerto') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cría</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID de la Cría
                      </label>
                      <Input
                        placeholder="Ej: CALF001"
                        value={formData.calfInfo?.id}
                        onChange={(e) => setFormData({
                          ...formData, 
                          calfInfo: {...formData.calfInfo!, id: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Cría
                      </label>
                      <Input
                        placeholder="Ej: Pequeño"
                        value={formData.calfInfo?.name}
                        onChange={(e) => setFormData({
                          ...formData, 
                          calfInfo: {...formData.calfInfo!, name: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo
                      </label>
                      <Select
                        value={formData.calfInfo?.gender}
                        onChange={(value) => setFormData({
                          ...formData, 
                          calfInfo: {...formData.calfInfo!, gender: value as any}
                        })}
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
                        value={formData.calfInfo?.weight?.toString() || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          calfInfo: {...formData.calfInfo!, weight: parseFloat(e.target.value) || 0}
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Salud de la Cría
                    </label>
                    <Select
                      value={formData.calfInfo?.health}
                      onChange={(value) => setFormData({
                        ...formData, 
                        calfInfo: {...formData.calfInfo!, health: value as any}
                      })}
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
                  <span className="text-sm">{formData.location?.name}</span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Seleccionar en Mapa
                  </Button>
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
                      value={formData.veterinarianNotes}
                      onChange={(e) => setFormData({...formData, veterinarianNotes: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complicaciones
                    </label>
                    <Textarea
                      placeholder="Describir cualquier complicación..."
                      value={formData.complications}
                      onChange={(e) => setFormData({...formData, complications: e.target.value})}
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
                    value={formData.nextCycleExpected}
                    onChange={(e) => setFormData({...formData, nextCycleExpected: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Registro
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header con título y controles principales */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
            <Button 
              variant="secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Embarazos Activos</p>
                    <p className="text-3xl font-bold text-gray-900">{breedingStats.totalActivePregnancies}</p>
                    <p className="text-sm text-gray-500">confirmados</p>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Partos Esperados</p>
                    <p className="text-3xl font-bold text-gray-900">{breedingStats.expectedBirthsThisMonth}</p>
                    <p className="text-sm text-gray-500">este mes</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Éxito</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(breedingStats.successRate)}%</p>
                    <p className="text-sm text-gray-500">reproducción</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Crías Nacidas</p>
                    <p className="text-3xl font-bold text-gray-900">{breedingStats.totalCalvesBorn}</p>
                    <p className="text-sm text-gray-500">este año</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Baby className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Desde
                      </label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Hasta
                      </label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raza
                      </label>
                      <Select
                        value={filters.cowBreed}
                        onChange={(value) => setFilters({...filters, cowBreed: value})}
                      >
                        <option value="">Todas</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Angus">Angus</option>
                        <option value="Charolais">Charolais</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo Apareamiento
                      </label>
                      <Select
                        value={filters.matingType}
                        onChange={(value) => setFilters({...filters, matingType: value})}
                      >
                        <option value="">Todos</option>
                        <option value="Natural">Natural</option>
                        <option value="Inseminación Artificial">Inseminación Artificial</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Embarazo
                      </label>
                      <Select
                        value={filters.pregnancyStatus}
                        onChange={(value) => setFilters({...filters, pregnancyStatus: value})}
                      >
                        <option value="">Todos</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Probable">Probable</option>
                        <option value="No Confirmado">No Confirmado</option>
                        <option value="Fallido">Fallido</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <Select
                        value={filters.status}
                        onChange={(value) => setFilters({...filters, status: value})}
                      >
                        <option value="">Todos</option>
                        <option value="Activo">Activo</option>
                        <option value="Completado">Completado</option>
                        <option value="Fallido">Fallido</option>
                        <option value="Cancelado">Cancelado</option>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="w-full flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de búsqueda y acciones */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por vaca, toro o raza..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabla de registros */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Registros de Reproducción ({filteredRecords.length})
                </span>
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
                    {filteredRecords.map((record, index) => (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
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
                          <Badge variant={getPregnancyStatusColor(record.pregnancyStatus) as any}>
                            {record.pregnancyStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getBirthStatusColor(record.birthStatus) as any}>
                            {record.birthStatus}
                          </Badge>
                          {record.calfInfo && record.birthStatus === 'Nacido Vivo' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {record.calfInfo.name} ({record.calfInfo.gender})
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(record.status) as any}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(record)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(record)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                  <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal para crear registro */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Registro de Reproducción"
          onSubmit={handleCreate}
        />

        {/* Modal para editar registro */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Registro de Reproducción"
          onSubmit={handleEdit}
        />

        {/* Modal para ver detalles */}
        <AnimatePresence>
          {isViewModalOpen && selectedRecord && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="h-6 w-6 text-[#519a7c]" />
                      Detalles del Registro Reproductivo
                    </h2>
                    <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
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
                            <span className="font-medium">{selectedRecord.cowName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ID:</span>
                            <span className="font-medium">{selectedRecord.cowId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Raza:</span>
                            <span className="font-medium">{selectedRecord.cowBreed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Edad:</span>
                            <span className="font-medium">{selectedRecord.cowAge} años</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Apareamiento</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo:</span>
                            <span className="font-medium">{selectedRecord.matingType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">{selectedRecord.matingDate}</span>
                          </div>
                          {selectedRecord.bullName && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Toro:</span>
                                <span className="font-medium">{selectedRecord.bullName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Raza del Toro:</span>
                                <span className="font-medium">{selectedRecord.bullBreed}</span>
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
                            <span className="font-medium">{selectedRecord.gestationDays} días</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha Esperada:</span>
                            <span className="font-medium">{selectedRecord.expectedBirthDate}</span>
                          </div>
                          {selectedRecord.actualBirthDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fecha Real:</span>
                              <span className="font-medium">{selectedRecord.actualBirthDate}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado Embarazo:</span>
                            <Badge variant={getPregnancyStatusColor(selectedRecord.pregnancyStatus) as any}>
                              {selectedRecord.pregnancyStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado Parto:</span>
                            <Badge variant={getBirthStatusColor(selectedRecord.birthStatus) as any}>
                              {selectedRecord.birthStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {selectedRecord.calfInfo && selectedRecord.birthStatus === 'Nacido Vivo' && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Cría</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre:</span>
                              <span className="font-medium">{selectedRecord.calfInfo.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sexo:</span>
                              <span className="font-medium">{selectedRecord.calfInfo.gender}</span>
                            </div>
                            {selectedRecord.calfInfo.weight && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Peso al Nacer:</span>
                                <span className="font-medium">{selectedRecord.calfInfo.weight} kg</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Salud:</span>
                              <span className="font-medium">{selectedRecord.calfInfo.health}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-[#519a7c]" />
                      <span className="text-sm">{selectedRecord.location.name}</span>
                    </div>
                  </div>

                  {/* Notas */}
                  {(selectedRecord.veterinarianNotes || selectedRecord.complications) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.veterinarianNotes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Veterinarias</h3>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                            {selectedRecord.veterinarianNotes}
                          </p>
                        </div>
                      )}
                      {selectedRecord.complications && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Complicaciones</h3>
                          <p className="text-gray-600 text-sm bg-red-50 p-3 rounded-lg">
                            {selectedRecord.complications}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estado general */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado General</h3>
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusColor(selectedRecord.status) as any} className="text-sm px-3 py-1">
                        {selectedRecord.status}
                      </Badge>
                      {selectedRecord.nextCycleExpected && (
                        <span className="text-sm text-gray-600">
                          Próximo ciclo: {selectedRecord.nextCycleExpected}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BreedingProduction;