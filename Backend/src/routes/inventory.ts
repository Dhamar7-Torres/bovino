import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Op, WhereOptions } from 'sequelize';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateRequest,
  auditLog 
} from '../middleware';
import { 
  InventoryController,
  MedicineController,
  StockController,
  AlertController 
} from '../controllers';

const router = Router();

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===================================================================

// Validar formato de fecha ISO
const validateDateISO = (field: string) => 
  body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} debe ser una fecha válida en formato ISO`);

// Validar números positivos
const validatePositiveNumber = (field: string) =>
  body(field)
    .isFloat({ min: 0 })
    .withMessage(`${field} debe ser un número positivo`);

// Validar UUID
const validateUUID = (field: string) =>
  param(field)
    .isUUID()
    .withMessage(`${field} debe ser un UUID válido`);

// ===================================================================
// RUTAS DEL DASHBOARD DE INVENTARIO
// ===================================================================

/**
 * GET /api/inventory/dashboard
 * Obtiene estadísticas generales del inventario para el dashboard
 */
router.get('/dashboard', 
  authenticateToken,
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'),
  query('ranchId')
    .optional()
    .isUUID()
    .withMessage('ID de rancho debe ser un UUID válido'),
  validateRequest,
  auditLog('inventory.dashboard.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeRange = '30d', ranchId } = req.query;
      const userId = req.user?.id;

      const dashboardData = await InventoryController.getDashboardStats({
        timeRange: timeRange as string,
        ranchId: ranchId as string,
        userId
      });

      res.json({
        success: true,
        data: dashboardData,
        message: 'Estadísticas del inventario obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/summary
 * Resumen ejecutivo del estado del inventario
 */
router.get('/summary',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const summary = await InventoryController.getInventorySummary(userId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE MEDICAMENTOS
// ===================================================================

/**
 * GET /api/inventory/medicines
 * Obtiene lista paginada de medicamentos con filtros
 */
router.get('/medicines',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  query('category')
    .optional()
    .isIn([
      'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
      'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic',
      'antidiarrheal', 'respiratory', 'dermatological', 'reproductive',
      'immunomodulator', 'antiseptic'
    ])
    .withMessage('Categoría de medicamento inválida'),
  query('status')
    .optional()
    .isIn([
      'in_stock', 'low_stock', 'out_of_stock', 'overstocked',
      'reserved', 'expired', 'damaged', 'quarantined', 'discontinued'
    ])
    .withMessage('Estado de inventario inválido'),
  query('expiringWithin')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Los días de vencimiento deben estar entre 1 y 365'),
  query('requiresRefrigeration')
    .optional()
    .isBoolean()
    .withMessage('Refrigeración requerida debe ser verdadero o falso'),
  query('location')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('La ubicación debe tener entre 1 y 50 caracteres'),
  validateRequest,
  auditLog('inventory.medicines.list'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        status,
        expiringWithin,
        requiresRefrigeration,
        location
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        search: search as string,
        category: category as string,
        status: status as string,
        expiringWithin: expiringWithin ? parseInt(expiringWithin as string) : undefined,
        requiresRefrigeration: requiresRefrigeration === 'true',
        location: location as string
      };

      const medicines = await MedicineController.getMedicines({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: medicines,
        message: 'Medicamentos obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/medicines/:id
 * Obtiene detalles completos de un medicamento específico
 */
router.get('/medicines/:id',
  authenticateToken,
  validateUUID('id'),
  validateRequest,
  auditLog('inventory.medicine.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const medicine = await MedicineController.getMedicineById(id, userId);

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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/inventory/medicines
 * Crea un nuevo medicamento en el inventario
 */
router.post('/medicines',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager']),
  [
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('genericName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre genérico debe tener entre 2 y 100 caracteres'),
    body('category')
      .isIn([
        'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
        'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic',
        'antidiarrheal', 'respiratory', 'dermatological', 'reproductive',
        'immunomodulator', 'antiseptic'
      ])
      .withMessage('Categoría de medicamento inválida'),
    body('manufacturer')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('El fabricante debe tener entre 2 y 100 caracteres'),
    body('activeIngredient')
      .notEmpty()
      .isLength({ min: 2, max: 200 })
      .withMessage('El principio activo debe tener entre 2 y 200 caracteres'),
    body('concentration')
      .notEmpty()
      .withMessage('La concentración es requerida'),
    body('pharmaceuticalForm')
      .isIn([
        'injection', 'oral_tablet', 'oral_suspension', 'topical_cream',
        'topical_spray', 'powder', 'capsule', 'implant', 'bolus'
      ])
      .withMessage('Forma farmacéutica inválida'),
    validatePositiveNumber('currentStock'),
    validatePositiveNumber('minStock'),
    validatePositiveNumber('maxStock'),
    validatePositiveNumber('unitCost'),
    body('unit')
      .notEmpty()
      .isIn(['ml', 'mg', 'g', 'kg', 'units', 'doses', 'tablets', 'bottles'])
      .withMessage('Unidad de medida inválida'),
    body('registrationNumber')
      .notEmpty()
      .withMessage('El número de registro es requerido'),
    validateDateISO('expirationDate'),
    body('batchNumber')
      .notEmpty()
      .withMessage('El número de lote es requerido'),
    body('storageConditions')
      .notEmpty()
      .withMessage('Las condiciones de almacenamiento son requeridas'),
    body('requiresRefrigeration')
      .isBoolean()
      .withMessage('Refrigeración requerida debe ser verdadero o falso'),
    body('requiresPrescription')
      .isBoolean()
      .withMessage('Prescripción requerida debe ser verdadero o falso'),
    body('withdrawalPeriod.meat')
      .isInt({ min: 0 })
      .withMessage('El período de retiro para carne debe ser un número entero no negativo'),
    body('withdrawalPeriod.milk')
      .isInt({ min: 0 })
      .withMessage('El período de retiro para leche debe ser un número entero no negativo'),
    body('targetSpecies')
      .isArray({ min: 1 })
      .withMessage('Debe especificar al menos una especie objetivo'),
    body('targetSpecies.*')
      .isIn(['cattle', 'sheep', 'goat', 'pig', 'horse', 'poultry'])
      .withMessage('Especie objetivo inválida'),
    body('location.warehouse')
      .notEmpty()
      .withMessage('El almacén es requerido'),
    body('location.shelf')
      .notEmpty()
      .withMessage('El estante es requerido'),
    body('recommendedDosage.amount')
      .isFloat({ min: 0 })
      .withMessage('La cantidad de dosis debe ser un número positivo'),
    body('recommendedDosage.unit')
      .notEmpty()
      .withMessage('La unidad de dosis es requerida'),
    body('recommendedDosage.frequency')
      .notEmpty()
      .withMessage('La frecuencia de administración es requerida')
  ],
  validateRequest,
  auditLog('inventory.medicine.create'),
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/inventory/medicines/:id
 * Actualiza un medicamento existente
 */
router.put('/medicines/:id',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager']),
  validateUUID('id'),
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('category')
      .optional()
      .isIn([
        'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
        'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic',
        'antidiarrheal', 'respiratory', 'dermatological', 'reproductive',
        'immunomodulator', 'antiseptic'
      ])
      .withMessage('Categoría de medicamento inválida'),
    body('currentStock')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El stock actual debe ser un número no negativo'),
    body('minStock')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El stock mínimo debe ser un número no negativo'),
    body('unitCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El costo unitario debe ser un número no negativo'),
    validateDateISO('expirationDate')
  ],
  validateRequest,
  auditLog('inventory.medicine.update'),
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/inventory/medicines/:id
 * Elimina un medicamento (soft delete)
 */
router.delete('/medicines/:id',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager']),
  validateUUID('id'),
  validateRequest,
  auditLog('inventory.medicine.delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const deleted = await MedicineController.deleteMedicine(id, userId);

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
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE STOCK
// ===================================================================

/**
 * GET /api/inventory/stock/levels
 * Obtiene los niveles de stock con análisis de optimización
 */
router.get('/stock/levels',
  authenticateToken,
  query('category')
    .optional()
    .isIn([
      'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
      'analgesic', 'vitamin', 'mineral', 'hormone', 'anesthetic'
    ])
    .withMessage('Categoría inválida'),
  query('status')
    .optional()
    .isIn(['optimal', 'adequate', 'low', 'critical', 'overstock', 'out_of_stock'])
    .withMessage('Estado de stock inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, status } = req.query;
      const userId = req.user?.id;

      const stockLevels = await StockController.getStockLevels({
        category: category as string,
        status: status as string,
        userId
      });

      res.json({
        success: true,
        data: stockLevels
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/inventory/stock/movement
 * Registra un movimiento de stock (entrada, salida, ajuste)
 */
router.post('/stock/movement',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager', 'inventory_manager']),
  [
    body('medicineId')
      .isUUID()
      .withMessage('ID de medicamento debe ser un UUID válido'),
    body('movementType')
      .isIn(['entry', 'exit', 'adjustment', 'transfer', 'usage', 'expired', 'damaged'])
      .withMessage('Tipo de movimiento inválido'),
    body('quantity')
      .isFloat({ min: -999999, max: 999999 })
      .withMessage('La cantidad debe ser un número válido'),
    body('reason')
      .notEmpty()
      .isLength({ min: 5, max: 200 })
      .withMessage('La razón debe tener entre 5 y 200 caracteres'),
    body('location.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud debe estar entre -90 y 90'),
    body('location.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud debe estar entre -180 y 180'),
    body('referenceDocument')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Documento de referencia debe tener entre 1 y 100 caracteres'),
    body('unitCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Costo unitario debe ser un número positivo'),
    body('batchNumber')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Número de lote debe tener entre 1 y 50 caracteres'),
    body('expirationDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de vencimiento debe ser una fecha válida'),
    body('appliedTo')
      .optional()
      .isArray()
      .withMessage('Aplicado a debe ser un array'),
    body('appliedTo.*.bovineId')
      .optional()
      .isUUID()
      .withMessage('ID de bovino debe ser un UUID válido')
  ],
  validateRequest,
  auditLog('inventory.stock.movement'),
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/stock/movements
 * Obtiene historial de movimientos de stock
 */
router.get('/stock/movements',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('medicineId')
    .optional()
    .isUUID()
    .withMessage('ID de medicamento debe ser un UUID válido'),
  query('movementType')
    .optional()
    .isIn(['entry', 'exit', 'adjustment', 'transfer', 'usage', 'expired', 'damaged'])
    .withMessage('Tipo de movimiento inválido'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        medicineId,
        movementType,
        dateFrom,
        dateTo
      } = req.query;

      const userId = req.user?.id;

      const movements = await StockController.getMovements({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters: {
          medicineId: medicineId as string,
          movementType: movementType as string,
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined
        },
        userId
      });

      res.json({
        success: true,
        data: movements
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE ALERTAS DE INVENTARIO
// ===================================================================

/**
 * GET /api/inventory/alerts
 * Obtiene alertas activas del inventario
 */
router.get('/alerts',
  authenticateToken,
  query('type')
    .optional()
    .isIn([
      'low_stock', 'out_of_stock', 'overstocked', 'expiring_soon',
      'expired', 'negative_stock', 'slow_moving', 'fast_moving',
      'cost_variance', 'quality_issue'
    ])
    .withMessage('Tipo de alerta inválido'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Prioridad de alerta inválida'),
  query('status')
    .optional()
    .isIn(['active', 'acknowledged', 'resolved'])
    .withMessage('Estado de alerta inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, priority, status } = req.query;
      const userId = req.user?.id;

      const alerts = await AlertController.getInventoryAlerts({
        type: type as string,
        priority: priority as string,
        status: status as string,
        userId
      });

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/inventory/alerts/:id/acknowledge
 * Marca una alerta como reconocida
 */
router.put('/alerts/:id/acknowledge',
  authenticateToken,
  validateUUID('id'),
  validateRequest,
  auditLog('inventory.alert.acknowledge'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const alert = await AlertController.acknowledgeAlert(id, userId);

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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/inventory/alerts/:id/resolve
 * Marca una alerta como resuelta
 */
router.put('/alerts/:id/resolve',
  authenticateToken,
  validateUUID('id'),
  body('resolutionNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas de resolución no pueden exceder 500 caracteres'),
  validateRequest,
  auditLog('inventory.alert.resolve'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const userId = req.user?.id;

      const alert = await AlertController.resolveAlert(id, userId, resolutionNotes);

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
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES DE INVENTARIO
// ===================================================================

/**
 * GET /api/inventory/reports/stock-valuation
 * Genera reporte de valorización del inventario
 */
router.get('/reports/stock-valuation',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'accountant']),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida'),
  query('category')
    .optional()
    .isIn([
      'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
      'analgesic', 'vitamin', 'mineral', 'hormone'
    ])
    .withMessage('Categoría inválida'),
  validateRequest,
  auditLog('inventory.reports.stock_valuation'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo, category } = req.query;
      const userId = req.user?.id;

      const report = await InventoryController.generateStockValuationReport({
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        category: category as string,
        userId
      });

      res.json({
        success: true,
        data: report,
        message: 'Reporte de valorización generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/reports/usage-analysis
 * Genera análisis de consumo de medicamentos
 */
router.get('/reports/usage-analysis',
  authenticateToken,
  query('period')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Período inválido'),
  query('medicineId')
    .optional()
    .isUUID()
    .withMessage('ID de medicamento debe ser un UUID válido'),
  validateRequest,
  auditLog('inventory.reports.usage_analysis'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period = 'monthly', medicineId } = req.query;
      const userId = req.user?.id;

      const analysis = await InventoryController.generateUsageAnalysis({
        period: period as string,
        medicineId: medicineId as string,
        userId
      });

      res.json({
        success: true,
        data: analysis,
        message: 'Análisis de consumo generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/reports/expiry
 * Reporte de medicamentos próximos a vencer
 */
router.get('/reports/expiry',
  authenticateToken,
  query('daysAhead')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Los días adelante deben estar entre 1 y 365'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { daysAhead = 30 } = req.query;
      const userId = req.user?.id;

      const expiryReport = await InventoryController.getExpiryReport({
        daysAhead: parseInt(daysAhead as string),
        userId
      });

      res.json({
        success: true,
        data: expiryReport,
        message: 'Reporte de vencimientos generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GEOLOCALIZACIÓN DE INVENTARIO
// ===================================================================

/**
 * GET /api/inventory/locations
 * Obtiene ubicaciones donde se han aplicado medicamentos
 */
router.get('/locations',
  authenticateToken,
  query('medicineId')
    .optional()
    .isUUID()
    .withMessage('ID de medicamento debe ser un UUID válido'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida'),
  query('bounds')
    .optional()
    .custom((value) => {
      if (value) {
        const bounds = value.split(',').map(Number);
        if (bounds.length !== 4 || bounds.some(isNaN)) {
          throw new Error('Los límites deben ser cuatro números separados por comas');
        }
      }
      return true;
    }),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { medicineId, dateFrom, dateTo, bounds } = req.query;
      const userId = req.user?.id;

      let geoBounds;
      if (bounds) {
        const [swLat, swLng, neLat, neLng] = (bounds as string).split(',').map(Number);
        geoBounds = { swLat, swLng, neLat, neLng };
      }

      const locations = await InventoryController.getMedicineLocations({
        medicineId: medicineId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        bounds: geoBounds,
        userId
      });

      res.json({
        success: true,
        data: locations,
        message: 'Ubicaciones de medicamentos obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/usage-map
 * Mapa de calor del uso de medicamentos por ubicación
 */
router.get('/usage-map',
  authenticateToken,
  query('category')
    .optional()
    .isIn([
      'antibiotic', 'vaccine', 'antiparasitic', 'antiinflammatory',
      'analgesic', 'vitamin', 'mineral', 'hormone'
    ])
    .withMessage('Categoría inválida'),
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, timeRange = '30d' } = req.query;
      const userId = req.user?.id;

      const usageMap = await InventoryController.getUsageHeatmap({
        category: category as string,
        timeRange: timeRange as string,
        userId
      });

      res.json({
        success: true,
        data: usageMap,
        message: 'Mapa de uso generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// EXPORTAR ROUTER
// ===================================================================

export default router;