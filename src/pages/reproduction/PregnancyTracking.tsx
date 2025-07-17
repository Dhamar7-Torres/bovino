import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Calendar, MapPin, Beef, User, Baby, Clock, AlertCircle, Plus, Search, Edit, Trash2, Eye, X, Save, Heart, Activity, Scale, Stethoscope } from 'lucide-react';

// Función utility para clases CSS
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Tipos locales para seguimiento de gestación
interface Coordinates {
  lat: number;
  lng: number;
}

// Interfaces específicas para el CRUD de Seguimiento de Gestación
interface PregnancyTrackingProps {
  className?: string;
}

interface PregnancyRecord {
  id: string;
  
  // Información básica de la gestación
  pregnancy: {
    animalId: string;
    animalTag: string;
    animalName: string;
    breed: string;
    age: number;
    parity: number; // número de partos previos
    
    // Detalles de la concepción
    conceptionDate: Date;
    conceptionMethod: 'artificial_insemination' | 'natural_mating';
    serviceId: string; // ID del registro de IA o apareamiento
    
    // Fechas importantes
    confirmationDate: Date;
    estimatedCalvingDate: Date;
    actualCalvingDate?: Date;
    
    // Estado actual
    currentStatus: 'early_pregnancy' | 'mid_pregnancy' | 'late_pregnancy' | 'pre_calving' | 'calved' | 'aborted';
    gestationDay: number;
    gestationWeek: number;
  };
  
  // Información del padre
  sire: {
    id: string;
    name: string;
    breed: string;
    registrationNumber?: string;
  };
  
  // Exámenes y chequeos veterinarios
  examinations: PregnancyExamination[];
  
  // Seguimiento de condición corporal
  bodyCondition: BodyConditionRecord[];
  
  // Manejo nutricional
  nutrition: NutritionManagement;
  
  // Ubicación y manejo
  management: {
    currentLocation: {
      lat: number;
      lng: number;
      address: string;
      sector: string;
      potrero: string;
      paddock: string;
    };
    housingType: string;
    specialCare: string[];
    exerciseProgram: string;
    socialGrouping: string;
  };
  
  // Preparativos para el parto
  calvingPreparation: {
    facilities: any;
    calvingArea: {
      lat: number;
      lng: number;
      address: string;
      facilities: string[];
    };
    equipmentReady: boolean;
    veterinarianOnCall: string;
    assistantAssigned: string;
    emergencyPlan: string;
    signalSigns: string[];
  };
  
  // Complicaciones y observaciones
  complications: PregnancyComplication[];
  
  // Observaciones diarias
  dailyObservations: DailyObservation[];
  
  // Costos y economía
  economics: {
    veterinaryCosts: number;
    nutritionCosts: number;
    facilityUsage: number;
    specialCareCosts: number;
    totalInvestment: number;
    expectedValue: number; // valor esperado del ternero
  };
  
  // Predicciones y análisis
  predictions: {
    calvingDifficulty: 'easy' | 'moderate' | 'difficult';
    calfWeight: number; // peso estimado del ternero
    calfSex?: 'male' | 'female';
    maternalHealth: 'excellent' | 'good' | 'fair' | 'poor';
    lactationPotential: number; // 1-10
  };
  
  // Metadatos
  notes: string;
  assignedVeterinarian: string;
  assignedCaretaker: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface PregnancyExamination {
  id: string;
  date: Date;
  gestationDay: number;
  examinationType: 'ultrasound' | 'palpation' | 'blood_test' | 'routine_checkup';
  veterinarian: string;
  location: Coordinates & { address: string };
  
  findings: {
    fetalViability: boolean;
    fetalHeartRate?: number;
    fetalMovement: 'active' | 'normal' | 'reduced' | 'absent';
    fetalSize: 'small' | 'normal' | 'large';
    amnioticFluid: 'normal' | 'oligohydramnios' | 'polyhydramnios';
    placentalHealth: 'normal' | 'abnormal';
  };
  
  measurements: {
    crownRumpLength?: number; // mm
    biparietal?: number; // mm
    abdominalCircumference?: number; // mm
    estimatedWeight?: number; // kg
  };
  
  maternalAssessment: {
    bodyConditionScore: number; // 1-5
    weight: number;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    rumenFill: number; // 1-5
  };
  
  recommendations: string[];
  nextCheckDate: Date;
  cost: number;
  images?: string[]; // URLs de ultrasonidos
}

interface BodyConditionRecord {
  date: Date;
  score: number; // 1-5 (1=muy delgada, 5=muy gorda)
  weight: number; // kg
  backFat?: number; // mm
  muscleScore?: number; // 1-5
  evaluator: string;
  location: string;
  notes: string;
}

interface NutritionManagement {
  currentDiet: {
    energyRequirement: number; // Mcal/día
    proteinRequirement: number; // kg/día
    feedIntake: number; // kg/día
    supplementation: string[];
    waterIntake: number; // litros/día
  };
  
