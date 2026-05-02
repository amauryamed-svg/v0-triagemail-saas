"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FileEdit, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const mockDrafts = [
  {
    id: "1",
    subject: "Urgente: Revisión del contrato antes del lunes",
    senderName: "Carlos Mendoza",
    senderEmail: "carlos@acme.com",
    preview: "Hola Carlos, gracias por el recordatorio. Ya revisé el contrato y todo se ve en orden...",
    mode: "senior-review",
    timestamp: "hace 2h",
  },
  {
    id: "2",
    subject: "Propuesta de colaboración Q2",
    senderName: "María García",
    senderEmail: "maria@startup.io",
    preview: "Hola María, los números de la propuesta se ven muy bien. Me gustaría programar una llamada...",
    mode: "senior-review",
    timestamp: "hace 4h",
  },
  {
    id: "3",
    subject: "Confirmación de la llamada del martes",
    senderName: "Javier López",
    senderEmail: "javier@inversiones.mx",
    preview: "Hola Javier, confirmado para el martes a las 10am. Te veo en Zoom...",
    mode: "automode",
    timestamp: "hace 5h",
  },
  {
    id: "5",
    subject: "Documentos firmados - Acuerdo de confidencialidad",
    senderName: "Ana Rodríguez",
    senderEmail: "ana@legal.co",
    preview: "Hola Ana, gracias por enviar los documentos. Los tengo archivados...",
    mode: "senior-review",
    timestamp: "hace 12h",
  },
]

export default function DraftsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Borradores pendientes
        </h1>
        <p className="text-muted-foreground">
          {mockDrafts.length} borradores esperando tu aprobación.
        </p>
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        {mockDrafts.map((draft, index) => {
          const initials = draft.senderName.split(" ").map(n => n[0]).join("").slice(0, 2)

          return (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/drafts/${draft.id}`}>
                <div
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface",
                    "hover:bg-white/[0.02] transition-colors cursor-pointer",
                    "border-l-2 border-l-brand"
                  )}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <FileEdit className="w-5 h-5 text-brand" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {draft.subject}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="border-brand/30 text-brand bg-brand/10 shrink-0"
                      >
                        {draft.mode === "senior-review" ? "Senior Review" : "Automode"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="bg-white/5 text-muted-foreground text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground truncate">
                        {draft.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {draft.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {draft.preview}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
