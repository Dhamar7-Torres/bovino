// Tipos específicos para la gestión de ranchos y ubicaciones
// Extiende la información básica de FarmInfo con datos más detallados

import { BaseEntity, Coordinates, Address, ContactInfo } from "./common";
import { FarmType } from "./auth";

// Interfaz principal extendida del rancho
export interface Ranch extends BaseEntity {
  // Información básica heredada de FarmInfo
  name: string;
  description?: string;
  establishedYear: number;
  farmType: FarmType;
  specialization: RanchSpecialization[];

  // Ubicación y dirección detallada
  location: RanchLocation;

  // Información del propietario y contacto
  ownerInfo: RanchOwnerInfo;
  contactInfo: ContactInfo;

  // Área y dimensiones
  areaInfo: RanchAreaInfo;

  // Instalaciones y infraestructura
  facilities: RanchFacility[];

  // Zonas y divisiones del rancho
  zones: RanchZone[];

  // Límites y perímetros
  boundaries: RanchBoundary[];

  // Información legal y administrativa
  legalInfo: RanchLegalInfo;

  // Configuración operativa
  operationalConfig: RanchOperationalConfig;

  // Estado y estadísticas
  status: RanchStatus;
  statistics: RanchStatistics;

  // Metadatos
  metadata: RanchMetadata;
}

// Información de ubicación detallada del rancho
export interface RanchLocation {
  // Coordenadas principales (sede/centro)
  mainCoordinates: Coordinates;

  // Dirección completa
  address: Address;

  // Altitud y datos geográficos
  altitude: number; // metros sobre el nivel del mar
  topography: TopographyType;
  climateZone: ClimateZone;

  // Accesibilidad
  accessibility: LocationAccessibility;

  // Referencias geográficas
  region: string;
  municipality: string;
  state: string;
  country: string;
  timeZone: string;
}

// Información del propietario del rancho
export interface RanchOwnerInfo {
  // Propietario principal
  primaryOwner: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    idDocument: string; // Cédula, pasaporte, etc.
  };

  // Co-propietarios
  coOwners: Array<{
    userId: string;
    name: string;
    ownership: number; // Porcentaje de propiedad
    role: OwnerRole;
  }>;

  // Representante legal (si aplica)
  legalRepresentative?: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  };

  // Información de la empresa (si aplica)
  companyInfo?: {
    businessName: string;
    taxId: string; // RFC, RUT, etc.
    businessType: BusinessType;
    registrationNumber: string;
  };
}

// Información del área del rancho
export interface RanchAreaInfo {
  // Área total
  totalArea: number; // hectáreas
  totalAreaUnit: AreaUnit;

  // Distribución del área
  usableArea: number; // hectáreas utilizables
  pastureArea: number; // hectáreas de pastoreo
  cropArea: number; // hectáreas de cultivo
  facilityArea: number; // hectáreas de instalaciones
  waterArea: number; // hectáreas de cuerpos de agua
  forestArea: number; // hectáreas forestales
  unusableArea: number; // hectáreas no utilizables

  // Perímetro y forma
  perimeter: number; // metros lineales
  shape: "regular" | "irregular";

  // Capacidad de carga
  carryingCapacity: number; // cabezas de ganado por hectárea
  currentStockingRate: number; // cabezas actuales por hectárea
}

// Instalación del rancho
export interface RanchFacility extends BaseEntity {
  name: string;
  type: FacilityType;
  description?: string;
  location: Coordinates;

  // Dimensiones y capacidad
  dimensions: {
    length: number; // metros
    width: number; // metros
    height?: number; // metros
    area: number; // metros cuadrados
  };
  capacity?: number; // animales, toneladas, etc.

  // Estado y condición
  condition: FacilityCondition;
  constructionYear: number;
  lastMaintenanceDate?: Date;

  // Servicios disponibles
  hasElectricity: boolean;
  hasWater: boolean;
  hasDrainage: boolean;
  hasInternet: boolean;

  // Equipamiento
  equipment: FacilityEquipment[];

  // Costos asociados
  constructionCost?: number;
  maintenanceCosts: Array<{
    date: Date;
    description: string;
    cost: number;
  }>;
}

// Zona del rancho (potreros, sectores, etc.)
export interface RanchZone extends BaseEntity {
  name: string;
  code: string; // Código único de identificación
  type: ZoneType;
  description?: string;

  // Ubicación y área
  boundaries: Coordinates[]; // Polígono que define la zona
  centerPoint: Coordinates;
  area: number; // hectáreas

  // Características del terreno
  soilType: SoilType;
  topography: TopographyType;
  drainageQuality: DrainageQuality;

