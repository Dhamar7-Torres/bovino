import { api, apiClient } from "./api";
import {
  User,
  AuthCredentials,
  RegisterData,
  AuthResponse,
  AuthTokens,
  ChangePasswordData,
  ResetPasswordData,
  UserSession,
  DeviceInfo,
  GeoLocation,
  hasPermission as checkUserPermission,
  getFullName,
  getUserInitials,
  UserRole,
} from "../types/auth";
import { AUTH_ENDPOINTS } from "../constants/urls";

// Configuración para el servicio de autenticación
const AUTH_CONFIG = {
  TOKEN_KEY: "authToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  USER_KEY: "userData",
  REMEMBER_ME_KEY: "rememberMe",
  SESSION_KEY: "userSession",
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutos
} as const;

// Interface para el estado de autenticación local
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  sessionId: string | null;
}

// Interface para respuesta de autenticación extendida
interface ExtendedAuthResponse extends AuthResponse {
  sessionId: string;
  deviceFingerprint: string;
}

// Clase principal del servicio de autenticación
class AuthService {
  private authState: AuthState;
  private refreshTimer: number | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private sessionStartTime: Date | null = null;

  constructor() {
    // Inicializar estado de autenticación
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      sessionId: null,
    };

    // Obtener información del dispositivo
    this.deviceInfo = this.getDeviceInfo();

    // Inicializar desde localStorage si existe
    this.initializeFromStorage();

