"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Check, X, Pencil } from "lucide-react"

const TARGET_COUNT = 47
const DURATION_MS = 30_000

const SAMPLE_CARDS = [
  {
    id: 1,
    sender: "Mariana · CFO Cliente Acme",
    subject: "Renovación contrato Q2 — necesito cierre",
    node: "Cliente",
    emilyDid: "Tradujo a registro formal-numérico · cita marco MoU",
    label: "BORRADOR LISTO",
    color: "rgb(124,122,237)",
    icon: Pencil,
  },
  {
    id: 2,
    sender: "Comité Directivo · Acta Q1",
    subject: "Pre-lectura punto 6 antes del jueves 17h",
    node: "Comité multi-org",
    emilyDid: "Calibró posición país · agendó pre-lectura",
    label: "BORRADOR LISTO",
    color: "rgb(124,122,237)",
    icon: Pencil,
  },
  {
    id: 3,
    sender: "Patricia · Donante",
    subject: "WhatsApp + email mismo día sobre desembolso",
    node: "Donante",
    emilyDid: "Verificó congruencia cross-canal · consolidó respuesta",
    label: "ATENTO AQUÍ",
    color: "rgb(229,72,77)",
    icon: Check,
  },
  {
    id: 4,
    sender: "KPMG · Compliance",
    subject: "Anexo 2 due diligence vence 20 may",
    node: "Compliance",
    emilyDid: "Marcó deadline duro · bloqueó 2h continuas",
    label: "EN COLA",
    color: "rgb(245,165,36)",
    icon: Pencil,
  },
  {
    id: 5,
    sender: "Devex Newsletter",
    subject: "Top stories de la semana",
    node: "Press",
    emilyDid: "Newsletter sin respuesta requerida",
    label: "ELIMINADO",
    color: "rgb(161,161,170)",
    icon: X,
  },
]

export function Screen6Magic() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })
  const [count, setCount] = useState(0)
  const [drafts, setDrafts] = useState(0)

  useEffect(() => {
    if (!inView) {
      setCount(0)
      setDrafts(0)
      return
    }
    const start = Date.now()
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / DURATION_MS)
      setCount(Math.round(TARGET_COUNT * t))
      setDrafts(Math.round(5 * t))
      if (t >= 1) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [inView])

  const progress = (count / TARGET_COUNT) * 100

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-bold tracking-tight text-foreground leading-[0.95] mb-12"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
            letterSpacing: "-0.025em",
          }}
        >
          Emily tría
          <br />
          <span className="text-brand tabular-nums">{count}</span>
          <span className="text-foreground/85"> correos en 30 segundos.</span>
        </motion.h2>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full bg-brand"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="text-foreground font-semibold tabular-nums">{drafts}</span>{" "}
              borradores listos
            </span>
            <span className="tabular-nums">
              {Math.round((progress / 100) * 30)}s / 30s
            </span>
          </div>
        </div>

        {/* Sample cards — borradores procesados por Emily, con la acción
            explícita ("Emily redactó / verificó / calibró ...") visible.
            Cubren los nodos típicos del consultor en interinstitucionalidad:
            cliente, comité multi-org, donante cross-canal, compliance, press. */}
        <div className="space-y-3">
          {SAMPLE_CARDS.map((card, i) => {
            const showAt = (i + 1) * (1 / SAMPLE_CARDS.length) * 0.95
            const visible = progress >= showAt * 100
            const Icon = card.icon
            return (
              <motion.div
                key={card.id}
                animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {card.sender}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 shrink-0">
                      · {card.node}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{card.subject}</p>
                  <p className="mt-1.5 text-[11px] text-brand/85 truncate flex items-center gap-1">
                    <span className="text-brand/60">▸ Emily:</span>
                    {card.emilyDid}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0 mt-0.5"
                  style={{
                    background: `${card.color}15`,
                    color: card.color,
                    border: `1px solid ${card.color}30`,
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {card.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
