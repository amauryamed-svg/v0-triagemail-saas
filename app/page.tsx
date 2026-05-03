"use client"

import { useEffect, useState } from "react"
import { Screen1Hook } from "@/components/landing/screen-1-hook"
import { Screen2Problem } from "@/components/landing/screen-2-problem"
import { Screen3Personalization } from "@/components/landing/screen-3-personalization"
import { Screen4Solution } from "@/components/landing/screen-4-solution"
import { Screen5Outcomes } from "@/components/landing/screen-5-outcomes"
import { Screen6Magic } from "@/components/landing/screen-6-magic"
import { Screen7QuickWin } from "@/components/landing/screen-7-quickwin"
import { Screen8CTA } from "@/components/landing/screen-8-cta"

export type ProblemKey = "donor" | "mye" | "wg" | "compliance"

const STORAGE_KEY = "triagemail-landing-problem"

/**
 * Viral landing — 8 screens en scroll-snap vertical.
 * Framework: Hook → Problem → Personalización → Solution → Outcomes →
 *            Show Magic → Quick Win → CTA.
 *
 * El state `selectedProblem` se eleva aquí y se pasa a Screen 3 (set)
 * + Screen 4 (read) + Screen 7 (read para sample correo). Persiste en
 * localStorage para que un refresh respete el pick.
 */
export default function LandingPage() {
  const [selected, setSelected] = useState<ProblemKey | null>(null)

  // Hidrata desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(STORAGE_KEY) as ProblemKey | null
    if (stored && ["donor", "mye", "wg", "compliance"].includes(stored)) {
      setSelected(stored)
    }
  }, [])

  const handleSelect = (p: ProblemKey) => {
    setSelected(p)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, p)
    }
  }

  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-scroll bg-background scroll-smooth">
      <Screen1Hook />
      <Screen2Problem />
      <Screen3Personalization selected={selected} onSelect={handleSelect} />
      <Screen4Solution selected={selected} />
      <Screen5Outcomes />
      <Screen6Magic />
      <Screen7QuickWin selected={selected} />
      <Screen8CTA />
    </main>
  )
}
