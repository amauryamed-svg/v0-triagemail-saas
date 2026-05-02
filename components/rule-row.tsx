"use client"

import { ReactNode } from "react"
import { Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RuleRowProps {
  title: string
  description?: string
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  stat?: string
  children?: ReactNode
  className?: string
  isPriority?: boolean
}

export function RuleRow({
  title,
  description,
  isEnabled,
  onToggle,
  stat,
  children,
  className,
  isPriority,
}: RuleRowProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-white/[0.06] bg-surface",
        "hover:bg-white/[0.02] transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium text-foreground">{title}</h3>
            {isPriority && (
              <Badge className="bg-urgent/10 text-urgent border-urgent/20 gap-1">
                <Zap className="w-3 h-3" />
                Prioridad
              </Badge>
            )}
            {stat && (
              <span className="text-xs text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded">
                {stat}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>
      
      {children && isEnabled && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          {children}
        </div>
      )}
    </div>
  )
}