  feedingSchedule: {
    timesPerDay: number;
    portions: number[];
    feedTypes: string[];
    specialIngredients: string[];
  };
  
  nutritionalGoals: {
    targetWeight: number;
    targetBCS: number;
    calvingWeight: number;
  };
  
  adjustments: {
    date: Date;
    reason: string;
    changes: string[];
    expectedResults: string[];
  }[];
}

interface PregnancyComplication {
  id: string;
  date: Date;
  type: 'abortion_risk' | 'metabolic_disorder' | 'infectious_disease' | 'physical_trauma' | 'nutritional_deficiency' | 'stress' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description: string;
  symptoms: string[];
  treatment: string[];
  veterinarian: string;
  resolution: 'resolved' | 'monitoring' | 'ongoing' | 'worsened';
  cost: number;
}

interface DailyObservation {
  date: Date;
  observer: string;
  
  behavior: {
    appetite: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
    activity: 'very_active' | 'active' | 'normal' | 'lethargic' | 'inactive';
    socialInteraction: 'normal' | 'isolated' | 'aggressive' | 'submissive';
    restingPattern: 'normal' | 'restless' | 'excessive_lying' | 'discomfort';
  };
  
  physicalSigns: {
    udderDevelopment: 'none' | 'early' | 'moderate' | 'advanced' | 'full';
    vulvaChanges: 'none' | 'slight' | 'moderate' | 'pronounced';
    discharge: 'none' | 'clear' | 'mucoid' | 'bloody' | 'abnormal';
    bodyTemperature?: number;
  };
  
  calvingPreparation: {
    nestingBehavior: boolean;
    isolationSeeking: boolean;
    restlessness: boolean;
    lossOfAppetite: boolean;
    udderFilling: boolean;
    cervicalChanges: boolean;
  };
  