    // Configurar escuchador para eventos de autenticación
    this.setupEventListeners();
  }

  // Obtener información del dispositivo para tracking de sesiones
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;

    // Detectar tipo de dispositivo
    let deviceType: DeviceInfo["type"] = "desktop";
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) deviceType = "tablet";
    else if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    )
      deviceType = "mobile";

    // Detectar OS
    let os = "Unknown";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/mac/i.test(userAgent)) os = "macOS";
    else if (/linux/i.test(userAgent)) os = "Linux";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/ios|iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

    // Detectar navegador
    let browser = "Unknown";
    let version = "Unknown";
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browser = "Chrome";
      const match = userAgent.match(/chrome\/(\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/firefox/i.test(userAgent)) {
      browser = "Firefox";
      const match = userAgent.match(/firefox\/(\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = "Safari";
      const match = userAgent.match(/version\/(\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/edge/i.test(userAgent)) {
      browser = "Edge";
      const match = userAgent.match(/edge\/(\d+\.\d+)/i);
      if (match) version = match[1];
    }

    return { type: deviceType, os, browser, version };
  }

  // Obtener geolocalización para tracking de sesiones
  private async getGeoLocation(): Promise<GeoLocation | null> {
    try {
      // Intentar obtener ubicación por IP primero (más rápido)
      const ipResponse = await fetch("https://ipapi.co/json/");
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        return {
          country: ipData.country_name || "Unknown",
          region: ipData.region || "Unknown",
          city: ipData.city || "Unknown",
          latitude: ipData.latitude || 0,
          longitude: ipData.longitude || 0,
        };
      }

      // Fallback a geolocalización del navegador
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                country: "Unknown",
                region: "Unknown",
                city: "Unknown",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            () => reject(null),
            { timeout: 5000 }
          );
        });
      }

      return null;
    } catch (error) {
      console.warn("⚠️ No se pudo obtener geolocalización:", error);
      return null;
    }
  }

  // Configurar escuchadores de eventos
  private setupEventListeners(): void {
    // Escuchar eventos de pérdida de conexión
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Escuchar eventos de visibilidad de página
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    // Escuchar eventos de autenticación personalizada
    window.addEventListener(
      "auth:unauthorized",
      this.handleUnauthorized.bind(this)
    );
  }

  // Manejar conexión restaurada
  private async handleOnline(): Promise<void> {
    if (this.authState.isAuthenticated && this.authState.token) {
      try {
        await this.validateToken();
      } catch (error) {
        console.warn("⚠️ Token inválido al recuperar conexión");
        await this.logout();
      }
    }
  }

  // Manejar pérdida de conexión
  private handleOffline(): void {
    console.log("📱 Aplicación en modo offline");
  }

  // Manejar cambios de visibilidad de página
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.updateLastActivity();
    } else if (this.authState.isAuthenticated) {
      this.validateTokenExpiry();
    }
  }

  // Manejar evento de no autorizado
  private async handleUnauthorized(): Promise<void> {
    await this.logout();
  }

  // Inicializar autenticación desde almacenamiento local
  private initializeFromStorage(): void {
    try {
      const token =
        localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) ||
        sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const refreshToken =
        localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY) ||
        sessionStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      const userData =
        localStorage.getItem(AUTH_CONFIG.USER_KEY) ||
        sessionStorage.getItem(AUTH_CONFIG.USER_KEY);
      const sessionId =
        localStorage.getItem(AUTH_CONFIG.SESSION_KEY) ||
        sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY);

      if (token && userData) {
        const user = JSON.parse(userData) as User;
        const tokenExpiry = this.getTokenExpiry(token);

        this.authState = {
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          expiresAt: tokenExpiry,
          sessionId,
        };

        // Configurar el token en el cliente API
        apiClient.setAuthToken(token);

        // Iniciar timer de renovación automática
        this.setupTokenRefresh();

        console.log("✅ Sesión restaurada desde almacenamiento");
      }
    } catch (error) {
      console.error("❌ Error restaurando sesión:", error);
      this.clearStoredAuth();
    }
  }

  // Obtener expiración del token JWT
  private getTokenExpiry(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }

  // Configurar renovación automática del token
  private setupTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.authState.expiresAt) return;

    const timeUntilExpiry = this.authState.expiresAt.getTime() - Date.now();
    const refreshTime = timeUntilExpiry - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER;

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshTokens();
        } catch (error) {
          console.error("❌ Error renovando token:", error);
          await this.logout();
        }
      }, refreshTime);
    }
  }

  // Validar que el token no haya expirado
  private validateTokenExpiry(): boolean {
    if (!this.authState.expiresAt) return false;

    const timeUntilExpiry = this.authState.expiresAt.getTime() - Date.now();
    return timeUntilExpiry > 0;
  }

  // Limpiar datos de autenticación almacenados
  private clearStoredAuth(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  }

  // Almacenar datos de autenticación
  private storeAuthData(
    tokens: AuthTokens,
    user: User,
    sessionId: string,
    rememberMe: boolean = false
  ): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(AUTH_CONFIG.TOKEN_KEY, tokens.accessToken);
    storage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);
    storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
    storage.setItem(AUTH_CONFIG.SESSION_KEY, sessionId);

    if (rememberMe) {
      localStorage.setItem(AUTH_CONFIG.REMEMBER_ME_KEY, "true");
    }
  }

  // Actualizar actividad de la sesión
  private updateLastActivity(): void {
    if (!this.authState.sessionId) return;

    // Actualizar timestamp de actividad en el servidor
    api
      .patch(`/auth/sessions/${this.authState.sessionId}/activity`, {
        lastActivity: new Date().toISOString(),
      })
      .catch((error) => {
        console.warn("⚠️ Error actualizando actividad:", error);
      });
  }

  // MÉTODOS PÚBLICOS

  // Realizar login
  public async login(
    credentials: AuthCredentials
  ): Promise<ExtendedAuthResponse> {
    try {
      console.log("🔐 Iniciando proceso de login...");

      // Obtener geolocalización para la sesión
      const geoLocation = await this.getGeoLocation();

      // Preparar datos de login con información de dispositivo y ubicación
      const loginData = {
        ...credentials,
        deviceInfo: this.deviceInfo,
        geoLocation,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Realizar petición de login con geolocalización incluida
      const response = await api.post<ExtendedAuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        loginData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Respuesta de login inválida");
      }

      const { user, tokens, sessionId } = response.data;

      // Actualizar estado interno
      this.authState = {
        isAuthenticated: true,
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: this.getTokenExpiry(tokens.accessToken),
        sessionId,
      };

      // Configurar token en el cliente API
      apiClient.setAuthToken(tokens.accessToken);

      // Almacenar datos
      this.storeAuthData(tokens, user, sessionId, credentials.rememberMe);

      // Configurar renovación automática
      this.setupTokenRefresh();

      // Marcar inicio de sesión
      this.sessionStartTime = new Date();

      console.log(`✅ Login exitoso para: ${getFullName(user)}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  }

  // Realizar registro
  public async register(userData: RegisterData): Promise<ExtendedAuthResponse> {
    try {
      console.log("📝 Iniciando proceso de registro...");

      // Validaciones
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      if (!userData.acceptTerms || !userData.acceptPrivacy) {
        throw new Error("Debe aceptar los términos y política de privacidad");
      }

      // Obtener geolocalización
      const geoLocation = await this.getGeoLocation();

      // Preparar datos de registro
      const registerData = {
        ...userData,
        deviceInfo: this.deviceInfo,
        geoLocation,
        registrationSource: "web_app",
        timestamp: new Date().toISOString(),
      };

      // Realizar petición de registro
      const response = await api.post<ExtendedAuthResponse>(
        AUTH_ENDPOINTS.REGISTER,
        registerData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error en el registro");
      }

      console.log("✅ Registro exitoso");

      // Hacer login automático después del registro
      return await this.login({
        email: userData.email,
        password: userData.password,
        rememberMe: false,
      });
    } catch (error) {
      console.error("❌ Error en registro:", error);
      throw error;
    }
  }

  // Cerrar sesión
  public async logout(): Promise<void> {
    try {
      console.log("🚪 Cerrando sesión...");

      // Notificar al servidor sobre el logout
      if (this.authState.sessionId) {
        await api
          .post(AUTH_ENDPOINTS.LOGOUT, {
            sessionId: this.authState.sessionId,
            logoutReason: "user_initiated",
          })
          .catch((error) => {
            console.warn("⚠️ Error notificando logout al servidor:", error);
          });
      }

      // Limpiar timers
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Limpiar estado
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        sessionId: null,
      };

      // Limpiar almacenamiento
      this.clearStoredAuth();

      // Limpiar token del cliente API
      apiClient.setAuthToken(null);

      // Limpiar tiempo de inicio de sesión
      this.sessionStartTime = null;

      console.log("✅ Sesión cerrada exitosamente");
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error);
      // Aun si hay error, limpiar estado local
      this.clearStoredAuth();
      apiClient.setAuthToken(null);
    }
  }

  // Renovar tokens
  public async refreshTokens(): Promise<AuthTokens> {
    try {
      if (!this.authState.refreshToken) {
        throw new Error("No hay refresh token disponible");
      }

      console.log("🔄 Renovando tokens...");

      const response = await api.post<{ tokens: AuthTokens }>(
        AUTH_ENDPOINTS.REFRESH_TOKEN,
        { refreshToken: this.authState.refreshToken }
      );

      if (!response.success || !response.data) {
        throw new Error("Error renovando tokens");
      }

      const { tokens } = response.data;

      // Actualizar estado
      this.authState.token = tokens.accessToken;
      this.authState.refreshToken = tokens.refreshToken;
      this.authState.expiresAt = this.getTokenExpiry(tokens.accessToken);

      // Actualizar en almacenamiento
      const isRemembered =
        localStorage.getItem(AUTH_CONFIG.REMEMBER_ME_KEY) === "true";
      const storage = isRemembered ? localStorage : sessionStorage;

      storage.setItem(AUTH_CONFIG.TOKEN_KEY, tokens.accessToken);
      storage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);

      // Configurar en API client
      apiClient.setAuthToken(tokens.accessToken);

      // Reconfigurar timer
      this.setupTokenRefresh();

      console.log("✅ Tokens renovados exitosamente");

      return tokens;
    } catch (error) {
      console.error("❌ Error renovando tokens:", error);
      throw error;
    }
  }

  // Validar token actual
  public async validateToken(): Promise<boolean> {
    try {
      if (!this.authState.token) return false;

      const response = await api.get("/auth/validate");
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Cambiar contraseña
  public async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      if (data.newPassword !== data.confirmNewPassword) {
        throw new Error("Las contraseñas nuevas no coinciden");
      }

      await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      console.log("✅ Contraseña cambiada exitosamente");
    } catch (error) {
      console.error("❌ Error cambiando contraseña:", error);
      throw error;
    }
  }

  // Solicitar recuperación de contraseña
  public async forgotPassword(email: string): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      console.log("✅ Email de recuperación enviado");
    } catch (error) {
      console.error("❌ Error solicitando recuperación:", error);
      throw error;
    }
  }

  // Restablecer contraseña
  public async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      if (data.newPassword !== data.confirmNewPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token: data.token,
        newPassword: data.newPassword,
      });

      console.log("✅ Contraseña restablecida exitosamente");
    } catch (error) {
      console.error("❌ Error restableciendo contraseña:", error);
      throw error;
    }
  }

  // Verificar email
  public async verifyEmail(token: string): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      console.log("✅ Email verificado exitosamente");
    } catch (error) {
      console.error("❌ Error verificando email:", error);
      throw error;
    }
  }

  // Actualizar perfil
  public async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(AUTH_ENDPOINTS.PROFILE, updates);

      if (!response.success || !response.data) {
        throw new Error("Error actualizando perfil");
      }

      // Actualizar usuario en estado y almacenamiento
      this.authState.user = response.data;

      const isRemembered =
        localStorage.getItem(AUTH_CONFIG.REMEMBER_ME_KEY) === "true";
      const storage = isRemembered ? localStorage : sessionStorage;
      storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));

      console.log("✅ Perfil actualizado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
      throw error;
    }
  }

  // Obtener sesiones activas
  public async getActiveSessions(): Promise<UserSession[]> {
    try {
      const response = await api.get<UserSession[]>("/auth/sessions");
      return response.data || [];
    } catch (error) {
      console.error("❌ Error obteniendo sesiones:", error);
      return [];
    }
  }

  // Cerrar sesión específica
  public async terminateSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      console.log("✅ Sesión terminada exitosamente");
    } catch (error) {
      console.error("❌ Error terminando sesión:", error);
      throw error;
    }
  }

  // GETTERS PARA ACCESO AL ESTADO

  public get isAuthenticated(): boolean {
    return this.authState.isAuthenticated && this.validateTokenExpiry();
  }

  public get currentUser(): User | null {
    return this.authState.user;
  }

  public get currentToken(): string | null {
    return this.authState.token;
  }

  public get sessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime.getTime();
  }

  // MÉTODOS DE UTILIDAD

  // Verificar permisos del usuario actual
  public hasPermission(resource: string, action: string): boolean {
    if (!this.authState.user) return false;
    return checkUserPermission(this.authState.user, resource, action);
  }

  // Verificar rol del usuario actual
  public hasRole(role: UserRole): boolean {
    return this.authState.user?.role === role;
  }

  // Verificar si es admin
  public isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN) || this.hasRole(UserRole.OWNER);
  }

  // Verificar si es veterinario
  public isVeterinarian(): boolean {
    return this.hasRole(UserRole.VETERINARIAN);
  }

  // Obtener nombre completo del usuario
  public getUserDisplayName(): string {
    if (!this.authState.user) return "Usuario";
    return getFullName(this.authState.user);
  }

  // Obtener iniciales del usuario
  public getUserInitials(): string {
    if (!this.authState.user) return "U";
    return getUserInitials(this.authState.user);
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Export default para compatibilidad
export default authService;
