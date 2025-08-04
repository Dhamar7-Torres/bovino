"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BovinesController = void 0;
const sequelize_1 = require("sequelize");
const Bovine_1 = __importStar(require("../models/Bovine"));
const bovine_1 = require("../services/bovine");
class BovinesController {
    constructor() {
        this.createBovine = async (req, res) => {
            try {
                const bovineData = req.body;
                if (!bovineData.earTag || !bovineData.cattleType || !bovineData.breed || !bovineData.gender) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'EarTag, tipo, raza y género son obligatorios'
                        }
                    });
                    return;
                }
                const existingBovine = await Bovine_1.default.findOne({
                    where: { earTag: bovineData.earTag }
                });
                if (existingBovine) {
                    res.status(409).json({
                        success: false,
                        message: 'El número de arete ya existe',
                        errors: {
                            earTag: 'Ya existe un bovino con este número de arete'
                        }
                    });
                    return;
                }
                if (!bovineData.location || !bovineData.location.latitude || !bovineData.location.longitude) {
                    res.status(400).json({
                        success: false,
                        message: 'Ubicación es obligatoria',
                        errors: {
                            location: 'Las coordenadas de latitud y longitud son obligatorias'
                        }
                    });
                    return;
                }
                const newBovine = await bovine_1.bovineService.createBovine({
                    earTag: bovineData.earTag,
                    name: bovineData.name,
                    cattleType: bovineData.cattleType,
                    breed: bovineData.breed,
                    gender: bovineData.gender,
                    birthDate: bovineData.birthDate,
                    weight: bovineData.weight,
                    location: bovineData.location,
                    healthStatus: bovineData.healthStatus || Bovine_1.HealthStatus.HEALTHY,
                    vaccinationStatus: bovineData.vaccinationStatus || Bovine_1.VaccinationStatus.NONE,
                    physicalMetrics: bovineData.physicalMetrics,
                    reproductiveInfo: bovineData.reproductiveInfo,
                    trackingConfig: bovineData.trackingConfig,
                    farmId: bovineData.farmId,
                    ownerId: bovineData.ownerId,
                    notes: bovineData.notes
                }, req.user?.id || 'system');
                res.status(201).json({
                    success: true,
                    message: 'Bovino creado exitosamente',
                    data: {
                        bovine: newBovine
                    }
                });
            }
            catch (error) {
                console.error('Error al crear bovino:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error inesperado al crear el bovino'
                    }
                });
            }
        };
        this.getBovines = async (req, res) => {
            try {
                const { searchTerm, cattleType, breed, gender, healthStatus, vaccinationStatus, ageMin, ageMax, weightMin, weightMax, locationRadius, centerLatitude, centerLongitude, hasVaccinations, hasIllnesses, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', farmId, ownerId } = req.query;
                const filters = {
                    searchTerm,
                    cattleType,
                    breed,
                    gender,
                    healthStatus,
                    vaccinationStatus,
                    farmId,
                    ownerId,
                    ...(ageMin !== undefined || ageMax !== undefined ? {
                        ageRange: { min: Number(ageMin) || 0, max: Number(ageMax) || 999 }
                    } : {}),
                    ...(weightMin !== undefined || weightMax !== undefined ? {
                        weightRange: { min: Number(weightMin) || 0, max: Number(weightMax) || 9999 }
                    } : {}),
                    ...(locationRadius && centerLatitude && centerLongitude ? {
                        locationRadius: {
                            center: { latitude: Number(centerLatitude), longitude: Number(centerLongitude) },
                            radiusKm: Number(locationRadius)
                        }
                    } : {})
                };
                const result = await bovine_1.bovineService.getBovines(filters, {
                    page: Number(page),
                    limit: Math.min(Number(limit), 100),
                    sortBy,
                    sortOrder
                }, req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Bovinos obtenidos exitosamente',
                    data: result
                });
            }
            catch (error) {
                console.error('Error al obtener bovinos:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener los bovinos'
                    }
                });
            }
        };
        this.getBovineById = async (req, res) => {
            try {
                const { id } = req.params;
                const bovine = await bovine_1.bovineService.getBovineById(id, req.user?.id || 'system');
                if (!bovine) {
                    res.status(404).json({
                        success: false,
                        message: 'Bovino no encontrado',
                        errors: {
                            bovine: 'El bovino especificado no existe o ha sido eliminado'
                        }
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Bovino obtenido exitosamente',
                    data: {
                        bovine: bovine
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener bovino:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error al obtener el bovino'
                    }
                });
            }
        };
        this.updateBovine = async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = { ...req.body, id };
                const updatedBovine = await bovine_1.bovineService.updateBovine(updateData, req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Bovino actualizado exitosamente',
                    data: {
                        bovine: updatedBovine
                    }
                });
            }
            catch (error) {
                console.error('Error al actualizar bovino:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error al actualizar el bovino'
                    }
                });
            }
        };
        this.deleteBovine = async (req, res) => {
            try {
                const { id } = req.params;
                await bovine_1.bovineService.deleteBovine(id, req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Bovino eliminado exitosamente',
                    data: {
                        deleted: true
                    }
                });
            }
            catch (error) {
                console.error('Error al eliminar bovino:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error al eliminar el bovino'
                    }
                });
            }
        };
        this.getBovineStats = async (req, res) => {
            try {
                const { farmId } = req.query;
                const stats = await bovine_1.bovineService.getBovineStatistics(farmId, req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Estadísticas obtenidas exitosamente',
                    data: {
                        stats
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener estadísticas:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener las estadísticas'
                    }
                });
            }
        };
        this.updateBovineLocation = async (req, res) => {
            try {
                const { id } = req.params;
                const { location, source, notes } = req.body;
                if (!location || !location.latitude || !location.longitude) {
                    res.status(400).json({
                        success: false,
                        message: 'Datos de ubicación inválidos',
                        errors: {
                            location: 'Latitud y longitud son requeridas'
                        }
                    });
                    return;
                }
                await bovine_1.bovineService.updateBovineLocation({
                    bovineId: id,
                    location,
                    source: source || 'MANUAL',
                    notes,
                    timestamp: new Date()
                }, req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Ubicación actualizada exitosamente',
                    data: {
                        updated: true
                    }
                });
            }
            catch (error) {
                console.error('Error al actualizar ubicación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error al actualizar la ubicación'
                    }
                });
            }
        };
        this.getBovinesByLocation = async (req, res) => {
            try {
                const { centerLocation, radiusKm } = req.body;
                if (!centerLocation || !centerLocation.latitude || !centerLocation.longitude) {
                    res.status(400).json({
                        success: false,
                        message: 'Ubicación central inválida',
                        errors: {
                            centerLocation: 'Latitud y longitud son requeridas'
                        }
                    });
                    return;
                }
                if (!radiusKm || radiusKm <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Radio de búsqueda inválido',
                        errors: {
                            radiusKm: 'El radio debe ser mayor a 0'
                        }
                    });
                    return;
                }
                const bovines = await bovine_1.bovineService.getBovinesByLocation(centerLocation, Number(radiusKm), req.user?.id || 'system');
                res.status(200).json({
                    success: true,
                    message: 'Búsqueda por ubicación completada',
                    data: {
                        bovines,
                        searchParams: {
                            centerLocation,
                            radiusKm: Number(radiusKm),
                            totalFound: bovines.length
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error en búsqueda por ubicación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: error instanceof Error ? error.message : 'Ocurrió un error en la búsqueda por ubicación'
                    }
                });
            }
        };
        this.bulkOperation = async (req, res) => {
            try {
                const { ids, operation, data } = req.body;
                if (!ids || !Array.isArray(ids) || ids.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'IDs de bovinos requeridos',
                        errors: {
                            ids: 'Debe proporcionar al menos un ID de bovino'
                        }
                    });
                    return;
                }
                let result;
                switch (operation) {
                    case 'update':
                        result = await this.performBulkUpdate(ids, data);
                        break;
                    case 'delete':
                        result = await this.performBulkDelete(ids);
                        break;
                    case 'change_health_status':
                        result = await this.performBulkHealthStatusChange(ids, data.healthStatus);
                        break;
                    default:
                        res.status(400).json({
                            success: false,
                            message: 'Operación no válida',
                            errors: {
                                operation: 'Operación no soportada'
                            }
                        });
                        return;
                }
                res.status(200).json({
                    success: true,
                    message: `Operación ${operation} completada exitosamente`,
                    data: result
                });
            }
            catch (error) {
                console.error('Error en operación en lote:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error en la operación en lote'
                    }
                });
            }
        };
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    formatCountStats(stats) {
        const result = {};
        stats.forEach(stat => {
            const key = Object.keys(stat)[0];
            result[stat[key]] = parseInt(stat.count);
        });
        return result;
    }
    async performBulkUpdate(ids, updateData) {
        const [affectedCount] = await Bovine_1.default.update({
            ...updateData,
            updatedAt: new Date()
        }, {
            where: {
                id: { [sequelize_1.Op.in]: ids },
                isActive: true
            }
        });
        return {
            updatedCount: affectedCount,
            ids: ids
        };
    }
    async performBulkDelete(ids) {
        const affectedCount = await Bovine_1.default.destroy({
            where: {
                id: { [sequelize_1.Op.in]: ids }
            }
        });
        return {
            deletedCount: affectedCount,
            ids: ids
        };
    }
    async performBulkHealthStatusChange(ids, healthStatus) {
        const [affectedCount] = await Bovine_1.default.update({
            healthStatus: healthStatus,
            updatedAt: new Date()
        }, {
            where: {
                id: { [sequelize_1.Op.in]: ids },
                isActive: true
            }
        });
        return {
            updatedCount: affectedCount,
            newHealthStatus: healthStatus,
            ids: ids
        };
    }
}
exports.BovinesController = BovinesController;
//# sourceMappingURL=bovines.js.map