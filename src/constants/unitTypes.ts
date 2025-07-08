// Tipos y constantes para unidades de medida en sistemas ganaderos

export interface BaseUnit {
  code: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  baseUnit?: string; // Unidad base para conversiones
  conversionFactor?: number; // Factor para convertir a unidad base
  precision: number; // Decimales a mostrar
  isMetric: boolean;
  region?: UnitRegion;
}

// Información de conversión entre unidades
export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
  formula?: string; // Para conversiones no lineales (ej: temperatura)
  offset?: number; // Para conversiones con offset (ej: temperatura)
}

// Medida con unidad
export interface UnitMeasurement {
  value: number;
  unit: string;
  precision?: number;
  formatted?: string;
}

// Rango de valores con unidades
export interface UnitRange {
  min: UnitMeasurement;
  max: UnitMeasurement;
  optimal?: UnitMeasurement;
  unit: string;
}

// Configuración de formato de unidad
export interface UnitFormatConfig {
  showSymbol: boolean;
  showFullName: boolean;
  position: "before" | "after";
  separator: string;
  locale: string;
}

// Enums para categorías de unidades
export enum UnitCategory {
  WEIGHT = "weight",
  VOLUME = "volume",
  LENGTH = "length",
  AREA = "area",
  TEMPERATURE = "temperature",
  PRESSURE = "pressure",
  ENERGY = "energy",
  CONCENTRATION = "concentration",
  FLOW_RATE = "flow_rate",
  DENSITY = "density",
  CONDUCTIVITY = "conductivity",
  CURRENCY = "currency",
  TIME = "time",
  FREQUENCY = "frequency",
  PERCENTAGE = "percentage",
  COUNT = "count",
  RATIO = "ratio",
  VELOCITY = "velocity",
}

// Regiones para sistemas de unidades
export enum UnitRegion {
  METRIC = "metric",
  IMPERIAL = "imperial",
  US_CUSTOMARY = "us_customary",
  MIXED = "mixed",
}

// Precisión de medición
export enum MeasurementPrecision {
  EXACT = "exact",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  APPROXIMATE = "approximate",
}

