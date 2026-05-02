"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, PhoneCall, Sparkles, CheckCircle2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type MeetEval = {
  recommendation: "meeting" | "email"
  confidence: number
  reasoning: string
  applied_triggers: string[]
  meeting_proposal?: {
    suggested_time_iso: string
    duration_minutes: number
    title: string
    agenda: string[]
    expected_outcome: string
  }
  email_alternative?: { body: string }
  emily_briefing: string
}

type Contact = {
  id: string
  name: string | null
  email: string | null
  whatsapp_phone: string | null
  contact_type: string
  organization: string | null
  role: string | null
  type_label?: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  contact: Contact | null
}

export function SyncActionsSheet({ open, onOpenChange, contact }: Props) {
  const [evaluation, setEvaluation] = useState<MeetEval | null>(null)
  const [loading, setLoading] = useState(false)
  const [callPlaying, setCallPlaying] = useState(false)
  const [callProgress, setCallProgress] = useState(0)

  useEffect(() => {
    if (!open || !contact) return
    setEvaluation(null)
    setLoading(true)
    fetch("/api/meet/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact_id: contact.id }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setEvaluation(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open, contact])

  // Simulación visual del OnCall (15s)
  useEffect(() => {
    if (!callPlaying) return
    const start = Date.now()
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 15000) * 100)
      setCallProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          toast(`Llamada completada. ${contact?.name?.split(" ")[0] ?? "El contacto"} escuchó tu mensaje.`)
          setCallPlaying(false)
          setCallProgress(0)
        }, 600)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [callPlaying, contact])

  if (!contact) return null
  const firstName = contact.name?.split(" ")[0] ?? "el contacto"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-1 text-left">
          <p className="text-[10px] font-medium uppercase tracking-wider text-brand">
            Acciones sync · Emily
          </p>
          <SheetTitle className="text-base">{contact.name}</SheetTitle>
          <SheetDescription className="text-xs">
            {[contact.organization, contact.role, contact.type_label].filter(Boolean).join(" · ")}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="meet" className="mt-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="meet">Reunión</TabsTrigger>
            <TabsTrigger value="oncall">OnCall</TabsTrigger>
          </TabsList>

          {/* ============================== TAB: REUNIÓN ============================== */}
          <TabsContent value="meet" className="space-y-4 pt-5">
            {loading || !evaluation ? (
              <div className="text-sm text-muted-foreground py-12 text-center">
                Emily está evaluando…
              </div>
            ) : (
              <>
                {/* Veredicto */}
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    evaluation.recommendation === "meeting"
                      ? "border-calm/40 bg-calm/[0.05]"
                      : "border-white/[0.08] bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] uppercase tracking-wider text-brand font-medium">
                      Veredicto de Emily
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Confianza {Math.round(evaluation.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {evaluation.recommendation === "meeting" ? (
                      <>
                        <strong className="text-calm">Sí, agenda reunión.</strong>{" "}
                        {evaluation.reasoning}
                      </>
                    ) : (
                      <>
                        <strong className="text-foreground">No, esto era un correo.</strong>{" "}
                        {evaluation.reasoning}
                      </>
                    )}
                  </p>
                </div>

                {/* Propuesta de reunión */}
                {evaluation.recommendation === "meeting" && evaluation.meeting_proposal && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/[0.06] bg-surface p-4 space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1.5">
                        {evaluation.meeting_proposal.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(evaluation.meeting_proposal.suggested_time_iso).toLocaleString(
                            "es-MX",
                            {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {evaluation.meeting_proposal.duration_minutes} min
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                        Agenda
                      </p>
                      <ul className="space-y-1.5">
                        {evaluation.meeting_proposal.agenda.map((item, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-2 leading-relaxed">
                            <span className="text-muted-foreground/70">{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        Outcome esperado
                      </p>
                      <p className="text-xs text-foreground/85 leading-relaxed">
                        {evaluation.meeting_proposal.expected_outcome}
                      </p>
                    </div>

                    <Button
                      onClick={() => toast(`Invite enviado a ${firstName}.`)}
                      className="w-full bg-brand hover:bg-brand/90 text-white gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Enviar invite a {firstName}
                    </Button>
                  </motion.div>
                )}

                {/* Alternativa: correo */}
                {evaluation.recommendation === "email" && evaluation.email_alternative && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/[0.06] bg-surface p-4 space-y-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      En su lugar, este correo:
                    </p>
                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                      {evaluation.email_alternative.body}
                    </p>
                    <Button
                      onClick={() => toast("Borrador creado en Bandeja.")}
                      className="w-full bg-brand hover:bg-brand/90 text-white"
                    >
                      Crear borrador
                    </Button>
                  </motion.div>
                )}

                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {evaluation.emily_briefing}
                </p>
              </>
            )}
          </TabsContent>

          {/* ============================== TAB: ONCALL ============================== */}
          <TabsContent value="oncall" className="space-y-4 pt-5">
            <div className="rounded-xl border border-white/[0.06] bg-surface p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-calm/15 text-calm flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    Llamada en tu voz clonada
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Emily marca a {firstName} y lee el mensaje en tu voz (≈15s).
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Mensaje a leer
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Hola {firstName}, llamada rápida en mi voz. Confirmo el envío del documento el domingo 8pm. Cualquier ajuste de scope antes, márcame al móvil. Gracias.
                </p>
              </div>

              {callPlaying ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-calm font-medium inline-flex items-center gap-2">
                      <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-calm opacity-60 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-calm" />
                      </span>
                      En llamada · leyendo en tu voz
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {Math.round((callProgress / 100) * 15)}s / 15s
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-calm transition-all duration-100"
                      style={{ width: `${callProgress}%` }}
                    />
                  </div>
                  {/* Waveform fake */}
                  <div className="flex items-end justify-center gap-0.5 h-8 pt-2">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-sm bg-calm/60"
                        style={{
                          height: `${30 + Math.sin((callProgress / 8) + i * 0.5) * 25 + Math.random() * 15}%`,
                          transition: "height 100ms",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setCallPlaying(true)}
                  className="w-full gap-2 bg-calm/90 hover:bg-calm text-black"
                >
                  <PhoneCall className="w-4 h-4" />
                  Simular llamada en tu voz
                </Button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
              En producción, OnCall integra Twilio Voice + ElevenLabs streaming TTS.
              Para el demo del hackathon, esta es la simulación visual del flujo.
              Emily nunca llama sin tu aprobación, incluso en Automode.
            </p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
