"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyBypass = exports.resetUserRateLimit = exports.getRateLimitStats = exports.veterinaryPriorityLimit = exports.adaptiveRateLimit = exports.createRateLimit = exports.EndpointType = void 0;
const auth_1 = require("./auth");
const logging_1 = require("./logging");
var EndpointType;
(function (EndpointType) {
    EndpointType["AUTH"] = "auth";
    EndpointType["CATTLE_READ"] = "cattle_read";
    EndpointType["CATTLE_WRITE"] = "cattle_write";
    EndpointType["HEALTH"] = "health";
    EndpointType["VACCINATION"] = "vaccination";
    EndpointType["REPORTS"] = "reports";
    EndpointType["MAPS"] = "maps";
    EndpointType["FILES"] = "files";
    EndpointType["BULK_OPERATIONS"] = "bulk";
    EndpointType["EXTERNAL_API"] = "external";
})(EndpointType || (exports.EndpointType = EndpointType = {}));
const RATE_LIMIT_CONFIGS = {
    [EndpointType.AUTH]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.WORKER]: { windowMs: 15 * 60 * 1000, maxRequests: 15 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 15 * 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.MANAGER]: { windowMs: 15 * 60 * 1000, maxRequests: 25 },
        [auth_1.UserRole.ADMIN]: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
        [auth_1.UserRole.OWNER]: { windowMs: 15 * 60 * 1000, maxRequests: 100 }
    },
    [EndpointType.CATTLE_READ]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 30 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 60 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 100 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 150 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 300 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 500 }
    },
    [EndpointType.CATTLE_WRITE]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 0 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 40 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 80 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 150 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 300 }
    },
    [EndpointType.HEALTH]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 15 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 60 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 40 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 80 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 120 }
    },
    [EndpointType.VACCINATION]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 5 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 50 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 30 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 60 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 100 }
    },
    [EndpointType.REPORTS]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 60 * 1000, maxRequests: 200 }
    },
    [EndpointType.MAPS]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 40 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 80 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 100 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 150 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 200 }
    },
    [EndpointType.FILES]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 60 * 1000, maxRequests: 2 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 60 * 1000, maxRequests: 25 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 60 * 1000, maxRequests: 200 }
    },
    [EndpointType.BULK_OPERATIONS]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 60 * 1000, maxRequests: 0 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 60 * 1000, maxRequests: 2 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 60 * 1000, maxRequests: 50 }
    },
    [EndpointType.EXTERNAL_API]: {
        [auth_1.UserRole.VIEWER]: { windowMs: 60 * 1000, maxRequests: 5 },
        [auth_1.UserRole.WORKER]: { windowMs: 60 * 1000, maxRequests: 10 },
        [auth_1.UserRole.VETERINARIAN]: { windowMs: 60 * 1000, maxRequests: 15 },
        [auth_1.UserRole.MANAGER]: { windowMs: 60 * 1000, maxRequests: 25 },
        [auth_1.UserRole.ADMIN]: { windowMs: 60 * 1000, maxRequests: 50 },
        [auth_1.UserRole.OWNER]: { windowMs: 60 * 1000, maxRequests: 100 }
    }
};
const rateLimitStore = new Map();
const IP_RATE_LIMITS = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100
};
class RateLimiter {
    constructor() { }
    static getInstance() {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }
    checkLimit(key, config) {
        const now = Date.now();
        const data = rateLimitStore.get(key);
        if (!data || now > data.resetTime) {
            const newData = {
                count: 1,
                resetTime: now + config.windowMs,
                firstRequest: now
            };
            rateLimitStore.set(key, newData);
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: newData.resetTime,
                totalHits: 1
            };
        }
        data.count++;
        rateLimitStore.set(key, data);
        const allowed = data.count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - data.count);
        return {
            allowed,
            remaining,
            resetTime: data.resetTime,
            totalHits: data.count
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, data] of rateLimitStore.entries()) {
            if (now > data.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }
    getStats() {
        const now = Date.now();
        const activeWindows = Array.from(rateLimitStore.entries())
            .filter(([, data]) => now <= data.resetTime);
        const topConsumers = activeWindows
            .map(([key, data]) => ({ key, hits: data.count, resetTime: data.resetTime }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 10);
        return {
            totalKeys: rateLimitStore.size,
            activeWindows: activeWindows.length,
            topConsumers
        };
    }
    resetKey(key) {
        rateLimitStore.delete(key);
    }
}
const rateLimiter = RateLimiter.getInstance();
setInterval(() => {
    rateLimiter.cleanup();
}, 5 * 60 * 1000);
function generateRateLimitKey(req, endpointType) {
    const userId = req.userId || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    if (userId === 'anonymous') {
        return `ip:${ip}:${endpointType}`;
    }
    return `user:${userId}:${endpointType}`;
}
const createRateLimit = (endpointType) => {
    return (req, res, next) => {
        try {
            let config;
            if (!req.user || !req.userRole) {
                config = IP_RATE_LIMITS;
            }
            else {
                const userRole = req.userRole;
                config = RATE_LIMIT_CONFIGS[endpointType][userRole];
            }
            const key = generateRateLimitKey(req, endpointType);
            const result = rateLimiter.checkLimit(key, config);
            res.set({
                'X-RateLimit-Limit': config.maxRequests.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
                'X-RateLimit-Window': config.windowMs.toString()
            });
            if (!result.allowed) {
                const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
                res.set({
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Hit': result.totalHits.toString()
                });
                (0, logging_1.logMessage)(logging_1.LogLevel.WARN, 'rate_limit_exceeded', `Rate limit excedido para ${req.userRole || 'usuario anónimo'} en endpoint ${endpointType}`, {
                    userId: req.userId,
                    userEmail: req.user?.email,
                    userRole: req.userRole,
                    endpointType,
                    ip: req.ip,
                    path: req.originalUrl,
                    totalHits: result.totalHits,
                    limit: config.maxRequests,
                    resetTime: new Date(result.resetTime).toISOString()
                });
                res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Demasiadas solicitudes. Por favor, intente más tarde.',
                        details: {
                            limit: config.maxRequests,
                            windowMs: config.windowMs,
                            retryAfter: retryAfter,
                            resetTime: new Date(result.resetTime).toISOString()
                        },
                        timestamp: new Date().toISOString(),
                        path: req.originalUrl,
                        method: req.method
                    }
                });
                return;
            }
            if (result.remaining <= config.maxRequests * 0.2) {
                (0, logging_1.logMessage)(logging_1.LogLevel.INFO, 'rate_limit_warning', `Usuario cerca del límite de rate limit: ${result.totalHits}/${config.maxRequests}`, {
                    userId: req.userId,
                    userEmail: req.user?.email,
                    userRole: req.userRole,
                    endpointType,
                    remaining: result.remaining,
                    totalHits: result.totalHits
                });
            }
            next();
        }
        catch (error) {
            (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'rate_limit_error', `Error en rate limiting: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
                userId: req.userId,
                endpointType,
                path: req.originalUrl,
                error: error instanceof Error ? error.stack : error
            });
            next();
        }
    };
};
exports.createRateLimit = createRateLimit;
const adaptiveRateLimit = (endpointType, loadFactor = 1.0) => {
    return (req, res, next) => {
        const baseMiddleware = (0, exports.createRateLimit)(endpointType);
        if (req.user && req.userRole) {
            const userRole = req.userRole;
            const originalConfig = RATE_LIMIT_CONFIGS[endpointType][userRole];
            const adjustedConfig = {
                ...originalConfig,
                maxRequests: Math.floor(originalConfig.maxRequests * loadFactor)
            };
            RATE_LIMIT_CONFIGS[endpointType][userRole] = adjustedConfig;
            baseMiddleware(req, res, (error) => {
                RATE_LIMIT_CONFIGS[endpointType][userRole] = originalConfig;
                next(error);
            });
        }
        else {
            baseMiddleware(req, res, next);
        }
    };
};
exports.adaptiveRateLimit = adaptiveRateLimit;
const veterinaryPriorityLimit = (req, res, next) => {
    if (req.userRole === auth_1.UserRole.VETERINARIAN) {
        const priorityConfig = {
            windowMs: 60 * 1000,
            maxRequests: 200
        };
        const key = `priority:${req.userId}:veterinary`;
        const result = rateLimiter.checkLimit(key, priorityConfig);
        if (!result.allowed) {
            res.status(429).json({
                success: false,
                error: {
                    code: 'VETERINARY_RATE_LIMIT_EXCEEDED',
                    message: 'Límite de operaciones veterinarias excedido',
                    timestamp: new Date().toISOString()
                }
            });
            return;
        }
    }
    next();
};
exports.veterinaryPriorityLimit = veterinaryPriorityLimit;
const getRateLimitStats = () => {
    return rateLimiter.getStats();
};
exports.getRateLimitStats = getRateLimitStats;
const resetUserRateLimit = (userId, endpointType) => {
    if (endpointType) {
        const key = `user:${userId}:${endpointType}`;
        rateLimiter.resetKey(key);
    }
    else {
        Object.values(EndpointType).forEach(type => {
            const key = `user:${userId}:${type}`;
            rateLimiter.resetKey(key);
        });
    }
};
exports.resetUserRateLimit = resetUserRateLimit;
const emergencyBypass = (req, res, next) => {
    const emergencyToken = req.headers['x-emergency-token'];
    const validEmergencyToken = process.env.EMERGENCY_BYPASS_TOKEN;
    if (emergencyToken && validEmergencyToken && emergencyToken === validEmergencyToken) {
        (0, logging_1.logMessage)(logging_1.LogLevel.WARN, 'emergency_bypass_used', 'Rate limit bypass usado en emergencia', {
            userId: req.userId,
            userEmail: req.user?.email,
            path: req.originalUrl,
            ip: req.ip
        });
        res.set('X-Rate-Limit-Bypassed', 'emergency');
        return next();
    }
    next();
};
exports.emergencyBypass = emergencyBypass;
//# sourceMappingURL=rate-limit.js.map