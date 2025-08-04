"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = exports.getPool = exports.validateCoordinates = exports.sanitizeInput = exports.closePool = exports.tableExists = exports.findByLocation = exports.softDelete = exports.getRecordsWithPagination = exports.updateRecord = exports.insertAndGetId = exports.executeTransaction = exports.executeQuery = exports.testConnection = exports.initializeDatabase = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const loadEnvVariables = () => {
    try {
        const envPath = (0, path_1.join)(process.cwd(), '.env');
        const envFile = (0, fs_1.readFileSync)(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
    catch (error) {
        console.log('📝 Archivo .env no encontrado, usando variables por defecto');
    }
};
loadEnvVariables();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cattle_tracking_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
let pool = null;
class MockDatabaseClient {
    async query(text, params) {
        console.log('🔍 Mock Query:', text, params);
        return {
            rows: [],
            rowCount: 0,
            command: 'SELECT',
            oid: 0,
            fields: []
        };
    }
    release() {
        console.log('🔓 Mock client released');
    }
}
class MockDatabasePool {
    async connect() {
        return new MockDatabaseClient();
    }
    async query(text, params) {
        const client = await this.connect();
        const result = await client.query(text, params);
        client.release();
        return result;
    }
    async end() {
        console.log('🔐 Mock pool ended');
    }
    on(event, listener) {
        console.log('👂 Mock pool event listener:', event);
    }
}
const initializeDatabase = async () => {
    try {
        let pgModule = null;
        try {
            pgModule = eval('require')('pg');
        }
        catch (requireError) {
            console.log('📦 Módulo pg no disponible, usando implementación mock');
        }
        if (pgModule && pgModule.Pool) {
            const PostgreSQLPool = pgModule.Pool;
            pool = new PostgreSQLPool(dbConfig);
            pool.on('error', (err) => {
                console.error('❌ Error inesperado en el pool de base de datos:', err);
            });
            console.log('✅ PostgreSQL inicializado correctamente');
        }
        else {
            pool = new MockDatabasePool();
            console.log('⚠️ Usando implementación mock de base de datos');
        }
    }
    catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        pool = new MockDatabasePool();
        console.log('⚠️ Fallback a implementación mock de base de datos');
    }
};
exports.initializeDatabase = initializeDatabase;
const ensurePoolInitialized = () => {
    if (!pool) {
        throw new Error('Base de datos no inicializada. Llama a initializeDatabase() primero.');
    }
};
const testConnection = async () => {
    try {
        ensurePoolInitialized();
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Conexión a la base de datos establecida correctamente');
        return true;
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
};
exports.testConnection = testConnection;
const executeQuery = async (query, params) => {
    ensurePoolInitialized();
    const client = await pool.connect();
    try {
        const startTime = Date.now();
        const result = await client.query(query, params);
        const executionTime = Date.now() - startTime;
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 Query ejecutada en ${executionTime}ms:`, query);
        }
        return result;
    }
    catch (error) {
        console.error('❌ Error ejecutando consulta:', error);
        console.error('📝 Query:', query);
        console.error('📋 Parámetros:', params);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.executeQuery = executeQuery;
const executeTransaction = async (queries) => {
    ensurePoolInitialized();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];
        for (const { query, params } of queries) {
            const result = await client.query(query, params);
            results.push(result);
        }
        await client.query('COMMIT');
        console.log('✅ Transacción completada exitosamente');
        return results;
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en transacción, realizando rollback:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.executeTransaction = executeTransaction;
const insertAndGetId = async (tableName, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    const query = `
    INSERT INTO ${tableName} (${keys.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id
  `;
    const result = await (0, exports.executeQuery)(query, values);
    return result.rows[0]?.id || 0;
};
exports.insertAndGetId = insertAndGetId;
const updateRecord = async (tableName, data, conditions) => {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const setClause = dataKeys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    const whereClause = conditionKeys
        .map((key, index) => `${key} = $${dataKeys.length + index + 1}`)
        .join(' AND ');
    const query = `
    UPDATE ${tableName}
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE ${whereClause}
  `;
    const allValues = [...dataValues, ...conditionValues];
    const result = await (0, exports.executeQuery)(query, allValues);
    return result.rowCount || 0;
};
exports.updateRecord = updateRecord;
const getRecordsWithPagination = async (tableName, options = {}) => {
    const { select = ['*'], filters = {}, pagination = {}, orderBy = 'created_at DESC', joins = '' } = options;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    const filterKeys = Object.keys(filters);
    const filterValues = Object.values(filters);
    const whereClause = filterKeys.length > 0
        ? `WHERE ${filterKeys.map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
        : '';
    const dataQuery = `
    SELECT ${select.join(', ')}
    FROM ${tableName} ${joins}
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${filterKeys.length + 1} OFFSET $${filterKeys.length + 2}
  `;
    const countQuery = `
    SELECT COUNT(*) as total
    FROM ${tableName} ${joins}
    ${whereClause}
  `;
    try {
        const [dataResult, countResult] = await Promise.all([
            (0, exports.executeQuery)(dataQuery, [...filterValues, limit, offset]),
            (0, exports.executeQuery)(countQuery, filterValues)
        ]);
        return {
            data: dataResult.rows,
            count: parseInt(countResult.rows[0]?.total || '0'),
            success: true
        };
    }
    catch (error) {
        console.error('❌ Error obteniendo registros paginados:', error);
        return {
            data: [],
            count: 0,
            success: false,
            message: 'Error al obtener los registros'
        };
    }
};
exports.getRecordsWithPagination = getRecordsWithPagination;
const softDelete = async (tableName, id) => {
    try {
        const query = `
      UPDATE ${tableName}
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
    `;
        const result = await (0, exports.executeQuery)(query, [id]);
        return (result.rowCount || 0) > 0;
    }
    catch (error) {
        console.error('❌ Error realizando soft delete:', error);
        return false;
    }
};
exports.softDelete = softDelete;
const findByLocation = async (tableName, latitude, longitude, radiusKm = 1) => {
    const query = `
    SELECT *, 
           ST_Distance(
             ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')'),
             ST_GeogFromText('POINT($2 $1)')
           ) / 1000 as distance_km
    FROM ${tableName}
    WHERE ST_DWithin(
      ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')'),
      ST_GeogFromText('POINT($2 $1)'),
      $3 * 1000
    )
    AND deleted_at IS NULL
    ORDER BY distance_km ASC
  `;
    return (0, exports.executeQuery)(query, [latitude, longitude, radiusKm]);
};
exports.findByLocation = findByLocation;
const tableExists = async (tableName) => {
    const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `;
    try {
        const result = await (0, exports.executeQuery)(query, [tableName]);
        return result.rows[0]?.exists || false;
    }
    catch (error) {
        console.error('❌ Error verificando existencia de tabla:', error);
        return false;
    }
};
exports.tableExists = tableExists;
const closePool = async () => {
    try {
        if (pool) {
            await pool.end();
            console.log('🔐 Pool de conexiones cerrado correctamente');
        }
    }
    catch (error) {
        console.error('❌ Error cerrando pool de conexiones:', error);
    }
};
exports.closePool = closePool;
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim().replace(/[<>'"]/g, '');
    }
    return input;
};
exports.sanitizeInput = sanitizeInput;
const validateCoordinates = (lat, lng) => {
    return (typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180);
};
exports.validateCoordinates = validateCoordinates;
const getPool = () => pool;
exports.getPool = getPool;
const getDatabaseConfig = () => ({ ...dbConfig });
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database-utils.js.map