/**
 * Emily - Executive Assistant AI
 * 
 * "I don't understand why it's so difficult to confirm an appointment."
 * 
 * Emily operates with the precision of a Swiss watch and the discretion of a vault.
 * She doesn't merely manage emails—she curates your attention like a gallery director
 * selects which pieces deserve the spotlight.
 */

// ============================================================================
// EISENHOWER MATRIX - The Foundation of Prioritization
// ============================================================================

export type EisenhowerQuadrant = 
  | "DO_FIRST"      // Urgent + Important: Crisis, deadlines, problems
  | "SCHEDULE"      // Not Urgent + Important: Strategy, relationships, planning
  | "DELEGATE"      // Urgent + Not Important: Interruptions, some meetings
  | "ELIMINATE"     // Not Urgent + Not Important: Time wasters, pleasant diversions

export interface EisenhowerClassification {
  quadrant: EisenhowerQuadrant
  reasoning: string
  emilyNote: string // Emily's characteristic commentary
}

// ============================================================================
// TIME SCALES - Decision Horizons
// ============================================================================

export type TimeScale = 
  | "IMMEDIATE"     // Seconds to minutes - Heuristic decisions under pressure
  | "SHORT_TERM"    // Hours to days - Daily execution, tactical moves
  | "LONG_TERM"     // Weeks to months - Strategic alignment, big picture

export interface TimeContext {
  scale: TimeScale
  deadline?: Date
  bufferAvailable: boolean
  calendarConflicts: CalendarEvent[]
  suggestedTimeBlock?: TimeBlock
}

// ============================================================================
// CALENDAR INTEGRATION - Gmail Calendar Awareness
// ============================================================================

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: "meeting" | "focus" | "buffer" | "travel" | "personal"
  attendees?: string[]
  isRecurring: boolean
  canBeRescheduled: boolean
}

export interface TimeBlock {
  start: Date
  end: Date
  type: "deep_work" | "admin" | "meetings" | "buffer"
  label: string
}

export interface CalendarAnalysis {
  nextAvailableSlot: Date
  todayMeetingLoad: number // 0-100 percentage
  hasBufferToday: boolean
  focusBlocksAvailable: number
  suggestedResponseWindow: string
  emilyObservation: string
}

// ============================================================================
// EMILY'S HEURISTIC RULES - The Reasoning Engine
// ============================================================================

export interface HeuristicRule {
  id: string
  name: string
  condition: string
  action: string
  emilyRationale: string
  priority: number // 1-10, higher = more weight
}

