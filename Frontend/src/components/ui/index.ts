// Archivo de exportaciones centralizadas para todos los componentes UI
// Este archivo permite importar cualquier componente desde una sola ubicación

// Importaciones de componentes
import { Badge } from "./Badge";
import type { BadgeProps } from "./Badge";

import { Button } from "./Button";
import type { ButtonProps } from "./Button";

import { Calendar } from "./Calendar";
import type { CalendarProps, CalendarEvent } from "./Calendar";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";
import type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from "./Card";

import { Dropdown } from "./Dropdown";
import type { DropdownProps, DropdownOption } from "./Dropdown";

import { Input } from "./Input";
import type { InputProps } from "./Input";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
import type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from "./Modal";

import { Table } from "./Table";
import type {
  TableProps,
  TableColumn,
  SortConfig,
  PaginationConfig,
} from "./Table";

import { Tabs, TabPanel } from "./Tabs";
import type { TabsProps, TabPanelProps, TabItem } from "./Tabs";

// Componente Badge
export { Badge };
export type { BadgeProps };

// Componente Button
export { Button };
export type { ButtonProps };

// Componente Calendar
export { Calendar };
export type { CalendarProps, CalendarEvent };

// Componente Card y subcomponentes
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
};

// Componente Dropdown
export { Dropdown };
export type { DropdownProps, DropdownOption };

// Componente Input
export { Input };
export type { InputProps };

// Componente Modal y subcomponentes
export { Modal, ModalHeader, ModalBody, ModalFooter };
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps };

// Componente Table
export { Table };
export type { TableProps, TableColumn, SortConfig, PaginationConfig };

// Componente Tabs y subcomponentes
export { Tabs, TabPanel };
export type { TabsProps, TabPanelProps, TabItem };

// Re-exportaciones agrupadas para facilidad de uso

// Todos los componentes de interfaz base
export const UIComponents = {
  Badge,
  Button,
  Calendar,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dropdown,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Tabs,
  TabPanel,
} as const;

// Tipos de componentes específicos para la aplicación ganadera
export interface BovineData {
  id: string;
  breed: string;
  weight: number;
  age: number;
  location: string;
  status: "healthy" | "sick" | "treatment" | "quarantine";
  lastVaccination?: Date;
  pregnancyStatus?: "pregnant" | "not_pregnant" | "calved";
  gender: "male" | "female";
  birthDate: Date;
  motherID?: string;
  fatherID?: string;
  notes?: string;
}

export interface VaccinationEvent {
  id: string;
  bovineId: string;
  vaccineType: string;
  date: Date;
  veterinarian: string;
  nextDueDate?: Date;
  notes?: string;
  location: string;
}

export interface HealthRecord {
  id: string;
  bovineId: string;
  type: "vaccination" | "treatment" | "checkup" | "diagnosis";
  date: Date;
  description: string;
  veterinarian: string;
  medications?: string[];
  followUpDate?: Date;
  cost?: number;
  location: string;
}

export interface BreedingRecord {
  id: string;
  femaleId: string;
  maleId?: string; // Puede ser null en caso de inseminación artificial
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer";
  breedingDate: Date;
  expectedCalvingDate?: Date;
  actualCalvingDate?: Date;
  calfId?: string;
  success: boolean;
  notes?: string;
  location: string;
}

export interface LocationData {
  id: string;
  name: string;
  type: "paddock" | "barn" | "quarantine" | "treatment_area" | "breeding_area";
  capacity: number;
  currentOccupancy: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  size?: number; // en hectáreas
  description?: string;
}