  // Uso y gestión
  currentUse: ZoneUse;
  capacity: number; // capacidad de animales
  currentOccupancy: number; // animales actuales
  rotationSchedule?: ZoneRotationSchedule;

  // Recursos disponibles
  waterSources: WaterSource[];
  feedingSources: FeedingSource[];
  shelterAreas: ShelterArea[];

  // Estado y calidad
  pastureCondition: PastureCondition;
  grassType: string[];
  lastGrazingDate?: Date;
  restPeriodDays: number;

  // Accesibilidad
  accessibility: ZoneAccessibility;
}

// Límites del rancho
export interface RanchBoundary {
  id: string;
  name: string;
  type: BoundaryType;
  coordinates: Coordinates[]; // Línea que define el límite

  // Información del límite
  length: number; // metros
  materialType: BoundaryMaterial;
  condition: FacilityCondition;

  // Vecinos y colindancias
  neighborInfo?: {
    name: string;
    type: "ranch" | "farm" | "urban" | "forest" | "water" | "public";
    contactInfo?: ContactInfo;
  };

  // Mantenimiento
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceNotes?: string;
}

// Información legal y administrativa
export interface RanchLegalInfo {
  // Registro y títulos
  propertyTitle: {
    number: string;
    registryOffice: string;
    registrationDate: Date;
    area: number;
  };

  // Permisos y licencias
  permits: RanchPermit[];

  // Impuestos y contribuciones
  taxInfo: {
    propertyTaxId: string;
    assessedValue: number;
    lastAssessmentDate: Date;
    annualTax: number;
  };

  // Seguros
  insurance: RanchInsurance[];

  // Certificaciones
  certifications: RanchCertification[];
}

// Configuración operativa del rancho
export interface RanchOperationalConfig {
  // Horarios de operación
  operatingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };

  // Estacionalidad
  seasonalOperations: {
    season: Season;
    operations: string[];
    restrictions?: string[];
  }[];

  // Protocolos de seguridad
  safetyProtocols: string[];
  emergencyContacts: EmergencyContact[];

  // Gestión de visitantes
  visitorPolicy: {
    allowVisitors: boolean;
    requiresAppointment: boolean;
    restrictedAreas: string[];
    safetyRequirements: string[];
  };

  // Configuración de tecnología
  technologyConfig: {
    hasGPS: boolean;
    hasSensors: boolean;
    hasCameras: boolean;
    hasAutomaticFeeders: boolean;
    hasWeatherStation: boolean;
  };
}

// Estado actual del rancho
export interface RanchStatus {
  isOperational: boolean;
  currentWeather?: WeatherCondition;
  currentSeason: Season;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;

  // Alertas activas
  activeAlerts: RanchAlert[];

  // Estado de recursos
  resourceStatus: {
    waterLevel: "low" | "normal" | "high";
    feedStock: "low" | "normal" | "high";
    fuelLevel: "low" | "normal" | "high";
    electricityStatus: "normal" | "intermittent" | "outage";
  };
}

// Estadísticas del rancho
export interface RanchStatistics {
  // Población animal
  totalAnimals: number;
  animalsByType: Record<string, number>;
  animalsByZone: Record<string, number>;

  // Producción
  annualProduction: {
    milk?: number; // litros
    meat?: number; // kilogramos
    offspring?: number; // crías nacidas
  };

  // Utilización de área
  areaUtilization: {
    pastureUtilizationRate: number; // porcentaje
    averageGrazingDays: number;
    averageRestDays: number;
  };

  // Indicadores económicos
  economicIndicators: {
    revenue: number;
    expenses: number;
    profitMargin: number;
    costPerHectare: number;
    costPerAnimal: number;
  };

  // Indicadores de salud
  healthIndicators: {
    mortalityRate: number;
    morbidityRate: number;
    vaccinationCoverage: number;
    averageWeight: number;
  };
}

// Metadatos del rancho
export interface RanchMetadata {
  version: string;
  lastUpdated: Date;
  updatedBy: string;
  dataSource: "manual" | "automated" | "imported";
  tags: string[];
  notes?: string;
  attachments: {
    id: string;
    name: string;
    type: "image" | "document" | "video";
    url: string;
    description?: string;
  }[];
}

// Enums y tipos adicionales

export enum RanchSpecialization {
  DAIRY = "dairy",
  BEEF_CATTLE = "beef_cattle",
  BREEDING = "breeding",
  FATTENING = "fattening",
  ORGANIC = "organic",
  SUSTAINABLE = "sustainable",
  SHOW_CATTLE = "show_cattle",
  RESEARCH = "research",
}

