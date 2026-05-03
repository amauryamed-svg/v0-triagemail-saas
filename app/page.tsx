"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Github, Sparkles, Vote } from "lucide-react"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"
import { Button } from "@/components/ui/button"

/**
 * Intro landing — el HOOK como protagonista visual.
 *
 * El hook ocupa la mayor parte de la pantalla con tipografía gigante
 * (clamp() para escalar fluido, hasta ~10rem en desktop).
 * Emily aparece como firma con avatar pequeño abajo del hook, no
 * compite por atención.
 * Dos glow blobs + grid background sutil para profundidad cinemática.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col">
      {/* Grid background sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow top-right */}
      <div
        className="absolute -top-32 -right-32 sm:-top-48 sm:-right-48 w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.22) 0%, rgba(124,122,237,0.08) 35%, rgba(124,122,237,0) 70%)",
        }}
      />
      {/* Glow bottom-left */}
      <div
        className="absolute -bottom-32 -left-32 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.14) 0%, rgba(124,122,237,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 flex-1 flex flex-col justify-center py-16 lg:py-20">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-brand mb-8 lg:mb-12"
        >
          TriageMail · AI-Powered Mail Triage Agent · Vercel Zero to Agent
        </motion.p>

        {/* HERO HOOK — el protagonista absoluto */}
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

        {/* Sub-hook */}
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

        {/* Firma Emily — avatar chico inline + nombre */}
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

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-10 lg:mt-14 flex flex-col sm:flex-row gap-3"
        >
          <Link href="/onboarding" className="contents">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white gap-2 h-14 px-8 text-base font-medium active:scale-[0.98] transition-transform shadow-xl shadow-brand/20"
            >
              Empezar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="contents">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-base font-medium border-white/[0.1] hover:bg-white/[0.04]"
            >
              Ver demo
            </Button>
          </Link>
          <a
            href="https://github.com/amauryamed-svg/v0-triagemail-saas"
            target="_blank"
            rel="noopener noreferrer"
            className="contents"
          >
            <Button
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto h-14 px-7 text-base font-medium gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </a>
        </motion.div>

        {/* Hackathon footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="mt-12 lg:mt-20 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Submitted to</span>
          <a
            href="https://community.vercel.com/hackathons/zero-to-agent/showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-brand underline underline-offset-4 decoration-brand/40 transition-colors font-medium inline-flex items-center gap-1"
          >
            Vercel Zero to Agent
            <Vote className="w-3.5 h-3.5" />
          </a>
          <span className="opacity-40">·</span>
          <span>Track 2 — v0 + MCPs</span>
          <span className="opacity-40">·</span>
          <span className="text-brand font-medium">#ZeroToAgent</span>
        </motion.div>
      </div>
    </main>
  )
}
