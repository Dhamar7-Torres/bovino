import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Thermometer,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  Download,
  AlertTriangle,
  Clock,
  Package,
  Beaker,
  Shield,
  Heart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Lock,
  DollarSign,
  ChevronDown,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Interfaces para medicamentos veterinarios
interface VeterinaryMedicine {
  id: string;
  name: string;
  genericName?: string;
  category: MedicineCategory;
  subCategory?: string;
  manufacturer: string;
  supplier: string;
  description: string;

  // Información farmacológica
  activeIngredient: string;
  concentration: string;
  pharmaceuticalForm: PharmaceuticalForm;
  administrationRoute: AdministrationRoute[];

  // Información de stock
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  minStock: number;
  maxStock: number;
  unit: string;

  // Información económica
  unitCost: number;
  totalValue: number;
  averageCost: number;
  lastPurchasePrice: number;
  lastPurchaseDate?: Date;

  // Ubicación física
  location: {
    warehouse: string;
    zone?: string;
    shelf: string;
    position: string;
    temperature?: string;
  };

  // Información regulatoria
  registrationNumber: string;
  sanasaNumber?: string;
  manufacturingDate?: Date;
  expirationDate: Date;
  batchNumber: string;
  lotNumber?: string;

  // Condiciones especiales
  storageConditions: string;
  requiresRefrigeration: boolean;
  requiresPrescription: boolean;
  isControlled: boolean;
  isNarcotic: boolean;

  // Información veterinaria específica
  withdrawalPeriod: {
    meat: number; // días
    milk: number; // días
  };
  targetSpecies: AnimalSpecies[];
  ageRestrictions?: {
    minAge: number;
    maxAge?: number;
    unit: "days" | "weeks" | "months" | "years";
  };
  contraindicationsPregnancy: boolean;
  contraindicationsLactation: boolean;

  // Información de uso
  recommendedDosage: {
    amount: number;
    unit: string;
    frequency: string;
    duration?: string;
    bodyWeightBased: boolean;
  };
  sideEffects?: string[];
  warnings?: string[];
  drugInteractions?: string[];

  // Estado y rastreo
  status: MedicineStatus;
  qualityStatus: QualityStatus;
  lastMovementDate: Date;
  lastUsageDate?: Date;
  turnoverRate?: number;
  consumptionRate?: number;

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
  notes?: string;
  tags: string[];
}

interface MedicineMovement {
  id: string;
  medicineId: string;
  medicineName: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  remainingStock: number;

  // Información de movimiento
  date: Date;
  reason: string;
  referenceDocument?: string;
  batchNumber: string;
  lotNumber?: string;
  expirationDate?: Date;

  // Ubicación
  fromLocation?: string;
  toLocation?: string;
  currentLocation: string;

  // Personal involucrado
  performedBy: string;
  authorizedBy?: string;
  veterinarian?: string;

  // Información veterinaria (para uso)
  animalId?: string;
  animalName?: string;
  animalEarTag?: string;
  treatmentId?: string;
  treatmentReason?: string;
  dosageApplied?: {
    amount: number;
    unit: string;
    bodyWeight?: number;
  };
  administrationSite?: string;

  // Proveedor (para compras)
  supplier?: string;
  purchaseOrderId?: string;
  invoiceNumber?: string;

  // Observaciones y seguimiento
  notes?: string;
  qualityCheck?: boolean;
  temperatureCompliance?: boolean;
  attachments?: string[];

  // Metadatos
  createdAt: Date;
  createdBy: string;
}

interface MedicineStats {
  totalMedicines: number;
  totalValue: number;
  totalUnits: number;
  categoriesCount: number;

  // Estados
  availableCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiredCount: number;
  nearExpiryCount: number;

  // Financiero
  monthlyConsumption: number;
  averageUnitCost: number;
  totalPurchasesThisMonth: number;

  // Operacional
  averageStockDays: number;
  fastMovingItems: number;
  slowMovingItems: number;
  controlledMedicinesCount: number;
}

interface ExpiryAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expirationDate: Date;
  currentStock: number;
  daysToExpiry: number;
  priority: "low" | "medium" | "high" | "critical";
  estimatedLoss: number;
  suggestedActions: string[];
}

interface QualityAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  alertType:
    | "temperature_breach"
    | "humidity_issue"
    | "contamination_risk"
    | "recall_notice";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: Date;
  affectedBatches: string[];
  actionRequired: string;
  status: "open" | "investigating" | "resolved";
}

// Enums
enum MedicineCategory {
  ANTIBIOTIC = "antibiotic",
  VACCINE = "vaccine",
  ANTIPARASITIC = "antiparasitic",
  ANTIINFLAMMATORY = "antiinflammatory",
  ANALGESIC = "analgesic",
  VITAMIN = "vitamin",
  MINERAL = "mineral",
  HORMONE = "hormone",
  ANESTHETIC = "anesthetic",
  ANTIDIARRHEAL = "antidiarrheal",
  RESPIRATORY = "respiratory",
  DERMATOLOGICAL = "dermatological",
  REPRODUCTIVE = "reproductive",
  IMMUNOMODULATOR = "immunomodulator",
  ANTISEPTIC = "antiseptic",
}

enum PharmaceuticalForm {
  INJECTABLE = "injectable",
  ORAL_LIQUID = "oral_liquid",
  ORAL_TABLET = "oral_tablet",
  ORAL_POWDER = "oral_powder",
  TOPICAL_CREAM = "topical_cream",
  TOPICAL_SPRAY = "topical_spray",
  INTRAMAMMARY = "intramammary",
  POUR_ON = "pour_on",
  BOLUS = "bolus",
  IMPLANT = "implant",
}