export enum TopographyType {
  FLAT = "flat",
  ROLLING = "rolling",
  HILLY = "hilly",
  MOUNTAINOUS = "mountainous",
  VALLEY = "valley",
  COASTAL = "coastal",
}

export enum ClimateZone {
  TROPICAL = "tropical",
  SUBTROPICAL = "subtropical",
  TEMPERATE = "temperate",
  ARID = "arid",
  SEMI_ARID = "semi_arid",
  HIGHLAND = "highland",
}

export enum OwnerRole {
  PRIMARY = "primary",
  PARTNER = "partner",
  INVESTOR = "investor",
  FAMILY_MEMBER = "family_member",
  HEIR = "heir",
}

export enum BusinessType {
  INDIVIDUAL = "individual",
  PARTNERSHIP = "partnership",
  CORPORATION = "corporation",
  COOPERATIVE = "cooperative",
  FAMILY_BUSINESS = "family_business",
}

export enum AreaUnit {
  HECTARES = "hectares",
  ACRES = "acres",
  SQUARE_METERS = "square_meters",
  SQUARE_KILOMETERS = "square_kilometers",
}

export enum FacilityType {
  BARN = "barn",
  STABLE = "stable",
  MILKING_PARLOR = "milking_parlor",
  FEED_STORAGE = "feed_storage",
  EQUIPMENT_SHED = "equipment_shed",
  OFFICE = "office",
  RESIDENCE = "residence",
  VETERINARY_CLINIC = "veterinary_clinic",
  QUARANTINE = "quarantine",
  MATERNITY_PEN = "maternity_pen",
  WATER_TANK = "water_tank",
  SILO = "silo",
  SCALES = "scales",
  LOADING_CHUTE = "loading_chute",
  CORRAL = "corral",
  FENCE = "fence",
  GATE = "gate",
}

export enum FacilityCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  NEEDS_REPAIR = "needs_repair",
  CONDEMNED = "condemned",
}

export enum ZoneType {
  PASTURE = "pasture",
  PADDOCK = "paddock",
  GRAZING_AREA = "grazing_area",
  FEED_LOT = "feed_lot",
  CROP_FIELD = "crop_field",
  WATER_AREA = "water_area",
  FOREST = "forest",
  BUILDING_AREA = "building_area",
  ACCESS_ROAD = "access_road",
  QUARANTINE = "quarantine",
  MATERNITY = "maternity",
}

export enum SoilType {
  CLAY = "clay",
  SANDY = "sandy",
  LOAM = "loam",
  ROCKY = "rocky",
  MARSHY = "marshy",
  VOLCANIC = "volcanic",
}

export enum DrainageQuality {
  EXCELLENT = "excellent",
  GOOD = "good",
  MODERATE = "moderate",
  POOR = "poor",
  WATERLOGGED = "waterlogged",
}

export enum ZoneUse {
  ACTIVE_GRAZING = "active_grazing",
  RESTING = "resting",
  MAINTENANCE = "maintenance",
  CROP_ROTATION = "crop_rotation",
  RESERVED = "reserved",
  OUT_OF_USE = "out_of_use",
}

export enum PastureCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  DEGRADED = "degraded",
  RECOVERING = "recovering",
}

export enum BoundaryType {
  FENCE = "fence",
  WALL = "wall",
  NATURAL = "natural",
  WATER = "water",
  ROAD = "road",
  LEGAL = "legal",
}

export enum BoundaryMaterial {
  BARBED_WIRE = "barbed_wire",
  ELECTRIC_FENCE = "electric_fence",
  WOODEN_FENCE = "wooden_fence",
  METAL_FENCE = "metal_fence",
  STONE_WALL = "stone_wall",
  CONCRETE_WALL = "concrete_wall",
  HEDGE = "hedge",
  NATURAL_BARRIER = "natural_barrier",
}

export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
  DRY = "dry",
  RAINY = "rainy",
}

// Interfaces adicionales

export interface LocationAccessibility {
  hasRoadAccess: boolean;
  roadType: "paved" | "dirt" | "gravel" | "trail";
  accessRestrictions?: string[];
  nearestTown: {
    name: string;
    distance: number; // kilómetros
  };
  publicTransportation: boolean;
}

export interface FacilityEquipment {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  condition: FacilityCondition;
  lastMaintenanceDate?: Date;
  warrantryExpires?: Date;
}

export interface ZoneRotationSchedule {
  rotationType: "fixed" | "flexible";
  rotationPeriodDays: number;
  restPeriodDays: number;
  startDate: Date;
  currentPhase: "grazing" | "resting";
  nextRotationDate: Date;
}

