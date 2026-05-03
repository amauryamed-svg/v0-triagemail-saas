"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Play, X } from "lucide-react"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function Screen1Hook() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <section className="snap-start min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16">
      {/* Grid sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow blobs */}
      <div
        className="absolute -top-40 -right-40 w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.22) 0%, rgba(124,122,237,0.08) 35%, rgba(124,122,237,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.14) 0%, rgba(124,122,237,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 lg:mb-8 flex flex-wrap items-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/85 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live · TriageMail
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Gestora estratégica de comunicaciones internas
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            · Vercel Zero to Agent
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-sm sm:text-base text-foreground/70 italic"
        >
          Buenos días, Miranda.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
          className="font-bold tracking-tight text-foreground leading-[0.92]"
          style={{
            fontSize: "clamp(2.75rem, 9.5vw, 11rem)",
            letterSpacing: "-0.035em",
          }}
        >
          Me llevo tu inbox
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #FFFFFF 0%, #C9C7FF 45%, #7C7AED 100%)",
            }}
          >
            los sábados.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 lg:mt-10 text-muted-foreground leading-snug max-w-4xl"
          style={{ fontSize: "clamp(1.125rem, 2.4vw, 2rem)" }}
        >
          Tú apruebas. Yo nunca envío sola.{" "}
          <span className="text-foreground/70">Tres minutos para empezar.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 lg:mt-12 flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          <button
            type="button"
            onClick={() => setDemoOpen(true)}
            aria-label="Ver demo de Emily — 12 segundos"
            className="group flex items-center gap-3 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand flex items-center justify-center p-1.5 shadow-lg shadow-brand/30 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-brand/40">
                <EmilyAvatar />
              </div>
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background transition-transform duration-300 group-hover:scale-110"
              >
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current translate-x-[1px]" />
              </span>
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Te lo firma
              </span>
              <span className="text-base sm:text-lg font-semibold text-foreground">
                Emily — tu asistente
              </span>
              <span className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-brand opacity-80 group-hover:opacity-100 transition">
                ▸ Ver demo · 12s
              </span>
            </div>
          </button>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Built on
            </span>
            <span className="text-sm font-medium text-foreground/80">
              v0 · Anthropic · Supabase · Vercel
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue — ↓ pulsante en bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3], y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>

      {/* Demo modal — abre al click sobre Emily */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-[min(95vw,1280px)] sm:!max-w-[min(95vw,1280px)] p-0 gap-0 border-white/10 bg-background/95 backdrop-blur-sm overflow-hidden"
        >
          <DialogTitle className="sr-only">Demo de Emily — 12 segundos</DialogTitle>
          <div className="relative" style={{ aspectRatio: "16 / 9" }}>
            <video
              key={demoOpen ? "open" : "closed"}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/landing/demo-tour.mp4" type="video/mp4" />
            </video>
            <button
              type="button"
              onClick={() => setDemoOpen(false)}
              aria-label="Cerrar demo"
              className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
