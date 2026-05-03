"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"

export function Screen1Hook() {
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
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-brand mb-8 lg:mb-12"
        >
          TriageMail · AI-Powered Mail Triage Agent · Vercel Zero to Agent
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
          <span className="text-foreground/85">los sábados.</span>
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
          className="mt-8 lg:mt-12 flex items-center gap-3"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand flex items-center justify-center p-1.5 shadow-lg shadow-brand/30">
            <EmilyAvatar />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Te lo firma
            </span>
            <span className="text-base sm:text-lg font-semibold text-foreground">
              Emily — tu asistente
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
    </section>
  )
}
