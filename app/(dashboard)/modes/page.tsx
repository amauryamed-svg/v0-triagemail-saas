"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Pen, Mic, Mail, PhoneCall, MessageCircle } from "lucide-react"
import { ModeCard } from "@/components/mode-card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
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

type ChannelKey = "email_voice" | "oncall" | "onvoice"

const automodeChannels: {
  id: ChannelKey
  icon: typeof Mail
  iconColor: string
  title: string
  description: string
}[] = [
  {
    id: "email_voice",
    icon: Mail,
    iconColor: "rgb(124, 122, 237)",
    title: "Email + nota de voz adjunta",
    description: "Responde por correo con un MP3 de 15s en tu voz.",
  },
  {
    id: "oncall",
    icon: PhoneCall,
    iconColor: "rgb(61, 214, 140)",
    title: "OnCall — llamada de vuelta",
    description: "Emily llama al destinatario y lee tu mensaje en tu voz clonada.",
  },
  {
    id: "onvoice",
    icon: MessageCircle,
    iconColor: "rgb(37, 211, 102)",
    title: "OnVoice — mensaje de WhatsApp",
    description: "Envía un memo de voz al WhatsApp del contacto. Sin levantar el teléfono.",
  },
]

export default function ModesPage() {
  const [activeMode, setActiveMode] = useState("senior-review")
  const [activeChannels, setActiveChannels] = useState<Record<ChannelKey, boolean>>({
    email_voice: true,
    oncall: false,
    onvoice: false,
  })

  const handleModeSelect = (modeId: string) => {
    setActiveMode(modeId)
    const mode = modes.find(m => m.id === modeId)
    toast(`Listo. Modo cambiado a ${mode?.title}.`)
  }

  const toggleChannel = (id: ChannelKey) => {
    setActiveChannels((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      const enabled = automodeChannels.filter((c) => next[c.id]).map((c) => c.title)
      toast(
        enabled.length > 0
          ? `Canal ${next[id] ? "activado" : "desactivado"}. ${enabled.length} activo${enabled.length === 1 ? "" : "s"}.`
          : "Sin canales activos. Automode no podrá responder.",
      )
      return next
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Selecciona tu modo
        </h1>
        <p className="text-muted-foreground">
          Elige cómo quieres que Emily procese los correos entrantes.
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

      {/* Sub-section: canales de respuesta de Automode */}
      <AnimatePresence>
        {activeMode === "automode" && (
          <motion.section
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 12, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Canales de respuesta · Automode
              </h2>
              <p className="text-sm text-muted-foreground">
                Selecciona por dónde puede responder Emily con tu voz clonada. No solo correo.
              </p>
            </div>

            <div className="grid gap-3">
              {automodeChannels.map((channel) => {
                const enabled = activeChannels[channel.id]
                return (
                  <div
                    key={channel.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border bg-surface transition-colors",
                      enabled
                        ? "border-brand/40 hover:border-brand/60"
                        : "border-white/[0.06] hover:bg-white/[0.02]",
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: enabled ? `${channel.iconColor}20` : "rgba(255,255,255,0.04)",
                        color: enabled ? channel.iconColor : "rgb(161, 161, 170)",
                      }}
                    >
                      <channel.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{channel.title}</h3>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Emily nunca envía sin tu aprobación, incluso en Automode. Si activas OnCall u OnVoice, te llega la notificación con preview antes de que el mensaje salga.
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
