"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const PropertyController = {
    async getPropertyInfo(params) { return { property: {}, documents: [], photos: [], facilities: [] }; },
    async getFacilities(params) { return { facilities: [] }; },
    async createFacility(data) { return { id: '1', ...data }; }
};
const StaffController = {
    async getStaff(params) { return { staff: [], total: 0 }; },
    async createEmployee(data) { return { id: '1', ...data }; },
    async updateEmployee(id, data) { return { id, ...data }; },
    async getEmployeePerformance(params) { return { performance: {}, history: [] }; }
};
const DocumentController = {
    async getRanchDocuments(params) { return { documents: [] }; },
    async uploadDocuments(data) { return { documents: [] }; },
    async deleteDocument(id, userId) { return true; }
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
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
};
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
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
router.get('/overview', auth_1.authenticateToken, validateFields([
    {
        field: 'includeStats',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeStats debe ser verdadero o falso'
    },
    {
        field: 'includeAlerts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeAlerts debe ser verdadero o falso'
    },
    {
        field: 'timeRange',
        validate: (value) => !value || ['7d', '30d', '90d', '1y'].includes(value),
        message: 'Rango de tiempo inválido'
    }
]), auditLog('ranch.overview.view'), async (req, res, next) => {
    try {
        const { includeStats = true, includeAlerts = true, timeRange = '30d' } = req.query;
        const userId = req.user?.id;
        const overview = {
            ranch: {
                id: '1',
                name: 'Rancho Demo',
                totalArea: 100,
                operationType: 'mixed'
            },
            stats: includeStats === 'true' ? {
                totalCattle: 0,
                activeCattle: 0,
                totalProduction: 0
            } : null,
            alerts: includeAlerts === 'true' ? [] : null
        };
        res.json({
            success: true,
            data: overview,
            message: 'Vista general del rancho obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/statistics', auth_1.authenticateToken, validateFields([
    {
        field: 'category',
        validate: (value) => !value || ['general', 'operational', 'financial', 'compliance', 'production'].includes(value),
        message: 'Categoría de estadísticas inválida'
    },
    {
        field: 'period',
        validate: (value) => !value || ['current', 'daily', 'weekly', 'monthly', 'yearly'].includes(value),
        message: 'Período inválido'
    },
    {
        field: 'includeComparisons',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeComparisons debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { category = 'general', period = 'current', includeComparisons = false } = req.query;
        const userId = req.user?.id;
        const statistics = {
            category,
            period,
            data: {},
            comparisons: includeComparisons === 'true' ? {} : null
        };
        res.json({
            success: true,
            data: statistics,
            message: 'Estadísticas del rancho obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const ranch = {
            id: '1',
            name: 'Rancho Demo',
            description: 'Rancho de demostración',
            totalArea: 100,
            owner: {
                id: userId,
                name: req.user?.firstName + ' ' + req.user?.lastName
            }
        };
        res.json({
            success: true,
            data: ranch,
            message: 'Información del rancho obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER), validateFields([
    {
        field: 'name',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'description',
        validate: (value) => !value || isValidLength(value, 0, 1000),
        message: 'La descripción no puede exceder 1000 caracteres'
    },
    {
        field: 'establishedYear',
        validate: (value) => value && isValidInteger(value, 1800, new Date().getFullYear()),
        message: 'Año de establecimiento inválido',
        required: true
    },
    {
        field: 'propertyType',
        validate: (value) => value && ['ranch', 'farm', 'dairy', 'feedlot', 'mixed'].includes(value),
        message: 'Tipo de propiedad inválido',
        required: true
    },
    {
        field: 'address',
        validate: (value) => value && isValidLength(value, 10, 200),
        message: 'La dirección debe tener entre 10 y 200 caracteres',
        required: true
    },
    {
        field: 'city',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'La ciudad debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'state',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El estado debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'country',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El país debe tener entre 2 y 100 caracteres',
        required: true
    }
]), auditLog('ranch.create'), async (req, res, next) => {
    try {
        const ranchData = req.body;
        const userId = req.user?.id;
        const newRanch = {
            id: Date.now().toString(),
            ...ranchData,
            createdBy: userId,
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newRanch,
            message: 'Rancho creado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.OWNER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID del rancho debe ser un UUID válido',
        required: true
    },
    {
        field: 'name',
        validate: (value) => !value || isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres'
    },
    {
        field: 'description',
        validate: (value) => !value || isValidLength(value, 0, 1000),
        message: 'La descripción no puede exceder 1000 caracteres'
    },
    {
        field: 'establishedYear',
        validate: (value) => !value || isValidInteger(value, 1800, new Date().getFullYear()),
        message: 'Año de establecimiento inválido'
    }
]), auditLog('ranch.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.id;
        const updatedRanch = {
            id,
            ...updateData,
            updatedBy: userId,
            updatedAt: new Date()
        };
        res.json({
            success: true,
            data: updatedRanch,
            message: 'Rancho actualizado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/property-info', auth_1.authenticateToken, validateFields([
    {
        field: 'includeDocuments',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeDocuments debe ser verdadero o falso'
    },
    {
        field: 'includePhotos',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includePhotos debe ser verdadero o falso'
    },
    {
        field: 'includeFacilities',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeFacilities debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { includeDocuments = true, includePhotos = true, includeFacilities = true } = req.query;
        const userId = req.user?.id;
        const propertyInfo = await PropertyController.getPropertyInfo({
            includeDocuments: includeDocuments === 'true',
            includePhotos: includePhotos === 'true',
            includeFacilities: includeFacilities === 'true',
            userId
        });
        res.json({
            success: true,
            data: propertyInfo,
            message: 'Información de la propiedad obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/facilities', auth_1.authenticateToken, validateFields([
    {
        field: 'type',
        validate: (value) => !value || [
            'barn', 'milking_parlor', 'feed_storage', 'water_source', 'corral',
            'office', 'housing', 'equipment_storage', 'processing', 'quarantine'
        ].includes(value),
        message: 'Tipo de instalación inválido'
    },
    {
        field: 'status',
        validate: (value) => !value || [
            'active', 'inactive', 'under_construction', 'needs_repair', 'planned'
        ].includes(value),
        message: 'Estado de instalación inválido'
    },
    {
        field: 'includeCoordinates',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCoordinates debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { type, status, includeCoordinates = true } = req.query;
        const userId = req.user?.id;
        const facilities = await PropertyController.getFacilities({
            type: type,
            status: status,
            includeCoordinates: includeCoordinates === 'true',
            userId
        });
        res.json({
            success: true,
            data: facilities,
            message: 'Instalaciones obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/facilities', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'name',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'type',
        validate: (value) => value && [
            'barn', 'milking_parlor', 'feed_storage', 'water_source', 'corral',
            'office', 'housing', 'equipment_storage', 'processing', 'quarantine'
        ].includes(value),
        message: 'Tipo de instalación inválido',
        required: true
    },
    {
        field: 'description',
        validate: (value) => !value || isValidLength(value, 0, 500),
        message: 'La descripción no puede exceder 500 caracteres'
    },
    {
        field: 'capacity',
        validate: (value) => !value || isValidInteger(value, 1),
        message: 'La capacidad debe ser un número entero positivo'
    },
    {
        field: 'area',
        validate: (value) => !value || isValidNumber(value, 0.1, 100000),
        message: 'El área debe estar entre 0.1 y 100,000 m²'
    }
]), auditLog('ranch.facility.create'), async (req, res, next) => {
    try {
        const facilityData = req.body;
        const userId = req.user?.id;
        const newFacility = await PropertyController.createFacility({
            ...facilityData,
            createdBy: userId
        });
        res.status(201).json({
            success: true,
            data: newFacility,
            message: 'Instalación registrada exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/documents', auth_1.authenticateToken, validateFields([
    {
        field: 'type',
        validate: (value) => !value || [
            'title_deed', 'survey', 'permit', 'certificate', 'insurance', 'tax',
            'environmental', 'inspection', 'contract', 'legal', 'financial'
        ].includes(value),
        message: 'Tipo de documento inválido'
    },
    {
        field: 'status',
        validate: (value) => !value || [
            'valid', 'expired', 'pending', 'requires_renewal', 'under_review'
        ].includes(value),
        message: 'Estado de documento inválido'
    },
    {
        field: 'expiringWithin',
        validate: (value) => !value || isValidInteger(value, 1, 365),
        message: 'Días de vencimiento debe estar entre 1 y 365'
    }
]), async (req, res, next) => {
    try {
        const { type, status, expiringWithin } = req.query;
        const userId = req.user?.id;
        const documents = await DocumentController.getRanchDocuments({
            type: type,
            status: status,
            expiringWithin: expiringWithin ? parseInt(expiringWithin) : undefined,
            userId
        });
        res.json({
            success: true,
            data: documents,
            message: 'Documentos obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/documents/upload', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.OWNER), validateFields([
    {
        field: 'type',
        validate: (value) => value && [
            'title_deed', 'survey', 'permit', 'certificate', 'insurance', 'tax',
            'environmental', 'inspection', 'contract', 'legal', 'financial'
        ].includes(value),
        message: 'Tipo de documento inválido',
        required: true
    },
    {
        field: 'name',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'El nombre debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'description',
        validate: (value) => !value || isValidLength(value, 0, 500),
        message: 'La descripción no puede exceder 500 caracteres'
    },
    {
        field: 'expirationDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de vencimiento debe ser válida'
    },
    {
        field: 'issuer',
        validate: (value) => !value || isValidLength(value, 2, 100),
        message: 'El emisor debe tener entre 2 y 100 caracteres'
    },
    {
        field: 'documentNumber',
        validate: (value) => !value || isValidLength(value, 1, 50),
        message: 'Número de documento debe tener entre 1 y 50 caracteres'
    }
]), auditLog('ranch.document.upload'), async (req, res, next) => {
    try {
        const documentData = req.body;
        const userId = req.user?.id;
        const uploadedDocuments = await DocumentController.uploadDocuments({
            ...documentData,
            files: [],
            uploadedBy: userId
        });
        res.status(201).json({
            success: true,
            data: uploadedDocuments,
            message: 'Documentos subidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/documents/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.OWNER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID del documento debe ser un UUID válido',
        required: true
    }
]), auditLog('ranch.document.delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const deleted = await DocumentController.deleteDocument(id, userId || '');
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Documento eliminado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/staff', auth_1.authenticateToken, validateFields([
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
        field: 'department',
        validate: (value) => !value || [
            'administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'
        ].includes(value),
        message: 'Departamento inválido'
    },
    {
        field: 'position',
        validate: (value) => !value || isValidLength(value, 1, 100),
        message: 'Posición debe tener entre 1 y 100 caracteres'
    },
    {
        field: 'status',
        validate: (value) => !value || ['active', 'on_leave', 'suspended', 'terminated'].includes(value),
        message: 'Estado del empleado inválido'
    },
    {
        field: 'search',
        validate: (value) => !value || isValidLength(value, 1, 100),
        message: 'Búsqueda debe tener entre 1 y 100 caracteres'
    }
]), auditLog('ranch.staff.list'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, department, position, status, search } = req.query;
        const userId = req.user?.id;
        const filters = {
            department: department,
            position: position,
            status: status,
            search: search
        };
        const staff = await StaffController.getStaff({
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId
        });
        res.json({
            success: true,
            data: staff,
            message: 'Personal obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/staff', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'firstName',
        validate: (value) => value && isValidLength(value, 2, 50),
        message: 'El nombre debe tener entre 2 y 50 caracteres',
        required: true
    },
    {
        field: 'lastName',
        validate: (value) => value && isValidLength(value, 2, 50),
        message: 'El apellido debe tener entre 2 y 50 caracteres',
        required: true
    },
    {
        field: 'idNumber',
        validate: (value) => value && isValidLength(value, 5, 20),
        message: 'Número de identificación debe tener entre 5 y 20 caracteres',
        required: true
    },
    {
        field: 'birthDate',
        validate: (value) => value && isValidISODate(value),
        message: 'Fecha de nacimiento debe ser válida',
        required: true
    },
    {
        field: 'gender',
        validate: (value) => value && ['male', 'female', 'other'].includes(value),
        message: 'Género inválido',
        required: true
    },
    {
        field: 'email',
        validate: (value) => !value || isValidEmail(value),
        message: 'Email debe ser válido'
    },
    {
        field: 'phone',
        validate: (value) => value && isValidPhone(value),
        message: 'Teléfono debe ser válido',
        required: true
    },
    {
        field: 'position',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'Posición debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'department',
        validate: (value) => value && [
            'administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'
        ].includes(value),
        message: 'Departamento inválido',
        required: true
    },
    {
        field: 'hireDate',
        validate: (value) => value && isValidISODate(value),
        message: 'Fecha de contratación debe ser válida',
        required: true
    }
]), auditLog('ranch.staff.create'), async (req, res, next) => {
    try {
        const staffData = req.body;
        const userId = req.user?.id;
        const newEmployee = await StaffController.createEmployee({
            ...staffData,
            createdBy: userId
        });
        res.status(201).json({
            success: true,
            data: newEmployee,
            message: 'Empleado registrado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/staff/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID del empleado debe ser un UUID válido',
        required: true
    },
    {
        field: 'firstName',
        validate: (value) => !value || isValidLength(value, 2, 50),
        message: 'El nombre debe tener entre 2 y 50 caracteres'
    },
    {
        field: 'lastName',
        validate: (value) => !value || isValidLength(value, 2, 50),
        message: 'El apellido debe tener entre 2 y 50 caracteres'
    },
    {
        field: 'email',
        validate: (value) => !value || isValidEmail(value),
        message: 'Email debe ser válido'
    },
    {
        field: 'phone',
        validate: (value) => !value || isValidPhone(value),
        message: 'Teléfono debe ser válido'
    },
    {
        field: 'position',
        validate: (value) => !value || isValidLength(value, 2, 100),
        message: 'Posición debe tener entre 2 y 100 caracteres'
    },
    {
        field: 'department',
        validate: (value) => !value || [
            'administration', 'livestock', 'veterinary', 'maintenance', 'security', 'production', 'nutrition'
        ].includes(value),
        message: 'Departamento inválido'
    },
    {
        field: 'status',
        validate: (value) => !value || ['active', 'on_leave', 'suspended', 'terminated'].includes(value),
        message: 'Estado del empleado inválido'
    },
    {
        field: 'salary',
        validate: (value) => !value || isValidNumber(value, 0),
        message: 'Salario debe ser un número positivo'
    }
]), auditLog('ranch.staff.update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.id;
        const updatedEmployee = await StaffController.updateEmployee(id, {
            ...updateData,
            updatedBy: userId
        });
        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }
        res.json({
            success: true,
            data: updatedEmployee,
            message: 'Empleado actualizado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/staff/:id/performance', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'id',
        validate: isValidUUID,
        message: 'ID del empleado debe ser un UUID válido',
        required: true
    },
    {
        field: 'period',
        validate: (value) => !value || ['current_month', 'last_month', 'quarter', 'year', 'all_time'].includes(value),
        message: 'Período inválido'
    },
    {
        field: 'includeHistory',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeHistory debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { period = 'current_month', includeHistory = false } = req.query;
        const userId = req.user?.id;
        const performance = await StaffController.getEmployeePerformance({
            employeeId: id,
            period: period,
            includeHistory: includeHistory === 'true',
            userId
        });
        res.json({
            success: true,
            data: performance,
            message: 'Evaluación de rendimiento obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/compliance', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'includeExpiring',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeExpiring debe ser verdadero o falso'
    },
    {
        field: 'expiryThreshold',
        validate: (value) => !value || isValidInteger(value, 1, 365),
        message: 'Umbral de vencimiento debe estar entre 1 y 365 días'
    },
    {
        field: 'format',
        validate: (value) => !value || ['json', 'pdf', 'excel'].includes(value),
        message: 'Formato inválido'
    }
]), auditLog('ranch.reports.compliance'), async (req, res, next) => {
    try {
        const { includeExpiring = true, expiryThreshold = 30, format = 'json' } = req.query;
        const userId = req.user?.id;
        const complianceReport = {
            compliance: {
                total: 0,
                compliant: 0,
                expiring: 0,
                expired: 0
            },
            details: []
        };
        if (format === 'json') {
            res.json({
                success: true,
                data: complianceReport,
                message: 'Reporte de cumplimiento generado exitosamente'
            });
        }
        else {
            const contentTypes = {
                pdf: 'application/pdf',
                excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
            res.setHeader('Content-Type', contentTypes[format]);
            res.setHeader('Content-Disposition', `attachment; filename="compliance_report.${format}"`);
            res.send(Buffer.from('Mock report content'));
        }
    }
    catch (error) {
        next(error);
    }
});
router.get('/reports/operational', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'includeStaffMetrics',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeStaffMetrics debe ser verdadero o falso'
    },
    {
        field: 'includeFacilityStatus',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeFacilityStatus debe ser verdadero o falso'
    }
]), auditLog('ranch.reports.operational'), async (req, res, next) => {
    try {
        const { startDate, endDate, includeStaffMetrics = true, includeFacilityStatus = true } = req.query;
        const userId = req.user?.id;
        const operationalReport = {
            period: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            },
            metrics: {
                staff: includeStaffMetrics === 'true' ? {} : null,
                facilities: includeFacilityStatus === 'true' ? {} : null
            }
        };
        res.json({
            success: true,
            data: operationalReport,
            message: 'Reporte operacional generado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=ranch.js.map