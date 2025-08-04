import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Phone, 
  Calendar,
  Volume2,
  Clock,
  Settings,
  Save,
  CheckCircle,
  Smartphone,
  Monitor,
  MessageSquare,
  Heart,
  Truck,
  MapPin,
  BarChart3,
  Shield
} from 'lucide-react';

// ============================================================================
// TIPOS Y ENUMS
// ============================================================================

type NotificationFrequency = 'instant' | 'hourly' | 'daily' | 'weekly';
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
type ActiveSection = 'channels' | 'categories' | 'schedule';
type ChannelType = 'email' | 'push' | 'sms' | 'inApp';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  settings: ChannelSettings;
}

interface ChannelSettings {
  email?: EmailSettings;
  push?: PushSettings;
  sms?: SmsSettings;
  inApp?: InAppSettings;
}

interface EmailSettings {
  enabled: boolean;
  frequency: NotificationFrequency;
  digest: boolean;
  html: boolean;
}

interface PushSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

interface SmsSettings {
  enabled: boolean;
  emergencyOnly: boolean;
  phoneNumber: string;
}

interface InAppSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  position: NotificationPosition;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: NotificationPriority;
  channels: Record<ChannelType, boolean>;
}

interface ScheduleSettings {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendNotifications: boolean;
  holidayNotifications: boolean;
  timezone: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo'
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  instant: 'Instantáneo',
  hourly: 'Cada hora',
  daily: 'Diario',
  weekly: 'Semanal'
};

const TIMEZONE_OPTIONS = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Cancun', label: 'Cancún (GMT-5)' },
  { value: 'America/Tijuana', label: 'Tijuana (GMT-8)' }
];

const SECTION_TABS = [
  { id: 'channels' as const, label: 'Canales', icon: Bell },
  { id: 'categories' as const, label: 'Categorías', icon: Settings },
  { id: 'schedule' as const, label: 'Programación', icon: Clock }
];

const CHANNEL_OPTIONS = [
  { key: 'email' as const, label: 'Email', icon: Mail },
  { key: 'push' as const, label: 'Push', icon: Bell },
  { key: 'sms' as const, label: 'SMS', icon: Phone },
  { key: 'inApp' as const, label: 'En App', icon: Monitor }
];

const PUSH_OPTIONS = [
  { key: 'sound' as const, label: 'Sonido', icon: Volume2 },
  { key: 'vibration' as const, label: 'Vibración', icon: Smartphone },
  { key: 'badge' as const, label: 'Insignia', icon: Bell }
];

// ============================================================================
// DATOS INICIALES
// ============================================================================

const getInitialChannels = (): NotificationChannel[] => [
  {
    id: 'email',
    name: 'Correo Electrónico',
    description: 'Recibe notificaciones por email con resúmenes detallados',
    icon: Mail,
    enabled: true,
    settings: {
      email: {
        enabled: true,
        frequency: 'instant',
        digest: true,
        html: true
      }
    }
  },
  {
    id: 'push',
    name: 'Notificaciones Push',
    description: 'Alertas en tiempo real en tu navegador o dispositivo móvil',
    icon: Bell,
    enabled: true,
    settings: {
      push: {
        enabled: true,
        sound: true,
        vibration: false,
        badge: true
      }
    }
  },
  {
    id: 'sms',
    name: 'Mensajes SMS',
    description: 'Alertas críticas por mensaje de texto (solo emergencias)',
    icon: Phone,
    enabled: false,
    settings: {
      sms: {
        enabled: false,
        emergencyOnly: true,
        phoneNumber: '+52 993 123 4567'
      }
    }
  },
  {
    id: 'inApp',
    name: 'Notificaciones en App',
    description: 'Alertas dentro de la aplicación con sonidos y animaciones',
    icon: Monitor,
    enabled: true,
    settings: {
      inApp: {
        enabled: true,
        sound: true,
        desktop: true,
        position: 'top-right'
      }
    }
  }
];

