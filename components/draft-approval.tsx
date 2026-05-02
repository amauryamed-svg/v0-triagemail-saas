"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Send, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AudioPlayer } from "./audio-player"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DraftApprovalProps {
  mode: "senior-review" | "automode"
  draftBody: string
  audioSrc?: string
  reasoning: {
    urgency: string
    importance: string
    deadline?: string
    pushCount?: number
  }
  onApprove: () => void
  onEdit: (newBody: string) => void
  onReject: () => void
  className?: string
}

export function DraftApproval({
  mode,
  draftBody,
  audioSrc,
  reasoning,
  onApprove,
  onEdit,
  onReject,
  className,
}: DraftApprovalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState(draftBody)
  const [showReasoning, setShowReasoning] = useState(false)

  const handleApprove = () => {
    toast("Listo. Enviado.")
    onApprove()
  }

  const handleSaveEdit = () => {
    onEdit(editedBody)
    setIsEditing(false)
    toast("Listo. Borrador actualizado.")
  }

  const handleReject = () => {
    onReject()
    toast("Borrador descartado.")
  }

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-surface", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="font-medium text-foreground">Borrador propuesto</h3>
        <Badge 
          variant="outline" 
          className="border-brand/30 text-brand bg-brand/10"
        >
          {mode === "senior-review" ? "Senior Review" : "Automode"}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Draft Body */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="min-h-[200px] bg-white/[0.02] border-white/[0.06] resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {editedBody.length} caracteres
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedBody(draftBody)
                    setIsEditing(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="bg-brand hover:bg-brand/90 text-white"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {draftBody}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              {draftBody.length} caracteres
            </span>
          </div>
        )}

        {/* Audio Player for Automode */}
        {mode === "automode" && audioSrc && (
          <AudioPlayer src={audioSrc} />
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApprove}
            className="flex-1 bg-brand hover:bg-brand/90 text-white gap-2 active:scale-[0.98] transition-transform"
          >
            <Send className="w-4 h-4" />
            Aprobar y enviar
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="ghost"
            onClick={handleReject}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
            Rechazar
          </Button>
        </div>
      </div>

      {/* Reasoning Collapsible */}
      <div className="border-t border-white/[0.06]">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between p-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>¿Por qué este borrador?</span>
          {showReasoning ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Urgencia</span>
                  <span className="text-foreground">{reasoning.urgency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Importancia</span>
                  <span className="text-foreground">{reasoning.importance}</span>
                </div>
                {reasoning.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deadline detectado</span>
                    <span className="text-foreground">{reasoning.deadline}</span>
                  </div>
                )}
                {reasoning.pushCount && reasoning.pushCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cross-platform pushes</span>
                    <span className="text-foreground">{reasoning.pushCount}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
