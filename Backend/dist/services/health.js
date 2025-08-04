"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
const sequelize_1 = require("sequelize");
const healthLogger = {
    info: (message) => console.log(`INFO: ${message}`),
    error: (message, error) => console.error(`ERROR: ${message}`, error),
    warn: (message) => console.warn(`WARN: ${message}`)
};
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["SICK"] = "sick";
    HealthStatus["RECOVERING"] = "recovering";
    HealthStatus["QUARANTINE"] = "quarantine";
    HealthStatus["DECEASED"] = "deceased";
    HealthStatus["CRITICAL"] = "critical";
})(HealthStatus || (HealthStatus = {}));
var VaccinationType;
(function (VaccinationType) {
    VaccinationType["CORE"] = "core";
    VaccinationType["NON_CORE"] = "non_core";
    VaccinationType["EMERGENCY"] = "emergency";
    VaccinationType["BOOSTER"] = "booster";
})(VaccinationType || (VaccinationType = {}));
var TreatmentType;
(function (TreatmentType) {
    TreatmentType["PREVENTIVE"] = "preventive";
    TreatmentType["CURATIVE"] = "curative";
    TreatmentType["SUPPORTIVE"] = "supportive";
    TreatmentType["PALLIATIVE"] = "palliative";
    TreatmentType["SURGICAL"] = "surgical";
})(TreatmentType || (TreatmentType = {}));
var MedicationType;
(function (MedicationType) {
    MedicationType["ANTIBIOTIC"] = "antibiotic";
    MedicationType["VACCINE"] = "vaccine";
    MedicationType["VITAMIN"] = "vitamin";
    MedicationType["HORMONE"] = "hormone";
    MedicationType["ANTIPARASITIC"] = "antiparasitic";
    MedicationType["ANALGESIC"] = "analgesic";
    MedicationType["ANTI_INFLAMMATORY"] = "anti_inflammatory";
    MedicationType["OTHER"] = "other";
})(MedicationType || (MedicationType = {}));
var AdministrationRoute;
(function (AdministrationRoute) {
    AdministrationRoute["ORAL"] = "oral";
    AdministrationRoute["INTRAMUSCULAR"] = "intramuscular";
    AdministrationRoute["SUBCUTANEOUS"] = "subcutaneous";
    AdministrationRoute["INTRAVENOUS"] = "intravenous";
    AdministrationRoute["TOPICAL"] = "topical";
    AdministrationRoute["INTRAUTERINE"] = "intrauterine";
    AdministrationRoute["INTRAMAMMARY"] = "intramammary";
    AdministrationRoute["INHALATION"] = "inhalation";
})(AdministrationRoute || (AdministrationRoute = {}));
var DiseaseCategory;
(function (DiseaseCategory) {
    DiseaseCategory["INFECTIOUS"] = "infectious";
    DiseaseCategory["PARASITIC"] = "parasitic";
    DiseaseCategory["METABOLIC"] = "metabolic";
    DiseaseCategory["REPRODUCTIVE"] = "reproductive";
    DiseaseCategory["RESPIRATORY"] = "respiratory";
    DiseaseCategory["DIGESTIVE"] = "digestive";
    DiseaseCategory["MUSCULOSKELETAL"] = "musculoskeletal";
    DiseaseCategory["DERMATOLOGICAL"] = "dermatological";
    DiseaseCategory["NEUROLOGICAL"] = "neurological";
    DiseaseCategory["CARDIOVASCULAR"] = "cardiovascular";
})(DiseaseCategory || (DiseaseCategory = {}));
var DiseaseSeverity;
(function (DiseaseSeverity) {
    DiseaseSeverity["MILD"] = "mild";
    DiseaseSeverity["MODERATE"] = "moderate";
    DiseaseSeverity["SEVERE"] = "severe";
    DiseaseSeverity["CRITICAL"] = "critical";
})(DiseaseSeverity || (DiseaseSeverity = {}));
var TreatmentStatus;
(function (TreatmentStatus) {
    TreatmentStatus["PLANNED"] = "planned";
    TreatmentStatus["ACTIVE"] = "active";
    TreatmentStatus["COMPLETED"] = "completed";
    TreatmentStatus["SUSPENDED"] = "suspended";
    TreatmentStatus["CANCELLED"] = "cancelled";
})(TreatmentStatus || (TreatmentStatus = {}));
var VaccinationStatus;
(function (VaccinationStatus) {
    VaccinationStatus["SCHEDULED"] = "scheduled";
    VaccinationStatus["COMPLETED"] = "completed";
    VaccinationStatus["OVERDUE"] = "overdue";
    VaccinationStatus["CANCELLED"] = "cancelled";
    VaccinationStatus["RESCHEDULED"] = "rescheduled";
})(VaccinationStatus || (VaccinationStatus = {}));
const HealthModel = {
    create: async (data) => data,
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1],
    count: async (options) => 0
};
const VaccinationRecordModel = {
    create: async (data) => data,
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1],
    count: async (options) => 0
};
const TreatmentPlanModel = {
    create: async (data) => data,
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1],
    count: async (options) => 0
};
const DiseaseRecordModel = {
    create: async (data) => data,
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1],
    count: async (options) => 0
};
const notificationService = {
    sendHealthAlert: async (alert) => {
        console.log(`Enviando alerta de salud: ${alert.message}`);
    },
    sendVaccinationReminder: async (bovineId, vaccineName, dueDate) => {
        console.log(`Recordatorio de vacunación: ${vaccineName} para bovino ${bovineId}`);
    }
};
const emailService = {
    sendVaccinationReminder: async (email, data) => {
        console.log(`Enviando recordatorio de vacunación por email a ${email}`);
    },
    sendHealthAlert: async (email, data) => {
        console.log(`Enviando alerta de salud por email a ${email}`);
    }
};
const geolocationService = {
    validateCoordinates: (location) => {
        return location.latitude >= -90 && location.latitude <= 90 &&
            location.longitude >= -180 && location.longitude <= 180;
    },
    reverseGeocode: async (location) => {
        return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
};
class HealthService {
    async createMedicalRecord(medicalData, userId) {
        try {
            if (medicalData.location && !geolocationService.validateCoordinates(medicalData.location)) {
                throw new Error('Coordenadas de ubicación inválidas');
            }
            const medicalRecord = {
                ...medicalData,
                id: this.generateHealthId(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await HealthModel.create(medicalRecord);
            if (medicalData.medications && medicalData.medications.length > 0) {
                for (const medication of medicalData.medications) {
                    await this.recordAppliedMedication({
                        ...medication,
                        healthRecordId: medicalRecord.id
                    });
                }
            }
            await this.createHealthAlertsFromRecord(medicalRecord);
            await this.sendHealthNotifications(medicalRecord, userId);
            healthLogger.info(`Registro médico creado para bovino ${medicalData.bovineId}`);
            return medicalRecord;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error creando registro médico:', errorMessage);
            throw new Error(`Error creando registro médico: ${errorMessage}`);
        }
    }
    async recordVaccination(vaccinationData, userId) {
        try {
            if (!geolocationService.validateCoordinates(vaccinationData.location)) {
                throw new Error('Coordenadas de ubicación inválidas');
            }
            const existingVaccination = await this.checkDuplicateVaccination(vaccinationData.bovineId, vaccinationData.vaccineId, vaccinationData.administrationDate);
            if (existingVaccination) {
                throw new Error(`Ya existe una vacunación reciente de ${vaccinationData.vaccineName} para este bovino`);
            }
            const nextDueDate = this.calculateNextVaccinationDate(vaccinationData.vaccineId, vaccinationData.administrationDate);
            const vaccinationRecord = {
                ...vaccinationData,
                id: this.generateVaccinationId(),
                nextDueDate,
                createdAt: new Date()
            };
            await VaccinationRecordModel.create(vaccinationRecord);
            if (nextDueDate) {
                await this.scheduleNextVaccination(vaccinationRecord);
            }
            await this.updateVaccineInventory(vaccinationData.vaccineId, 1);
            await this.sendVaccinationConfirmation(vaccinationRecord, userId);
            healthLogger.info(`Vacunación registrada: ${vaccinationData.vaccineName} para bovino ${vaccinationData.bovineId}`);
            return vaccinationRecord;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error registrando vacunación:', errorMessage);
            throw new Error(`Error registrando vacunación: ${errorMessage}`);
        }
    }
    async createTreatmentPlan(treatmentData, userId) {
        try {
            for (const medication of treatmentData.medications) {
                await this.validateMedicationAvailability(medication.medicationId, medication.dosage);
            }
            const totalCost = treatmentData.medications.reduce((sum, med) => sum + med.cost, 0);
            const treatmentPlan = {
                ...treatmentData,
                id: this.generateTreatmentId(),
                totalCost,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await TreatmentPlanModel.create(treatmentPlan);
            for (const medication of treatmentData.medications) {
                await this.reserveMedicationInventory(medication.medicationId, medication.dosage);
            }
            await this.createTreatmentAlerts(treatmentPlan);
            healthLogger.info(`Plan de tratamiento creado para bovino ${treatmentData.bovineId}`);
            return treatmentPlan;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error creando plan de tratamiento:', errorMessage);
            throw new Error(`Error creando plan de tratamiento: ${errorMessage}`);
        }
    }
    async recordDisease(diseaseData, userId) {
        try {
            const diseaseRecord = {
                ...diseaseData,
                id: this.generateDiseaseId(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await DiseaseRecordModel.create(diseaseRecord);
            if (diseaseData.quarantineRequired) {
                await this.initiateQuarantine(diseaseData.bovineId, diseaseData.quarantineEndDate);
            }
            if (diseaseData.isContagious) {
                await this.handleContagiousDisease(diseaseRecord);
            }
            if (diseaseData.isReportable) {
                await this.reportNotifiableDisease(diseaseRecord);
            }
            if (diseaseData.severity === DiseaseSeverity.CRITICAL) {
                await this.createCriticalHealthAlert(diseaseRecord);
            }
            healthLogger.info(`Enfermedad registrada: ${diseaseData.diseaseName} para bovino ${diseaseData.bovineId}`);
            return diseaseRecord;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error registrando enfermedad:', errorMessage);
            throw new Error(`Error registrando enfermedad: ${errorMessage}`);
        }
    }
    async getMedicalHistory(bovineId, filters = {}) {
        try {
            const whereConditions = { bovineId };
            if (filters.startDate || filters.endDate) {
                const dateFilter = {};
                if (filters.startDate)
                    dateFilter[sequelize_1.Op.gte] = filters.startDate;
                if (filters.endDate)
                    dateFilter[sequelize_1.Op.lte] = filters.endDate;
                whereConditions.consultationDate = dateFilter;
            }
            const medicalRecords = await HealthModel.findAll({
                where: whereConditions,
                order: [['consultationDate', 'DESC']]
            });
            let vaccinations = [];
            let treatments = [];
            let diseases = [];
            if (filters.includeVaccinations) {
                const vaccinationWhere = { bovineId };
                if (filters.startDate || filters.endDate) {
                    const dateFilter = {};
                    if (filters.startDate)
                        dateFilter[sequelize_1.Op.gte] = filters.startDate;
                    if (filters.endDate)
                        dateFilter[sequelize_1.Op.lte] = filters.endDate;
                    vaccinationWhere.administrationDate = dateFilter;
                }
                vaccinations = await VaccinationRecordModel.findAll({
                    where: vaccinationWhere,
                    order: [['administrationDate', 'DESC']]
                });
            }
            if (filters.includeTreatments) {
                const treatmentWhere = { bovineId };
                if (filters.startDate || filters.endDate) {
                    const dateFilter = {};
                    if (filters.startDate)
                        dateFilter[sequelize_1.Op.gte] = filters.startDate;
                    if (filters.endDate)
                        dateFilter[sequelize_1.Op.lte] = filters.endDate;
                    treatmentWhere.startDate = dateFilter;
                }
                treatments = await TreatmentPlanModel.findAll({
                    where: treatmentWhere,
                    order: [['startDate', 'DESC']]
                });
            }
            if (filters.includeDiseases) {
                const diseaseWhere = { bovineId };
                if (filters.startDate || filters.endDate) {
                    const dateFilter = {};
                    if (filters.startDate)
                        dateFilter[sequelize_1.Op.gte] = filters.startDate;
                    if (filters.endDate)
                        dateFilter[sequelize_1.Op.lte] = filters.endDate;
                    diseaseWhere.dateDetected = dateFilter;
                }
                diseases = await DiseaseRecordModel.findAll({
                    where: diseaseWhere,
                    order: [['dateDetected', 'DESC']]
                });
            }
            return {
                medicalRecords,
                vaccinations,
                treatments,
                diseases
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error(`Error obteniendo historial médico para bovino ${bovineId}:`, errorMessage);
            throw new Error(`Error obteniendo historial médico: ${errorMessage}`);
        }
    }
    async getVaccinationSchedule(ranchId, days = 30) {
        try {
            const startDate = new Date();
            const endDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
            const scheduleItems = [
                {
                    vaccineId: 'vacc_001',
                    vaccineName: 'Vacuna Triple Bovina',
                    type: VaccinationType.CORE,
                    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    priority: 'high',
                    isRecurring: true,
                    intervalDays: 365,
                    status: VaccinationStatus.SCHEDULED,
                    cost: 85.00
                },
                {
                    vaccineId: 'vacc_002',
                    vaccineName: 'Vacuna Brucelosis',
                    type: VaccinationType.CORE,
                    scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    priority: 'urgent',
                    isRecurring: false,
                    status: VaccinationStatus.OVERDUE,
                    cost: 120.00
                }
            ];
            const filteredSchedule = scheduleItems.filter(item => item.scheduledDate >= startDate && item.scheduledDate <= endDate);
            filteredSchedule.sort((a, b) => {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0)
                    return priorityDiff;
                return a.scheduledDate.getTime() - b.scheduledDate.getTime();
            });
            return filteredSchedule;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error obteniendo programación de vacunaciones:', errorMessage);
            throw new Error(`Error obteniendo programación: ${errorMessage}`);
        }
    }
    async calculateHealthMetrics(bovineId, period) {
        try {
            const whereConditions = {
                bovineId,
                consultationDate: { [sequelize_1.Op.between]: [period.start, period.end] }
            };
            const consultations = await HealthModel.count({ where: whereConditions });
            const vaccinationWhere = {
                bovineId,
                administrationDate: { [sequelize_1.Op.between]: [period.start, period.end] }
            };
            const vaccinations = await VaccinationRecordModel.count({ where: vaccinationWhere });
            const treatmentWhere = {
                bovineId,
                startDate: { [sequelize_1.Op.between]: [period.start, period.end] }
            };
            const treatments = await TreatmentPlanModel.count({ where: treatmentWhere });
            const diseaseWhere = {
                bovineId,
                dateDetected: { [sequelize_1.Op.between]: [period.start, period.end] },
                status: { [sequelize_1.Op.in]: ['suspected', 'confirmed', 'treated'] }
            };
            const activeDiseases = await DiseaseRecordModel.count({ where: diseaseWhere });
            const totalCost = 2500.00;
            let healthScore = 100;
            if (activeDiseases > 0)
                healthScore -= (activeDiseases * 20);
            if (consultations > 5)
                healthScore -= 10;
            healthScore = Math.max(0, Math.min(100, healthScore));
            const riskFactors = [];
            if (activeDiseases > 0)
                riskFactors.push('Enfermedades activas');
            if (consultations > 3)
                riskFactors.push('Múltiples consultas médicas');
            if (vaccinations === 0)
                riskFactors.push('Falta de vacunaciones');
            const recommendations = [];
            if (vaccinations === 0)
                recommendations.push('Actualizar esquema de vacunación');
            if (activeDiseases > 0)
                recommendations.push('Seguimiento médico continuo');
            if (healthScore < 70)
                recommendations.push('Evaluación veterinaria urgente');
            const metrics = {
                bovineId,
                period,
                consultations,
                vaccinations,
                treatments,
                activeDiseases,
                totalCost,
                healthScore,
                riskFactors,
                recommendations
            };
            return metrics;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error(`Error calculando métricas de salud para bovino ${bovineId}:`, errorMessage);
            throw new Error(`Error calculando métricas: ${errorMessage}`);
        }
    }
    async processHealthAlerts(ranchId) {
        try {
            const alerts = [];
            const now = new Date();
            const overdueVaccinations = await VaccinationRecordModel.findAll({
                where: {
                    nextDueDate: { [sequelize_1.Op.lte]: now },
                    status: VaccinationStatus.SCHEDULED
                }
            });
            for (const vaccination of overdueVaccinations) {
                alerts.push({
                    id: this.generateAlertId(),
                    bovineId: vaccination.bovineId,
                    alertType: 'vaccination_due',
                    severity: 'high',
                    message: `Vacunación vencida: ${vaccination.vaccineName}`,
                    details: `La vacuna ${vaccination.vaccineName} está vencida desde ${vaccination.nextDueDate?.toLocaleDateString()}`,
                    triggerDate: now,
                    dueDate: vaccination.nextDueDate,
                    isResolved: false,
                    actions: ['Programar vacunación', 'Contactar veterinario'],
                    relatedRecordId: vaccination.id,
                    notificationSent: false
                });
            }
            const overdueTreatments = await TreatmentPlanModel.findAll({
                where: {
                    nextCheckup: { [sequelize_1.Op.lte]: now },
                    status: TreatmentStatus.ACTIVE
                }
            });
            for (const treatment of overdueTreatments) {
                alerts.push({
                    id: this.generateAlertId(),
                    bovineId: treatment.bovineId,
                    alertType: 'treatment_overdue',
                    severity: 'medium',
                    message: `Seguimiento de tratamiento pendiente`,
                    details: `El tratamiento para ${treatment.condition} requiere seguimiento`,
                    triggerDate: now,
                    dueDate: treatment.nextCheckup,
                    isResolved: false,
                    actions: ['Evaluar progreso', 'Ajustar tratamiento'],
                    relatedRecordId: treatment.id,
                    notificationSent: false
                });
            }
            for (const alert of alerts.filter(a => !a.notificationSent)) {
                await this.sendHealthAlertNotification(alert);
                alert.notificationSent = true;
            }
            healthLogger.info(`Procesadas ${alerts.length} alertas de salud`);
            return alerts;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error procesando alertas de salud:', errorMessage);
            throw new Error(`Error procesando alertas: ${errorMessage}`);
        }
    }
    async getHealthStatistics(ranchId, period = 30) {
        try {
            const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));
            const statistics = {
                totalConsultations: 1245,
                totalVaccinations: 2156,
                totalTreatments: 234,
                activeTreatments: 45,
                healthyAnimals: 1890,
                sickAnimals: 78,
                criticalAnimals: 12,
                quarantinedAnimals: 23,
                totalHealthCosts: 125000.50,
                averageCostPerAnimal: 65.78,
                commonDiseases: [
                    { disease: 'Mastitis', count: 45 },
                    { disease: 'Parasitosis', count: 32 },
                    { disease: 'Claudicación', count: 28 },
                    { disease: 'Diarrea', count: 21 }
                ],
                vaccinationCoverage: 94.5,
                treatmentSuccessRate: 89.2,
                mortalityRate: 2.1
            };
            return statistics;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            healthLogger.error('Error obteniendo estadísticas de salud:', errorMessage);
            throw new Error(`Error obteniendo estadísticas: ${errorMessage}`);
        }
    }
    async checkDuplicateVaccination(bovineId, vaccineId, administrationDate) {
        try {
            const daysBefore = new Date(administrationDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            const existing = await VaccinationRecordModel.findAll({
                where: {
                    bovineId,
                    vaccineId,
                    administrationDate: { [sequelize_1.Op.between]: [daysBefore, administrationDate] }
                }
            });
            return existing.length > 0;
        }
        catch (error) {
            return false;
        }
    }
    calculateNextVaccinationDate(vaccineId, administrationDate) {
        const vaccinationIntervals = {
            'vacc_001': 365,
            'vacc_002': 730,
            'vacc_003': 180,
        };
        const intervalDays = vaccinationIntervals[vaccineId] || 365;
        return new Date(administrationDate.getTime() + (intervalDays * 24 * 60 * 60 * 1000));
    }
    async recordAppliedMedication(medicationData) {
        try {
            console.log('Medicación registrada:', medicationData);
        }
        catch (error) {
            healthLogger.error('Error registrando medicación aplicada:', error);
        }
    }
    async createHealthAlertsFromRecord(record) {
        console.log('Creando alertas de salud para registro:', record.id);
    }
    async sendHealthNotifications(record, userId) {
        try {
            await notificationService.sendHealthAlert({
                id: this.generateAlertId(),
                bovineId: record.bovineId,
                alertType: 'health_deterioration',
                severity: 'medium',
                message: 'Nueva consulta médica registrada',
                details: `Consulta: ${record.consultationType}`,
                triggerDate: new Date(),
                isResolved: false,
                actions: ['Revisar diagnóstico', 'Programar seguimiento'],
                relatedRecordId: record.id,
                notificationSent: false
            });
        }
        catch (error) {
            healthLogger.error('Error enviando notificaciones de salud:', error);
        }
    }
    async scheduleNextVaccination(vaccination) {
        if (vaccination.nextDueDate) {
            console.log(`Programando próxima vacunación de ${vaccination.vaccineName} para ${vaccination.nextDueDate.toLocaleDateString()}`);
        }
    }
    async updateVaccineInventory(vaccineId, quantity) {
        console.log(`Actualizando inventario: ${vaccineId}, cantidad usada: ${quantity}`);
    }
    async sendVaccinationConfirmation(vaccination, userId) {
        try {
            await notificationService.sendVaccinationReminder(vaccination.bovineId, vaccination.vaccineName, vaccination.nextDueDate || new Date());
        }
        catch (error) {
            healthLogger.error('Error enviando confirmación de vacunación:', error);
        }
    }
    async validateMedicationAvailability(medicationId, dosage) {
        console.log(`Validando disponibilidad de medicamento ${medicationId}, dosis: ${dosage}`);
    }
    async reserveMedicationInventory(medicationId, dosage) {
        console.log(`Reservando medicamento ${medicationId}, dosis: ${dosage}`);
    }
    async createTreatmentAlerts(treatment) {
        console.log(`Creando alertas de seguimiento para tratamiento ${treatment.id}`);
    }
    async initiateQuarantine(bovineId, endDate) {
        console.log(`Iniciando cuarentena para bovino ${bovineId} hasta ${endDate?.toLocaleDateString() || 'indefinido'}`);
    }
    async handleContagiousDisease(disease) {
        console.log(`Manejando enfermedad contagiosa: ${disease.diseaseName} para bovino ${disease.bovineId}`);
    }
    async reportNotifiableDisease(disease) {
        console.log(`Reportando enfermedad de declaración obligatoria: ${disease.diseaseName}`);
    }
    async createCriticalHealthAlert(disease) {
        const alert = {
            id: this.generateAlertId(),
            bovineId: disease.bovineId,
            alertType: 'health_deterioration',
            severity: 'critical',
            message: `Estado crítico: ${disease.diseaseName}`,
            details: `Enfermedad crítica detectada que requiere atención inmediata`,
            triggerDate: new Date(),
            isResolved: false,
            actions: ['Contactar veterinario de emergencia', 'Iniciar tratamiento urgente'],
            relatedRecordId: disease.id,
            notificationSent: false
        };
        await notificationService.sendHealthAlert(alert);
    }
    async sendHealthAlertNotification(alert) {
        try {
            await notificationService.sendHealthAlert(alert);
        }
        catch (error) {
            healthLogger.error('Error enviando notificación de alerta:', error);
        }
    }
    generateHealthId() {
        return `health_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateVaccinationId() {
        return `vacc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateTreatmentId() {
        return `treat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateDiseaseId() {
        return `disease_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.healthService = new HealthService();
//# sourceMappingURL=health.js.map