const getInitialCategories = (): NotificationCategory[] => [
  {
    id: 'health_alerts',
    name: 'Alertas de Salud',
    description: 'Enfermedades, vacunas vencidas, tratamientos pendientes',
    icon: Heart,
    color: '#ef4444',
    priority: 'critical',
    channels: { email: true, push: true, sms: true, inApp: true }
  },
  {
    id: 'vaccination_reminders',
    name: 'Recordatorios de Vacunación',
    description: 'Programas de vacunación, fechas próximas, vencimientos',
    icon: Calendar,
    color: '#3b82f6',
    priority: 'high',
    channels: { email: true, push: true, sms: false, inApp: true }
  },
  {
    id: 'location_updates',
    name: 'Actualizaciones de Ubicación',
    description: 'Movimientos de ganado, geofencing, ubicaciones críticas',
    icon: MapPin,
    color: '#10b981',
    priority: 'medium',
    channels: { email: false, push: true, sms: false, inApp: true }
  },
  {
    id: 'inventory_alerts',
    name: 'Alertas de Inventario',
    description: 'Stock bajo, medicamentos vencidos, suministros',
    icon: Truck,
    color: '#f59e0b',
    priority: 'medium',
    channels: { email: true, push: false, sms: false, inApp: true }
  },
  {
    id: 'reports_ready',
    name: 'Reportes Listos',
    description: 'Reportes generados, análisis completados, exportaciones',
    icon: BarChart3,
    color: '#8b5cf6',
    priority: 'low',
    channels: { email: true, push: false, sms: false, inApp: false }
  },
  {
    id: 'system_alerts',
    name: 'Alertas del Sistema',
    description: 'Mantenimiento, actualizaciones, problemas técnicos',
    icon: Shield,
    color: '#6b7280',
    priority: 'high',
    channels: { email: true, push: true, sms: false, inApp: true }
  }
];

