"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feeding_1 = require("../controllers/feeding");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const auth_2 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const feedingController = new feeding_1.FeedingController();
const uploadMiddleware = (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.FEED_REPORTS);
router.use(auth_1.authenticateToken);
router.get('/records', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Registros de alimentación obtenidos',
        data: [],
        pagination: { page: 1, limit: 10, total: 0 }
    });
});
router.post('/records', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('feedingPhotos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.FEED_REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Registro de alimentación creado exitosamente',
        data: {
            id: `feeding_${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString(),
            createdBy: req.userId
        }
    });
});
router.get('/records/:id', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return res.json({
        success: true,
        message: 'Registro de alimentación encontrado',
        data: {
            id: req.params.id,
            feedType: 'concentrate',
            quantity: 5.5,
            feedingTime: new Date().toISOString(),
            bovineIds: [],
            location: { name: 'Corral A' },
            createdAt: new Date().toISOString()
        }
    });
});
router.put('/records/:id', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('feedingPhotos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.FEED_REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Registro de alimentación actualizado exitosamente',
        data: {
            id: req.params.id,
            ...req.body,
            updatedAt: new Date().toISOString(),
            updatedBy: req.userId
        }
    });
});
router.delete('/records/:id', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (req, res) => {
    return res.json({
        success: true,
        message: 'Registro de alimentación eliminado exitosamente',
        data: { id: req.params.id, deletedAt: new Date().toISOString() }
    });
});
router.get('/plans', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Planes nutricionales obtenidos',
        data: [
            {
                id: 'plan_1',
                name: 'Plan Básico Ganado Lechero',
                status: 'active',
                targetGroup: 'lactating',
                createdAt: new Date().toISOString()
            }
        ]
    });
});
router.post('/plans', (0, role_1.requireMinimumRole)(auth_2.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Plan nutricional creado exitosamente',
        data: {
            id: `plan_${Date.now()}`,
            ...req.body,
            status: 'draft',
            createdAt: new Date().toISOString(),
            createdBy: req.userId
        }
    });
});
router.get('/plans/:id', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return res.json({
        success: true,
        message: 'Plan nutricional encontrado',
        data: {
            id: req.params.id,
            name: 'Plan Nutricional Ejemplo',
            description: 'Plan para ganado en etapa de lactancia',
            targetGroup: 'lactating',
            status: 'active',
            components: [],
            createdAt: new Date().toISOString()
        }
    });
});
router.put('/plans/:id', (0, role_1.requireMinimumRole)(auth_2.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Plan nutricional actualizado exitosamente',
        data: {
            id: req.params.id,
            ...req.body,
            updatedAt: new Date().toISOString(),
            updatedBy: req.userId
        }
    });
});
router.post('/plans/:id/assign', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Plan nutricional asignado exitosamente',
        data: {
            planId: req.params.id,
            bovineIds: req.body.bovineIds || [],
            assignedAt: new Date().toISOString(),
            assignedBy: req.userId
        }
    });
});
router.put('/plans/:id/activate', (0, role_1.requireMinimumRole)(auth_2.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (req, res) => {
    return res.json({
        success: true,
        message: 'Plan nutricional activado exitosamente',
        data: {
            id: req.params.id,
            status: 'active',
            activatedAt: new Date().toISOString(),
            activatedBy: req.userId
        }
    });
});
router.get('/schedule', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Programa de alimentación obtenido',
        data: {
            date: new Date().toISOString().split('T')[0],
            schedules: [
                {
                    id: 'schedule_1',
                    time: '06:00',
                    feedType: 'hay',
                    quantity: 10,
                    location: 'Corral A'
                },
                {
                    id: 'schedule_2',
                    time: '18:00',
                    feedType: 'concentrate',
                    quantity: 5,
                    location: 'Corral A'
                }
            ]
        }
    });
});
router.post('/schedule', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Programa de alimentación creado exitosamente',
        data: {
            id: `schedule_${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString(),
            createdBy: req.userId
        }
    });
});
router.get('/schedule/today', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return res.json({
        success: true,
        message: 'Programa de alimentación de hoy obtenido',
        data: {
            date: new Date().toISOString().split('T')[0],
            totalFeedings: 2,
            completed: 1,
            pending: 1,
            schedules: [
                {
                    id: 'today_1',
                    time: '06:00',
                    status: 'completed',
                    feedType: 'hay',
                    quantity: 10
                },
                {
                    id: 'today_2',
                    time: '18:00',
                    status: 'pending',
                    feedType: 'concentrate',
                    quantity: 5
                }
            ]
        }
    });
});
router.post('/consumption', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('consumptionPhotos', 3), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.FEED_REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Consumo registrado exitosamente',
        data: {
            id: `consumption_${Date.now()}`,
            feedingRecordId: req.body.feedingRecordId,
            bovineId: req.body.bovineId,
            actualQuantity: req.body.actualQuantity || 0,
            refusalQuantity: req.body.refusalQuantity || 0,
            recordedAt: new Date().toISOString(),
            recordedBy: req.userId
        }
    });
});
router.get('/consumption/:bovineId', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return res.json({
        success: true,
        message: 'Historial de consumo obtenido',
        data: {
            bovineId: req.params.bovineId,
            period: '30d',
            averageConsumption: 12.5,
            totalRecords: 30,
            records: [
                {
                    date: new Date().toISOString().split('T')[0],
                    quantity: 12.0,
                    feedType: 'hay',
                    efficiency: 'good'
                }
            ]
        }
    });
});
router.get('/statistics', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Estadísticas de alimentación obtenidas',
        data: {
            period: req.query.period || '30d',
            totalFeedings: 150,
            averageCost: 45.50,
            efficiency: 85.2,
            topFeedTypes: [
                { name: 'Hay', percentage: 60 },
                { name: 'Concentrate', percentage: 30 },
                { name: 'Silage', percentage: 10 }
            ],
            costBreakdown: {
                hay: 1200.00,
                concentrate: 800.00,
                supplements: 200.00
            }
        }
    });
});
router.get('/inventory', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Inventario de alimentos obtenido',
        data: [
            {
                id: 'feed_1',
                name: 'Hay Premium',
                category: 'forage',
                quantity: 500,
                unit: 'kg',
                expirationDate: '2025-12-31',
                status: 'in_stock',
                location: 'Warehouse A'
            },
            {
                id: 'feed_2',
                name: 'Concentrate 18%',
                category: 'concentrate',
                quantity: 200,
                unit: 'kg',
                expirationDate: '2025-10-15',
                status: 'low_stock',
                location: 'Warehouse B'
            }
        ]
    });
});
router.post('/inventory', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), uploadMiddleware.multiple('feedPhotos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.FEED_REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Alimento agregado al inventario exitosamente',
        data: {
            id: `feed_${Date.now()}`,
            ...req.body,
            addedAt: new Date().toISOString(),
            addedBy: req.userId
        }
    });
});
router.post('/export', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Exportación iniciada exitosamente',
        data: {
            exportId: `export_${Date.now()}`,
            format: req.body.format || 'csv',
            status: 'processing',
            createdAt: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
    });
});
router.get('/export/:exportId/download', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=feeding_data_${req.params.exportId}.csv`);
    return res.send('Date,Feed Type,Quantity,Cost\n2025-07-23,Hay,10kg,25.00\n2025-07-23,Concentrate,5kg,15.00');
});
router.get('/settings', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (req, res) => {
    return res.json({
        success: true,
        message: 'Configuración obtenida',
        data: {
            defaultFeedingTimes: ['06:00', '12:00', '18:00'],
            alertThresholds: {
                lowStock: 50,
                expiringSoon: 7
            },
            automationSettings: {
                autoScheduling: true,
                inventoryTracking: true
            },
            nutritionalTargets: {
                minProtein: 18,
                maxMoisture: 14
            }
        }
    });
});
router.put('/settings', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (req, res) => {
    return res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
            ...req.body,
            updatedAt: new Date().toISOString(),
            updatedBy: req.userId
        }
    });
});
router.use((error, req, res, next) => {
    console.error('Feeding Route Error:', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    if (error.name === 'NutritionalPlanNotFoundError') {
        return res.status(404).json({
            success: false,
            message: 'Plan nutricional no encontrado',
            error: 'NUTRITIONAL_PLAN_NOT_FOUND'
        });
    }
    if (error.name === 'InsufficientFeedInventoryError') {
        return res.status(400).json({
            success: false,
            message: 'Inventario de alimento insuficiente',
            error: 'INSUFFICIENT_FEED_INVENTORY',
            details: error.details
        });
    }
    if (error.name === 'NutritionalImbalanceError') {
        return res.status(400).json({
            success: false,
            message: 'Desbalance nutricional detectado',
            error: 'NUTRITIONAL_IMBALANCE',
            details: error.details
        });
    }
    if (error.name === 'FeedQualityError') {
        return res.status(400).json({
            success: false,
            message: 'Problema de calidad del alimento',
            error: 'FEED_QUALITY_ERROR',
            details: error.details
        });
    }
    if (error.name === 'ScheduleConflictError') {
        return res.status(409).json({
            success: false,
            message: 'Conflicto en programación de alimentación',
            error: 'SCHEDULE_CONFLICT',
            details: error.details
        });
    }
    if (error.name === 'DietFormulationError') {
        return res.status(400).json({
            success: false,
            message: 'Error en formulación de dieta',
            error: 'DIET_FORMULATION_ERROR',
            details: error.details
        });
    }
    if (error.name === 'InventoryUpdateError') {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar inventario',
            error: 'INVENTORY_UPDATE_ERROR',
            details: error.details
        });
    }
    if (error.name === 'ConsumptionTrackingError') {
        return res.status(400).json({
            success: false,
            message: 'Error en seguimiento de consumo',
            error: 'CONSUMPTION_TRACKING_ERROR',
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
//# sourceMappingURL=feeding.js.map