export interface WaterSource {
  id: string;
  name: string;
  type: "well" | "spring" | "pond" | "tank" | "stream" | "river";
  location: Coordinates;
  capacity?: number; // litros
  quality: "excellent" | "good" | "fair" | "poor";
  lastTestedDate?: Date;
}

export interface FeedingSource {
  id: string;
  name: string;
  type: "feeder" | "trough" | "pasture" | "supplement_station";
  location: Coordinates;
  capacity?: number; // kilogramos o litros
  feedType: string[];
}

export interface ShelterArea {
  id: string;
  name: string;
  type: "natural" | "constructed";
  location: Coordinates;
  capacity: number; // número de animales
  hasRoof: boolean;
  hasWalls: boolean;
}

export interface ZoneAccessibility {
  hasVehicleAccess: boolean;
  accessPoints: Coordinates[];
  gateLocations: Coordinates[];
  walkingTimeFromMain: number; // minutos
}

export interface RanchPermit {
  id: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expirationDate: Date;
  status: "active" | "expired" | "pending" | "suspended";
  renewalRequired: boolean;
  conditions?: string[];
}

export interface RanchInsurance {
  id: string;
  type: "property" | "livestock" | "liability" | "crop" | "equipment";
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  premiumAmount: number;
  startDate: Date;
  endDate: Date;
  deductible: number;
}

export interface RanchCertification {
  id: string;
  type: string;
  certifyingBody: string;
  certificateNumber: string;
  issueDate: Date;
  expirationDate?: Date;
  scope: string[];
  isActive: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  type: "medical" | "veterinary" | "fire" | "police" | "utility" | "other";
  available24h: boolean;
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  conditions: string;
  lastUpdate: Date;
}

export interface RanchAlert {
  id: string;
  type: "weather" | "health" | "security" | "equipment" | "resource";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  startTime: Date;
  estimatedDuration?: number; // minutos
  affectedAreas: string[];
  actions: string[];
  isResolved: boolean;
}

// Etiquetas en español para la interfaz

export const RANCH_SPECIALIZATION_LABELS = {
  [RanchSpecialization.DAIRY]: "Lechería",
  [RanchSpecialization.BEEF_CATTLE]: "Ganado de Carne",
  [RanchSpecialization.BREEDING]: "Cría",
  [RanchSpecialization.FATTENING]: "Engorda",
  [RanchSpecialization.ORGANIC]: "Orgánico",
  [RanchSpecialization.SUSTAINABLE]: "Sustentable",
  [RanchSpecialization.SHOW_CATTLE]: "Ganado de Exhibición",
  [RanchSpecialization.RESEARCH]: "Investigación",
} as const;

export const FACILITY_TYPE_LABELS = {
  [FacilityType.BARN]: "Establo",
  [FacilityType.STABLE]: "Caballeriza",
  [FacilityType.MILKING_PARLOR]: "Sala de Ordeño",
  [FacilityType.FEED_STORAGE]: "Almacén de Alimento",
  [FacilityType.EQUIPMENT_SHED]: "Bodega de Equipo",
  [FacilityType.OFFICE]: "Oficina",
  [FacilityType.RESIDENCE]: "Residencia",
  [FacilityType.VETERINARY_CLINIC]: "Clínica Veterinaria",
  [FacilityType.QUARANTINE]: "Cuarentena",
  [FacilityType.MATERNITY_PEN]: "Corral de Maternidad",
  [FacilityType.WATER_TANK]: "Tanque de Agua",
  [FacilityType.SILO]: "Silo",
  [FacilityType.SCALES]: "Báscula",
  [FacilityType.LOADING_CHUTE]: "Rampa de Carga",
  [FacilityType.CORRAL]: "Corral",
  [FacilityType.FENCE]: "Cerca",
  [FacilityType.GATE]: "Puerta",
} as const;

export const ZONE_TYPE_LABELS = {
  [ZoneType.PASTURE]: "Potrero",
  [ZoneType.PADDOCK]: "Paddock",
  [ZoneType.GRAZING_AREA]: "Área de Pastoreo",
  [ZoneType.FEED_LOT]: "Corral de Engorda",
  [ZoneType.CROP_FIELD]: "Campo de Cultivo",
  [ZoneType.WATER_AREA]: "Área de Agua",
  [ZoneType.FOREST]: "Bosque",
  [ZoneType.BUILDING_AREA]: "Área de Construcciones",
  [ZoneType.ACCESS_ROAD]: "Camino de Acceso",
  [ZoneType.QUARANTINE]: "Cuarentena",
  [ZoneType.MATERNITY]: "Maternidad",
} as const;
