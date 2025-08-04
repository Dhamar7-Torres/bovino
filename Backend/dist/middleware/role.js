"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMinimumRole = exports.getRolePermissions = exports.hasModulePermission = exports.requireComplexRole = exports.requireUserManagementAccess = exports.requireFinancialAccess = exports.requireVeterinaryAccess = exports.requireModulePermission = exports.requireExactRoles = exports.requireMinimumRole = exports.AuthorizationError = void 0;
const auth_1 = require("./auth");
class AuthorizationError extends Error {
    constructor(message, code = 'AUTHORIZATION_FAILED') {
        super(message);
        this.statusCode = 403;
        this.code = code;
    }
}
exports.AuthorizationError = AuthorizationError;
const ROLE_HIERARCHY = {
    [auth_1.UserRole.OWNER]: 6,
    [auth_1.UserRole.ADMIN]: 5,
    [auth_1.UserRole.MANAGER]: 4,
    [auth_1.UserRole.VETERINARIAN]: 3,
    [auth_1.UserRole.WORKER]: 2,
    [auth_1.UserRole.VIEWER]: 1
};
const DEFAULT_ROLE_PERMISSIONS = {
    [auth_1.UserRole.OWNER]: {
        cattle: ['create', 'read', 'update', 'delete', 'export', 'import'],
        health: ['create', 'read', 'update', 'delete', 'diagnose', 'prescribe'],
        vaccinations: ['create', 'read', 'update', 'delete', 'schedule', 'administer'],
        reproduction: ['create', 'read', 'update', 'delete', 'track', 'plan'],
        production: ['create', 'read', 'update', 'delete', 'analyze'],
        inventory: ['create', 'read', 'update', 'delete', 'order', 'audit'],
        finances: ['create', 'read', 'update', 'delete', 'budget', 'approve'],
        reports: ['create', 'read', 'update', 'delete', 'export', 'share'],
        maps: ['create', 'read', 'update', 'delete', 'track'],
        users: ['create', 'read', 'update', 'delete', 'invite', 'suspend'],
        ranch: ['create', 'read', 'update', 'delete', 'configure']
    },
    [auth_1.UserRole.ADMIN]: {
        cattle: ['create', 'read', 'update', 'delete', 'export'],
        health: ['create', 'read', 'update', 'delete', 'diagnose'],
        vaccinations: ['create', 'read', 'update', 'delete', 'schedule', 'administer'],
        reproduction: ['create', 'read', 'update', 'delete', 'track'],
        production: ['create', 'read', 'update', 'delete', 'analyze'],
        inventory: ['create', 'read', 'update', 'delete', 'order'],
        finances: ['create', 'read', 'update', 'budget'],
        reports: ['create', 'read', 'update', 'export'],
        maps: ['create', 'read', 'update', 'track'],
        users: ['create', 'read', 'update', 'invite'],
        ranch: ['read', 'update', 'configure']
    },
    [auth_1.UserRole.MANAGER]: {
        cattle: ['create', 'read', 'update', 'export'],
        health: ['create', 'read', 'update'],
        vaccinations: ['create', 'read', 'update', 'schedule'],
        reproduction: ['create', 'read', 'update', 'track'],
        production: ['create', 'read', 'update', 'analyze'],
        inventory: ['create', 'read', 'update'],
        finances: ['read', 'budget'],
        reports: ['create', 'read', 'export'],
        maps: ['read', 'update', 'track'],
        users: ['read'],
        ranch: ['read', 'update']
    },
    [auth_1.UserRole.VETERINARIAN]: {
        cattle: ['read', 'update'],
        health: ['create', 'read', 'update', 'diagnose', 'prescribe'],
        vaccinations: ['create', 'read', 'update', 'administer'],
        reproduction: ['read', 'update'],
        production: ['read'],
        inventory: ['read', 'update'],
        finances: ['read'],
        reports: ['create', 'read'],
        maps: ['read', 'track'],
        users: ['read'],
        ranch: ['read']
    },
    [auth_1.UserRole.WORKER]: {
        cattle: ['read', 'update'],
        health: ['read', 'update'],
        vaccinations: ['read', 'administer'],
        reproduction: ['read', 'update'],
        production: ['read', 'update'],
        inventory: ['read'],
        finances: [],
        reports: ['read'],
        maps: ['read', 'track'],
        users: [],
        ranch: ['read']
    },
    [auth_1.UserRole.VIEWER]: {
        cattle: ['read'],
        health: ['read'],
        vaccinations: ['read'],
        reproduction: ['read'],
        production: ['read'],
        inventory: ['read'],
        finances: [],
        reports: ['read'],
        maps: ['read'],
        users: [],
        ranch: ['read']
    }
};
const requireMinimumRole = (minimumRole) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
        }
        const userRoleLevel = ROLE_HIERARCHY[req.userRole];
        const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];
        if (userRoleLevel < requiredRoleLevel) {
            return next(new AuthorizationError(`Se requiere rol de ${minimumRole} o superior`, 'INSUFFICIENT_ROLE'));
        }
        next();
    };
};
exports.requireMinimumRole = requireMinimumRole;
const requireExactRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
        }
        if (!allowedRoles.includes(req.userRole)) {
            return next(new AuthorizationError(`Acceso restringido a roles: ${allowedRoles.join(', ')}`, 'ROLE_NOT_ALLOWED'));
        }
        next();
    };
};
exports.requireExactRoles = requireExactRoles;
const requireModulePermission = (module, action) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
        }
        const rolePermissions = DEFAULT_ROLE_PERMISSIONS[req.userRole];
        const modulePermissions = rolePermissions[module];
        if (!modulePermissions || !modulePermissions.includes(action)) {
            return next(new AuthorizationError(`Sin permisos para realizar '${action}' en módulo '${module}'`, 'MODULE_PERMISSION_DENIED'));
        }
        next();
    };
};
exports.requireModulePermission = requireModulePermission;
const requireVeterinaryAccess = (req, res, next) => {
    if (!req.user || !req.userRole) {
        return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
    }
    const veterinaryRoles = [
        auth_1.UserRole.VETERINARIAN,
        auth_1.UserRole.MANAGER,
        auth_1.UserRole.ADMIN,
        auth_1.UserRole.OWNER
    ];
    if (!veterinaryRoles.includes(req.userRole)) {
        return next(new AuthorizationError('Se requiere acceso veterinario para esta operación', 'VETERINARY_ACCESS_REQUIRED'));
    }
    next();
};
exports.requireVeterinaryAccess = requireVeterinaryAccess;
const requireFinancialAccess = (req, res, next) => {
    if (!req.user || !req.userRole) {
        return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
    }
    const financialRoles = [
        auth_1.UserRole.MANAGER,
        auth_1.UserRole.ADMIN,
        auth_1.UserRole.OWNER
    ];
    if (!financialRoles.includes(req.userRole)) {
        return next(new AuthorizationError('Se requiere acceso de gestión para información financiera', 'FINANCIAL_ACCESS_REQUIRED'));
    }
    next();
};
exports.requireFinancialAccess = requireFinancialAccess;
const requireUserManagementAccess = (req, res, next) => {
    if (!req.user || !req.userRole) {
        return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
    }
    const managementRoles = [
        auth_1.UserRole.ADMIN,
        auth_1.UserRole.OWNER
    ];
    if (!managementRoles.includes(req.userRole)) {
        return next(new AuthorizationError('Se requiere acceso de administración para gestión de usuarios', 'USER_MANAGEMENT_ACCESS_REQUIRED'));
    }
    next();
};
exports.requireUserManagementAccess = requireUserManagementAccess;
const requireComplexRole = (conditions) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return next(new AuthorizationError('Usuario no autenticado', 'NOT_AUTHENTICATED'));
        }
        if (conditions.minimumRole) {
            const userRoleLevel = ROLE_HIERARCHY[req.userRole];
            const requiredRoleLevel = ROLE_HIERARCHY[conditions.minimumRole];
            if (userRoleLevel < requiredRoleLevel) {
                return next(new AuthorizationError(`Se requiere rol de ${conditions.minimumRole} o superior`, 'INSUFFICIENT_ROLE'));
            }
        }
        if (conditions.exactRoles && !conditions.exactRoles.includes(req.userRole)) {
            return next(new AuthorizationError(`Acceso restringido a roles: ${conditions.exactRoles.join(', ')}`, 'ROLE_NOT_ALLOWED'));
        }
        if (conditions.modulePermissions) {
            const rolePermissions = DEFAULT_ROLE_PERMISSIONS[req.userRole];
            for (const permission of conditions.modulePermissions) {
                const modulePermissions = rolePermissions[permission.module];
                if (!modulePermissions || !modulePermissions.includes(permission.action)) {
                    return next(new AuthorizationError(`Sin permisos para realizar '${permission.action}' en módulo '${permission.module}'`, 'MODULE_PERMISSION_DENIED'));
                }
            }
        }
        if (conditions.veterinaryAccess) {
            const veterinaryRoles = [
                auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER
            ];
            if (!veterinaryRoles.includes(req.userRole)) {
                return next(new AuthorizationError('Se requiere acceso veterinario', 'VETERINARY_ACCESS_REQUIRED'));
            }
        }
        if (conditions.financialAccess) {
            const financialRoles = [auth_1.UserRole.MANAGER, auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER];
            if (!financialRoles.includes(req.userRole)) {
                return next(new AuthorizationError('Se requiere acceso financiero', 'FINANCIAL_ACCESS_REQUIRED'));
            }
        }
        if (conditions.userManagementAccess) {
            const managementRoles = [auth_1.UserRole.ADMIN, auth_1.UserRole.OWNER];
            if (!managementRoles.includes(req.userRole)) {
                return next(new AuthorizationError('Se requiere acceso de administración', 'USER_MANAGEMENT_ACCESS_REQUIRED'));
            }
        }
        next();
    };
};
exports.requireComplexRole = requireComplexRole;
const hasModulePermission = (userRole, module, action) => {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
    const modulePermissions = rolePermissions[module];
    return modulePermissions && modulePermissions.includes(action);
};
exports.hasModulePermission = hasModulePermission;
const getRolePermissions = (userRole) => {
    return DEFAULT_ROLE_PERMISSIONS[userRole];
};
exports.getRolePermissions = getRolePermissions;
const hasMinimumRole = (userRole, requiredRole) => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
exports.hasMinimumRole = hasMinimumRole;
//# sourceMappingURL=role.js.map