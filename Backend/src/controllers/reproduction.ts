import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Reproduction, Bovine, Ranch, User, Event, Location } from '../models';

// Importación condicional de express-validator
let validationResult: any;
try {
  const expressValidator = require('express-validator');
  validationResult = expressValidator.validationResult;
} catch (error) {
  validationResult = () => ({ isEmpty: () => true, array: () => [] });
}

// ============================================================================
// INTERFACES Y TIPOS REPRODUCTIVOS
// ============================================================================

interface ReproductionQuery {
  page?: string;
  limit?: string;
  bovine_id?: string;
  ranch_id?: string;
  reproduction_type?: 'heat' | 'service' | 'pregnancy_check' | 'birth' | 'artificial_insemination';
  status?: 'active' | 'completed' | 'failed' | 'pending';
  start_date?: string;
  end_date?: string;
  sortBy?: 'event_date' | 'status' | 'bovine_id';
  sortOrder?: 'ASC' | 'DESC';
}

interface HeatDetection {
  bovine_id: string;
  heat_date: Date;
  heat_intensity: 'low' | 'moderate' | 'strong';
  heat_signs: string[];
  duration_hours?: number;
  observer_notes?: string;
  next_expected_heat?: Date;
  suitable_for_service: boolean;
}

interface ServiceRecord {
  bovine_id: string;
  service_date: Date;
  service_type: 'natural_mating' | 'artificial_insemination';
  bull_id?: string; // Para monta natural
  semen_batch?: string; // Para inseminación artificial
  technician_id?: string;
  service_quality: 'excellent' | 'good' | 'regular' | 'poor';
  expected_birth_date?: Date;
  notes?: string;
}

interface PregnancyCheck {
  bovine_id: string;
  check_date: Date;
  check_method: 'palpation' | 'ultrasound' | 'blood_test' | 'visual_observation';
  result: 'positive' | 'negative' | 'inconclusive';
  gestational_age_days?: number;
  expected_birth_date?: Date;
  veterinarian_id?: string;
  observations?: string;
}

interface BirthRecord {
  mother_id: string;
  birth_date: Date;
  birth_type: 'normal' | 'assisted' | 'cesarean' | 'difficult';
  calf_gender: 'male' | 'female';
  calf_weight?: number;
  calf_health_status: 'healthy' | 'weak' | 'sick' | 'deceased';
  complications?: string[];
  veterinarian_assistance: boolean;
  gestation_period_days?: number;
  location_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ReproductiveMetrics {
  conception_rate: number;
  pregnancy_rate: number;
  calving_interval_days: number;
  services_per_conception: number;
  heat_detection_efficiency: number;
  birth_weight_average: number;
  calf_mortality_rate: number;
  reproductive_efficiency_score: number;
}

// ============================================================================
// CONSTANTES REPRODUCTIVAS
// ============================================================================

const BOVINE_REPRODUCTION_CONSTANTS = {
  GESTATION_PERIOD_DAYS: 283, // Promedio para bovinos
  HEAT_CYCLE_DAYS: 21, // Ciclo estral promedio
  HEAT_DURATION_HOURS: 18, // Duración promedio del celo
  POST_PARTUM_INTERVAL_DAYS: 45, // Tiempo mínimo antes del siguiente servicio
  PREGNANCY_CHECK_DAYS_AFTER_SERVICE: 35, // Cuándo hacer el primer chequeo
  OPTIMAL_SERVICE_WINDOW_HOURS: 12, // Ventana óptima para servicio
  MINIMUM_BREEDING_AGE_MONTHS: 15, // Edad mínima para reproducción
  MAXIMUM_BREEDING_AGE_YEARS: 12 // Edad máxima recomendada
};

// ============================================================================
// CONTROLADOR DE REPRODUCCIÓN
// ============================================================================

export class ReproductionController {

  // --------------------------------------------------------------------------
  // OBTENER TODOS LOS REGISTROS REPRODUCTIVOS
  // --------------------------------------------------------------------------
  
  public static async getAllReproductionRecords(req: Request, res: Response): Promise<void> {
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
        page = '1',
        limit = '20',
        bovine_id,
        ranch_id,
        reproduction_type,
        status,
        start_date,
        end_date,
        sortBy = 'event_date',
        sortOrder = 'DESC'
      } = req.query as ReproductionQuery;

