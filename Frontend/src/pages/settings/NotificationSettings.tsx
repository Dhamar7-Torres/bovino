import React, { useState } from 'react';
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
import { CSS_CLASSES } from '../../components/layout';

// Interfaces para TypeScript
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
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
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
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const NotificationSettings: React.FC = () => {
  // Estados para la gestión de configuraciones
  const [isSaving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeSection, setActiveSection] = useState<'channels' | 'categories' | 'schedule'>('channels');
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // Estado de canales de notificación
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([
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
  ]);

  // Estado de categorías de notificación
  const [notificationCategories, setNotificationCategories] = useState<NotificationCategory[]>([
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
  ]);

  // Estado de programación
  const [scheduleSettings, setScheduleSettings] = useState({
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekendNotifications: false,
    holidayNotifications: false,
    timezone: 'America/Mexico_City'
  });

  // Función para alternar canal
  const toggleChannel = (channelId: string) => {
    setNotificationChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, enabled: !channel.enabled }
          : channel
      )
    );
  };

  // Función para alternar categoría por canal
  const toggleCategoryChannel = (categoryId: string, channelType: keyof NotificationCategory['channels']) => {
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
  };

  // Función para probar notificación
  const testNotificationFunction = async (channelId: string) => {
    setTestNotification(channelId);
    
    // Simular envío de notificación de prueba
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestNotification(null);
    
    // Mostrar notificación de éxito
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Función para guardar configuraciones
  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSaving(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Animaciones
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

  return (
    <div className={`min-h-screen ${CSS_CLASSES.backgroundMain} p-6`}>
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
          className={`${CSS_CLASSES.card} overflow-hidden`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Navegación por secciones */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'channels', label: 'Canales', icon: Bell },
              { id: 'categories', label: 'Categorías', icon: Settings },
              { id: 'schedule', label: 'Programación', icon: Clock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                  activeSection === id
                    ? 'text-[#519a7c] border-b-2 border-[#519a7c] bg-[#519a7c]/5'
                    : 'text-gray-600 hover:text-[#519a7c] hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de las secciones */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Sección de Canales */}
              {activeSection === 'channels' && (
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
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frecuencia
                                          </label>
                                          <select 
                                            value={channel.settings.email.frequency}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                                          >
                                            <option value="instant">Instantáneo</option>
                                            <option value="hourly">Cada hora</option>
                                            <option value="daily">Diario</option>
                                            <option value="weekly">Semanal</option>
                                          </select>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                              type="checkbox" 
                                              checked={channel.settings.email.digest}
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
                                        {[
                                          { key: 'sound', label: 'Sonido', icon: Volume2 },
                                          { key: 'vibration', label: 'Vibración', icon: Smartphone },
                                          { key: 'badge', label: 'Insignia', icon: Bell }
                                        ].map(({ key, label, icon: OptionIcon }) => (
                                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                              type="checkbox" 
                                              checked={channel.settings.push?.[key as keyof PushSettings] as boolean}
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
                                            className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                                          />
                                          <span className="text-sm text-gray-700">Solo emergencias</span>
                                        </label>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de teléfono
                                          </label>
                                          <input 
                                            type="tel"
                                            value={channel.settings.sms.phoneNumber}
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
              )}

              {/* Sección de Categorías */}
              {activeSection === 'categories' && (
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
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    category.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                    category.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    category.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {category.priority === 'critical' ? 'Crítico' :
                                     category.priority === 'high' ? 'Alto' :
                                     category.priority === 'medium' ? 'Medio' : 'Bajo'}
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
                            {[
                              { key: 'email', label: 'Email', icon: Mail },
                              { key: 'push', label: 'Push', icon: Bell },
                              { key: 'sms', label: 'SMS', icon: Phone },
                              { key: 'inApp', label: 'En App', icon: Monitor }
                            ].map(({ key, label, icon: ChannelIcon }) => (
                              <label 
                                key={key}
                                className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={category.channels[key as keyof NotificationCategory['channels']]}
                                  onChange={() => toggleCategoryChannel(category.id, key as keyof NotificationCategory['channels'])}
                                  className="rounded text-[#519a7c] focus:ring-[#519a7c]"
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
              )}

              {/* Sección de Programación */}
              {activeSection === 'schedule' && (
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
                            onChange={(e) => setScheduleSettings(prev => ({
                              ...prev,
                              quietHoursEnabled: e.target.checked
                            }))}
                            className="sr-only peer"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hora de inicio
                            </label>
                            <input
                              type="time"
                              value={scheduleSettings.quietHoursStart}
                              onChange={(e) => setScheduleSettings(prev => ({
                                ...prev,
                                quietHoursStart: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hora de fin
                            </label>
                            <input
                              type="time"
                              value={scheduleSettings.quietHoursEnd}
                              onChange={(e) => setScheduleSettings(prev => ({
                                ...prev,
                                quietHoursEnd: e.target.value
                              }))}
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
                            onChange={(e) => setScheduleSettings(prev => ({
                              ...prev,
                              weekendNotifications: e.target.checked
                            }))}
                            className="rounded text-[#519a7c] focus:ring-[#519a7c]"
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
                            onChange={(e) => setScheduleSettings(prev => ({
                              ...prev,
                              holidayNotifications: e.target.checked
                            }))}
                            className="rounded text-[#519a7c] focus:ring-[#519a7c]"
                          />
                        </label>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zona horaria
                          </label>
                          <select 
                            value={scheduleSettings.timezone}
                            onChange={(e) => setScheduleSettings(prev => ({
                              ...prev,
                              timezone: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          >
                            <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                            <option value="America/Cancun">Cancún (GMT-5)</option>
                            <option value="America/Tijuana">Tijuana (GMT-8)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de guardar */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <motion.button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`${CSS_CLASSES.buttonPrimary} px-8 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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