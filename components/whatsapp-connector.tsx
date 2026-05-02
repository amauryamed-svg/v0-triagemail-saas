"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, MessageCircle, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface WhatsAppConnectorProps {
  onComplete: () => void
  onSkip?: () => void
}

type ConnectionStep = "phone" | "qr" | "verifying" | "connected"

export function WhatsAppConnector({ onComplete, onSkip }: WhatsAppConnectorProps) {
  const [step, setStep] = useState<ConnectionStep>("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+52")

  const handleSendCode = () => {
    if (phoneNumber.length >= 10) {
      setStep("qr")
      // Simulate QR scan after 3 seconds
      setTimeout(() => {
        setStep("verifying")
        setTimeout(() => {
          setStep("connected")
          setTimeout(onComplete, 1000)
        }, 1500)
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Conecta tu WhatsApp para recibir alertas instantáneas cuando lleguen correos críticos.
            </p>

            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 h-12 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                <option value="+52">+52</option>
                <option value="+1">+1</option>
                <option value="+34">+34</option>
                <option value="+54">+54</option>
                <option value="+57">+57</option>
                <option value="+56">+56</option>
              </select>
              <Input
                type="tel"
                placeholder="55 1234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className="flex-1 h-12 bg-white/[0.02] border-white/[0.06] text-lg tracking-wide"
              />
            </div>

            <Button
              onClick={handleSendCode}
              disabled={phoneNumber.length < 10}
              className="w-full h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Vincular WhatsApp
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

        {step === "qr" && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-center"
          >
            {/* QR Code placeholder */}
            <div className="mx-auto w-48 h-48 rounded-2xl bg-white p-4 relative overflow-hidden">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMTYwIDE2MCI+PHJlY3QgZmlsbD0iI2ZmZiIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiLz48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTQ4IDBoOHY4aC04ek02NCAwaDh2OGgtOHpNODAgMGg0MHY0MEg4MHpNMTIwIDBoOHY4aC04ek0xNDQgMGg4djhoLTh6TTE1MiAwaDh2OGgtOHpNMCAxNmg4djhoLTh6TTMyIDE2aDh2OGgtOHpNNTYgMTZoOHY4aC04ek02NCAxNmg4djhoLTh6TTcyIDE2aDh2OGgtOHpNODAgMTZoOHY4aC04ek0xMTIgMTZoOHY4aC04ek0xMjggMTZoOHY4aC04ek0xNTIgMTZoOHY4aC04ek0wIDI0aDh2OGgtOHpNMTYgMjRoOHY4aC04ek0zMiAyNGg4djhoLTh6TTU2IDI0aDh2OGgtOHpNNjQgMjRoOHY4aC04ek04MCAyNGg4djhoLTh6TTk2IDI0aDh2OGgtOHpNMTEyIDI0aDh2OGgtOHpNMTI4IDI0aDh2OGgtOHpNMTQ0IDI0aDh2OGgtOHpNMTUyIDI0aDh2OGgtOHpNMCAzMmg4djhoLTh6TTE2IDMyaDh2OGgtOHpNMzIgMzJoOHY4aC04ek02NCAzMmg4djhoLTh6TTgwIDMyaDh2OGgtOHpNOTYgMzJoOHY4aC04ek0xMTIgMzJoOHY4aC04ek0xMjggMzJoOHY4aC04ek0xNDQgMzJoOHY4aC04ek0xNTIgMzJoOHY4aC04ek0wIDQwaDh2OGgtOHpNMzIgNDBoOHY4aC04ek01NiA0MGg4djhoLTh6TTY0IDQwaDh2OGgtOHpNNzIgNDBoOHY4aC04ek04MCA0MGg4djhoLTh6TTk2IDQwaDh2OGgtOHpNMTA0IDQwaDh2OGgtOHpNMTEyIDQwaDh2OGgtOHpNMTI4IDQwaDh2OGgtOHpNMTUyIDQwaDh2OGgtOHpNMCA0OGg0MHY4SDB6TTU2IDQ4aDh2OGgtOHpNNzIgNDhoOHY4aC04ek04OCA0OGg4djhoLTh6TTEwNCA0OGg4djhoLTh6TTEyMCA0OGg0MHY4aC00MHoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-contain" />
              
              {/* Scanning animation */}
              <motion.div
                className="absolute inset-x-0 h-1 bg-[#25D366]/50"
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            <div>
              <p className="text-foreground font-medium">Escanea con WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                Abre WhatsApp &gt; Dispositivos vinculados &gt; Vincular dispositivo
              </p>
            </div>
          </motion.div>
        )}

        {step === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-center py-8"
          >
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-[#25D366]/20 border-t-[#25D366] animate-spin" />
            <p className="text-muted-foreground">Verificando conexión...</p>
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
              className="mx-auto w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <p className="text-foreground font-medium">WhatsApp conectado</p>
              <p className="text-sm text-muted-foreground">
                {countryCode} {phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
