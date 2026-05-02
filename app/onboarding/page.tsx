"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Eye, Pen, Mic, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ModeCard } from "@/components/mode-card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const steps = [
  { id: 1, title: "Conecta" },
  { id: 2, title: "Voz" },
  { id: 3, title: "Modo" },
]

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

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleGoogleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsConnecting(false)
    toast("Listo. Gmail conectado.")
    setCurrentStep(2)
  }

  const handleVoiceComplete = () => {
    toast("Listo. Voz guardada.")
    setCurrentStep(3)
  }

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
  }

  const handleComplete = () => {
    if (!selectedMode) return
    toast("Listo. Configuración completada.")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/[0.06] bg-surface">
        {/* Stepper */}
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep > step.id
                      ? "bg-brand text-white"
                      : currentStep === step.id
                        ? "bg-brand/20 text-brand border border-brand/30"
                        : "bg-white/[0.04] text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-px mx-2",
                      currentStep > step.id ? "bg-brand" : "bg-white/[0.06]"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Step 1: Connect Gmail */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div>
                  <CardTitle className="text-xl mb-2">Conecta tu Gmail</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Necesitamos permisos para leer, etiquetar y crear borradores. Nunca enviamos sin tu aprobación.
                  </CardDescription>
                </div>

                <Button
                  onClick={handleGoogleConnect}
                  disabled={isConnecting}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 gap-3"
                >
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continuar con Google
                </Button>
              </motion.div>
            )}

            {/* Step 2: Voice Clone */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">Clona tu voz en 15 segundos</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Lee en voz alta: &quot;Hola, soy [tu nombre]. Estoy descansando este fin de semana, pero mi agente te responderá puntualmente.&quot;
                  </CardDescription>
                </div>

                <VoiceRecorder onComplete={handleVoiceComplete} duration={15} />
              </motion.div>
            )}

            {/* Step 3: Mode Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <CardTitle className="text-xl mb-2">Elige tu modo por defecto</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Puedes cambiarlo después desde el panel de configuración.
                  </CardDescription>
                </div>

                <div className="space-y-3">
                  {modes.map((mode) => (
                    <ModeCard
                      key={mode.id}
                      icon={mode.icon}
                      title={mode.title}
                      description={mode.description}
                      footer={mode.footer}
                      isActive={selectedMode === mode.id}
                      isRecommended={mode.isRecommended}
                      onClick={() => handleModeSelect(mode.id)}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={!selectedMode}
                  className="w-full h-12 bg-brand hover:bg-brand/90 text-white"
                >
                  Completar configuración
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
