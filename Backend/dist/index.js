"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
exports.server = server;
const PORT = parseInt(process.env.PORT || '8000', 10);
const HOST = process.env.HOST || '0.0.0.0';
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
}));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined', {
        skip: (req, res) => res.statusCode < 400
    }));
}
const cors = require('cors');
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            const response = res;
            response.status(400).json({
                success: false,
                message: 'JSON inválido en el cuerpo de la petición'
            });
            throw new Error('JSON inválido');
        }
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Gestión Ganadera - API REST',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        status: 'active'
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});
app.get('/system-info', async (req, res) => {
    try {
        const systemInfo = {
            status: 'active',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            data: systemInfo
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo información del sistema'
        });
    }
});
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        timestamp: new Date().toISOString()
    });
};
app.use(notFoundHandler);
app.use(error_1.errorHandler);
async function initializeServices() {
    try {
        console.log('🚀 Iniciando Sistema de Gestión Ganadera...');
        console.log('='.repeat(50));
        console.log('📋 Validando configuración básica...');
        if (!process.env.DB_HOST) {
            console.warn('⚠️ DB_HOST no configurado');
        }
        if (!process.env.JWT_ACCESS_SECRET) {
            console.warn('⚠️ JWT_ACCESS_SECRET no configurado');
        }
        console.log('='.repeat(50));
        console.log('✅ Servicios básicos inicializados');
        return true;
    }
    catch (error) {
        console.error('❌ Error crítico durante la inicialización:', error);
        return false;
    }
}
async function startServer() {
    try {
        server.listen(PORT, HOST, () => {
            console.log('');
            console.log('🎉 ¡Servidor iniciado exitosamente!');
            console.log('='.repeat(50));
            console.log(`🌐 Servidor corriendo en: http://${HOST}:${PORT}`);
            console.log(`📚 Documentación API: http://${HOST}:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://${HOST}:${PORT}/api/health`);
            console.log(`📊 Estado del sistema: http://${HOST}:${PORT}/system-info`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
            console.log('='.repeat(50));
            console.log('');
        });
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
            switch (error.code) {
                case 'EACCES':
                    console.error(`❌ ${bind} requiere privilegios elevados`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`❌ ${bind} ya está en uso`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    }
    catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}
async function handleShutdown(signal) {
    console.log(`\n🔄 Señal ${signal} recibida. Iniciando cierre ordenado...`);
    try {
        server.close(() => {
            console.log('🌐 Servidor HTTP cerrado');
        });
        console.log('✅ Cierre ordenado completado');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error durante el cierre ordenado:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    handleShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    console.error('   En la promesa:', promise);
    handleShutdown('UNHANDLED_REJECTION');
});
async function main() {
    try {
        console.clear();
        console.log('🐄 SISTEMA DE GESTIÓN GANADERA - UJAT');
        console.log('   Universidad Juárez Autónoma de Tabasco');
        console.log('   Backend API v1.0.0');
        console.log('');
        const servicesReady = await initializeServices();
        if (!servicesReady) {
            console.error('❌ Error crítico: No se pudieron inicializar los servicios');
            process.exit(1);
        }
        await startServer();
    }
    catch (error) {
        console.error('❌ Error crítico en la inicialización:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map