// Funciones de cálculo para la gestión ganadera

import {
  Bovine,
  Vaccination,
  Illness,
  HealthStatus,
  IllnessSeverity,
} from "../constants/bovineTypes";

// Interfaz para estadísticas de salud
export interface HealthStats {
  total: number;
  healthy: number;
  sick: number;
  quarantine: number;
  recovering: number;
  dead: number;
  healthPercentage: number;
}

// Interfaz para estadísticas de vacunación
export interface VaccinationStats {
  totalVaccinations: number;
  upToDate: number;
  overdue: number;
  coverage: number;
  averageVaccinationsPerAnimal: number;
}

// Interfaz para estadísticas de ubicación
export interface LocationStats {
  latitude: number;
  longitude: number;
  radius: number; // en metros
  count: number;
}

// Cálculos de edad
export const calculateAge = (
  birthDate: Date
): { years: number; months: number; days: number } => {
  const now = new Date();
  const birth = new Date(birthDate);

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const daysInPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
    days += daysInPreviousMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

// Calcular edad en meses (útil para programación de vacunas)
export const calculateAgeInMonths = (birthDate: Date): number => {
  const now = new Date();
  const birth = new Date(birthDate);

  const yearDiff = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  const dayDiff = now.getDate() - birth.getDate();

  let totalMonths = yearDiff * 12 + monthDiff;

  if (dayDiff < 0) {
    totalMonths--;
  }

  return totalMonths;
};

// Calcular peso promedio por grupo
export const calculateAverageWeight = (cattle: Bovine[]): number => {
  if (cattle.length === 0) return 0;

  const totalWeight = cattle.reduce((sum, animal) => sum + animal.weight, 0);
  return Math.round((totalWeight / cattle.length) * 100) / 100;
};

// Calcular estadísticas de salud del rebaño
export const calculateHealthStats = (cattle: Bovine[]): HealthStats => {
  const total = cattle.length;

  if (total === 0) {
    return {
      total: 0,
      healthy: 0,
      sick: 0,
      quarantine: 0,
      recovering: 0,
      dead: 0,
      healthPercentage: 0,
    };
  }

  const statusCounts = cattle.reduce((acc, animal) => {
    acc[animal.healthStatus] = (acc[animal.healthStatus] || 0) + 1;
    return acc;
  }, {} as Record<HealthStatus, number>);

  const healthy = statusCounts[HealthStatus.HEALTHY] || 0;
  const sick = statusCounts[HealthStatus.SICK] || 0;
  const quarantine = statusCounts[HealthStatus.QUARANTINE] || 0;
  const recovering = statusCounts[HealthStatus.RECOVERING] || 0;
  const dead = statusCounts[HealthStatus.DEAD] || 0;

  const healthPercentage = Math.round((healthy / total) * 100);

  return {
    total,
    healthy,
    sick,
    quarantine,
    recovering,
    dead,
    healthPercentage,
  };
};

// Calcular estadísticas de vacunación
export const calculateVaccinationStats = (
  cattle: Bovine[],
  vaccinations: Vaccination[]
): VaccinationStats => {
  const totalVaccinations = vaccinations.length;
  const totalCattle = cattle.length;

  if (totalCattle === 0) {
    return {
      totalVaccinations: 0,
      upToDate: 0,
      overdue: 0,
      coverage: 0,
      averageVaccinationsPerAnimal: 0,
    };
  }

  const now = new Date();
  let upToDate = 0;
  let overdue = 0;

  cattle.forEach((animal) => {
    const animalVaccinations = vaccinations.filter(
      (v) => v.bovineId === animal.id
    );
    const hasUpToDateVaccination = animalVaccinations.some((v) => {
      if (!v.nextDueDate) return true; // Si no tiene fecha de vencimiento, está al día
      return new Date(v.nextDueDate) > now;
    });

    if (hasUpToDateVaccination || animalVaccinations.length === 0) {
      upToDate++;
    } else {
      overdue++;
    }
  });

  const coverage = Math.round((upToDate / totalCattle) * 100);
  const averageVaccinationsPerAnimal =
    Math.round((totalVaccinations / totalCattle) * 100) / 100;

  return {
    totalVaccinations,
    upToDate,
    overdue,
    coverage,
    averageVaccinationsPerAnimal,
  };
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

// Encontrar animales dentro de un radio específico
export const findCattleInRadius = (
  cattle: Bovine[],
  centerLat: number,
  centerLon: number,
  radiusInMeters: number
): Bovine[] => {
  return cattle.filter((animal) => {
    const distance = calculateDistance(
      centerLat,
      centerLon,
      animal.location.latitude,
      animal.location.longitude
    );
    return distance <= radiusInMeters;
  });
};

// Calcular centro geográfico de un grupo de animales
export const calculateGeographicCenter = (
  cattle: Bovine[]
): { latitude: number; longitude: number } | null => {
  if (cattle.length === 0) return null;

  const sumLat = cattle.reduce(
    (sum, animal) => sum + animal.location.latitude,
    0
  );
  const sumLon = cattle.reduce(
    (sum, animal) => sum + animal.location.longitude,
    0
  );

  return {
    latitude: sumLat / cattle.length,
    longitude: sumLon / cattle.length,
  };
};

// Calcular densidad de animales por área
export const calculateDensity = (
  cattle: Bovine[],
  areaInSquareMeters: number
): number => {
  return cattle.length / (areaInSquareMeters / 10000); // Densidad por hectárea
};

// Calcular tasa de mortalidad
export const calculateMortalityRate = (
  cattle: Bovine[],
  timeRangeInDays: number = 365
): number => {
  const totalCattle = cattle.length;
  if (totalCattle === 0) return 0;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeInDays);

  const deadCattle = cattle.filter(
    (animal) =>
      animal.healthStatus === HealthStatus.DEAD &&
      animal.updatedAt >= startDate &&
      animal.updatedAt <= endDate
  );

  return Math.round((deadCattle.length / totalCattle) * 100 * 100) / 100;
};

// Calcular tasa de morbilidad
export const calculateMorbidityRate = (
  cattle: Bovine[],
  illnesses: Illness[],
  timeRangeInDays: number = 365
): number => {
  const totalCattle = cattle.length;
  if (totalCattle === 0) return 0;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRangeInDays);

  const sickCattleIds = new Set(
    illnesses
      .filter(
        (illness) =>
          illness.diagnosisDate >= startDate && illness.diagnosisDate <= endDate
      )
      .map((illness) => illness.bovineId)
  );

  return Math.round((sickCattleIds.size / totalCattle) * 100 * 100) / 100;
};

