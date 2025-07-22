// Importaciones condicionales para evitar errores antes de instalar dependencias
let Sequelize: any;
let config: any;

try {
  const sequelizeModule = require('sequelize');
  Sequelize = sequelizeModule.Sequelize;
  const dotenvModule = require('dotenv');
  config = dotenvModule.config;
  
  // Cargar variables de entorno
  config();
} catch (error) {
  console.warn('⚠️  Dependencias no instaladas aún. Ejecuta: npm install sequelize pg dotenv');
}

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface DatabaseConfig {
  development: ConnectionConfig;
  test: ConnectionConfig;
  production: ConnectionConfig;
}

interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'postgres';
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    } | boolean;
  };
  pool?: PoolConfig;
  logging?: boolean | ((sql: string) => void);
  timezone?: string;
  define?: DefineOptions;
}

interface PoolConfig {
  max: number;
  min: number;
  acquire: number;
  idle: number;
}

interface DefineOptions {
  timestamps: boolean;
  underscored: boolean;
  createdAt: string;
  updatedAt: string;
  charset: string;
  collate: string;
}

// ============================================================================
// CONFIGURACIONES DE ENTORNO
// ============================================================================

// Configuración base que se aplicará a todos los entornos
const baseConfig: Partial<ConnectionConfig> = {
  dialect: 'postgres' as const,
  timezone: '-06:00', // Zona horaria de México (Villahermosa, Tabasco)
  pool: {
    max: 5,          // Máximo 5 conexiones simultáneas
    min: 0,          // Mínimo 0 conexiones en el pool
    acquire: 30000,  // Tiempo máximo para obtener conexión (30 segundos)
    idle: 10000      // Tiempo máximo de inactividad antes de cerrar (10 segundos)
  },
  define: {
    timestamps: true,           // Agregar createdAt y updatedAt automáticamente
    underscored: true,         // Usar snake_case para nombres de columnas
    createdAt: 'created_at',   // Nombre personalizado para fecha de creación
    updatedAt: 'updated_at',   // Nombre personalizado para fecha de actualización
    charset: 'utf8mb4',        // Soporte para emojis y caracteres especiales
    collate: 'utf8mb4_unicode_ci'
  }
};

// Configuraciones específicas por entorno
const databaseConfig: DatabaseConfig = {
  // Configuración para desarrollo local
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cattle_management_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres' as const,
    timezone: '-06:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: console.log, // Mostrar todas las consultas SQL en desarrollo
  },

  // Configuración para pruebas
  test: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'cattle_management_test',
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    dialect: 'postgres' as const,
    timezone: '-06:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: false, // Desactivar logging en pruebas para output más limpio
  },

  // Configuración para producción
  production: {
    host: process.env.PROD_DB_HOST || 'localhost',
    port: parseInt(process.env.PROD_DB_PORT || '5432'),
    database: process.env.PROD_DB_NAME || 'cattle_management_prod',
    username: process.env.PROD_DB_USER || 'postgres',
    password: process.env.PROD_DB_PASSWORD || '',
    dialect: 'postgres' as const,
    timezone: '-06:00',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false // Para servicios cloud como Heroku, Railway, etc.
      } : false
    },
    pool: {
      max: 20,         // Más conexiones en producción
      min: 5,          // Mantener mínimo de conexiones activas
      acquire: 60000,  // Mayor tiempo de espera en producción
      idle: 300000     // 5 minutos de idle time en producción
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: false, // Desactivar logging en producción por rendimiento
  }
};

// ============================================================================
// INSTANCIA DE SEQUELIZE
// ============================================================================

// Obtener el entorno actual (development, test, production)
const environment = (process.env.NODE_ENV as keyof DatabaseConfig) || 'development';

// Crear instancia de Sequelize con la configuración del entorno actual
let sequelize: any;

if (Sequelize) {
  sequelize = new Sequelize(databaseConfig[environment]);
} else {
  // Mock object para cuando las dependencias no están instaladas
  sequelize = {
    authenticate: () => Promise.resolve(),
    sync: () => Promise.resolve(),
    close: () => Promise.resolve()
  };
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Función para probar la conexión a la base de datos
 * @returns Promise<boolean> - true si la conexión es exitosa, false en caso contrario
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión a base de datos establecida correctamente en entorno: ${environment}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

/**
 * Función para sincronizar todos los modelos con la base de datos
 * @param force - Si es true, elimina y recrea todas las tablas
 * @param alter - Si es true, modifica las tablas existentes para coincidir con los modelos
 * @returns Promise<void>
 */
export const syncDatabase = async (force: boolean = false, alter: boolean = false): Promise<void> => {
  try {
    const options: any = { force, alter };
    
    if (force) {
      console.log('⚠️  ADVERTENCIA: Eliminando y recreando todas las tablas...');
    } else if (alter) {
      console.log('🔄 Modificando tablas existentes para coincidir con modelos...');
    } else {
      console.log('📋 Creando tablas que no existen...');
    }

    await sequelize.sync(options);
    console.log('✅ Sincronización de base de datos completada');
  } catch (error) {
    console.error('❌ Error durante la sincronización de base de datos:', error);
    throw error;
  }
};

/**
 * Función para cerrar la conexión a la base de datos
 * @returns Promise<void>
 */
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('🔌 Conexión a base de datos cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
    throw error;
  }
};

/**
 * Función para obtener información sobre el estado de la conexión
 * @returns object con información de la conexión
 */
export const getConnectionInfo = () => {
  const config = databaseConfig[environment];
  return {
    environment,
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    isConnected: sequelize.authenticate ? true : false,
    poolInfo: {
      max: config.pool?.max || 0,
      min: config.pool?.min || 0,
      acquire: config.pool?.acquire || 0,
      idle: config.pool?.idle || 0
    }
  };
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

// Exportar instancia de Sequelize como default
export default sequelize;

// Exportar configuraciones para uso en otros módulos
export { databaseConfig, environment };

// Exportar tipos para uso en otros archivos
export type { DatabaseConfig, ConnectionConfig, PoolConfig, DefineOptions };