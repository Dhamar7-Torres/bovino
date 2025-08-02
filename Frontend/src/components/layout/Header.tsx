import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Beef,
  MapPin,
  TrendingUp,
  Heart,
  Package,
  DollarSign,
  FileText,
  Baby,
  Home,
  Activity,
  X,
  Building,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

const navigationItems = [
  { id: "dashboard", title: "Dashboard", href: "/dashboard", icon: Home },
  { id: "bovines", title: "Ganado", href: "/bovines", icon: Beef },
  { id: "health", title: "Salud", href: "/health", icon: Heart },
  {
    id: "reproduction",
    title: "Reproducción",
    href: "/reproduction",
    icon: Baby,
  },
  {
    id: "production",
    title: "Producción",
    href: "/production",
    icon: TrendingUp,
  },
  { id: "maps", title: "Mapas", href: "/maps", icon: MapPin },
  { id: "events", title: "Eventos", href: "/events", icon: Activity },
  { id: "inventory", title: "Inventario", href: "/inventory", icon: Package },
  { id: "finances", title: "Finanzas", href: "/finances", icon: DollarSign },
  { id: "reports", title: "Reportes", href: "/reports", icon: FileText },
  { id: "ranch", title: "Rancho", href: "/ranch", icon: Building },
  { id: "settings", title: "Configuración", href: "/settings", icon: Settings },
];

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, className = "" }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = {
    name: "Dr. María González",
    role: "Veterinaria Principal",
  };

  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  // Función actualizada para cerrar sesión
  const handleLogout = () => {
    // Limpiar cualquier dato de sesión almacenado
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();

    // Cerrar el menú de usuario
    setIsUserMenuOpen(false);

    // Redirigir a la página de autenticación (AuthPage que muestra LoginForm por defecto)
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-r from-[#2e8b57] to-[#3ca373] backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20 ${className}`}
      style={{ fontFamily: '"Freight Text Pro", "Georgia", serif' }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onToggleSidebar}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col gap-1.5 w-5 h-5">
                <div className="h-0.5 bg-white rounded-full" />
                <div className="h-0.5 bg-white rounded-full" />
                <div className="h-0.5 bg-white rounded-full" />
              </div>
            </motion.button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white text-xl font-bold">🐄</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-white drop-shadow-sm">
                  Bovino UJAT
                </h1>
                <p className="text-xs text-white/90 -mt-1">Gestión Ganadera</p>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-4 ml-6">
              {navigationItems
                .slice(0, 6)
                .map(({ id, title, href, icon: Icon }) => (
                  <Link
                    key={id}
                    to={href}
                    className={`text-sm font-medium text-white hover:text-white/90 flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                      location.pathname.startsWith(href)
                        ? "bg-white/20 backdrop-blur-sm"
                        : ""
                    }`}
                  >
                    <Icon size={16} className="text-white" />
                    <span>{title}</span>
                  </Link>
                ))}

              <motion.button
                onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                whileHover={{ scale: 1.05 }}
                className="text-sm font-medium text-white hover:text-white/90 flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
              >
                Más
                <motion.div
                  animate={{ rotate: isNavMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-white" />
                </motion.div>
              </motion.button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              {!isSearchOpen ? (
                <motion.button
                  onClick={() => setIsSearchOpen(true)}
                  whileHover={{ scale: 1.1 }}
                  className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <Search size={20} className="text-white" />
                </motion.button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-64 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                  >
                    <X size={16} />
                  </motion.button>
                </motion.form>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 relative"
            >
              <Bell size={20} className="text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </motion.button>

            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <User size={18} className="text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white drop-shadow-sm">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-white/90">
                    {currentUser.role}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-white" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-50 p-4"
                  >
                    <div className="text-sm text-stone-800 font-medium mb-2">
                      {currentUser.name}
                    </div>
                    <div className="text-sm text-stone-600 mb-4">
                      {currentUser.role}
                    </div>
                    <div className="space-y-1">
                      <Link
                        to="/settings/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Configuración
                      </Link>

                      <div className="border-t border-stone-200 my-2"></div>

                      <motion.button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Menú desplegable "Más" */}
      <AnimatePresence>
        {isNavMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black/10 backdrop-blur-sm border-t border-white/10"
          >
            <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {navigationItems
                .slice(6)
                .map(({ id, title, href, icon: Icon }) => (
                  <Link
                    key={id}
                    to={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:text-white/90 hover:bg-white/10 transition-all duration-200 ${
                      location.pathname.startsWith(href) ? "bg-white/20" : ""
                    }`}
                    onClick={() => setIsNavMenuOpen(false)}
                  >
                    <Icon size={16} className="text-white" />
                    <span>{title}</span>
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
