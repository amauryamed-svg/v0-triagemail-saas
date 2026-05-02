"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DraftApproval } from "@/components/draft-approval"
import { cn } from "@/lib/utils"

type Thread = {
  id: string
  subject: string
  participants: { name: string; email: string }[]
  messages: { id: string; sender: string; senderEmail: string; timestamp: string; body: string; isCollapsed: boolean }[]
  draft: {
    mode: "senior-review" | "automode"
    body: string
    reasoning: { urgency: string; importance: string; deadline?: string; pushCount?: number }
  }
}

// Mock fallback — usado cuando Supabase no está seedeado.
const MOCK_THREAD: Thread = {
  id: "1",
  subject: "Urgente: Revisión del contrato antes del lunes",
  participants: [
    { name: "Carlos Mendoza", email: "carlos@acme.com" },
    { name: "Amaury", email: "amaury@company.com" },
  ],
  messages: [
    {
      id: "msg-1",
      sender: "Carlos Mendoza",
      senderEmail: "carlos@acme.com",
      timestamp: "Viernes 10:30 AM",
      body: "Hola Amaury,\n\nEspero que estés teniendo un buen día. Te escribo porque necesito tu revisión del contrato de servicios con el nuevo cliente antes del lunes.\n\nEl cliente está esperando nuestra respuesta y me gustaría tener tu aprobación antes de enviarlo.\n\n¿Podrías darle una revisión este fin de semana?\n\nSaludos,\nCarlos",
      isCollapsed: false,
    },
    {
      id: "msg-2",
      sender: "Amaury",
      senderEmail: "amaury@company.com",
      timestamp: "Viernes 2:15 PM",
      body: "Carlos,\n\nGracias por el aviso. Lo reviso y te confirmo.\n\nAmaury",
      isCollapsed: true,
    },
    {
      id: "msg-3",
      sender: "Carlos Mendoza",
      senderEmail: "carlos@acme.com",
      timestamp: "Sábado 8:00 AM",
      body: "Hola Amaury,\n\nSolo dando seguimiento al contrato. ¿Pudiste revisarlo?\n\nEl deadline es el lunes a las 9 AM hora Ciudad de México.\n\nQuedo atento,\nCarlos",
      isCollapsed: false,
    },
  ],
  draft: {
    mode: "senior-review",
    body: "Hola Carlos,\n\nGracias por el recordatorio. Ya revisé el contrato y todo se ve en orden. Puedes proceder con el envío al cliente.\n\nSolo una observación menor: en la cláusula 4.2 sobre los tiempos de entrega, sugiero cambiar \"30 días hábiles\" por \"25 días hábiles\" para darnos un margen de seguridad.\n\nFuera de eso, tienes luz verde para enviarlo.\n\nSaludos,\nAmaury",
    reasoning: {
      urgency: "Alto - Deadline mencionado explícitamente",
      importance: "5/5 - Contrato con cliente nuevo",
      deadline: "Lunes 9:00 AM",
      pushCount: 2,
    },
  },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DraftPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(
    new Set(MOCK_THREAD.messages.filter(m => m.isCollapsed).map(m => m.id))
  )
  const [realDraftId, setRealDraftId] = useState<string | null>(null)
  const [thread, setThread] = useState<Thread>(MOCK_THREAD)

  // Hidrata desde Supabase si existe el draft real para este email_id.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/drafts/${id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.draft) return
        setRealDraftId(data.draft.id)
        const e = data.email
        const d = data.draft
        const urgencyLabel: Record<string, string> = {
          critical: "Crítico — Deadline detectado",
          high: "Alto — Requiere atención hoy",
          med: "Medio",
          normal: "Medio",
          low: "Bajo",
        }
        setThread({
          id: e.gmail_msg_id ?? id,
          subject: e.subject ?? "(sin asunto)",
          participants: [
            { name: e.from_name ?? "", email: e.from_email ?? "" },
          ],
          messages: [
            {
              id: "real-msg",
              sender: e.from_name ?? e.from_email ?? "(desconocido)",
              senderEmail: e.from_email ?? "",
              timestamp: "Reciente",
              body: e.snippet ?? "",
              isCollapsed: false,
            },
          ],
          draft: {
            mode: d.mode_generated === "automode" ? "automode" : "senior-review",
            body: d.body,
            reasoning: {
              urgency: urgencyLabel[e.urgency] ?? e.urgency,
              importance: `${e.importance}/5`,
              deadline: e.deadline_detected_at
                ? new Date(e.deadline_detected_at).toLocaleString("es-MX")
                : undefined,
              pushCount: data.push_count ?? 0,
            },
          },
        })
      })
      .catch(() => {
        // silent fallback to mock
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const toggleCollapse = (messageId: string) => {
    setCollapsedMessages(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const handleApprove = async () => {
    if (realDraftId) {
      try {
        const r = await fetch(`/api/drafts/${realDraftId}/approve`, { method: "POST" })
        if (!r.ok) throw new Error("approve failed")
      } catch {
        toast("No pudimos enviar. Reintenta en un momento.")
        return
      }
    }
    router.push("/dashboard")
  }

  const handleEdit = (_newBody: string) => {
    // Edit persistence queda como TODO (no bloqueante para demo).
  }

  const handleReject = async () => {
    if (realDraftId) {
      try {
        await fetch(`/api/drafts/${realDraftId}/reject`, { method: "POST" })
      } catch {
        // silenciamos en el demo
      }
    }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Volver a Bandeja
          </Button>
        </Link>
      </div>

      {/* Subject */}
      <h1 className="text-xl font-semibold text-foreground mb-6">
        {thread.subject}
      </h1>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left: Thread */}
        <div className="space-y-4">
          {thread.messages.map((message, index) => {
            const isCollapsed = collapsedMessages.has(message.id)
            const initials = message.sender.split(" ").map(n => n[0]).join("").slice(0, 2)
            const isLast = index === thread.messages.length - 1

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-xl border border-white/[0.06] bg-surface overflow-hidden",
                  isLast && "ring-1 ring-brand/20"
                )}
              >
                {/* Header */}
                <button
                  onClick={() => toggleCollapse(message.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-white/5 text-muted-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {message.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    {isCollapsed && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {message.body.split("\n")[0]}
                      </p>
                    )}
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Body */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-11">
                      {message.body}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Right: Draft Approval */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <DraftApproval
            mode={thread.draft.mode}
            draftBody={thread.draft.body}
            reasoning={thread.draft.reasoning}
            onApprove={handleApprove}
            onEdit={handleEdit}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  )
}
