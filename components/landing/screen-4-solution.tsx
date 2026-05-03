"use client"

import { useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"
import type { ProblemKey } from "@/app/page"

interface Props {
  selected: ProblemKey | null
}

const SOLUTIONS: Record<
  ProblemKey,
  {
    headline: string
    body: string
    proof: string
  }
> = {
  donor: {
    headline: "Para los donantes que te buscan en WhatsApp + Mail:",
    body: "Emily detecta cuando un mismo contacto te escribe en dos canales en menos de una hora. Sube urgencia automáticamente. Te tiene el draft listo el sábado, en TU voz clonada, esperando solo tu OK desde el teléfono.",
    proof:
      "Mira: Patricia (Bezos Earth Fund) escribió por WhatsApp y mail esta semana. Emily ya tiene tu respuesta lista — borrador empático que protege tu sábado y respeta su deadline.",
  },
  mye: {
    headline: "Para reportes M&E que esperan tu firma:",
    body: "Emily detecta adjuntos que requieren firma con deadline. Bloquea 30 minutos en tu calendario el viernes para revisarlos en bloque, en lugar de fragmentarte entre reuniones. El draft a tu equipo de campo ya está hecho.",
    proof:
      "Mira: el reporte M&E del Q1 de Yunguilla vence mañana 5pm para liberar el desembolso. Emily ya bloqueó tu jueves 11-12 y dejó el draft a Lucía Morales con las observaciones del comité técnico.",
  },
  wg: {
    headline: "Para working groups con 30 personas en CC:",
    body: "Emily distingue 'to me' vs 'for visibility' en CCs largos. Solo te muestra los hilos donde tu decisión cambia algo. Y cuando hay punto de votación inminente, sugiere llamada bilateral 24h antes para alinear posición.",
    proof:
      "Mira: el WG Amazonía tiene observaciones a un acta hasta el viernes 5pm. Emily detectó el punto 6 (posición país en agua) que requiere coordinación con Ministerio. Ya tienes draft de respuesta + propuesta de llamada con Carlos (PNUD).",
  },
  compliance: {
    headline: "Para adjuntos de auditoría que se acumulan:",
    body: "Emily reconoce formularios de auditoría (anti-corrupción, due diligence, beneficiarios finales). Bloquea un bloque continuo de 2 horas en tu calendario para llenarlos sin fragmentar — fragmentar es la mejor forma de cometer un error.",
    proof:
      "Mira: KPMG mandó 3 formularios para firmar antes del 20 mayo. Emily bloqueó tu martes 14 mayo 2-4pm. Una sola sesión, sin distracciones. Cero error.",
  },
}

export function Screen4Solution({ selected }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand mb-4"
        >
          Cómo lo resuelve Emily
        </motion.p>

        <AnimatePresence mode="wait">
          {selected === null ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2
                className="font-bold tracking-tight text-foreground/40 leading-[0.95]"
                style={{
                  fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Elige tu problema arriba.
                <br />
                <span className="text-foreground/25">Te muestro cómo lo resuelvo.</span>
              </h2>
              <p className="text-muted-foreground/70">
                Scroll arriba ↑ para personalizar.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-8 lg:space-y-10"
            >
              <h2
                className="font-bold tracking-tight text-foreground leading-[1.05]"
                style={{
                  fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {SOLUTIONS[selected].headline}
              </h2>

              <p
                className="text-muted-foreground leading-relaxed max-w-3xl"
                style={{ fontSize: "clamp(1.05rem, 1.9vw, 1.4rem)" }}
              >
                {SOLUTIONS[selected].body}
              </p>

              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl border border-brand/30 bg-brand/[0.05]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand flex items-center justify-center p-1.5 shrink-0">
                  <EmilyAvatar />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-brand font-medium mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Emily, en tu inbox real
                  </p>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    {SOLUTIONS[selected].proof}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
