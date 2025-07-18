import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug,
  Shield,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Activity,
  Microscope,
  Pill,
  Target,
  Users,
  FileText,
  Download,
  Zap,
  Settings
} from 'lucide-react';

// Interfaces para tipos de datos
interface Parasite {
  id: string;
  name: string;
  scientificName: string;
  type: 'internal' | 'external';
  category: 'nematode' | 'cestode' | 'trematode' | 'protozoa' | 'arthropod' | 'mite' | 'tick' | 'fly';
  description: string;
  symptoms: string[];
  affectedOrgans: string[];
  transmissionMode: string;
  lifecycle: string;
  seasonality: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prevalence: number; // porcentaje
  economicImpact: 'low' | 'medium' | 'high';
  zoonoticRisk: boolean;
}

interface ParasiteInfestation {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  parasiteId: string;
  parasiteName: string;
  detectionDate: Date;
  detectionMethod: 'clinical' | 'laboratory' | 'necropsy' | 'field_observation';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  parasiteLoad: 'low' | 'medium' | 'high' | 'very_high';
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  clinicalSigns: string[];
  laboratoryResults?: {
    eggCount?: number;
    oocystCount?: number;
    larvaeCount?: number;
    adultsFound?: number;
    testMethod: string;
    testDate: Date;
  };
  veterinarian: string;
  treatment?: {
    medicationId: string;
    medicationName: string;
    startDate: Date;
    endDate?: Date;
    dosage: string;
    frequency: string;
    route: string;
    cost: number;
  };
  status: 'active' | 'treating' | 'resolved' | 'chronic' | 'reinfection';
  followUpDate?: Date;
  notes: string;
}

interface TreatmentProtocol {
  id: string;
  name: string;
  parasiteTypes: string[];
  medications: Array<{
    medicationId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
  }>;
  schedule: Array<{
    day: number;
    actions: string[];
    observations: string[];
  }>;
  withdrawalPeriod: number;
  contraindications: string[];
  precautions: string[];
  expectedEffectiveness: number;
  cost: number;
  isStandard: boolean;
  createdBy: string;
  lastUpdated: Date;
}

interface ParasiteStats {
  totalInfestations: number;
  activeInfestations: number;
  resolvedInfestations: number;
  criticalCases: number;
  treatmentSuccessRate: number;
  mostCommonParasite: string;
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
  averageTreatmentDays: number;
  totalTreatmentCost: number;
  affectedAnimals: number;
  reinfectionRate: number;
}