      // Configurar paginación
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const offset = (pageNumber - 1) * limitNumber;

      // Construir filtros dinámicos usando literal para evitar problemas de tipos
      const whereClause: any = {};

      if (bovine_id) {
        whereClause.bovine_id = bovine_id;
      }

      if (reproduction_type) {
        whereClause.reproduction_type = reproduction_type;
      }

      if (status) {
        whereClause.status = status;
      }

      // Filtros de fecha usando literal
      if (start_date && end_date) {
        whereClause[Op.and] = literal(`event_date BETWEEN '${start_date}' AND '${end_date}'`);
      } else if (start_date) {
        whereClause[Op.and] = literal(`event_date >= '${start_date}'`);
      } else if (end_date) {
        whereClause[Op.and] = literal(`event_date <= '${end_date}'`);
      }

      // Filtro por rancho a través de la relación con bovino
      const bovineWhere: any = {};
      if (ranch_id) {
        bovineWhere.ranch_id = ranch_id;
      }

      // Buscar registros reproductivos
      const { count, rows: reproductionRecords } = await Reproduction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Bovine,
            as: 'bovine',
            where: Object.keys(bovineWhere).length > 0 ? bovineWhere : undefined,
            attributes: ['id', 'earring_number', 'name', 'breed', 'gender', 'birthDate'],
            required: false,
            include: [
              {
                model: Ranch,
                as: 'ranch',
                attributes: ['id', 'name'],
                required: false
              }
            ]
          },
          {
            model: Bovine,
            as: 'bull',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: User,
            as: 'veterinarian',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          },
          {
            model: User,
            as: 'recordedBy',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: limitNumber,
        offset: offset,
        distinct: true
      });

      // Calcular información de paginación
      const totalPages = Math.ceil(count / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Registros reproductivos obtenidos exitosamente',
        data: {
          records: reproductionRecords,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalItems: count,
            itemsPerPage: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo registros reproductivos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR DETECCIÓN DE CELO
  // --------------------------------------------------------------------------
  
  public static async recordHeatDetection(req: Request, res: Response): Promise<void> {
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
        heat_date,
        heat_intensity = 'moderate',
        heat_signs = [],
        duration_hours,
        observer_notes,
        suitable_for_service = true
      } = req.body as HeatDetection;

      // Verificar que el bovino existe y es hembra
      const bovine = await Bovine.findByPk(bovine_id);
      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado'
        });
        return;
      }

      if ((bovine as any).gender !== 'female') {
        res.status(400).json({
          success: false,
          message: 'Solo las hembras pueden estar en celo'
        });
        return;
      }

      // Verificar edad mínima para reproducción
      const birthDate = (bovine as any).birthDate || (bovine as any).birth_date;
      if (birthDate) {
        const ageInMonths = ReproductionController.calculateAgeInMonths(new Date(birthDate));
        if (ageInMonths < BOVINE_REPRODUCTION_CONSTANTS.MINIMUM_BREEDING_AGE_MONTHS) {
          res.status(400).json({
            success: false,
            message: `La hembra debe tener al menos ${BOVINE_REPRODUCTION_CONSTANTS.MINIMUM_BREEDING_AGE_MONTHS} meses para reproducción`
          });
          return;
        }
      }

      // Calcular próximo celo esperado
      const nextExpectedHeat = new Date(heat_date);
      nextExpectedHeat.setDate(nextExpectedHeat.getDate() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS);

      // Obtener ubicación actual si está disponible
      const currentLocation = await Location.findOne({
        where: literal(`bovine_id = '${bovine_id}'`),
        order: [['recorded_at', 'DESC']]
      } as any).catch(() => null);

      // Obtener el usuario actual
      const userId = (req as any).user?.id;

      // Crear registro de celo
      const heatRecord = await Reproduction.create({
        bovine_id,
        reproduction_type: 'heat',
        event_date: new Date(heat_date),
        status: suitable_for_service ? 'active' : 'completed',
        details: {
          heat_intensity,
          heat_signs,
          duration_hours,
          observer_notes,
          suitable_for_service,
          next_expected_heat: nextExpectedHeat,
          location: currentLocation ? {
            latitude: (currentLocation as any).latitude,
            longitude: (currentLocation as any).longitude
          } : null
        },
        recorded_by: userId
      } as any);

      // Crear evento automático si es adecuada para servicio
      if (suitable_for_service) {
        try {
          await Event.create({
            bovine_id,
            eventType: 'heat_detected',
            title: 'Celo detectado - Lista para servicio',
            description: `Intensidad: ${heat_intensity}. Signos: ${heat_signs.join(', ')}`,
            status: 'active',
            priority: 'high'
          } as any);
        } catch (err: any) {
          console.warn('Error creando evento:', err);
        }
      }

      // Obtener el registro con relaciones
      const recordWithRelations = await Reproduction.findByPk((heatRecord as any).id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: User,
            as: 'recordedBy',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Detección de celo registrada exitosamente',
        data: {
          record: recordWithRelations,
          next_actions: {
            optimal_service_window: {
              start: new Date(heat_date),
              end: new Date(new Date(heat_date).getTime() + BOVINE_REPRODUCTION_CONSTANTS.OPTIMAL_SERVICE_WINDOW_HOURS * 60 * 60 * 1000)
            },
            next_expected_heat: nextExpectedHeat,
            suitable_for_immediate_service: suitable_for_service
          }
        }
      });

    } catch (error) {
      console.error('❌ Error registrando detección de celo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR SERVICIO/INSEMINACIÓN
  // --------------------------------------------------------------------------
  
  public static async recordService(req: Request, res: Response): Promise<void> {
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
        service_date,
        service_type,
        bull_id,
        semen_batch,
        technician_id,
        service_quality = 'good',
        notes
      } = req.body as ServiceRecord;

      // Verificar que el bovino existe y es hembra
      const bovine = await Bovine.findByPk(bovine_id);
      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado'
        });
        return;
      }

      if ((bovine as any).gender !== 'female') {
        res.status(400).json({
          success: false,
          message: 'Solo las hembras pueden ser servidas'
        });
        return;
      }

      // Verificar que no esté preñada actualmente usando literal
      const activePregnancy = await Reproduction.findOne({
        where: literal(`bovine_id = '${bovine_id}' AND reproduction_type = 'pregnancy_check' AND status = 'active' AND details->>'result' = 'positive'`)
      } as any).catch(() => null);

      if (activePregnancy) {
        res.status(400).json({
          success: false,
          message: 'La hembra ya está preñada'
        });
        return;
      }

      // Verificar intervalo post-parto si hay partos anteriores
      const lastBirth = await Reproduction.findOne({
        where: literal(`bovine_id = '${bovine_id}' AND reproduction_type = 'birth'`),
        order: [['event_date', 'DESC']]
      } as any).catch(() => null);

      if (lastBirth) {
        const daysSinceBirth = Math.floor(
          (new Date(service_date).getTime() - new Date((lastBirth as any).event_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        if (daysSinceBirth < BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS) {
          res.status(400).json({
            success: false,
            message: `Debe esperar al menos ${BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS} días después del parto`
          });
          return;
        }
      }

      // Validar que existe el toro si es monta natural
      if (service_type === 'natural_mating' && bull_id) {
        const bull = await Bovine.findByPk(bull_id);
        if (!bull || (bull as any).gender !== 'male') {
          res.status(400).json({
            success: false,
            message: 'Toro no encontrado o no es macho'
          });
          return;
        }
      }

      // Calcular fecha esperada de parto
      const expectedBirthDate = new Date(service_date);
      expectedBirthDate.setDate(expectedBirthDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.GESTATION_PERIOD_DAYS);

      // Calcular fecha para chequeo de preñez
      const pregnancyCheckDate = new Date(service_date);
      pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.PREGNANCY_CHECK_DAYS_AFTER_SERVICE);

      // Obtener ubicación actual
      const currentLocation = await Location.findOne({
        where: literal(`bovine_id = '${bovine_id}'`),
        order: [['recorded_at', 'DESC']]
      } as any).catch(() => null);

      // Obtener el usuario actual
      const userId = (req as any).user?.id;

      // Crear registro de servicio
      const serviceRecord = await Reproduction.create({
        bovine_id,
        bull_id: service_type === 'natural_mating' ? bull_id : null,
        reproduction_type: 'service',
        event_date: new Date(service_date),
        status: 'completed',
        details: {
          service_type,
          semen_batch: service_type === 'artificial_insemination' ? semen_batch : null,
          technician_id,
          service_quality,
          expected_birth_date: expectedBirthDate,
          pregnancy_check_scheduled: pregnancyCheckDate,
          notes,
          location: currentLocation ? {
            latitude: (currentLocation as any).latitude,
            longitude: (currentLocation as any).longitude
          } : null
        },
        recorded_by: userId
      } as any);

      // Crear evento para recordatorio de chequeo de preñez
      try {
        await Event.create({
          bovine_id,
          eventType: 'pregnancy_check_due',
          title: 'Chequeo de preñez programado',
          description: `Chequear preñez después del servicio del ${new Date(service_date).toLocaleDateString()}`,
          status: 'pending',
          priority: 'medium',
          scheduled_date: pregnancyCheckDate
        } as any);
      } catch (err: any) {
        console.warn('Error creando evento:', err);
      }

      // Cerrar cualquier evento de celo activo
      try {
        await Event.update(
          { status: 'resolved' } as any,
          {
            where: literal(`bovine_id = '${bovine_id}' AND eventType = 'heat_detected' AND status = 'active'`) as any
          }
        );
      } catch (err: any) {
        console.warn('Error actualizando eventos:', err);
      }

      // Obtener el registro con relaciones
      const recordWithRelations = await Reproduction.findByPk((serviceRecord as any).id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: Bovine,
            as: 'bull',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: User,
            as: 'recordedBy',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Servicio registrado exitosamente',
        data: {
          record: recordWithRelations,
          schedule: {
            pregnancy_check_date: pregnancyCheckDate,
            expected_birth_date: expectedBirthDate,
            next_heat_if_not_pregnant: new Date(
              new Date(service_date).getTime() + 
              BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS * 24 * 60 * 60 * 1000
            )
          }
        }
      });

    } catch (error) {
      console.error('❌ Error registrando servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR CHEQUEO DE PREÑEZ
  // --------------------------------------------------------------------------
  
  public static async recordPregnancyCheck(req: Request, res: Response): Promise<void> {
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
        check_date,
        check_method,
        result,
        gestational_age_days,
        expected_birth_date,
        veterinarian_id,
        observations
      } = req.body as PregnancyCheck;

      // Verificar que el bovino existe
      const bovine = await Bovine.findByPk(bovine_id);
      if (!bovine) {
        res.status(404).json({
          success: false,
          message: 'Bovino no encontrado'
        });
        return;
      }

      // Buscar el último servicio
      const lastService = await Reproduction.findOne({
        where: literal(`bovine_id = '${bovine_id}' AND reproduction_type = 'service'`),
        order: [['event_date', 'DESC']]
      } as any).catch(() => null);

      let calculatedBirthDate = expected_birth_date;
      if (!calculatedBirthDate && lastService && result === 'positive') {
        const serviceDate = new Date((lastService as any).event_date);
        calculatedBirthDate = new Date(serviceDate.getTime() + BOVINE_REPRODUCTION_CONSTANTS.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      }

      // Obtener ubicación actual
      const currentLocation = await Location.findOne({
        where: literal(`bovine_id = '${bovine_id}'`),
        order: [['recorded_at', 'DESC']]
      } as any).catch(() => null);

      // Obtener el usuario actual
      const userId = (req as any).user?.id;

      // Crear registro de chequeo de preñez
      const pregnancyRecord = await Reproduction.create({
        bovine_id,
        reproduction_type: 'pregnancy_check',
        event_date: new Date(check_date),
        status: result === 'positive' ? 'active' : 'completed',
        details: {
          check_method,
          result,
          gestational_age_days,
          expected_birth_date: calculatedBirthDate,
          veterinarian_id,
          observations,
          service_reference: lastService ? (lastService as any).id : null,
          location: currentLocation ? {
            latitude: (currentLocation as any).latitude,
            longitude: (currentLocation as any).longitude
          } : null
        },
        recorded_by: userId
      } as any);

      // Crear eventos basados en el resultado
      if (result === 'positive') {
        // Evento de confirmación de preñez
        try {
          await Event.create({
            bovine_id,
            eventType: 'pregnancy_confirmed',
            title: 'Preñez confirmada',
            description: `Método: ${check_method}. ${gestational_age_days ? `Edad gestacional: ${gestational_age_days} días.` : ''} ${observations || ''}`,
            status: 'active',
            priority: 'medium'
          } as any);
        } catch (err: any) {
          console.warn('Error creando evento:', err);
        }

        // Programar recordatorio de parto si hay fecha estimada
        if (calculatedBirthDate) {
          const birthReminderDate = new Date(calculatedBirthDate);
          birthReminderDate.setDate(birthReminderDate.getDate() - 7); // 7 días antes

          try {
            await Event.create({
              bovine_id,
              eventType: 'birth_approaching',
              title: 'Parto próximo',
              description: `Fecha estimada de parto: ${calculatedBirthDate.toLocaleDateString()}`,
              status: 'pending',
              priority: 'high',
              scheduled_date: birthReminderDate
            } as any);
          } catch (err: any) {
            console.warn('Error creando evento:', err);
          }
        }

        // Actualizar estado del bovino
        try {
          await (bovine as any).update({ 
            reproduction_status: 'pregnant',
            expected_birth_date: calculatedBirthDate
          });
        } catch (err: any) {
          console.warn('Error actualizando bovino:', err);
        }

      } else if (result === 'negative') {
        // Si no está preñada, programar siguiente detección de celo
        const nextHeatDate = new Date(check_date);
        nextHeatDate.setDate(nextHeatDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS);

        try {
          await Event.create({
            bovine_id,
            eventType: 'heat_detection_due',
            title: 'Monitorear próximo celo',
            description: 'Preñez negativa - observar signos de celo para nuevo servicio',
            status: 'pending',
            priority: 'medium',
            scheduled_date: nextHeatDate
          } as any);
        } catch (err: any) {
          console.warn('Error creando evento:', err);
        }

        // Actualizar estado del bovino
        try {
          await (bovine as any).update({ 
            reproduction_status: 'open',
            expected_birth_date: null
          });
        } catch (err: any) {
          console.warn('Error actualizando bovino:', err);
        }
      }

      // Resolver evento de chequeo pendiente
      try {
        await Event.update(
          { status: 'resolved' } as any,
          {
            where: literal(`bovine_id = '${bovine_id}' AND eventType = 'pregnancy_check_due' AND status = 'pending'`) as any
          }
        );
      } catch (err: any) {
        console.warn('Error actualizando eventos:', err);
      }

      // Obtener el registro con relaciones
      const recordWithRelations = await Reproduction.findByPk((pregnancyRecord as any).id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: User,
            as: 'veterinarian',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          },
          {
            model: User,
            as: 'recordedBy',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Chequeo de preñez registrado exitosamente',
        data: {
          record: recordWithRelations,
          pregnancy_status: result,
          next_actions: result === 'positive' ? 
            {
              expected_birth_date: calculatedBirthDate,
              days_to_birth: calculatedBirthDate ? 
                Math.ceil((new Date(calculatedBirthDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
              care_recommendations: [
                'Mejorar alimentación',
                'Monitorear peso',
                'Preparar área de parto',
                'Programar chequeos veterinarios'
              ]
            } : 
            {
              next_heat_expected: new Date(new Date(check_date).getTime() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS * 24 * 60 * 60 * 1000),
              recommendations: [
                'Observar signos de celo',
                'Preparar para nuevo servicio',
                'Revisar nutrición',
                'Evaluar condición corporal'
              ]
            }
        }
      });

    } catch (error) {
      console.error('❌ Error registrando chequeo de preñez:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRAR PARTO
  // --------------------------------------------------------------------------
  
  public static async recordBirth(req: Request, res: Response): Promise<void> {
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
        mother_id,
        birth_date,
        birth_type = 'normal',
        calf_gender,
        calf_weight,
        calf_health_status = 'healthy',
        complications = [],
        veterinarian_assistance = false,
        location_coordinates
      } = req.body as BirthRecord;

      // Verificar que la madre existe
      const mother = await Bovine.findByPk(mother_id);
      if (!mother) {
        res.status(404).json({
          success: false,
          message: 'Madre no encontrada'
        });
        return;
      }

      // Buscar el último servicio para calcular período de gestación
      const lastService = await Reproduction.findOne({
        where: literal(`bovine_id = '${mother_id}' AND reproduction_type = 'service'`),
        order: [['event_date', 'DESC']]
      } as any).catch(() => null);

      let gestationPeriodDays = null;
      if (lastService) {
        gestationPeriodDays = Math.floor(
          (new Date(birth_date).getTime() - new Date((lastService as any).event_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
      }

      // Obtener ubicación actual o usar la proporcionada
      let birthLocation = location_coordinates;
      if (!birthLocation) {
        const currentLocation = await Location.findOne({
          where: literal(`bovine_id = '${mother_id}'`),
          order: [['recorded_at', 'DESC']]
        } as any).catch(() => null);
        
        if (currentLocation) {
          birthLocation = {
            latitude: parseFloat((currentLocation as any).latitude || '0'),
            longitude: parseFloat((currentLocation as any).longitude || '0')
          };
        }
      }

      // Obtener el usuario actual
      const userId = (req as any).user?.id;

      // Crear registro de parto
      const birthRecord = await Reproduction.create({
        bovine_id: mother_id,
        reproduction_type: 'birth',
        event_date: new Date(birth_date),
        status: 'completed',
        details: {
          birth_type,
          calf_gender,
          calf_weight,
          calf_health_status,
          complications,
          veterinarian_assistance,
          gestation_period_days: gestationPeriodDays,
          location: birthLocation,
          service_reference: lastService ? (lastService as any).id : null
        },
        recorded_by: userId
      } as any);

      // Crear el registro del becerro como nuevo bovino
      const calfData = {
        earring_number: await ReproductionController.generateCalfEarringNumber((mother as any).ranch_id),
        name: `Cría de ${(mother as any).name}`,
        breed: (mother as any).breed,
        gender: calf_gender,
        birthDate: new Date(birth_date),
        mother_id,
        father_id: lastService ? (lastService as any).bull_id : null,
        ranch_id: (mother as any).ranch_id,
        status: calf_health_status === 'deceased' ? 'deceased' : 'active',
        current_weight: calf_weight || null,
        birth_weight: calf_weight || null,
        health_status: calf_health_status
      };

      const newCalf = await Bovine.create(calfData as any);

      // Actualizar estado reproductivo de la madre
      try {
        await (mother as any).update({
          reproduction_status: 'lactating',
          expected_birth_date: null,
          last_birth_date: new Date(birth_date),
          total_births: ((mother as any).total_births || 0) + 1
        });
      } catch (err: any) {
        console.warn('Error actualizando madre:', err);
      }

      // Crear eventos según el resultado del parto
      if (calf_health_status === 'healthy') {
        try {
          await Event.create({
            bovine_id: mother_id,
            eventType: 'successful_birth',
            title: 'Parto exitoso',
            description: `Becerr${calf_gender === 'female' ? 'a' : 'o'} ${calf_gender === 'female' ? 'nacida' : 'nacido'} ${calf_weight ? `con peso de ${calf_weight}kg` : 'con salud normal'}`,
            status: 'completed',
            priority: 'medium'
          } as any);
        } catch (err: any) {
          console.warn('Error creando evento:', err);
        }
      } else if (calf_health_status === 'deceased') {
        try {
          await Event.create({
            bovine_id: mother_id,
            eventType: 'birth_loss',
            title: 'Pérdida en el parto',
            description: `Becerr${calf_gender === 'female' ? 'a' : 'o'} falleció durante o después del parto. ${complications.length > 0 ? `Complicaciones: ${complications.join(', ')}` : ''}`,
            status: 'active',
            priority: 'high'
          } as any);
        } catch (err: any) {
          console.warn('Error creando evento:', err);
        }
      }

      // Programar próximo período reproductivo
      const nextServiceDate = new Date(birth_date);
      nextServiceDate.setDate(nextServiceDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS);

      try {
        await Event.create({
          bovine_id: mother_id,
          eventType: 'breeding_ready',
          title: 'Lista para próximo servicio',
          description: 'Período post-parto completado, puede ser servida nuevamente',
          status: 'pending',
          priority: 'medium',
          scheduled_date: nextServiceDate
        } as any);
      } catch (err: any) {
        console.warn('Error creando evento:', err);
      }

      // Resolver eventos de parto pendientes
      try {
        await Event.update(
          { status: 'resolved' } as any,
          {
            where: literal(`bovine_id = '${mother_id}' AND eventType IN ('birth_approaching', 'pregnancy_confirmed') AND status IN ('pending', 'active')`) as any
          }
        );
      } catch (err: any) {
        console.warn('Error actualizando eventos:', err);
      }

      // Obtener el registro con relaciones
      const recordWithRelations = await Reproduction.findByPk((birthRecord as any).id, {
        include: [
          {
            model: Bovine,
            as: 'bovine',
            attributes: ['id', 'earring_number', 'name', 'breed'],
            required: false
          },
          {
            model: User,
            as: 'recordedBy',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Parto registrado exitosamente',
        data: {
          birth_record: recordWithRelations,
          new_calf: {
            id: (newCalf as any).id,
            earring_number: (newCalf as any).earring_number,
            gender: (newCalf as any).gender,
            birth_weight: (newCalf as any).birth_weight,
            health_status: (newCalf as any).health_status
          },
          mother_status: {
            reproduction_status: 'lactating',
            total_births: ((mother as any).total_births || 0) + 1,
            next_service_available: nextServiceDate
          },
          statistics: {
            gestation_period_days: gestationPeriodDays,
            birth_type: birth_type,
            complications_count: complications.length
          }
        }
      });

    } catch (error) {
      console.error('❌ Error registrando parto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // --------------------------------------------------------------------------
  // OBTENER ESTADÍSTICAS REPRODUCTIVAS DEL RANCHO
  // --------------------------------------------------------------------------
  
  public static async getReproductiveStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { ranch_id } = req.params;
      const { period = '365' } = req.query; // días para el análisis

      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener métricas reproductivas
      const metrics = await ReproductionController.calculateReproductiveMetrics(
        ranch_id, startDate, new Date()
      );

      // Estadísticas por raza
      const breedStats = await ReproductionController.getReproductiveStatsByBreed(
        ranch_id, startDate, new Date()
      );

      // Calendario reproductivo próximo
      const upcomingEvents = await ReproductionController.getUpcomingReproductiveEvents(ranch_id);

      // Análisis de tendencias
      const trends = await ReproductionController.getReproductiveTrends(
        ranch_id, startDate, new Date()
      );

      res.status(200).json({
        success: true,
        message: 'Estadísticas reproductivas obtenidas exitosamente',
        data: {
          ranch_id,
          period: { days, start_date: startDate, end_date: new Date() },
          overall_metrics: metrics,
          breed_analysis: breedStats,
          upcoming_events: upcomingEvents,
          trends,
          recommendations: ReproductionController.generateReproductiveRecommendations(metrics)
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas reproductivas:', error);
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

  // Calcular edad en meses
  private static calculateAgeInMonths(birthDate: Date): number {
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth());
    return months;
  }

  // Generar número de arete para becerro
  private static async generateCalfEarringNumber(ranchId: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const lastCalf = await Bovine.findOne({
      where: literal(`ranch_id = '${ranchId}' AND earring_number LIKE 'C${year}%'`),
      order: [['earring_number', 'DESC']]
    } as any).catch(() => null);

    let sequence = 1;
    if (lastCalf) {
      const lastSequence = parseInt((lastCalf as any).earring_number.slice(-3));
      sequence = lastSequence + 1;
    }

    return `C${year}${sequence.toString().padStart(3, '0')}`;
  }

  // Calcular métricas reproductivas
  private static async calculateReproductiveMetrics(
    ranchId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ReproductiveMetrics> {
    try {
      // Obtener datos reproductivos del período usando literal para evitar errores
      const services = await Reproduction.count({
        where: literal(`reproduction_type = 'service' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
      } as any).catch(() => 0);

      const pregnancies = await Reproduction.count({
        where: literal(`reproduction_type = 'pregnancy_check' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND details->>'result' = 'positive' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
      } as any).catch(() => 0);

      const births = await Reproduction.count({
        where: literal(`reproduction_type = 'birth' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
      } as any).catch(() => 0);

      const calfDeaths = await Reproduction.count({
        where: literal(`reproduction_type = 'birth' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND details->>'calf_health_status' = 'deceased' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
      } as any).catch(() => 0);

      // Manejar el caso donde count puede retornar arrays
      const servicesCount = Array.isArray(services) ? services.length : (services || 0);
      const pregnanciesCount = Array.isArray(pregnancies) ? pregnancies.length : (pregnancies || 0);
      const birthsCount = Array.isArray(births) ? births.length : (births || 0);
      const calfDeathsCount = Array.isArray(calfDeaths) ? calfDeaths.length : (calfDeaths || 0);

      // Calcular métricas
      const conceptionRate = servicesCount > 0 ? (pregnanciesCount / servicesCount) * 100 : 0;
      const pregnancyRate = servicesCount > 0 ? (pregnanciesCount / servicesCount) * 100 : 0;
      const servicesPerConception = pregnanciesCount > 0 ? servicesCount / pregnanciesCount : 0;
      const calfMortalityRate = birthsCount > 0 ? (calfDeathsCount / birthsCount) * 100 : 0;

      // Calcular intervalo entre partos (placeholder)
      const calvingIntervalDays = 400; // Se calcularía con datos históricos reales

      // Eficiencia de detección de celos (placeholder)
      const heatDetectionEfficiency = 85; // Se calcularía basado en registros de celo

      // Peso promedio al nacer
      const avgBirthWeight = 35; // Placeholder

      // Score de eficiencia reproductiva
      const reproductiveEfficiencyScore = Math.round(
        (conceptionRate * 0.3) + 
        (heatDetectionEfficiency * 0.2) + 
        ((100 - calfMortalityRate) * 0.2) + 
        (pregnancyRate * 0.3)
      );

      return {
        conception_rate: parseFloat(conceptionRate.toFixed(1)),
        pregnancy_rate: parseFloat(pregnancyRate.toFixed(1)),
        calving_interval_days: calvingIntervalDays,
        services_per_conception: parseFloat(servicesPerConception.toFixed(1)),
        heat_detection_efficiency: heatDetectionEfficiency,
        birth_weight_average: parseFloat(avgBirthWeight.toFixed(1)),
        calf_mortality_rate: parseFloat(calfMortalityRate.toFixed(1)),
        reproductive_efficiency_score: reproductiveEfficiencyScore
      };
    } catch (error) {
      console.error('Error calculando métricas reproductivas:', error);
      return {
        conception_rate: 0,
        pregnancy_rate: 0,
        calving_interval_days: 0,
        services_per_conception: 0,
        heat_detection_efficiency: 0,
        birth_weight_average: 0,
        calf_mortality_rate: 0,
        reproductive_efficiency_score: 0
      };
    }
  }

  // Obtener estadísticas por raza
  private static async getReproductiveStatsByBreed(
    ranchId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<any[]> {
    // Placeholder para estadísticas por raza
    // En implementación completa analizaría cada raza por separado
    return [];
  }

  // Obtener eventos reproductivos próximos
  private static async getUpcomingReproductiveEvents(ranchId: string): Promise<any[]> {
    try {
      const upcomingEvents = await Event.findAll({
        where: literal(`eventType IN ('pregnancy_check_due', 'birth_approaching', 'heat_detection_due', 'breeding_ready') AND status = 'pending' AND scheduled_date >= NOW() AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`),
        order: [['scheduled_date', 'ASC']],
        limit: 20
      } as any).catch(() => []);

      return upcomingEvents;
    } catch (error) {
      console.error('Error obteniendo eventos próximos:', error);
      return [];
    }
  }

  // Obtener tendencias reproductivas
  private static async getReproductiveTrends(
    ranchId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<any> {
    // Placeholder para análisis de tendencias
    // En implementación completa mostraría tendencias mensuales/anuales
    return {
      monthly_services: [],
      monthly_pregnancies: [],
      monthly_births: [],
      seasonal_patterns: {}
    };
  }

  // Generar recomendaciones reproductivas
  private static generateReproductiveRecommendations(metrics: ReproductiveMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.conception_rate < 60) {
      recommendations.push('Mejorar la tasa de concepción mediante mejor detección de celos y timing de servicios');
    }

    if (metrics.heat_detection_efficiency < 80) {
      recommendations.push('Implementar un programa más estructurado de detección de celos');
    }

    if (metrics.services_per_conception > 2) {
      recommendations.push('Evaluar la calidad del semen y técnica de inseminación');
    }

    if (metrics.calf_mortality_rate > 5) {
      recommendations.push('Revisar manejo perinatal y cuidados del recién nacido');
    }

    if (metrics.calving_interval_days > 400) {
      recommendations.push('Reducir el intervalo entre partos mejorando la nutrición post-parto');
    }

    if (recommendations.length === 0) {
      recommendations.push('El programa reproductivo muestra excelentes resultados, continuar con las prácticas actuales');
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default ReproductionController;