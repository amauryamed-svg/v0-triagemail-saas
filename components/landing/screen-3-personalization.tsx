"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check, MessageCircle, FileSignature, Users, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProblemKey } from "@/app/page"

interface Props {
  selected: ProblemKey | null
  onSelect: (p: ProblemKey) => void
}

const PROBLEMS: {
  id: ProblemKey
  icon: typeof MessageCircle
  title: string
  hint: string
  color: string
}[] = [
  {
    id: "donor",
    icon: MessageCircle,
    title: "Cliente o donante que escribe en WhatsApp + email al mismo tiempo",
    hint: "Cross-canal · pulso de relación, no urgencia automática",
    color: "rgb(124, 122, 237)",
  },
  {
    id: "mye",
    icon: FileSignature,
    title: "Entregables al cliente que esperan mi firma antes del cierre",
    hint: "Reportes con deadline · finanzas, M&E, status del trimestre",
    color: "rgb(245, 165, 36)",
  },
  {
    id: "wg",
    icon: Users,
    title: "Comités multi-org con 30 personas en CC y nadie sabe quién decide",
    hint: "Working groups · 'to me' vs 'for visibility'",
    color: "rgb(61, 214, 140)",
  },
  {
    id: "compliance",
    icon: Paperclip,
    title: "Compliance, auditoría o due diligence que se acumulan sin llenar",
    hint: "Anti-corrupción · KYC · beneficiarios finales · ESG",
    color: "rgb(229, 72, 77)",
  },
]

export function Screen3Personalization({ selected, onSelect }: Props) {
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
          Personalízalo
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-bold tracking-tight text-foreground leading-[0.95] mb-10 lg:mb-14"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
            letterSpacing: "-0.025em",
          }}
        >
          ¿Cuál es tu peor parte
          <br />
          del inbox?
        </motion.h2>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {PROBLEMS.map((p, i) => {
            const isActive = selected === p.id
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => onSelect(p.id)}
                className={cn(
                  "relative text-left p-5 sm:p-6 rounded-2xl border bg-surface transition-all active:scale-[0.99]",
                  isActive
                    ? "border-brand/60 bg-brand/[0.06] shadow-lg shadow-brand/10"
                    : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? `${p.color}25` : "rgba(255,255,255,0.04)",
                      color: isActive ? p.color : "rgb(161, 161, 170)",
                    }}
                  >
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-medium text-foreground text-base sm:text-lg leading-snug mb-1">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{p.hint}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-muted-foreground text-center sm:text-left"
        >
          Elige uno. Emily te muestra cómo lo resuelve abajo. ↓
        </motion.p>
      </div>
    </section>
  )
}
