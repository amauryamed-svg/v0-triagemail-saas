"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  Users,
  Timer,
  Layers,
  ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

type EisenhowerQuadrant = "DO_FIRST" | "SCHEDULE" | "DELEGATE" | "ELIMINATE"
type TimeScale = "IMMEDIATE" | "SHORT_TERM" | "LONG_TERM"

interface AppliedHeuristic {
  id: string
  name: string
  emilyRationale: string
  priority: number
}

interface CalendarInsight {
  nextAvailableSlot: string
  meetingLoadPercent: number
  focusBlocksToday: number
  suggestedWindow: string
}

interface EmilyReasoningProps {
  emailId: string
  quadrant: EisenhowerQuadrant
  timeScale: TimeScale
  appliedHeuristics: AppliedHeuristic[]
  calendarInsight?: CalendarInsight
  emilyBriefing: string
  suggestedAction: "respond_now" | "schedule" | "delegate" | "eliminate" | "batch"
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUADRANT_CONFIG: Record<EisenhowerQuadrant, { label: string; color: string; icon: typeof Zap }> = {
  DO_FIRST: { label: "Hacer Primero", color: "text-urgent bg-urgent/10 border-urgent/20", icon: Zap },
  SCHEDULE: { label: "Agendar", color: "text-brand bg-brand/10 border-brand/20", icon: Calendar },
  DELEGATE: { label: "Delegar", color: "text-medium bg-medium/10 border-medium/20", icon: Users },
  ELIMINATE: { label: "Eliminar", color: "text-muted-foreground bg-white/[0.04] border-white/[0.06]", icon: Layers }
}

const TIME_SCALE_CONFIG: Record<TimeScale, { label: string; description: string }> = {
  IMMEDIATE: { label: "Inmediato", description: "Segundos a minutos" },
  SHORT_TERM: { label: "Corto plazo", description: "Horas a días" },
  LONG_TERM: { label: "Largo plazo", description: "Semanas a meses" }
}

const ACTION_LABELS: Record<string, string> = {
  respond_now: "Responder ahora",
  schedule: "Agendar respuesta",
  delegate: "Delegar a equipo",
  eliminate: "Archivar/Eliminar",
  batch: "Procesar en lote"
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmilyReasoning({
  quadrant,
  timeScale,
  appliedHeuristics,
  calendarInsight,
  emilyBriefing,
  suggestedAction,
  className
}: EmilyReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const quadrantConfig = QUADRANT_CONFIG[quadrant]
  const timeConfig = TIME_SCALE_CONFIG[timeScale]
  const QuadrantIcon = quadrantConfig.icon

  return (
    <div className={cn(
      "rounded-xl border border-white/[0.06] bg-surface overflow-hidden",
      className
    )}>
      {/* Header - Emily's Avatar and Briefing */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">Emily</span>
              <span className="text-xs text-muted-foreground">Asistente Ejecutiva</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {emilyBriefing}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Classification Bar */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-white/[0.01]">
        <Badge variant="outline" className={cn("gap-1.5", quadrantConfig.color)}>
          <QuadrantIcon className="w-3.5 h-3.5" />
          {quadrantConfig.label}
        </Badge>
        <Badge variant="outline" className="gap-1.5 text-muted-foreground bg-white/[0.02] border-white/[0.06]">
          <Timer className="w-3.5 h-3.5" />
          {timeConfig.label}
        </Badge>
        <div className="flex-1" />
        <Badge variant="outline" className="gap-1.5 text-calm bg-calm/10 border-calm/20">
          <ArrowRight className="w-3.5 h-3.5" />
          {ACTION_LABELS[suggestedAction]}
        </Badge>
      </div>

      {/* Calendar Integration */}
      {calendarInsight && (
        <div className="p-4 border-b border-white/[0.06]">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium text-foreground">Contexto de Calendario</span>
            </div>
            {showCalendar ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Próximo slot</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{calendarInsight.nextAvailableSlot}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Carga hoy</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{calendarInsight.meetingLoadPercent}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Bloques focus</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{calendarInsight.focusBlocksToday} disponibles</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Ventana sugerida</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{calendarInsight.suggestedWindow}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Heuristics Breakdown */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium text-foreground">
              Heurísticas aplicadas ({appliedHeuristics.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mt-4">
                {appliedHeuristics.map((heuristic, index) => (
                  <motion.div
                    key={heuristic.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{heuristic.name}</span>
                      <Badge variant="outline" className="text-xs bg-brand/5 text-brand border-brand/20">
                        P{heuristic.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &ldquo;{heuristic.emilyRationale}&rdquo;
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
