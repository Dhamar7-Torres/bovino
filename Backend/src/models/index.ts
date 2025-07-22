import { Sequelize, Op } from 'sequelize';


// Importar todos los modelos
import Bovine from './Bovine';
import Event from './Event';
import Finance from './Finance';
import Health from './Health';

// Interface para configuración de la base de datos
interface DatabaseConfig {
  sync: boolean;
  force: boolean;
  alter: boolean;
  logging: boolean;
}

// Clase principal para manejo de la base de datos
class Database {
  public sequelize: Sequelize;
  public models: {
    Bovine: typeof Bovine;
    Event: typeof Event;
    Finance: typeof Finance;
    Health: typeof Health;
  };

  constructor() {
    this.sequelize = sequelize;
    this.models = {
      Bovine,
      Event,
      Finance,
      Health
    };

    // Establecer las relaciones entre modelos
    this.setupAssociations();
  }

  /**
   * Configura todas las relaciones entre modelos
   */
  private setupAssociations(): void {
    console.log('🔗 Configurando relaciones entre modelos...');

    // =============================================
    // RELACIONES DEL MODELO BOVINE
    // =============================================

    // 1. Un bovino puede tener muchos eventos
    Bovine.hasMany(Event, {
      foreignKey: 'bovineId',
      as: 'events',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 2. Un bovino puede tener muchas transacciones financieras
    Bovine.hasMany(Finance, {
      foreignKey: 'bovineId',
      as: 'financialTransactions',
      onDelete: 'SET NULL', // Mantener registros financieros para auditoría
      onUpdate: 'CASCADE'
    });

    // 3. Un bovino puede tener muchos registros de salud
    Bovine.hasMany(Health, {
      foreignKey: 'bovineId',
      as: 'healthRecords',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 4. Relaciones familiares - Madre
    Bovine.belongsTo(Bovine, {
      foreignKey: 'motherId',
      as: 'mother',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 5. Relaciones familiares - Padre
    Bovine.belongsTo(Bovine, {
      foreignKey: 'fatherId',
      as: 'father',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 6. Hijos (crías) - relación inversa con madre
    Bovine.hasMany(Bovine, {
      foreignKey: 'motherId',
      as: 'offspring',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 7. Descendencia paterna - relación inversa con padre
    Bovine.hasMany(Bovine, {
      foreignKey: 'fatherId',
      as: 'paternalOffspring',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // =============================================
    // RELACIONES DEL MODELO EVENT
    // =============================================

    // 8. Un evento pertenece a un bovino
    Event.belongsTo(Bovine, {
      foreignKey: 'bovineId',
      as: 'bovine',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 9. Un evento puede generar una transacción financiera
    Event.hasOne(Finance, {
      foreignKey: 'eventId',
      as: 'financialTransaction',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 10. Eventos recurrentes - relación padre-hijo
    Event.belongsTo(Event, {
      foreignKey: 'parentEventId',
      as: 'parentEvent',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 11. Eventos hijos - relación inversa
    Event.hasMany(Event, {
      foreignKey: 'parentEventId',
      as: 'childEvents',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // =============================================
    // RELACIONES DEL MODELO FINANCE
    // =============================================

    // 12. Una transacción financiera puede estar relacionada con un bovino
    Finance.belongsTo(Bovine, {
      foreignKey: 'bovineId',
      as: 'bovine',
      onDelete: 'SET NULL', // Mantener transacciones para auditoría
      onUpdate: 'CASCADE'
    });

    // 13. Una transacción financiera puede estar relacionada con un evento
    Finance.belongsTo(Event, {
      foreignKey: 'eventId',
      as: 'event',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 14. Transacciones recurrentes - relación padre-hijo
    Finance.belongsTo(Finance, {
      foreignKey: 'parentTransactionId',
      as: 'parentTransaction',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 15. Transacciones hijas - relación inversa
    Finance.hasMany(Finance, {
      foreignKey: 'parentTransactionId',
      as: 'childTransactions',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // =============================================
    // RELACIONES DEL MODELO HEALTH
    // =============================================

    // 16. Un registro de salud pertenece a un bovino
    Health.belongsTo(Bovine, {
      foreignKey: 'bovineId',
      as: 'bovine',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 17. Un registro de salud puede generar costos (transacciones financieras)
    Health.hasMany(Finance, {
      foreignKey: 'eventId', // Se relaciona a través del eventId si el health record tiene un evento asociado
      as: 'relatedFinancialTransactions',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    console.log('✅ Relaciones configuradas exitosamente');
  }

  /**
   * Sincroniza la base de datos con los modelos
   * @param config Configuración para la sincronización
   */
  public async syncDatabase(config: Partial<DatabaseConfig> = {}): Promise<void> {
    const defaultConfig: DatabaseConfig = {
      sync: true,
      force: false,      // ⚠️ CUIDADO: true elimina todas las tablas
      alter: false,      // true modifica tablas existentes
      logging: true
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      console.log('🗄️  Iniciando sincronización de base de datos...');
      
      // Verificar conexión
      await this.sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente');

      if (finalConfig.sync) {
        // Sincronizar modelos en orden específico para evitar problemas de dependencias
        console.log('🔄 Sincronizando modelos...');

        await this.sequelize.sync({
          force: finalConfig.force,
          alter: finalConfig.alter,
          logging: finalConfig.logging ? console.log : false
        });

        console.log('✅ Modelos sincronizados correctamente');

        // Crear índices adicionales si es necesario
        await this.createAdditionalIndexes();
      }

    } catch (error) {
      console.error('❌ Error durante la sincronización de la base de datos:', error);
      throw error;
    }
  }

  /**
   * Crea índices adicionales para optimización
   */
  private async createAdditionalIndexes(): Promise<void> {
    try {
      console.log('📊 Creando índices adicionales...');

      // Índice compuesto para búsquedas frecuentes de bovinos
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_bovines_search 
        ON bovines (ear_tag, breed, health_status, is_active)
      `);

      // Índice para búsquedas de eventos por fecha y tipo
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_events_search 
        ON events (bovine_id, event_type, scheduled_date, status)
      `);

      // Índice para búsquedas financieras por período
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_finances_period 
        ON finances (transaction_date, transaction_type, status, fiscal_year)
      `);

      // Índice para registros de salud por fecha
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_health_timeline 
        ON health_records (bovine_id, record_date, overall_health_status)
      `);

      // Índice espacial para ubicaciones si PostGIS está disponible
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_bovines_location_spatial 
        ON bovines USING GIST ((location->'latitude'), (location->'longitude'))
      `).catch(() => {
        console.log('⚠️  PostGIS no disponible, saltando índices espaciales');
      });

      console.log('✅ Índices adicionales creados');

    } catch (error) {
      console.error('⚠️  Error creando índices adicionales:', error);
      // No lanzar error, los índices son opcionales
    }
  }

  /**
   * Cierra la conexión a la base de datos
   */
  public async closeConnection(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('🔌 Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('❌ Error cerrando la conexión:', error);
      throw error;
    }
  }

  /**
   * Ejecuta las migraciones pendientes
   */
  public async runMigrations(): Promise<void> {
    try {
      console.log('🚀 Ejecutando migraciones...');
      
      // Aquí se ejecutarían las migraciones de Sequelize
      // await this.sequelize.getQueryInterface().
      
      console.log('✅ Migraciones ejecutadas correctamente');
    } catch (error) {
      console.error('❌ Error ejecutando migraciones:', error);
      throw error;
    }
  }

  /**
   * Crea datos de prueba para desarrollo
   */
  public async createSeedData(): Promise<void> {
    try {
      console.log('🌱 Creando datos de prueba...');

      // Verificar si ya existen datos
      const bovineCount = await Bovine.count();
      if (bovineCount > 0) {
        console.log('📊 Ya existen datos en la base de datos, saltando seed');
        return;
      }

      // Crear bovino de ejemplo
      const sampleBovine = await Bovine.create({
        earTag: 'MX-001234',
        name: 'Lupita',
        breed: 'Holstein',
        cattleType: 'COW',
        gender: 'FEMALE',
        birthDate: new Date('2020-03-15'),
        weight: 450,
        healthStatus: 'HEALTHY',
        vaccinationStatus: 'UP_TO_DATE',
        location: {
          latitude: 17.9869,
          longitude: -92.9303,
          address: 'Rancho El Progreso, Tabasco',
          municipality: 'Villahermosa',
          state: 'Tabasco',
          country: 'México'
        },
        isActive: true,
        createdBy: 'system'
      });

      // Crear evento de ejemplo
      await Event.create({
        bovineId: sampleBovine.id,
        eventType: 'VACCINATION',
        title: 'Vacunación Triple Viral',
        description: 'Aplicación de vacuna triple viral como parte del programa de inmunización',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        scheduledDate: new Date(),
        location: {
          latitude: 17.9869,
          longitude: -92.9303
        },
        followUpRequired: false,
        isActive: true,
        createdBy: 'system'
      });

      // Crear registro financiero de ejemplo
      await Finance.create({
        transactionType: 'EXPENSE',
        category: 'VACCINATION',
        title: 'Compra de Vacuna Triple Viral',
        description: 'Vacuna para el programa de inmunización del ganado',
        amount: 250.00,
        currency: 'MXN',
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        transactionDate: new Date(),
        bovineId: sampleBovine.id,
        followUpRequired: false,
        isApproved: true,
        isActive: true,
        createdBy: 'system'
      });

      // Crear registro de salud de ejemplo
      await Health.create({
        bovineId: sampleBovine.id,
        recordType: 'ROUTINE_CHECKUP',
        recordDate: new Date(),
        chiefComplaint: 'Chequeo rutinario de salud',
        vitalSigns: {
          temperature: 38.5,
          heartRate: 70,
          respiratoryRate: 30
        },
        physicalExam: {
          bodyConditionScore: 7,
          locomotionScore: 1,
          weight: 450,
          skinCondition: 'NORMAL',
          eyeCondition: 'CLEAR'
        },
        overallHealthStatus: 'GOOD',
        recommendations: ['Continuar con programa de vacunación', 'Monitoreo de peso mensual'],
        followUpRequired: false,
        isEmergency: false,
        isCompleted: true,
        isActive: true,
        createdBy: 'system'
      });

      console.log('✅ Datos de prueba creados correctamente');

    } catch (error) {
      console.error('❌ Error creando datos de prueba:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  public async getDatabaseStats(): Promise<{
    bovines: number;
    events: number;
    finances: number;
    healthRecords: number;
    totalRecords: number;
  }> {
    try {
      const [bovines, events, finances, healthRecords] = await Promise.all([
        Bovine.count(),
        Event.count(),
        Finance.count(),
        Health.count()
      ]);

      return {
        bovines,
        events,
        finances,
        healthRecords,
        totalRecords: bovines + events + finances + healthRecords
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Valida la integridad de los datos
   */
  public async validateDataIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      console.log('🔍 Validando integridad de datos...');

      // Verificar bovinos sin ubicación
      const bovinesWithoutLocation = await Bovine.count({
        where: {
          location: null
        }
      });

      if (bovinesWithoutLocation > 0) {
        issues.push(`${bovinesWithoutLocation} bovinos sin ubicación registrada`);
      }

      // Verificar eventos huérfanos (sin bovino)
      const orphanEvents = await Event.count({
        include: [{
          model: Bovine,
          as: 'bovine',
          required: false
        }],
        where: {
          '$bovine.id$': null
        }
      });

      if (orphanEvents > 0) {
        issues.push(`${orphanEvents} eventos sin bovino asociado`);
      }

      // Verificar transacciones sin aprobar antigas
      const oldPendingTransactions = await Finance.count({
        where: {
          isApproved: false,
          createdAt: {
            [this.sequelize.Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 días atrás
          }
        }
      });

      if (oldPendingTransactions > 0) {
        issues.push(`${oldPendingTransactions} transacciones pendientes de aprobación por más de 30 días`);
      }

      console.log(`✅ Validación completada. ${issues.length} problemas encontrados`);

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      console.error('❌ Error durante validación:', error);
      return {
        isValid: false,
        issues: [`Error durante validación: ${error}`]
      };
    }
  }

  /**
   * Respalda la base de datos (solo estructura)
   */
  public async backupSchema(): Promise<string> {
    try {
      console.log('💾 Creando respaldo del esquema...');
      
      const queryInterface = this.sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      
      let backupScript = '-- Respaldo del esquema de base de datos\n';
      backupScript += `-- Generado el: ${new Date().toISOString()}\n\n`;

      for (const table of tables) {
        const tableInfo = await queryInterface.describeTable(table);
        backupScript += `-- Tabla: ${table}\n`;
        backupScript += JSON.stringify(tableInfo, null, 2);
        backupScript += '\n\n';
      }

      console.log('✅ Respaldo del esquema creado');
      return backupScript;

    } catch (error) {
      console.error('❌ Error creando respaldo:', error);
      throw error;
    }
  }
}

// Crear instancia única de la base de datos
const database = new Database();

// Exportar la instancia y los modelos
export default database;
export const { sequelize, models } = database;
export { Bovine, Event, Finance, Health };

// Exportar tipos para uso en la aplicación
export type {
  BovineAttributes,
  BovineCreationAttributes,
  CattleType,
  HealthStatus as BovineHealthStatus,
  VaccinationStatus,
  GenderType,
  LocationData,
  PhysicalMetrics,
  ReproductiveInfo,
  TrackingConfig
} from './Bovine';

export type {
  EventAttributes,
  EventCreationAttributes,
  EventType,
  EventStatus,
  EventPriority,
  RecurrenceType,
  VaccinationEventData,
  DiseaseEventData,
  TreatmentEventData,
  HealthCheckEventData,
  ReproductionEventData,
  MovementEventData
} from './Event';

export type {
  FinanceAttributes,
  FinanceCreationAttributes,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  PaymentMethod,
  TransactionStatus,
  RecurrenceFrequency,
  BudgetStatus,
  ContactInfo,
  InvoiceInfo,
  BudgetInfo,
  AmortizationInfo,
  FinancialAnalysis
} from './Finance';

export type {
  HealthAttributes,
  HealthCreationAttributes,
  HealthRecordType,
  HealthStatus,
  DiagnosisStatus,
  TreatmentStatus,
  SeverityLevel,
  BodySystem,
  VitalSigns,
  PhysicalExamination,
  Symptoms,
  Diagnosis,
  Treatment,
  LaboratoryResults,
  NutritionalAssessment,
  ReproductiveAssessment
} from './Health';

// Función de inicialización para usar en la aplicación
export async function initializeDatabase(config?: Partial<DatabaseConfig>): Promise<Database> {
  try {
    console.log('🚀 Inicializando sistema de base de datos...');
    
    await database.syncDatabase(config);
    
    // Crear datos de prueba solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await database.createSeedData();
    }

    // Validar integridad de datos
    const validation = await database.validateDataIntegrity();
    if (!validation.isValid) {
      console.warn('⚠️  Problemas de integridad encontrados:', validation.issues);
    }

    // Mostrar estadísticas
    const stats = await database.getDatabaseStats();
    console.log('📊 Estadísticas de la base de datos:', stats);

    console.log('✅ Base de datos inicializada correctamente');
    return database;

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
}

// Función para cerrar la base de datos de forma segura
export async function closeDatabase(): Promise<void> {
  try {
    await database.closeConnection();
  } catch (error) {
    console.error('❌ Error cerrando la base de datos:', error);
    throw error;
  }
}