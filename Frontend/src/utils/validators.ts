// Funciones de validación para la aplicación ganadera

import {
  BovineType,
  BovineGender,
  HealthStatus,
  IllnessSeverity,
} from "../constants/bovineTypes";
import { getCurrentMexicoDate } from "./dateUtils";

// Interfaz para resultados de validación
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Interfaz para validación de múltiples campos
export interface ValidationErrors {
  [field: string]: string;
}

// Validar número de arete
export const validateEarTag = (earTag: string): ValidationResult => {
  if (!earTag) {
    return { isValid: false, error: "Número de arete es requerido" };
  }

  if (earTag.length < 3) {
    return {
      isValid: false,
      error: "Número de arete debe tener al menos 3 caracteres",
    };
  }

  if (earTag.length > 20) {
    return {
      isValid: false,
      error: "Número de arete no puede tener más de 20 caracteres",
    };
  }

  if (!/^[A-Za-z0-9]+$/.test(earTag)) {
    return {
      isValid: false,
      error: "Número de arete solo puede contener letras y números",
    };
  }

  return { isValid: true };
};

// Validar correo electrónico
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: "Correo electrónico es requerido" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Formato de correo electrónico inválido" };
  }

  return { isValid: true };
};

// Validar teléfono mexicano
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: "Número de teléfono es requerido" };
  }

  // Eliminar espacios y caracteres especiales
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Validar formato mexicano (10 dígitos)
  if (!/^\d{10}$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: "Número de teléfono debe tener 10 dígitos",
    };
  }

  return { isValid: true };
};

// Validar peso del animal
export const validateWeight = (weight: number): ValidationResult => {
  if (weight === undefined || weight === null) {
    return { isValid: false, error: "Peso es requerido" };
  }

  if (weight <= 0) {
    return { isValid: false, error: "Peso debe ser mayor a 0" };
  }

  if (weight < 10) {
    return { isValid: false, error: "Peso mínimo es 10 kg" };
  }

  if (weight > 2000) {
    return { isValid: false, error: "Peso máximo es 2000 kg" };
  }

  return { isValid: true };
};

// Validar fecha de nacimiento
export const validateBirthDate = (birthDate: Date): ValidationResult => {
  if (!birthDate) {
    return { isValid: false, error: "Fecha de nacimiento es requerida" };
  }

  const now = getCurrentMexicoDate();

  if (birthDate > now) {
    return { isValid: false, error: "Fecha de nacimiento no puede ser futura" };
  }

  // Validar que no sea muy antigua (más de 30 años)
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 30);

  if (birthDate < maxAge) {
    return {
      isValid: false,
      error: "Fecha de nacimiento no puede ser anterior a 30 años",
    };
  }

  return { isValid: true };
};

// Validar fecha de vacunación
export const validateVaccinationDate = (
  vaccinationDate: Date
): ValidationResult => {
  if (!vaccinationDate) {
    return { isValid: false, error: "Fecha de vacunación es requerida" };
  }

  const now = getCurrentMexicoDate();

  // Permitir fechas hasta 30 días en el futuro
  const maxFutureDate = new Date(now);
  maxFutureDate.setDate(maxFutureDate.getDate() + 30);

  if (vaccinationDate > maxFutureDate) {
    return {
      isValid: false,
      error: "Fecha de vacunación no puede ser más de 30 días en el futuro",
    };
  }

  // No permitir fechas muy antiguas (más de 10 años)
  const minDate = new Date(now);
  minDate.setFullYear(minDate.getFullYear() - 10);

  if (vaccinationDate < minDate) {
    return {
      isValid: false,
      error: "Fecha de vacunación no puede ser anterior a 10 años",
    };
  }

  return { isValid: true };
};

// Validar coordenadas geográficas
export const validateCoordinates = (
  latitude: number,
  longitude: number
): ValidationResult => {
  if (latitude === undefined || latitude === null) {
    return { isValid: false, error: "Latitud es requerida" };
  }

  if (longitude === undefined || longitude === null) {
    return { isValid: false, error: "Longitud es requerida" };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      error: "Latitud debe estar entre -90 y 90 grados",
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: "Longitud debe estar entre -180 y 180 grados",
    };
  }

  // Validar que las coordenadas estén aproximadamente en México
  // México: latitud 14°-33°N, longitud 86°-118°W
  if (latitude < 14 || latitude > 33) {
    return {
      isValid: false,
      error: "Coordenadas fuera del territorio mexicano",
    };
  }

  if (longitude < -118 || longitude > -86) {
    return {
      isValid: false,
      error: "Coordenadas fuera del territorio mexicano",
    };
  }

  return { isValid: true };
};

// Validar nombre del animal
export const validateAnimalName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: true }; // Nombre es opcional
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: "Nombre no puede tener más de 100 caracteres",
    };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return {
      isValid: false,
      error: "Nombre solo puede contener letras y espacios",
    };
  }

  return { isValid: true };
};

