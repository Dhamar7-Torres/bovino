"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const uploadToCloudinary = async (buffer, folder) => {
    return {
        secure_url: `https://mock-url.com/${folder}/${Date.now()}.jpg`
    };
};
class InventoryController {
    static async getAllInventory(req, res) {
        try {
            const { page = '1', limit = '10', search, category, status, sortBy = 'id', sortOrder = 'ASC' } = req.query;
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const offset = (pageNumber - 1) * limitNumber;
            const whereClause = {};
            if (search) {
                whereClause[sequelize_1.Op.or] = [];
            }
            if (category) {
                whereClause.category = category;
            }
            if (status) {
                whereClause.status = status;
            }
            const { count, rows: inventoryItems } = await models_1.Inventory.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Medication,
                        as: 'medication',
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'addedByUser',
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: limitNumber,
                offset: offset,
                distinct: true
            });
            const totalPages = Math.ceil(count / limitNumber);
            res.status(200).json({
                success: true,
                message: 'Inventario obtenido exitosamente',
                data: {
                    items: inventoryItems,
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
            console.error('❌ Error obteniendo inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getInventoryById(req, res) {
        try {
            const { id } = req.params;
            const inventoryItem = await models_1.Inventory.findByPk(id, {
                include: [
                    {
                        model: models_1.Medication,
                        as: 'medication',
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'addedByUser',
                        required: false
                    }
                ]
            });
            if (!inventoryItem) {
                res.status(404).json({
                    success: false,
                    message: 'Item de inventario no encontrado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Item de inventario obtenido exitosamente',
                data: inventoryItem
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo item de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async createInventoryItem(req, res) {
        try {
            const userId = req.user?.id;
            let imageUrl = null;
            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer, 'inventory');
                imageUrl = uploadResult.secure_url;
            }
            const newInventoryItem = await models_1.Inventory.create(req.body);
            const inventoryItemWithRelations = await models_1.Inventory.findByPk(newInventoryItem.id, {
                include: [
                    {
                        model: models_1.Medication,
                        as: 'medication',
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'addedByUser',
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Item de inventario creado exitosamente',
                data: inventoryItemWithRelations
            });
        }
        catch (error) {
            console.error('❌ Error creando item de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async updateInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const inventoryItem = await models_1.Inventory.findByPk(id);
            if (!inventoryItem) {
                res.status(404).json({
                    success: false,
                    message: 'Item de inventario no encontrado'
                });
                return;
            }
            let updateData = { ...req.body };
            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer, 'inventory');
                updateData.imageUrl = uploadResult.secure_url;
            }
            await inventoryItem.update(updateData);
            const updatedItem = await models_1.Inventory.findByPk(id, {
                include: [
                    {
                        model: models_1.Medication,
                        as: 'medication',
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'addedByUser',
                        required: false
                    }
                ]
            });
            res.status(200).json({
                success: true,
                message: 'Item de inventario actualizado exitosamente',
                data: updatedItem
            });
        }
        catch (error) {
            console.error('❌ Error actualizando item de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async deleteInventoryItem(req, res) {
        try {
            const { id } = req.params;
            const inventoryItem = await models_1.Inventory.findByPk(id);
            if (!inventoryItem) {
                res.status(404).json({
                    success: false,
                    message: 'Item de inventario no encontrado'
                });
                return;
            }
            await inventoryItem.destroy();
            res.status(200).json({
                success: true,
                message: 'Item de inventario eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('❌ Error eliminando item de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getInventoryStats(req, res) {
        try {
            const totalItems = await models_1.Inventory.count();
            res.status(200).json({
                success: true,
                message: 'Estadísticas del inventario obtenidas exitosamente',
                data: {
                    overview: {
                        totalItems,
                        totalValue: 0
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas del inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { operation } = req.body;
            if (!['add', 'subtract'].includes(operation)) {
                res.status(400).json({
                    success: false,
                    message: 'Operación debe ser "add" o "subtract"'
                });
                return;
            }
            const inventoryItem = await models_1.Inventory.findByPk(id);
            if (!inventoryItem) {
                res.status(404).json({
                    success: false,
                    message: 'Item de inventario no encontrado'
                });
                return;
            }
            await inventoryItem.update(req.body);
            res.status(200).json({
                success: true,
                message: `Stock ${operation === 'add' ? 'agregado' : 'sustraído'} exitosamente`,
                data: inventoryItem
            });
        }
        catch (error) {
            console.error('❌ Error actualizando stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getAlerts(req, res) {
        try {
            const allItems = await models_1.Inventory.findAll({
                include: [
                    {
                        model: models_1.Medication,
                        as: 'medication',
                        required: false
                    }
                ]
            });
            res.status(200).json({
                success: true,
                message: 'Alertas del inventario obtenidas exitosamente',
                data: {
                    items: allItems
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo alertas del inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
}
exports.InventoryController = InventoryController;
exports.default = InventoryController;
//# sourceMappingURL=inventory.js.map