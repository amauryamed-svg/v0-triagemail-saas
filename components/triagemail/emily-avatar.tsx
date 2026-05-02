"use client"

import { motion } from "framer-motion"

/**
 * Emily — avatar 2D animado para el logo de la sidebar.
 * Persona: glasses + curly hair (la "smart assistant" arquetipo).
 *
 * Animaciones:
 *   - Pelo crespo: bobble vertical sutil cada 3s.
 *   - Ojos: parpadeo cada ~4.5s.
 *   - Hover: tilt y scale leves.
 *
 * SVG inline 32x32 — escala con className. Diseñado para verse limpio
 * sobre fondo brand (#7C7AED) o sobre fondo dark.
 */
export function EmilyAvatar({ className = "w-full h-full" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      whileHover={{ rotate: -4, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
    >
      {/* Pelo crespo — cluster de puffs blancos */}
      <motion.g
        animate={{ y: [0, -0.4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="9" cy="11" r="3.6" fill="white" />
        <circle cx="13" cy="7.5" r="4" fill="white" />
        <circle cx="19" cy="7.5" r="4" fill="white" />
        <circle cx="23" cy="11" r="3.6" fill="white" />
        <circle cx="10.5" cy="14" r="3.4" fill="white" />
        <circle cx="21.5" cy="14" r="3.4" fill="white" />
        <circle cx="16" cy="6" r="3.6" fill="white" />
      </motion.g>

      {/* Cara ovalada */}
      <ellipse cx="16" cy="18" rx="5.4" ry="6.4" fill="white" />

      {/* Lentes redondos — la firma de Emily */}
      <g stroke="#0A0A0B" strokeWidth="0.95" fill="none">
        <circle cx="13.5" cy="17.2" r="2.15" />
        <circle cx="18.5" cy="17.2" r="2.15" />
        <line x1="15.65" y1="17.2" x2="16.35" y2="17.2" strokeLinecap="round" />
        {/* Patilla izquierda */}
        <line x1="11.4" y1="17.2" x2="10.5" y2="17" strokeLinecap="round" />
        {/* Patilla derecha */}
        <line x1="20.6" y1="17.2" x2="21.5" y2="17" strokeLinecap="round" />
      </g>

      {/* Ojos que parpadean */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          times: [0, 0.72, 0.76, 0.8, 1],
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "center", transformBox: "fill-box" } as React.CSSProperties}
      >
        <circle cx="13.5" cy="17.2" r="0.65" fill="#0A0A0B" />
        <circle cx="18.5" cy="17.2" r="0.65" fill="#0A0A0B" />
      </motion.g>

      {/* Sonrisa sutil */}
      <path
        d="M14 21.4 Q16 22.5 18 21.4"
        stroke="#0A0A0B"
        strokeWidth="0.75"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  )
}
