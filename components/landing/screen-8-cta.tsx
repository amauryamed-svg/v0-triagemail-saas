"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Github, Sparkles, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmilyAvatar } from "@/components/triagemail/emily-avatar"

export function Screen8CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-30%" })

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(124,122,237,0.18) 0%, rgba(124,122,237,0) 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
          animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-brand flex items-center justify-center p-2 mb-8 shadow-2xl shadow-brand/40"
        >
          <EmilyAvatar />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="font-bold tracking-tight text-foreground leading-[1.05]"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 4.5rem)",
            letterSpacing: "-0.025em",
          }}
        >
          Listo para estar al día
          <br />
          <span className="text-foreground/80">con las responsabilidades?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Ya conoces a Emily. Conecta tu Gmail y devuélvete tu sábado.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/onboarding" className="contents">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white gap-2 h-14 px-8 text-base font-medium shadow-xl shadow-brand/30 active:scale-[0.98] transition-transform"
            >
              Empezar — gratis los primeros 30 días
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="contents">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-base font-medium border-white/[0.1] hover:bg-white/[0.04]"
            >
              Continuar como demo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-muted-foreground"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.85 }}
          className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground"
        >
          <a
            href="https://github.com/amauryamed-svg/v0-triagemail-saas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            github.com/amauryamed-svg/v0-triagemail-saas
          </a>
          <span className="opacity-40">·</span>
          <span>⭐ Si te sirve la idea</span>
        </motion.div>
      </div>
    </section>
  )
}
