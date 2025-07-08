// Funciones helper generales para la aplicación ganadera

import { Bovine, Vaccination, HealthStatus } from "../constants/bovineTypes";

// Helper para generar IDs únicos
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Helper para generar UUID v4 simple
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper para crear slug a partir de texto
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Helper para capitalizar primera letra
export const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Helper para capitalizar cada palabra
export const capitalizeWords = (text: string): string => {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

// Helper para obtener iniciales
export const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

// Helper para copiar al portapapeles
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error("Error al copiar al portapapeles:", error);
    return false;
  }
};

// Helper para descargar archivo
export const downloadFile = (
  data: string,
  filename: string,
  mimeType: string = "text/plain"
): void => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Helper para detectar dispositivo móvil
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper para detectar si está online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Helper para delay/sleep
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper para retry con exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }

  throw lastError!;
};

// Helper para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// Helper para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Helper para obtener valor anidado de objeto
export const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Helper para establecer valor anidado en objeto
export const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
};

// Helper para aplanar array de arrays
export const flatten = <T>(arrays: T[][]): T[] => {
  return arrays.reduce((acc, arr) => acc.concat(arr), []);
};

// Helper para remover duplicados de array
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return Array.from(new Set(array));
  }

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Helper para chunking de arrays
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Helper para obtener valor aleatorio de array
export const getRandomItem = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};

// Helper para mezclar array (shuffle)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper para formatear bytes
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper para obtener extensión de archivo
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Helper para validar si es imagen
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Helper para obtener color de contraste
export const getContrastColor = (hexColor: string): string => {
  // Remover # si existe
  const color = hexColor.replace("#", "");

  // Convertir a RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Helper para generar color aleatorio
export const generateRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Helper para interpolar colores
export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  const c1 = color1.replace("#", "");
  const c2 = color2.replace("#", "");

  const r1 = parseInt(c1.substr(0, 2), 16);
  const g1 = parseInt(c1.substr(2, 2), 16);
  const b1 = parseInt(c1.substr(4, 2), 16);

  const r2 = parseInt(c2.substr(0, 2), 16);
  const g2 = parseInt(c2.substr(2, 2), 16);
  const b2 = parseInt(c2.substr(4, 2), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helpers específicos para ganado
export const getCattleByHealth = (
  cattle: Bovine[],
  status: HealthStatus
): Bovine[] => {
  return cattle.filter((animal) => animal.healthStatus === status);
};

// Helper para obtener vacunaciones vencidas
export const getOverdueVaccinations = (
  vaccinations: Vaccination[]
): Vaccination[] => {
  const now = new Date();
  return vaccinations.filter((vaccination) => {
    if (!vaccination.nextDueDate) return false;
    return new Date(vaccination.nextDueDate) < now;
  });
};

// Helper para obtener animales enfermos
export const getSickCattle = (cattle: Bovine[]): Bovine[] => {
  return cattle.filter(
    (animal) =>
      animal.healthStatus === HealthStatus.SICK ||
      animal.healthStatus === HealthStatus.QUARANTINE
  );
};

// Helper para obtener animales por rango de edad
export const getCattleByAgeRange = (
  cattle: Bovine[],
  minMonths: number,
  maxMonths: number
): Bovine[] => {
  const now = new Date();

  return cattle.filter((animal) => {
    const birthDate = new Date(animal.birthDate);
    const ageInMonths =
      (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return ageInMonths >= minMonths && ageInMonths <= maxMonths;
  });
};

// Helper para buscar ganado por múltiples criterios
export const searchCattle = (
  cattle: Bovine[],
  query: string,
  fields: (keyof Bovine)[] = ["earTag", "name", "breed"]
): Bovine[] => {
  if (!query.trim()) return cattle;

  const lowerQuery = query.toLowerCase();

  return cattle.filter((animal) =>
    fields.some((field) => {
      const value = animal[field];
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    })
  );
};

// Helper para exportar datos a CSV
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escapar valores que contengan comas o comillas
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv");
};

// Helper para exportar datos a JSON
export const exportToJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, "application/json");
};

// Helper para comprimir imagen
export const compressImage = (
  file: File,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      const maxWidth = 1200;
      const maxHeight = 1200;

      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Error al comprimir imagen"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Error al cargar imagen"));
    img.src = URL.createObjectURL(file);
  });
};

// Helper para calcular checksum simple
export const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  return Math.abs(hash).toString(16);
};
