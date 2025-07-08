// ============================================================================
// ARCHIVO INDEX.TS - SERVICIOS DE LA APLICACIÓN GANADERA
// ============================================================================
// Este archivo centraliza la exportación de servicios disponibles

// ============================================================================
// SERVICIO DE API BASE
// ============================================================================

// Exportar servicio de API base
export { api, apiClient } from "./api";

// ============================================================================
// SERVICIOS EXISTENTES DEL PROYECTO ORIGINAL
// ============================================================================

// Solo exportar servicios que sabemos que existen
export { bovinesService } from "./bovinesService";
export { eventsService } from "./eventsService";
export { financeService } from "./financeService";
export { healthService } from "./healthService";
export { inventoryService } from "./inventoryService";

// ============================================================================
// SERVICIOS NUEVOS (COMENTADOS HASTA QUE ESTÉN INTEGRADOS)
// ============================================================================

// Descomenta estas líneas cuando los servicios estén completamente integrados:

// export { mapsService } from './mapsService';
// export { productionService } from './productionService';
// export { reportsService } from './reportsService';
// export { userService } from './userService';

// ============================================================================
// IMPORTACIONES PARA USO INTERNO
// ============================================================================

import { bovinesService } from "./bovinesService";
import { eventsService } from "./eventsService";
import { financeService } from "./financeService";
import { healthService } from "./healthService";
import { inventoryService } from "./inventoryService";

// Importaciones condicionales de servicios nuevos (comentadas por ahora)
// import { mapsService } from './mapsService';
// import { productionService } from './productionService';
// import { reportsService } from './reportsService';
// import { userService } from './userService';

// ============================================================================
// AGRUPACIONES DE SERVICIOS EXISTENTES
// ============================================================================

// Servicios de gestión ganadera (solo existentes)
export const livestockServices = {
  bovines: bovinesService,
  health: healthService,
  events: eventsService,
  // production: productionService, // Descomenta cuando esté listo
};

// Servicios de análisis y reportes (solo existentes)
export const analyticsServices = {
  finance: financeService,
  // reports: reportsService, // Descomenta cuando esté listo
};

// Servicios de infraestructura (solo existentes)
export const infrastructureServices = {
  inventory: inventoryService,
  // maps: mapsService, // Descomenta cuando esté listo
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

// Verificar qué servicios están disponibles
export const getAvailableServices = () => {
  const available = {
    bovines: !!bovinesService,
    events: !!eventsService,
    finance: !!financeService,
    health: !!healthService,
    inventory: !!inventoryService,
    // Servicios nuevos (comentados)
    // maps: !!mapsService,
    // production: !!productionService,
    // reports: !!reportsService,
    // user: !!userService,
  };

  console.log("📊 Servicios disponibles:", available);
  return available;
};

// Obtener todos los servicios disponibles
export const getAllServices = () => {
  return {
    bovines: bovinesService,
    events: eventsService,
    finance: financeService,
    health: healthService,
    inventory: inventoryService,
    // Servicios nuevos (comentados)
    // maps: mapsService,
    // production: productionService,
    // reports: reportsService,
    // user: userService,
  };
};

// Función de limpieza básica
export const cleanupServices = () => {
  try {
    console.log("🧹 Limpiando recursos de servicios...");

    // Aquí se pueden agregar llamadas de limpieza específicas
    // cuando los servicios nuevos estén integrados

    console.log("✅ Recursos limpiados");
  } catch (error) {
    console.error("❌ Error en limpieza:", error);
  }
};

// ============================================================================
// TIPOS BÁSICOS COMPARTIDOS
// ============================================================================

// Tipo básico de ubicación
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: string;
}

// Tipo básico de rango de fechas
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Respuesta paginada básica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// EXPORT DEFAULT SIMPLE
// ============================================================================

// Objeto principal con servicios disponibles
const services = {
  // Servicios existentes garantizados
  bovines: bovinesService,
  events: eventsService,
  finance: financeService,
  health: healthService,
  inventory: inventoryService,

  // Utilidades
  getAvailable: getAvailableServices,
  getAll: getAllServices,
  cleanup: cleanupServices,
};

export default services;

// ============================================================================
// INSTRUCCIONES PARA INTEGRAR SERVICIOS NUEVOS
// ============================================================================

/* 
Para integrar los servicios nuevos:

1. Verifica que los archivos existan:
   - ./mapsService.ts
   - ./productionService.ts
   - ./reportsService.ts
   - ./userService.ts

2. Descomenta las líneas de export correspondientes en la sección "SERVICIOS NUEVOS"

3. Descomenta las líneas de import en la sección "IMPORTACIONES PARA USO INTERNO"

4. Descomenta las referencias en las agrupaciones de servicios

5. Descomenta las referencias en las funciones de utilidad

Ejemplo:
// export { mapsService } from './mapsService';
export { mapsService } from './mapsService';
*/
