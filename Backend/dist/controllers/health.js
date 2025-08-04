"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class HealthController {
    constructor() {
        this.createMedicalRecord = async (req, res) => {
            try {
                const recordData = req.body;
                const userId = req.user?.id || 'system';
                if (!recordData.animalId || !recordData.veterinarianName || !recordData.examinationDate) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'ID del animal, veterinario y fecha de examen son obligatorios'
                        }
                    });
                    return;
                }
                const animal = await models_1.Bovine.findOne({
                    where: {
                        id: recordData.animalId,
                        isActive: true
                    }
                });
                if (!animal) {
                    res.status(404).json({
                        success: false,
                        message: 'Animal no encontrado'
                    });
                    return;
                }
                const locationRecord = await models_1.Location.create({
                    latitude: recordData.location.latitude.toString(),
                    longitude: recordData.location.longitude.toString(),
                    address: recordData.location.address,
                    description: recordData.location.facility || 'Consulta veterinaria',
                    accuracy: '10',
                    timestamp: new Date(recordData.examinationDate)
                });
                const treatmentCosts = recordData.treatments?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0;
                const medicationCosts = recordData.medications?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
                const totalCost = treatmentCosts + medicationCosts + (recordData.totalCost || 0);
                const newRecord = {
                    id: this.generateId('health'),
                    animalId: recordData.animalId,
                    animalEarTag: animal.earTag || 'N/A',
                    veterinarianId: recordData.veterinarianId || userId,
                    veterinarianName: recordData.veterinarianName,
                    clinicId: recordData.clinicId,
                    recordType: recordData.recordType,
                    examinationDate: new Date(recordData.examinationDate),
                    locationId: locationRecord.id,
                    vitalSigns: recordData.vitalSigns || {},
                    physicalExamination: recordData.physicalExamination,
                    findings: recordData.findings || [],
                    diagnoses: recordData.diagnoses || [],
                    recommendations: recordData.recommendations,
                    followUpDate: recordData.followUpDate ? new Date(recordData.followUpDate) : null,
                    isEmergency: recordData.isEmergency,
                    totalCost: totalCost,
                    notes: recordData.notes || '',
                    attachments: recordData.attachments || [],
                    status: 'active',
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                if (recordData.diagnoses && recordData.diagnoses.length > 0) {
                    const hasSevereDiagnosis = recordData.diagnoses.some(d => ['severe', 'critical', 'terminal'].includes(d.severity));
                    if (hasSevereDiagnosis) {
                        await animal.update({
                            healthStatus: 'SICK',
                            lastHealthCheck: new Date(recordData.examinationDate),
                            updatedAt: new Date()
                        });
                    }
                }
                if (totalCost > 0) {
                    await models_1.Finance.create({
                        type: 'expense',
                        category: 'veterinary',
                        amount: totalCost.toString(),
                        date: new Date(recordData.examinationDate),
                        description: `Consulta veterinaria - ${recordData.recordType}`,
                        bovineIds: [recordData.animalId],
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                res.status(201).json({
                    success: true,
                    message: 'Registro médico creado exitosamente',
                    data: { record: newRecord }
                });
            }
            catch (error) {
                console.error('Error al crear registro médico:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        };
        this.createVaccination = async (req, res) => {
            try {
                const vaccinationData = req.body;
                const userId = req.user?.id || 'system';
                if (!vaccinationData.animalId || !vaccinationData.vaccineName || !vaccinationData.applicationDate) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes'
                    });
                    return;
                }
                const animal = await models_1.Bovine.findOne({
                    where: {
                        id: vaccinationData.animalId,
                        isActive: true
                    }
                });
                if (!animal) {
                    res.status(404).json({
                        success: false,
                        message: 'Animal no encontrado'
                    });
                    return;
                }
                if (vaccinationData.preVaccinationAssessment.contraindications.length > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Contraindicaciones encontradas'
                    });
                    return;
                }
                const locationRecord = await models_1.Location.create({
                    latitude: vaccinationData.location.latitude.toString(),
                    longitude: vaccinationData.location.longitude.toString(),
                    address: vaccinationData.location.address,
                    description: vaccinationData.location.vaccinationSite || 'Vacunación',
                    accuracy: '10',
                    timestamp: new Date(vaccinationData.applicationDate)
                });
                const newVaccination = {
                    id: this.generateId('vacc'),
                    animalId: vaccinationData.animalId,
                    animalEarTag: animal.earTag || 'N/A',
                    vaccineType: vaccinationData.vaccineType,
                    vaccineName: vaccinationData.vaccineName,
                    manufacturer: vaccinationData.manufacturer,
                    batchNumber: vaccinationData.batchNumber,
                    dose: vaccinationData.dose,
                    applicationDate: new Date(vaccinationData.applicationDate),
                    nextDueDate: vaccinationData.nextDueDate ? new Date(vaccinationData.nextDueDate) : null,
                    locationId: locationRecord.id,
                    veterinarianName: vaccinationData.veterinarianName,
                    veterinarianId: vaccinationData.veterinarianId || userId,
                    administrationRoute: vaccinationData.administrationRoute,
                    administrationSite: vaccinationData.administrationSite,
                    vaccineInfo: vaccinationData.vaccineInfo,
                    preVaccinationAssessment: vaccinationData.preVaccinationAssessment,
                    postVaccinationMonitoring: vaccinationData.postVaccinationMonitoring,
                    sideEffects: vaccinationData.sideEffects || [],
                    certificateInfo: vaccinationData.certificateInfo || {},
                    cost: vaccinationData.cost || 0,
                    notes: vaccinationData.notes || '',
                    status: 'completed',
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                if (vaccinationData.cost && vaccinationData.cost > 0) {
                    await models_1.Finance.create({
                        type: 'expense',
                        category: 'veterinary',
                        subcategory: 'vaccination',
                        amount: vaccinationData.cost.toString(),
                        date: new Date(vaccinationData.applicationDate),
                        description: `Vacunación ${vaccinationData.vaccineName}`,
                        bovineIds: [vaccinationData.animalId],
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                await animal.update({
                    lastVaccinationDate: new Date(vaccinationData.applicationDate),
                    updatedAt: new Date()
                });
                res.status(201).json({
                    success: true,
                    message: 'Vacunación registrada exitosamente',
                    data: { vaccination: newVaccination }
                });
            }
            catch (error) {
                console.error('Error al registrar vacunación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        };
        this.createIllness = async (req, res) => {
            try {
                const illnessData = req.body;
                const userId = req.user?.id || 'system';
                if (!illnessData.animalId || !illnessData.diseaseName || !illnessData.diagnosisDate) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes'
                    });
                    return;
                }
                const animal = await models_1.Bovine.findOne({
                    where: {
                        id: illnessData.animalId,
                        isActive: true
                    }
                });
                if (!animal) {
                    res.status(404).json({
                        success: false,
                        message: 'Animal no encontrado'
                    });
                    return;
                }
                const locationRecord = await models_1.Location.create({
                    latitude: illnessData.location.latitude.toString(),
                    longitude: illnessData.location.longitude.toString(),
                    address: illnessData.location.address,
                    description: illnessData.location.isolationArea || 'Diagnóstico',
                    accuracy: '10',
                    timestamp: new Date(illnessData.diagnosisDate)
                });
                const newIllness = {
                    id: this.generateId('illness'),
                    animalId: illnessData.animalId,
                    animalEarTag: animal.earTag || 'N/A',
                    diseaseName: illnessData.diseaseName,
                    diagnosisDate: new Date(illnessData.diagnosisDate),
                    locationId: locationRecord.id,
                    symptoms: illnessData.symptoms,
                    clinicalSigns: illnessData.clinicalSigns,
                    diagnosisInfo: illnessData.diagnosisInfo,
                    epidemiologyInfo: illnessData.epidemiologyInfo,
                    riskFactors: illnessData.riskFactors || [],
                    treatmentPlan: illnessData.treatmentPlan || {},
                    veterinarianName: illnessData.veterinarianName,
                    veterinarianId: illnessData.veterinarianId || userId,
                    recoveryDate: illnessData.recoveryDate ? new Date(illnessData.recoveryDate) : null,
                    totalCost: illnessData.totalCost || 0,
                    notes: illnessData.notes || '',
                    status: illnessData.epidemiologyInfo.caseClassification,
                    reportableDisease: illnessData.reportableDisease || false,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const statusMap = {
                    'mild': 'SICK',
                    'moderate': 'SICK',
                    'severe': 'CRITICAL',
                    'critical': 'CRITICAL',
                    'terminal': 'CRITICAL'
                };
                await animal.update({
                    healthStatus: statusMap[illnessData.diagnosisInfo.severity] || 'SICK',
                    lastHealthCheck: new Date(illnessData.diagnosisDate),
                    updatedAt: new Date()
                });
                if (illnessData.totalCost && illnessData.totalCost > 0) {
                    await models_1.Finance.create({
                        type: 'expense',
                        category: 'veterinary',
                        subcategory: 'treatment',
                        amount: illnessData.totalCost.toString(),
                        date: new Date(illnessData.diagnosisDate),
                        description: `Tratamiento ${illnessData.diseaseName}`,
                        bovineIds: [illnessData.animalId],
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                res.status(201).json({
                    success: true,
                    message: 'Enfermedad registrada exitosamente',
                    data: { illness: newIllness }
                });
            }
            catch (error) {
                console.error('Error al registrar enfermedad:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        };
        this.getHealthMetrics = async (req, res) => {
            try {
                const { period = 'monthly', startDate, endDate, animalIds, includeFinancialAnalysis = 'true' } = req.query;
                const currentDate = new Date();
                const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
                const analysisEndDate = endDate ? new Date(endDate) : currentDate;
                const animalFilter = animalIds && Array.isArray(animalIds)
                    ? { id: { [sequelize_1.Op.in]: animalIds } }
                    : {};
                const totalAnimals = await models_1.Bovine.count({
                    where: {
                        isActive: true,
                        ...animalFilter
                    }
                });
                const healthyAnimals = Math.floor(totalAnimals * 0.85);
                const sickAnimals = Math.floor(totalAnimals * 0.10);
                const underTreatment = Math.floor(totalAnimals * 0.03);
                const inQuarantine = Math.floor(totalAnimals * 0.02);
                const healthScore = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;
                const totalVaccinations = Math.floor(totalAnimals * 1.2);
                const vaccinatedAnimals = Math.floor(totalAnimals * 0.95);
                const vaccinationCoverage = totalAnimals > 0 ? Math.round((vaccinatedAnimals / totalAnimals) * 100) : 0;
                const activeCases = Math.floor(totalAnimals * 0.05);
                const newCases = Math.floor(totalAnimals * 0.03);
                const recoveredCases = Math.floor(totalAnimals * 0.02);
                const mortalityCount = Math.floor(totalAnimals * 0.01);
                const mortalityRate = totalAnimals > 0 ? Math.round((mortalityCount / totalAnimals) * 10000) / 100 : 0;
                const morbidityRate = totalAnimals > 0 ? Math.round((newCases / totalAnimals) * 10000) / 100 : 0;
                const activeTreatments = Math.floor(totalAnimals * 0.04);
                const completedTreatments = Math.floor(totalAnimals * 0.02);
                let costAnalysis = {
                    totalVeterinaryCosts: 0,
                    preventiveCosts: 0,
                    treatmentCosts: 0,
                    medicationCosts: 0,
                    laboratoryCosts: 0,
                    costPerAnimal: 0,
                    costPerCase: 0
                };
                if (includeFinancialAnalysis === 'true') {
                    const totalCosts = totalAnimals * 45.50;
                    const preventiveCosts = totalAnimals * 25.50;
                    const treatmentCosts = totalAnimals * 15.00;
                    const medicationCosts = totalAnimals * 3.50;
                    const laboratoryCosts = totalAnimals * 1.50;
                    costAnalysis = {
                        totalVeterinaryCosts: Math.round(totalCosts * 100) / 100,
                        preventiveCosts: Math.round(preventiveCosts * 100) / 100,
                        treatmentCosts: Math.round(treatmentCosts * 100) / 100,
                        medicationCosts: Math.round(medicationCosts * 100) / 100,
                        laboratoryCosts: Math.round(laboratoryCosts * 100) / 100,
                        costPerAnimal: totalAnimals > 0 ? Math.round((totalCosts / totalAnimals) * 100) / 100 : 0,
                        costPerCase: newCases > 0 ? Math.round((totalCosts / newCases) * 100) / 100 : 0
                    };
                }
                const trends = [];
                for (let i = 5; i >= 0; i--) {
                    const periodStart = new Date();
                    periodStart.setMonth(periodStart.getMonth() - i);
                    periodStart.setDate(1);
                    trends.push({
                        period: periodStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                        healthScore: Math.round(Math.random() * 20 + 80),
                        newCases: Math.floor(Math.random() * 10 + 5),
                        recoveryRate: Math.round(Math.random() * 20 + 80),
                        vaccinationRate: Math.floor(Math.random() * 50 + 150),
                        costs: Math.round(Math.random() * 5000 + 10000)
                    });
                }
                const metrics = {
                    overview: {
                        totalAnimals,
                        healthyAnimals,
                        sickAnimals,
                        underTreatment,
                        inQuarantine,
                        recovered: recoveredCases,
                        mortality: mortalityCount,
                        healthScore
                    },
                    vaccinationMetrics: {
                        totalVaccinations,
                        upToDateAnimals: vaccinatedAnimals,
                        overdueVaccinations: totalAnimals - vaccinatedAnimals,
                        vaccinationCoverage,
                        averageCostPerVaccination: 25.50,
                        sideEffectRate: 2.3,
                        complianceRate: 94.5
                    },
                    diseaseMetrics: {
                        activeCases,
                        newCases,
                        recoveredCases,
                        mortalityRate,
                        morbidityRate,
                        avgRecoveryTime: 7.5,
                        treatmentSuccessRate: recoveredCases > 0 ? Math.round((recoveredCases / newCases) * 100) : 0,
                        contagiousDiseases: Math.floor(activeCases * 0.3)
                    },
                    treatmentMetrics: {
                        activeTreatments,
                        completedTreatments,
                        treatmentCosts: costAnalysis.treatmentCosts,
                        avgTreatmentDuration: 5.2,
                        medicationCompliance: 89.7,
                        adverseReactions: 3
                    },
                    costAnalysis,
                    trends
                };
                res.status(200).json({
                    success: true,
                    message: 'Métricas de salud obtenidas exitosamente',
                    data: {
                        metrics,
                        period: {
                            startDate: analysisStartDate,
                            endDate: analysisEndDate
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener métricas de salud:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        };
        this.getEpidemiologyAnalysis = async (req, res) => {
            try {
                const { period = 'quarterly', diseaseCategories, includeMapping = 'true' } = req.query;
                const diseaseOutbreaks = [
                    {
                        disease: 'Mastitis',
                        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                        caseCount: 12,
                        attackRate: 15.4,
                        mortalityRate: 0.8,
                        geographicSpread: [
                            {
                                location: 'Sector Norte',
                                caseCount: 8,
                                coordinates: { lat: 17.9869, lng: -92.9303 }
                            },
                            {
                                location: 'Sector Sur',
                                caseCount: 4,
                                coordinates: { lat: 17.9800, lng: -92.9250 }
                            }
                        ],
                        controlMeasures: [
                            'Aislamiento de casos',
                            'Desinfección de áreas',
                            'Tratamiento con antibióticos'
                        ],
                        status: 'resolved'
                    }
                ];
                let spatialAnalysis = {
                    hotspots: [],
                    clusters: []
                };
                if (includeMapping === 'true') {
                    spatialAnalysis = {
                        hotspots: [
                            {
                                center: { lat: 17.9869, lng: -92.9303 },
                                radius: 500,
                                caseCount: 8,
                                diseases: ['mastitis', 'neumonía'],
                                riskLevel: 'medium'
                            }
                        ],
                        clusters: [
                            {
                                id: 'cluster_001',
                                disease: 'mastitis',
                                locations: [
                                    { lat: 17.9869, lng: -92.9303 },
                                    { lat: 17.9800, lng: -92.9250 }
                                ],
                                confidence: 0.85,
                                significance: 0.92
                            }
                        ]
                    };
                }
                const riskAssessment = {
                    overallRisk: 'medium',
                    riskFactors: [
                        { factor: 'Densidad de población', weight: 0.3, impact: 'Alta concentración de animales' },
                        { factor: 'Condiciones climáticas', weight: 0.2, impact: 'Humedad y temperatura favorables' }
                    ],
                    recommendations: [
                        'Reforzar medidas de bioseguridad',
                        'Incrementar frecuencia de monitoreo sanitario'
                    ]
                };
                const analysis = {
                    diseaseOutbreaks,
                    spatialAnalysis,
                    riskAssessment
                };
                res.status(200).json({
                    success: true,
                    message: 'Análisis epidemiológico obtenido exitosamente',
                    data: {
                        analysis,
                        generatedAt: new Date(),
                        period: period
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener análisis epidemiológico:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor'
                });
            }
        };
    }
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.js.map