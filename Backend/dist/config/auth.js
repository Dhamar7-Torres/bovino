"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.generateTokenResponse = exports.generateRandomString = exports.validateEmail = exports.validatePasswordStrength = exports.comparePassword = exports.hashPassword = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
let jwt;
let bcrypt;
let crypto;
try {
    jwt = require('jsonwebtoken');
    bcrypt = require('bcryptjs');
    crypto = require('crypto');
}
catch (error) {
    console.warn('⚠️  Dependencias de auth no instaladas aún. Ejecuta: npm install jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs');
}
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["RANCH_ADMIN"] = "ranch_admin";
    UserRole["RANCH_MANAGER"] = "ranch_manager";
    UserRole["VETERINARIAN"] = "veterinarian";
    UserRole["WORKER"] = "worker";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
const authConfig = {
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'cattle_management_access_secret_2025',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'cattle_management_refresh_secret_2025',
        accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
        refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
        issuer: process.env.JWT_ISSUER || 'CattleManagement',
        audience: process.env.JWT_AUDIENCE || 'cattle-users',
        algorithm: 'HS256'
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    },
    session: {
        maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'),
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000')
    },
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
    }
};
const generateAccessToken = (payload) => {
    if (!jwt) {
        throw new Error('JWT library not available');
    }
    const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000)
    };
    return jwt.sign(tokenPayload, authConfig.jwt.accessTokenSecret, {
        expiresIn: authConfig.jwt.accessTokenExpiration,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        algorithm: authConfig.jwt.algorithm
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    if (!jwt) {
        throw new Error('JWT library not available');
    }
    return jwt.sign({ userId, type: 'refresh' }, authConfig.jwt.refreshTokenSecret, {
        expiresIn: authConfig.jwt.refreshTokenExpiration,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        algorithm: authConfig.jwt.algorithm
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    if (!jwt) {
        throw new Error('JWT library not available');
    }
    try {
        return jwt.verify(token, authConfig.jwt.accessTokenSecret, {
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience,
            algorithms: [authConfig.jwt.algorithm]
        });
    }
    catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    if (!jwt) {
        throw new Error('JWT library not available');
    }
    try {
        return jwt.verify(token, authConfig.jwt.refreshTokenSecret, {
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience,
            algorithms: [authConfig.jwt.algorithm]
        });
    }
    catch (error) {
        throw new Error('Refresh token inválido o expirado');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const hashPassword = async (password) => {
    if (!bcrypt) {
        throw new Error('Bcrypt library not available');
    }
    try {
        return await bcrypt.hash(password, authConfig.bcrypt.saltRounds);
    }
    catch (error) {
        throw new Error('Error al encriptar la contraseña');
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    if (!bcrypt) {
        throw new Error('Bcrypt library not available');
    }
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (error) {
        throw new Error('Error al verificar la contraseña');
    }
};
exports.comparePassword = comparePassword;
const validatePasswordStrength = (password) => {
    const errors = [];
    const config = authConfig.password;
    if (password.length < config.minLength) {
        errors.push(`La contraseña debe tener al menos ${config.minLength} caracteres`);
    }
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }
    if (config.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('La contraseña debe contener al menos un símbolo especial');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const generateRandomString = (length = 32) => {
    if (!crypto) {
        return Math.random().toString(36).substring(2, length + 2);
    }
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};
exports.generateRandomString = generateRandomString;
const generateTokenResponse = (user) => {
    const accessToken = (0, exports.generateAccessToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
        ranchId: user.ranchId
    });
    const refreshToken = (0, exports.generateRefreshToken)(user.id);
    const expiresIn = getTokenExpirationTime(authConfig.jwt.accessTokenExpiration);
    return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
    };
};
exports.generateTokenResponse = generateTokenResponse;
const getTokenExpirationTime = (expiration) => {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        default: return 900;
    }
};
exports.default = authConfig;
//# sourceMappingURL=auth.js.map