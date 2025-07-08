import { api } from "./api";
import { USER_ENDPOINTS } from "../constants/urls";
import { mapsService } from "./mapsService";
import {
  User,
  UserRole,
  Permission,
  UserSession,
  DeviceInfo,
  GeoLocation,
  SubscriptionInfo,
  FarmInfo,
  UserPreferences,
  USER_ROLE_LABELS,
  hasPermission,
  isSubscriptionActive,
  getFullName,
  getUserInitials,
} from "../types/auth";

// Interfaces adicionales para gestión de usuarios
interface DashboardConfig {
  layout: string;
  widgets: string[];
  preferences: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "team";
  shareLocation: boolean;
  shareActivity: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordExpiry: number;
  loginAlerts: boolean;
  sessionTimeout: number;
}

interface UserProfile {
  personalInfo: PersonalInfo;
  farmInfo: FarmInfo;
  subscription: SubscriptionInfo;
  preferences: UserPreferences;
  security: SecuritySettings;
  activity: UserActivity;
  statistics: UserStatistics;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: UserAddress;
  emergencyContact?: EmergencyContact;
  professionalInfo?: ProfessionalInfo;
}

interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface ProfessionalInfo {
  title?: string;
  veterinaryLicense?: string;
  yearsOfExperience?: number;
  specializations?: string[];
  certifications?: Certification[];
}

interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

interface UserActivity {
  lastLogin: string;
  lastActiveAt: string;
  totalLogins: number;
  averageSessionDuration: number; // minutos
  mostUsedFeatures: FeatureUsage[];
  loginHistory: LoginRecord[];
  activityTimeline: ActivityEvent[];
}

interface FeatureUsage {
  feature: string;
  usageCount: number;
  lastUsed: string;
  averageTimeSpent: number; // minutos
}

interface LoginRecord {
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  device: DeviceInfo;
  success: boolean;
  failureReason?: string;
}

interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  deviceId?: string;
}

interface UserStatistics {
  cattleManaged: number;
  vaccinationsAdministered: number;
  illnessesReported: number;
  reportsGenerated: number;
  farmVisits: number;
  dataAccuracy: number; // porcentaje
  systemUsageScore: number; // 0-100
  contributionLevel: ContributionLevel;
}

interface TeamMember {
  user: User;
  joinedAt: string;
  invitedBy: string;
  status: TeamMemberStatus;
  permissions: Permission[];
  lastActivity: string;
  contributionMetrics: ContributionMetrics;
}

interface ContributionMetrics {
  tasksCompleted: number;
  dataEntriesCreated: number;
  reportsGenerated: number;
  issuesResolved: number;
  helpfulRating: number; // 0-5
}

interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: InvitationStatus;
  message?: string;
  permissions?: Permission[];
}

interface ProfileUpdateRequest {
  personalInfo?: Partial<PersonalInfo>;
  farmInfo?: Partial<FarmInfo>;
  preferences?: Partial<UserPreferences>;
  security?: Partial<SecuritySettings>;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface TwoFactorSetup {
  enabled: boolean;
  method: "2fa_app" | "sms" | "email";
  backupCodes?: string[];
  phoneNumber?: string;
  appSecretKey?: string;
}

// Enums
enum ActivityType {
  LOGIN = "login",
  LOGOUT = "logout",
  CATTLE_CREATED = "cattle_created",
  CATTLE_UPDATED = "cattle_updated",
  VACCINATION_RECORDED = "vaccination_recorded",
  ILLNESS_REPORTED = "illness_reported",
  REPORT_GENERATED = "report_generated",
  PROFILE_UPDATED = "profile_updated",
  SETTINGS_CHANGED = "settings_changed",
  PASSWORD_CHANGED = "password_changed",
  TEAM_MEMBER_INVITED = "team_member_invited",
  PERMISSION_CHANGED = "permission_changed",
}

enum ContributionLevel {
  BEGINNER = "beginner",
  CONTRIBUTOR = "contributor",
  EXPERT = "expert",
  MASTER = "master",
}

enum TeamMemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

// Servicio principal para gestión de usuarios
export class UserService {
  private static instance: UserService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 10 * 60 * 1000; // 10 minutos
  private currentUser: User | null = null;