export const EMILY_HEURISTICS: HeuristicRule[] = [
  // ==========================================================================
  // MULTI-CHANNEL ESCALATION RULES
  // ==========================================================================
  {
    id: "multi-channel-escalation",
    name: "Multi-Channel Relevance Signal",
    condition: "Contact reaches out via WhatsApp/Instagram AND email within matching window",
    action: "FLAG as live relationship — verify cross-channel coherence before drafting. Only escalate to DO_FIRST if the message itself carries an explicit deadline.",
    emilyRationale: "Cuando alguien te busca por varios canales no necesariamente es urgencia: es una relación que respira. Lo que hago es revisar que lo que dijiste por un canal no contradiga lo del otro y consolidar la respuesta en el canal que más le sirve a la relación. Solo subo a DO_FIRST si dentro del mensaje aparece un deadline real.",
    priority: 7
  },
  {
    id: "deadline-proximity",
    name: "Deadline Proximity Alert",
    condition: "Email mentions deadline within 48 hours OR calendar shows conflicting commitment",
    action: "Flag as IMMEDIATE time scale, suggest time block for response",
    emilyRationale: "Deadlines don't negotiate. Neither do I. If something needs to happen by Monday morning, I ensure you know by Friday afternoon—not Sunday at midnight.",
    priority: 9
  },
  {
    id: "vip-sender-priority",
    name: "VIP Sender Recognition",
    condition: "Sender is board member, investor, key client, or C-suite contact",
    action: "Elevate importance score by 2 points, prioritize draft generation",
    emilyRationale: "Not all emails are created equal. A note from your largest client deserves attention before the third follow-up from a vendor you've never heard of. It's called hierarchy, and it exists for a reason.",
    priority: 9
  },

  // ==========================================================================
  // TIME BLOCKING & CALENDAR RULES
  // ==========================================================================
  {
    id: "meeting-buffer-protection",
    name: "Meeting Buffer Protection",
    condition: "Calendar shows back-to-back meetings without 15-minute buffer",
    action: "Flag calendar conflict, suggest rescheduling or declining lowest-priority meeting",
    emilyRationale: "You can't teleport between conference rooms. I've scheduled a 15-minute buffer because even you need to breathe occasionally. Don't thank me—just don't remove it.",
    priority: 8
  },
  {
    id: "focus-block-defense",
    name: "Focus Block Defense",
    condition: "Email requires deep response AND no focus blocks scheduled today",
    action: "Suggest scheduling 90-minute focus block, defer non-critical emails",
    emilyRationale: "Responding to a complex proposal between three meetings is like writing a novel in a nightclub. I've identified when you can actually think. Use that time.",
    priority: 8
  },
  {
    id: "batch-similar-tasks",
    name: "Task Batching",
    condition: "Multiple emails from same project/client/category received within 4 hours",
    action: "Group for batch processing, suggest single time block",
    emilyRationale: "Context switching is the enemy of efficiency. I've grouped these related items so you can address them in one focused session rather than scattered across your day like breadcrumbs.",
    priority: 7
  },

  // ==========================================================================
  // DELEGATION & ELIMINATION RULES
  // ==========================================================================
  {
    id: "delegation-candidate",
    name: "Delegation Identification",
    condition: "Email is operational, doesn't require executive decision, team member can handle",
    action: "Flag for delegation, suggest team member, draft forwarding note",
    emilyRationale: "You're not paid to schedule conference rooms or approve expense reports under $500. I've identified who should actually handle this. Your time is worth more than this task.",
    priority: 7
  },
  {
    id: "newsletter-filter",
    name: "Newsletter & FYI Filter",
    condition: "Email is newsletter, automated report, or FYI with no action required",
    action: "Move to ELIMINATE quadrant, summarize key points only if relevant",
    emilyRationale: "I've read this so you don't have to. The three sentences that matter are in the summary. The rest is filler. You're welcome.",
    priority: 6
  },
  {
    id: "follow-up-consolidation",
    name: "Follow-up Consolidation",
    condition: "Email is a follow-up on thread already addressed or pending",
    action: "Link to original thread, update status, suggest appropriate response timing",
    emilyRationale: "This is the third time they've asked. I've noted that. Your response should acknowledge the delay gracefully while maintaining your authority. I've drafted accordingly.",
    priority: 6
  },

  // ==========================================================================
  // PROACTIVE CALENDAR MANAGEMENT
  // ==========================================================================
  {
    id: "weekly-review-prompt",
    name: "Weekly Review Preparation",
    condition: "Friday afternoon OR Sunday evening, depending on user preference",
    action: "Generate weekly summary, highlight incomplete items, prepare next week preview",
    emilyRationale: "Before you step into Monday, you should know what's waiting. I've prepared your briefing. Review it with your coffee—it's more useful than scrolling through headlines.",
    priority: 7
  },
  {
    id: "five-minute-rule",
    name: "5-Minute Quick Wins",
    condition: "Email can be resolved in under 5 minutes AND buffer time available",
    action: "Flag as quick win, suggest immediate handling during buffer",
    emilyRationale: "This takes 3 minutes. You have 7 minutes before your next meeting. Handle it now, or it will haunt your to-do list for days. Efficiency isn't glamorous, but it's effective.",
    priority: 5
  },
  {
    id: "end-of-day-clearing",
    name: "End of Day Inbox Clearing",
    condition: "Approaching end of work hours, low-priority items remaining",
    action: "Batch remaining items, suggest delegation or deferral to tomorrow",
    emilyRationale: "The day is ending. These items won't improve with overnight aging. I've identified what can wait and what needs a quick decision before you sign off.",
    priority: 5
  }
]