// Unidades de peso
export const WEIGHT_UNITS: Record<string, BaseUnit> = {
  // Sistema métrico
  KG: {
    code: "kg",
    name: "Kilogramo",
    symbol: "kg",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  G: {
    code: "g",
    name: "Gramo",
    symbol: "g",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 0.001,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MG: {
    code: "mg",
    name: "Miligramo",
    symbol: "mg",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 0.000001,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  // Sistema imperial
  LB: {
    code: "lb",
    name: "Libra",
    symbol: "lb",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 0.453592,
    precision: 1,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  OZ: {
    code: "oz",
    name: "Onza",
    symbol: "oz",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 0.0283495,
    precision: 2,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  TON: {
    code: "ton",
    name: "Tonelada",
    symbol: "t",
    category: UnitCategory.WEIGHT,
    baseUnit: "kg",
    conversionFactor: 1000,
    precision: 3,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de volumen
export const VOLUME_UNITS: Record<string, BaseUnit> = {
  // Sistema métrico
  L: {
    code: "l",
    name: "Litro",
    symbol: "L",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  ML: {
    code: "ml",
    name: "Mililitro",
    symbol: "ml",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 0.001,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  M3: {
    code: "m3",
    name: "Metro Cúbico",
    symbol: "m³",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 1000,
    precision: 3,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  // Sistema imperial
  GAL: {
    code: "gal",
    name: "Galón",
    symbol: "gal",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 3.78541,
    precision: 2,
    isMetric: false,
    region: UnitRegion.US_CUSTOMARY,
  },
  QT: {
    code: "qt",
    name: "Cuarto",
    symbol: "qt",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 0.946353,
    precision: 2,
    isMetric: false,
    region: UnitRegion.US_CUSTOMARY,
  },
  FL_OZ: {
    code: "fl_oz",
    name: "Onza Fluida",
    symbol: "fl oz",
    category: UnitCategory.VOLUME,
    baseUnit: "l",
    conversionFactor: 0.0295735,
    precision: 2,
    isMetric: false,
    region: UnitRegion.US_CUSTOMARY,
  },
} as const;

// Unidades de longitud/distancia
export const LENGTH_UNITS: Record<string, BaseUnit> = {
  // Sistema métrico
  M: {
    code: "m",
    name: "Metro",
    symbol: "m",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  CM: {
    code: "cm",
    name: "Centímetro",
    symbol: "cm",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 0.01,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MM: {
    code: "mm",
    name: "Milímetro",
    symbol: "mm",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 0.001,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  KM: {
    code: "km",
    name: "Kilómetro",
    symbol: "km",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 1000,
    precision: 3,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  // Sistema imperial
  FT: {
    code: "ft",
    name: "Pie",
    symbol: "ft",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 0.3048,
    precision: 2,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  IN: {
    code: "in",
    name: "Pulgada",
    symbol: "in",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 0.0254,
    precision: 2,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  YD: {
    code: "yd",
    name: "Yarda",
    symbol: "yd",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 0.9144,
    precision: 2,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  MI: {
    code: "mi",
    name: "Milla",
    symbol: "mi",
    category: UnitCategory.LENGTH,
    baseUnit: "m",
    conversionFactor: 1609.34,
    precision: 3,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
} as const;

// Unidades de área
export const AREA_UNITS: Record<string, BaseUnit> = {
  // Sistema métrico
  M2: {
    code: "m2",
    name: "Metro Cuadrado",
    symbol: "m²",
    category: UnitCategory.AREA,
    baseUnit: "m2",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  HA: {
    code: "ha",
    name: "Hectárea",
    symbol: "ha",
    category: UnitCategory.AREA,
    baseUnit: "m2",
    conversionFactor: 10000,
    precision: 4,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  KM2: {
    code: "km2",
    name: "Kilómetro Cuadrado",
    symbol: "km²",
    category: UnitCategory.AREA,
    baseUnit: "m2",
    conversionFactor: 1000000,
    precision: 6,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  // Sistema imperial
  FT2: {
    code: "ft2",
    name: "Pie Cuadrado",
    symbol: "ft²",
    category: UnitCategory.AREA,
    baseUnit: "m2",
    conversionFactor: 0.092903,
    precision: 2,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  ACRE: {
    code: "acre",
    name: "Acre",
    symbol: "acre",
    category: UnitCategory.AREA,
    baseUnit: "m2",
    conversionFactor: 4046.86,
    precision: 4,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
} as const;

// Unidades de temperatura
export const TEMPERATURE_UNITS: Record<string, BaseUnit> = {
  CELSIUS: {
    code: "c",
    name: "Celsius",
    symbol: "°C",
    category: UnitCategory.TEMPERATURE,
    baseUnit: "c",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  FAHRENHEIT: {
    code: "f",
    name: "Fahrenheit",
    symbol: "°F",
    category: UnitCategory.TEMPERATURE,
    baseUnit: "c",
    precision: 1,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  KELVIN: {
    code: "k",
    name: "Kelvin",
    symbol: "K",
    category: UnitCategory.TEMPERATURE,
    baseUnit: "c",
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de presión
export const PRESSURE_UNITS: Record<string, BaseUnit> = {
  KPA: {
    code: "kpa",
    name: "Kilopascal",
    symbol: "kPa",
    category: UnitCategory.PRESSURE,
    baseUnit: "kpa",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  HPA: {
    code: "hpa",
    name: "Hectopascal",
    symbol: "hPa",
    category: UnitCategory.PRESSURE,
    baseUnit: "kpa",
    conversionFactor: 0.1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  PSI: {
    code: "psi",
    name: "Libras por Pulgada Cuadrada",
    symbol: "psi",
    category: UnitCategory.PRESSURE,
    baseUnit: "kpa",
    conversionFactor: 6.89476,
    precision: 1,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  MMHG: {
    code: "mmhg",
    name: "Milímetros de Mercurio",
    symbol: "mmHg",
    category: UnitCategory.PRESSURE,
    baseUnit: "kpa",
    conversionFactor: 0.133322,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de energía
export const ENERGY_UNITS: Record<string, BaseUnit> = {
  MCAL_KG: {
    code: "mcal_kg",
    name: "Megacaloría por Kilogramo",
    symbol: "Mcal/kg",
    category: UnitCategory.ENERGY,
    baseUnit: "mcal_kg",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  KCAL_KG: {
    code: "kcal_kg",
    name: "Kilocaloría por Kilogramo",
    symbol: "kcal/kg",
    category: UnitCategory.ENERGY,
    baseUnit: "mcal_kg",
    conversionFactor: 0.001,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MJ_KG: {
    code: "mj_kg",
    name: "Megajulio por Kilogramo",
    symbol: "MJ/kg",
    category: UnitCategory.ENERGY,
    baseUnit: "mcal_kg",
    conversionFactor: 0.239006,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de concentración
export const CONCENTRATION_UNITS: Record<string, BaseUnit> = {
  PERCENT: {
    code: "percent",
    name: "Porcentaje",
    symbol: "%",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "percent",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  PPM: {
    code: "ppm",
    name: "Partes por Millón",
    symbol: "ppm",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "percent",
    conversionFactor: 0.0001,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MG_L: {
    code: "mg_l",
    name: "Miligramos por Litro",
    symbol: "mg/L",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "mg_l",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  G_L: {
    code: "g_l",
    name: "Gramos por Litro",
    symbol: "g/L",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "mg_l",
    conversionFactor: 1000,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MG_ML: {
    code: "mg_ml",
    name: "Miligramos por Mililitro",
    symbol: "mg/ml",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "mg_l",
    conversionFactor: 1000,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de flujo
export const FLOW_RATE_UNITS: Record<string, BaseUnit> = {
  L_MIN: {
    code: "l_min",
    name: "Litros por Minuto",
    symbol: "L/min",
    category: UnitCategory.FLOW_RATE,
    baseUnit: "l_min",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  L_H: {
    code: "l_h",
    name: "Litros por Hora",
    symbol: "L/h",
    category: UnitCategory.FLOW_RATE,
    baseUnit: "l_min",
    conversionFactor: 0.0166667,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  GAL_MIN: {
    code: "gal_min",
    name: "Galones por Minuto",
    symbol: "gal/min",
    category: UnitCategory.FLOW_RATE,
    baseUnit: "l_min",
    conversionFactor: 3.78541,
    precision: 2,
    isMetric: false,
    region: UnitRegion.US_CUSTOMARY,
  },
} as const;

// Unidades de densidad
export const DENSITY_UNITS: Record<string, BaseUnit> = {
  ANIMALS_HA: {
    code: "animals_ha",
    name: "Animales por Hectárea",
    symbol: "animales/ha",
    category: UnitCategory.DENSITY,
    baseUnit: "animals_ha",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  ANIMALS_ACRE: {
    code: "animals_acre",
    name: "Animales por Acre",
    symbol: "animales/acre",
    category: UnitCategory.DENSITY,
    baseUnit: "animals_ha",
    conversionFactor: 2.47105,
    precision: 1,
    isMetric: false,
    region: UnitRegion.IMPERIAL,
  },
  KG_M3: {
    code: "kg_m3",
    name: "Kilogramos por Metro Cúbico",
    symbol: "kg/m³",
    category: UnitCategory.DENSITY,
    baseUnit: "kg_m3",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de tiempo
export const TIME_UNITS: Record<string, BaseUnit> = {
  SECOND: {
    code: "s",
    name: "Segundo",
    symbol: "s",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 1,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MINUTE: {
    code: "min",
    name: "Minuto",
    symbol: "min",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 60,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  HOUR: {
    code: "h",
    name: "Hora",
    symbol: "h",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 3600,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  DAY: {
    code: "d",
    name: "Día",
    symbol: "días",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 86400,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  WEEK: {
    code: "w",
    name: "Semana",
    symbol: "semanas",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 604800,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  MONTH: {
    code: "mo",
    name: "Mes",
    symbol: "meses",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 2629746,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  YEAR: {
    code: "y",
    name: "Año",
    symbol: "años",
    category: UnitCategory.TIME,
    baseUnit: "s",
    conversionFactor: 31556952,
    precision: 1,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Unidades de moneda
export const CURRENCY_UNITS: Record<string, BaseUnit> = {
  MXN: {
    code: "mxn",
    name: "Peso Mexicano",
    symbol: "$",
    category: UnitCategory.CURRENCY,
    baseUnit: "mxn",
    conversionFactor: 1,
    precision: 2,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  USD: {
    code: "usd",
    name: "Dólar Estadounidense",
    symbol: "US$",
    category: UnitCategory.CURRENCY,
    baseUnit: "mxn",
    conversionFactor: 17.5, // Aproximado, debe actualizarse dinámicamente
    precision: 2,
    isMetric: true,
    region: UnitRegion.US_CUSTOMARY,
  },
} as const;

// Unidades especiales para ganadería
export const LIVESTOCK_UNITS: Record<string, BaseUnit> = {
  HEAD: {
    code: "head",
    name: "Cabeza",
    symbol: "cabezas",
    category: UnitCategory.COUNT,
    baseUnit: "head",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  DOSE: {
    code: "dose",
    name: "Dosis",
    symbol: "dosis",
    category: UnitCategory.COUNT,
    baseUnit: "dose",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  BPM: {
    code: "bpm",
    name: "Latidos por Minuto",
    symbol: "lpm",
    category: UnitCategory.FREQUENCY,
    baseUnit: "bpm",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  RPM: {
    code: "rpm",
    name: "Respiraciones por Minuto",
    symbol: "rpm",
    category: UnitCategory.FREQUENCY,
    baseUnit: "rpm",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  CFU_ML: {
    code: "cfu_ml",
    name: "Unidades Formadoras de Colonias por Mililitro",
    symbol: "UFC/ml",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "cfu_ml",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
  CELLS_ML: {
    code: "cells_ml",
    name: "Células por Mililitro",
    symbol: "células/ml",
    category: UnitCategory.CONCENTRATION,
    baseUnit: "cells_ml",
    conversionFactor: 1,
    precision: 0,
    isMetric: true,
    region: UnitRegion.METRIC,
  },
} as const;

// Mapa completo de todas las unidades
export const ALL_UNITS = {
  ...WEIGHT_UNITS,
  ...VOLUME_UNITS,
  ...LENGTH_UNITS,
  ...AREA_UNITS,
  ...TEMPERATURE_UNITS,
  ...PRESSURE_UNITS,
  ...ENERGY_UNITS,
  ...CONCENTRATION_UNITS,
  ...FLOW_RATE_UNITS,
  ...DENSITY_UNITS,
  ...TIME_UNITS,
  ...CURRENCY_UNITS,
  ...LIVESTOCK_UNITS,
} as const;

// Conversiones específicas (no lineales)
export const SPECIAL_CONVERSIONS: UnitConversion[] = [
  // Temperatura
  {
    fromUnit: "c",
    toUnit: "f",
    factor: 9 / 5,
    offset: 32,
    formula: "(°C × 9/5) + 32",
  },
  {
    fromUnit: "f",
    toUnit: "c",
    factor: 5 / 9,
    offset: -32,
    formula: "(°F - 32) × 5/9",
  },
  {
    fromUnit: "c",
    toUnit: "k",
    factor: 1,
    offset: 273.15,
    formula: "°C + 273.15",
  },
  {
    fromUnit: "k",
    toUnit: "c",
    factor: 1,
    offset: -273.15,
    formula: "K - 273.15",
  },
];

// Etiquetas en español para categorías
export const UNIT_CATEGORY_LABELS = {
  [UnitCategory.WEIGHT]: "Peso",
  [UnitCategory.VOLUME]: "Volumen",
  [UnitCategory.LENGTH]: "Longitud",
  [UnitCategory.AREA]: "Área",
  [UnitCategory.TEMPERATURE]: "Temperatura",
  [UnitCategory.PRESSURE]: "Presión",
  [UnitCategory.ENERGY]: "Energía",
  [UnitCategory.CONCENTRATION]: "Concentración",
  [UnitCategory.FLOW_RATE]: "Flujo",
  [UnitCategory.DENSITY]: "Densidad",
  [UnitCategory.CONDUCTIVITY]: "Conductividad",
  [UnitCategory.CURRENCY]: "Moneda",
  [UnitCategory.TIME]: "Tiempo",
  [UnitCategory.FREQUENCY]: "Frecuencia",
  [UnitCategory.PERCENTAGE]: "Porcentaje",
  [UnitCategory.COUNT]: "Conteo",
  [UnitCategory.RATIO]: "Proporción",
  [UnitCategory.VELOCITY]: "Velocidad",
} as const;

// Unidades por defecto para cada categoría
export const DEFAULT_UNITS_BY_CATEGORY: Record<UnitCategory, string> = {
  [UnitCategory.WEIGHT]: "kg",
  [UnitCategory.VOLUME]: "l",
  [UnitCategory.LENGTH]: "m",
  [UnitCategory.AREA]: "ha",
  [UnitCategory.TEMPERATURE]: "c",
  [UnitCategory.PRESSURE]: "kpa",
  [UnitCategory.ENERGY]: "mcal_kg",
  [UnitCategory.CONCENTRATION]: "percent",
  [UnitCategory.FLOW_RATE]: "l_min",
  [UnitCategory.DENSITY]: "animals_ha",
  [UnitCategory.CONDUCTIVITY]: "ms_cm",
  [UnitCategory.CURRENCY]: "mxn",
  [UnitCategory.TIME]: "d",
  [UnitCategory.FREQUENCY]: "bpm",
  [UnitCategory.PERCENTAGE]: "percent",
  [UnitCategory.COUNT]: "head",
  [UnitCategory.RATIO]: "ratio",
  [UnitCategory.VELOCITY]: "km_h",
};

// Funciones helper para unidades
export const unitHelpers = {
  // Convertir entre unidades
  convert: (value: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return value;

    const fromUnitInfo = ALL_UNITS[fromUnit.toUpperCase()];
    const toUnitInfo = ALL_UNITS[toUnit.toUpperCase()];

    if (!fromUnitInfo || !toUnitInfo) {
      throw new Error(`Unidad no encontrada: ${fromUnit} o ${toUnit}`);
    }

    if (fromUnitInfo.category !== toUnitInfo.category) {
      throw new Error(
        `No se puede convertir entre categorías diferentes: ${fromUnitInfo.category} y ${toUnitInfo.category}`
      );
    }

    // Buscar conversión especial
    const specialConversion = SPECIAL_CONVERSIONS.find(
      (conv) => conv.fromUnit === fromUnit && conv.toUnit === toUnit
    );

    if (specialConversion) {
      let result = value;
      if (specialConversion.offset) {
        result =
          (value + (specialConversion.offset || 0)) * specialConversion.factor;
      } else {
        result =
          value * specialConversion.factor + (specialConversion.offset || 0);
      }
      return result;
    }

    // Conversión estándar a través de unidad base
    if (
      fromUnitInfo.baseUnit &&
      toUnitInfo.baseUnit &&
      fromUnitInfo.conversionFactor &&
      toUnitInfo.conversionFactor
    ) {
      const baseValue = value * fromUnitInfo.conversionFactor;
      return baseValue / toUnitInfo.conversionFactor;
    }

    throw new Error(`No se puede convertir de ${fromUnit} a ${toUnit}`);
  },

  // Formatear valor con unidad
  format: (
    value: number,
    unit: string,
    config: Partial<UnitFormatConfig> = {}
  ): string => {
    const unitInfo = ALL_UNITS[unit.toUpperCase()];
    if (!unitInfo) return `${value} ${unit}`;

    const {
      showSymbol = true,
      showFullName = false,
      position = "after",
      separator = " ",
      locale = "es-MX",
    } = config;

    const formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: unitInfo.precision,
    }).format(value);

    const unitText = showFullName
      ? unitInfo.name
      : showSymbol
      ? unitInfo.symbol
      : unitInfo.code;

    return position === "before"
      ? `${unitText}${separator}${formattedValue}`
      : `${formattedValue}${separator}${unitText}`;
  },

  // Obtener unidades por categoría
  getUnitsByCategory: (category: UnitCategory): BaseUnit[] => {
    return Object.values(ALL_UNITS).filter(
      (unit) => unit.category === category
    );
  },

  // Validar que una unidad existe
  isValidUnit: (unit: string): boolean => {
    return unit.toUpperCase() in ALL_UNITS;
  },

  // Obtener unidad por defecto para una categoría
  getDefaultUnit: (category: UnitCategory): string => {
    return DEFAULT_UNITS_BY_CATEGORY[category] || "";
  },

  // Crear medida con unidad
  createMeasurement: (value: number, unit: string): UnitMeasurement => {
    const unitInfo = ALL_UNITS[unit.toUpperCase()];
    return {
      value,
      unit: unit.toLowerCase(),
      precision: unitInfo?.precision || 2,
      formatted: unitInfo
        ? unitHelpers.format(value, unit)
        : `${value} ${unit}`,
    };
  },

  // Convertir medida a otra unidad
  convertMeasurement: (
    measurement: UnitMeasurement,
    toUnit: string
  ): UnitMeasurement => {
    const convertedValue = unitHelpers.convert(
      measurement.value,
      measurement.unit,
      toUnit
    );
    return unitHelpers.createMeasurement(convertedValue, toUnit);
  },

  // Obtener rango de valores normales para ganado
  getLivestockNormalRange: (measurement: string): UnitRange | null => {
    const ranges: Record<
      string,
      { min: number; max: number; optimal?: number; unit: string }
    > = {
      // Peso corporal por edad (aprox)
      calf_weight: { min: 30, max: 80, optimal: 50, unit: "kg" },
      weaner_weight: { min: 150, max: 250, optimal: 200, unit: "kg" },
      adult_weight: { min: 400, max: 800, optimal: 600, unit: "kg" },

      // Signos vitales
      temperature: { min: 38.0, max: 39.5, optimal: 38.5, unit: "c" },
      heart_rate: { min: 60, max: 80, optimal: 70, unit: "bpm" },
      respiratory_rate: { min: 15, max: 25, optimal: 20, unit: "rpm" },

      // Producción lechera
      milk_yield: { min: 15, max: 40, optimal: 25, unit: "l" },
      milk_fat: { min: 3.0, max: 5.0, optimal: 4.0, unit: "percent" },
      milk_protein: { min: 2.8, max: 3.8, optimal: 3.2, unit: "percent" },

      // Calidad del agua
      water_ph: { min: 6.5, max: 8.5, optimal: 7.0, unit: "ph" },
      water_tds: { min: 0, max: 1000, optimal: 500, unit: "ppm" },
    };

    const range = ranges[measurement];
    if (!range) return null;

    return {
      min: unitHelpers.createMeasurement(range.min, range.unit),
      max: unitHelpers.createMeasurement(range.max, range.unit),
      optimal: range.optimal
        ? unitHelpers.createMeasurement(range.optimal, range.unit)
        : undefined,
      unit: range.unit,
    };
  },
} as const;

// Constantes de rangos comunes para validación
export const COMMON_RANGES = {
  CATTLE_WEIGHT: { min: 10, max: 2000, unit: "kg" },
  CATTLE_AGE: { min: 0, max: 300, unit: "mo" },
  BODY_TEMPERATURE: { min: 35, max: 42, unit: "c" },
  HEART_RATE: { min: 40, max: 120, unit: "bpm" },
  RESPIRATORY_RATE: { min: 10, max: 40, unit: "rpm" },
  MILK_VOLUME: { min: 0, max: 60, unit: "l" },
  FEED_INTAKE: { min: 0, max: 50, unit: "kg" },
  WATER_CONSUMPTION: { min: 0, max: 200, unit: "l" },
  DISTANCE_TRACKING: { min: 0, max: 100, unit: "km" },
  FARM_AREA: { min: 0.1, max: 10000, unit: "ha" },
} as const;