enum AdministrationRoute {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  ORAL = "oral",
  TOPICAL = "topical",
  INTRAMAMMARY = "intramammary",
  INTRAUTERINE = "intrauterine",
  OPHTHALMIC = "ophthalmic",
  AURICULAR = "auricular",
}

enum AnimalSpecies {
  CATTLE = "cattle",
  DAIRY_CATTLE = "dairy_cattle",
  BEEF_CATTLE = "beef_cattle",
  CALVES = "calves",
  BULLS = "bulls",
  SHEEP = "sheep",
  GOATS = "goats",
  PIGS = "pigs",
  HORSES = "horses",
  POULTRY = "poultry",
}

enum MedicineStatus {
  AVAILABLE = "available",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  NEAR_EXPIRY = "near_expiry",
  EXPIRED = "expired",
  QUARANTINED = "quarantined",
  RECALLED = "recalled",
  DISCONTINUED = "discontinued",
}

enum QualityStatus {
  APPROVED = "approved",
  PENDING_QC = "pending_qc",
  REJECTED = "rejected",
  UNDER_REVIEW = "under_review",
  CONDITIONALLY_APPROVED = "conditionally_approved",
}

enum MovementType {
  PURCHASE = "purchase",
  USAGE = "usage",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
  RETURN = "return",
  DISPOSAL = "disposal",
  LOSS = "loss",
  QUARANTINE = "quarantine",
  RELEASE = "release",
}

