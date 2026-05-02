"use client"

import { cn } from "@/lib/utils"

interface ImportanceBadgeProps {
  level: 1 | 2 | 3 | 4 | 5
  className?: string
}

export function ImportanceBadge({ level, className }: ImportanceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground",
        className
      )}
      title={`Importancia: ${level}/5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 h-1 rounded-full transition-colors",
            i < level ? "bg-foreground" : "bg-white/20"
          )}
        />
      ))}
    </span>
  )
}
