"use client"

import { motion } from "framer-motion"
import { Check, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ModeCardProps {
  icon: LucideIcon
  title: string
  description: string
  footer: string
  isActive?: boolean
  isRecommended?: boolean
  onClick?: () => void
  className?: string
}

export function ModeCard({
  icon: Icon,
  title,
  description,
  footer,
  isActive = false,
  isRecommended = false,
  onClick,
  className,
}: ModeCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className={cn(
        "relative w-full p-6 rounded-xl border text-left transition-colors",
        "hover:bg-white/[0.02]",
        isActive 
          ? "border-brand bg-brand/5" 
          : "border-white/[0.06] bg-surface",
        className
      )}
    >
      {/* Active Checkmark */}
      {isActive && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && !isActive && (
        <Badge 
          variant="outline" 
          className="absolute top-4 right-4 border-brand/30 text-brand bg-brand/10"
        >
          Recomendado
        </Badge>
      )}

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        isActive ? "bg-brand/20 text-brand" : "bg-white/[0.04] text-muted-foreground"
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      
      {/* Footer */}
      <p className="text-xs text-muted-foreground">{footer}</p>
    </motion.button>
  )
}