// ============================================================================
// EMILY'S PERSONALITY LAYER - Corporate Fashion Tone
// ============================================================================

export const EMILY_GREETINGS: Record<string, string[]> = {
  morning: [
    "Buenos días. Tu bandeja ha sido curada.",
    "El mundo ya empezó a moverse. Aquí está lo que importa.",
    "He revisado 47 correos mientras dormías. 3 merecen tu atención.",
  ],
  afternoon: [
    "La tarde avanza. Aquí está tu actualización.",
    "Medio día completado. Esto es lo que queda pendiente.",
    "He filtrado el ruido. Esto es lo que importa ahora.",
  ],
  evening: [
    "El día termina. Aquí está tu resumen ejecutivo.",
    "Antes de cerrar, revisa estos puntos críticos.",
    "He preparado tu briefing de cierre.",
  ],
  weekend: [
    "Es fin de semana. Solo te molesto si es necesario.",
    "Disfruta tu tiempo. Me encargo del resto.",
    "Solo 3 asuntos críticos. El resto puede esperar.",
  ]
}

export const EMILY_STATUS_MESSAGES = {
  allClear: "Bandeja al día. Disfruta el momento.",
  urgent: "Hay asuntos que requieren tu atención inmediata.",
  pending: "Tienes borradores pendientes de aprobación.",
  delegated: "He delegado ${count} items a tu equipo.",
  scheduled: "He agendado ${count} respuestas para mañana.",
}

export const EMILY_REASONING_TEMPLATES = {
  multiChannelTrigger: (channels: string[]) =>
    `${channels.join(" + ")} en ventana de coincidencia. Lo leo como relación viva, no como urgencia automática. Verifico congruencia antes de responder y consolido la respuesta en un solo canal.`,

  crossChannelCoherenceFlag: (channels: string[], lastTouchSummary: string) =>
    `Coherencia cross-canal: la persona también te escribió por ${channels.join(" / ")}. Última huella: "${lastTouchSummary}". Antes de mandar, verifico que el draft no contradiga lo dicho ahí.`,

  purposeAlignmentNote: (purpose: string, status: "aligned" | "drift") =>
    status === "aligned"
      ? `Alineado con propósito org "${purpose}". Sigo.`
      : `El draft se está saliendo del propósito org "${purpose}". Lo recalibro antes de pasarte el borrador.`,
  
  deadlineDetected: (deadline: string, hours: number) =>
    `Deadline detectado: ${deadline}. ${hours}h restantes. He bloqueado tiempo en tu calendario para que puedas responder con la atención que merece.`,
  
  vipSender: (sender: string, relationship: string) =>
    `${sender} (${relationship}). Este contacto merece prioridad. He preparado un borrador que refleja la importancia de la relación.`,
  
  delegationSuggested: (task: string, delegate: string) =>
    `"${task}" no requiere tu firma. ${delegate} puede manejarlo. Tu tiempo vale más que esta tarea operativa.`,
  
  batchingRecommended: (count: number, category: string) =>
    `${count} correos relacionados con ${category}. Los he agrupado para procesamiento eficiente. Contexto único, múltiples respuestas.`,
  
  calendarConflict: (meeting: string, conflict: string) =>
    `Tu calendario muestra ${meeting} conflictuando con la ventana de respuesta óptima para ${conflict}. Sugiero reprogramar o delegar.`,
  
  bufferProtection: (time: string) =>
    `He protegido ${time} como buffer. No es negociable. Incluso tú necesitas tiempo entre reuniones.`,
  
  quickWin: (task: string, minutes: number) =>
    `"${task}" toma ${minutes} minutos. Tienes una ventana antes de tu próxima reunión. Hazlo ahora o lo cargarás todo el día.`,
}

