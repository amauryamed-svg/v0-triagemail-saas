"use client"

import { cn } from "@/lib/utils"

type UrgencyLevel = "urgent" | "medium" | "low"

interface UrgencyBadgeProps {
  level: UrgencyLevel
  className?: string
}

const urgencyConfig = {
  urgent: {
    label: "Urgente",
    bgColor: "bg-urgent/15",
    textColor: "text-urgent",
    dotColor: "bg-urgent",
  },
  medium: {
    label: "Medio",
    bgColor: "bg-important/15",
    textColor: "text-important",
    dotColor: "bg-important",
  },
  low: {
    label: "Bajo",
    bgColor: "bg-calm/15",
    textColor: "text-calm",
    dotColor: "bg-calm",
  },
}

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const config = urgencyConfig[level]
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  )
}
