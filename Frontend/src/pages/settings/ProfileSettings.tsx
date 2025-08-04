import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Interfaces para TypeScript
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profileImage?: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
}

const ProfileSettings: React.FC = () => {
  // Estados para la gestión del formulario
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Estado del perfil del usuario
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-001',
    firstName: 'Ana María',
    lastName: 'González Rodríguez',
    email: 'ana.gonzalez@ganaderia.mx',
    phone: '+52 993 123 4567',
    address: 'Av. Universidad s/n',
    city: 'Villahermosa',
    state: 'Tabasco',
    zipCode: '86040',
    role: 'Veterinaria Principal',
    department: 'Salud Animal',
    joinDate: '2023-01-15',
    lastLogin: '2025-01-15T10:30:00'
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para configuraciones de notificaciones
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    emergencyAlerts: true
  });

  // Función para manejar el cambio de imagen de perfil
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para guardar los cambios
  const handleSaveChanges = async () => {
    setSaving(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsEditing(false);
    setSaving(false);
    setShowSuccessMessage(true);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Función para cambiar contraseña
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    
    // Limpiar formulario
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Animaciones para las transiciones
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const tabContentVariants: Variants = {
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
            Configuración de Perfil
          </h1>
          <p className="text-white/80 text-lg">
            Gestiona tu información personal y preferencias del sistema
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
              <span>Cambios guardados exitosamente</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Navegación por pestañas */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'profile', label: 'Información Personal', icon: User },
              { id: 'security', label: 'Seguridad', icon: Shield },
              { id: 'notifications', label: 'Notificaciones', icon: AlertCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'text-[#519a7c] border-b-2 border-[#519a7c] bg-[#519a7c]/5'
                    : 'text-gray-600 hover:text-[#519a7c] hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Pestaña de Perfil */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Sección de imagen de perfil */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <motion.div 
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#519a7c] to-[#f4ac3a] p-1"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {previewImage || userProfile.profileImage ? (
                            <img 
                              src={previewImage || userProfile.profileImage} 
                              alt="Perfil" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={40} className="text-gray-400" />
                          )}
                        </div>
                      </motion.div>
                      
                      {isEditing && (
                        <motion.label
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-2 -right-2 bg-[#519a7c] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#4a8b70] transition-colors"
                        >
                          <Camera size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </motion.label>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {userProfile.firstName} {userProfile.lastName}
                      </h3>
                      <p className="text-gray-600">{userProfile.role}</p>
                      <p className="text-sm text-gray-500">{userProfile.department}</p>
                    </div>
                  </div>

                  {/* Formulario de información personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={userProfile.address}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, address: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Ciudad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={userProfile.city}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={userProfile.state}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, state: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Información adicional (solo lectura) */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Información del Sistema</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
                        <p className="font-medium text-gray-800">
                          {new Date(userProfile.joinDate).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Último Acceso:</span>
                        <p className="font-medium text-gray-800">
                          {new Date(userProfile.lastLogin).toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pestaña de Seguridad */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    Configuración de Seguridad
                  </h3>

                  {/* Cambio de contraseña */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Lock size={20} />
                      Cambiar Contraseña
                    </h4>

                    <div className="space-y-4">
                      {/* Contraseña actual */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                            placeholder="Ingresa tu contraseña actual"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {/* Nueva contraseña */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Ingresa tu nueva contraseña"
                        />
                      </div>

                      {/* Confirmar contraseña */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Confirma tu nueva contraseña"
                        />
                      </div>

                      <motion.button
                        onClick={handlePasswordChange}
                        disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || isSaving}
                        className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white px-6 py-2 rounded-lg font-medium hover:from-[#4a8b70] hover:to-[#45896a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Cambiar Contraseña
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Información de seguridad */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-800 mb-2">
                      Consejos de Seguridad
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Usa una contraseña de al menos 8 caracteres</li>
                      <li>• Incluye mayúsculas, minúsculas, números y símbolos</li>
                      <li>• No compartas tu contraseña con terceros</li>
                      <li>• Cambia tu contraseña regularmente</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Pestaña de Notificaciones */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    Preferencias de Notificaciones
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        key: 'emailNotifications',
                        title: 'Notificaciones por Email',
                        description: 'Recibe alertas y actualizaciones importantes por correo electrónico',
                        icon: Mail
                      },
                      {
                        key: 'pushNotifications',
                        title: 'Notificaciones Push',
                        description: 'Recibe notificaciones en tiempo real en tu navegador',
                        icon: AlertCircle
                      },
                      {
                        key: 'smsNotifications',
                        title: 'Notificaciones SMS',
                        description: 'Recibe alertas críticas por mensaje de texto',
                        icon: Phone
                      },
                      {
                        key: 'weeklyReports',
                        title: 'Reportes Semanales',
                        description: 'Recibe un resumen semanal de la actividad del sistema',
                        icon: Calendar
                      },
                      {
                        key: 'emergencyAlerts',
                        title: 'Alertas de Emergencia',
                        description: 'Recibe notificaciones inmediatas de eventos críticos',
                        icon: AlertCircle
                      }
                    ].map(({ key, title, description, icon: Icon }) => (
                      <motion.div
                        key={key}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-[#519a7c]/10 rounded-lg">
                            <Icon size={20} className="text-[#519a7c]" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{title}</h4>
                            <p className="text-sm text-gray-600">{description}</p>
                          </div>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key as keyof NotificationSettings]}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#519a7c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#519a7c]"></div>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botones de acción */}
          {activeTab === 'profile' && (
            <div className="px-8 py-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!isEditing ? (
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-[#519a7c] text-white rounded-lg font-medium hover:bg-[#4a8b70] transition-colors flex items-center gap-2 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User size={16} />
                    Editar Perfil
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white px-6 py-2 rounded-lg font-medium hover:from-[#4a8b70] hover:to-[#45896a] transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Guardar Cambios
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setIsEditing(false);
                        setPreviewImage(null);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X size={16} />
                      Cancelar
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de guardar para notificaciones */}
          {activeTab === 'notifications' && (
            <div className="px-8 py-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200">
              <motion.button
                onClick={() => {
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 3000);
                  }, 1000);
                }}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white px-6 py-2 rounded-lg font-medium hover:from-[#4a8b70] hover:to-[#45896a] transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Preferencias
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;