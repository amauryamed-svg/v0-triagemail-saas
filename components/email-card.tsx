"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Check, Clock, MessageCircle, Zap, Instagram } from "lucide-react"
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
}

interface EmailCardProps {
  email: Email
  className?: string
}

export function EmailCard({ email, className }: EmailCardProps) {
  const initials = email.senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface transition-colors",
        email.hasDraft && "border-l-2 border-l-brand",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={email.senderAvatar} alt={email.senderName} />
        <AvatarFallback className="bg-white/5 text-muted-foreground text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground truncate">
            {email.senderName}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {email.senderEmail}
          </span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {email.timestamp}
          </span>
        </div>

        <h3 className="font-medium text-foreground mb-1 truncate">
          {email.subject}
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
