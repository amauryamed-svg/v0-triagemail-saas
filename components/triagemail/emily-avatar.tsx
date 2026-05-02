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
      {/* Afro redondo — un halo grande + bumps de textura en el perímetro */}
      <motion.g
        animate={{ y: [0, -0.35, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Volumen principal — círculo grande que enmarca la cara */}
        <circle cx="16" cy="14" r="11.2" fill="white" />
        {/* Bumps de textura — pequeños círculos en el perímetro para
            romper la línea perfecta y dar el rizado natural */}
        <circle cx="5.5" cy="11.5" r="2.6" fill="white" />
        <circle cx="26.5" cy="11.5" r="2.6" fill="white" />
        <circle cx="9" cy="5" r="2.4" fill="white" />
        <circle cx="23" cy="5" r="2.4" fill="white" />
        <circle cx="16" cy="3.2" r="2.7" fill="white" />
        <circle cx="6.2" cy="17.5" r="2.4" fill="white" />
        <circle cx="25.8" cy="17.5" r="2.4" fill="white" />
      </motion.g>

      {/* Cara — compacta y proporcional, mujer joven */}
      <ellipse cx="16" cy="18.5" rx="4.6" ry="5.1" fill="white" />

      {/* Cuello */}
      <rect x="14.4" y="22.5" width="3.2" height="3" rx="0.6" fill="white" />

      {/* Lentes — redondos delicados, la firma */}
      <g stroke="#0A0A0B" strokeWidth="0.85" fill="none">
        <circle cx="13.8" cy="17.6" r="1.9" />
        <circle cx="18.2" cy="17.6" r="1.9" />
        <line x1="15.7" y1="17.6" x2="16.3" y2="17.6" strokeLinecap="round" />
        {/* Patilla izquierda */}
        <line x1="11.9" y1="17.55" x2="11" y2="17.4" strokeLinecap="round" />
        {/* Patilla derecha */}
        <line x1="20.1" y1="17.55" x2="21" y2="17.4" strokeLinecap="round" />
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
        <circle cx="13.8" cy="17.6" r="0.72" fill="#0A0A0B" />
        <circle cx="18.2" cy="17.6" r="0.72" fill="#0A0A0B" />
      </motion.g>

      {/* Sonrisa sutil — friendly */}
      <path
        d="M14.3 21.2 Q16 22.2 17.7 21.2"
        stroke="#0A0A0B"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  )
}