const MedicineInventory: React.FC = () => {
  // Estados del componente
  const [medicines, setMedicines] = useState<VeterinaryMedicine[]>([]);
  const [] = useState<MedicineMovement[]>([]);
  const [stats, setStats] = useState<MedicineStats | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de UI
  const [activeView, setActiveView] = useState<
    "list" | "cards" | "batches" | "analytics"
  >("list");
  const [, setSelectedMedicine] = useState<VeterinaryMedicine | null>(null);
  const [, setShowDetailModal] = useState(false);
  const [, setShowAddModal] = useState(false);
  const [expandedMedicine, setExpandedMedicine] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    location: "all",
    prescription: "all",
    expiry: "all",
    manufacturer: "all",
  });

  // Estados de acciones
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [] = useState(false);

  // Efecto para cargar datos
  useEffect(() => {
    const loadMedicineData = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Datos simulados de medicamentos
        const mockMedicines: VeterinaryMedicine[] = [
          {
            id: "1",
            name: "Penicilina G Procaínica",
            genericName: "Bencilpenicilina procaína",
            category: MedicineCategory.ANTIBIOTIC,
            subCategory: "Beta-lactámico",
            manufacturer: "FarmVet Industries",
            supplier: "Distribuidora Animal Health",
            description:
              "Antibiótico de amplio espectro para tratamiento de infecciones bacterianas",
            activeIngredient: "Bencilpenicilina procaína",
            concentration: "300,000 UI/ml",
            pharmaceuticalForm: PharmaceuticalForm.INJECTABLE,
            administrationRoute: [AdministrationRoute.INTRAMUSCULAR],
            currentStock: 15,
            availableStock: 13,
            reservedStock: 2,
            minStock: 5,
            maxStock: 50,
            unit: "frascos 100ml",
            unitCost: 45.5,
            totalValue: 682.5,
            averageCost: 44.8,
            lastPurchasePrice: 47.2,
            lastPurchaseDate: new Date("2025-07-05"),
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "A-2",
              position: "03",
              temperature: "2-8°C",
            },
            registrationNumber: "SENASA-001234",
            sanasaNumber: "REG-VET-2024-001",
            manufacturingDate: new Date("2024-12-15"),
            expirationDate: new Date("2025-12-15"),
            batchNumber: "PEN-2024-089",
            lotNumber: "LOT-PEN-456",
            storageConditions: "Refrigeración 2-8°C, proteger de luz",
            requiresRefrigeration: true,
            requiresPrescription: true,
            isControlled: false,
            isNarcotic: false,
            withdrawalPeriod: { meat: 14, milk: 72 },
            targetSpecies: [AnimalSpecies.CATTLE, AnimalSpecies.DAIRY_CATTLE],
            ageRestrictions: { minAge: 1, unit: "months" },
            contraindicationsPregnancy: false,
            contraindicationsLactation: true,
            recommendedDosage: {
              amount: 20000,
              unit: "UI/kg",
              frequency: "cada 24h",
              duration: "3-5 días",
              bodyWeightBased: true,
            },
            sideEffects: [
              "Reacciones alérgicas",
              "Irritación en sitio de inyección",
            ],
            warnings: ["No usar en animales alérgicos a penicilinas"],
            status: MedicineStatus.AVAILABLE,
            qualityStatus: QualityStatus.APPROVED,
            lastMovementDate: new Date("2025-07-10"),
            lastUsageDate: new Date("2025-07-09"),
            turnoverRate: 8.5,
            consumptionRate: 2.5,
            createdAt: new Date("2025-01-15"),
            updatedAt: new Date("2025-07-10"),
            createdBy: "Dr. García",
            lastUpdatedBy: "Admin Sistema",
            tags: ["antibiótico", "refrigerado", "prescripción", "ganado"],
          },
          {
            id: "2",
            name: "Vacuna Triple Bovina",
            genericName: "Vacuna IBR-BVD-PI3",
            category: MedicineCategory.VACCINE,
            subCategory: "Virus inactivados",
            manufacturer: "BioVet Laboratories",
            supplier: "Suministros Pecuarios del Norte",
            description:
              "Vacuna contra Rinotraqueítis Infecciosa, Diarrea Viral y Parainfluenza 3",
            activeIngredient: "Virus inactivados IBR, BVD, PI3",
            concentration: "1 dosis = 2ml",
            pharmaceuticalForm: PharmaceuticalForm.INJECTABLE,
            administrationRoute: [
              AdministrationRoute.INTRAMUSCULAR,
              AdministrationRoute.SUBCUTANEOUS,
            ],
            currentStock: 8,
            availableStock: 8,
            reservedStock: 0,
            minStock: 15,
            maxStock: 100,
            unit: "frascos 50 dosis",
            unitCost: 125.0,
            totalValue: 1000.0,
            averageCost: 122.5,
            lastPurchasePrice: 127.8,
            lastPurchaseDate: new Date("2025-06-20"),
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "B-1",
              position: "07",
              temperature: "2-8°C",
            },
            registrationNumber: "SENASA-005678",
            sanasaNumber: "VAC-REG-2024-045",
            manufacturingDate: new Date("2025-02-20"),
            expirationDate: new Date("2025-08-20"),
            batchNumber: "VAC-2024-156",
            lotNumber: "LOT-VAC-789",
            storageConditions: "Refrigeración 2-8°C, no congelar",
            requiresRefrigeration: true,
            requiresPrescription: true,
            isControlled: false,
            isNarcotic: false,
            withdrawalPeriod: { meat: 0, milk: 0 },
            targetSpecies: [
              AnimalSpecies.CATTLE,
              AnimalSpecies.BEEF_CATTLE,
              AnimalSpecies.DAIRY_CATTLE,
            ],
            ageRestrictions: { minAge: 3, unit: "months" },
            contraindicationsPregnancy: true,
            contraindicationsLactation: false,
            recommendedDosage: {
              amount: 2,
              unit: "ml",
              frequency: "dosis única",
              duration: "anual",
              bodyWeightBased: false,
            },
            warnings: [
              "No aplicar en animales enfermos",
              "No usar en gestantes",
            ],
            status: MedicineStatus.LOW_STOCK,
            qualityStatus: QualityStatus.APPROVED,
            lastMovementDate: new Date("2025-07-08"),
            lastUsageDate: new Date("2025-07-07"),
            turnoverRate: 12.3,
            consumptionRate: 4.2,
            createdAt: new Date("2025-02-01"),
            updatedAt: new Date("2025-07-08"),
            createdBy: "Dr. López",
            lastUpdatedBy: "Dr. García",
            tags: ["vacuna", "refrigerado", "prescripción", "prevención"],
          },
          {
            id: "3",
            name: "Ivermectina 1%",
            genericName: "Ivermectina",
            category: MedicineCategory.ANTIPARASITIC,
            subCategory: "Avermectina",
            manufacturer: "PharmaVet Solutions",
            supplier: "Distribuidora Animal Health",
            description: "Antiparasitario interno y externo de amplio espectro",
            activeIngredient: "Ivermectina",
            concentration: "10mg/ml",
            pharmaceuticalForm: PharmaceuticalForm.INJECTABLE,
            administrationRoute: [AdministrationRoute.SUBCUTANEOUS],
            currentStock: 6,
            availableStock: 6,
            reservedStock: 0,
            minStock: 10,
            maxStock: 30,
            unit: "frascos 50ml",
            unitCost: 28.75,
            totalValue: 172.5,
            averageCost: 27.9,
            lastPurchasePrice: 29.5,
            lastPurchaseDate: new Date("2025-06-15"),
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Ambiente",
              shelf: "C-3",
              position: "12",
              temperature: "Ambiente",
            },
            registrationNumber: "SENASA-009876",
            sanasaNumber: "ANT-REG-2024-023",
            manufacturingDate: new Date("2024-07-25"),
            expirationDate: new Date("2025-07-25"),
            batchNumber: "IVE-2024-203",
            lotNumber: "LOT-IVE-321",
            storageConditions: "Temperatura ambiente, proteger de luz directa",
            requiresRefrigeration: false,
            requiresPrescription: true,
            isControlled: false,
            isNarcotic: false,
            withdrawalPeriod: { meat: 28, milk: 0 },
            targetSpecies: [
              AnimalSpecies.CATTLE,
              AnimalSpecies.SHEEP,
              AnimalSpecies.GOATS,
            ],
            ageRestrictions: { minAge: 2, unit: "months" },
            contraindicationsPregnancy: false,
            contraindicationsLactation: false,
            recommendedDosage: {
              amount: 200,
              unit: "mcg/kg",
              frequency: "dosis única",
              duration: "según necesidad",
              bodyWeightBased: true,
            },
            sideEffects: ["Letargia temporal", "Reducción del apetito"],
            warnings: ["No exceder la dosis recomendada"],
            status: MedicineStatus.NEAR_EXPIRY,
            qualityStatus: QualityStatus.APPROVED,
            lastMovementDate: new Date("2025-07-11"),
            lastUsageDate: new Date("2025-07-10"),
            turnoverRate: 6.8,
            consumptionRate: 1.8,
            createdAt: new Date("2025-03-10"),
            updatedAt: new Date("2025-07-11"),
            createdBy: "Dr. Martínez",
            lastUpdatedBy: "Dr. García",
            tags: ["antiparasitario", "ambiente", "prescripción", "retiro"],
          },
          {
            id: "4",
            name: "Meloxicam 2%",
            genericName: "Meloxicam",
            category: MedicineCategory.ANTIINFLAMMATORY,
            subCategory: "AINE",
            manufacturer: "VetPharm International",
            supplier: "Suministros Pecuarios del Norte",
            description: "Antiinflamatorio no esteroideo para alivio del dolor",
            activeIngredient: "Meloxicam",
            concentration: "20mg/ml",
            pharmaceuticalForm: PharmaceuticalForm.INJECTABLE,
            administrationRoute: [
              AdministrationRoute.INTRAMUSCULAR,
              AdministrationRoute.INTRAVENOUS,
            ],
            currentStock: 0,
            availableStock: 0,
            reservedStock: 0,
            minStock: 8,
            maxStock: 25,
            unit: "frascos 100ml",
            unitCost: 67.25,
            totalValue: 0,
            averageCost: 65.8,
            lastPurchasePrice: 69.9,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Ambiente",
              shelf: "D-1",
              position: "05",
              temperature: "Ambiente",
            },
            registrationNumber: "SENASA-012345",
            sanasaNumber: "AIF-REG-2024-067",
            expirationDate: new Date("2026-03-10"),
            batchNumber: "MEL-2024-445",
            storageConditions: "Temperatura ambiente, proteger de humedad",
            requiresRefrigeration: false,
            requiresPrescription: true,
            isControlled: false,
            isNarcotic: false,
            withdrawalPeriod: { meat: 5, milk: 24 },
            targetSpecies: [AnimalSpecies.CATTLE, AnimalSpecies.PIGS],
            ageRestrictions: { minAge: 6, unit: "months" },
            contraindicationsPregnancy: true,
            contraindicationsLactation: false,
            recommendedDosage: {
              amount: 0.5,
              unit: "mg/kg",
              frequency: "cada 24h",
              duration: "1-3 días",
              bodyWeightBased: true,
            },
            sideEffects: [
              "Problemas gastrointestinales",
              "Reducción del apetito",
            ],
            warnings: [
              "No usar en animales deshidratados",
              "Monitorear función renal",
            ],
            drugInteractions: ["Corticosteroides", "Otros AINEs"],
            status: MedicineStatus.OUT_OF_STOCK,
            qualityStatus: QualityStatus.APPROVED,
            lastMovementDate: new Date("2025-07-05"),
            lastUsageDate: new Date("2025-07-05"),
            turnoverRate: 4.2,
            consumptionRate: 1.1,
            createdAt: new Date("2025-02-20"),
            updatedAt: new Date("2025-07-05"),
            createdBy: "Dr. Sánchez",
            lastUpdatedBy: "Dr. López",
            tags: ["antiinflamatorio", "dolor", "prescripción", "controlado"],
          },
          {
            id: "5",
            name: "Complejo B + Hierro",
            genericName: "Complejo vitamínico B con hierro",
            category: MedicineCategory.VITAMIN,
            subCategory: "Vitaminas del complejo B",
            manufacturer: "NutriVet Laboratories",
            supplier: "Distribuidora Animal Health",
            description:
              "Suplemento vitamínico con hierro para apoyo nutricional",
            activeIngredient: "Vitaminas B1, B6, B12 + Hierro dextrano",
            concentration: "Complejo multivitamínico",
            pharmaceuticalForm: PharmaceuticalForm.INJECTABLE,
            administrationRoute: [AdministrationRoute.INTRAMUSCULAR],
            currentStock: 25,
            availableStock: 23,
            reservedStock: 2,
            minStock: 8,
            maxStock: 40,
            unit: "frascos 50ml",
            unitCost: 18.9,
            totalValue: 472.5,
            averageCost: 18.5,
            lastPurchasePrice: 19.8,
            lastPurchaseDate: new Date("2025-07-01"),
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Ambiente",
              shelf: "E-2",
              position: "18",
              temperature: "Ambiente",
            },
            registrationNumber: "SENASA-054321",
            sanasaNumber: "VIT-REG-2024-089",
            manufacturingDate: new Date("2025-01-30"),
            expirationDate: new Date("2026-01-30"),
            batchNumber: "VIT-2024-678",
            lotNumber: "LOT-VIT-654",
            storageConditions: "Proteger de luz y humedad",
            requiresRefrigeration: false,
            requiresPrescription: false,
            isControlled: false,
            isNarcotic: false,
            withdrawalPeriod: { meat: 0, milk: 0 },
            targetSpecies: [
              AnimalSpecies.CATTLE,
              AnimalSpecies.DAIRY_CATTLE,
              AnimalSpecies.CALVES,
              AnimalSpecies.SHEEP,
              AnimalSpecies.GOATS,
            ],
            contraindicationsPregnancy: false,
            contraindicationsLactation: false,
            recommendedDosage: {
              amount: 2,
              unit: "ml/100kg",
              frequency: "según necesidad",
              duration: "variable",
              bodyWeightBased: true,
            },
            status: MedicineStatus.AVAILABLE,
            qualityStatus: QualityStatus.APPROVED,
            lastMovementDate: new Date("2025-07-12"),
            lastUsageDate: new Date("2025-07-11"),
            turnoverRate: 15.6,
            consumptionRate: 5.2,
            createdAt: new Date("2025-01-20"),
            updatedAt: new Date("2025-07-12"),
            createdBy: "Dr. Rodríguez",
            lastUpdatedBy: "Auxiliar Pérez",
            tags: ["vitamina", "suplemento", "sin receta", "nutricional"],
          },
        ];

        // Estadísticas simuladas
        const mockStats: MedicineStats = {
          totalMedicines: 48,
          totalValue: 15750.3,
          totalUnits: 1245,
          categoriesCount: 8,
          availableCount: 35,
          lowStockCount: 8,
          outOfStockCount: 3,
          expiredCount: 2,
          nearExpiryCount: 5,
          monthlyConsumption: 3245.8,
          averageUnitCost: 42.5,
          totalPurchasesThisMonth: 8950.0,
          averageStockDays: 45,
          fastMovingItems: 12,
          slowMovingItems: 6,
          controlledMedicinesCount: 4,
        };

        // Alertas de vencimiento simuladas
        const mockExpiryAlerts: ExpiryAlert[] = [
          {
            id: "1",
            medicineId: "3",
            medicineName: "Ivermectina 1%",
            batchNumber: "IVE-2024-203",
            expirationDate: new Date("2025-07-25"),
            currentStock: 6,
            daysToExpiry: 13,
            priority: "high",
            estimatedLoss: 172.5,
            suggestedActions: [
              "Usar prioritariamente en próximos tratamientos",
              "Evaluar descuento para venta rápida",
              "Coordinar con veterinarios para uso inmediato",
            ],
          },
          {
            id: "2",
            medicineId: "2",
            medicineName: "Vacuna Triple Bovina",
            batchNumber: "VAC-2024-156",
            expirationDate: new Date("2025-08-20"),
            currentStock: 8,
            daysToExpiry: 39,
            priority: "medium",
            estimatedLoss: 1000.0,
            suggestedActions: [
              "Programar jornada de vacunación",
              "Notificar a clientes para vacunación anticipada",
              "Verificar posibilidad de devolución al proveedor",
            ],
          },
        ];

        // Alertas de calidad simuladas
        const mockQualityAlerts: QualityAlert[] = [
          {
            id: "1",
            medicineId: "1",
            medicineName: "Penicilina G Procaínica",
            alertType: "temperature_breach",
            severity: "medium",
            description:
              "Registro de temperatura fuera del rango (10°C) durante 2 horas",
            detectedAt: new Date("2025-07-11T14:30:00"),
            affectedBatches: ["PEN-2024-089"],
            actionRequired:
              "Evaluar integridad del producto y considerar cuarentena",
            status: "investigating",
          },
        ];

        setMedicines(mockMedicines);
        setStats(mockStats);
        setExpiryAlerts(mockExpiryAlerts);
        setQualityAlerts(mockQualityAlerts);
      } catch (error) {
        console.error("Error cargando datos de medicamentos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedicineData();
  }, []);

  // Funciones auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDaysToExpiry = (expirationDate: Date) => {
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getStatusIcon = (status: MedicineStatus) => {
    switch (status) {
      case MedicineStatus.AVAILABLE:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case MedicineStatus.LOW_STOCK:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case MedicineStatus.OUT_OF_STOCK:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case MedicineStatus.NEAR_EXPIRY:
        return <Clock className="w-4 h-4 text-orange-500" />;
      case MedicineStatus.EXPIRED:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case MedicineStatus.QUARANTINED:
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MedicineStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case MedicineStatus.AVAILABLE:
        return `${baseClasses} bg-green-100 text-green-800`;
      case MedicineStatus.LOW_STOCK:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case MedicineStatus.OUT_OF_STOCK:
        return `${baseClasses} bg-red-100 text-red-800`;
      case MedicineStatus.NEAR_EXPIRY:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case MedicineStatus.EXPIRED:
        return `${baseClasses} bg-red-100 text-red-900`;
      case MedicineStatus.QUARANTINED:
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusLabel = (status: MedicineStatus) => {
    switch (status) {
      case MedicineStatus.AVAILABLE:
        return "Disponible";
      case MedicineStatus.LOW_STOCK:
        return "Stock Bajo";
      case MedicineStatus.OUT_OF_STOCK:
        return "Sin Stock";
      case MedicineStatus.NEAR_EXPIRY:
        return "Por Vencer";
      case MedicineStatus.EXPIRED:
        return "Vencido";
      case MedicineStatus.QUARANTINED:
        return "En Cuarentena";
      case MedicineStatus.RECALLED:
        return "Retirado";
      case MedicineStatus.DISCONTINUED:
        return "Descontinuado";
      default:
        return "Desconocido";
    }
  };

  const getCategoryIcon = (category: MedicineCategory) => {
    switch (category) {
      case MedicineCategory.ANTIBIOTIC:
        return <Pill className="w-5 h-5 text-blue-500" />;
      case MedicineCategory.VACCINE:
        return <Shield className="w-5 h-5 text-green-500" />;
      case MedicineCategory.ANTIPARASITIC:
        return <Shield className="w-5 h-5 text-purple-500" />;
      case MedicineCategory.ANTIINFLAMMATORY:
        return <Heart className="w-5 h-5 text-red-500" />;
      case MedicineCategory.VITAMIN:
        return <Star className="w-5 h-5 text-yellow-500" />;
      case MedicineCategory.HORMONE:
        return <Activity className="w-5 h-5 text-pink-500" />;
      default:
        return <Beaker className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: MedicineCategory) => {
    switch (category) {
      case MedicineCategory.ANTIBIOTIC:
        return "Antibiótico";
      case MedicineCategory.VACCINE:
        return "Vacuna";
      case MedicineCategory.ANTIPARASITIC:
        return "Antiparasitario";
      case MedicineCategory.ANTIINFLAMMATORY:
        return "Antiinflamatorio";
      case MedicineCategory.ANALGESIC:
        return "Analgésico";
      case MedicineCategory.VITAMIN:
        return "Vitamina";
      case MedicineCategory.MINERAL:
        return "Mineral";
      case MedicineCategory.HORMONE:
        return "Hormona";
      case MedicineCategory.ANESTHETIC:
        return "Anestésico";
      default:
        return "Otro";
    }
  };

  const handleSelectMedicine = (medicineId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(medicineId)) {
      newSelected.delete(medicineId);
    } else {
      newSelected.add(medicineId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    const filteredMedicineIds = filteredMedicines.map((med) => med.id);
    if (selectedItems.size === filteredMedicineIds.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredMedicineIds));
      setShowBulkActions(true);
    }
  };

  // Filtrado de medicamentos
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.activeIngredient
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filters.category === "all" || medicine.category === filters.category;
    const matchesStatus =
      filters.status === "all" || medicine.status === filters.status;
    const matchesLocation =
      filters.location === "all" ||
      medicine.location.warehouse === filters.location;
    const matchesPrescription =
      filters.prescription === "all" ||
      (filters.prescription === "required" && medicine.requiresPrescription) ||
      (filters.prescription === "not_required" &&
        !medicine.requiresPrescription);

    let matchesExpiry = true;
    if (filters.expiry !== "all") {
      const daysToExpiry = getDaysToExpiry(medicine.expirationDate);
      switch (filters.expiry) {
        case "expired":
          matchesExpiry = daysToExpiry < 0;
          break;
        case "expiring_soon":
          matchesExpiry = daysToExpiry >= 0 && daysToExpiry <= 30;
          break;
        case "good":
          matchesExpiry = daysToExpiry > 30;
          break;
      }
    }

    const matchesManufacturer =
      filters.manufacturer === "all" ||
      medicine.manufacturer === filters.manufacturer;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesLocation &&
      matchesPrescription &&
      matchesExpiry &&
      matchesManufacturer
    );
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Inventario de Medicamentos
              </h1>
              <p className="text-white/90 text-lg">
                Gestión especializada de medicamentos veterinarios y productos
                farmacéuticos
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Selector de vista */}
              <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setActiveView("list")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "list"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setActiveView("cards")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "cards"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setActiveView("batches")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "batches"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Lotes
                </button>
                <button
                  onClick={() => setActiveView("analytics")}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                    activeView === "analytics"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Análisis
                </button>
              </div>

              {/* Acciones rápidas */}
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Medicamento</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas Principales */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Medicamentos */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Medicamentos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalMedicines}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {stats.categoriesCount} categorías
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Pill className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Valor Total */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Valor Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {stats.totalUnits.toLocaleString()} unidades
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Alertas Críticas */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Alertas Críticas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.lowStockCount +
                      stats.outOfStockCount +
                      stats.expiredCount}
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Requieren atención
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Consumo Mensual */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Consumo Mensual
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.monthlyConsumption)}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    {stats.averageStockDays} días promedio
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alertas Importantes */}
        {(expiryAlerts.length > 0 || qualityAlerts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alertas de Vencimiento */}
              {expiryAlerts.length > 0 && (
                <div className={`${CSS_CLASSES.card} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span>Próximos a Vencer</span>
                    </h3>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {expiryAlerts.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {expiryAlerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-orange-900">
                            {alert.medicineName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.priority === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : alert.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {alert.daysToExpiry} días
                          </span>
                        </div>
                        <div className="text-sm text-orange-700">
                          Lote: {alert.batchNumber} • Stock:{" "}
                          {alert.currentStock} unidades
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Pérdida estimada:{" "}
                          {formatCurrency(alert.estimatedLoss)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {expiryAlerts.length > 3 && (
                    <button className="w-full mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">
                      Ver {expiryAlerts.length - 3} alertas más
                    </button>
                  )}
                </div>
              )}

              {/* Alertas de Calidad */}
              {qualityAlerts.length > 0 && (
                <div className={`${CSS_CLASSES.card} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      <span>Alertas de Calidad</span>
                    </h3>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {qualityAlerts.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {qualityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-red-900">
                            {alert.medicineName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.severity === "high"
                                ? "bg-orange-100 text-orange-800"
                                : alert.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-red-700 mb-1">
                          {alert.description}
                        </div>
                        <div className="text-xs text-red-600">
                          Detectado: {formatDateTime(alert.detectedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Controles y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${CSS_CLASSES.card} p-6 mb-6`}
        >
          {/* Barra superior */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {/* Checkbox para seleccionar todo */}
              <input
                type="checkbox"
                checked={
                  selectedItems.size === filteredMedicines.length &&
                  filteredMedicines.length > 0
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {selectedItems.size > 0
                  ? `${selectedItems.size} seleccionados`
                  : "Seleccionar todo"}
              </span>

              {showBulkActions && (
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors duration-200">
                    Generar Reporte
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200">
                    Actualizar Stock
                  </button>
                  <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm hover:bg-orange-200 transition-colors duration-200">
                    Transferir
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar medicamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  showFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Botón de exportar */}
              <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    <option value="antibiotic">Antibióticos</option>
                    <option value="vaccine">Vacunas</option>
                    <option value="antiparasitic">Antiparasitarios</option>
                    <option value="antiinflammatory">Antiinflamatorios</option>
                    <option value="vitamin">Vitaminas</option>
                    <option value="hormone">Hormonas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="available">Disponible</option>
                    <option value="low_stock">Stock Bajo</option>
                    <option value="out_of_stock">Sin Stock</option>
                    <option value="near_expiry">Por Vencer</option>
                    <option value="expired">Vencido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    <option value="Farmacia Veterinaria">
                      Farmacia Veterinaria
                    </option>
                    <option value="Almacén Principal">Almacén Principal</option>
                    <option value="Almacén Secundario">
                      Almacén Secundario
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescripción
                  </label>
                  <select
                    value={filters.prescription}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        prescription: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="required">Requiere Receta</option>
                    <option value="not_required">Sin Receta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento
                  </label>
                  <select
                    value={filters.expiry}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        expiry: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="expired">Vencidos</option>
                    <option value="expiring_soon">Próximos a vencer</option>
                    <option value="good">En buen estado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fabricante
                  </label>
                  <select
                    value={filters.manufacturer}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        manufacturer: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="FarmVet Industries">
                      FarmVet Industries
                    </option>
                    <option value="BioVet Laboratories">
                      BioVet Laboratories
                    </option>
                    <option value="PharmaVet Solutions">
                      PharmaVet Solutions
                    </option>
                    <option value="VetPharm International">
                      VetPharm International
                    </option>
                    <option value="NutriVet Laboratories">
                      NutriVet Laboratories
                    </option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Vista de Lista */}
        {activeView === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            {filteredMedicines.length === 0 ? (
              <div className={`${CSS_CLASSES.card} p-12 text-center`}>
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No se encontraron medicamentos
                </h3>
                <p className="text-gray-500">
                  Ajusta los filtros para ver más resultados
                </p>
              </div>
            ) : (
              filteredMedicines.map((medicine, index) => {
                const isExpanded = expandedMedicine === medicine.id;
                const daysToExpiry = getDaysToExpiry(medicine.expirationDate);

                return (
                  <motion.div
                    key={medicine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`${CSS_CLASSES.card} hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="p-6">
                      {/* Header principal */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Checkbox de selección */}
                          <input
                            type="checkbox"
                            checked={selectedItems.has(medicine.id)}
                            onChange={() => handleSelectMedicine(medicine.id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />

                          {/* Icono de categoría */}
                          <div className="mt-1">
                            {getCategoryIcon(medicine.category)}
                          </div>

                          {/* Información principal */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {medicine.name}
                              </h3>
                              {medicine.genericName && (
                                <span className="text-sm text-gray-600 italic">
                                  ({medicine.genericName})
                                </span>
                              )}
                              {getStatusIcon(medicine.status)}
                              <span className={getStatusBadge(medicine.status)}>
                                {getStatusLabel(medicine.status)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {getCategoryLabel(medicine.category)}
                              </span>
                              {medicine.requiresPrescription && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center space-x-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Receta</span>
                                </span>
                              )}
                              {medicine.isControlled && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                  Controlado
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 mb-3">
                              {medicine.description}
                            </p>

                            {/* Información básica en grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <Beaker className="w-4 h-4" />
                                <span>
                                  <strong>Principio activo:</strong>{" "}
                                  {medicine.activeIngredient}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4" />
                                <span>
                                  <strong>Stock:</strong>{" "}
                                  {medicine.currentStock} {medicine.unit}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  <strong>Ubicación:</strong>{" "}
                                  {medicine.location.warehouse}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  <strong>Vence:</strong>{" "}
                                  {formatDate(medicine.expirationDate)}
                                </span>
                              </div>
                            </div>

                            {/* Información económica */}
                            <div className="flex items-center space-x-6 text-sm">
                              <span className="text-gray-600">
                                <strong>Costo unitario:</strong>{" "}
                                {formatCurrency(medicine.unitCost)}
                              </span>
                              <span className="text-gray-600">
                                <strong>Valor total:</strong>{" "}
                                {formatCurrency(medicine.totalValue)}
                              </span>
                              <span className="text-gray-600">
                                <strong>Lote:</strong> {medicine.batchNumber}
                              </span>
                            </div>

                            {/* Alertas específicas */}
                            {daysToExpiry <= 30 && daysToExpiry > 0 && (
                              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <span className="text-orange-800 text-sm font-medium">
                                  ⚠️ Vence en {daysToExpiry} días
                                </span>
                              </div>
                            )}

                            {daysToExpiry <= 0 && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <span className="text-red-800 text-sm font-medium">
                                  🚫 Medicamento vencido hace{" "}
                                  {Math.abs(daysToExpiry)} días
                                </span>
                              </div>
                            )}

                            {medicine.currentStock <= medicine.minStock && (
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <span className="text-yellow-800 text-sm font-medium">
                                  📦 Stock por debajo del mínimo (
                                  {medicine.minStock} {medicine.unit})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setExpandedMedicine(
                                isExpanded ? null : medicine.id
                              )
                            }
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sección expandible */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Información farmacológica */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Información Farmacológica
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Concentración:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.concentration}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Forma farmacéutica:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.pharmaceuticalForm}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Vía de administración:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.administrationRoute.join(", ")}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Especies objetivo:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.targetSpecies.join(", ")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Información de dosificación */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Dosificación y Uso
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Dosis recomendada:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.recommendedDosage.amount}{" "}
                                    {medicine.recommendedDosage.unit}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Frecuencia:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.recommendedDosage.frequency}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Tiempo de retiro (carne):
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.withdrawalPeriod.meat} días
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Tiempo de retiro (leche):
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.withdrawalPeriod.milk > 0
                                      ? `${medicine.withdrawalPeriod.milk} horas`
                                      : "No aplica"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Información regulatoria */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Información Regulatoria
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Registro SENASA:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.registrationNumber}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Fabricante:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.manufacturer}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Proveedor:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.supplier}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Almacenamiento:
                                  </span>
                                  <span className="text-gray-600 ml-2">
                                    {medicine.storageConditions}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Advertencias y efectos secundarios */}
                          {(medicine.warnings ||
                            medicine.sideEffects ||
                            medicine.drugInteractions) && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h5 className="font-medium text-yellow-900 mb-2">
                                ⚠️ Advertencias y Precauciones
                              </h5>

                              {medicine.warnings &&
                                medicine.warnings.length > 0 && (
                                  <div className="mb-3">
                                    <span className="text-sm font-medium text-yellow-800">
                                      Advertencias:
                                    </span>
                                    <ul className="text-sm text-yellow-700 ml-4 mt-1">
                                      {medicine.warnings.map(
                                        (warning, index) => (
                                          <li key={index} className="list-disc">
                                            {warning}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {medicine.sideEffects &&
                                medicine.sideEffects.length > 0 && (
                                  <div className="mb-3">
                                    <span className="text-sm font-medium text-yellow-800">
                                      Efectos secundarios:
                                    </span>
                                    <ul className="text-sm text-yellow-700 ml-4 mt-1">
                                      {medicine.sideEffects.map(
                                        (effect, index) => (
                                          <li key={index} className="list-disc">
                                            {effect}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {medicine.drugInteractions &&
                                medicine.drugInteractions.length > 0 && (
                                  <div>
                                    <span className="text-sm font-medium text-yellow-800">
                                      Interacciones:
                                    </span>
                                    <ul className="text-sm text-yellow-700 ml-4 mt-1">
                                      {medicine.drugInteractions.map(
                                        (interaction, index) => (
                                          <li key={index} className="list-disc">
                                            {interaction}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Vista de Tarjetas */}
        {activeView === "cards" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMedicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                onClick={() => {
                  setSelectedMedicine(medicine);
                  setShowDetailModal(true);
                }}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(medicine.category)}
                    <span className={getStatusBadge(medicine.status)}>
                      {getStatusLabel(medicine.status)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {medicine.requiresPrescription && (
                      <Lock className="w-4 h-4 text-red-500" />
                    )}
                    {medicine.requiresRefrigeration && (
                      <Thermometer className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>

                {/* Nombre y descripción */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {medicine.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {medicine.description}
                </p>

                {/* Información clave */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock actual:</span>
                    <span
                      className={`font-medium ${
                        medicine.currentStock <= medicine.minStock
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {medicine.currentStock} {medicine.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Valor total:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(medicine.totalValue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vencimiento:</span>
                    <span
                      className={`font-medium ${
                        getDaysToExpiry(medicine.expirationDate) <= 30
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatDate(medicine.expirationDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="text-gray-900">
                      {medicine.location.shelf}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso de stock */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      Nivel de stock
                    </span>
                    <span className="text-xs text-gray-600">
                      {Math.round(
                        (medicine.currentStock / medicine.maxStock) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        medicine.currentStock <= medicine.minStock
                          ? "bg-red-500"
                          : medicine.currentStock <= medicine.minStock * 1.5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (medicine.currentStock / medicine.maxStock) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                {medicine.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {medicine.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {medicine.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{medicine.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Vista de Análisis */}
        {activeView === "analytics" && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Distribución por categorías */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Distribución por Categorías
              </h3>
              <div className="space-y-4">
                {[
                  {
                    category: "Antibióticos",
                    count: 12,
                    percentage: 25,
                    color: "#3b82f6",
                  },
                  {
                    category: "Vacunas",
                    count: 8,
                    percentage: 16.7,
                    color: "#22c55e",
                  },
                  {
                    category: "Antiparasitarios",
                    count: 10,
                    percentage: 20.8,
                    color: "#8b5cf6",
                  },
                  {
                    category: "Vitaminas",
                    count: 15,
                    percentage: 31.2,
                    color: "#f59e0b",
                  },
                  {
                    category: "Hormonas",
                    count: 3,
                    percentage: 6.3,
                    color: "#ec4899",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Estados del inventario */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Estados del Inventario
              </h3>
              <div className="space-y-4">
                {[
                  {
                    status: "Disponibles",
                    count: stats.availableCount,
                    color: "#22c55e",
                  },
                  {
                    status: "Stock Bajo",
                    count: stats.lowStockCount,
                    color: "#f59e0b",
                  },
                  {
                    status: "Sin Stock",
                    count: stats.outOfStockCount,
                    color: "#ef4444",
                  },
                  {
                    status: "Por Vencer",
                    count: stats.nearExpiryCount,
                    color: "#f97316",
                  },
                  {
                    status: "Vencidos",
                    count: stats.expiredCount,
                    color: "#dc2626",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.status}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Métricas de consumo */}
            <div className={`${CSS_CLASSES.card} p-6 lg:col-span-2`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Métricas de Rendimiento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.averageStockDays}
                  </div>
                  <div className="text-sm text-gray-600">
                    Días promedio de stock
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.fastMovingItems}
                  </div>
                  <div className="text-sm text-gray-600">
                    Items de rotación rápida
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {stats.slowMovingItems}
                  </div>
                  <div className="text-sm text-gray-600">
                    Items de rotación lenta
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats.controlledMedicinesCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    Medicamentos controlados
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MedicineInventory;
