"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const production_1 = require("../controllers/production");
const logging_1 = require("../middleware/logging");
const router = (0, express_1.Router)();
const validateRequest = (req, res, next) => {
    next();
};
const auditLog = (action) => {
    return (req, res, next) => {
        if (req.user) {
            (0, logging_1.logMessage)(logging_1.LogLevel.INFO, 'user_action', `Usuario ${req.user.email} realizó acción: ${action}`, {
                userId: req.user.id,
                userRole: req.user.role,
                action,
                endpoint: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        }
        next();
    };
};
router.get('/', auth_1.authenticateToken, auditLog('production.list'), async (req, res, next) => {
    try {
        await production_1.ProductionController.getAllProduction(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.WORKER), auditLog('production.create'), async (req, res, next) => {
    try {
        await production_1.ProductionController.recordProduction(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, auditLog('production.view'), async (req, res, next) => {
    try {
        await production_1.ProductionController.getProductionById(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.WORKER), auditLog('production.update'), async (req, res, next) => {
    try {
        await production_1.ProductionController.updateProduction(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), auditLog('production.delete'), async (req, res, next) => {
    try {
        await production_1.ProductionController.deleteProduction(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/milk', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.WORKER), auditLog('production.milk.create'), async (req, res, next) => {
    try {
        await production_1.ProductionController.recordMilkProduction(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/weight', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN), auditLog('production.weight.create'), async (req, res, next) => {
    try {
        await production_1.ProductionController.recordWeight(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/stats/:bovineId', auth_1.authenticateToken, auditLog('production.stats.bovine'), async (req, res, next) => {
    try {
        await production_1.ProductionController.getBovineProductionStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/:ranchId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), auditLog('production.reports.ranch'), async (req, res, next) => {
    try {
        await production_1.ProductionController.getRanchProductionReport(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/comparison/:ranchId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), auditLog('production.comparison'), async (req, res, next) => {
    try {
        await production_1.ProductionController.getProductivityComparison(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.use((error, req, res, next) => {
    (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'production_route_error', `Error en ruta de producción: ${error.message}`, {
        path: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
        error: error.stack
    });
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'Error interno del servidor',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    });
});
exports.default = router;
//# sourceMappingURL=production.js.map