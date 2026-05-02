"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Pen, Mic } from "lucide-react"
import { ModeCard } from "@/components/mode-card"
import { toast } from "sonner"

const modes = [
  {
    id: "informativo",
    icon: Eye,
    title: "Informativo",
    description: "Solo te resumo. No respondo nada.",
    footer: "Latencia <100ms · Haiku 4.5",
  },
  {
    id: "senior-review",
    icon: Pen,
    title: "Senior Review",
    description: "Preparo borradores listos. Tú apruebas.",
    footer: "Recomendado · Sonnet 4.6",
    isRecommended: true,
  },
  {
    id: "automode",
    icon: Mic,
    title: "Automode",
    description: "Respondo con tu voz clonada tras tu OK rápido.",
    footer: "Para comerciales · Opus 4.7",
  },
]

export default function ModesPage() {
  const [activeMode, setActiveMode] = useState("senior-review")

  const handleModeSelect = (modeId: string) => {
    setActiveMode(modeId)
    const mode = modes.find(m => m.id === modeId)
    toast(`Listo. Modo cambiado a ${mode?.title}.`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Selecciona tu modo
        </h1>
        <p className="text-muted-foreground">
          Elige cómo quieres que tu agente procese los correos entrantes.
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ModeCard
              icon={mode.icon}
              title={mode.title}
              description={mode.description}
              footer={mode.footer}
              isActive={activeMode === mode.id}
              isRecommended={mode.isRecommended}
              onClick={() => handleModeSelect(mode.id)}
              className="h-[280px]"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