// Calcular eficiencia reproductiva (partos por vaca en edad reproductiva)
export const calculateReproductiveEfficiency = (cattle: Bovine[]): number => {
  const reproductiveFemales = cattle.filter((animal) => {
    const ageInMonths = calculateAgeInMonths(animal.birthDate);
    return (
      animal.gender === "female" && ageInMonths >= 24 && ageInMonths <= 180
    ); // 2-15 años
  });

  if (reproductiveFemales.length === 0) return 0;

  // Aquí necesitarías datos de partos, por ahora retornamos un cálculo básico
  const calvesThisYear = cattle.filter((animal) => {
    const ageInMonths = calculateAgeInMonths(animal.birthDate);
    return ageInMonths <= 12;
  });

  return (
    Math.round(
      (calvesThisYear.length / reproductiveFemales.length) * 100 * 100
    ) / 100
  );
};

// Calcular costo promedio por vacuna
export const calculateAverageVaccinationCost = (
  _vaccinations: Vaccination[],
  costs: { vaccinationId: string; cost: number }[]
): number => {
  if (costs.length === 0) return 0;

  const totalCost = costs.reduce((sum, cost) => sum + cost.cost, 0);
  return Math.round((totalCost / costs.length) * 100) / 100;
};

// Calcular predicción de próximas vacunaciones
export const calculateUpcomingVaccinations = (
  cattle: Bovine[],
  allVaccinations: Vaccination[],
  daysAhead: number = 30
): {
  cattleId: string;
  earTag: string;
  vaccineName: string;
  dueDate: Date;
}[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const upcoming: {
    cattleId: string;
    earTag: string;
    vaccineName: string;
    dueDate: Date;
  }[] = [];

  allVaccinations.forEach((vaccination) => {
    if (vaccination.nextDueDate) {
      const dueDate = new Date(vaccination.nextDueDate);
      if (dueDate >= now && dueDate <= futureDate) {
        const animal = cattle.find((c) => c.id === vaccination.bovineId);
        if (animal) {
          upcoming.push({
            cattleId: animal.id,
            earTag: animal.earTag,
            vaccineName: vaccination.vaccineName,
            dueDate,
          });
        }
      }
    }
  });

  return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

// Calcular índice de riesgo sanitario por área
export const calculateHealthRiskIndex = (
  cattle: Bovine[],
  illnesses: Illness[],
  centerLat: number,
  centerLon: number,
  radiusInMeters: number
): number => {
  const cattleInArea = findCattleInRadius(
    cattle,
    centerLat,
    centerLon,
    radiusInMeters
  );

  if (cattleInArea.length === 0) return 0;

  const recentIllnesses = illnesses.filter((illness) => {
    const isInArea = cattleInArea.some(
      (animal) => animal.id === illness.bovineId
    );
    const isRecent =
      (new Date().getTime() - new Date(illness.diagnosisDate).getTime()) /
        (1000 * 60 * 60 * 24) <=
      30; // Últimos 30 días
    return isInArea && isRecent;
  });

  const contagiousIllnesses = recentIllnesses.filter(
    (illness) => illness.isContagious
  );
  const severeIllnesses = recentIllnesses.filter(
    (illness) =>
      illness.severity === IllnessSeverity.SEVERE ||
      illness.severity === IllnessSeverity.CRITICAL
  );

  // Fórmula simple de riesgo: (enfermedades contagiosas * 2 + enfermedades severas * 1.5) / total de animales en área
  const riskScore =
    (contagiousIllnesses.length * 2 + severeIllnesses.length * 1.5) /
    cattleInArea.length;

  return Math.min(Math.round(riskScore * 100), 100); // Máximo 100%
};
