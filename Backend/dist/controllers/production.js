"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionController = void 0;
const models_1 = require("../models");
class ProductionController {
    static async getAllProduction(req, res) {
        try {
            const { page = '1', limit = '20', sortBy = 'id', sortOrder = 'DESC' } = req.query;
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const offset = (pageNumber - 1) * limitNumber;
            const { count, rows: productionRecords } = await models_1.Production.findAndCountAll({
                order: [[sortBy, sortOrder]],
                limit: limitNumber,
                offset: offset,
                distinct: true
            });
            const totalPages = Math.ceil(count / limitNumber);
            res.status(200).json({
                success: true,
                message: 'Registros de producción obtenidos exitosamente',
                data: {
                    records: productionRecords,
                    pagination: {
                        currentPage: pageNumber,
                        totalPages,
                        totalItems: count,
                        itemsPerPage: limitNumber,
                        hasNextPage: pageNumber < totalPages,
                        hasPrevPage: pageNumber > 1
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo registros de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordProduction(req, res) {
        try {
            const userId = req.user?.id;
            if (req.body.bovineId) {
                const bovine = await models_1.Bovine.findByPk(req.body.bovineId);
                if (!bovine) {
                    res.status(404).json({
                        success: false,
                        message: 'Bovino no encontrado'
                    });
                    return;
                }
            }
            const productionData = {
                ...req.body,
                recordedBy: userId
            };
            const newRecord = await models_1.Production.create(productionData);
            res.status(201).json({
                success: true,
                message: 'Producción registrada exitosamente',
                data: newRecord
            });
        }
        catch (error) {
            console.error('❌ Error registrando producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordMilkProduction(req, res) {
        try {
            const userId = req.user?.id;
            if (req.body.bovineId) {
                const bovine = await models_1.Bovine.findByPk(req.body.bovineId);
                if (!bovine) {
                    res.status(404).json({
                        success: false,
                        message: 'Bovino no encontrado'
                    });
                    return;
                }
            }
            const milkRecord = await models_1.Production.create({
                ...req.body,
                recordedBy: userId
            });
            res.status(201).json({
                success: true,
                message: 'Producción de leche registrada exitosamente',
                data: milkRecord
            });
        }
        catch (error) {
            console.error('❌ Error registrando producción de leche:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordWeight(req, res) {
        try {
            const userId = req.user?.id;
            if (req.body.bovineId) {
                const bovine = await models_1.Bovine.findByPk(req.body.bovineId);
                if (!bovine) {
                    res.status(404).json({
                        success: false,
                        message: 'Bovino no encontrado'
                    });
                    return;
                }
                try {
                    await bovine.update(req.body);
                }
                catch (updateError) {
                    console.warn('No se pudo actualizar el bovino:', updateError);
                }
            }
            const weightRecord = await models_1.Production.create({
                ...req.body,
                recordedBy: userId
            });
            res.status(201).json({
                success: true,
                message: 'Peso registrado exitosamente',
                data: {
                    record: weightRecord
                }
            });
        }
        catch (error) {
            console.error('❌ Error registrando peso:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getBovineProductionStats(req, res) {
        try {
            const { bovineId } = req.params;
            const productionRecords = await models_1.Production.findAll({
                order: [['id', 'ASC']]
            });
            if (productionRecords.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'No se encontraron registros de producción'
                });
                return;
            }
            const quantities = productionRecords.map(record => record.quantity || 0);
            const totalProduction = quantities.reduce((sum, qty) => sum + qty, 0);
            const averageProduction = quantities.length > 0 ? totalProduction / quantities.length : 0;
            res.status(200).json({
                success: true,
                message: 'Estadísticas de producción obtenidas exitosamente',
                data: {
                    bovineId,
                    totalProduction,
                    averageProduction: parseFloat(averageProduction.toFixed(2)),
                    totalRecords: productionRecords.length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getRanchProductionReport(req, res) {
        try {
            const { ranchId } = req.params;
            const productionData = await models_1.Production.findAll({
                order: [['id', 'DESC']]
            });
            const totalProduction = productionData.reduce((sum, record) => sum + (record.quantity || 0), 0);
            const averageProduction = productionData.length > 0 ? totalProduction / productionData.length : 0;
            res.status(200).json({
                success: true,
                message: 'Reporte de producción del rancho obtenido exitosamente',
                data: {
                    ranchId,
                    summary: {
                        totalProduction: parseFloat(totalProduction.toFixed(2)),
                        averageProduction: parseFloat(averageProduction.toFixed(2)),
                        totalRecords: productionData.length
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error generando reporte de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getProductivityComparison(req, res) {
        try {
            const { ranchId } = req.params;
            const allRecords = await models_1.Production.findAll();
            res.status(200).json({
                success: true,
                message: 'Comparativa de productividad obtenida exitosamente',
                data: {
                    ranchId,
                    totalRecords: allRecords.length
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo comparativa de productividad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getProductionById(req, res) {
        try {
            const { id } = req.params;
            const production = await models_1.Production.findByPk(id);
            if (!production) {
                res.status(404).json({
                    success: false,
                    message: 'Registro de producción no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Registro de producción obtenido exitosamente',
                data: production
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo registro de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async updateProduction(req, res) {
        try {
            const { id } = req.params;
            const production = await models_1.Production.findByPk(id);
            if (!production) {
                res.status(404).json({
                    success: false,
                    message: 'Registro de producción no encontrado'
                });
                return;
            }
            await production.update(req.body);
            res.status(200).json({
                success: true,
                message: 'Registro de producción actualizado exitosamente',
                data: production
            });
        }
        catch (error) {
            console.error('❌ Error actualizando registro de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async deleteProduction(req, res) {
        try {
            const { id } = req.params;
            const production = await models_1.Production.findByPk(id);
            if (!production) {
                res.status(404).json({
                    success: false,
                    message: 'Registro de producción no encontrado'
                });
                return;
            }
            await production.destroy();
            res.status(200).json({
                success: true,
                message: 'Registro de producción eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('❌ Error eliminando registro de producción:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
}
exports.ProductionController = ProductionController;
exports.default = ProductionController;
//# sourceMappingURL=production.js.map