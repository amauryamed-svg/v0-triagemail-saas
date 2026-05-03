"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Eye,
  Check,
  Clock,
  MessageCircle,
  Zap,
  Instagram,
  Flag,
  Star,
  Paperclip,
  Pin,
  PinOff,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UrgencyBadge } from "./urgency-badge"
import { ImportanceBadge } from "./importance-badge"
import { cn } from "@/lib/utils"

export interface Email {
  id: string
  senderName: string
  senderEmail: string
  senderAvatar?: string
  subject: string
  summary: string
  timestamp: string
  urgency: "urgent" | "medium" | "low"
  importance: 1 | 2 | 3 | 4 | 5
  hasDraft?: boolean
  crossPlatformPushes?: number
  whatsappDoubleTrigger?: boolean
  instagramDoubleTrigger?: boolean
  multiChannelTrigger?: boolean
  // Convenciones de email reformuladas a la voz de Emily.
  // Heurísticas derivadas si no vienen explícitas (ver lógica abajo).
  isRead?: boolean
  hasAttachments?: boolean
}

interface EmailCardProps {
  email: Email
  className?: string
}

const PIN_STORAGE_KEY = "triagemail:pinned-emails"

function readPinnedSet(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = window.localStorage.getItem(PIN_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writePinnedSet(set: Set<string>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(Array.from(set)))
}

export function EmailCard({ email, className }: EmailCardProps) {
  const initials = email.senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Convenciones de email — heurísticas derivadas para no requerir DB migration:
  //   bandera roja  → urgency === "urgent"           (Emily: "Atento aquí")
  //   estrella      → importance >= 4                (Emily: "Marcado importante")
  //   no leído      → email.isRead === false         (Emily: "No revisado contigo")
  //   adjuntos      → email.hasAttachments === true  (📎)
  //   pin           → localStorage por email.id      (Emily: "Anclado")
  const isFlagged = email.urgency === "urgent"
  const isStarred = email.importance >= 4
  const isUnread = email.isRead === false
  const hasAttachments = email.hasAttachments === true

  const [isPinned, setIsPinned] = useState(false)
  useEffect(() => {
    setIsPinned(readPinnedSet().has(email.id))
  }, [email.id])

  const togglePin = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const set = readPinnedSet()
    if (set.has(email.id)) set.delete(email.id)
    else set.add(email.id)
    writePinnedSet(set)
    setIsPinned(set.has(email.id))
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface transition-colors",
        email.hasDraft && "border-l-2 border-l-brand",
        isPinned && "border-l-2 border-l-amber-400/60",
        isUnread && "bg-white/[0.025]",
        className
      )}
    >
      {/* Pin handle — convención clásica anclar arriba, voz de Emily "Anclado" */}
      <button
        type="button"
        onClick={togglePin}
        aria-label={isPinned ? "Anclado — clic para desanclar" : "Anclar este correo arriba"}
        title={isPinned ? "Anclado" : "Anclar"}
        className={cn(
          "absolute top-2 left-2 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors",
          isPinned
            ? "text-amber-400 hover:bg-amber-400/10"
            : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:bg-white/[0.04] hover:text-muted-foreground"
        )}
      >
        {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
      </button>

      {/* Avatar */}
      <Avatar className="w-10 h-10 shrink-0 ml-4">
        <AvatarImage src={email.senderAvatar} alt={email.senderName} />
        <AvatarFallback className="bg-white/5 text-muted-foreground text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Punto de "no revisado contigo" — convención no leído */}
          {isUnread && (
            <span
              aria-label="No revisado contigo"
              title="No revisado contigo"
              className="w-1.5 h-1.5 rounded-full bg-brand shrink-0"
            />
          )}
          <span
            className={cn(
              "font-medium truncate",
              isUnread ? "text-foreground" : "text-foreground/85"
            )}
          >
            {email.senderName}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {email.senderEmail}
          </span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {email.timestamp}
          </span>
        </div>

        <h3 className="font-medium text-foreground mb-1 truncate flex items-center gap-1.5">
          {/* Bandera roja — Emily: "Atento aquí" */}
          {isFlagged && (
            <Flag
              className="w-3.5 h-3.5 text-urgent fill-urgent shrink-0"
              aria-label="Atento aquí"
            />
          )}
          {/* Estrella — Emily: "Marcado importante" */}
          {isStarred && !isFlagged && (
            <Star
              className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0"
              aria-label="Marcado importante"
            />
          )}
          <span className="truncate">{email.subject}</span>
          {/* Adjunto — convención clásica, sin texto */}
          {hasAttachments && (
            <Paperclip
              className="w-3.5 h-3.5 text-muted-foreground shrink-0"
              aria-label="Tiene adjuntos"
            />
          )}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-1">
          {email.summary}
        </p>
      </div>

      {/* Badges — se desvanecen al hover para que las acciones tomen su espacio */}
      <div className="flex flex-col items-end gap-2 shrink-0 transition-opacity duration-150 group-hover:opacity-0 group-hover:pointer-events-none">
        <div className="flex items-center gap-2">
          <UrgencyBadge level={email.urgency} />
          <ImportanceBadge level={email.importance} />
        </div>
        
        {/* Multi-channel trigger badge */}
        {email.multiChannelTrigger && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-urgent/10 border border-urgent/20">
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
            <Zap className="w-3 h-3 text-urgent" />
            <span className="text-xs text-urgent font-medium">Multi-trigger</span>
          </div>
        )}

        {/* WhatsApp only trigger */}
        {email.whatsappDoubleTrigger && !email.multiChannelTrigger && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#25D366]/10 border border-[#25D366]/20">
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <Zap className="w-3 h-3 text-urgent" />
            <span className="text-xs text-[#25D366] font-medium">WA + Email</span>
          </div>
        )}

        {/* Instagram only trigger */}
        {email.instagramDoubleTrigger && !email.multiChannelTrigger && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#E1306C]/10 border border-[#E1306C]/20">
            <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
            <Zap className="w-3 h-3 text-urgent" />
            <span className="text-xs text-[#E1306C] font-medium">IG + Email</span>
          </div>
        )}
        
        {email.crossPlatformPushes && email.crossPlatformPushes > 0 && !email.whatsappDoubleTrigger && !email.instagramDoubleTrigger && !email.multiChannelTrigger && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>·{email.crossPlatformPushes}</span>
          </div>
        )}
      </div>

      {/* Hover Actions */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/drafts/${email.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Ver
          </Button>
        </Link>
        {email.hasDraft && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-brand hover:text-brand hover:bg-brand/10"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Aprobar
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Snooze
        </Button>
      </div>
    </motion.div>
  )
}
