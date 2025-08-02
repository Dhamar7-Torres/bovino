import React, { useState, useCallback } from 'react';
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
  Users,
  Navigation,
  Clock,
  DollarSign,
  Target
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

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Props del formulario
interface ReportFormProps {
  report?: HealthReport;
  onSave: (report: Omit<HealthReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Props del modal de vista detallada
interface ViewReportModalProps {
  report: HealthReport;
  isOpen: boolean;
  onClose: () => void;
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

// Hook para geolocalización
const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          try {
            // Intentar obtener la dirección usando geocodificación inversa
            const response = await fetch(
              `https://api.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const locationData: LocationData = {
                ...coords,
                address: data.display_name || `${coords.latitude}, ${coords.longitude}`
              };
              setLocation(locationData);
              setIsLoading(false);
              resolve(locationData);
            } else {
              throw new Error('Error al obtener la dirección');
            }
          } catch (geocodeError) {
            // Si falla la geocodificación, usar solo las coordenadas
            const locationData: LocationData = {
              ...coords,
              address: `${coords.latitude}, ${coords.longitude}`
            };
            setLocation(locationData);
            setIsLoading(false);
            resolve(locationData);
          }
        },
        (error) => {
          let errorMessage = 'Error al obtener la ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  return { location, isLoading, error, getCurrentLocation };
};

// Funciones de utilidad para descarga
const downloadAsJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadAsCSV = (report: HealthReport) => {
  const csvData = [
    ['Campo', 'Valor'],
    ['ID', report.id],
    ['Título', report.title],
    ['Descripción', report.description],
    ['Tipo', REPORT_TYPE_CONFIG[report.reportType].label],
    ['Ubicación', report.location],
    ['Veterinario', report.veterinarian],
    ['Período Inicio', report.period.startDate],
    ['Período Fin', report.period.endDate],
    ['Total Evaluados', report.healthMetrics.totalAnimalsEvaluated.toString()],
    ['Animales Sanos', report.healthMetrics.healthyAnimals.toString()],
    ['Animales Enfermos', report.healthMetrics.sickAnimals.toString()],
    ['En Tratamiento', report.healthMetrics.underTreatment.toString()],
    ['Recuperados', report.healthMetrics.recovered.toString()],
    ['Muertes', report.healthMetrics.deaths.toString()],
    ['Tasa Éxito Tratamiento (%)', report.healthMetrics.treatmentSuccessRate.toString()],
    ['Cobertura Vacunación (%)', report.healthMetrics.vaccinationCoverage.toString()],
    ['Costo Total Tratamiento', report.healthMetrics.totalTreatmentCost.toString()],
    ['Estado', report.status],
    ['Creado Por', report.createdBy],
    ['Fecha Creación', new Date(report.createdAt).toLocaleString()]
  ];

  const csvString = csvData.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte_salud_${report.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Componente Modal reutilizable
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

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
          className={cn(
            "bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden",
            sizeClasses[size]
          )}
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75]">
            <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-3 lg:p-4 xl:p-6 max-h-[calc(90vh-60px)] lg:max-h-[calc(90vh-80px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente de Vista Detallada del Reporte
const ViewReportModal: React.FC<ViewReportModalProps> = ({ report, isOpen, onClose }) => {
  const getSeverityColor = (severity: DiseaseSeverity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: DiseaseStatus) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'contained': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista Detallada del Reporte" size="full">
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Información General</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Título:</span>
                  <p className="text-gray-600 mt-1">{report.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Descripción:</span>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="p-1 rounded"
                        style={{ 
                          backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                          color: REPORT_TYPE_CONFIG[report.reportType].color
                        }}
                      >
                        {REPORT_TYPE_CONFIG[report.reportType].icon}
                      </div>
                      <span className="text-gray-600">{REPORT_TYPE_CONFIG[report.reportType].label}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <p className="text-gray-600 mt-1 capitalize">{report.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalles del Período</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Inicio:</span>
                    <p className="text-gray-600 mt-1">{new Date(report.period.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fin:</span>
                    <p className="text-gray-600 mt-1">{new Date(report.period.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <p className="text-gray-600 mt-1 capitalize">{report.period.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ubicación:</span>
                    <p className="text-gray-600 mt-1">{report.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Veterinario:</span>
                    <p className="text-gray-600 mt-1">{report.veterinarian}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Creado por:</span>
                    <p className="text-gray-600 mt-1">{report.createdBy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de salud */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Salud</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{report.healthMetrics.totalAnimalsEvaluated}</p>
              <p className="text-sm text-blue-700">Total Evaluados</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{report.healthMetrics.healthyAnimals}</p>
              <p className="text-sm text-green-700">Sanos</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <Thermometer className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{report.healthMetrics.sickAnimals}</p>
              <p className="text-sm text-red-700">Enfermos</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Pill className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{report.healthMetrics.underTreatment}</p>
              <p className="text-sm text-yellow-700">En Tratamiento</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{report.healthMetrics.recovered}</p>
              <p className="text-sm text-emerald-700">Recuperados</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <TrendingDown className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{report.healthMetrics.deaths}</p>
              <p className="text-sm text-gray-700">Muertes</p>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Tiempo Promedio de Recuperación</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{report.healthMetrics.averageRecoveryTime} días</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Tasa de Éxito</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{report.healthMetrics.treatmentSuccessRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Syringe className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Cobertura Vacunación</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{report.healthMetrics.vaccinationCoverage.toFixed(1)}%</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Costo Total</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${report.healthMetrics.totalTreatmentCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Enfermedades */}
        {report.diseases.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enfermedades Registradas</h3>
            <div className="space-y-4">
              {report.diseases.map((disease) => (
                <div key={disease.diseaseId} className="bg-white border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{disease.diseaseName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Animales Afectados:</span>
                          <p className="text-gray-800">{disease.affectedAnimals}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Primera Detección:</span>
                          <p className="text-gray-800">{new Date(disease.firstDetected).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Síntomas:</span>
                          <p className="text-gray-800">{disease.symptoms.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        getSeverityColor(disease.severity)
                      )}>
                        Severidad: {disease.severity}
                      </span>
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(disease.status)
                      )}>
                        Estado: {disease.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tratamientos */}
        {report.treatments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tratamientos Aplicados</h3>
            <div className="space-y-4">
              {report.treatments.map((treatment) => (
                <div key={treatment.treatmentId} className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">{treatment.treatmentName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Medicamento:</span>
                      <p className="text-gray-800">{treatment.medication}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Dosificación:</span>
                      <p className="text-gray-800">{treatment.dosage}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Duración:</span>
                      <p className="text-gray-800">{treatment.duration} días</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Animales Tratados:</span>
                      <p className="text-gray-800">{treatment.animalsReceived}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tasa de Éxito:</span>
                      <p className="text-gray-800">{treatment.successRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Costo:</span>
                      <p className="text-gray-800">${treatment.cost.toLocaleString()}</p>
                    </div>
                    {treatment.sideEffects && treatment.sideEffects.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Efectos Secundarios:</span>
                        <p className="text-gray-800">{treatment.sideEffects.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vacunaciones */}
        {report.vaccinations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vacunaciones</h3>
            <div className="space-y-4">
              {report.vaccinations.map((vaccination) => (
                <div key={vaccination.vaccineId} className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">{vaccination.vaccineName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Animales Vacunados:</span>
                      <p className="text-gray-800">{vaccination.animalsVaccinated}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Dosis Administradas:</span>
                      <p className="text-gray-800">{vaccination.dosesAdministered}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Eficacia:</span>
                      <p className="text-gray-800">{vaccination.effectivenessRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Próxima Dosis:</span>
                      <p className="text-gray-800">{new Date(vaccination.nextDueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Costo:</span>
                      <p className="text-gray-800">${vaccination.cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Lote:</span>
                      <p className="text-gray-800">{vaccination.batch}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de auditoría */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Información de Auditoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Creado:</span>
              <p className="text-gray-800">{new Date(report.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Última Actualización:</span>
              <p className="text-gray-800">{new Date(report.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Componente Formulario de Reporte de Salud (versión mejorada)
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
  const { isLoading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();

  // Manejar obtención de ubicación actual
  const handleGetCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation && currentLocation.address) {
      setFormData(prev => ({
        ...prev,
        location: currentLocation.address
      }));
    }
  };

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
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Información básica */}
      <div className="space-y-3 lg:space-y-4">
        <h3 className="text-base lg:text-lg font-medium text-gray-800 border-b pb-2">
          Información General
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Reporte *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.title ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Evaluación de Salud General - Enero 2025"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte *
            </label>
            <select
              value={formData.reportType}
              onChange={(e) => handleInputChange('reportType', e.target.value as HealthReportType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            >
              {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={cn(
                  "flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                  errors.location ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ej: Potrero Norte, Todas las ubicaciones"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locationLoading}
                className="px-3 py-2 bg-[#2d6f51] text-white rounded-lg hover:bg-[#265a44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Obtener ubicación actual"
              >
                <Navigation className={cn("w-4 h-4", locationLoading && "animate-spin")} />
              </button>
            </div>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
            {locationError && (
              <p className="text-orange-500 text-xs mt-1">{locationError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veterinario Responsable *
            </label>
            <input
              type="text"
              value={formData.veterinarian}
              onChange={(e) => handleInputChange('veterinarian', e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.veterinarian ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Dr. Ana Martínez"
            />
            {errors.veterinarian && (
              <p className="text-red-500 text-xs mt-1">{errors.veterinarian}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={cn(
              "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors resize-none",
              errors.description ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Describe el propósito y alcance del reporte de salud"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Período del reporte */}
      <div className="space-y-3">
        <h3 className="text-base lg:text-lg font-medium text-gray-800 border-b pb-2">
          Período del Reporte
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Período
            </label>
            <select
              value={formData.period?.type}
              onChange={(e) => handlePeriodChange('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.period?.startDate}
              onChange={(e) => handlePeriodChange('startDate', e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.startDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin *
            </label>
            <input
              type="date"
              value={formData.period?.endDate}
              onChange={(e) => handlePeriodChange('endDate', e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.endDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas de salud */}
      <div className="space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-base lg:text-lg font-medium text-gray-800 border-b pb-2 flex-1">
            Métricas de Salud
          </h3>
          <button
            type="button"
            onClick={calculateDerivedMetrics}
            className="text-xs sm:text-sm text-[#2d6f51] hover:text-[#265a44] font-medium whitespace-nowrap"
          >
            Calcular Automáticamente
          </button>
        </div>
        
        {errors.consistency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-xs">{errors.consistency}</p>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Users className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
              Total Evaluados
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.totalAnimalsEvaluated || 0}
              onChange={(e) => handleMetricsChange('totalAnimalsEvaluated', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Heart className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 text-green-600" />
              Animales Sanos
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.healthyAnimals || 0}
              onChange={(e) => handleMetricsChange('healthyAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Thermometer className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 text-red-600" />
              Animales Enfermos
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.sickAnimals || 0}
              onChange={(e) => handleMetricsChange('sickAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Pill className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 text-blue-600" />
              En Tratamiento
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.underTreatment || 0}
              onChange={(e) => handleMetricsChange('underTreatment', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 text-green-600" />
              Recuperados
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.recovered || 0}
              onChange={(e) => handleMetricsChange('recovered', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1 text-red-800" />
              Muertes
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.deaths || 0}
              onChange={(e) => handleMetricsChange('deaths', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Tiempo Prom. Recuperación (días)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.healthMetrics?.averageRecoveryTime || 0}
              onChange={(e) => handleMetricsChange('averageRecoveryTime', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Tasa Éxito Tratamiento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.healthMetrics?.treatmentSuccessRate || 0}
              onChange={(e) => handleMetricsChange('treatmentSuccessRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Syringe className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
              Cobertura Vacunación (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.healthMetrics?.vaccinationCoverage || 0}
              onChange={(e) => handleMetricsChange('vaccinationCoverage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Costo Total Tratamiento ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.healthMetrics?.totalTreatmentCost || 0}
              onChange={(e) => handleMetricsChange('totalTreatmentCost', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Costo Prom. por Animal ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.healthMetrics?.averageCostPerAnimal || 0}
              onChange={(e) => handleMetricsChange('averageCostPerAnimal', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              <Shield className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
              Medidas Preventivas
            </label>
            <input
              type="number"
              min="0"
              value={formData.healthMetrics?.preventiveMeasures || 0}
              onChange={(e) => handleMetricsChange('preventiveMeasures', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Estado del reporte */}
      <div className="space-y-3">
        <h3 className="text-base lg:text-lg font-medium text-gray-800 border-b pb-2">
          Estado del Reporte
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado del Reporte
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as ReportStatus)}
            className="w-full max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="archived">Archivado</option>
            <option value="processing">Procesando</option>
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
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
  const [viewReportModal, setViewReportModal] = useState<HealthReport | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  // Ver reporte detallado
  const handleViewReport = (report: HealthReport) => {
    setViewReportModal(report);
  };

  // Descargar reporte
  const handleDownloadReport = (report: HealthReport, format: 'json' | 'csv' = 'csv') => {
    if (format === 'json') {
      downloadAsJSON(report, `reporte_salud_${report.id}`);
    } else {
      downloadAsCSV(report);
    }
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
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6"
          >
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-sm mb-1">
                Reportes de Salud Ganadera
              </h1>
              <p className="text-white/90 text-xs sm:text-sm lg:text-base">
                Gestiona y analiza los reportes veterinarios y de salud animal
              </p>
            </div>

            <button
              onClick={handleCreateReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg text-xs sm:text-sm lg:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Reporte de Salud</span>
              <span className="sm:hidden">Nuevo Reporte</span>
            </button>
          </motion.div>

          {/* Filtros y búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 mb-3 sm:mb-4 lg:mb-6"
          >
            {/* Versión móvil */}
            <div className="lg:hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar reportes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                  />
                </div>
                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              
              <AnimatePresence>
                {isMobileFiltersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2 border-t">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                      >
                        <option value="all">Todos los tipos</option>
                        {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivado</option>
                        <option value="processing">Procesando</option>
                      </select>
                      
                      <div className="flex items-center justify-center text-gray-600 text-xs py-1">
                        <span>{filteredReports.length} de {reports.length} reportes</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Versión desktop */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
                <option value="processing">Procesando</option>
              </select>

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
              <div className="p-6 lg:p-12 text-center">
                <Activity className="w-10 h-10 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base lg:text-lg font-medium text-gray-800 mb-2">
                  No se encontraron reportes de salud
                </h3>
                <p className="text-sm text-gray-600 mb-4 lg:mb-6">
                  {reports.length === 0 
                    ? 'Crea tu primer reporte de salud ganadera'
                    : 'Ajusta los filtros o términos de búsqueda'
                  }
                </p>
                {reports.length === 0 && (
                  <button
                    onClick={handleCreateReport}
                    className="inline-flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 text-sm lg:text-base"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    Crear Primer Reporte
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Vista móvil - Cards */}
                <div className="lg:hidden">
                  <div className="divide-y divide-gray-200">
                    {filteredReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate text-sm">{report.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {report.description}
                              </p>
                            </div>
                            <span className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 whitespace-nowrap",
                              getStatusColor(report.status)
                            )}>
                              {getStatusLabel(report.status)}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div 
                                className="p-1 rounded"
                                style={{ 
                                  backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                  color: REPORT_TYPE_CONFIG[report.reportType].color
                                }}
                              >
                                <div className="w-3 h-3">
                                  {REPORT_TYPE_CONFIG[report.reportType].icon}
                                </div>
                              </div>
                              <span className="text-gray-700 truncate">{REPORT_TYPE_CONFIG[report.reportType].label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{report.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{report.veterinarian}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 truncate capitalize">{report.period.type}</span>
                            </div>
                          </div>

                          {/* Métricas */}
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <p className="font-medium text-gray-800">{report.healthMetrics.totalAnimalsEvaluated}</p>
                                <p className="text-xs text-gray-600">Evaluados</p>
                              </div>
                              <div>
                                <p className="font-medium text-green-600">{report.healthMetrics.healthyAnimals}</p>
                                <p className="text-xs text-gray-600">Sanos</p>
                              </div>
                              <div>
                                <p className="font-medium text-red-600">{report.healthMetrics.sickAnimals}</p>
                                <p className="text-xs text-gray-600">Enfermos</p>
                              </div>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              Por {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditReport(report)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Editar reporte"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleViewReport(report)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Ver reporte"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report)}
                                className="p-1.5 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                                title="Descargar reporte"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(report.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar reporte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Vista desktop - Tabla */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Reporte</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Ubicación</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Veterinario</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Período</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Métricas Clave</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
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
                          <td className="px-4 py-3">
                            <div>
                              <h4 className="font-medium text-gray-800 text-sm">{report.title}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {report.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Por {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="p-1.5 rounded-lg"
                                style={{ 
                                  backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                  color: REPORT_TYPE_CONFIG[report.reportType].color
                                }}
                              >
                                {REPORT_TYPE_CONFIG[report.reportType].icon}
                              </div>
                              <span className="text-xs font-medium">
                                {REPORT_TYPE_CONFIG[report.reportType].label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs">{report.location}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Stethoscope className="w-3 h-3 text-gray-400" />
                              <span className="text-xs">{report.veterinarian}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700">
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="capitalize">{report.period.type}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                              getStatusColor(report.status)
                            )}>
                              {getStatusLabel(report.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs space-y-1">
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditReport(report)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Editar reporte"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleViewReport(report)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Ver reporte"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report)}
                                className="p-1.5 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                                title="Descargar reporte"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(report.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar reporte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Reporte de Salud' : 'Crear Nuevo Reporte de Salud'}
        size="xl"
      >
        <HealthReportForm
          report={selectedReport || undefined}
          onSave={handleSaveReport}
          onCancel={() => setIsModalOpen(false)}
          isEditing={isEditing}
        />
      </Modal>

      {/* Modal de vista detallada */}
      {viewReportModal && (
        <ViewReportModal
          report={viewReportModal}
          isOpen={true}
          onClose={() => setViewReportModal(null)}
        />
      )}

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
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 lg:p-6"
            >
              <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                <div className="p-2 lg:p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-800">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 lg:mb-6">
                ¿Estás seguro de que deseas eliminar este reporte de salud? 
                Se perderán todos los datos médicos asociados.
              </p>
              
              <div className="flex items-center justify-end gap-2 lg:gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 lg:px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  className="px-3 lg:px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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