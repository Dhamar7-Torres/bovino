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
exports.verifyDataIntegrity = exports.generateChecksum = exports.sanitizeInput = exports.validateSessionToken = exports.createSessionToken = exports.decryptPII = exports.encryptPII = exports.verifyHMAC = exports.createHMAC = exports.createHash = exports.generateTemporaryPassword = exports.generateVerificationCode = exports.generateSecureId = exports.generateSalt = exports.decryptData = exports.encryptData = exports.decodeJWT = exports.verifyJWT = exports.generateJWT = exports.verifyPassword = exports.hashPassword = void 0;
const crypto = __importStar(require("crypto"));
const constants_1 = require("./constants");
const ENCRYPTION_CONFIG = {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    SALT_LENGTH: 16,
    DEFAULT_ENCODING: 'hex',
    TEXT_ENCODING: 'utf8',
    PBKDF2_ITERATIONS: 100000,
};
const getEncryptionKey = () => {
    const secret = constants_1.SERVER_CONFIG.JWT_SECRET;
    return crypto.scryptSync(secret, 'salt', ENCRYPTION_CONFIG.KEY_LENGTH);
};
const hashPassword = async (password, options = {}) => {
    try {
        const { rounds = constants_1.SERVER_CONFIG.BCRYPT_ROUNDS, pepper = '' } = options;
        const passwordWithPepper = password + pepper;
        const salt = crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
        const iterations = Math.pow(2, rounds);
        const hash = crypto.pbkdf2Sync(passwordWithPepper, salt, iterations, 64, 'sha512');
        const combined = Buffer.concat([salt, hash]);
        return `$pbkdf2$${iterations}$${combined.toString('base64')}`;
    }
    catch (error) {
        console.error('❌ Error generando hash de contraseña:', error);
        throw new Error('Error en el proceso de hashing');
    }
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash, pepper = '') => {
    try {
        const passwordWithPepper = password + pepper;
        const parts = hash.split('$');
        if (parts.length !== 4 || parts[1] !== 'pbkdf2') {
            return false;
        }
        const iterations = parseInt(parts[2]);
        const combined = Buffer.from(parts[3], 'base64');
        const salt = combined.subarray(0, ENCRYPTION_CONFIG.SALT_LENGTH);
        const storedHash = combined.subarray(ENCRYPTION_CONFIG.SALT_LENGTH);
        const calculatedHash = crypto.pbkdf2Sync(passwordWithPepper, salt, iterations, 64, 'sha512');
        return crypto.timingSafeEqual(storedHash, calculatedHash);
    }
    catch (error) {
        console.error('❌ Error verificando contraseña:', error);
        return false;
    }
};
exports.verifyPassword = verifyPassword;
const createSimpleJWT = (payload, secret, expiresIn = 86400) => {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('base64url');
    return `${data}.${signature}`;
};
const verifySimpleJWT = (token, secret) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const data = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('base64url');
        if (signature !== expectedSignature) {
            return null;
        }
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return null;
        }
        return payload;
    }
    catch (error) {
        return null;
    }
};
const parseExpirationTime = (expiresIn) => {
    const units = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
    };
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 86400;
    }
    const [, value, unit] = match;
    return parseInt(value) * (units[unit] || 1);
};
const generateJWT = (payload, options = {}) => {
    try {
        const { expiresIn = constants_1.SERVER_CONFIG.JWT_EXPIRES_IN, audience = 'cattle-tracking-app', issuer = 'cattle-tracking-server' } = options;
        const expirationSeconds = parseExpirationTime(expiresIn);
        const enhancedPayload = {
            ...payload,
            aud: audience,
            iss: issuer
        };
        return createSimpleJWT(enhancedPayload, constants_1.SERVER_CONFIG.JWT_SECRET, expirationSeconds);
    }
    catch (error) {
        console.error('❌ Error generando JWT:', error);
        throw new Error('Error generando token de autenticación');
    }
};
exports.generateJWT = generateJWT;
const verifyJWT = (token) => {
    try {
        return verifySimpleJWT(token, constants_1.SERVER_CONFIG.JWT_SECRET);
    }
    catch (error) {
        console.error('❌ Error verificando JWT:', error);
        return null;
    }
};
exports.verifyJWT = verifyJWT;
const decodeJWT = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        return payload;
    }
    catch (error) {
        console.error('❌ Error decodificando JWT:', error);
        return null;
    }
};
exports.decodeJWT = decodeJWT;
const encryptData = (data) => {
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
        const cipher = crypto.createCipher(ENCRYPTION_CONFIG.ALGORITHM, key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag ? cipher.getAuthTag() : Buffer.alloc(16);
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }
    catch (error) {
        console.error('❌ Error encriptando datos:', error);
        throw new Error('Error en el proceso de encriptación');
    }
};
exports.encryptData = encryptData;
const decryptData = (encryptedData) => {
    try {
        const { encrypted, iv, tag } = encryptedData;
        const key = getEncryptionKey();
        const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.ALGORITHM, key);
        if (decipher.setAuthTag) {
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
        }
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('❌ Error desencriptando datos:', error);
        throw new Error('Error en el proceso de desencriptación');
    }
};
exports.decryptData = decryptData;
const generateSalt = (length = ENCRYPTION_CONFIG.SALT_LENGTH) => {
    return crypto.randomBytes(length).toString('hex');
};
exports.generateSalt = generateSalt;
const generateSecureId = (length = 16) => {
    return crypto.randomBytes(length).toString('hex');
};
exports.generateSecureId = generateSecureId;
const generateVerificationCode = (length = 6) => {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        code += digits[randomIndex];
    }
    return code;
};
exports.generateVerificationCode = generateVerificationCode;
const generateTemporaryPassword = (length = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    return password;
};
exports.generateTemporaryPassword = generateTemporaryPassword;
const createHash = (data, salt = '') => {
    try {
        const hash = crypto.createHash('sha256');
        hash.update(data + salt);
        return hash.digest('hex');
    }
    catch (error) {
        console.error('❌ Error creando hash:', error);
        throw new Error('Error en el proceso de hashing');
    }
};
exports.createHash = createHash;
const createHMAC = (data, secret = constants_1.SERVER_CONFIG.JWT_SECRET) => {
    try {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(data);
        return hmac.digest('hex');
    }
    catch (error) {
        console.error('❌ Error creando HMAC:', error);
        throw new Error('Error en el proceso de autenticación de mensaje');
    }
};
exports.createHMAC = createHMAC;
const verifyHMAC = (data, signature, secret = constants_1.SERVER_CONFIG.JWT_SECRET) => {
    try {
        const expectedSignature = (0, exports.createHMAC)(data, secret);
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    catch (error) {
        console.error('❌ Error verificando HMAC:', error);
        return false;
    }
};
exports.verifyHMAC = verifyHMAC;
const encryptPII = (data) => {
    try {
        const encryptedData = (0, exports.encryptData)(data);
        const combined = {
            e: encryptedData.encrypted,
            i: encryptedData.iv,
            t: encryptedData.tag
        };
        return Buffer.from(JSON.stringify(combined)).toString('base64');
    }
    catch (error) {
        console.error('❌ Error encriptando PII:', error);
        throw new Error('Error encriptando información personal');
    }
};
exports.encryptPII = encryptPII;
const decryptPII = (encryptedPII) => {
    try {
        const combined = JSON.parse(Buffer.from(encryptedPII, 'base64').toString());
        const encryptedData = {
            encrypted: combined.e,
            iv: combined.i,
            tag: combined.t
        };
        return (0, exports.decryptData)(encryptedData);
    }
    catch (error) {
        console.error('❌ Error desencriptando PII:', error);
        throw new Error('Error desencriptando información personal');
    }
};
exports.decryptPII = decryptPII;
const createSessionToken = (userId, sessionData = {}) => {
    const sessionInfo = {
        userId,
        timestamp: Date.now(),
        randomData: (0, exports.generateSecureId)(),
        ...sessionData
    };
    const tokenData = JSON.stringify(sessionInfo);
    return (0, exports.encryptPII)(tokenData);
};
exports.createSessionToken = createSessionToken;
const validateSessionToken = (sessionToken, maxAge = 24 * 60 * 60 * 1000) => {
    try {
        const decryptedData = (0, exports.decryptPII)(sessionToken);
        const sessionInfo = JSON.parse(decryptedData);
        const tokenAge = Date.now() - sessionInfo.timestamp;
        if (tokenAge > maxAge) {
            console.warn('⚠️ Token de sesión expirado');
            return null;
        }
        return sessionInfo;
    }
    catch (error) {
        console.error('❌ Error validando token de sesión:', error);
        return null;
    }
};
exports.validateSessionToken = validateSessionToken;
const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return '';
    }
    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[<>'"&]/g, (char) => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
        };
        return entities[char] || char;
    });
};
exports.sanitizeInput = sanitizeInput;
const generateChecksum = (data) => {
    const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
    return (0, exports.createHash)(serializedData);
};
exports.generateChecksum = generateChecksum;
const verifyDataIntegrity = (data, expectedChecksum) => {
    try {
        const actualChecksum = (0, exports.generateChecksum)(data);
        return crypto.timingSafeEqual(Buffer.from(actualChecksum), Buffer.from(expectedChecksum));
    }
    catch (error) {
        console.error('❌ Error verificando integridad de datos:', error);
        return false;
    }
};
exports.verifyDataIntegrity = verifyDataIntegrity;
//# sourceMappingURL=encryption.js.map