// Utilidades para trabajar con fechas en el contexto ganadero
export const CattleUtils = {
  // Calcular edad en años y meses
  calculateAge: (birthDate: Date): { years: number; months: number } => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return { years, months };
  },

  // Calcular fecha estimada de parto (283 días después del servicio)
  calculateDueDate: (breedingDate: Date): Date => {
    const dueDate = new Date(breedingDate);
    dueDate.setDate(dueDate.getDate() + 283);
    return dueDate;
  },

  // Verificar si una vacuna está vencida
  isVaccinationDue: (
    lastVaccination: Date,
    intervalMonths: number
  ): boolean => {
    const now = new Date();
    const nextDue = new Date(lastVaccination);
    nextDue.setMonth(nextDue.getMonth() + intervalMonths);
    return now >= nextDue;
  },

  // Formatear peso con unidad
  formatWeight: (weight: number): string => {
    return `${weight.toFixed(1)} kg`;
  },

  // Generar ID único para bovino
  generateBovineId: (prefix: string = "BOV"): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}${random}`;
  },

  // Validar ID de bovino
  validateBovineId: (id: string): boolean => {
    const pattern = /^[A-Z]{2,4}-\d{6,}$/;
    return pattern.test(id);
  },
} as const;

// Constantes para la aplicación ganadera
export const CattleConstants = {
  // Razas comunes
  BREEDS: [
    "Holstein",
    "Angus",
    "Hereford",
    "Charolais",
    "Simmental",
    "Brahman",
    "Jersey",
    "Limousin",
    "Gelbvieh",
    "Red Angus",
    "Shorthorn",
    "Wagyu",
    "Zebu",
    "Criolla",
    "Mezclado",
  ] as const,

  // Tipos de vacunas comunes
  VACCINE_TYPES: [
    "Aftosa",
    "Brucelosis",
    "Carbón Bacteriano",
    "Clostridiosis",
    "Diarrea Viral Bovina",
    "IBR",
    "Leptospirosis",
    "Rabia",
    "Rinotraqueitis",
    "Vacuna Triple",
  ] as const,

  // Estados de salud
  HEALTH_STATUS: [
    { value: "healthy", label: "Saludable", color: "green" },
    { value: "sick", label: "Enfermo", color: "red" },
    { value: "treatment", label: "En Tratamiento", color: "yellow" },
    { value: "quarantine", label: "En Cuarentena", color: "orange" },
    { value: "pregnant", label: "Preñada", color: "pink" },
    { value: "breeding", label: "Reproducción", color: "purple" },
  ] as const,

  // Intervalos de vacunación (en meses)
  VACCINATION_INTERVALS: {
    aftosa: 6,
    brucelosis: 12,
    carbon: 12,
    clostridiosis: 6,
    dvb: 12,
    ibr: 12,
    leptospirosis: 6,
    rabia: 12,
    rinotraqueitis: 12,
    triple: 6,
  } as const,

  // Pesos promedio por edad (en kg)
  AVERAGE_WEIGHTS: {
    newborn: { min: 25, max: 45 },
    "3months": { min: 80, max: 120 },
    "6months": { min: 150, max: 200 },
    "12months": { min: 250, max: 350 },
    "18months": { min: 350, max: 450 },
    "24months": { min: 400, max: 550 },
    adult_female: { min: 450, max: 650 },
    adult_male: { min: 600, max: 1000 },
  } as const,
} as const;

// Configuraciones por defecto para componentes
export const DefaultConfigs = {
  // Configuración por defecto para tabla de bovinos
  bovineTableColumns: [
    { key: "id", header: "ID", sortable: true, width: 120 },
    { key: "breed", header: "Raza", sortable: true },
    { key: "age", header: "Edad", sortable: true, width: 100 },
    {
      key: "weight",
      header: "Peso",
      sortable: true,
      width: 100,
      align: "right" as const,
    },
    { key: "location", header: "Ubicación", sortable: true },
    { key: "status", header: "Estado", sortable: true, width: 120 },
  ],

  // Configuración por defecto para paginación
  pagination: {
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: true,
  },

  // Configuración por defecto para calendario de eventos
  calendarEvents: {
    vaccination: { color: "#3B82F6", label: "Vacunación" },
    breeding: { color: "#8B5CF6", label: "Reproducción" },
    health: { color: "#EF4444", label: "Salud" },
    feeding: { color: "#10B981", label: "Alimentación" },
    veterinary: { color: "#F59E0B", label: "Veterinario" },
    general: { color: "#6B7280", label: "General" },
  },
} as const;
