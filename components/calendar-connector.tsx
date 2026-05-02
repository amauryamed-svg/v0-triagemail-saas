"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Check, 
  Shield, 
  Clock,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarConnectorProps {
  onComplete: () => void
  onSkip?: () => void
  className?: string
}

export function CalendarConnector({ 
  onComplete, 
  onSkip,
  className 
}: CalendarConnectorProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "syncing" | "connected">("idle")
  const [eventsFound, setEventsFound] = useState(0)

  const handleConnect = async () => {
    setStatus("connecting")
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setStatus("syncing")
    
    // Simulate calendar sync
    for (let i = 0; i <= 23; i++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setEventsFound(i)
    }
    
    setStatus("connected")
    
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Google Calendar Visual */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Calendar className="w-12 h-12 text-[#4285F4]" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 text-brand" />
                </motion.div>
              </div>
            </div>

            {/* Permissions Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-calm shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Emily necesita ver tu calendario
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Para sugerirte ventanas óptimas de respuesta, proteger tus bloques de focus, 
                    y avisarte de conflictos antes de que se conviertan en problemas.
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              {[
                "Detectar ventanas disponibles para respuestas",
                "Proteger bloques de trabajo profundo",
                "Identificar conflictos de calendario",
                "Sugerir time-blocking automático"
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="w-4 h-4 text-calm" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConnect}
                className="w-full bg-white text-black hover:bg-white/90 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Conectar Google Calendar
              </Button>
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Omitir por ahora
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {(status === "connecting" || status === "syncing") && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-8 space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center">
                <Calendar className="w-12 h-12 text-[#4285F4]" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand flex items-center justify-center"
              >
                <Loader2 className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                {status === "connecting" ? "Conectando..." : "Sincronizando eventos..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {status === "syncing" && `${eventsFound} eventos encontrados`}
              </p>
            </div>

            {status === "syncing" && (
              <div className="w-full max-w-xs">
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(eventsFound / 23) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {status === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-calm/20 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-calm" />
            </motion.div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Calendario conectado
              </p>
              <p className="text-xs text-muted-foreground">
                {eventsFound} eventos sincronizados. Emily ya puede optimizar tu tiempo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
