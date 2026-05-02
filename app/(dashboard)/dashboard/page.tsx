"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Inbox } from "lucide-react"
import { EmailCard, Email } from "@/components/email-card"
import { cn } from "@/lib/utils"

const mockEmails: Email[] = [
  {
    id: "1",
    senderName: "Carlos Mendoza",
    senderEmail: "carlos@acme.com",
    subject: "Urgente: Revisión del contrato antes del lunes",
    summary: "Necesito tu aprobación para el contrato de servicios con el nuevo cliente. El deadline es el lunes a primera hora.",
    timestamp: "hace 2h",
    urgency: "urgent",
    importance: 5,
    hasDraft: true,
    crossPlatformPushes: 3,
    multiChannelTrigger: true,
  },
  {
    id: "2",
    senderName: "María García",
    senderEmail: "maria@startup.io",
    subject: "Propuesta de colaboración Q2",
    summary: "Te comparto la propuesta revisada para nuestra colaboración en el segundo trimestre. Los números se ven bien.",
    timestamp: "hace 4h",
    urgency: "medium",
    importance: 4,
    hasDraft: true,
    instagramDoubleTrigger: true,
  },
  {
    id: "3",
    senderName: "Javier López",
    senderEmail: "javier@inversiones.mx",
    subject: "Confirmación de la llamada del martes",
    summary: "Solo confirmo que nos vemos el martes a las 10am por Zoom. Te envío el enlace más tarde.",
    timestamp: "hace 5h",
    urgency: "low",
    importance: 3,
    hasDraft: true,
    whatsappDoubleTrigger: true,
  },
  {
    id: "4",
    senderName: "Newsletter Tech",
    senderEmail: "news@tech.daily",
    subject: "Las 5 tendencias de IA que definirán el 2026",
    summary: "Resumen semanal de tecnología: avances en modelos de lenguaje, nuevas regulaciones europeas, y más.",
    timestamp: "hace 8h",
    urgency: "low",
    importance: 1,
  },
  {
    id: "5",
    senderName: "Ana Rodríguez",
    senderEmail: "ana@legal.co",
    subject: "Documentos firmados - Acuerdo de confidencialidad",
    summary: "Los documentos ya están firmados por ambas partes. Te adjunto la versión final para tu archivo.",
    timestamp: "hace 12h",
    urgency: "low",
    importance: 2,
    hasDraft: true,
  },
]

const filters = [
  { id: "all", label: "Todos", count: 47 },
  { id: "critical", label: "Críticos", count: 3 },
  { id: "drafts", label: "Borradores pendientes", count: 5 },
  { id: "processed", label: "Procesados", count: 39 },
]

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredEmails = mockEmails.filter((email) => {
    if (activeFilter === "all") return true
    if (activeFilter === "critical") return email.urgency === "urgent"
    if (activeFilter === "drafts") return email.hasDraft
    if (activeFilter === "processed") return !email.hasDraft && email.urgency !== "urgent"
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Buenos días, Amaury
        </h1>
        <p className="text-muted-foreground">
          Tu agente revisó 47 correos esta noche. 3 necesitan tu atención.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              "active:scale-[0.98]",
              activeFilter === filter.id
                ? "bg-white/10 text-foreground"
                : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            )}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-60">({filter.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Email List */}
      <div className="space-y-3">
        {filteredEmails.length > 0 ? (
          filteredEmails.map((email, index) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EmailCard email={email} />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Bandeja al día
            </h3>
            <p className="text-muted-foreground">
              Disfruta el sábado.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
