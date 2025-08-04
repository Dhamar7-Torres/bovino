"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const inventory_1 = __importDefault(require("../controllers/inventory"));
const MedicineController = {
    async getMedicines(params) { return { medicines: [], total: 0 }; },
    async getMedicineById(id, userId) { return null; },
    async createMedicine(data) { return { id: '1', ...data }; },
    async updateMedicine(id, data) { return { id, ...data }; },
    async deleteMedicine(id, userId) { return true; }
};
const StockController = {
    async getStockLevels(params) { return { levels: [] }; },
    async recordMovement(data) { return { id: '1', ...data }; },
    async getMovements(params) { return { movements: [], total: 0 }; }
};
const AlertController = {
    async getInventoryAlerts(params) { return { alerts: [] }; },
    async acknowledgeAlert(id, userId) { return { id, acknowledged: true }; },
    async resolveAlert(id, userId, notes) { return { id, resolved: true, notes }; }
};
const router = (0, express_1.Router)();
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
const isValidISODate = (date) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(date) && !isNaN(Date.parse(date));
};
const isValidNumber = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num))
        return false;
    if (min !== undefined && num < min)
        return false;
    if (max !== undefined && num > max)
        return false;
    return true;
};
const isValidInteger = (value, min, max) => {
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num))
        return false;
    if (min !== undefined && num < min)
        return false;
    if (max !== undefined && num > max)
        return false;
    return true;
};
const isValidLength = (value, min, max) => {
    if (typeof value !== 'string')
        return false;
    if (min !== undefined && value.length < min)
        return false;
    if (max !== undefined && value.length > max)
        return false;
    return true;
};
const isInArray = (value, validValues) => {
    return validValues.includes(value);
};
const validateFields = (validations) => {
    return (req, res, next) => {
        const errors = [];
        for (const validation of validations) {
            const { field, validate, message, required = false } = validation;
            let value;
            if (req.params[field] !== undefined)
                value = req.params[field];
            else if (req.query[field] !== undefined)
                value = req.query[field];
            else if (req.body && req.body[field] !== undefined)
                value = req.body[field];
            if (required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    value,
                    message: `${field} es requerido`
                });
                continue;
            }
            if (!required && (value === undefined || value === null || value === '')) {
                continue;
            }
            if (!validate(value)) {
                errors.push({
                    field,
                    value,
                    message
                });
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors
            });
        }
        next();
    };
};
const auditLog = (action) => {
    return (req, res, next) => {
        console.log(`[AUDIT] ${action} - Usuario: ${req.user?.id} - ${new Date().toISOString()}`);
        next();
    };
};
router.get('/dashboard', auth_1.authenticateToken, validateFields([
    {
        field: 'timeRange',
        validate: (value) => !value || ['7d', '30d', '90d', '1y'].includes(value),
        message: 'Rango de tiempo inválido'
    },
    {
        field: 'ranchId',
        validate: (value) => !value || isValidUUID(value),
        message: 'ID de rancho debe ser un UUID válido'
    }
]), auditLog('inventory.dashboard.view'), async (req, res, next) => {
    try {
        const { timeRange = '30d', ranchId } = req.query;
        const userId = req.user?.id;
        await inventory_1.default.getInventoryStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/summary', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        await inventory_1.default.getInventoryStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/medicines', auth_1.authenticateToken, validateFields([
    {
        field: 'page',
        validate: (value) => !value || isValidInteger(value, 1),
        message: 'La página debe ser un número entero mayor a 0'
    },
    {
        field: 'limit',
        validate: (value) => !value || isValidInteger(value, 1, 100),
        message: 'El límite debe estar entre 1 y 100'
    },
    {
        field: 'search',
        validate: (value) => !value || isValidLength(value, 1, 100),
        message: 'La búsqueda debe tener entre 1 y 100 caracteres'
    },
    {
        field: 'category',
        validate: (value) => !value || isInArray(value, [
            'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
            'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic',
            'antidiarrheal', 'respiratory', 'dermatological', 'reproductive',
            'immunomodulator', 'antiseptic'
        ]),
        message: 'Categoría de medicamento inválida'
    },
    {
        field: 'status',
        validate: (value) => !value || isInArray(value, [
            'in_stock', 'low_stock', 'out_of_stock', 'overstocked',
            'reserved', 'expired', 'damaged', 'quarantined', 'discontinued'
        ]),
        message: 'Estado de inventario inválido'
    }
]), auditLog('inventory.medicines.list'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, category, status, expiringWithin, requiresRefrigeration, location } = req.query;
        const userId = req.user?.id;
        const filters = {
            search: search,
            category: category,
            status: status,
            expiringWithin: expiringWithin ? parseInt(expiringWithin) : undefined,
            requiresRefrigeration: requiresRefrigeration === 'true',
            location: location
        };
        const medicines = await MedicineController.getMedicines({
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId
        });
        res.json({
            success: true,
            data: medicines,
            message: 'Medicamentos obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/medicines/:id', auth_1.authenticateToken, validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID debe ser un UUID válido',
        required: true
    }
]), auditLog('inventory.medicine.view'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const medicine = await MedicineController.getMedicineById(id, userId || '');
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }
        res.json({
            success: true,
            data: medicine
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/medicines', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'name',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'category',
        validate: (value) => value && isInArray(value, [
            'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
            'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic',
            'antidiarrheal', 'respiratory', 'dermatological', 'reproductive',
            'immunomodulator', 'antiseptic'
        ]),
        message: 'Categoría de medicamento inválida',
        required: true
    },
    {
        field: 'manufacturer',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El fabricante debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'activeIngredient',
        validate: (value) => value && isValidLength(value, 2, 200),
        message: 'El principio activo debe tener entre 2 y 200 caracteres',
        required: true
    },
    {
        field: 'concentration',
        validate: (value) => value !== undefined && value !== null && value !== '',
        message: 'La concentración es requerida',
        required: true
    }
]), auditLog('inventory.medicine.create'), async (req, res, next) => {
    try {
        const medicineData = req.body;
        const userId = req.user?.id;
        const newMedicine = await MedicineController.createMedicine({
            ...medicineData,
            createdBy: userId
        });
        res.status(201).json({
            success: true,
            data: newMedicine,
            message: 'Medicamento creado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/medicines/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID debe ser un UUID válido',
        required: true
    },
    {
        field: 'name',
        validate: (value) => !value || isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres'
    },
    {
        field: 'currentStock',
        validate: (value) => !value || isValidNumber(value, 0),
        message: 'El stock actual debe ser un número no negativo'
    }
]), auditLog('inventory.medicine.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.id;
        const updatedMedicine = await MedicineController.updateMedicine(id, {
            ...updateData,
            lastUpdatedBy: userId
        });
        if (!updatedMedicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }
        res.json({
            success: true,
            data: updatedMedicine,
            message: 'Medicamento actualizado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/medicines/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID debe ser un UUID válido',
        required: true
    }
]), auditLog('inventory.medicine.delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const deleted = await MedicineController.deleteMedicine(id, userId || '');
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Medicamento eliminado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/stock/levels', auth_1.authenticateToken, validateFields([
    {
        field: 'category',
        validate: (value) => !value || isInArray(value, [
            'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
            'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic'
        ]),
        message: 'Categoría inválida'
    },
    {
        field: 'status',
        validate: (value) => !value || isInArray(value, [
            'optimal', 'adequate', 'low', 'critical', 'overstock', 'out_of_stock'
        ]),
        message: 'Estado de stock inválido'
    }
]), async (req, res, next) => {
    try {
        const { category, status } = req.query;
        const userId = req.user?.id;
        const stockLevels = await StockController.getStockLevels({
            category: category,
            status: status,
            userId
        });
        res.json({
            success: true,
            data: stockLevels
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/stock/movement', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'medicineId',
        validate: isValidUUID,
        message: 'ID de medicamento debe ser un UUID válido',
        required: true
    },
    {
        field: 'movementType',
        validate: (value) => value && isInArray(value, [
            'entry', 'exit', 'adjustment', 'transfer', 'usage', 'expired', 'damaged'
        ]),
        message: 'Tipo de movimiento inválido',
        required: true
    },
    {
        field: 'quantity',
        validate: (value) => value !== undefined && isValidNumber(value, -999999, 999999),
        message: 'La cantidad debe ser un número válido',
        required: true
    },
    {
        field: 'reason',
        validate: (value) => value && isValidLength(value, 5, 200),
        message: 'La razón debe tener entre 5 y 200 caracteres',
        required: true
    }
]), auditLog('inventory.stock.movement'), async (req, res, next) => {
    try {
        const movementData = req.body;
        const userId = req.user?.id;
        const movement = await StockController.recordMovement({
            ...movementData,
            performedBy: userId,
            timestamp: new Date()
        });
        res.status(201).json({
            success: true,
            data: movement,
            message: 'Movimiento de stock registrado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/stock/movements', auth_1.authenticateToken, validateFields([
    {
        field: 'page',
        validate: (value) => !value || isValidInteger(value, 1),
        message: 'La página debe ser un número entero mayor a 0'
    },
    {
        field: 'limit',
        validate: (value) => !value || isValidInteger(value, 1, 100),
        message: 'El límite debe estar entre 1 y 100'
    }
]), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, medicineId, movementType, dateFrom, dateTo } = req.query;
        const userId = req.user?.id;
        const movements = await StockController.getMovements({
            page: parseInt(page),
            limit: parseInt(limit),
            filters: {
                medicineId: medicineId,
                movementType: movementType,
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined
            },
            userId
        });
        res.json({
            success: true,
            data: movements
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/alerts', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { type, priority, status } = req.query;
        const userId = req.user?.id;
        const alerts = await AlertController.getInventoryAlerts({
            type: type,
            priority: priority,
            status: status,
            userId
        });
        res.json({
            success: true,
            data: alerts
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/alerts/:id/acknowledge', auth_1.authenticateToken, validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID debe ser un UUID válido',
        required: true
    }
]), auditLog('inventory.alert.acknowledge'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const alert = await AlertController.acknowledgeAlert(id, userId || '');
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerta no encontrada'
            });
        }
        res.json({
            success: true,
            data: alert,
            message: 'Alerta reconocida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/alerts/:id/resolve', auth_1.authenticateToken, validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID debe ser un UUID válido',
        required: true
    },
    {
        field: 'resolutionNotes',
        validate: (value) => !value || isValidLength(value, 0, 500),
        message: 'Las notas de resolución no pueden exceder 500 caracteres'
    }
]), auditLog('inventory.alert.resolve'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resolutionNotes } = req.body;
        const userId = req.user?.id;
        const alert = await AlertController.resolveAlert(id, userId || '', resolutionNotes);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerta no encontrada'
            });
        }
        res.json({
            success: true,
            data: alert,
            message: 'Alerta resuelta exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/stock-valuation', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), auditLog('inventory.reports.stock_valuation'), async (req, res, next) => {
    try {
        await inventory_1.default.getInventoryStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/usage-analysis', auth_1.authenticateToken, auditLog('inventory.reports.usage_analysis'), async (req, res, next) => {
    try {
        await inventory_1.default.getInventoryStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/expiry', auth_1.authenticateToken, async (req, res, next) => {
    try {
        await inventory_1.default.getAlerts(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/locations', auth_1.authenticateToken, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: { locations: [] },
            message: 'Ubicaciones de medicamentos obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/usage-map', auth_1.authenticateToken, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: { usageMap: [] },
            message: 'Mapa de uso generado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map