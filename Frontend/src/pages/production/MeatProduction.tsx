// src/pages/production/MeatProduction.tsx
import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Beef,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  X,
  Save,
  Download,
  Upload,
  RefreshCw,
  Target,
  Scale,
  ShoppingCart
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

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  step?: string;
  min?: string;
  max?: string;
  readOnly?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  step,
  min,
  max,
  readOnly = false
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    step={step}
    min={min}
    max={max}
    readOnly={readOnly}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${readOnly ? 'bg-gray-50' : ''} ${className}`}
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

// Interfaces para tipado de datos de producción cárnica
interface MeatRecord {
  id: string;
  animalId: string;
  animalName: string;
  breed: string;
  birthDate: string;
  slaughterDate: string;
  liveWeight: number; // kg peso vivo
  carcassWeight: number; // kg peso en canal
  yieldPercentage: number; // porcentaje de rendimiento
  grade: 'AAA' | 'AA' | 'A' | 'B' | 'C'; // clasificación de calidad
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
  totalValue: number; // valor total estimado
}

interface MeatStats {
  totalProcessedMonth: number;
  totalWeightMonth: number;
  averageYieldPercent: number;
  totalValueMonth: number;
  animalsScheduled: number;
  topGrade: string;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  breed: string;
  grade: string;
  destination: string;
  status: string;
}

const MeatProduction: React.FC = () => {
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [meatRecords, setMeatRecords] = useState<MeatRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MeatRecord[]>([]);
  const [meatStats, setMeatStats] = useState<MeatStats>({
    totalProcessedMonth: 0,
    totalWeightMonth: 0,
    averageYieldPercent: 0,
    totalValueMonth: 0,
    animalsScheduled: 0,
    topGrade: ''
  });

  // Estados para CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MeatRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
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
  const [formData, setFormData] = useState<Partial<MeatRecord>>({
    animalId: '',
    animalName: '',
    breed: '',
    birthDate: '',
    slaughterDate: new Date().toISOString().split('T')[0],
    liveWeight: 0,
    carcassWeight: 0,
    yieldPercentage: 0,
    grade: 'A',
    cuts: [
      { name: 'Lomo', weight: 0, pricePerKg: 0 },
      { name: 'Costilla', weight: 0, pricePerKg: 0 },
      { name: 'Pierna', weight: 0, pricePerKg: 0 }
    ],
    location: {
      lat: 16.7569,
      lng: -92.6348,
      name: 'Matadero Principal'
    },
    processor: '',
    destination: 'Venta Directa',
    notes: '',
    status: 'Programado',
    totalValue: 0
  });

  // Datos simulados para registros de producción cárnica
  const mockMeatRecords: MeatRecord[] = [
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
        { name: 'Costilla', weight: 78, pricePerKg: 120 },
        { name: 'Pierna', weight: 85, pricePerKg: 95 },
        { name: 'Paleta', weight: 65, pricePerKg: 85 },
        { name: 'Otros', weight: 75, pricePerKg: 60 }
      ],
      location: { lat: 16.7569, lng: -92.6348, name: 'Matadero TIF 001' },
      processor: 'Frigorífico Los Altos',
      destination: 'Exportación',
      notes: 'Animal de excelente calidad, destinado a exportación premium',
      status: 'Procesado',
      totalValue: 38250
    },
    {
      id: '2',
      animalId: 'COW025',
      animalName: 'Luna',
      breed: 'Holstein',
      birthDate: '2019-08-22',
      slaughterDate: '2025-07-12',
      liveWeight: 520,
      carcassWeight: 312,
      yieldPercentage: 60,
      grade: 'AA',
      cuts: [
        { name: 'Lomo', weight: 38, pricePerKg: 160 },
        { name: 'Costilla', weight: 68, pricePerKg: 110 },
        { name: 'Pierna', weight: 75, pricePerKg: 90 },
        { name: 'Paleta', weight: 58, pricePerKg: 80 },
        { name: 'Otros', weight: 73, pricePerKg: 55 }
      ],
      location: { lat: 16.7580, lng: -92.6360, name: 'Rastro Municipal' },
      processor: 'Carnes del Valle',
      destination: 'Venta Directa',
      notes: 'Vaca lechera al final de su período productivo',
      status: 'Vendido',
      totalValue: 29140
    },
    {
      id: '3',
      animalId: 'BULL012',
      animalName: 'Fuego',
      breed: 'Charolais',
      birthDate: '2022-01-10',
      slaughterDate: '2025-07-20',
      liveWeight: 620,
      carcassWeight: 372,
      yieldPercentage: 60,
      grade: 'AAA',
      cuts: [],
      location: { lat: 16.7550, lng: -92.6340, name: 'Matadero TIF 001' },
      processor: 'Frigorífico Los Altos',
      destination: 'Frigorífico',
      notes: 'Programado para procesamiento de alta calidad',
      status: 'Programado',
      totalValue: 45000
    }
  ];

  // Estadísticas simuladas
  const mockMeatStats: MeatStats = {
    totalProcessedMonth: 12,
    totalWeightMonth: 4200,
    averageYieldPercent: 60.2,
    totalValueMonth: 485000,
    animalsScheduled: 8,
    topGrade: 'AAA'
  };

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMeatRecords(mockMeatRecords);
      setFilteredRecords(mockMeatRecords);
      setMeatStats(mockMeatStats);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para filtrar registros
  useEffect(() => {
    let filtered = meatRecords.filter(record => {
      const matchesSearch = record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.breed.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDateFrom = !filters.dateFrom || record.slaughterDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || record.slaughterDate <= filters.dateTo;
      const matchesBreed = !filters.breed || record.breed === filters.breed;
      const matchesGrade = !filters.grade || record.grade === filters.grade;
      const matchesDestination = !filters.destination || record.destination === filters.destination;
      const matchesStatus = !filters.status || record.status === filters.status;

      return matchesSearch && matchesDateFrom && matchesDateTo && 
             matchesBreed && matchesGrade && matchesDestination && matchesStatus;
    });

    setFilteredRecords(filtered);
  }, [meatRecords, searchTerm, filters]);

  // Efecto para calcular rendimiento cuando cambian pesos
  useEffect(() => {
    if (formData.liveWeight && formData.carcassWeight) {
      const yieldPercent = (formData.carcassWeight / formData.liveWeight) * 100;
      setFormData(prev => ({ ...prev, yieldPercentage: Math.round(yieldPercent * 10) / 10 }));
    }
  }, [formData.liveWeight, formData.carcassWeight]);

  // Efecto para calcular valor total cuando cambian los cortes
  useEffect(() => {
    if (formData.cuts) {
      const totalValue = formData.cuts.reduce((sum, cut) => sum + (cut.weight * cut.pricePerKg), 0);
      setFormData(prev => ({ ...prev, totalValue: Math.round(totalValue * 100) / 100 }));
    }
  }, [formData.cuts]);

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
    if (!formData.animalId || !formData.liveWeight) return;
    
    const newRecord: MeatRecord = {
      id: Date.now().toString(),
      animalId: formData.animalId!,
      animalName: formData.animalName!,
      breed: formData.breed!,
      birthDate: formData.birthDate!,
      slaughterDate: formData.slaughterDate!,
      liveWeight: formData.liveWeight!,
      carcassWeight: formData.carcassWeight!,
      yieldPercentage: formData.yieldPercentage!,
      grade: formData.grade as MeatRecord['grade'],
      cuts: formData.cuts!,
      location: formData.location!,
      processor: formData.processor!,
      destination: formData.destination as MeatRecord['destination'],
      notes: formData.notes,
      status: formData.status as MeatRecord['status'],
      totalValue: formData.totalValue!
    };

    setMeatRecords([newRecord, ...meatRecords]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (): void => {
    if (!selectedRecord || !formData.animalId || !formData.liveWeight) return;

    const updatedRecord: MeatRecord = {
      ...selectedRecord,
      animalId: formData.animalId!,
      animalName: formData.animalName!,
      breed: formData.breed!,
      birthDate: formData.birthDate!,
      slaughterDate: formData.slaughterDate!,
      liveWeight: formData.liveWeight!,
      carcassWeight: formData.carcassWeight!,
      yieldPercentage: formData.yieldPercentage!,
      grade: formData.grade as MeatRecord['grade'],
      cuts: formData.cuts!,
      location: formData.location!,
      processor: formData.processor!,
      destination: formData.destination as MeatRecord['destination'],
      notes: formData.notes,
      status: formData.status as MeatRecord['status'],
      totalValue: formData.totalValue!
    };

    setMeatRecords(meatRecords.map(record => 
      record.id === selectedRecord.id ? updatedRecord : record
    ));
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    resetForm();
  };

  const handleDelete = (id: string): void => {
    setMeatRecords(meatRecords.filter(record => record.id !== id));
  };

  const handleView = (record: MeatRecord): void => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (record: MeatRecord): void => {
    setSelectedRecord(record);
    setFormData({
      animalId: record.animalId,
      animalName: record.animalName,
      breed: record.breed,
      birthDate: record.birthDate,
      slaughterDate: record.slaughterDate,
      liveWeight: record.liveWeight,
      carcassWeight: record.carcassWeight,
      yieldPercentage: record.yieldPercentage,
      grade: record.grade,
      cuts: record.cuts,
      location: record.location,
      processor: record.processor,
      destination: record.destination,
      notes: record.notes,
      status: record.status,
      totalValue: record.totalValue
    });
    setIsEditModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData({
      animalId: '',
      animalName: '',
      breed: '',
      birthDate: '',
      slaughterDate: new Date().toISOString().split('T')[0],
      liveWeight: 0,
      carcassWeight: 0,
      yieldPercentage: 0,
      grade: 'A',
      cuts: [
        { name: 'Lomo', weight: 0, pricePerKg: 0 },
        { name: 'Costilla', weight: 0, pricePerKg: 0 },
        { name: 'Pierna', weight: 0, pricePerKg: 0 }
      ],
      location: {
        lat: 16.7569,
        lng: -92.6348,
        name: 'Matadero Principal'
      },
      processor: '',
      destination: 'Venta Directa',
      notes: '',
      status: 'Programado',
      totalValue: 0
    });
  };

  const resetFilters = (): void => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      breed: '',
      grade: '',
      destination: '',
      status: ''
    });
    setSearchTerm('');
  };

  const updateCut = (index: number, field: 'weight' | 'pricePerKg', value: number): void => {
    if (!formData.cuts) return;
    const newCuts = [...formData.cuts];
    newCuts[index] = { ...newCuts[index], [field]: value };
    setFormData({ ...formData, cuts: newCuts });
  };

  const addCut = (): void => {
    if (!formData.cuts) return;
    const newCuts = [...formData.cuts, { name: '', weight: 0, pricePerKg: 0 }];
    setFormData({ ...formData, cuts: newCuts });
  };

  const removeCut = (index: number): void => {
    if (!formData.cuts || formData.cuts.length <= 1) return;
    const newCuts = formData.cuts.filter((_, i) => i !== index);
    setFormData({ ...formData, cuts: newCuts });
  };

  // Función para formatear números
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-MX', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 1 
    }).format(value);
  };

  // Función para formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Función para obtener color por grado
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'AAA': return 'success';
      case 'AA': return 'info';
      case 'A': return 'warning';
      case 'B': return 'warning';
      case 'C': return 'error';
      default: return 'default';
    }
  };

  // Función para obtener color por estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Procesado': return 'success';
      case 'Vendido': return 'info';
      case 'Programado': return 'warning';
      case 'Almacenado': return 'default';
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
          <Beef className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
        </div>
        <motion.p
          className="text-white text-lg font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Cargando Producción Cárnica...
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
                  <Beef className="h-6 w-6 text-[#519a7c]" />
                  {title}
                </h2>
                <Button variant="ghost" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del animal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Animal *
                  </label>
                  <Input
                    placeholder="Ej: BULL001"
                    value={formData.animalId}
                    onChange={(e) => setFormData({...formData, animalId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Animal *
                  </label>
                  <Input
                    placeholder="Ej: Tornado"
                    value={formData.animalName}
                    onChange={(e) => setFormData({...formData, animalName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza
                  </label>
                  <Select
                    value={formData.breed}
                    onChange={(value) => setFormData({...formData, breed: value})}
                  >
                    <option value="">Seleccionar raza</option>
                    <option value="Angus">Angus</option>
                    <option value="Holstein">Holstein</option>
                    <option value="Charolais">Charolais</option>
                    <option value="Hereford">Hereford</option>
                    <option value="Simmental">Simmental</option>
                    <option value="Brahman">Brahman</option>
                    <option value="Limousin">Limousin</option>
                  </Select>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Sacrificio *
                  </label>
                  <Input
                    type="date"
                    value={formData.slaughterDate}
                    onChange={(e) => setFormData({...formData, slaughterDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Pesos y rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Vivo (kg) *
                  </label>
                  <Input
                    type="number"
                    placeholder="580"
                    value={formData.liveWeight?.toString() || ''}
                    onChange={(e) => setFormData({...formData, liveWeight: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Canal (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="348"
                    value={formData.carcassWeight?.toString() || ''}
                    onChange={(e) => setFormData({...formData, carcassWeight: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rendimiento (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="60.0"
                    value={formData.yieldPercentage?.toString() || ''}
                    readOnly={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grado de Calidad
                  </label>
                  <Select
                    value={formData.grade}
                    onChange={(value) => setFormData({...formData, grade: value as any})}
                  >
                    <option value="AAA">AAA - Premium</option>
                    <option value="AA">AA - Superior</option>
                    <option value="A">A - Buena</option>
                    <option value="B">B - Regular</option>
                    <option value="C">C - Comercial</option>
                  </Select>
                </div>
              </div>

              {/* Cortes de carne */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Despiece y Valoración</h3>
                  <Button variant="outline" size="sm" onClick={addCut}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Corte
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.cuts?.map((cut, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Input
                          placeholder="Nombre del corte"
                          value={cut.name}
                          onChange={(e) => {
                            const newCuts = [...(formData.cuts || [])];
                            newCuts[index] = { ...newCuts[index], name: e.target.value };
                            setFormData({ ...formData, cuts: newCuts });
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Peso (kg)"
                          value={cut.weight.toString() || ''}
                          onChange={(e) => updateCut(index, 'weight', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Precio/kg"
                          value={cut.pricePerKg.toString() || ''}
                          onChange={(e) => updateCut(index, 'pricePerKg', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {formatCurrency(cut.weight * cut.pricePerKg)}
                        </span>
                        {formData.cuts && formData.cuts.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeCut(index)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="p-3 bg-[#519a7c]/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Valor Total Estimado:</span>
                      <span className="text-xl font-bold text-[#519a7c]">
                        {formatCurrency(formData.totalValue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procesamiento y destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procesador/Matadero
                  </label>
                  <Input
                    placeholder="Ej: Frigorífico Los Altos"
                    value={formData.processor}
                    onChange={(e) => setFormData({...formData, processor: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino
                  </label>
                  <Select
                    value={formData.destination}
                    onChange={(value) => setFormData({...formData, destination: value as any})}
                  >
                    <option value="Venta Directa">Venta Directa</option>
                    <option value="Frigorífico">Frigorífico</option>
                    <option value="Exportación">Exportación</option>
                    <option value="Consumo Propio">Consumo Propio</option>
                  </Select>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación de Procesamiento
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#519a7c]" />
                  <span className="text-sm">{formData.location?.name}</span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Seleccionar en Mapa
                  </Button>
                </div>
              </div>

              {/* Estado y notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(value) => setFormData({...formData, status: value as any})}
                  >
                    <option value="Programado">Programado</option>
                    <option value="Procesado">Procesado</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Almacenado">Almacenado</option>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <Textarea
                    placeholder="Observaciones adicionales..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
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
              <Beef className="h-10 w-10" />
              Producción Cárnica
            </h1>
            <p className="text-white/90 text-lg">
              Gestión integral de procesamiento y comercialización de ganado
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Procesados este Mes</p>
                    <p className="text-3xl font-bold text-gray-900">{meatStats.totalProcessedMonth}</p>
                    <p className="text-sm text-gray-500">animales</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Users className="h-8 w-8 text-red-600" />
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Peso Total</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(meatStats.totalWeightMonth)}</p>
                    <p className="text-sm text-gray-500">kg este mes</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Scale className="h-8 w-8 text-orange-600" />
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(meatStats.totalValueMonth / 1000)}K</p>
                    <p className="text-sm text-gray-500">este mes</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <ShoppingCart className="h-8 w-8 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Rendimiento Promedio</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(meatStats.averageYieldPercent)}%</p>
                    <p className="text-sm text-gray-500">canal/vivo</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="h-8 w-8 text-purple-600" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                        value={filters.breed}
                        onChange={(value) => setFilters({...filters, breed: value})}
                      >
                        <option value="">Todas</option>
                        <option value="Angus">Angus</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Charolais">Charolais</option>
                        <option value="Hereford">Hereford</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grado
                      </label>
                      <Select
                        value={filters.grade}
                        onChange={(value) => setFilters({...filters, grade: value})}
                      >
                        <option value="">Todos</option>
                        <option value="AAA">AAA</option>
                        <option value="AA">AA</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
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
                        <option value="Programado">Programado</option>
                        <option value="Procesado">Procesado</option>
                        <option value="Vendido">Vendido</option>
                        <option value="Almacenado">Almacenado</option>
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
                      placeholder="Buscar por animal, ID o raza..."
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
                  Registros de Producción ({filteredRecords.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Animal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Sacrificio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peso / Rendimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
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
                          <div className="text-sm text-gray-500">
                            {record.processor}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatNumber(record.liveWeight)} kg vivo
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(record.carcassWeight)} kg canal ({record.yieldPercentage}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getGradeColor(record.grade) as any}>
                            {record.grade}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(record.totalValue)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.destination}
                          </div>
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
                  <Beef className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          title="Nuevo Registro de Producción Cárnica"
          onSubmit={handleCreate}
        />

        {/* Modal para editar registro */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Registro de Producción Cárnica"
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
                      Detalles del Registro Cárnico
                    </h2>
                    <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información del animal */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Animal</h3>
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
                            <span className="text-gray-600">Fecha Nacimiento:</span>
                            <span className="font-medium">{selectedRecord.birthDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha Sacrificio:</span>
                            <span className="font-medium">{selectedRecord.slaughterDate}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Pesos y Rendimiento</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso Vivo:</span>
                            <span className="font-medium">{formatNumber(selectedRecord.liveWeight)} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso Canal:</span>
                            <span className="font-medium">{formatNumber(selectedRecord.carcassWeight)} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rendimiento:</span>
                            <span className="font-medium">{selectedRecord.yieldPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grado:</span>
                            <Badge variant={getGradeColor(selectedRecord.grade) as any}>
                              {selectedRecord.grade}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Despiece y valoración */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Despiece y Valoración</h3>
                        <div className="space-y-2">
                          {selectedRecord.cuts.map((cut, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{cut.name}:</span>
                              <span className="font-medium">
                                {formatNumber(cut.weight)} kg × {formatCurrency(cut.pricePerKg)} = {formatCurrency(cut.weight * cut.pricePerKg)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-3">
                            <div className="flex justify-between font-semibold">
                              <span>Total:</span>
                              <span className="text-[#519a7c]">{formatCurrency(selectedRecord.totalValue)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Procesamiento</h3>
                        <div className="space-y-2">
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
                            <Badge variant={getStatusColor(selectedRecord.status) as any}>
                              {selectedRecord.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-[#519a7c]" />
                          <span className="text-sm">{selectedRecord.location.name}</span>
                        </div>
                      </div>

                      {selectedRecord.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                            {selectedRecord.notes}
                          </p>
                        </div>
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

export default MeatProduction;