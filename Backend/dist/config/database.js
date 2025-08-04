"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = exports.databaseConfig = exports.getConnectionInfo = exports.closeConnection = exports.syncDatabase = exports.testConnection = void 0;
let Sequelize;
let config;
try {
    const sequelizeModule = require('sequelize');
    Sequelize = sequelizeModule.Sequelize;
    const dotenvModule = require('dotenv');
    config = dotenvModule.config;
    config();
}
catch (error) {
    console.warn('⚠️  Dependencias no instaladas aún. Ejecuta: npm install sequelize pg dotenv');
}
const baseConfig = {
    dialect: 'postgres',
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
    }
};
const databaseConfig = {
    development: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'cattle_management_dev',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        dialect: 'postgres',
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
        logging: console.log,
    },
    test: {
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        database: process.env.TEST_DB_NAME || 'cattle_management_test',
        username: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'password',
        dialect: 'postgres',
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
        logging: false,
    },
    production: {
        host: process.env.PROD_DB_HOST || 'localhost',
        port: parseInt(process.env.PROD_DB_PORT || '5432'),
        database: process.env.PROD_DB_NAME || 'cattle_management_prod',
        username: process.env.PROD_DB_USER || 'postgres',
        password: process.env.PROD_DB_PASSWORD || '',
        dialect: 'postgres',
        timezone: '-06:00',
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 300000
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        logging: false,
    }
};
exports.databaseConfig = databaseConfig;
const environment = process.env.NODE_ENV || 'development';
exports.environment = environment;
let sequelize;
if (Sequelize) {
    sequelize = new Sequelize(databaseConfig[environment]);
}
else {
    sequelize = {
        authenticate: () => Promise.resolve(),
        sync: () => Promise.resolve(),
        close: () => Promise.resolve()
    };
}
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log(`✅ Conexión a base de datos establecida correctamente en entorno: ${environment}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
};
exports.testConnection = testConnection;
const syncDatabase = async (force = false, alter = false) => {
    try {
        const options = { force, alter };
        if (force) {
            console.log('⚠️  ADVERTENCIA: Eliminando y recreando todas las tablas...');
        }
        else if (alter) {
            console.log('🔄 Modificando tablas existentes para coincidir con modelos...');
        }
        else {
            console.log('📋 Creando tablas que no existen...');
        }
        await sequelize.sync(options);
        console.log('✅ Sincronización de base de datos completada');
    }
    catch (error) {
        console.error('❌ Error durante la sincronización de base de datos:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
const closeConnection = async () => {
    try {
        await sequelize.close();
        console.log('🔌 Conexión a base de datos cerrada correctamente');
    }
    catch (error) {
        console.error('❌ Error al cerrar la conexión:', error);
        throw error;
    }
};
exports.closeConnection = closeConnection;
const getConnectionInfo = () => {
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
exports.getConnectionInfo = getConnectionInfo;
exports.default = sequelize;
//# sourceMappingURL=database.js.map