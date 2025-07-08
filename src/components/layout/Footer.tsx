import React from "react";
import { motion } from "framer-motion";
import { Beef } from "lucide-react";

// Props del componente Footer
interface FooterProps {
  className?: string;
  variant?: "full" | "minimal";
}

const Footer: React.FC<FooterProps> = ({
  className = "",
  variant = "full",
}) => {
  // Versión minimal del footer para páginas específicas
  if (variant === "minimal") {
    return (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-[#F5F5DC] border-t border-[#D3D3D3] px-6 py-3 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
              <Beef className="text-white" size={14} />
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-sm">
                Bovino UJAT
              </span>
              <span className="text-xs text-[#7b766d] ml-2">v2.0.0</span>
            </div>
          </div>

          {/* Copyright y enlaces mínimos */}
          <div className="flex items-center gap-3 text-xs text-[#7b766d]">
            <span>© 2025 Bovino UJAT</span>
            <span>•</span>
            <a
              href="/privacy"
              className="hover:text-gray-700 transition-colors"
            >
              Privacidad
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700 transition-colors">
              Términos
            </a>
          </div>
        </div>
      </motion.footer>
    );
  }

  // Versión completa simplificada - solo copyright y logo
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-[#F5F5DC] border-t border-[#D3D3D3] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4e9c75] to-[#3d7a5c] rounded-lg flex items-center justify-center shadow-sm">
              <Beef className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Bovino UJAT
              </h3>
              <p className="text-xs text-[#7b766d]">
                Gestión Ganadera Inteligente
              </p>
            </div>
          </div>

          {/* Copyright y información legal */}
          <div className="flex flex-col md:flex-row items-center gap-3 text-sm text-[#7b766d]">
            <span>© 2025 Bovino UJAT. Todos los derechos reservados.</span>
            <span className="hidden md:inline">•</span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium border border-gray-300">
              Proyecto Universitario UJAT
            </span>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-[#D3D3D3] mt-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7b766d]">
            {/* Enlaces legales */}
            <div className="flex items-center gap-3">
              <a
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Política de Privacidad
              </a>
              <span>|</span>
              <a
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                Términos de Uso
              </a>
              <span>|</span>
              <a
                href="/cookies"
                className="hover:text-gray-700 transition-colors"
              >
                Cookies
              </a>
            </div>

            {/* Ubicación */}
            <div className="text-center">
              <span>Orgullosamente desarrollado en Tabasco, México 🇲🇽</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
