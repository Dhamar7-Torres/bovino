// =================================================================
// EXPORTACIONES DEL MÓDULO BOVINOS - SISTEMA GANADERO UJAT
// =================================================================

// Sistema integral de gestión ganadera para bovinos
// Desarrollado para la Universidad Juárez Autónoma de Tabasco (UJAT)

import React from "react";

// =================================================================
// COMPONENTES PRINCIPALES DEL MÓDULO BOVINOS
// =================================================================

// Página principal y router del módulo
export { default as BovinesPage } from "./BovinesPage";

// Gestión de bovinos individuales
export { default as BovineAdd } from "./BovineAdd";

// Gestión de documentos y archivos
export { default as BovineDocuments } from "./BovineDocuments";

// =================================================================
// EXPORTACIONES ADICIONALES
// =================================================================

// Hook del contexto de bovinos (si se necesita en otros módulos)
export { useBovinesContext } from "./BovinesPage";

// =================================================================
// EXPORTACIONES POR DEFECTO ALTERNATIVAS
// =================================================================

// Exportación por defecto del módulo principal
export { default } from "./BovinesPage";

// =================================================================
// TIPOS E INTERFACES (si se necesitan exportar)
// =================================================================

// Interfaces comunes del módulo bovinos
export interface BovineData {
  id: string;
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  birthDate: Date;
  age: {
    years: number;
    months: number;
    days: number;
  };
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
  lastVaccination?: Date;
  nextVaccinationDue?: Date;
  photos: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
  source: 'GPS' | 'MANUAL' | 'ESTIMATED';
  batteryLevel?: number;
  signalStrength?: number;
  notes?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: DocumentCategory;
  uploadDate: Date;
  lastModified: Date;
  description?: string;
  tags: string[];
  uploadedBy: string;
  bovineId: string;
  url: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  downloadCount: number;
  version: number;
  parentId?: string;
}

export type DocumentCategory = 
  | "VACCINATION" 
  | "MEDICAL" 
  | "GENEALOGY" 
  | "CERTIFICATE" 
  | "PHOTO" 
  | "VIDEO" 
  | "REPORT" 
  | "OTHER";

export interface BovineNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  isPrivate: boolean;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: NoteAttachment[];
  reminders: NoteReminder[];
  relatedNotes: string[];
  template?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
}

export type NoteCategory = 
  | 'HEALTH' 
  | 'BEHAVIOR' 
  | 'REPRODUCTION' 
  | 'FEEDING' 
  | 'TREATMENT' 
  | 'VACCINATION' 
  | 'WEIGHT' 
  | 'GENERAL' 
  | 'EMERGENCY';

export interface NoteAttachment {
  id: string;
  name: string;
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO';
  url: string;
  size: number;
  uploadDate: Date;
}

export interface NoteReminder {
  id: string;
  date: Date;
  message: string;
  isCompleted: boolean;
  notificationSent: boolean;
}

// =================================================================
// CONSTANTES Y CONFIGURACIONES
// =================================================================

// Configuraciones por defecto del módulo
export const BOVINE_CONFIG = {
  // Límites de peso por edad (en kg)
  WEIGHT_RANGES: {
    newborn: { min: 25, max: 45 },
    "3months": { min: 80, max: 120 },
    "6months": { min: 150, max: 200 },
    "12months": { min: 250, max: 350 },
    "18months": { min: 350, max: 450 },
    "24months": { min: 400, max: 550 },
    adult_female: { min: 450, max: 650 },
    adult_male: { min: 600, max: 1000 },
  },
  
  // Razas bovinas soportadas
  BREEDS: [
    "Brahman",
    "Angus", 
    "Hereford",
    "Simmental",
    "Charolais",
    "Holstein",
    "Jersey",
    "Gyr",
    "Nelore",
    "Criollo",
    "Suizo Pardo",
    "Limousin"
  ],
  
  // Tipos de documentos soportados
  DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav'
  ],
  
  // Tamaño máximo de archivos (en bytes)
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Configuración de geolocalización
  GPS_CONFIG: {
    accuracy: 10, // metros
    timeout: 15000, // 15 segundos
    maximumAge: 300000, // 5 minutos
  },
  
  // Configuración de notificaciones
  NOTIFICATION_CONFIG: {
    autoHideDelay: 5000, // 5 segundos
    maxNotifications: 5,
  }
} as const;

// =================================================================
// UTILIDADES DEL MÓDULO
// =================================================================

// Función para calcular la edad de un bovino
export const calculateBovineAge = (birthDate: Date) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
};

// Función para formatear el peso con unidades
export const formatWeight = (weight: number) => {
  if (weight < 1000) {
    return `${weight.toFixed(1)} kg`;
  } else {
    return `${(weight / 1000).toFixed(2)} t`;
  }
};

// Función para validar el número de arete
export const validateEarTag = (earTag: string): boolean => {
  // Formato esperado: MX-XXXXXX (2 letras, guion, 6 dígitos)
  const pattern = /^[A-Z]{2}-\d{6}$/;
  return pattern.test(earTag);
};

// Función para generar un nuevo número de arete
export const generateEarTag = (country: string = 'MX'): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `${country}-${timestamp}`;
};

// Función para obtener el color del estado de salud
export const getHealthStatusColor = (status: BovineData['healthStatus']) => {
  const colors = {
    HEALTHY: 'text-green-600 bg-green-100',
    SICK: 'text-red-600 bg-red-100',
    RECOVERING: 'text-yellow-600 bg-yellow-100',
    QUARANTINE: 'text-orange-600 bg-orange-100',
    DECEASED: 'text-gray-600 bg-gray-100'
  };
  return colors[status] || colors.HEALTHY;
};

// Función para formatear la fecha de forma legible
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Función para formatear la fecha y hora
export const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// =================================================================
// HOOKS PERSONALIZADOS
// =================================================================

// Hook para filtrar bovinos
export const useBovineFilters = () => {
  const [filters, setFilters] = React.useState({
    searchTerm: '',
    type: '',
    breed: '',
    gender: '',
    healthStatus: '',
    ageRange: '',
    weightRange: ''
  });

  const applyFilters = (bovines: BovineData[]) => {
    return bovines.filter(bovine => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          bovine.earTag.toLowerCase().includes(searchLower) ||
          bovine.name?.toLowerCase().includes(searchLower) ||
          bovine.breed.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.type && bovine.type !== filters.type) return false;
      if (filters.breed && bovine.breed !== filters.breed) return false;
      if (filters.gender && bovine.gender !== filters.gender) return false;
      if (filters.healthStatus && bovine.healthStatus !== filters.healthStatus) return false;

      return true;
    });
  };

  return { filters, setFilters, applyFilters };
};

// =================================================================
// INFORMACIÓN DEL MÓDULO
// =================================================================

export const MODULE_INFO = {
  name: 'Módulo de Gestión Bovina',
  version: '2.1.4',
  description: 'Sistema integral para la administración y seguimiento del ganado bovino',
  author: 'Universidad Juárez Autónoma de Tabasco (UJAT)',
  features: [
    'Gestión completa de bovinos',
    'Seguimiento GPS y geolocalización',
    'Sistema de documentos y archivos',
    'Notas y observaciones',
    'Reportes y análisis',
    'Notificaciones en tiempo real',
    'Interfaz responsive con animaciones'
  ],
  components: {
    total: 8,
    pages: ['BovinesPage', 'BovineList', 'BovineAdd', 'BovineDetail', 'BovineEdit'],
    features: ['BovineDocuments', 'BovineLocation', 'BovineNotes'],
    utilities: ['index.ts']
  }
} as const;