  concerns: string[];
  location: string;
}

interface FilterOptions {
  status: string;
  veterinarian: string;
  sector: string;
  gestationStage: string;
  riskLevel: string;
}

interface FormData {
  animalId?: string;
  conceptionDate?: string;
  conceptionMethod?: string;
  veterinarian?: string;
  caretaker?: string;
  notes?: string;
}

// Componente principal del CRUD de Seguimiento de Gestación
export const PregnancyTracking: React.FC<PregnancyTrackingProps> = ({ 
  className 
}) => {
  // Estados del componente
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PregnancyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PregnancyRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    veterinarian: 'all',
    sector: 'all',
    gestationStage: 'all',
    riskLevel: 'all'
  });

  // Estados para formulario de creación/edición
  const [formData, setFormData] = useState<FormData>({});

  // Datos de ejemplo para registros de seguimiento de gestación
  const mockRecords: PregnancyRecord[] = [
    {
      id: 'PG-001',
      pregnancy: {
        animalId: 'COW-F-156',
        animalTag: 'F-TAG-0156',
        animalName: 'Esperanza',
        breed: 'Holstein',
        age: 4,
        parity: 2,
        conceptionDate: new Date('2025-05-15'),
        conceptionMethod: 'artificial_insemination',
        serviceId: 'IA-001',
        confirmationDate: new Date('2025-06-12'),
        estimatedCalvingDate: new Date('2026-02-22'),
        currentStatus: 'mid_pregnancy',
        gestationDay: 135,
        gestationWeek: 19
      },
      sire: {
        id: 'BULL-001',
        name: 'Elite Champion 2024',
        breed: 'Holstein',
        registrationNumber: 'REG-2024-001'
      },
      examinations: [
        {
          id: 'EXAM-001',
          date: new Date('2025-07-10'),
          gestationDay: 90,
          examinationType: 'ultrasound',
          veterinarian: 'Dr. María González',
          location: {
            lat: 17.0732,
            lng: -93.1451,
            address: 'Clínica Veterinaria Móvil'
          },
          findings: {
            fetalViability: true,
            fetalHeartRate: 180,
            fetalMovement: 'active',
            fetalSize: 'normal',
            amnioticFluid: 'normal',
            placentalHealth: 'normal'
          },
          measurements: {
            crownRumpLength: 85,
            biparietal: 45,
            estimatedWeight: 8.5
          },
          maternalAssessment: {
            bodyConditionScore: 3.5,
            weight: 465,
            temperature: 38.8,
            heartRate: 72,
            respiratoryRate: 28,
            rumenFill: 4
          },
          recommendations: [
            'Continuar con dieta actual',
            'Próximo chequeo en 4 semanas',
            'Monitorear actividad fetal'
          ],
          nextCheckDate: new Date('2025-08-07'),
          cost: 350
        }
      ],
      bodyCondition: [
        {
          date: new Date('2025-07-15'),
          score: 3.5,
          weight: 465,
          backFat: 8,
          muscleScore: 3,
          evaluator: 'Carlos Mendoza',
          location: 'Potrero Norte',
          notes: 'Condición corporal óptima para esta etapa'
        }
      ],
      nutrition: {
        currentDiet: {
          energyRequirement: 28.5,
          proteinRequirement: 1.8,
          feedIntake: 18.5,
          supplementation: ['Calcio', 'Fósforo', 'Vitamina E'],
          waterIntake: 85
        },
        feedingSchedule: {
          timesPerDay: 3,
          portions: [6, 7, 5.5],
          feedTypes: ['Heno de alfalfa', 'Concentrado gestación', 'Pasto'],
          specialIngredients: ['Melaza', 'Sales minerales']
        },
        nutritionalGoals: {
          targetWeight: 485,
          targetBCS: 3.5,
          calvingWeight: 510
        },
        adjustments: [
          {
            date: new Date('2025-07-01'),
            reason: 'Incremento requerimientos nutricionales',
            changes: ['Aumento concentrado 0.5kg/día'],
            expectedResults: ['Mejor desarrollo fetal', 'Mantenimiento BCS']
          }
        ]
      },
      management: {
        currentLocation: {
          lat: 17.0732,
          lng: -93.1451,
          address: 'Potrero Norte, Paddock A1',
          sector: 'Norte',
          potrero: 'San José',
          paddock: 'A1'
        },
        housingType: 'Pastoreo con refugio',
        specialCare: ['Monitoreo diario', 'Suplementación mineral'],
        exerciseProgram: 'Pastoreo libre controlado',
        socialGrouping: 'Grupo gestantes'
      },
      calvingPreparation: {
        calvingArea: {
          lat: 17.0745,
          lng: -93.1465,
          address: 'Área de Partos - Sector Norte',
          facilities: ['Box individual', 'Iluminación', 'Agua corriente', 'Cámaras']
        },
        equipmentReady: true,
        veterinarianOnCall: 'Dr. María González',
        assistantAssigned: 'Carlos Mendoza',
        emergencyPlan: 'Protocolo A - Parto asistido',
        signalSigns: [
          'Desarrollo udder',
          'Relajación ligamentos',
          'Cambios vulva',
          'Comportamiento nesting'
        ],
        facilities: undefined
      },
      complications: [],
      dailyObservations: [
        {
          date: new Date('2025-07-16'),
          observer: 'Juan Pérez',
          behavior: {
            appetite: 'excellent',
            activity: 'normal',
            socialInteraction: 'normal',
            restingPattern: 'normal'
          },
          physicalSigns: {
            udderDevelopment: 'moderate',
            vulvaChanges: 'slight',
            discharge: 'none'
          },
          calvingPreparation: {
            nestingBehavior: false,
            isolationSeeking: false,
            restlessness: false,
            lossOfAppetite: false,
            udderFilling: false,
            cervicalChanges: false
          },
          concerns: [],
          location: 'Potrero Norte'
        }
      ],
      economics: {
        veterinaryCosts: 1250,
        nutritionCosts: 2800,
        facilityUsage: 450,
        specialCareCosts: 300,
        totalInvestment: 4800,
        expectedValue: 35000
      },
      predictions: {
        calvingDifficulty: 'easy',
        calfWeight: 42,
        maternalHealth: 'excellent',
        lactationPotential: 9
      },
      notes: 'Gestación progresando excelentemente. Animal en condiciones óptimas.',
      assignedVeterinarian: 'Dr. María González',
      assignedCaretaker: 'Carlos Mendoza',
      createdAt: new Date('2025-06-12'),
      updatedAt: new Date('2025-07-16'),
      createdBy: 'Dr. María González'
    },
    {
      id: 'PG-002',
      pregnancy: {
        animalId: 'COW-F-203',
        animalTag: 'F-TAG-0203',
        animalName: 'Paloma',
        breed: 'Charolais',
        age: 5,
        parity: 3,
        conceptionDate: new Date('2025-04-20'),
        conceptionMethod: 'natural_mating',
        serviceId: 'MT-003',
        confirmationDate: new Date('2025-05-18'),
        estimatedCalvingDate: new Date('2026-01-28'),
        currentStatus: 'late_pregnancy',
        gestationDay: 175,
        gestationWeek: 25
      },
      sire: {
        id: 'BULL-003',
        name: 'Golden King',
        breed: 'Charolais',
        registrationNumber: 'REG-2024-003'
      },
      examinations: [
        {
          id: 'EXAM-002',
          date: new Date('2025-07-12'),
          gestationDay: 170,
          examinationType: 'routine_checkup',
          veterinarian: 'Dr. Pedro Martínez',
          location: {
            lat: 17.0698,
            lng: -93.1389,
            address: 'Potrero Este'
          },
          findings: {
            fetalViability: true,
            fetalHeartRate: 165,
            fetalMovement: 'active',
            fetalSize: 'large',
            amnioticFluid: 'normal',
            placentalHealth: 'normal'
          },
          measurements: {
            estimatedWeight: 25
          },
          maternalAssessment: {
            bodyConditionScore: 4.0,
            weight: 540,
            temperature: 38.9,
            heartRate: 68,
            respiratoryRate: 30,
            rumenFill: 3
          },
          recommendations: [
            'Reducir concentrado',
            'Incrementar fibra',
            'Preparar área de parto',
            'Monitoreo diario'
          ],
          nextCheckDate: new Date('2025-08-09'),
          cost: 280
        }
      ],
      bodyCondition: [
        {
          date: new Date('2025-07-12'),
          score: 4.0,
          weight: 540,
          backFat: 12,
          muscleScore: 4,
          evaluator: 'Miguel Rodríguez',
          location: 'Potrero Este',
          notes: 'BCS ligeramente alto, ajustar dieta'
        }
      ],
      nutrition: {
        currentDiet: {
          energyRequirement: 32.5,
          proteinRequirement: 2.1,
          feedIntake: 16.8,
          supplementation: ['Calcio', 'Magnesio', 'Vitamina D'],
          waterIntake: 95
        },
        feedingSchedule: {
          timesPerDay: 4,
          portions: [4, 4.5, 4, 4.3],
          feedTypes: ['Heno de pasto', 'Concentrado reducido', 'Forraje verde'],
          specialIngredients: ['Bicarbonato de sodio']
        },
        nutritionalGoals: {
          targetWeight: 545,
          targetBCS: 3.5,
          calvingWeight: 550
        },
        adjustments: [
          {
            date: new Date('2025-07-12'),
            reason: 'BCS alto - riesgo distocia',
            changes: ['Reducir concentrado 1kg/día', 'Incrementar ejercicio'],
            expectedResults: ['Reducción BCS a 3.5', 'Parto más fácil']
          }
        ]
      },
      management: {
        currentLocation: {
          lat: 17.0698,
          lng: -93.1389,
          address: 'Potrero Este, Paddock C3',
          sector: 'Este',
          potrero: 'El Roble',
          paddock: 'C3'
        },
        housingType: 'Confinamiento parcial',
        specialCare: ['Ejercicio controlado', 'Monitoreo peso'],
        exerciseProgram: 'Caminate 2km diarios',
        socialGrouping: 'Grupo preparto'
      },
      calvingPreparation: {
        calvingArea: {
          lat: 17.0710,
          lng: -93.1395,
          address: 'Área de Partos - Sector Este',
          facilities: ['Box amplio', 'Equipo asistencia', 'Calefacción']
        },
        equipmentReady: true,
        veterinarianOnCall: 'Dr. Pedro Martínez',
        assistantAssigned: 'Miguel Rodríguez',
        emergencyPlan: 'Protocolo B - Cesárea disponible',
        signalSigns: [
          'Ternero grande esperado',
          'Primera señal: llamar veterinario',
          'Equipo cesárea listo'
        ],
        facilities: undefined
      },
      complications: [
        {
          id: 'COMP-001',
          date: new Date('2025-07-12'),
          type: 'other',
          severity: 'mild',
          description: 'BCS elevado - riesgo distocia',
          symptoms: ['Sobrepeso', 'Reducida movilidad'],
          treatment: ['Ajuste dietético', 'Ejercicio controlado'],
          veterinarian: 'Dr. Pedro Martínez',
          resolution: 'monitoring',
          cost: 150
        }
      ],
      dailyObservations: [
        {
          date: new Date('2025-07-16'),
          observer: 'Miguel Rodríguez',
          behavior: {
            appetite: 'good',
            activity: 'normal',
            socialInteraction: 'normal',
            restingPattern: 'normal'
          },
          physicalSigns: {
            udderDevelopment: 'advanced',
            vulvaChanges: 'moderate',
            discharge: 'clear'
          },
          calvingPreparation: {
            nestingBehavior: false,
            isolationSeeking: false,
            restlessness: false,
            lossOfAppetite: false,
            udderFilling: true,
            cervicalChanges: false
          },
          concerns: ['BCS aún alto'],
          location: 'Potrero Este'
        }
      ],
      economics: {
        veterinaryCosts: 1580,
        nutritionCosts: 3200,
        facilityUsage: 600,
        specialCareCosts: 450,
        totalInvestment: 5830,
        expectedValue: 45000
      },
      predictions: {
        calvingDifficulty: 'moderate',
        calfWeight: 48,
        maternalHealth: 'good',
        lactationPotential: 8
      },
      notes: 'Gestación avanzada. Ternero grande esperado. Monitorear BCS y preparar asistencia al parto.',
      assignedVeterinarian: 'Dr. Pedro Martínez',
      assignedCaretaker: 'Miguel Rodríguez',
      createdAt: new Date('2025-05-18'),
      updatedAt: new Date('2025-07-16'),
      createdBy: 'Dr. Pedro Martínez'
    }
  ];

  // Efectos del componente
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setRecords(mockRecords);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Variantes de animación para Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  // Funciones CRUD
  const handleCreate = () => {
    setFormData({});
    setEditingRecord(null);
    setShowCreateModal(true);
  };

  const handleEdit = (record: PregnancyRecord) => {
    setEditingRecord(record);
    setFormData({
      animalId: record.pregnancy.animalId,
      conceptionDate: record.pregnancy.conceptionDate.toISOString().split('T')[0],
      conceptionMethod: record.pregnancy.conceptionMethod,
      veterinarian: record.assignedVeterinarian,
      caretaker: record.assignedCaretaker,
      notes: record.notes
    });
    setShowEditModal(true);
  };

  const handleView = (record: PregnancyRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de seguimiento de gestación?')) {
      setRecords(records.filter(record => record.id !== recordId));
    }
  };

  const handleSave = () => {
    if (editingRecord) {
      // Actualizar registro existente
      const updatedRecord = {
        ...editingRecord,
        notes: formData.notes || editingRecord.notes,
        assignedVeterinarian: formData.veterinarian || editingRecord.assignedVeterinarian,
        assignedCaretaker: formData.caretaker || editingRecord.assignedCaretaker,
        updatedAt: new Date()
      };
      
      setRecords(records.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      ));
      setShowEditModal(false);
    } else {
      // Crear nuevo registro - simplificado para demostración
      const newRecord: PregnancyRecord = {
        id: `PG-${Date.now()}`,
        pregnancy: {
          animalId: formData.animalId || 'COW-NEW',
          animalTag: 'NEW-TAG',
          animalName: 'Nueva Gestante',
          breed: 'Holstein',
          age: 4,
          parity: 1,
          conceptionDate: new Date(formData.conceptionDate || new Date()),
          conceptionMethod: (formData.conceptionMethod as any) || 'artificial_insemination',
          serviceId: 'SRV-NEW',
          confirmationDate: new Date(),
          estimatedCalvingDate: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000), // +280 días
          currentStatus: 'early_pregnancy',
          gestationDay: 30,
          gestationWeek: 4
        },
        sire: {
          id: 'BULL-NEW',
          name: 'Toro Nuevo',
          breed: 'Holstein'
        },
        examinations: [],
        bodyCondition: [],
        nutrition: {
          currentDiet: {
            energyRequirement: 25,
            proteinRequirement: 1.5,
            feedIntake: 16,
            supplementation: [],
            waterIntake: 70
          },
          feedingSchedule: {
            timesPerDay: 2,
            portions: [8, 8],
            feedTypes: ['Pasto', 'Concentrado'],
            specialIngredients: []
          },
          nutritionalGoals: {
            targetWeight: 450,
            targetBCS: 3.5,
            calvingWeight: 480
          },
          adjustments: []
        },
        management: {
          currentLocation: {
            lat: 17.0732,
            lng: -93.1451,
            address: 'Nueva ubicación',
            sector: 'Norte',
            potrero: 'Nuevo',
            paddock: 'A1'
          },
          housingType: 'Pastoreo',
          specialCare: [],
          exerciseProgram: 'Libre',
          socialGrouping: 'General'
        },
        calvingPreparation: {
          calvingArea: {
            lat: 17.0732,
            lng: -93.1451,
            address: 'Área de partos',
            facilities: []
          },
          equipmentReady: false,
          veterinarianOnCall: formData.veterinarian || 'Por asignar',
          assistantAssigned: formData.caretaker || 'Por asignar',
          emergencyPlan: 'Por definir',
          signalSigns: [],
          facilities: undefined
        },
        complications: [],
        dailyObservations: [],
        economics: {
          veterinaryCosts: 0,
          nutritionCosts: 0,
          facilityUsage: 0,
          specialCareCosts: 0,
          totalInvestment: 0,
          expectedValue: 25000
        },
        predictions: {
          calvingDifficulty: 'easy',
          calfWeight: 38,
          maternalHealth: 'good',
          lactationPotential: 7
        },
        notes: formData.notes || 'Nuevo seguimiento de gestación',
        assignedVeterinarian: formData.veterinarian || 'Por asignar',
        assignedCaretaker: formData.caretaker || 'Por asignar',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'Usuario'
      };
      
      setRecords([newRecord, ...records]);
      setShowCreateModal(false);
    }
    
    setFormData({});
    setEditingRecord(null);
  };

  // Función para filtrar registros
  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.pregnancy.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.pregnancy.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.assignedVeterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.assignedCaretaker.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || record.pregnancy.currentStatus === filters.status;
      const matchesVeterinarian = filters.veterinarian === 'all' || record.assignedVeterinarian === filters.veterinarian;
      const matchesSector = filters.sector === 'all' || record.management.currentLocation.sector === filters.sector;
      
      let matchesGestationStage = true;
      if (filters.gestationStage !== 'all') {
        const week = record.pregnancy.gestationWeek;
        switch (filters.gestationStage) {
          case 'first_trimester':
            matchesGestationStage = week <= 12;
            break;
          case 'second_trimester':
            matchesGestationStage = week > 12 && week <= 24;
            break;
          case 'third_trimester':
            matchesGestationStage = week > 24;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesVeterinarian && matchesSector && matchesGestationStage;
    });
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'early_pregnancy': return 'bg-blue-100 text-blue-800';
      case 'mid_pregnancy': return 'bg-green-100 text-green-800';
      case 'late_pregnancy': return 'bg-yellow-100 text-yellow-800';
      case 'pre_calving': return 'bg-orange-100 text-orange-800';
      case 'calved': return 'bg-purple-100 text-purple-800';
      case 'aborted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'early_pregnancy': return 'Gestación Temprana';
      case 'mid_pregnancy': return 'Gestación Media';
      case 'late_pregnancy': return 'Gestación Tardía';
      case 'pre_calving': return 'Pre-Parto';
      case 'calved': return 'Parida';
      case 'aborted': return 'Aborto';
      default: return 'Sin Estado';
    }
  };

  // Función para calcular días restantes para el parto
  const getDaysToCalving = (estimatedDate: Date) => {
    const today = new Date();
    const diffTime = estimatedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Componente de loading con spinner
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
      />
    </div>
  );

  // Componente para tarjeta de registro
  const RecordCard: React.FC<{ record: PregnancyRecord }> = ({ record }) => {
    const daysToCalving = getDaysToCalving(record.pregnancy.estimatedCalvingDate);
    const lastExam = record.examinations[record.examinations.length - 1];

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{record.pregnancy.animalName}</h3>
              <p className="text-sm text-gray-600">{record.pregnancy.animalTag} • {record.pregnancy.breed}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.pregnancy.currentStatus)}`}>
              {getStatusText(record.pregnancy.currentStatus)}
            </span>
            <button
              onClick={() => handleView(record)}
              className="p-2 text-gray-600 hover:text-[#519a7c] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(record)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(record.id)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">
              Día {record.pregnancy.gestationDay}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">
              {daysToCalving > 0 ? `${daysToCalving} días` : 'Vencida'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.management.currentLocation.sector}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.assignedCaretaker}</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Semana gestación:</span>
            <span className="text-sm font-medium text-gray-800">{record.pregnancy.gestationWeek}</span>
          </div>
          {lastExam && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Último examen:</span>
              <span className="text-sm font-medium text-gray-800">
                {lastExam.date.toLocaleDateString('es-MX')}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Dificultad esperada:</span>
            <span className={`text-sm font-medium ${
              record.predictions.calvingDifficulty === 'easy' ? 'text-green-600' :
              record.predictions.calvingDifficulty === 'moderate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {record.predictions.calvingDifficulty === 'easy' ? 'Fácil' :
               record.predictions.calvingDifficulty === 'moderate' ? 'Moderado' : 'Difícil'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Inversión total:</span>
            <span className="text-sm font-bold text-[#519a7c]">{formatCurrency(record.economics.totalInvestment)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Modal para crear/editar registros
  const FormModal: React.FC<{ isEdit: boolean }> = ({ isEdit }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isEdit ? 'Editar Seguimiento de Gestación' : 'Nuevo Seguimiento de Gestación'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Animal
                  </label>
                  <input
                    type="text"
                    value={formData.animalId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="COW-F-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Concepción
                  </label>
                  <input
                    type="date"
                    value={formData.conceptionDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, conceptionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Concepción
                </label>
                <select
                  value={formData.conceptionMethod || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, conceptionMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Seleccionar método</option>
                  <option value="artificial_insemination">Inseminación Artificial</option>
                  <option value="natural_mating">Monta Natural</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinario Asignado
                  </label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="Dr. Nombre Apellido"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuidador Asignado
                  </label>
                  <input
                    type="text"
                    value={formData.caretaker || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, caretaker: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="Nombre del cuidador"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Observaciones sobre la gestación..."
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isEdit ? 'Actualizar' : 'Guardar'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Modal para ver detalles completos
  const ViewModal: React.FC = () => {
    if (!selectedRecord) return null;

    const daysToCalving = getDaysToCalving(selectedRecord.pregnancy.estimatedCalvingDate);
    const lastExam = selectedRecord.examinations[selectedRecord.examinations.length - 1];
    const lastBodyCondition = selectedRecord.bodyCondition[selectedRecord.bodyCondition.length - 1];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Seguimiento de Gestación
                    </h2>
                    <p className="text-gray-600">{selectedRecord.pregnancy.animalName} - ID: {selectedRecord.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Información principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Información de la gestación */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Baby className="w-5 h-5 mr-2 text-blue-600" />
                    Estado de Gestación
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-medium">{getStatusText(selectedRecord.pregnancy.currentStatus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Día gestación:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.gestationDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Semana:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.gestationWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parto estimado:</span>
                      <span className="font-medium">
                        {selectedRecord.pregnancy.estimatedCalvingDate.toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Días restantes:</span>
                      <span className={`font-medium ${daysToCalving <= 14 ? 'text-red-600' : daysToCalving <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {daysToCalving > 0 ? daysToCalving : 'Vencida'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partos previos:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.parity}</span>
                    </div>
                  </div>
                </div>

                {/* Información del animal */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Beef className="w-5 h-5 mr-2 text-green-600" />
                    Información del Animal
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.animalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Etiqueta:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.animalTag}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">{selectedRecord.pregnancy.age} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método concepción:</span>
                      <span className="font-medium">
                        {selectedRecord.pregnancy.conceptionMethod === 'artificial_insemination' ? 'IA' : 'Monta Natural'}
                      </span>
                    </div>
                    {lastBodyCondition && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">BCS actual:</span>
                        <span className="font-medium">{lastBodyCondition.score}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del padre */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-yellow-600" />
                    Información del Padre
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedRecord.sire.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.sire.breed}</span>
                    </div>
                    {selectedRecord.sire.registrationNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registro:</span>
                        <span className="font-medium">{selectedRecord.sire.registrationNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dificultad esperada:</span>
                      <span className={`font-medium ${
                        selectedRecord.predictions.calvingDifficulty === 'easy' ? 'text-green-600' :
                        selectedRecord.predictions.calvingDifficulty === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedRecord.predictions.calvingDifficulty === 'easy' ? 'Fácil' :
                         selectedRecord.predictions.calvingDifficulty === 'moderate' ? 'Moderado' : 'Difícil'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso estimado ternero:</span>
                      <span className="font-medium">{selectedRecord.predictions.calfWeight} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Último examen */}
              {lastExam && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Último Examen Veterinario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{lastExam.date.toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {lastExam.examinationType === 'ultrasound' ? 'Ultrasonido' :
                           lastExam.examinationType === 'palpation' ? 'Palpación' :
                           lastExam.examinationType === 'blood_test' ? 'Análisis sangre' : 'Chequeo rutina'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Veterinario:</span>
                        <span className="font-medium">{lastExam.veterinarian}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Viabilidad fetal:</span>
                        <span className={`font-medium ${lastExam.findings.fetalViability ? 'text-green-600' : 'text-red-600'}`}>
                          {lastExam.findings.fetalViability ? 'Viable' : 'No viable'}
                        </span>
                      </div>
                      {lastExam.findings.fetalHeartRate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">FC fetal:</span>
                          <span className="font-medium">{lastExam.findings.fetalHeartRate} lpm</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Movimiento:</span>
                        <span className="font-medium">{lastExam.findings.fetalMovement}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">BCS:</span>
                        <span className="font-medium">{lastExam.maternalAssessment.bodyConditionScore}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peso:</span>
                        <span className="font-medium">{lastExam.maternalAssessment.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperatura:</span>
                        <span className="font-medium">{lastExam.maternalAssessment.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                  {lastExam.recommendations.length > 0 && (
                    <div className="mt-4">
                      <span className="text-gray-600 font-medium">Recomendaciones:</span>
                      <ul className="mt-2 space-y-1">
                        {lastExam.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 ml-4">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Manejo actual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Ubicación y manejo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Ubicación y Manejo
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector:</span>
                      <span className="font-medium">{selectedRecord.management.currentLocation.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potrero:</span>
                      <span className="font-medium">{selectedRecord.management.currentLocation.potrero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paddock:</span>
                      <span className="font-medium">{selectedRecord.management.currentLocation.paddock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alojamiento:</span>
                      <span className="font-medium">{selectedRecord.management.housingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ejercicio:</span>
                      <span className="font-medium">{selectedRecord.management.exerciseProgram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agrupamiento:</span>
                      <span className="font-medium">{selectedRecord.management.socialGrouping}</span>
                    </div>
                  </div>
                </div>

                {/* Nutrición */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Manejo Nutricional
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energía req.:</span>
                      <span className="font-medium">{selectedRecord.nutrition.currentDiet.energyRequirement} Mcal/día</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proteína req.:</span>
                      <span className="font-medium">{selectedRecord.nutrition.currentDiet.proteinRequirement} kg/día</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingesta total:</span>
                      <span className="font-medium">{selectedRecord.nutrition.currentDiet.feedIntake} kg/día</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agua:</span>
                      <span className="font-medium">{selectedRecord.nutrition.currentDiet.waterIntake} L/día</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BCS objetivo:</span>
                      <span className="font-medium">{selectedRecord.nutrition.nutritionalGoals.targetBCS}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso al parto:</span>
                      <span className="font-medium">{selectedRecord.nutrition.nutritionalGoals.calvingWeight} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preparativos para el parto */}
              <div className="mb-6 bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-orange-600" />
                  Preparativos para el Parto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Área de parto:</span>
                      <span className="font-medium">{selectedRecord.calvingPreparation.calvingArea.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipo listo:</span>
                      <span className={`font-medium ${selectedRecord.calvingPreparation.equipmentReady ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedRecord.calvingPreparation.equipmentReady ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Veterinario de guardia:</span>
                      <span className="font-medium">{selectedRecord.calvingPreparation.veterinarianOnCall}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asistente:</span>
                      <span className="font-medium">{selectedRecord.calvingPreparation.assistantAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan emergencia:</span>
                      <span className="font-medium">{selectedRecord.calvingPreparation.emergencyPlan}</span>
                    </div>
                  </div>
                </div>
                {selectedRecord.calvingPreparation.facilities.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-600 font-medium">Instalaciones:</span>
                    <div className="mt-2">
                      {selectedRecord.calvingPreparation.facilities.map((facility: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                        <span key={index} className="inline-block bg-orange-200 rounded-full px-2 py-1 text-xs text-orange-800 mr-1 mb-1">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Análisis económico */}
              <div className="mb-6 bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Análisis Económico
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Costos Veterinarios</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedRecord.economics.veterinaryCosts)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Costos Nutrición</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedRecord.economics.nutritionCosts)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Inversión Total</p>
                    <p className="text-lg font-bold text-[#519a7c]">{formatCurrency(selectedRecord.economics.totalInvestment)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Esperado</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedRecord.economics.expectedValue)}</p>
                  </div>
                </div>
              </div>

              {/* Complicaciones */}
              {selectedRecord.complications.length > 0 && (
                <div className="mb-6 bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    Complicaciones
                  </h3>
                  <div className="space-y-3">
                    {selectedRecord.complications.map((complication) => (
                      <div key={complication.id} className="border border-red-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">{complication.description}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            complication.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            complication.severity === 'severe' ? 'bg-orange-200 text-orange-800' :
                            complication.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                          }`}>
                            {complication.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Fecha: {complication.date.toLocaleDateString('es-MX')} | 
                          Veterinario: {complication.veterinarian} | 
                          Estado: {complication.resolution}
                        </p>
                        {complication.treatment.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Tratamiento:</span>
                            <ul className="text-sm text-gray-600 ml-4">
                              {complication.treatment.map((treatment, index) => (
                                <li key={index}>• {treatment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedRecord.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notas Adicionales</h3>
                  <p className="text-gray-700">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Renderizado principal
  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen",
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}>
        <LoadingSpinner />
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div className={cn(
      "min-h-screen",
      // Fondo degradado principal del layout
      "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
      className
    )}>
      <div className="p-6">
        {/* Header con título y controles principales */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                Seguimiento de Gestación
              </h1>
              <p className="text-white/90">
                Monitoreo integral del embarazo con geolocalización y análisis predictivo
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreate}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Seguimiento</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Barra de búsqueda y filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por animal, veterinario, cuidador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="early_pregnancy">Gestación Temprana</option>
                <option value="mid_pregnancy">Gestación Media</option>
                <option value="late_pregnancy">Gestación Tardía</option>
                <option value="pre_calving">Pre-Parto</option>
              </select>

              <select
                value={filters.gestationStage}
                onChange={(e) => setFilters(prev => ({ ...prev, gestationStage: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los trimestres</option>
                <option value="first_trimester">Primer Trimestre</option>
                <option value="second_trimester">Segundo Trimestre</option>
                <option value="third_trimester">Tercer Trimestre</option>
              </select>

              <select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los sectores</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Este">Este</option>
                <option value="Oeste">Oeste</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Gestaciones Activas', 
              value: records.filter(r => !['calved', 'aborted'].includes(r.pregnancy.currentStatus)).length.toString(), 
              icon: Baby, 
              color: 'from-[#519a7c] to-[#4e9c75]' 
            },
            { 
              label: 'Próximos Partos (30d)', 
              value: records.filter(r => getDaysToCalving(r.pregnancy.estimatedCalvingDate) <= 30 && getDaysToCalving(r.pregnancy.estimatedCalvingDate) > 0).length.toString(), 
              icon: Clock, 
              color: 'from-orange-500 to-orange-600' 
            },
            { 
              label: 'Partos Vencidos', 
              value: records.filter(r => getDaysToCalving(r.pregnancy.estimatedCalvingDate) < 0).length.toString(), 
              icon: AlertCircle, 
              color: 'from-red-500 to-red-600' 
            },
            { 
              label: 'Inversión Total', 
              value: formatCurrency(records.reduce((acc, r) => acc + r.economics.totalInvestment, 0)), 
              icon: Activity, 
              color: 'from-green-500 to-green-600' 
            }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lista de registros */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="col-span-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center"
            >
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-500">
                No hay seguimientos de gestación que coincidan con los filtros aplicados.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Modales */}
        {showCreateModal && <FormModal isEdit={false} />}
        {showEditModal && <FormModal isEdit={true} />}
        {showViewModal && <ViewModal />}
      </div>
    </div>
  );
};

export default PregnancyTracking;