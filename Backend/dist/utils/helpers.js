"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = exports.getEventIcon = exports.truncateText = exports.generateColorFromText = exports.calculateHealthStatus = exports.generateSlug = exports.formatNumber = exports.getNextVaccinationDate = exports.generateDateRange = exports.validateEmail = exports.validateCattleWeight = exports.validateCattleTag = exports.calculatePagination = exports.validateCoordinates = exports.calculateDistance = exports.calculateAge = exports.formatDate = void 0;
const constants_1 = require("./constants");
const formatDate = (date, format = constants_1.DATE_FORMATS.DISPLAY_DATE) => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) {
            return 'Fecha inválida';
        }
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        switch (format) {
            case constants_1.DATE_FORMATS.DATE_ONLY:
                return `${year}-${month}-${day}`;
            case constants_1.DATE_FORMATS.DATETIME:
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            case constants_1.DATE_FORMATS.DISPLAY_DATE:
                return `${day}/${month}/${year}`;
            case constants_1.DATE_FORMATS.DISPLAY_DATETIME:
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            case constants_1.DATE_FORMATS.TIME_ONLY:
                return `${hours}:${minutes}:${seconds}`;
            default:
                return dateObj.toLocaleDateString('es-ES');
        }
    }
    catch (error) {
        console.error('❌ Error formateando fecha:', error);
        return 'Error en fecha';
    }
};
exports.formatDate = formatDate;
const calculateAge = (birthDate) => {
    try {
        const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
        const now = new Date();
        if (isNaN(birth.getTime()) || birth > now) {
            return {
                years: 0,
                months: 0,
                days: 0,
                totalDays: 0,
                category: 'calf'
            };
        }
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) {
            months--;
            const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += daysInPrevMonth;
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        let category;
        if (totalDays < 365) {
            category = 'calf';
        }
        else if (totalDays < (2 * 365)) {
            category = 'young';
        }
        else if (totalDays < (8 * 365)) {
            category = 'adult';
        }
        else {
            category = 'senior';
        }
        return {
            years,
            months,
            days,
            totalDays,
            category
        };
    }
    catch (error) {
        console.error('❌ Error calculando edad:', error);
        return {
            years: 0,
            months: 0,
            days: 0,
            totalDays: 0,
            category: 'calf'
        };
    }
};
exports.calculateAge = calculateAge;
const calculateDistance = (coord1, coord2, unit = 'km') => {
    try {
        const R = unit === 'km' ? 6371 : 3959;
        const lat1Rad = coord1.latitude * (Math.PI / 180);
        const lat2Rad = coord2.latitude * (Math.PI / 180);
        const deltaLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
        const deltaLng = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return {
            distance: Math.round(distance * 100) / 100,
            unit
        };
    }
    catch (error) {
        console.error('❌ Error calculando distancia:', error);
        return { distance: 0, unit };
    }
};
exports.calculateDistance = calculateDistance;
const validateCoordinates = (latitude, longitude) => {
    const errors = [];
    if (typeof latitude !== 'number' || isNaN(latitude)) {
        errors.push('La latitud debe ser un número válido');
    }
    else if (latitude < constants_1.GEOLOCATION.MIN_LATITUDE || latitude > constants_1.GEOLOCATION.MAX_LATITUDE) {
        errors.push(`La latitud debe estar entre ${constants_1.GEOLOCATION.MIN_LATITUDE} y ${constants_1.GEOLOCATION.MAX_LATITUDE}`);
    }
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        errors.push('La longitud debe ser un número válido');
    }
    else if (longitude < constants_1.GEOLOCATION.MIN_LONGITUDE || longitude > constants_1.GEOLOCATION.MAX_LONGITUDE) {
        errors.push(`La longitud debe estar entre ${constants_1.GEOLOCATION.MIN_LONGITUDE} y ${constants_1.GEOLOCATION.MAX_LONGITUDE}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateCoordinates = validateCoordinates;
const calculatePagination = (totalItems, page = constants_1.PAGINATION.DEFAULT_PAGE, limit = constants_1.PAGINATION.DEFAULT_LIMIT) => {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(Math.max(1, Math.floor(limit)), constants_1.PAGINATION.MAX_LIMIT);
    const validTotal = Math.max(0, Math.floor(totalItems));
    const totalPages = Math.ceil(validTotal / validLimit);
    const currentPage = Math.min(validPage, totalPages || 1);
    return {
        page: currentPage,
        limit: validLimit,
        totalPages: totalPages,
        totalItems: validTotal,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};
exports.calculatePagination = calculatePagination;
const validateCattleTag = (tag) => {
    const errors = [];
    if (!tag || typeof tag !== 'string') {
        errors.push('El tag es requerido');
        return { isValid: false, errors };
    }
    const cleanTag = tag.trim();
    if (cleanTag.length < constants_1.VALIDATION_RULES.CATTLE_TAG_MIN_LENGTH) {
        errors.push(`El tag debe tener al menos ${constants_1.VALIDATION_RULES.CATTLE_TAG_MIN_LENGTH} caracteres`);
    }
    if (cleanTag.length > constants_1.VALIDATION_RULES.CATTLE_TAG_MAX_LENGTH) {
        errors.push(`El tag no puede tener más de ${constants_1.VALIDATION_RULES.CATTLE_TAG_MAX_LENGTH} caracteres`);
    }
    const validTagPattern = /^[A-Za-z0-9\-_]+$/;
    if (!validTagPattern.test(cleanTag)) {
        errors.push('El tag solo puede contener letras, números, guiones y guiones bajos');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateCattleTag = validateCattleTag;
const validateCattleWeight = (weight) => {
    const errors = [];
    if (typeof weight !== 'number' || isNaN(weight)) {
        errors.push('El peso debe ser un número válido');
        return { isValid: false, errors };
    }
    if (weight < constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MIN) {
        errors.push(`El peso mínimo es ${constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MIN} kg`);
    }
    if (weight > constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MAX) {
        errors.push(`El peso máximo es ${constants_1.VALIDATION_RULES.CATTLE_WEIGHT_MAX} kg`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateCattleWeight = validateCattleWeight;
const validateEmail = (email) => {
    const errors = [];
    if (!email || typeof email !== 'string') {
        errors.push('El email es requerido');
        return { isValid: false, errors };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.length > constants_1.VALIDATION_RULES.EMAIL_MAX_LENGTH) {
        errors.push(`El email no puede tener más de ${constants_1.VALIDATION_RULES.EMAIL_MAX_LENGTH} caracteres`);
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
        errors.push('El formato del email no es válido');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateEmail = validateEmail;
const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};
exports.generateDateRange = generateDateRange;
const getNextVaccinationDate = (lastVaccinationDate, vaccineType) => {
    try {
        const vaccinationIntervals = {
            [constants_1.VACCINE_TYPES.FOOT_AND_MOUTH]: 6,
            [constants_1.VACCINE_TYPES.BRUCELLOSIS]: 12,
            [constants_1.VACCINE_TYPES.RABIES]: 12,
            [constants_1.VACCINE_TYPES.CLOSTRIDIUM]: 12,
            [constants_1.VACCINE_TYPES.BLACKLEG]: 12,
            [constants_1.VACCINE_TYPES.ANTHRAX]: 12,
            [constants_1.VACCINE_TYPES.IBR]: 12,
            [constants_1.VACCINE_TYPES.BVD]: 12,
            [constants_1.VACCINE_TYPES.LEPTOSPIROSIS]: 12,
            [constants_1.VACCINE_TYPES.FIVE_WAY]: 12,
            [constants_1.VACCINE_TYPES.SEVEN_WAY]: 12,
            [constants_1.VACCINE_TYPES.NINE_WAY]: 12,
        };
        const interval = vaccinationIntervals[vaccineType] || 12;
        const nextDate = new Date(lastVaccinationDate);
        nextDate.setMonth(nextDate.getMonth() + interval);
        return nextDate;
    }
    catch (error) {
        console.error('❌ Error calculando próxima vacunación:', error);
        return null;
    }
};
exports.getNextVaccinationDate = getNextVaccinationDate;
const formatNumber = (number, decimals = 0) => {
    try {
        return number.toLocaleString('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    catch (error) {
        return number.toString();
    }
};
exports.formatNumber = formatNumber;
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.generateSlug = generateSlug;
const calculateHealthStatus = (events) => {
    if (!events || events.length === 0) {
        return constants_1.CATTLE_HEALTH_STATUS.UNKNOWN;
    }
    const sortedEvents = events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHealthEvents = sortedEvents.filter(event => new Date(event.event_date) >= thirtyDaysAgo &&
        (event.event_type === constants_1.EVENT_TYPES.ILLNESS ||
            event.event_type === constants_1.EVENT_TYPES.TREATMENT ||
            event.event_type === constants_1.EVENT_TYPES.INJURY));
    if (recentHealthEvents.length === 0) {
        return constants_1.CATTLE_HEALTH_STATUS.HEALTHY;
    }
    const latestEvent = recentHealthEvents[0];
    switch (latestEvent.event_type) {
        case constants_1.EVENT_TYPES.ILLNESS:
            return constants_1.CATTLE_HEALTH_STATUS.SICK;
        case constants_1.EVENT_TYPES.TREATMENT:
            return constants_1.CATTLE_HEALTH_STATUS.RECOVERING;
        case constants_1.EVENT_TYPES.INJURY:
            return constants_1.CATTLE_HEALTH_STATUS.SICK;
        default:
            return constants_1.CATTLE_HEALTH_STATUS.HEALTHY;
    }
};
exports.calculateHealthStatus = calculateHealthStatus;
const generateColorFromText = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
};
exports.generateColorFromText = generateColorFromText;
const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
};
exports.truncateText = truncateText;
const getEventIcon = (eventType) => {
    const iconMap = {
        [constants_1.EVENT_TYPES.VACCINATION]: 'syringe',
        [constants_1.EVENT_TYPES.ILLNESS]: 'thermometer',
        [constants_1.EVENT_TYPES.TREATMENT]: 'pill',
        [constants_1.EVENT_TYPES.PREGNANCY_CHECK]: 'heart',
        [constants_1.EVENT_TYPES.BIRTH]: 'baby',
        [constants_1.EVENT_TYPES.BREEDING]: 'heart-handshake',
        [constants_1.EVENT_TYPES.INJURY]: 'bandage',
        [constants_1.EVENT_TYPES.SURGERY]: 'scissors',
        [constants_1.EVENT_TYPES.DEWORMING]: 'bug',
        [constants_1.EVENT_TYPES.WEIGHT_CHECK]: 'scale',
        [constants_1.EVENT_TYPES.LOCATION_UPDATE]: 'map-pin',
        [constants_1.EVENT_TYPES.TRANSFER]: 'truck',
        [constants_1.EVENT_TYPES.DEATH]: 'skull',
        [constants_1.EVENT_TYPES.SALE]: 'dollar-sign',
        [constants_1.EVENT_TYPES.PURCHASE]: 'shopping-cart',
    };
    return iconMap[eventType] || 'calendar';
};
exports.getEventIcon = getEventIcon;
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
exports.debounce = debounce;
//# sourceMappingURL=helpers.js.map