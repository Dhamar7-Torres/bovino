import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Location, Bovine, Ranch, User, Event } from '../models';

// Importación condicional de express-validator
let validationResult: any;
try {
  const expressValidator = require('express-validator');
  validationResult = expressValidator.validationResult;
} catch (error) {
  validationResult = () => ({ isEmpty: () => true, array: () => [] });
}

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

interface GeofenceArea {
  id: string;
  name: string;
  type: 'pasture' | 'facility' | 'restricted' | 'safe_zone';
  coordinates?: LocationCoordinates[];
  radius?: number; // Para geocercas circulares
  center?: LocationCoordinates; // Para geocercas circulares
}

interface LocationQuery {
  bovine_id?: string;
  ranch_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: string;
  real_time?: boolean;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Interfaces simplificadas para evitar conflictos con Sequelize
interface BovineInstance {
  id: string;
  earring_number: string;
  name: string;
  breed: string;
  status: string;
  ranch_id?: string;
  ranch?: RanchInstance;
}

interface RanchInstance {
  id: string;
  name: string;
}

// ============================================================================
// CONFIGURACIÓN PARA VILLAHERMOSA, TABASCO, MÉXICO
// ============================================================================

const RANCH_DEFAULT_CENTER: LocationCoordinates = {
  latitude: 17.9869,
  longitude: -92.9303,
  altitude: 10
};

const TABASCO_BOUNDS: MapBounds = {
  north: 18.5,
  south: 17.3,
  east: -91.0,
  west: -94.8
};

// ============================================================================
// CONTROLADOR DE MAPAS
// ============================================================================

export class MapsController {

  // --------------------------------------------------------------------------
  // OBTENER UBICACIONES ACTUALES DE TODOS LOS BOVINOS
  // --------------------------------------------------------------------------
  
