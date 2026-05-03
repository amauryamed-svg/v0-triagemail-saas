"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Github, Sparkles, Vote } from "lucide-react"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"
import { Button } from "@/components/ui/button"

/**
 * Landing fullscreen responsive — la "OG image hecha página".
 * Reemplaza el redirect anterior a /onboarding.
 *
 * Avatar Emily gigante con clamp() para escalar fluido entre 180px
 * (mobile) y 360px (desktop). H1 con text-5xl → text-8xl.
 * 3 CTAs principales: Empezar (onboarding) · Ver demo · GitHub.
 * Footer con link al showcase del hackathon + hashtag.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Decorative glow — top right, lavender */}
      <div
        className="absolute -top-32 -right-32 sm:-top-48 sm:-right-48 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.22) 0%, rgba(124,122,237,0.08) 35%, rgba(124,122,237,0) 70%)",
        }}
      />
      {/* Decorative glow — bottom left, subtle */}
      <div
        className="absolute -bottom-32 -left-32 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(124,122,237,0.12) 0%, rgba(124,122,237,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-20 items-center">
          {/* Big Emily avatar */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
            className="mx-auto lg:mx-0"
            style={{
              width: "clamp(200px, 32vw, 380px)",
              height: "clamp(200px, 32vw, 380px)",
            }}
          >
            <div className="w-full h-full rounded-[2.5rem] lg:rounded-[3rem] bg-brand flex items-center justify-center p-4 lg:p-6 shadow-2xl shadow-brand/30">
              <EmilyAvatar />
            </div>
          </motion.div>

          {/* Copy */}
          <div className="space-y-6 lg:space-y-7 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand"
            >
              TriageMail · AI-Powered Mail Triage Agent
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.95]"
            >
              Hola, soy Emily.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Me llevo tu inbox los sábados. Tú apruebas. Yo nunca envío sola.
              <span className="block mt-2 text-foreground/85">
                Tres minutos para empezar.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start"
            >
              <Link href="/onboarding" className="contents">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white gap-2 h-12 px-7 text-base font-medium active:scale-[0.98] transition-transform"
                >
                  Empezar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard" className="contents">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 text-base font-medium border-white/[0.1] hover:bg-white/[0.04]"
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
                  className="w-full sm:w-auto h-12 px-6 text-base font-medium gap-2"
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
              transition={{ delay: 0.7 }}
              className="pt-6 lg:pt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground justify-center lg:justify-start"
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
        </div>
      </div>
    </main>
  )
}
