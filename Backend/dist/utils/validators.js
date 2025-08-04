"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.validateFileUpload = exports.validateLocationData = exports.validatePhone = exports.validatePassword = exports.validateUsername = exports.validateUserData = exports.validateFutureDate = exports.validateEventDate = exports.validateTreatmentEvent = exports.validateIllnessEvent = exports.validateVaccinationEvent = exports.validateEventData = exports.validateBirthDate = exports.validateCattleWeight = exports.validateCattleTag = exports.validateCattleData = void 0;
const constants_1 = require("./constants");
const helpers_1 = require("./helpers");
const isValidAnimalType = (value) => {
    const cattleTypes = ['cow', 'bull', 'calf', 'heifer', 'steer', 'ox'];
    return cattleTypes.includes(value);
};
const isValidBreed = (value) => {
    const breeds = ['holstein', 'angus', 'hereford', 'charolais', 'simmental', 'brahman', 'limousin', 'shorthorn', 'jersey', 'guernsey', 'brown_swiss', 'ayrshire', 'santa_gertrudis', 'brangus', 'beefmaster', 'gelbvieh', 'corriente', 'criollo', 'nelore', 'gyr', 'indo_brasil', 'mixed', 'other'];
    return breeds.includes(value);
};
const isValidHealthStatus = (value) => {
    const statuses = ['healthy', 'sick', 'recovering', 'quarantine', 'deceased', 'unknown'];
    return statuses.includes(value);
};
const isValidEventType = (value) => {
    const eventTypes = ['vaccination', 'illness', 'treatment', 'pregnancy_check', 'birth', 'weaning', 'breeding', 'injury', 'surgery', 'deworming', 'hoof_trimming', 'weight_check', 'body_condition_score', 'location_update', 'transfer', 'death', 'sale', 'purchase', 'other'];
    return eventTypes.includes(value);
};
const isValidVaccineType = (value) => {
    const vaccineTypes = ['ibr', 'bvd', 'pi3', 'brsv', 'clostridium', 'blackleg', 'anthrax', 'pasteurella', 'mannheimia', 'brucellosis', 'leptospirosis', 'campylobacter', 'trichomonas', 'rabies', 'foot_and_mouth', 'lumpy_skin', 'hemorrhagic_septicemia', 'five_way', 'seven_way', 'nine_way', 'other'];
    return vaccineTypes.includes(value);
};
const isValidUserRole = (value) => {
    const roles = ['admin', 'veterinarian', 'farm_manager', 'worker', 'viewer'];
    return roles.includes(value);
};
const isValidUserStatus = (value) => {
    const statuses = ['active', 'inactive', 'suspended', 'pending'];
    return statuses.includes(value);
};
const isValidIllnessSeverity = (value) => {
    const severities = ['mild', 'moderate', 'severe', 'critical'];
    return severities.includes(value);
};
const isValidTreatmentStatus = (value) => {
    const statuses = ['planned', 'in_progress', 'completed', 'cancelled', 'overdue'];
    return statuses.includes(value);
};
const validateCattleData = (data) => {
    const errors = [];
    const warnings = [];
    if (!data.tag || typeof data.tag !== 'string') {
        errors.push('El tag del animal es requerido');
    }
    else {
        const tagValidation = (0, exports.validateCattleTag)(data.tag);
        if (!tagValidation.isValid) {
            errors.push(...tagValidation.errors);
        }
    }
    if (!data.type) {
        errors.push('El tipo de animal es requerido');
    }
    else if (!isValidAnimalType(data.type)) {
        errors.push(`Tipo de animal inválido. Valores permitidos: ${Object.values(constants_1.CATTLE_TYPES).join(', ')}`);
    }
    if (!data.breed) {
        errors.push('La raza del animal es requerida');
    }
    else if (!isValidBreed(data.breed)) {
        errors.push(`Raza inválida. Valores permitidos: ${Object.values(constants_1.CATTLE_BREEDS).join(', ')}`);
    }
    if (!data.birthDate) {
        errors.push('La fecha de nacimiento es requerida');
    }
    else {
        const birthValidation = (0, exports.validateBirthDate)(data.birthDate);
        if (!birthValidation.isValid) {
            errors.push(...birthValidation.errors);
        }
        if (birthValidation.warnings) {
            warnings.push(...birthValidation.warnings);
        }
    }
    if (data.name && typeof data.name === 'string') {
        if (data.name.length > constants_1.VALIDATION_RULES.CATTLE_NAME_MAX_LENGTH) {
            errors.push(`El nombre no puede exceder ${constants_1.VALIDATION_RULES.CATTLE_NAME_MAX_LENGTH} caracteres`);
        }
        if (data.name.trim().length === 0) {
            warnings.push('El nombre está vacío');
        }
    }
    if (data.weight !== undefined) {
        const weightValidation = (0, exports.validateCattleWeight)(data.weight);
        if (!weightValidation.isValid) {
            errors.push(...weightValidation.errors);
        }
    }
    if (data.healthStatus && !isValidHealthStatus(data.healthStatus)) {
        errors.push(`Estado de salud inválido. Valores permitidos: ${Object.values(constants_1.CATTLE_HEALTH_STATUS).join(', ')}`);
    }
    if ((data.latitude !== undefined || data.longitude !== undefined)) {
        if (data.latitude === undefined || data.longitude === undefined) {
            errors.push('Si se proporciona ubicación, tanto latitud como longitud son requeridas');
        }
        else {
            const coordsValidation = (0, helpers_1.validateCoordinates)(data.latitude, data.longitude);
            if (!coordsValidation.isValid) {
                errors.push(...coordsValidation.errors);
            }
        }
    }
    if (data.motherId !== undefined && (!Number.isInteger(data.motherId) || data.motherId <= 0)) {
        errors.push('ID de madre inválido');
    }
    if (data.fatherId !== undefined && (!Number.isInteger(data.fatherId) || data.fatherId <= 0)) {
        errors.push('ID de padre inválido');
    }
    if (data.farmId !== undefined && (!Number.isInteger(data.farmId) || data.farmId <= 0)) {
        errors.push('ID de granja inválido');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validateCattleData = validateCattleData;
const validateCattleTag = (tag) => {
    const errors = [];
    if (!tag || typeof tag !== 'string') {
        errors.push('El tag es requerido');
        return { isValid: false, errors };
    }
    const cleanTag = tag.trim().toUpperCase();
    if (cleanTag.length < constants_1.VALIDATION_RULES.CATTLE_TAG_MIN_LENGTH) {
        errors.push(`El tag debe tener al menos ${constants_1.VALIDATION_RULES.CATTLE_TAG_MIN_LENGTH} caracteres`);
    }
    if (cleanTag.length > constants_1.VALIDATION_RULES.CATTLE_TAG_MAX_LENGTH) {
        errors.push(`El tag no puede exceder ${constants_1.VALIDATION_RULES.CATTLE_TAG_MAX_LENGTH} caracteres`);
    }
    const validTagPattern = /^[A-Z0-9\-_]+$/;
    if (!validTagPattern.test(cleanTag)) {
        errors.push('El tag solo puede contener letras mayúsculas, números, guiones y guiones bajos');
    }
    if (/^\d+$/.test(cleanTag)) {
        errors.push('El tag debe contener al menos una letra');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateCattleTag = validateCattleTag;
const validateCattleWeight = (weight) => {
    const errors = [];
    const warnings = [];
    if (typeof weight !== 'number' || isNaN(weight)) {
        errors.push('El peso debe ser un número válido');
        return { isValid: false, errors };
    }
    if (weight <= 0) {
        errors.push('El peso debe ser mayor que cero');
    }
    if (weight < constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MIN) {
        errors.push(`El peso mínimo es ${constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MIN} kg`);
    }
    if (weight > constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MAX) {
        errors.push(`El peso máximo es ${constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MAX} kg`);
    }
    if (weight < 20) {
        warnings.push('Peso muy bajo, verificar si es correcto');
    }
    if (weight > 1200) {
        warnings.push('Peso muy alto, verificar si es correcto');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validateCattleWeight = validateCattleWeight;
const validateBirthDate = (birthDate) => {
    const errors = [];
    const warnings = [];
    let date;
    if (typeof birthDate === 'string') {
        date = new Date(birthDate);
    }
    else if (birthDate instanceof Date) {
        date = birthDate;
    }
    else {
        errors.push('Fecha de nacimiento inválida');
        return { isValid: false, errors };
    }
    if (isNaN(date.getTime())) {
        errors.push('Formato de fecha de nacimiento inválido');
        return { isValid: false, errors };
    }
    const now = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 25);
    if (date > now) {
        errors.push('La fecha de nacimiento no puede ser futura');
    }
    if (date < maxAge) {
        errors.push('La fecha de nacimiento es demasiado antigua (máximo 25 años)');
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (date > oneYearAgo) {
        warnings.push('Animal muy joven, verificar fecha');
    }
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (date < tenYearsAgo) {
        warnings.push('Animal de edad avanzada');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validateBirthDate = validateBirthDate;
const validateEventData = (data) => {
    const errors = [];
    const warnings = [];
    if (!data.cattleId || !Number.isInteger(data.cattleId) || data.cattleId <= 0) {
        errors.push('ID de ganado válido es requerido');
    }
    if (!data.eventType) {
        errors.push('El tipo de evento es requerido');
    }
    else if (!isValidEventType(data.eventType)) {
        errors.push(`Tipo de evento inválido. Valores permitidos: ${Object.values(constants_1.EVENT_TYPES).join(', ')}`);
    }
    if (!data.eventDate) {
        errors.push('La fecha del evento es requerida');
    }
    else {
        const dateValidation = (0, exports.validateEventDate)(data.eventDate);
        if (!dateValidation.isValid) {
            errors.push(...dateValidation.errors);
        }
        if (dateValidation.warnings) {
            warnings.push(...dateValidation.warnings);
        }
    }
    if (!data.description || typeof data.description !== 'string') {
        errors.push('La descripción del evento es requerida');
    }
    else if (data.description.trim().length === 0) {
        errors.push('La descripción no puede estar vacía');
    }
    else if (data.description.length > constants_1.VALIDATION_RULES.EVENT_DESCRIPTION_MAX_LENGTH) {
        errors.push(`La descripción no puede exceder ${constants_1.VALIDATION_RULES.EVENT_DESCRIPTION_MAX_LENGTH} caracteres`);
    }
    if (data.eventType === constants_1.EVENT_TYPES.VACCINATION) {
        const vaccineValidation = (0, exports.validateVaccinationEvent)(data);
        if (!vaccineValidation.isValid) {
            errors.push(...vaccineValidation.errors);
        }
    }
    if (data.eventType === constants_1.EVENT_TYPES.ILLNESS) {
        const illnessValidation = (0, exports.validateIllnessEvent)(data);
        if (!illnessValidation.isValid) {
            errors.push(...illnessValidation.errors);
        }
    }
    if (data.eventType === constants_1.EVENT_TYPES.TREATMENT) {
        const treatmentValidation = (0, exports.validateTreatmentEvent)(data);
        if (!treatmentValidation.isValid) {
            errors.push(...treatmentValidation.errors);
        }
    }
    if (data.veterinarianId !== undefined && (!Number.isInteger(data.veterinarianId) || data.veterinarianId <= 0)) {
        errors.push('ID de veterinario inválido');
    }
    if (data.notes && data.notes.length > constants_1.VALIDATION_RULES.EVENT_NOTES_MAX_LENGTH) {
        errors.push(`Las notas no pueden exceder ${constants_1.VALIDATION_RULES.EVENT_NOTES_MAX_LENGTH} caracteres`);
    }
    if (data.cost !== undefined) {
        if (typeof data.cost !== 'number' || isNaN(data.cost)) {
            errors.push('El costo debe ser un número válido');
        }
        else if (data.cost < 0) {
            errors.push('El costo no puede ser negativo');
        }
        else if (data.cost > 1000000) {
            warnings.push('Costo muy alto, verificar si es correcto');
        }
    }
    if ((data.latitude !== undefined || data.longitude !== undefined)) {
        if (data.latitude === undefined || data.longitude === undefined) {
            errors.push('Si se proporciona ubicación, tanto latitud como longitud son requeridas');
        }
        else {
            const coordsValidation = (0, helpers_1.validateCoordinates)(data.latitude, data.longitude);
            if (!coordsValidation.isValid) {
                errors.push(...coordsValidation.errors);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validateEventData = validateEventData;
const validateVaccinationEvent = (data) => {
    const errors = [];
    if (!data.vaccineType) {
        errors.push('El tipo de vacuna es requerido para eventos de vacunación');
    }
    else if (!isValidVaccineType(data.vaccineType)) {
        errors.push(`Tipo de vacuna inválido. Valores permitidos: ${Object.values(constants_1.VACCINE_TYPES).join(', ')}`);
    }
    if (data.dosage !== undefined) {
        if (typeof data.dosage !== 'number' || isNaN(data.dosage)) {
            errors.push('La dosificación debe ser un número válido');
        }
        else if (data.dosage <= 0) {
            errors.push('La dosificación debe ser mayor que cero');
        }
        else if (data.dosage > 100) {
            errors.push('Dosificación muy alta, verificar');
        }
    }
    if (data.nextDueDate) {
        const nextDateValidation = (0, exports.validateFutureDate)(data.nextDueDate);
        if (!nextDateValidation.isValid) {
            errors.push('Fecha de próxima dosis inválida: ' + nextDateValidation.errors.join(', '));
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateVaccinationEvent = validateVaccinationEvent;
const validateIllnessEvent = (data) => {
    const errors = [];
    if (data.severity && !isValidIllnessSeverity(data.severity)) {
        errors.push(`Severidad inválida. Valores permitidos: ${Object.values(constants_1.ILLNESS_SEVERITY).join(', ')}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateIllnessEvent = validateIllnessEvent;
const validateTreatmentEvent = (data) => {
    const errors = [];
    if (data.treatmentStatus && !isValidTreatmentStatus(data.treatmentStatus)) {
        errors.push(`Estado de tratamiento inválido. Valores permitidos: ${Object.values(constants_1.TREATMENT_STATUS).join(', ')}`);
    }
    if (data.medications) {
        if (!Array.isArray(data.medications)) {
            errors.push('Los medicamentos deben ser un array');
        }
        else {
            data.medications.forEach((med, index) => {
                if (typeof med !== 'string' || med.trim().length === 0) {
                    errors.push(`Medicamento ${index + 1} inválido`);
                }
            });
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateTreatmentEvent = validateTreatmentEvent;
const validateEventDate = (eventDate) => {
    const errors = [];
    const warnings = [];
    let date;
    if (typeof eventDate === 'string') {
        date = new Date(eventDate);
    }
    else if (eventDate instanceof Date) {
        date = eventDate;
    }
    else {
        errors.push('Fecha de evento inválida');
        return { isValid: false, errors };
    }
    if (isNaN(date.getTime())) {
        errors.push('Formato de fecha de evento inválido');
        return { isValid: false, errors };
    }
    const now = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 2);
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 6);
    if (date > maxFutureDate) {
        errors.push('La fecha del evento no puede ser más de 6 meses en el futuro');
    }
    if (date < maxPastDate) {
        errors.push('La fecha del evento no puede ser más de 2 años en el pasado');
    }
    const oneWeekFuture = new Date();
    oneWeekFuture.setDate(oneWeekFuture.getDate() + 7);
    if (date > oneWeekFuture) {
        warnings.push('Evento programado para más de una semana en el futuro');
    }
    const sixMonthsPast = new Date();
    sixMonthsPast.setMonth(sixMonthsPast.getMonth() - 6);
    if (date < sixMonthsPast) {
        warnings.push('Evento de hace más de 6 meses');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validateEventDate = validateEventDate;
const validateFutureDate = (futureDate) => {
    const errors = [];
    let date;
    if (typeof futureDate === 'string') {
        date = new Date(futureDate);
    }
    else if (futureDate instanceof Date) {
        date = futureDate;
    }
    else {
        errors.push('Fecha inválida');
        return { isValid: false, errors };
    }
    if (isNaN(date.getTime())) {
        errors.push('Formato de fecha inválido');
        return { isValid: false, errors };
    }
    const now = new Date();
    if (date <= now) {
        errors.push('La fecha debe ser futura');
    }
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);
    if (date > maxFutureDate) {
        errors.push('La fecha no puede ser más de 5 años en el futuro');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateFutureDate = validateFutureDate;
const validateUserData = (data) => {
    const errors = [];
    if (!data.username || typeof data.username !== 'string') {
        errors.push('El nombre de usuario es requerido');
    }
    else {
        const usernameValidation = (0, exports.validateUsername)(data.username);
        if (!usernameValidation.isValid) {
            errors.push(...usernameValidation.errors);
        }
    }
    if (!data.email) {
        errors.push('El email es requerido');
    }
    else {
        const emailValidation = (0, helpers_1.validateEmail)(data.email);
        if (!emailValidation.isValid) {
            errors.push(...emailValidation.errors);
        }
    }
    if (!data.password) {
        errors.push('La contraseña es requerida');
    }
    else {
        const passwordValidation = (0, exports.validatePassword)(data.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }
    }
    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
        errors.push('El nombre es requerido');
    }
    else if (data.firstName.length > 50) {
        errors.push('El nombre no puede exceder 50 caracteres');
    }
    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
        errors.push('El apellido es requerido');
    }
    else if (data.lastName.length > 50) {
        errors.push('El apellido no puede exceder 50 caracteres');
    }
    if (!data.role) {
        errors.push('El rol es requerido');
    }
    else if (!isValidUserRole(data.role)) {
        errors.push(`Rol inválido. Valores permitidos: ${Object.values(constants_1.USER_ROLES).join(', ')}`);
    }
    if (data.phone) {
        const phoneValidation = (0, exports.validatePhone)(data.phone);
        if (!phoneValidation.isValid) {
            errors.push(...phoneValidation.errors);
        }
    }
    if (data.status && !isValidUserStatus(data.status)) {
        errors.push(`Estado inválido. Valores permitidos: ${Object.values(constants_1.USER_STATUS).join(', ')}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateUserData = validateUserData;
const validateUsername = (username) => {
    const errors = [];
    if (!username || typeof username !== 'string') {
        errors.push('El nombre de usuario es requerido');
        return { isValid: false, errors };
    }
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < constants_1.VALIDATION_RULES.USERNAME_MIN_LENGTH) {
        errors.push(`El nombre de usuario debe tener al menos ${constants_1.VALIDATION_RULES.USERNAME_MIN_LENGTH} caracteres`);
    }
    if (cleanUsername.length > constants_1.VALIDATION_RULES.USERNAME_MAX_LENGTH) {
        errors.push(`El nombre de usuario no puede exceder ${constants_1.VALIDATION_RULES.USERNAME_MAX_LENGTH} caracteres`);
    }
    const validUsernamePattern = /^[a-z0-9_-]+$/;
    if (!validUsernamePattern.test(cleanUsername)) {
        errors.push('El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos');
    }
    if (cleanUsername.startsWith('-') || cleanUsername.endsWith('-')) {
        errors.push('El nombre de usuario no puede empezar o terminar con guiones');
    }
    const reservedUsernames = ['admin', 'root', 'administrator', 'system', 'api', 'test', 'null', 'undefined'];
    if (reservedUsernames.some(reserved => reserved === cleanUsername)) {
        errors.push('Este nombre de usuario está reservado');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateUsername = validateUsername;
const validatePassword = (password) => {
    const errors = [];
    const warnings = [];
    if (!password || typeof password !== 'string') {
        errors.push('La contraseña es requerida');
        return { isValid: false, errors };
    }
    if (password.length < constants_1.VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
        errors.push(`La contraseña debe tener al menos ${constants_1.VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`);
    }
    if (password.length > constants_1.VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
        errors.push(`La contraseña no puede exceder ${constants_1.VALIDATION_RULES.PASSWORD_MAX_LENGTH} caracteres`);
    }
    let complexity = 0;
    if (/[a-z]/.test(password))
        complexity++;
    if (/[A-Z]/.test(password))
        complexity++;
    if (/[0-9]/.test(password))
        complexity++;
    if (/[^a-zA-Z0-9]/.test(password))
        complexity++;
    if (complexity < 3) {
        errors.push('La contraseña debe contener al menos 3 de los siguientes: minúsculas, mayúsculas, números, caracteres especiales');
    }
    const weakPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /admin/i
    ];
    for (const pattern of weakPatterns) {
        if (pattern.test(password)) {
            warnings.push('La contraseña contiene patrones comunes que la hacen vulnerable');
            break;
        }
    }
    if (/(.)\1{3,}/.test(password)) {
        warnings.push('La contraseña contiene demasiados caracteres repetidos');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
    };
};
exports.validatePassword = validatePassword;
const validatePhone = (phone) => {
    const errors = [];
    if (!phone || typeof phone !== 'string') {
        errors.push('El número de teléfono es requerido');
        return { isValid: false, errors };
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10) {
        errors.push('El número de teléfono debe tener al menos 10 dígitos');
    }
    if (cleanPhone.length > 15) {
        errors.push('El número de teléfono no puede exceder 15 dígitos');
    }
    if (!/^\d+$/.test(cleanPhone)) {
        errors.push('El número de teléfono solo puede contener dígitos');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePhone = validatePhone;
const validateLocationData = (data) => {
    const errors = [];
    if (data.latitude === undefined || data.longitude === undefined) {
        errors.push('Latitud y longitud son requeridas');
        return { isValid: false, errors };
    }
    const coordsValidation = (0, helpers_1.validateCoordinates)(data.latitude, data.longitude);
    if (!coordsValidation.isValid) {
        errors.push(...coordsValidation.errors);
    }
    if (data.accuracy !== undefined) {
        if (typeof data.accuracy !== 'number' || isNaN(data.accuracy)) {
            errors.push('La precisión debe ser un número válido');
        }
        else if (data.accuracy < 0) {
            errors.push('La precisión no puede ser negativa');
        }
        else if (data.accuracy > 10000) {
            errors.push('La precisión es demasiado baja (máximo 10km)');
        }
    }
    if (data.timestamp) {
        let date;
        if (typeof data.timestamp === 'string') {
            date = new Date(data.timestamp);
        }
        else {
            date = data.timestamp;
        }
        if (isNaN(date.getTime())) {
            errors.push('Timestamp inválido');
        }
        else {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            if (date > now) {
                errors.push('El timestamp no puede ser futuro');
            }
            if (date < oneHourAgo) {
                errors.push('El timestamp es demasiado antiguo (máximo 1 hora)');
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateLocationData = validateLocationData;
const validateFileUpload = (file, fileType = 'image') => {
    const errors = [];
    if (!file || !file.originalName || !file.mimetype || !file.size) {
        errors.push('Archivo inválido o corrupto');
        return { isValid: false, errors };
    }
    if (file.size > constants_1.FILE_CONFIG.MAX_FILE_SIZE) {
        errors.push(`El archivo excede el tamaño máximo de ${constants_1.FILE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (file.size === 0) {
        errors.push('El archivo está vacío');
    }
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedDocumentTypes = ['application/pdf', 'text/plain', 'application/msword'];
    const allowedTypes = fileType === 'image' ? allowedImageTypes : allowedDocumentTypes;
    if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
    }
    if (file.originalName.length > constants_1.VALIDATION_RULES.FILENAME_MAX_LENGTH) {
        errors.push(`El nombre del archivo no puede exceder ${constants_1.VALIDATION_RULES.FILENAME_MAX_LENGTH} caracteres`);
    }
    const extension = file.originalName.split('.').pop()?.toLowerCase();
    const mimeExtensionMap = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
        'text/plain': ['txt'],
        'application/msword': ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
    };
    const expectedExtensions = mimeExtensionMap[file.mimetype];
    if (expectedExtensions && extension && !expectedExtensions.some(ext => ext === extension)) {
        errors.push('La extensión del archivo no coincide con su tipo');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateFileUpload = validateFileUpload;
const validateDateRange = (startDate, endDate) => {
    const errors = [];
    let start, end;
    try {
        start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    }
    catch (error) {
        errors.push('Formato de fecha inválido');
        return { isValid: false, errors };
    }
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push('Fechas inválidas');
        return { isValid: false, errors };
    }
    if (start >= end) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 365 * 2) {
        errors.push('El rango de fechas no puede exceder 2 años');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateDateRange = validateDateRange;
//# sourceMappingURL=validators.js.map