interface SeasonalAlert {
  id: string;
  parasiteName: string;
  season: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  expectedIncrease: number;
  recommendedActions: string[];
  isActive: boolean;
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'default';
  className?: string;
}> = ({ children, onClick, variant = 'default', size = 'default', className = '' }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = '' }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'internal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'external': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'treating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'chronic': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reinfection': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very_high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Componente de Mapa de Infestaciones
const InfestationMap: React.FC = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-yellow-100"></div>
      
      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Mapa de Infestaciones - Villahermosa, Tabasco</span>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Severo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Leve</span>
          </div>
        </div>
      </div>
      
      {/* Marcadores simulados de infestaciones */}
      <div className="relative w-full h-full">
        {/* Infestación crítica */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Bug className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs">
            <p className="font-medium text-red-700">Garrapatas</p>
            <p className="text-gray-600">5 animales afectados</p>
            <p className="text-gray-600">Sector A - Pastizal Norte</p>
          </div>
        </div>
        
        {/* Infestación moderada */}
        <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Microscope className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-yellow-700">Parásitos GI</p>
            <p className="text-gray-600">2 animales</p>
            <p className="text-gray-600">Sector B</p>
          </div>
        </div>
        
        {/* Infestación tratada */}
        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg cursor-pointer opacity-75"
            whileHover={{ scale: 1.2 }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-green-700">Tratamiento Exitoso</p>
            <p className="text-gray-600">Mosca del Cuerno</p>
            <p className="text-gray-600">Sector C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta Estacional
const SeasonalAlertCard: React.FC<{ alert: SeasonalAlert }> = ({ alert }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.riskLevel === 'critical' ? 'border-red-500 bg-red-50' :
        alert.riskLevel === 'high' ? 'border-orange-500 bg-orange-50' :
        alert.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-green-500 bg-green-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Bug className={`w-5 h-5 ${
          alert.riskLevel === 'critical' ? 'text-red-600' :
          alert.riskLevel === 'high' ? 'text-orange-600' :
          alert.riskLevel === 'medium' ? 'text-yellow-600' :
          'text-green-600'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.parasiteName}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p>Temporada: {alert.season}</p>
            <p>Incremento esperado: +{alert.expectedIncrease}%</p>
            <div className="mt-2">
              <p className="font-medium">Acciones recomendadas:</p>
              <ul className="list-disc list-inside mt-1">
                {alert.recommendedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Badge variant={alert.riskLevel}>
          {alert.riskLevel === 'critical' ? 'Crítico' :
           alert.riskLevel === 'high' ? 'Alto' :
           alert.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
        </Badge>
      </div>
    </motion.div>
  );
};

const ParasiteParatrol: React.FC = () => {
  // Estados del componente
  const [infestations, setInfestations] = useState<ParasiteInfestation[]>([]);
  const [parasites, setParasites] = useState<Parasite[]>([]);
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
  const [stats, setStats] = useState<ParasiteStats>({
    totalInfestations: 0,
    activeInfestations: 0,
    resolvedInfestations: 0,
    criticalCases: 0,
    treatmentSuccessRate: 0,
    mostCommonParasite: '',
    seasonalTrend: 'stable',
    averageTreatmentDays: 0,
    totalTreatmentCost: 0,
    affectedAnimals: 0,
    reinfectionRate: 0
  });
  const [seasonalAlerts, setSeasonalAlerts] = useState<SeasonalAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParasiteType, setSelectedParasiteType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'infestations' | 'protocols' | 'parasites'>('infestations');

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo para parásitos
      const mockParasites: Parasite[] = [
        {
          id: '1',
          name: 'Garrapata del Ganado',
          scientificName: 'Rhipicephalus microplus',
          type: 'external',
          category: 'tick',
          description: 'Ectoparásito hematófago que afecta principalmente al ganado bovino',
          symptoms: ['Anemia', 'Pérdida de peso', 'Irritación de piel', 'Transmisión de enfermedades'],
          affectedOrgans: ['Piel', 'Sistema circulatorio'],
          transmissionMode: 'Contacto directo y ambiental',
          lifecycle: '21-63 días dependiendo de condiciones ambientales',
          seasonality: ['Primavera', 'Verano', 'Otoño'],
          riskLevel: 'high',
          prevalence: 75,
          economicImpact: 'high',
          zoonoticRisk: false
        },
        {
          id: '2',
          name: 'Lombriz Intestinal',
          scientificName: 'Haemonchus contortus',
          type: 'internal',
          category: 'nematode',
          description: 'Nematodo gastrointestinal hematófago que causa anemia severa',
          symptoms: ['Anemia severa', 'Diarrea', 'Pérdida de peso', 'Edema submandibular'],
          affectedOrgans: ['Abomaso', 'Sistema digestivo'],
          transmissionMode: 'Ingestión de larvas infectivas',
          lifecycle: '18-21 días',
          seasonality: ['Verano', 'Otoño'],
          riskLevel: 'critical',
          prevalence: 60,
          economicImpact: 'high',
          zoonoticRisk: false
        }
      ];

      // Datos de ejemplo para infestaciones
      const mockInfestations: ParasiteInfestation[] = [
        {
          id: '1',
          animalId: 'COW001',
          animalName: 'Bessie',
          animalTag: 'TAG-001',
          parasiteId: '1',
          parasiteName: 'Garrapata del Ganado',
          detectionDate: new Date('2025-07-08'),
          detectionMethod: 'clinical',
          severity: 'moderate',
          parasiteLoad: 'medium',
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: 'Pastizal Norte, Sector A',
            sector: 'A'
          },
          clinicalSigns: ['Presencia visible de garrapatas', 'Irritación de piel', 'Rascado excesivo'],
          veterinarian: 'Dr. García',
          treatment: {
            medicationId: 'MED001',
            medicationName: 'Fipronil Pour-On',
            startDate: new Date('2025-07-08'),
            endDate: new Date('2025-07-15'),
            dosage: '1ml/10kg',
            frequency: 'Aplicación única',
            route: 'Tópica',
            cost: 45.50
          },
          status: 'treating',
          followUpDate: new Date('2025-07-22'),
          notes: 'Aplicación tópica realizada. Monitorear efectividad en 14 días.'
        },
        {
          id: '2',
          animalId: 'COW002',
          animalName: 'Luna',
          animalTag: 'TAG-002',
          parasiteId: '2',
          parasiteName: 'Lombriz Intestinal',
          detectionDate: new Date('2025-07-05'),
          detectionMethod: 'laboratory',
          severity: 'severe',
          parasiteLoad: 'high',
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: 'Establo Principal, Sector B',
            sector: 'B'
          },
          clinicalSigns: ['Anemia severa', 'Mucosas pálidas', 'Pérdida de peso', 'Diarrea'],
          laboratoryResults: {
            eggCount: 1200,
            testMethod: 'Conteo de huevos por gramo (HPG)',
            testDate: new Date('2025-07-05')
          },
          veterinarian: 'Dr. Martínez',
          treatment: {
            medicationId: 'MED002',
            medicationName: 'Ivermectina + Albendazol',
            startDate: new Date('2025-07-06'),
            endDate: new Date('2025-07-13'),
            dosage: '200mcg/kg + 10mg/kg',
            frequency: 'Día 1 y día 7',
            route: 'Oral',
            cost: 28.75
          },
          status: 'treating',
          followUpDate: new Date('2025-07-20'),
          notes: 'Tratamiento dual para resistencia. Reevaluar carga parasitaria post-tratamiento.'
        }
      ];

      // Protocolos de tratamiento
      const mockProtocols: TreatmentProtocol[] = [
        {
          id: '1',
          name: 'Protocolo Estándar Garrapatas',
          parasiteTypes: ['Garrapata del Ganado', 'Garrapata de un huésped'],
          medications: [
            {
              medicationId: 'MED001',
              medicationName: 'Fipronil Pour-On',
              dosage: '1ml/10kg',
              frequency: 'Aplicación única',
              duration: '1 día',
              route: 'Tópica'
            }
          ],
          schedule: [
            {
              day: 1,
              actions: ['Aplicar Fipronil', 'Examinar nivel de infestación'],
              observations: ['Contabilizar garrapatas', 'Evaluar estado de piel']
            },
            {
              day: 14,
              actions: ['Evaluación de efectividad'],
              observations: ['Reducción de garrapatas', 'Mejora de piel']
            }
          ],
          withdrawalPeriod: 0,
          contraindications: ['Animales menores de 3 meses', 'Gestación temprana'],
          precautions: ['Evitar contacto con ojos', 'No aplicar en animales mojados'],
          expectedEffectiveness: 95,
          cost: 45.50,
          isStandard: true,
          createdBy: 'Dr. García',
          lastUpdated: new Date('2025-06-15')
        }
      ];

      // Estadísticas de ejemplo
      const mockStats: ParasiteStats = {
        totalInfestations: 47,
        activeInfestations: 12,
        resolvedInfestations: 32,
        criticalCases: 3,
        treatmentSuccessRate: 89.5,
        mostCommonParasite: 'Garrapata del Ganado',
        seasonalTrend: 'increasing',
        averageTreatmentDays: 14.5,
        totalTreatmentCost: 3245.80,
        affectedAnimals: 28,
        reinfectionRate: 8.2
      };

      // Alertas estacionales
      const mockAlerts: SeasonalAlert[] = [
        {
          id: '1',
          parasiteName: 'Garrapata del Ganado',
          season: 'Verano',
          riskLevel: 'high',
          expectedIncrease: 35,
          recommendedActions: [
            'Intensificar inspecciones semanales',
            'Aplicar tratamientos preventivos',
            'Mejorar manejo de pastizales'
          ],
          isActive: true
        },
        {
          id: '2',
          parasiteName: 'Mosca del Cuerno',
          season: 'Temporada de lluvias',
          riskLevel: 'medium',
          expectedIncrease: 25,
          recommendedActions: [
            'Usar orejeras repelentes',
            'Aplicar insecticidas tópicos',
            'Controlar charcos de agua'
          ],
          isActive: true
        }
      ];

      setParasites(mockParasites);
      setInfestations(mockInfestations);
      setProtocols(mockProtocols);
      setStats(mockStats);
      setSeasonalAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar infestaciones
  const filteredInfestations = infestations.filter(infestation => {
    const matchesSearch = infestation.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         infestation.parasiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         infestation.animalTag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedParasiteType === 'all' || 
                       parasites.find(p => p.id === infestation.parasiteId)?.type === selectedParasiteType;
    const matchesStatus = selectedStatus === 'all' || infestation.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'all' || infestation.severity === selectedSeverity;
    
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Control de Parásitos</h1>
              <p className="text-gray-600 mt-1">Monitoreo y tratamiento integral de parasitosis</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Programar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Caso
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas Estacionales */}
        {seasonalAlerts.filter(alert => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-white/80 backdrop-blur-md border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Alertas Estacionales
                </CardTitle>
                <CardDescription>
                  Riesgos parasitarios según la temporada actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seasonalAlerts.filter(alert => alert.isActive).map(alert => (
                    <SeasonalAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas del Control Parasitario */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bug className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Infestaciones</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Casos Activos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.treatmentSuccessRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Animales Afectados</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.affectedAnimals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reinfección</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.reinfectionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa de Infestaciones */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Mapa de Infestaciones Parasitarias
                </CardTitle>
                <CardDescription>
                  Distribución geográfica de casos activos y tratados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InfestationMap />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Control */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Selector de Vista */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Vista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={viewMode === 'infestations' ? 'default' : 'outline'}
                    onClick={() => setViewMode('infestations')}
                    className="justify-start"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Infestaciones
                  </Button>
                  <Button 
                    variant={viewMode === 'protocols' ? 'default' : 'outline'}
                    onClick={() => setViewMode('protocols')}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Protocolos
                  </Button>
                  <Button 
                    variant={viewMode === 'parasites' ? 'default' : 'outline'}
                    onClick={() => setViewMode('parasites')}
                    className="justify-start"
                  >
                    <Microscope className="w-4 h-4 mr-2" />
                    Catálogo de Parásitos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, parásito..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tipo de parásito */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedParasiteType}
                    onChange={(e) => setSelectedParasiteType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="internal">Internos</option>
                    <option value="external">Externos</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="treating">En tratamiento</option>
                    <option value="resolved">Resuelto</option>
                    <option value="chronic">Crónico</option>
                    <option value="reinfection">Reinfección</option>
                  </select>
                </div>

                {/* Severidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                  >
                    <option value="all">Todas las severidades</option>
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="severe">Severa</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Información del Parásito Más Común */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-purple-600" />
                  Parásito Predominante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{stats.mostCommonParasite}</h3>
                  <p className="text-gray-600">Parásito más detectado</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendencia estacional:</span>
                    <div className="flex items-center gap-1">
                      {stats.seasonalTrend === 'increasing' ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : stats.seasonalTrend === 'decreasing' ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={`font-medium ${
                        stats.seasonalTrend === 'increasing' ? 'text-red-600' :
                        stats.seasonalTrend === 'decreasing' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {stats.seasonalTrend === 'increasing' ? 'Aumentando' :
                         stats.seasonalTrend === 'decreasing' ? 'Disminuyendo' : 'Estable'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tratamiento promedio:</span>
                    <span className="font-medium">{stats.averageTreatmentDays} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo total tratamientos:</span>
                    <span className="font-medium">${stats.totalTreatmentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Casos críticos:</span>
                    <span className="font-medium text-red-600">{stats.criticalCases}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista Principal (Infestaciones/Protocolos/Parásitos) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                  <CardHeader>
                    <CardTitle>
                      {viewMode === 'infestations' ? `Infestaciones Parasitarias (${filteredInfestations.length})` :
                       viewMode === 'protocols' ? `Protocolos de Tratamiento (${protocols.length})` :
                       `Catálogo de Parásitos (${parasites.length})`}
                    </CardTitle>
                    <CardDescription>
                      {viewMode === 'infestations' ? 'Lista de casos de infestaciones parasitarias' :
                       viewMode === 'protocols' ? 'Protocolos estándar de tratamiento antiparasitario' :
                       'Información detallada de parásitos conocidos'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {viewMode === 'infestations' && filteredInfestations.map((infestation) => (
                        <motion.div
                          key={infestation.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {infestation.animalName} ({infestation.animalTag})
                                </h4>
                                <Badge variant={parasites.find(p => p.id === infestation.parasiteId)?.type || 'internal'}>
                                  {parasites.find(p => p.id === infestation.parasiteId)?.type === 'external' ? 'Externo' : 'Interno'}
                                </Badge>
                                <Badge variant={infestation.status}>
                                  {infestation.status === 'active' ? 'Activo' :
                                   infestation.status === 'treating' ? 'Tratando' :
                                   infestation.status === 'resolved' ? 'Resuelto' :
                                   infestation.status === 'chronic' ? 'Crónico' : 'Reinfección'}
                                </Badge>
                                <Badge variant={infestation.severity}>
                                  {infestation.severity === 'mild' ? 'Leve' :
                                   infestation.severity === 'moderate' ? 'Moderada' :
                                   infestation.severity === 'severe' ? 'Severa' : 'Crítica'}
                                </Badge>
                              </div>

                              <p className="text-lg text-gray-800 mb-3">
                                <strong>Parásito:</strong> {infestation.parasiteName}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-gray-600">Detección:</p>
                                  <p className="font-medium">{infestation.detectionDate.toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Método:</p>
                                  <p className="font-medium">
                                    {infestation.detectionMethod === 'clinical' ? 'Clínico' :
                                     infestation.detectionMethod === 'laboratory' ? 'Laboratorio' :
                                     infestation.detectionMethod === 'necropsy' ? 'Necropsia' : 'Observación'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Veterinario:</p>
                                  <p className="font-medium">{infestation.veterinarian}</p>
                                </div>
                              </div>

                              {infestation.laboratoryResults && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                  <h5 className="font-medium text-blue-900 mb-2">Resultados de Laboratorio</h5>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    {infestation.laboratoryResults.eggCount && (
                                      <div>
                                        <span className="text-blue-700">Conteo de huevos:</span>
                                        <span className="ml-1 font-medium">{infestation.laboratoryResults.eggCount} HPG</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-blue-700">Método:</span>
                                      <span className="ml-1 font-medium">{infestation.laboratoryResults.testMethod}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {infestation.treatment && (
                                <div className="bg-green-50 rounded-lg p-3 mb-3">
                                  <h5 className="font-medium text-green-900 mb-2">Tratamiento</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-green-700">Medicamento:</span>
                                      <span className="ml-1 font-medium">{infestation.treatment.medicationName}</span>
                                    </div>
                                    <div>
                                      <span className="text-green-700">Dosificación:</span>
                                      <span className="ml-1 font-medium">{infestation.treatment.dosage}</span>
                                    </div>
                                    <div>
                                      <span className="text-green-700">Frecuencia:</span>
                                      <span className="ml-1 font-medium">{infestation.treatment.frequency}</span>
                                    </div>
                                    <div>
                                      <span className="text-green-700">Costo:</span>
                                      <span className="ml-1 font-medium">${infestation.treatment.cost}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {infestation.clinicalSigns.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="font-medium text-gray-900 mb-2">Signos Clínicos</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {infestation.clinicalSigns.map((sign, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                        {sign}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="text-sm text-gray-600">
                                <p><strong>Ubicación:</strong> {infestation.location.address}</p>
                                {infestation.notes && <p><strong>Notas:</strong> {infestation.notes}</p>}
                                {infestation.followUpDate && (
                                  <p><strong>Próximo seguimiento:</strong> {infestation.followUpDate.toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {viewMode === 'protocols' && protocols.map((protocol) => (
                        <motion.div
                          key={protocol.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{protocol.name}</h4>
                                {protocol.isStandard && (
                                  <Badge variant="success">Estándar</Badge>
                                )}
                                <Badge variant="low">
                                  Efectividad: {protocol.expectedEffectiveness}%
                                </Badge>
                              </div>

                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-2">Parásitos objetivo</h5>
                                <div className="flex flex-wrap gap-1">
                                  {protocol.parasiteTypes.map((type, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-2">Medicamentos</h5>
                                <div className="space-y-2">
                                  {protocol.medications.map((med, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                                      <p><strong>{med.medicationName}</strong></p>
                                      <p>Dosis: {med.dosage} | Frecuencia: {med.frequency} | Duración: {med.duration}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Período de retiro:</p>
                                  <p className="font-medium">{protocol.withdrawalPeriod} días</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Costo estimado:</p>
                                  <p className="font-medium">${protocol.cost}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Creado por:</p>
                                  <p className="font-medium">{protocol.createdBy}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {viewMode === 'parasites' && parasites.map((parasite) => (
                        <motion.div
                          key={parasite.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{parasite.name}</h4>
                                <Badge variant={parasite.type}>
                                  {parasite.type === 'external' ? 'Externo' : 'Interno'}
                                </Badge>
                                <Badge variant={parasite.riskLevel}>
                                  Riesgo {parasite.riskLevel === 'critical' ? 'Crítico' :
                                  parasite.riskLevel === 'high' ? 'Alto' :
                                  parasite.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                                </Badge>
                                {parasite.zoonoticRisk && (
                                  <Badge variant="critical">Zoonótico</Badge>
                                )}
                              </div>

                              <p className="text-gray-600 italic mb-2">{parasite.scientificName}</p>
                              <p className="text-gray-700 mb-3">{parasite.description}</p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-gray-600">Prevalencia:</p>
                                  <p className="font-medium">{parasite.prevalence}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Impacto económico:</p>
                                  <p className="font-medium">
                                    {parasite.economicImpact === 'high' ? 'Alto' :
                                     parasite.economicImpact === 'medium' ? 'Medio' : 'Bajo'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Ciclo de vida:</p>
                                  <p className="font-medium">{parasite.lifecycle}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Transmisión:</p>
                                  <p className="font-medium">{parasite.transmissionMode}</p>
                                </div>
                              </div>

                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-2">Síntomas</h5>
                                <div className="flex flex-wrap gap-1">
                                  {parasite.symptoms.map((symptom, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      {symptom}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-2">Órganos afectados</h5>
                                <div className="flex flex-wrap gap-1">
                                  {parasite.affectedOrgans.map((organ, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {organ}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Estacionalidad</h5>
                                <div className="flex flex-wrap gap-1">
                                  {parasite.seasonality.map((season, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      {season}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Pill className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ParasiteParatrol;