  public static async getCurrentLocations(req: Request, res: Response): Promise<void> {
    try {
      const { ranch_id } = req.query;

      // Construir filtros
      const whereClause: any = {};
      if (ranch_id) {
        whereClause.ranch_id = ranch_id;
      }

      // Obtener la última ubicación de cada bovino
      const currentLocations = await Location.findAll({
        include: [
          {
            model: Bovine,
            as: 'bovine',
            where: whereClause,
            attributes: ['id', 'earring_number', 'name', 'breed', 'status'],
            required: false, // LEFT JOIN para evitar errores
            include: [
              {
                model: Ranch,
                as: 'ranch',
                attributes: ['id', 'name'],
                required: false // LEFT JOIN para evitar errores
              }
            ]
          }
        ],
        where: {
          // Subconsulta para obtener solo la última ubicación de cada bovino
          id: {
            [Op.in]: literal(`(
              SELECT DISTINCT ON (bovine_id) id 
              FROM locations 
              ORDER BY bovine_id, recorded_at DESC
            )`)
          }
        },
        order: [['recorded_at', 'DESC']]
      });

      // Formatear datos para el mapa
      const mapData = currentLocations.map((location: any) => {
        const bovineData = (location as any).bovine || (location as any).Bovine;
        const ranchData = bovineData?.ranch || bovineData?.Ranch;
        
        return {
          id: location.id,
          bovine: bovineData ? {
            id: bovineData.id,
            earring_number: bovineData.earring_number,
            name: bovineData.name,
            breed: bovineData.breed,
            status: bovineData.status
          } : null,
          coordinates: {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            altitude: location.altitude ? parseFloat(location.altitude) : null,
            accuracy: location.accuracy ? parseFloat(location.accuracy) : null
          },
          recorded_at: location.recorded_at,
          location_type: location.location_type,
          ranch: ranchData || null
        };
      });

      res.status(200).json({
        success: true,
        message: 'Ubicaciones actuales obtenidas exitosamente',
        data: {
          locations: mapData,
          center: RANCH_DEFAULT_CENTER,
          bounds: TABASCO_BOUNDS,
          total_animals: mapData.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo ubicaciones actuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER HISTORIAL DE UBICACIONES DE UN BOVINO ESPECÍFICO
  // --------------------------------------------------------------------------
  
  public static async getBovineLocationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { bovineId } = req.params;
      const { 
        start_date, 
        end_date, 
        limit = '100' 
      } = req.query as LocationQuery;

      // Construir filtros de fecha
      const whereClause: any = { bovine_id: bovineId };
      
      if (start_date && end_date) {
        whereClause.recorded_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      } else if (start_date) {
        whereClause.recorded_at = {
          [Op.gte]: new Date(start_date)
        };
      } else if (end_date) {
        whereClause.recorded_at = {
          [Op.lte]: new Date(end_date)
        };
      }

      const locationHistory = await Location.findAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false // LEFT JOIN para evitar errores
          }
        ],
        order: [['recorded_at', 'DESC']],
        limit: parseInt(limit)
      });

      // Calcular estadísticas del movimiento
      const stats = await MapsController.calculateMovementStats(locationHistory);

      res.status(200).json({
        success: true,
        message: 'Historial de ubicaciones obtenido exitosamente',
        data: {
          bovine: locationHistory.length > 0 ? (locationHistory[0] as any).bovine || (locationHistory[0] as any).Bovine : null,
          locations: locationHistory.map((loc: any) => ({
            id: loc.id,
            coordinates: {
              latitude: parseFloat(loc.latitude),
              longitude: parseFloat(loc.longitude),
              altitude: loc.altitude ? parseFloat(loc.altitude) : null
            },
            recorded_at: loc.recorded_at,
            location_type: loc.location_type,
            accuracy: loc.accuracy ? parseFloat(loc.accuracy) : null
          })),
          statistics: stats,
          total_points: locationHistory.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo historial de ubicaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR NUEVA UBICACIÓN DE BOVINO
  // --------------------------------------------------------------------------
  
  public static async recordLocation(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
        return;
      }

      const {
        bovine_id,
        latitude,
        longitude,
        altitude,
        accuracy,
        location_type = 'gps_tracking',
        notes
      } = req.body;

      // Verificar que el bovino existe
      const bovine = await Bovine.findByPk(bovine_id);
      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado'
        });
        return;
      }

      // Validar coordenadas para Tabasco
      if (!MapsController.isValidTabascoCoordinates(latitude, longitude)) {
        res.status(400).json({
          success: false,
          message: 'Coordenadas fuera del rango válido para Tabasco, México'
        });
        return;
      }

      // Crear nueva ubicación con campos básicos
      const newLocation = await Location.create({
        bovine_id,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        altitude: altitude ? altitude.toString() : null,
        accuracy: accuracy ? accuracy.toString() : null,
        location_type: location_type || 'gps_tracking',
        recorded_at: new Date()
      } as any);

      // Verificar geocercas y generar alertas si es necesario
      await MapsController.checkGeofenceAlerts(bovine_id, latitude, longitude);

      // Obtener la ubicación creada con relaciones
      const locationWithBovine = await Location.findByPk((newLocation as any).id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false // LEFT JOIN para evitar errores
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Ubicación registrada exitosamente',
        data: locationWithBovine
      });

    } catch (error) {
      console.error('❌ Error registrando ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER GEOCERCAS DEL RANCHO
  // --------------------------------------------------------------------------
  
  public static async getGeofences(req: Request, res: Response): Promise<void> {
    try {
      const { ranch_id } = req.query;

      // Por ahora, devolver geocercas predefinidas para el rancho
      // En el futuro, estas se almacenarían en la base de datos
      const predefinedGeofences: GeofenceArea[] = [
        {
          id: 'pasture_1',
          name: 'Potrero Principal',
          type: 'pasture',
          coordinates: [
            { latitude: 17.9900, longitude: -92.9350 },
            { latitude: 17.9900, longitude: -92.9250 },
            { latitude: 17.9800, longitude: -92.9250 },
            { latitude: 17.9800, longitude: -92.9350 }
          ]
        },
        {
          id: 'facility_barn',
          name: 'Establo Principal',
          type: 'facility',
          center: { latitude: 17.9869, longitude: -92.9303 },
          radius: 50 // metros
        },
        {
          id: 'safe_zone_main',
          name: 'Zona Segura Principal',
          type: 'safe_zone',
          center: RANCH_DEFAULT_CENTER,
          radius: 500 // metros
        },
        {
          id: 'restricted_highway',
          name: 'Zona Restringida - Carretera',
          type: 'restricted',
          coordinates: [
            { latitude: 17.9950, longitude: -92.9400 },
            { latitude: 17.9950, longitude: -92.9200 },
            { latitude: 17.9970, longitude: -92.9200 },
            { latitude: 17.9970, longitude: -92.9400 }
          ]
        }
      ];

      res.status(200).json({
        success: true,
        message: 'Geocercas obtenidas exitosamente',
        data: {
          geofences: predefinedGeofences,
          ranch_center: RANCH_DEFAULT_CENTER,
          total_geofences: predefinedGeofences.length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo geocercas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ANÁLISIS DE PATRONES DE MOVIMIENTO
  // --------------------------------------------------------------------------
  
  public static async getMovementAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { bovine_id, days = '7' } = req.query;

      const daysBack = parseInt(days as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Construir filtros
      const whereClause: any = {
        recorded_at: {
          [Op.gte]: startDate
        }
      };

      if (bovine_id) {
        whereClause.bovine_id = bovine_id;
      }

      // Obtener ubicaciones para análisis
      const locations = await Location.findAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name'],
            required: false // LEFT JOIN para evitar errores
          }
        ],
        order: [['bovine_id', 'ASC'], ['recorded_at', 'ASC']]
      });

      // Agrupar por bovino y analizar patrones
      const analysisData = await MapsController.analyzeMovementPatterns(locations);

      res.status(200).json({
        success: true,
        message: 'Análisis de patrones de movimiento completado',
        data: {
          analysis_period: {
            start_date: startDate,
            end_date: new Date(),
            days: daysBack
          },
          patterns: analysisData,
          total_animals_analyzed: Object.keys(analysisData).length
        }
      });

    } catch (error) {
      console.error('❌ Error analizando patrones de movimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ALERTAS DE UBICACIÓN
  // --------------------------------------------------------------------------
  
  public static async getLocationAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { ranch_id, active_only = 'true' } = req.query;

      // Buscar eventos relacionados con ubicación
      const whereClause: any = {
        eventType: {
          [Op.in]: ['geofence_exit', 'geofence_enter', 'location_alert', 'animal_missing']
        }
      };

      if (active_only === 'true') {
        whereClause.status = 'active';
      }

      const locationAlerts = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            where: ranch_id ? { ranch_id } : undefined,
            required: false // LEFT JOIN para evitar errores si no hay relación
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      // Categorizar alertas
      const categorizedAlerts = {
        geofence_violations: locationAlerts.filter((alert: any) => 
          ['geofence_exit', 'geofence_enter'].includes(alert.eventType)
        ),
        missing_animals: locationAlerts.filter((alert: any) => 
          alert.eventType === 'animal_missing'
        ),
        location_warnings: locationAlerts.filter((alert: any) => 
          alert.eventType === 'location_alert'
        )
      };

      res.status(200).json({
        success: true,
        message: 'Alertas de ubicación obtenidas exitosamente',
        data: {
          alerts: categorizedAlerts,
          total_alerts: locationAlerts.length,
          active_alerts: locationAlerts.filter((a: any) => a.status === 'active').length
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo alertas de ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // MÉTODOS AUXILIARES PRIVADOS
  // --------------------------------------------------------------------------

  // Validar que las coordenadas estén dentro de Tabasco
  private static isValidTabascoCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= TABASCO_BOUNDS.south &&
      lat <= TABASCO_BOUNDS.north &&
      lng >= TABASCO_BOUNDS.west &&
      lng <= TABASCO_BOUNDS.east
    );
  }

  // Calcular estadísticas de movimiento
  private static async calculateMovementStats(locations: any[]): Promise<any> {
    if (locations.length < 2) {
      return {
        total_distance: 0,
        average_speed: 0,
        max_distance_from_center: 0,
        time_period: null
      };
    }

    let totalDistance = 0;
    let maxDistanceFromCenter = 0;

    // Calcular distancias entre puntos consecutivos
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const distance = MapsController.calculateDistance(
        parseFloat(prev.latitude),
        parseFloat(prev.longitude),
        parseFloat(curr.latitude),
        parseFloat(curr.longitude)
      );
      
      totalDistance += distance;

      // Calcular distancia desde el centro del rancho
      const distanceFromCenter = MapsController.calculateDistance(
        RANCH_DEFAULT_CENTER.latitude,
        RANCH_DEFAULT_CENTER.longitude,
        parseFloat(curr.latitude),
        parseFloat(curr.longitude)
      );

      if (distanceFromCenter > maxDistanceFromCenter) {
        maxDistanceFromCenter = distanceFromCenter;
      }
    }

    // Calcular velocidad promedio
    const timeSpan = new Date(locations[0].recorded_at).getTime() - 
                    new Date(locations[locations.length - 1].recorded_at).getTime();
    const hoursSpan = timeSpan / (1000 * 60 * 60);
    const averageSpeed = hoursSpan > 0 ? totalDistance / hoursSpan : 0;

    return {
      total_distance: Math.round(totalDistance * 100) / 100, // metros
      average_speed: Math.round(averageSpeed * 100) / 100, // m/h
      max_distance_from_center: Math.round(maxDistanceFromCenter * 100) / 100, // metros
      time_period: {
        start: locations[locations.length - 1].recorded_at,
        end: locations[0].recorded_at,
        duration_hours: Math.round(hoursSpan * 100) / 100
      }
    };
  }

  // Fórmula de Haversine para calcular distancia entre dos puntos
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Verificar si un punto está dentro de una geocerca circular
  private static isPointInCircularGeofence(
    pointLat: number, 
    pointLng: number, 
    centerLat: number, 
    centerLng: number, 
    radius: number
  ): boolean {
    const distance = MapsController.calculateDistance(pointLat, pointLng, centerLat, centerLng);
    return distance <= radius;
  }

  // Verificar geocercas y generar alertas
  private static async checkGeofenceAlerts(bovineId: string, lat: number, lng: number): Promise<void> {
    // Verificar si está fuera de la zona segura principal (500m del centro)
    const distanceFromCenter = MapsController.calculateDistance(
      lat, lng, 
      RANCH_DEFAULT_CENTER.latitude, 
      RANCH_DEFAULT_CENTER.longitude
    );

    if (distanceFromCenter > 500) {
      // Crear evento de alerta con campos básicos
      try {
        await Event.create({
          bovine_id: bovineId,
          eventType: 'geofence_exit',
          title: 'Animal fuera de zona segura',
          description: `El animal se encuentra a ${Math.round(distanceFromCenter)}m del centro del rancho`,
          status: 'active',
          priority: 'high'
        } as any);
      } catch (error) {
        console.error('Error creating geofence alert:', error);
      }
    }
  }

  // Analizar patrones de movimiento por bovino
  private static async analyzeMovementPatterns(locations: any[]): Promise<any> {
    const patterns: any = {};

    // Agrupar ubicaciones por bovino
    const bovineLocations: { [key: string]: any[] } = {};
    
    locations.forEach(location => {
      const bovineId = location.bovine_id;
      if (!bovineLocations[bovineId]) {
        bovineLocations[bovineId] = [];
      }
      bovineLocations[bovineId].push(location);
    });

    // Analizar cada bovino
    for (const [bovineId, bovineLocationData] of Object.entries(bovineLocations)) {
      const stats = await MapsController.calculateMovementStats(bovineLocationData);
      const firstLocation = bovineLocationData[0];
      const bovineData = firstLocation ? ((firstLocation as any).bovine || (firstLocation as any).Bovine) : null;
      
      patterns[bovineId] = {
        bovine: bovineData,
        movement_stats: stats,
        location_points: bovineLocationData.length,
        activity_level: MapsController.classifyActivityLevel(stats.total_distance, stats.average_speed),
        last_location: firstLocation ? {
          latitude: parseFloat(firstLocation.latitude),
          longitude: parseFloat(firstLocation.longitude),
          recorded_at: firstLocation.recorded_at
        } : null
      };
    }

    return patterns;
  }

  // Clasificar nivel de actividad del bovino
  private static classifyActivityLevel(totalDistance: number, averageSpeed: number): string {
    if (totalDistance < 100 && averageSpeed < 50) {
      return 'low'; // Pastoreo tranquilo
    } else if (totalDistance < 500 && averageSpeed < 200) {
      return 'moderate'; // Actividad normal
    } else {
      return 'high'; // Mucho movimiento, posible estrés o búsqueda de comida/agua
    }
  }
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default MapsController;