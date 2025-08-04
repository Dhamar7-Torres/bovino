"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bovines_1 = require("../controllers/bovines");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const auth_2 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const bovinesController = new bovines_1.BovinesController();
const uploadMiddleware = (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.CATTLE_PHOTOS);
router.use(auth_1.authenticateToken);
router.get('/', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.post('/', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('photos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('cattle'), bovinesController.createBovine);
router.get('/:id', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), bovinesController.getBovineById);
router.put('/:id', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('photos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('cattle'), bovinesController.updateBovine);
router.delete('/:id', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), bovinesController.deleteBovine);
router.get('/search', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Search method not implemented' });
});
router.get('/ear-tag/:earTag', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    if (bovinesController.getBovines) {
        req.query.earTag = req.params.earTag;
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/type/:type', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    if (bovinesController.getBovines) {
        req.query.type = req.params.type;
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/breed/:breed', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    if (bovinesController.getBovines) {
        req.query.breed = req.params.breed;
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/gender/:gender', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    if (bovinesController.getBovines) {
        req.query.gender = req.params.gender;
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/health-status/:status', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    if (bovinesController.getBovines) {
        req.query.healthStatus = req.params.status;
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/:id/genealogy', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/:id/offspring', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/:id/siblings', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/:id/parents', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.put('/:id/location', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.updateBovine(req, res);
});
router.get('/nearby', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/by-area', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/stats', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovineStats) {
        return bovinesController.getBovineStats(req, res);
    }
    else if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Statistics method not implemented' });
});
router.get('/stats/by-type', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (req, res) => {
    if (bovinesController.getBovineStats) {
        req.query.groupBy = 'type';
        return bovinesController.getBovineStats(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/stats/by-health', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (req, res) => {
    if (bovinesController.getBovineStats) {
        req.query.groupBy = 'health';
        return bovinesController.getBovineStats(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/stats/age-distribution', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovineStats) {
        req.query.groupBy = 'age';
        return bovinesController.getBovineStats(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.get('/stats/weight-distribution', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovineStats) {
        req.query.groupBy = 'weight';
        return bovinesController.getBovineStats(req, res);
    }
    return res.status(501).json({ error: 'Method not implemented' });
});
router.put('/bulk-update', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.updateBovine(req, res);
});
router.delete('/bulk-delete', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.deleteBovine(req, res);
});
router.put('/bulk-location-update', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.updateBovine(req, res);
});
router.post('/export', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    if (bovinesController.getBovines) {
        return bovinesController.getBovines(req, res);
    }
    return res.status(501).json({ error: 'Export method not implemented' });
});
router.post('/import', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.PRODUCTION_DATA).single('file'), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.PRODUCTION_DATA), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.createBovine(req, res);
});
router.get('/export/:exportId/download', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/import/:importId/status', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.post('/:id/photos', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), uploadMiddleware.multiple('photos', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (req, res) => {
    return bovinesController.updateBovine(req, res);
});
router.delete('/:id/photos/:photoId', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (req, res) => {
    return bovinesController.deleteBovine(req, res);
});
router.get('/:id/photos/:photoId', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/:id/history', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.get('/:id/timeline', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return bovinesController.getBovineById(req, res);
});
router.use((error, req, res, next) => {
    console.error('Bovines Route Error:', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    if (error.name === 'BovineNotFoundError') {
        return res.status(404).json({
            success: false,
            message: 'Bovino no encontrado',
            error: 'BOVINE_NOT_FOUND'
        });
    }
    if (error.name === 'DuplicateEarTagError') {
        return res.status(409).json({
            success: false,
            message: 'Ya existe un bovino con este número de arete',
            error: 'DUPLICATE_EAR_TAG'
        });
    }
    if (error.name === 'InvalidLocationError') {
        return res.status(400).json({
            success: false,
            message: 'Coordenadas GPS inválidas',
            error: 'INVALID_LOCATION'
        });
    }
    if (error.name === 'FileUploadError') {
        return res.status(400).json({
            success: false,
            message: 'Error al subir archivo',
            error: 'FILE_UPLOAD_ERROR',
            details: error.details
        });
    }
    if (error.name === 'BulkOperationError') {
        return res.status(400).json({
            success: false,
            message: 'Error en operación masiva',
            error: 'BULK_OPERATION_ERROR',
            details: error.details
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
    });
});
router.use(upload_1.handleUploadErrors);
exports.default = router;
//# sourceMappingURL=bovines.js.map