const getInitialScheduleSettings = (): ScheduleSettings => ({
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  weekendNotifications: false,
  holidayNotifications: false,
  timezone: 'America/Mexico_City'
});

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const NotificationSettings: React.FC = () => {
  // Estados principales
  const [isSaving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('channels');
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // Estados de datos
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>(getInitialChannels);
  const [notificationCategories, setNotificationCategories] = useState<NotificationCategory[]>(getInitialCategories);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(getInitialScheduleSettings);

  // Función para mostrar mensaje de éxito
  const showSuccessNotification = useCallback((_message: string = 'Configuración guardada exitosamente') => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, []);

  // Función para alternar canal
  const toggleChannel = useCallback((channelId: string) => {
    setNotificationChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, enabled: !channel.enabled }
          : channel
      )
    );
  }, []);

  // Función para alternar categoría por canal
  const toggleCategoryChannel = useCallback((categoryId: string, channelType: ChannelType) => {
    setNotificationCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              channels: {
                ...category.channels,
                [channelType]: !category.channels[channelType]
              }
            }
          : category
      )
    );
  }, []);

  // Función para actualizar configuración de canal
  const updateChannelSettings = useCallback((channelId: string, path: string, value: any) => {
    setNotificationChannels(prev =>
      prev.map(channel => {
        if (channel.id !== channelId) return channel;
        
        const newSettings = { ...channel.settings };
        const pathParts = path.split('.');
        let current: any = newSettings;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) current[pathParts[i]] = {};
          current = current[pathParts[i]];
        }
        
        current[pathParts[pathParts.length - 1]] = value;
        
        return { ...channel, settings: newSettings };
      })
    );
  }, []);

  // Función para probar notificación
  const testNotificationFunction = useCallback(async (channelId: string) => {
    setTestNotification(channelId);
    
    try {
      // Simular envío de notificación de prueba
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccessNotification('Notificación de prueba enviada');
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setTestNotification(null);
    }
  }, [showSuccessNotification]);

  // Función para guardar configuraciones
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccessNotification();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }, [showSuccessNotification]);

  // Función para actualizar configuraciones de horario
  const updateScheduleSettings = useCallback((updates: Partial<ScheduleSettings>) => {
    setScheduleSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Renderizar sección de canales
  const renderChannelsSection = useCallback(() => (
    <motion.div
      key="channels"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Canales de Notificación
        </h3>
        <p className="text-gray-600">
          Configura cómo quieres recibir las notificaciones del sistema
        </p>
      </div>

      <div className="grid gap-6">
        {notificationChannels.map((channel) => {
          const IconComponent = channel.icon;
          return (
            <motion.div
              key={channel.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                channel.enabled 
                  ? 'bg-[#519a7c]/5 border-[#519a7c]/30' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    channel.enabled 
                      ? 'bg-[#519a7c] text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <IconComponent size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {channel.name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {channel.description}
                    </p>

                    {/* Configuraciones específicas del canal */}
                    {channel.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        {/* Configuraciones de Email */}
                        {channel.id === 'email' && channel.settings.email && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`${channel.id}-frequency`}>
                                Frecuencia
                              </label>
                              <select 
                                id={`${channel.id}-frequency`}
                                value={channel.settings.email.frequency}
                                onChange={(e) => updateChannelSettings(channel.id, 'email.frequency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              >
                                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={channel.settings.email.digest}
                                  onChange={(e) => updateChannelSettings(channel.id, 'email.digest', e.target.checked)}
                                  className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                                />
                                <span className="text-sm text-gray-700">Resumen diario</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Configuraciones de Push */}
                        {channel.id === 'push' && channel.settings.push && (
                          <div className="flex flex-wrap gap-4">
                            {PUSH_OPTIONS.map(({ key, label, icon: OptionIcon }) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={channel.settings.push?.[key] as boolean}
                                  onChange={(e) => updateChannelSettings(channel.id, `push.${key}`, e.target.checked)}
                                  className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                                />
                                <OptionIcon size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Configuraciones de SMS */}
                        {channel.id === 'sms' && channel.settings.sms && (
                          <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={channel.settings.sms.emergencyOnly}
                                onChange={(e) => updateChannelSettings(channel.id, 'sms.emergencyOnly', e.target.checked)}
                                className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                              />
                              <span className="text-sm text-gray-700">Solo emergencias</span>
                            </label>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`${channel.id}-phone`}>
                                Número de teléfono
                              </label>
                              <input 
                                id={`${channel.id}-phone`}
                                type="tel"
                                value={channel.settings.sms.phoneNumber}
                                onChange={(e) => updateChannelSettings(channel.id, 'sms.phoneNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Botón de prueba */}
                  {channel.enabled && (
                    <motion.button
                      onClick={() => testNotificationFunction(channel.id)}
                      disabled={testNotification === channel.id}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Probar notificación ${channel.name}`}
                    >
                      {testNotification === channel.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <MessageSquare size={16} />
                          Probar
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Toggle principal */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channel.enabled}
                      onChange={() => toggleChannel(channel.id)}
                      className="sr-only peer"
                      aria-label={`Activar/desactivar ${channel.name}`}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#519a7c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#519a7c]"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  ), [notificationChannels, testNotification, toggleChannel, testNotificationFunction, updateChannelSettings]);

  // Renderizar sección de categorías
  const renderCategoriesSection = useCallback(() => (
    <motion.div
      key="categories"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Categorías de Notificación
        </h3>
        <p className="text-gray-600">
          Personaliza qué tipos de eventos quieres recibir por cada canal
        </p>
      </div>

      <div className="space-y-4">
        {notificationCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <motion.div
              key={category.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent size={24} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[category.priority]}`}>
                        {PRIORITY_LABELS[category.priority]}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controles de canal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {CHANNEL_OPTIONS.map(({ key, label, icon: ChannelIcon }) => (
                  <label 
                    key={key}
                    className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={category.channels[key]}
                      onChange={() => toggleCategoryChannel(category.id, key)}
                      className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                      aria-label={`${label} para ${category.name}`}
                    />
                    <ChannelIcon size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  ), [notificationCategories, toggleCategoryChannel]);

  // Renderizar sección de programación
  const renderScheduleSection = useCallback(() => (
    <motion.div
      key="schedule"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Programación y Horarios
        </h3>
        <p className="text-gray-600">
          Configura cuándo quieres recibir notificaciones
        </p>
      </div>

      <div className="grid gap-6">
        {/* Horas silenciosas */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-6 bg-white border border-gray-200 rounded-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Horas Silenciosas
              </h4>
              <p className="text-gray-600">
                Define un período durante el cual no recibirás notificaciones no críticas
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleSettings.quietHoursEnabled}
                onChange={(e) => updateScheduleSettings({ quietHoursEnabled: e.target.checked })}
                className="sr-only peer"
                aria-label="Activar horas silenciosas"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#519a7c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#519a7c]"></div>
            </label>
          </div>

          {scheduleSettings.quietHoursEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quiet-start">
                  Hora de inicio
                </label>
                <input
                  id="quiet-start"
                  type="time"
                  value={scheduleSettings.quietHoursStart}
                  onChange={(e) => updateScheduleSettings({ quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quiet-end">
                  Hora de fin
                </label>
                <input
                  id="quiet-end"
                  type="time"
                  value={scheduleSettings.quietHoursEnd}
                  onChange={(e) => updateScheduleSettings({ quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Configuraciones adicionales */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="p-6 bg-white border border-gray-200 rounded-lg"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Configuraciones Adicionales
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-800">Notificaciones en fines de semana</span>
                <p className="text-sm text-gray-600">Recibir notificaciones no críticas durante sábados y domingos</p>
              </div>
              <input
                type="checkbox"
                checked={scheduleSettings.weekendNotifications}
                onChange={(e) => updateScheduleSettings({ weekendNotifications: e.target.checked })}
                className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                aria-label="Notificaciones en fines de semana"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-800">Notificaciones en días festivos</span>
                <p className="text-sm text-gray-600">Recibir notificaciones no críticas durante días festivos</p>
              </div>
              <input
                type="checkbox"
                checked={scheduleSettings.holidayNotifications}
                onChange={(e) => updateScheduleSettings({ holidayNotifications: e.target.checked })}
                className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                aria-label="Notificaciones en días festivos"
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="timezone">
                Zona horaria
              </label>
              <select 
                id="timezone"
                value={scheduleSettings.timezone}
                onChange={(e) => updateScheduleSettings({ timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                {TIMEZONE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  ), [scheduleSettings, updateScheduleSettings]);

  // Secciones memoizadas
  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case 'channels':
        return renderChannelsSection();
      case 'categories':
        return renderCategoriesSection();
      case 'schedule':
        return renderScheduleSection();
      default:
        return null;
    }
  }, [activeSection, renderChannelsSection, renderCategoriesSection, renderScheduleSection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado de la página */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Configuración de Notificaciones
          </h1>
          <p className="text-white/80 text-lg">
            Personaliza cómo y cuándo recibir alertas del sistema ganadero
          </p>
        </motion.div>

        {/* Mensaje de éxito */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              <span>Configuración guardada exitosamente</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Navegación por secciones */}
          <div className="flex border-b border-gray-200">
            {SECTION_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                  activeSection === id
                    ? 'text-[#519a7c] border-b-2 border-[#519a7c] bg-[#519a7c]/5'
                    : 'text-gray-600 hover:text-[#519a7c] hover:bg-gray-50'
                }`}
                aria-label={`Ir a sección ${label}`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de las secciones */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {sectionContent}
            </AnimatePresence>
          </div>

          {/* Botón de guardar */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <motion.button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-[#519a7c] hover:bg-[#2d5a45] text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Guardar configuración de notificaciones"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Guardando configuración...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Configuración
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettings;