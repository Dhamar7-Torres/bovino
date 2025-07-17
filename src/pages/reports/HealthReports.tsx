import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye,
  X,
  Save,
  AlertCircle,
  Calendar,
  Activity,
  Heart,
  Syringe,
  Shield,
  Thermometer,
  Stethoscope,
  Pill,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces para reportes de salud
interface HealthReport {
  id: string;
  title: string;
  description: string;
  reportType: HealthReportType;
  period: ReportPeriod;
  location: string;
  healthMetrics: HealthMetrics;
  diseases: DiseaseRecord[];
  treatments: TreatmentRecord[];
  vaccinations: VaccinationRecord[];
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  veterinarian: string;
  createdBy: string;
}

interface HealthMetrics {
  totalAnimalsEvaluated: number;
  healthyAnimals: number;
  sickAnimals: number;
  underTreatment: number;
  recovered: number;
  deaths: number;
  averageRecoveryTime: number; // días
  treatmentSuccessRate: number; // porcentaje
  vaccinationCoverage: number; // porcentaje
  totalTreatmentCost: number;
  averageCostPerAnimal: number;
  preventiveMeasures: number;
}

interface DiseaseRecord {
  diseaseId: string;
  diseaseName: string;
  affectedAnimals: number;
  severity: DiseaseSeverity;
  symptoms: string[];
  firstDetected: string;
  status: DiseaseStatus;
}

interface TreatmentRecord {
  treatmentId: string;
  treatmentName: string;
  medication: string;
  dosage: string;
  duration: number; // días
  animalsReceived: number;
  successRate: number;
  cost: number;
  sideEffects?: string[];
}

interface VaccinationRecord {
  vaccineId: string;
  vaccineName: string;
  animalsVaccinated: number;
  dosesAdministered: number;
  effectivenessRate: number;
  nextDueDate: string;
  cost: number;
  batch: string;
}

interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

type HealthReportType = 
  | 'general_health' 
  | 'disease_outbreak' 
  | 'vaccination_report' 
  | 'treatment_analysis' 
  | 'mortality_report' 
  | 'prevention_program'
  | 'veterinary_inspection';

type ReportStatus = 'draft' | 'active' | 'archived' | 'processing';
type DiseaseSeverity = 'low' | 'medium' | 'high' | 'critical';
type DiseaseStatus = 'active' | 'contained' | 'resolved' | 'monitoring';

// Props del componente principal
interface HealthReportsProps {
  className?: string;
}

// Props del modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

