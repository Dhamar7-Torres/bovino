import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { 
  loginValidationRules,
  registerValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  changePasswordValidationRules,
  verifyEmailValidationRules,
  profileUpdateValidationRules
} from '../validators/Auth';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de autenticación
const authController = new AuthController();

// ============================================================================
// RUTAS PÚBLICAS (No requieren autenticación)
// ============================================================================

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión de usuario con email y contraseña
 * @access  Public
 * @body    { email: string, password: string, rememberMe?: boolean }
 */
router.post(
  '/login',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP cada 15 minutos
    message: 'Too many login attempts, please try again later'
  }),
  loginValidationRules(),
  validationMiddleware,
  authController.login
);

/**
 * @route   POST /auth/register
 * @desc    Registrar nuevo usuario en el sistema
 * @access  Public
 * @body    { name: string, email: string, password: string, confirmPassword: string, phone?: string, role?: string, ranchName?: string, ranchAddress?: string }
 */
router.post(
  '/register',
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros por IP cada hora
    message: 'Too many registration attempts, please try again later'
  }),
  registerValidationRules(),
  validationMiddleware,
  authController.register
);

/**
 * @route   POST /auth/forgot-password
 * @desc    Solicitar restablecimiento de contraseña
 * @access  Public
 * @body    { email: string }
 */
router.post(
  '/forgot-password',
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 solicitudes por IP cada hora
    message: 'Too many password reset attempts, please try again later'
  }),
  forgotPasswordValidationRules(),
  validationMiddleware,
  authController.forgotPassword
);

/**
 * @route   POST /auth/reset-password
 * @desc    Restablecer contraseña con token de verificación
 * @access  Public
 * @body    { token: string, password: string, confirmPassword: string }
 */
router.post(
  '/reset-password',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP cada 15 minutos
    message: 'Too many password reset attempts, please try again later'
  }),
  resetPasswordValidationRules(),
  validationMiddleware,
  authController.resetPassword
);

/**
 * @route   POST /auth/verify-email
 * @desc    Verificar email con token de verificación
 * @access  Public
 * @body    { token: string }
 */
router.post(
  '/verify-email',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos por IP cada 15 minutos
    message: 'Too many verification attempts, please try again later'
  }),
  verifyEmailValidationRules(),
  validationMiddleware,
  authController.verifyEmail
);

/**
 * @route   POST /auth/refresh
 * @desc    Refrescar token de acceso usando refresh token
 * @access  Public
 * @body    { refreshToken: string }
 */
router.post(
  '/refresh',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 intentos por IP cada 15 minutos
    message: 'Too many token refresh attempts, please try again later'
  }),
  authController.refreshToken
);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================================================

/**
 * @route   POST /auth/logout
 * @desc    Cerrar sesión del usuario y invalidar tokens
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route   GET /auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

/**
 * @route   PUT /auth/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { name?: string, phone?: string, preferences?: object, farmInfo?: object }
 */
router.put(
  '/profile',
  authMiddleware,
  profileUpdateValidationRules(),
  validationMiddleware,
  authController.updateProfile
);

/**
 * @route   POST /auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { currentPassword: string, newPassword: string, confirmPassword: string }
 */
router.post(
  '/change-password',
  authMiddleware,
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // máximo 3 intentos por usuario cada 15 minutos
    message: 'Too many password change attempts, please try again later'
  }),
  changePasswordValidationRules(),
  validationMiddleware,
  authController.changePassword
);

/**
 * @route   DELETE /auth/account
 * @desc    Eliminar cuenta del usuario autenticado
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { password: string, confirmation: string }
 */
router.delete(
  '/account',
  authMiddleware,
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 1, // máximo 1 intento por usuario cada hora
    message: 'Account deletion attempt limit reached, please try again later'
  }),
  authController.deleteAccount
);

// ============================================================================
// RUTAS ADMINISTRATIVAS (Requieren rol específico)
// ============================================================================

/**
 * @route   GET /auth/users
 * @desc    Obtener lista de usuarios (solo administradores)
 * @access  Private (Admin only)
 * @headers Authorization: Bearer <token>
 * @query   ?page=1&limit=10&search=term&role=ADMIN&status=active
 */
router.get(
  '/users',
  authMiddleware,
  authController.getUsers
);

/**
 * @route   PUT /auth/users/:userId/role
 * @desc    Actualizar rol de un usuario (solo administradores)
 * @access  Private (Admin only)
 * @headers Authorization: Bearer <token>
 * @body    { role: string }
 */
router.put(
  '/users/:userId/role',
  authMiddleware,
  authController.updateUserRole
);

/**
 * @route   PUT /auth/users/:userId/status
 * @desc    Activar/desactivar usuario (solo administradores)
 * @access  Private (Admin only)
 * @headers Authorization: Bearer <token>
 * @body    { status: 'active' | 'inactive' | 'suspended' }
 */
router.put(
  '/users/:userId/status',
  authMiddleware,
  authController.updateUserStatus
);

// ============================================================================
// RUTAS DE UTILIDAD
// ============================================================================

/**
 * @route   GET /auth/me
 * @desc    Verificar si el token es válido y obtener datos del usuario
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser
);

/**
 * @route   POST /auth/resend-verification
 * @desc    Reenviar email de verificación
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post(
  '/resend-verification',
  authMiddleware,
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // máximo 3 reenvíos por usuario cada 15 minutos
    message: 'Too many verification emails sent, please try again later'
  }),
  authController.resendVerificationEmail
);

/**
 * @route   POST /auth/check-email
 * @desc    Verificar si un email ya está registrado
 * @access  Public
 * @body    { email: string }
 */
router.post(
  '/check-email',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // máximo 20 verificaciones por IP cada 5 minutos
    message: 'Too many email checks, please try again later'
  }),
  authController.checkEmail
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DE AUTH
// ============================================================================

/**
 * Middleware de manejo de errores específico para autenticación
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Auth Route Error:', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos de autenticación
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'INVALID_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: 'TOKEN_EXPIRED'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      error: 'VALIDATION_ERROR',
      details: error.details
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;