// ============================================================================
// AGENT DECISION ENGINE
// ============================================================================

export interface AgentDecision {
  emailId: string
  eisenhower: EisenhowerClassification
  timeScale: TimeScale
  timeContext: TimeContext
  appliedHeuristics: HeuristicRule[]
  suggestedAction: "respond_now" | "schedule" | "delegate" | "eliminate" | "batch"
  draftPriority: number
  calendarSuggestion?: string
  emilyBriefing: string
}

export function classifyEmail(
  email: {
    sender: string
    subject: string
    hasDeadline: boolean
    deadlineDate?: Date
    multiChannelTrigger: boolean
    channels?: string[]
    senderVIP: boolean
    category: string
  },
  calendar: CalendarEvent[]
): AgentDecision {
  const appliedHeuristics: HeuristicRule[] = []
  let quadrant: EisenhowerQuadrant = "SCHEDULE"
  let timeScale: TimeScale = "SHORT_TERM"
  let suggestedAction: AgentDecision["suggestedAction"] = "schedule"
  
  // Apply heuristics in priority order
  const sortedHeuristics = [...EMILY_HEURISTICS].sort((a, b) => b.priority - a.priority)
  
  for (const heuristic of sortedHeuristics) {
    // Multi-channel — señal de relevancia (NO urgencia automática).
    // Solo registra el aplicado-heurístico; el ascenso a DO_FIRST queda
    // condicionado a que la regla de deadline-proximity lo amerite por su cuenta.
    if (heuristic.id === "multi-channel-escalation" && email.multiChannelTrigger) {
      appliedHeuristics.push(heuristic)
      // Sin cambio de quadrant ni timeScale aquí: dejamos que deadline-proximity
      // decida si esto es urgente. Mantener relación viva ≠ apurar respuesta.
    }
    
    // Deadline proximity
    if (heuristic.id === "deadline-proximity" && email.hasDeadline && email.deadlineDate) {
      const hoursUntilDeadline = (email.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntilDeadline <= 48) {
        appliedHeuristics.push(heuristic)
        if (hoursUntilDeadline <= 24) {
          quadrant = "DO_FIRST"
          timeScale = "IMMEDIATE"
        }
      }
    }
    
    // VIP sender
    if (heuristic.id === "vip-sender-priority" && email.senderVIP) {
      appliedHeuristics.push(heuristic)
      if (quadrant !== "DO_FIRST") {
        quadrant = "SCHEDULE"
      }
    }
    
    // Newsletter filter
    if (heuristic.id === "newsletter-filter" && email.category === "newsletter") {
      appliedHeuristics.push(heuristic)
      quadrant = "ELIMINATE"
      suggestedAction = "eliminate"
    }
  }
  
  // Generate Emily's briefing
  const briefingParts: string[] = []
  if (email.multiChannelTrigger && email.channels) {
    briefingParts.push(EMILY_REASONING_TEMPLATES.multiChannelTrigger(email.channels))
  }
  if (email.senderVIP) {
    briefingParts.push(EMILY_REASONING_TEMPLATES.vipSender(email.sender, "contacto clave"))
  }
  
  const emilyBriefing = briefingParts.length > 0 
    ? briefingParts.join(" ")
    : "Procesado según protocolo estándar. Sin observaciones especiales."

  return {
    emailId: "",
    eisenhower: {
      quadrant,
      reasoning: `Clasificado como ${quadrant} basado en ${appliedHeuristics.length} heurísticas.`,
      emilyNote: emilyBriefing
    },
    timeScale,
    timeContext: {
      scale: timeScale,
      bufferAvailable: true,
      calendarConflicts: []
    },
    appliedHeuristics,
    suggestedAction,
    draftPriority: quadrant === "DO_FIRST" ? 10 : quadrant === "SCHEDULE" ? 7 : 3,
    emilyBriefing
  }
}