// Props del formulario
interface ReportFormProps {
  report?: HealthReport;
  onSave: (report: Omit<HealthReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Datos de ejemplo
const SAMPLE_REPORTS: HealthReport[] = [
  {
    id: '1',
    title: 'Evaluación General de Salud - Enero 2025',
    description: 'Revisión mensual del estado de salud del ganado en todas las ubicaciones',
    reportType: 'general_health',
    period: {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      type: 'monthly'
    },
    location: 'Todas las ubicaciones',
    healthMetrics: {
      totalAnimalsEvaluated: 1248,
      healthyAnimals: 1156,
      sickAnimals: 67,
      underTreatment: 25,
      recovered: 42,
      deaths: 8,
      averageRecoveryTime: 12.5,
      treatmentSuccessRate: 94.2,
      vaccinationCoverage: 96.8,
      totalTreatmentCost: 15420.50,
      averageCostPerAnimal: 12.35,
      preventiveMeasures: 45
    },
    diseases: [
      {
        diseaseId: 'resp001',
        diseaseName: 'Neumonía Bovina',
        affectedAnimals: 23,
        severity: 'medium',
        symptoms: ['Tos', 'Fiebre', 'Dificultad respiratoria'],
        firstDetected: '2025-01-05',
        status: 'contained'
      },
      {
        diseaseId: 'dige002',
        diseaseName: 'Diarrea Bacteriana',
        affectedAnimals: 15,
        severity: 'low',
        symptoms: ['Diarrea', 'Deshidratación leve'],
        firstDetected: '2025-01-12',
        status: 'resolved'
      }
    ],
    treatments: [
      {
        treatmentId: 'treat001',
        treatmentName: 'Antibiótico Respiratorio',
        medication: 'Tulathromicina',
        dosage: '2.5 ml/kg',
        duration: 5,
        animalsReceived: 23,
        successRate: 95.7,
        cost: 1250.00,
        sideEffects: ['Hinchazón temporal en sitio de inyección']
      }
    ],
    vaccinations: [
      {
        vaccineId: 'vacc001',
        vaccineName: 'Vacuna Respiratoria Polivalente',
        animalsVaccinated: 1200,
        dosesAdministered: 1200,
        effectivenessRate: 97.5,
        nextDueDate: '2025-07-01',
        cost: 3600.00,
        batch: 'RES2025A'
      }
    ],
    createdAt: '2025-01-31T14:30:00Z',
    updatedAt: '2025-01-31T16:20:00Z',
    status: 'active',
    veterinarian: 'Dr. Ana Martínez',
    createdBy: 'Juan Pérez'
  },
  {
    id: '2',
    title: 'Brote de Fiebre Aftosa - Potrero Norte',
    description: 'Análisis y control de brote detectado en sector norte',
    reportType: 'disease_outbreak',
    period: {
      startDate: '2025-01-10',
      endDate: '2025-01-25',
      type: 'custom'
    },
    location: 'Potrero Norte',
    healthMetrics: {
      totalAnimalsEvaluated: 324,
      healthyAnimals: 298,
      sickAnimals: 26,
      underTreatment: 26,
      recovered: 18,
      deaths: 2,
      averageRecoveryTime: 18.3,
      treatmentSuccessRate: 92.3,
      vaccinationCoverage: 100.0,
      totalTreatmentCost: 8750.25,
      averageCostPerAnimal: 27.01,
      preventiveMeasures: 15
    },
    diseases: [
      {
        diseaseId: 'viral001',
        diseaseName: 'Fiebre Aftosa',
        affectedAnimals: 26,
        severity: 'high',
        symptoms: ['Fiebre alta', 'Lesiones en boca', 'Cojera', 'Salivación excesiva'],
        firstDetected: '2025-01-10',
        status: 'contained'
      }
    ],
    treatments: [
      {
        treatmentId: 'treat002',
        treatmentName: 'Tratamiento Sintomático Aftosa',
        medication: 'Antiinflamatorio + Antibiótico',
        dosage: 'Según protocolo veterinario',
        duration: 14,
        animalsReceived: 26,
        successRate: 92.3,
        cost: 8750.25
      }
    ],
    vaccinations: [
      {
        vaccineId: 'vacc002',
        vaccineName: 'Vacuna Aftosa Refuerzo',
        animalsVaccinated: 324,
        dosesAdministered: 324,
        effectivenessRate: 98.5,
        nextDueDate: '2025-12-01',
        cost: 1620.00,
        batch: 'AFT2025B'
      }
    ],
    createdAt: '2025-01-25T11:15:00Z',
    updatedAt: '2025-01-26T09:30:00Z',
    status: 'active',
    veterinarian: 'Dr. Carlos Rodríguez',
    createdBy: 'María González'
  },
  {
    id: '3',
    title: 'Programa de Vacunación Q4 2024',
    description: 'Reporte completo del programa de vacunación del cuarto trimestre',
    reportType: 'vaccination_report',
    period: {
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      type: 'quarterly'
    },
    location: 'Todas las ubicaciones',
    healthMetrics: {
      totalAnimalsEvaluated: 1248,
      healthyAnimals: 1195,
      sickAnimals: 38,
      underTreatment: 15,
      recovered: 23,
      deaths: 5,
      averageRecoveryTime: 8.2,
      treatmentSuccessRate: 97.8,
      vaccinationCoverage: 99.2,
      totalTreatmentCost: 2850.75,
      averageCostPerAnimal: 2.28,
      preventiveMeasures: 125
    },
    diseases: [],
    treatments: [],
    vaccinations: [
      {
        vaccineId: 'vacc003',
        vaccineName: 'Vacuna Triple Bovina',
        animalsVaccinated: 1238,
        dosesAdministered: 1238,
        effectivenessRate: 99.1,
        nextDueDate: '2025-10-01',
        cost: 9904.00,
        batch: 'TRI2024D'
      },
      {
        vaccineId: 'vacc004',
        vaccineName: 'Vacuna Brucelosis',
        animalsVaccinated: 156,
        dosesAdministered: 156,
        effectivenessRate: 100.0,
        nextDueDate: '2027-10-01',
        cost: 780.00,
        batch: 'BRU2024C'
      }
    ],
    createdAt: '2025-01-05T10:45:00Z',
    updatedAt: '2025-01-05T10:45:00Z',
    status: 'archived',
    veterinarian: 'Dr. Ana Martínez',
    createdBy: 'Carlos Rodríguez'
  }
];

// Configuración de tipos de reporte
const REPORT_TYPE_CONFIG = {
  general_health: {
    label: 'Salud General',
    icon: <Heart className="w-4 h-4" />,
    color: '#2d6f51'
  },
  disease_outbreak: {
    label: 'Brote de Enfermedad',
    icon: <AlertCircle className="w-4 h-4" />,
    color: '#e74c3c'
  },
  vaccination_report: {
    label: 'Reporte de Vacunación',
    icon: <Syringe className="w-4 h-4" />,
    color: '#4e9c75'
  },
  treatment_analysis: {
    label: 'Análisis de Tratamientos',
    icon: <Pill className="w-4 h-4" />,
    color: '#519a7c'
  },
  mortality_report: {
    label: 'Reporte de Mortalidad',
    icon: <TrendingDown className="w-4 h-4" />,
    color: '#8b4513'
  },
  prevention_program: {
    label: 'Programa Preventivo',
    icon: <Shield className="w-4 h-4" />,
    color: '#3ca373'
  },
  veterinary_inspection: {
    label: 'Inspección Veterinaria',
    icon: <Stethoscope className="w-4 h-4" />,
    color: '#2e8b57'
  }
};

// Componente Modal reutilizable
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75]">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente Formulario de Reporte de Salud
const HealthReportForm: React.FC<ReportFormProps> = ({ report, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState<Partial<HealthReport>>({
    title: report?.title || '',
    description: report?.description || '',
    reportType: report?.reportType || 'general_health',
    location: report?.location || '',
    veterinarian: report?.veterinarian || '',
    period: report?.period || {
      startDate: '',
      endDate: '',
      type: 'monthly'
    },
    healthMetrics: report?.healthMetrics || {
      totalAnimalsEvaluated: 0,
      healthyAnimals: 0,
      sickAnimals: 0,
      underTreatment: 0,
      recovered: 0,
      deaths: 0,
      averageRecoveryTime: 0,
      treatmentSuccessRate: 0,
      vaccinationCoverage: 0,
      totalTreatmentCost: 0,
      averageCostPerAnimal: 0,
      preventiveMeasures: 0
    },
    diseases: report?.diseases || [],
    treatments: report?.treatments || [],
    vaccinations: report?.vaccinations || [],
    status: report?.status || 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    if (!formData.veterinarian?.trim()) {
      newErrors.veterinarian = 'El veterinario responsable es requerido';
    }
    if (!formData.period?.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    if (!formData.period?.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }
    if (formData.period?.startDate && formData.period?.endDate && 
        new Date(formData.period.startDate) >= new Date(formData.period.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Validaciones de consistencia en métricas
    const metrics = formData.healthMetrics;
    if (metrics) {
      const totalCalculated = metrics.healthyAnimals + metrics.sickAnimals;
      if (totalCalculated > metrics.totalAnimalsEvaluated) {
        newErrors.consistency = 'La suma de animales sanos y enfermos no puede exceder el total evaluado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar cambios en el período
  const handlePeriodChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      period: {
        ...prev.period!,
        [field]: value
      }
    }));
  };

  // Manejar cambios en las métricas de salud
  const handleMetricsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      healthMetrics: {
        ...prev.healthMetrics!,
        [field]: value
      }
    }));
  };

  // Calcular métricas automáticas
  const calculateDerivedMetrics = () => {
    const metrics = formData.healthMetrics!;
    const updatedMetrics = { ...metrics };

    // Calcular costo promedio por animal
    if (metrics.totalAnimalsEvaluated > 0) {
      updatedMetrics.averageCostPerAnimal = metrics.totalTreatmentCost / metrics.totalAnimalsEvaluated;
    }

    // Calcular tasa de éxito de tratamiento
    if (metrics.underTreatment + metrics.recovered > 0) {
      updatedMetrics.treatmentSuccessRate = (metrics.recovered / (metrics.underTreatment + metrics.recovered)) * 100;
    }

    setFormData(prev => ({
      ...prev,
      healthMetrics: updatedMetrics
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      title: formData.title!,
      description: formData.description!,
      reportType: formData.reportType!,
      location: formData.location!,
      veterinarian: formData.veterinarian!,
      period: formData.period!,
      healthMetrics: formData.healthMetrics!,
      diseases: formData.diseases!,
      treatments: formData.treatments!,
      vaccinations: formData.vaccinations!,
      status: formData.status!,
      createdBy: 'Usuario Actual' // En una app real vendría del contexto de auth
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Información General
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Reporte *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.title ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Evaluación de Salud General - Enero 2025"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte *
            </label>
            <select
              value={formData.reportType}
              onChange={(e) => handleInputChange('reportType', e.target.value as HealthReportType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            >
              {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.location ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Potrero Norte, Todas las ubicaciones"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veterinario Responsable *
            </label>
            <input
              type="text"
              value={formData.veterinarian}
              onChange={(e) => handleInputChange('veterinarian', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.veterinarian ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Dr. Ana Martínez"
            />
            {errors.veterinarian && (
              <p className="text-red-500 text-sm mt-1">{errors.veterinarian}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={cn(
              "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors resize-none",
              errors.description ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Describe el propósito y alcance del reporte de salud"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Período del reporte */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Período del Reporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Período
            </label>
            <select
              value={formData.period?.type}
              onChange={(e) => handlePeriodChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.period?.startDate}
              onChange={(e) => handlePeriodChange('startDate', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.startDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              value={formData.period?.endDate}
              onChange={(e) => handlePeriodChange('endDate', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.endDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas de salud */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex-1">
            Métricas de Salud
          </h3>
          <button
            type="button"
            onClick={calculateDerivedMetrics}
            className="text-sm text-[#2d6f51] hover:text-[#265a44] font-medium"
          >
            Calcular Automáticamente
          </button>
        </div>
        
        {errors.consistency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.consistency}</p>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Total Evaluados
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.totalAnimalsEvaluated || 0}
              onChange={(e) => handleMetricsChange('totalAnimalsEvaluated', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1 text-green-600" />
              Animales Sanos
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.healthyAnimals || 0}
              onChange={(e) => handleMetricsChange('healthyAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Thermometer className="w-4 h-4 inline mr-1 text-red-600" />
              Animales Enfermos
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.sickAnimals || 0}
              onChange={(e) => handleMetricsChange('sickAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Pill className="w-4 h-4 inline mr-1 text-blue-600" />
              En Tratamiento
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.underTreatment || 0}
              onChange={(e) => handleMetricsChange('underTreatment', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1 text-green-600" />
              Recuperados
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.recovered || 0}
              onChange={(e) => handleMetricsChange('recovered', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingDown className="w-4 h-4 inline mr-1 text-red-800" />
              Muertes
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.deaths || 0}
              onChange={(e) => handleMetricsChange('deaths', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo Prom. Recuperación (días)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.healthMetrics?.averageRecoveryTime || 0}
              onChange={(e) => handleMetricsChange('averageRecoveryTime', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa Éxito Tratamiento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.healthMetrics?.treatmentSuccessRate || 0}
              onChange={(e) => handleMetricsChange('treatmentSuccessRate', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Syringe className="w-4 h-4 inline mr-1" />
              Cobertura Vacunación (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.healthMetrics?.vaccinationCoverage || 0}
              onChange={(e) => handleMetricsChange('vaccinationCoverage', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo Total Tratamiento ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.healthMetrics?.totalTreatmentCost || 0}
              onChange={(e) => handleMetricsChange('totalTreatmentCost', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo Prom. por Animal ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.healthMetrics?.averageCostPerAnimal || 0}
              onChange={(e) => handleMetricsChange('averageCostPerAnimal', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Medidas Preventivas
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.preventiveMeasures || 0}
              onChange={(e) => handleMetricsChange('preventiveMeasures', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Estado del reporte */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Estado del Reporte
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado del Reporte
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as ReportStatus)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="archived">Archivado</option>
            <option value="processing">Procesando</option>
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Actualizar Reporte' : 'Crear Reporte'}
        </button>
      </div>
    </form>
  );
};

// Componente principal
export const HealthReports: React.FC<HealthReportsProps> = ({ className }) => {
  const [reports, setReports] = useState<HealthReport[]>(SAMPLE_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.reportType === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Abrir modal para crear reporte
  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar reporte
  const handleEditReport = (report: HealthReport) => {
    setSelectedReport(report);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Guardar reporte (crear o editar)
  const handleSaveReport = (reportData: Omit<HealthReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && selectedReport) {
      // Editar reporte existente
      setReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? {
              ...reportData,
              id: selectedReport.id,
              createdAt: selectedReport.createdAt,
              updatedAt: new Date().toISOString()
            }
          : report
      ));
    } else {
      // Crear nuevo reporte
      const newReport: HealthReport = {
        ...reportData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setReports(prev => [newReport, ...prev]);
    }
    
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  // Eliminar reporte
  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    setDeleteConfirm(null);
  };

  // Obtener color del estado
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                Reportes de Salud Ganadera
              </h1>
              <p className="text-white/90">
                Gestiona y analiza los reportes veterinarios y de salud animal
              </p>
            </div>

            <button
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Reporte de Salud
            </button>
          </motion.div>

          {/* Filtros y búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                />
              </div>

              {/* Filtro por tipo */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                  <option value="processing">Procesando</option>
                </select>
              </div>

              {/* Contador de resultados */}
              <div className="flex items-center text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {filteredReports.length} de {reports.length} reportes
                </span>
              </div>
            </div>
          </motion.div>

          {/* Lista de reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
          >
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No se encontraron reportes de salud
                </h3>
                <p className="text-gray-600 mb-6">
                  {reports.length === 0 
                    ? 'Crea tu primer reporte de salud ganadera'
                    : 'Ajusta los filtros o términos de búsqueda'
                  }
                </p>
                {reports.length === 0 && (
                  <button
                    onClick={handleCreateReport}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Primer Reporte
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Reporte</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Ubicación</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Veterinario</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Período</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Métricas Clave</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <h4 className="font-medium text-gray-800">{report.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {report.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Por {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ 
                                backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                color: REPORT_TYPE_CONFIG[report.reportType].color
                              }}
                            >
                              {REPORT_TYPE_CONFIG[report.reportType].icon}
                            </div>
                            <span className="text-sm font-medium">
                              {REPORT_TYPE_CONFIG[report.reportType].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{report.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{report.veterinarian}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="capitalize">{report.period.type}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                            getStatusColor(report.status)
                          )}>
                            {getStatusLabel(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Evaluados:</span>
                              <span className="font-medium">{report.healthMetrics.totalAnimalsEvaluated}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sanos:</span>
                              <span className="font-medium text-green-600">{report.healthMetrics.healthyAnimals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Enfermos:</span>
                              <span className="font-medium text-red-600">{report.healthMetrics.sickAnimals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Éxito trat.:</span>
                              <span className="font-medium">{report.healthMetrics.treatmentSuccessRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReport(report)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar reporte"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Ver reporte"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                              title="Descargar reporte"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(report.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Reporte de Salud' : 'Crear Nuevo Reporte de Salud'}
      >
        <HealthReportForm
          report={selectedReport || undefined}
          onSave={handleSaveReport}
          onCancel={() => setIsModalOpen(false)}
          isEditing={isEditing}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-gray-600">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar este reporte de salud? 
                Se perderán todos los datos médicos asociados.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};