import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings,
  User,
  Bell,
  ArrowLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CSS_CLASSES } from '../../components/layout';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';

const SettingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('main');

  // Efecto para sincronizar activeView con la URL
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/settings/profile') {
      setActiveView('profile');
    } else if (pathname === '/settings/notifications') {
      setActiveView('notifications');
    } else if (pathname === '/settings') {
      setActiveView('main');
    } else {
      // Si hay otros paths como /settings/security, etc.
      const lastSegment = pathname.split('/').pop();
      if (lastSegment && lastSegment !== 'settings') {
        setActiveView(lastSegment);
      } else {
        setActiveView('main');
      }
    }
  }, [location.pathname]);

  const handleNavigateToSection = (section: string) => {
    // Navegar usando React Router en lugar de solo cambiar estado
    navigate(`/settings/${section}`);
  };

  const handleBackToMain = () => {
    // Navegar de vuelta a la página principal de settings
    navigate('/settings');
  };

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Configuración de Perfil',
      description: 'Gestiona tu información personal y preferencias de cuenta',
      icon: User,
      color: '#519a7c'
    },
    {
      id: 'notifications',
      title: 'Configuración de Notificaciones',
      description: 'Personaliza cómo y cuándo recibir alertas del sistema',
      icon: Bell,
      color: '#3b82f6'
    },
  ];

  return (
    <div className={CSS_CLASSES.backgroundMain + ' min-h-screen'}>
      <AnimatePresence mode="wait">
        {activeView === 'main' && (
          <motion.div 
            key="main" 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-6xl mx-auto">
              {/* Encabezado Principal */}
              <div className="mb-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                    <Settings size={40} className="text-white" />
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
                    Configuración del Sistema
                  </h1>
                  <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Personaliza tu experiencia y configura las opciones del sistema ganadero según tus preferencias
                  </p>
                </div>
              </div>

              {/* Grid de Opciones de Configuración */}
              <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                {settingsOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group cursor-pointer w-80"
                      onClick={() => handleNavigateToSection(option.id)}
                    >
                      <div className={CSS_CLASSES.card + ' h-full p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl'}>
                        {/* Contenido de la tarjeta */}
                        <div className="relative z-10">
                          {/* Icono */}
                          <div
                            className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-all duration-300"
                            style={{ backgroundColor: option.color + '20' }}
                          >
                            <IconComponent 
                              size={32} 
                              style={{ color: option.color }}
                              className="group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Título */}
                          <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                            {option.title}
                          </h3>

                          {/* Descripción */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">
                            {option.description}
                          </p>

                          {/* Flecha de navegación */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
                              Configurar
                            </span>
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                              <ChevronRight size={16} className="text-gray-600" />
                            </div>
                          </div>
                        </div>

                        {/* Efecto de brillo */}
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div className="mt-16 text-center">
                <div className={CSS_CLASSES.card + ' p-6 max-w-2xl mx-auto'}>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock size={24} className="text-[#519a7c]" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      Estado del Sistema
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Todas las configuraciones se guardan automáticamente y se aplican inmediatamente. 
                    El sistema está funcionando correctamente y todas las funciones están disponibles.
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Sistema Operativo</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista de Configuración de Perfil */}
        {activeView === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Botón de regreso */}
            <div className="p-6 pb-0">
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={20} />
                <span>Volver a Configuración</span>
              </button>
            </div>
            <ProfileSettings />
          </motion.div>
        )}

        {/* Vista de Configuración de Notificaciones */}
        {activeView === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Botón de regreso */}
            <div className="p-6 pb-0">
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={20} />
                <span>Volver a Configuración</span>
              </button>
            </div>
            <NotificationSettings />
          </motion.div>
        )}

        {/* Vistas para otras secciones (placeholder) */}
        {activeView !== 'main' && activeView !== 'profile' && activeView !== 'notifications' && (
          <motion.div 
            key={activeView} 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Botón de regreso */}
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft size={20} />
                <span>Volver a Configuración</span>
              </button>

              {/* Contenido placeholder */}
              <div className={CSS_CLASSES.card + ' p-8 text-center'}>
                <div className="max-w-md mx-auto">
                  {(() => {
                    const currentOption = settingsOptions.find(opt => opt.id === activeView);
                    const IconComponent = currentOption?.icon || Settings;
                    return (
                      <>
                        <div 
                          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                          style={{ backgroundColor: (currentOption?.color || '#519a7c') + '20' }}
                        >
                          <IconComponent 
                            size={40} 
                            style={{ color: currentOption?.color || '#519a7c' }}
                          />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                          {currentOption?.title || 'Configuración'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                          {currentOption?.description || 'Esta sección está en desarrollo.'}
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            <strong>Próximamente:</strong> Esta funcionalidad estará disponible en futuras actualizaciones del sistema.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;