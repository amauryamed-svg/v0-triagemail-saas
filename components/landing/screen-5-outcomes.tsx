"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const OUTCOMES = [
  "Tu lunes 7am va a ser café, no triaje.",
  "Las decisiones del sábado se sienten como del lunes.",
  "Tu donante escucha tu voz un domingo, sin que tú la grabes.",
]

export function Screen5Outcomes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full flex items-center justify-center px-6 sm:px-10 lg:px-16"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand mb-6"
        >
          Esto es lo que vas a sentir
        </motion.p>

        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {OUTCOMES.map((outcome, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.55, ease: "easeOut" }}
              className="flex items-start gap-4 sm:gap-6"
            >
              <span
                className="text-brand font-bold leading-none mt-1"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
              >
                →
              </span>
              <h3
                className="font-bold tracking-tight text-foreground leading-[1.1]"
                style={{
                  fontSize: "clamp(1.5rem, 4.5vw, 3.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {outcome}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
