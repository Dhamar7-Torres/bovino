"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeadersMiddleware = exports.corsLoggingMiddleware = exports.getCorsInfo = exports.addAllowedOrigin = exports.isOriginAllowed = exports.getCorsMiddleware = exports.getCurrentCorsConfig = void 0;
let cors;
try {
    cors = require('cors');
}
catch (error) {
    console.warn('⚠️  Dependencia CORS no instalada aún. Ejecuta: npm install cors @types/cors');
}
const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://192.168.1.1:3000',
    'http://192.168.0.1:3000',
];
const testOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
];
const productionOrigins = [
    process.env.FRONTEND_URL || 'https://cattle-management.com',
    process.env.ADMIN_URL || 'https://admin.cattle-management.com',
    process.env.MOBILE_URL || 'https://mobile.cattle-management.com',
    ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : [])
].filter(Boolean);
const corsConfig = {
    development: {
        origin: developmentOrigins,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS',
            'HEAD'
        ],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'X-Access-Token',
            'X-Key',
            'X-Ranch-ID',
            'X-User-Role',
            'X-Device-ID',
            'X-App-Version',
            'X-Platform',
        ],
        exposedHeaders: [
            'X-Total-Count',
            'X-Page-Count',
            'X-Current-Page',
            'X-Rate-Limit',
            'X-Rate-Remaining',
            'X-Response-Time',
        ],
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    },
    test: {
        origin: testOrigins,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Access-Token',
            'X-Ranch-ID',
            'X-User-Role'
        ],
        exposedHeaders: [
            'X-Total-Count',
            'X-Page-Count',
            'X-Current-Page'
        ],
        credentials: true,
        maxAge: 3600,
        preflightContinue: false,
        optionsSuccessStatus: 200
    },
    production: {
        origin: (origin, callback) => {
            if (!origin || productionOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.warn(`🚫 CORS: Origen no autorizado intentó acceder: ${origin}`);
                callback(new Error('No permitido por política CORS'), false);
            }
        },
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Access-Token',
            'X-Ranch-ID',
            'X-User-Role',
            'X-Device-ID',
            'X-App-Version',
            'X-Platform'
        ],
        exposedHeaders: [
            'X-Total-Count',
            'X-Page-Count',
            'X-Current-Page',
            'X-Rate-Limit',
            'X-Rate-Remaining'
        ],
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    }
};
const getCurrentCorsConfig = () => {
    const environment = process.env.NODE_ENV || 'development';
    return corsConfig[environment];
};
exports.getCurrentCorsConfig = getCurrentCorsConfig;
const getCorsMiddleware = () => {
    if (!cors) {
        return (req, res, next) => {
            console.warn('⚠️  CORS middleware not available - dependencies not installed');
            next();
        };
    }
    const config = (0, exports.getCurrentCorsConfig)();
    return cors(config);
};
exports.getCorsMiddleware = getCorsMiddleware;
const isOriginAllowed = (origin) => {
    const environment = process.env.NODE_ENV || 'development';
    const config = corsConfig[environment];
    if (typeof config.origin === 'boolean') {
        return config.origin;
    }
    if (typeof config.origin === 'string') {
        return config.origin === origin;
    }
    if (Array.isArray(config.origin)) {
        return config.origin.includes(origin);
    }
    return true;
};
exports.isOriginAllowed = isOriginAllowed;
const addAllowedOrigin = (origin) => {
    const environment = process.env.NODE_ENV || 'development';
    if (environment !== 'development') {
        console.warn('🚫 No se pueden agregar orígenes dinámicamente en producción');
        return false;
    }
    const config = corsConfig.development;
    if (Array.isArray(config.origin)) {
        if (!config.origin.includes(origin)) {
            config.origin.push(origin);
            console.log(`✅ Origen agregado a CORS: ${origin}`);
            return true;
        }
    }
    return false;
};
exports.addAllowedOrigin = addAllowedOrigin;
const getCorsInfo = () => {
    const environment = process.env.NODE_ENV || 'development';
    const config = (0, exports.getCurrentCorsConfig)();
    return {
        environment,
        allowedOrigins: Array.isArray(config.origin) ? config.origin : 'Configuración dinámica',
        allowedMethods: config.methods,
        credentialsEnabled: config.credentials,
        maxAge: config.maxAge,
        customHeaders: config.allowedHeaders.filter(header => !['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'].includes(header))
    };
};
exports.getCorsInfo = getCorsInfo;
const corsLoggingMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    const method = req.method;
    if (method === 'OPTIONS') {
        console.log(`🔍 CORS Preflight: ${origin} -> ${method} ${req.path}`);
    }
    else if (origin) {
        console.log(`🌐 CORS Request: ${origin} -> ${method} ${req.path}`);
    }
    next();
};
exports.corsLoggingMiddleware = corsLoggingMiddleware;
const securityHeadersMiddleware = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;");
    }
    next();
};
exports.securityHeadersMiddleware = securityHeadersMiddleware;
exports.default = corsConfig;
//# sourceMappingURL=cors.js.map