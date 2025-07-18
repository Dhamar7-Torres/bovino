import React from "react";
import { motion, Variants } from "framer-motion";

// Propiedades del componente AnimatedText
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  variant?:
    | "fadeIn"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "typewriter"
    | "bounce";
  staggerChildren?: number;
  once?: boolean;
  onAnimationComplete?: () => void;
}

// Variantes de animación para diferentes efectos
const textVariants: Record<string, Variants> = {
  // Efecto fade in básico
  fadeIn: {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  },

  // Efecto slide up
  slideUp: {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },

  // Efecto slide down
  slideDown: {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },

  // Efecto slide desde la izquierda
  slideLeft: {
    hidden: {
      opacity: 0,
      x: -100,
      rotateY: -45,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
    },
  },

  // Efecto slide desde la derecha
  slideRight: {
    hidden: {
      opacity: 0,
      x: 100,
      rotateY: 45,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
    },
  },

  // Efecto bounce
  bounce: {
    hidden: {
      opacity: 0,
      scale: 0,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
  },
};

// Variante especial para efecto typewriter
const typewriterVariants: Variants = {
  hidden: {},
  visible: {},
};

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
};

/**
 * Componente AnimatedText para mostrar texto con animaciones suaves
 * Utiliza Framer Motion para crear efectos visuales atractivos
 *
 * @param text - El texto a mostrar
 * @param variant - Tipo de animación a aplicar
 * @param delay - Retraso antes de iniciar la animación
 * @param duration - Duración de la animación
 * @param staggerChildren - Retraso entre animaciones de caracteres (para typewriter)
 * @param once - Si la animación debe ejecutarse solo una vez
 * @param className - Clases CSS adicionales
 * @param onAnimationComplete - Callback cuando la animación termina
 */
const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  variant = "fadeIn",
  staggerChildren = 0.05,
  once = true,
  onAnimationComplete,
}) => {
  // Configuración de transición basada en la variante
  const getTransitionConfig = () => {
    switch (variant) {
      case "bounce":
        return {
          type: "spring" as const,
          damping: 15,
          stiffness: 300,
          duration,
          delay,
        };
      case "slideUp":
      case "slideDown":
        return {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        };
      case "slideLeft":
      case "slideRight":
        return {
          duration: duration * 1.3,
          delay,
          ease: "easeOut" as const,
        };
      default:
        return {
          duration,
          delay,
          ease: "easeOut" as const,
        };
    }
  };

  // Para el efecto typewriter, dividimos el texto en caracteres
  if (variant === "typewriter") {
    return (
      <motion.div
        className={`inline-block ${className}`}
        variants={typewriterVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.3 }}
        onAnimationComplete={onAnimationComplete}
        transition={{
          staggerChildren,
          delayChildren: delay,
        }}
        style={{
          willChange: "transform",
          perspective: "1000px",
        }}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
            style={{
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  // Para otros efectos, usamos las variantes correspondientes
  const selectedVariant = textVariants[variant];

  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      transition={getTransitionConfig()}
      onAnimationComplete={onAnimationComplete}
      style={{
        willChange: "transform",
        perspective: "1000px",
      }}
    >
      {text}
    </motion.div>
  );
};

export default AnimatedText;