// Validar tipo de ganado bovino
export const validateBovineType = (type: string): ValidationResult => {
  if (!type) {
    return { isValid: false, error: "Tipo de ganado es requerido" };
  }

  if (!Object.values(BovineType).includes(type as BovineType)) {
    return { isValid: false, error: "Tipo de ganado no válido" };
  }

  return { isValid: true };
};

// Validar género
export const validateGender = (gender: string): ValidationResult => {
  if (!gender) {
    return { isValid: false, error: "Género es requerido" };
  }

  if (!Object.values(BovineGender).includes(gender as BovineGender)) {
    return { isValid: false, error: "Género no válido" };
  }

  return { isValid: true };
};

// Validar estado de salud
export const validateHealthStatus = (status: string): ValidationResult => {
  if (!status) {
    return { isValid: false, error: "Estado de salud es requerido" };
  }

  if (!Object.values(HealthStatus).includes(status as HealthStatus)) {
    return { isValid: false, error: "Estado de salud no válido" };
  }

  return { isValid: true };
};

// Validar severidad de enfermedad
export const validateIllnessSeverity = (severity: string): ValidationResult => {
  if (!severity) {
    return { isValid: false, error: "Severidad de enfermedad es requerida" };
  }

  if (!Object.values(IllnessSeverity).includes(severity as IllnessSeverity)) {
    return { isValid: false, error: "Severidad de enfermedad no válida" };
  }

  return { isValid: true };
};

// Validar dosis de vacuna
export const validateVaccineDose = (dose: string): ValidationResult => {
  if (!dose) {
    return { isValid: false, error: "Dosis es requerida" };
  }

  if (dose.length > 50) {
    return {
      isValid: false,
      error: "Dosis no puede tener más de 50 caracteres",
    };
  }

  return { isValid: true };
};

// Validar número de lote
export const validateBatchNumber = (batchNumber: string): ValidationResult => {
  if (!batchNumber) {
    return { isValid: false, error: "Número de lote es requerido" };
  }

  if (batchNumber.length > 50) {
    return {
      isValid: false,
      error: "Número de lote no puede tener más de 50 caracteres",
    };
  }

  if (!/^[A-Za-z0-9\-_]+$/.test(batchNumber)) {
    return {
      isValid: false,
      error:
        "Número de lote solo puede contener letras, números, guiones y guiones bajos",
    };
  }

  return { isValid: true };
};

// Validar contraseña
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Contraseña es requerida" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Contraseña debe tener al menos 8 caracteres",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Contraseña no puede tener más de 128 caracteres",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      error: "Contraseña debe contener al menos una letra minúscula",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      error: "Contraseña debe contener al menos una letra mayúscula",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      error: "Contraseña debe contener al menos un número",
    };
  }

  return { isValid: true };
};

// Validar URL
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL es opcional en la mayoría de casos
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "URL no válida" };
  }
};

// Validar archivo subido
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): ValidationResult => {
  if (!file) {
    return { isValid: false, error: "Archivo es requerido" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Tipo de archivo no permitido" };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `Archivo muy grande. Máximo ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

// Validar rango de fechas
export const validateDateRange = (
  startDate: Date,
  endDate: Date
): ValidationResult => {
  if (!startDate) {
    return { isValid: false, error: "Fecha de inicio es requerida" };
  }

  if (!endDate) {
    return { isValid: false, error: "Fecha de fin es requerida" };
  }

  if (startDate > endDate) {
    return {
      isValid: false,
      error: "Fecha de inicio debe ser anterior a fecha de fin",
    };
  }

  return { isValid: true };
};

// Validar texto requerido
export const validateRequiredText = (
  text: string,
  fieldName: string,
  maxLength?: number
): ValidationResult => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (maxLength && text.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede tener más de ${maxLength} caracteres`,
    };
  }

  return { isValid: true };
};

// Validar número positivo
export const validatePositiveNumber = (
  num: number,
  fieldName: string
): ValidationResult => {
  if (num === undefined || num === null) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (num <= 0) {
    return { isValid: false, error: `${fieldName} debe ser mayor a 0` };
  }

  return { isValid: true };
};

// Validar rango de números
export const validateNumberRange = (
  num: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  if (num === undefined || num === null) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `${fieldName} debe estar entre ${min} y ${max}`,
    };
  }

  return { isValid: true };
};

// Función para validar múltiples campos
export const validateFields = (fields: {
  [key: string]: () => ValidationResult;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.entries(fields).forEach(([fieldName, validator]) => {
    const result = validator();
    if (!result.isValid) {
      errors[fieldName] = result.error || "Error de validación";
    }
  });

  return errors;
};

// Verificar si hay errores de validación
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Obtener el primer error de validación
export const getFirstValidationError = (
  errors: ValidationErrors
): string | null => {
  const errorKeys = Object.keys(errors);
  return errorKeys.length > 0 ? errors[errorKeys[0]] : null;
};
