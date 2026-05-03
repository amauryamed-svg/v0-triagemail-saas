"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export function Screen2Problem() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full flex items-center justify-center px-6 sm:px-10 lg:px-16 relative"
    >
      <div
        className="absolute -top-32 right-1/4 w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(229,72,77,0.18) 0%, rgba(229,72,77,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-bold tracking-tight text-foreground leading-[0.95]"
          style={{
            fontSize: "clamp(2.25rem, 7vw, 6.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          7am del lunes.
          <br />
          <span className="text-[#E5484D]">200 correos esperando.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-10 lg:mt-14 space-y-3 sm:space-y-4 text-muted-foreground leading-relaxed max-w-3xl"
          style={{ fontSize: "clamp(1.05rem, 2vw, 1.5rem)" }}
        >
          <p>Donantes que querían respuesta el sábado.</p>
          <p>Auditorías que vencen mañana.</p>
          <p>Working groups con 30 personas en CC y nadie sabe quién decide.</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 lg:mt-16 text-foreground/85 font-medium"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
        >
          Y tu sábado pasado, ya te lo gastó la bandeja.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="mt-8 italic text-muted-foreground/70 text-base sm:text-lg"
        >
          Esto no es productividad. Es supervivencia.
        </motion.p>
      </div>
    </section>
  )
}