  // Singleton pattern
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // ============================================================================
  // GESTIÓN DE CACHÉ
  // ============================================================================

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private clearCache(): void {
    this.cache.clear();
    console.log("🧹 Caché de usuarios limpiado");
  }

  // ============================================================================
  // GESTIÓN DE PERFIL DE USUARIO
  // ============================================================================

  // Obtener perfil completo del usuario actual
  public async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const cacheKey = this.getCacheKey("current_user_profile");
      const cachedData = this.getCache(cacheKey);

      if (cachedData) {
        console.log("📦 Perfil de usuario obtenido del caché");
        return cachedData;
      }

      console.log("👤 Obteniendo perfil de usuario actual...");

      const response = await api.get<UserProfile>(USER_ENDPOINTS.PROFILE);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo perfil de usuario");
      }

      this.setCache(cacheKey, response.data);
      this.currentUser = response.data.personalInfo as any; // Actualizar usuario actual

      console.log("✅ Perfil de usuario obtenido exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo perfil de usuario:", error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  public async updateUserProfile(
    updates: ProfileUpdateRequest
  ): Promise<UserProfile> {
    try {
      console.log("📝 Actualizando perfil de usuario...");

      // Agregar ubicación si se actualiza la dirección
      if (
        updates.personalInfo?.address &&
        !updates.personalInfo.address.coordinates
      ) {
        try {
          const address = `${updates.personalInfo.address.street}, ${updates.personalInfo.address.city}, ${updates.personalInfo.address.state}`;
          const geocodingResults = await mapsService.geocodeAddress(address);

          if (geocodingResults.length > 0) {
            updates.personalInfo.address.coordinates = {
              latitude: geocodingResults[0].location.latitude,
              longitude: geocodingResults[0].location.longitude,
            };
          }
        } catch (geocodingError) {
          console.warn(
            "⚠️ No se pudo geocodificar la dirección:",
            geocodingError
          );
        }
      }

      const response = await api.put<UserProfile>(
        USER_ENDPOINTS.UPDATE_PROFILE,
        updates
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando perfil de usuario");
      }

      this.clearCache(); // Limpiar caché después de actualizar
      console.log("✅ Perfil de usuario actualizado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando perfil de usuario:", error);
      throw error;
    }
  }

  // Cambiar contraseña
  public async changePassword(
    passwordData: PasswordChangeRequest
  ): Promise<void> {
    try {
      console.log("🔐 Cambiando contraseña de usuario...");

      // Validar que las contraseñas nuevas coincidan
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        throw new Error("Las contraseñas nuevas no coinciden");
      }

      // Validar fortaleza de la contraseña
      if (!this.validatePasswordStrength(passwordData.newPassword)) {
        throw new Error(
          "La contraseña no cumple con los requisitos de seguridad"
        );
      }

      const response = await api.post("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || "Error cambiando contraseña");
      }

      // Registrar evento de seguridad
      await this.logSecurityEvent("password_changed", {
        timestamp: new Date().toISOString(),
        method: "user_initiated",
      });

      console.log("✅ Contraseña cambiada exitosamente");
    } catch (error) {
      console.error("❌ Error cambiando contraseña:", error);
      throw error;
    }
  }

