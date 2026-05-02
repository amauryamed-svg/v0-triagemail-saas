"use client"

import { useEffect, useState } from "react"

/**
 * Hook compartido para el modo activo de Emily.
 *
 * Persiste en localStorage + dispara un CustomEvent para que cualquier
 * componente montado (sidebar pill, /modes page, /onboarding) se sincronice
 * sin React Context.
 */

const STORAGE_KEY = "triagemail-active-mode"
const CHANGE_EVENT = "triagemail-mode-change"

export const MODE_LABELS = {
  informativo: "Informativo · Junior",
  "senior-review": "Senior Review",
  automode: "Automode",
} as const

export type ActiveModeId = keyof typeof MODE_LABELS

export function useActiveMode(defaultMode: ActiveModeId = "senior-review") {
  const [mode, setModeState] = useState<ActiveModeId>(defaultMode)

  useEffect(() => {
    // Initial read on mount
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(STORAGE_KEY) as ActiveModeId | null
    if (stored && stored in MODE_LABELS) setModeState(stored)

    // Listen for cross-component updates
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActiveModeId>).detail
      if (detail in MODE_LABELS) setModeState(detail)
    }
    window.addEventListener(CHANGE_EVENT, handler as EventListener)

    // Listen for changes from other browser tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in MODE_LABELS) {
        setModeState(e.newValue as ActiveModeId)
      }
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      window.removeEventListener(CHANGE_EVENT, handler as EventListener)
      window.removeEventListener("storage", storageHandler)
    }
  }, [])

  const setMode = (m: ActiveModeId) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, m)
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: m }))
    }
    setModeState(m)
  }

  return {
    mode,
    label: MODE_LABELS[mode],
    setMode,
  }
}
