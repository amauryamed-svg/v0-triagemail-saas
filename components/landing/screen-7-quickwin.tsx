"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"
import type { ProblemKey } from "@/app/page"

interface Props {
  selected: ProblemKey | null
}

const SAMPLE_TEXTS: Record<ProblemKey, string> = {
  donor:
    "Hola, necesito que revises la propuesta antes del lunes 9am. También te escribí por WhatsApp porque el comité interno define el lunes la asignación 2026-2028. ¿Puedes confirmar si llegamos? Patricia · Bezos Earth Fund",
  mye:
    "Adjunto el reporte trimestral del proyecto Yunguilla con baseline + indicadores de salvaguardas. Te lo mandé también por WA. Lo necesita finanzas mañana antes de las 5pm para cerrar el desembolso del trimestre. Lucía",
  wg:
    "Comparto la versión 1 del acta del 8º comité técnico WG Amazonía. Recibimos observaciones hasta el viernes 17h00 para circular versión final. Atención al punto 6 sobre posición país en agua. Secretaría",
  compliance:
    "Conforme al cronograma, requerimos los formularios firmados (Anexo 1 anti-corrupción, Anexo 2 due diligence proveedores, Anexo 3 declaración beneficiarios finales) antes del 20 de mayo. KPMG Auditoría",
}

export function Screen7QuickWin({ selected }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    summary: string
    durationMs: number
    cached?: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const useSample = () => {
    const sample = selected ? SAMPLE_TEXTS[selected] : SAMPLE_TEXTS.donor
    setText(sample)
    setResult(null)
    setError(null)
  }

  const handleSummarize = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await fetch("/api/quickwin/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      })
      if (!r.ok) throw new Error("response not ok")
      const data = await r.json()
      setResult(data)
    } catch {
      setError("Emily se distrajo un segundo. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand mb-4"
        >
          Tu turno · Quick win en 5 segundos
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-bold tracking-tight text-foreground leading-[0.95] mb-6 lg:mb-8"
          style={{
            fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Pega cualquier correo.
          <br />
          <span className="text-foreground/80">Emily te lo resume.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-3"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aquí el correo más largo de tu inbox..."
            rows={5}
            className="w-full rounded-2xl border border-white/[0.08] bg-surface p-4 sm:p-5 text-base text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-colors"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSummarize}
              disabled={loading || text.trim().length < 20}
              className="bg-brand hover:bg-brand/90 text-white gap-2 h-11 px-6 active:scale-[0.98] transition-transform shadow-lg shadow-brand/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Emily está leyendo…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Resumir con Emily
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={useSample}
              className="text-muted-foreground hover:text-foreground"
            >
              ¿Sin correo a la mano? Usa uno de ejemplo
            </Button>
          </div>
        </motion.div>

        {/* Resultado */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-6 flex items-start gap-4 p-5 sm:p-6 rounded-2xl border border-brand/40 bg-brand/[0.05]"
            >
              <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center p-1.5 shrink-0">
                <EmilyAvatar />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-brand font-medium mb-2 flex items-center gap-2">
                  Emily · Resumen ≤150 chars
                  {result.cached && (
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground text-[9px]">
                      demo cache
                    </span>
                  )}
                </p>
                <p className="text-base sm:text-lg text-foreground leading-relaxed">
                  {result.summary}
                </p>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {result.summary.length} caracteres ·{" "}
                  {(result.durationMs / 1000).toFixed(1)}s ·{" "}
                  {result.cached ? "demo response" : "Claude Haiku 4.5"}
                </p>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm text-[#E5484D]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-muted-foreground inline-flex items-center gap-2"
        >
          Imagínate esto en cada correo de tu bandeja, los sábados.{" "}
          <ArrowRight className="w-4 h-4" />
        </motion.p>
      </div>
    </section>
  )
}
