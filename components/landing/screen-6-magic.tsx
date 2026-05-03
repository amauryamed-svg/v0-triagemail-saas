"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"

const TARGET_COUNT = 47
const DURATION_MS = 30_000

export function Screen6Magic() {
  const ref = useRef(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })
  const [count, setCount] = useState(0)
  const [drafts, setDrafts] = useState(0)

  useEffect(() => {
    if (!inView) {
      setCount(0)
      setDrafts(0)
      videoRef.current?.pause()
      return
    }
    videoRef.current?.play().catch(() => {})
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
          className="font-bold tracking-tight text-foreground leading-[0.95] mb-10"
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

        {/* Demo tour real — Bandeja → Contactos → Modos → Ajustes */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          style={{ aspectRatio: "16 / 9" }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Tour del producto: Bandeja, Contactos, Modos, Ajustes"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/landing/demo-tour.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </div>
    </section>
  )
}