  // Configurar autenticación de dos factores
  public async setupTwoFactor(
    method: "2fa_app" | "sms" | "email",
    phoneNumber?: string
  ): Promise<TwoFactorSetup> {
    try {
      console.log(`🔐 Configurando autenticación de dos factores: ${method}`);

      const response = await api.post<TwoFactorSetup>("/user/setup-2fa", {
        method,
        phoneNumber,
      });

      if (!response.success || !response.data) {
        throw new Error("Error configurando autenticación de dos factores");
      }

      // Registrar evento de seguridad
      await this.logSecurityEvent("2fa_enabled", {
        method,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Autenticación de dos factores configurada exitosamente");
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error configurando autenticación de dos factores:",
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE EQUIPO Y COLABORADORES
  // ============================================================================

  // Obtener miembros del equipo
  public async getTeamMembers(): Promise<TeamMember[]> {
    try {
      console.log("👥 Obteniendo miembros del equipo...");

      const response = await api.get<TeamMember[]>("/user/team-members");

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo miembros del equipo");
      }

      console.log(`✅ ${response.data.length} miembros del equipo obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo miembros del equipo:", error);
      throw error;
    }
  }

  // Invitar nuevo miembro al equipo
  public async inviteTeamMember(
    email: string,
    role: UserRole,
    permissions?: Permission[],
    message?: string
  ): Promise<UserInvitation> {
    try {
      console.log(`📧 Invitando nuevo miembro del equipo: ${email}`);

      const response = await api.post<UserInvitation>("/user/invite-member", {
        email,
        role,
        permissions,
        message,
      });

      if (!response.success || !response.data) {
        throw new Error("Error enviando invitación");
      }

      // Registrar actividad
      await this.logActivity(ActivityType.TEAM_MEMBER_INVITED, {
        invitedEmail: email,
        role,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Invitación enviada exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error enviando invitación:", error);
      throw error;
    }
  }

  // Actualizar permisos de miembro del equipo
  public async updateTeamMemberPermissions(
    userId: string,
    permissions: Permission[]
  ): Promise<void> {
    try {
      console.log(`🔐 Actualizando permisos del usuario: ${userId}`);

      const response = await api.put(
        `/user/team-members/${userId}/permissions`,
        {
          permissions,
        }
      );

      if (!response.success) {
        throw new Error("Error actualizando permisos");
      }

      // Registrar actividad
      await this.logActivity(ActivityType.PERMISSION_CHANGED, {
        targetUserId: userId,
        newPermissions: permissions.map((p) => p.name),
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Permisos actualizados exitosamente");
    } catch (error) {
      console.error("❌ Error actualizando permisos:", error);
      throw error;
    }
  }

  // Remover miembro del equipo
  public async removeTeamMember(userId: string): Promise<void> {
    try {
      console.log(`🚫 Removiendo miembro del equipo: ${userId}`);

      const response = await api.delete(`/user/team-members/${userId}`);

      if (!response.success) {
        throw new Error("Error removiendo miembro del equipo");
      }

      console.log("✅ Miembro del equipo removido exitosamente");
    } catch (error) {
      console.error("❌ Error removiendo miembro del equipo:", error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE ACTIVIDAD Y ESTADÍSTICAS
  // ============================================================================

  // Obtener actividad del usuario
  public async getUserActivity(
    userId?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<UserActivity> {
    try {
      console.log("📊 Obteniendo actividad del usuario...");

      const params: any = {};
      if (userId) params.userId = userId;
      if (dateRange) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const response = await api.get<UserActivity>("/user/activity", {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo actividad del usuario");
      }

      console.log("✅ Actividad del usuario obtenida exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo actividad del usuario:", error);
      throw error;
    }
  }

  // Obtener estadísticas del usuario
  public async getUserStatistics(userId?: string): Promise<UserStatistics> {
    try {
      console.log("📈 Obteniendo estadísticas del usuario...");

      const endpoint = userId
        ? `/user/statistics/${userId}`
        : "/user/statistics";

      const response = await api.get<UserStatistics>(endpoint);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo estadísticas del usuario");
      }

      console.log("✅ Estadísticas del usuario obtenidas exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas del usuario:", error);
      throw error;
    }
  }

  // Registrar evento de actividad
  public async logActivity(type: ActivityType, metadata?: any): Promise<void> {
    try {
      await api.post("/user/log-activity", {
        type,
        timestamp: new Date().toISOString(),
        metadata,
      });
    } catch (error) {
      console.warn("⚠️ No se pudo registrar la actividad:", error);
      // No lanzar error para no afectar la funcionalidad principal
    }
  }

  // Registrar evento de seguridad
  public async logSecurityEvent(
    eventType: string,
    metadata?: any
  ): Promise<void> {
    try {
      await api.post("/user/log-security-event", {
        eventType,
        timestamp: new Date().toISOString(),
        metadata,
      });
    } catch (error) {
      console.warn("⚠️ No se pudo registrar el evento de seguridad:", error);
    }
  }

  // ============================================================================
  // GESTIÓN DE SESIONES
  // ============================================================================

  // Obtener sesiones activas
  public async getActiveSessions(): Promise<UserSession[]> {
    try {
      console.log("🔗 Obteniendo sesiones activas...");

      const response = await api.get<UserSession[]>("/user/sessions");

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo sesiones activas");
      }

      console.log(`✅ ${response.data.length} sesiones activas obtenidas`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo sesiones activas:", error);
      throw error;
    }
  }

  // Terminar sesión específica
  public async terminateSession(sessionId: string): Promise<void> {
    try {
      console.log(`🔐 Terminando sesión: ${sessionId}`);

      const response = await api.delete(`/user/sessions/${sessionId}`);

      if (!response.success) {
        throw new Error("Error terminando sesión");
      }

      console.log("✅ Sesión terminada exitosamente");
    } catch (error) {
      console.error("❌ Error terminando sesión:", error);
      throw error;
    }
  }

  // Terminar todas las sesiones (excepto la actual)
  public async terminateAllSessions(): Promise<void> {
    try {
      console.log("🔐 Terminando todas las sesiones...");

      const response = await api.delete("/user/sessions/all");

      if (!response.success) {
        throw new Error("Error terminando todas las sesiones");
      }

      console.log("✅ Todas las sesiones terminadas exitosamente");
    } catch (error) {
      console.error("❌ Error terminando todas las sesiones:", error);
      throw error;
    }
  }

  // ============================================================================
  // CONFIGURACIÓN Y PREFERENCIAS
  // ============================================================================

  // Obtener preferencias del usuario
  public async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<UserPreferences>(
        USER_ENDPOINTS.PREFERENCES
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo preferencias del usuario");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo preferencias del usuario:", error);
      throw error;
    }
  }

  // Actualizar preferencias del usuario
  public async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      console.log("⚙️ Actualizando preferencias del usuario...");

      const response = await api.put<UserPreferences>(
        USER_ENDPOINTS.PREFERENCES,
        preferences
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando preferencias del usuario");
      }

      this.clearCache();
      console.log("✅ Preferencias del usuario actualizadas exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando preferencias del usuario:", error);
      throw error;
    }
  }

  // ============================================================================
  // UTILIDADES Y VALIDACIONES
  // ============================================================================

  // Validar fortaleza de contraseña
  public validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  // Verificar permisos del usuario actual
  public hasPermission(resource: string, action: string): boolean {
    if (!this.currentUser) return false;
    return hasPermission(this.currentUser, resource, action);
  }

  // Verificar rol del usuario actual
  public hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Obtener información del dispositivo actual
  public getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;

    let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = "tablet";
    } else if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      deviceType = "mobile";
    }

    let os = "Unknown";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    let browser = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    return {
      type: deviceType,
      os,
      browser,
      version: "Unknown",
    };
  }

  // Obtener ubicación del usuario actual
  public async getCurrentUserLocation(): Promise<GeoLocation | null> {
    try {
      const location = await mapsService.getCurrentLocation();

      // Intentar obtener información geográfica adicional
      await mapsService.reverseGeocode(location);

      return {
        country: "México", // Por defecto basado en la ubicación configurada
        region: "Querétaro",
        city: "Santiago de Querétaro",
        latitude: location.latitude,
        longitude: location.longitude,
      };
    } catch (error) {
      console.warn("⚠️ No se pudo obtener la ubicación del usuario:", error);
      return null;
    }
  }

  // Formatear nombre de usuario
  public formatUserName(user: User): string {
    return getFullName(user);
  }

  // Obtener iniciales de usuario
  public getUserInitials(user: User): string {
    return getUserInitials(user);
  }

  // Obtener etiqueta de rol
  public getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  // Verificar si la suscripción está activa
  public isSubscriptionActive(subscription?: SubscriptionInfo): boolean {
    return isSubscriptionActive(subscription);
  }

  // Limpiar recursos
  public cleanup(): void {
    this.clearCache();
    this.currentUser = null;
    console.log("🧹 Servicio de usuarios limpiado");
  }

  // Establecer usuario actual (para uso interno)
  public setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Obtener usuario actual
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Exportar instancia singleton
export const userService = UserService.getInstance();

// Exportar tipos principales
export type {
  UserProfile,
  PersonalInfo,
  UserAddress,
  EmergencyContact,
  ProfessionalInfo,
  UserActivity,
  UserStatistics,
  TeamMember,
  UserInvitation,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  TwoFactorSetup,
  DashboardConfig,
  NotificationSettings,
  PrivacySettings,
  SecuritySettings,
};

export { ActivityType, ContributionLevel, TeamMemberStatus, InvitationStatus };
