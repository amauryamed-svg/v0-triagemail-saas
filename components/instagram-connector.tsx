"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Instagram, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InstagramConnectorProps {
  onComplete: () => void
  onSkip?: () => void
}

type ConnectionStep = "connect" | "authorizing" | "connected"

export function InstagramConnector({ onComplete, onSkip }: InstagramConnectorProps) {
  const [step, setStep] = useState<ConnectionStep>("connect")

  const handleConnect = () => {
    setStep("authorizing")
    // Simulate OAuth flow
    setTimeout(() => {
      setStep("connected")
      setTimeout(onComplete, 1000)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "connect" && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Conecta tu Instagram para detectar cuando un contacto te escribe por DM y también por email.
            </p>

            <Button
              onClick={handleConnect}
              className="w-full h-12 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white gap-2"
            >
              <Instagram className="w-5 h-5" />
              Conectar Instagram
              <ExternalLink className="w-4 h-4 ml-1 opacity-60" />
            </Button>

            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Omitir por ahora
              </button>
            )}
          </motion.div>
        )}

        {step === "authorizing" && (
          <motion.div
            key="authorizing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-center py-8"
          >
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-[#833AB4]/20 border-t-[#833AB4] animate-spin" />
            <div>
              <p className="text-foreground font-medium">Autorizando...</p>
              <p className="text-sm text-muted-foreground">
                Completa la autorización en la ventana de Instagram
              </p>
            </div>
          </motion.div>
        )}

        {step === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <p className="text-foreground font-medium">Instagram conectado</p>
              <p className="text-sm text-muted-foreground">
                @amaury_ceo
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
