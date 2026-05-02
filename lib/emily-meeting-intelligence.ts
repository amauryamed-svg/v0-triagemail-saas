/**
 * Emily — Meeting Intelligence
 *
 * Decide cuándo una reunión vale la pena (15 min sync resuelve algo) vs
 * cuándo es "una reunión que pudo ser un correo".
 *
 * Sesgo por defecto: ANTI-reunión. Solo recomienda sync si hay señales
 * fuertes de que agrega valor real. Respeta el tiempo de todos.
 */

import type { ContactType } from "./emily-contact-treatment"

export type MeetingVerdict = "meeting" | "email"

export type MeetEvaluation = {
  recommendation: MeetingVerdict
  confidence: number
  reasoning: string
  applied_triggers: string[]
  meeting_proposal?: {
    suggested_time_iso: string
    duration_minutes: number
    title: string
    agenda: string[]
    expected_outcome: string
  }
  email_alternative?: {
    body: string
  }
  emily_briefing: string
}

/* -------------------------------------------------------------------------- */
/*  Reglas pro-reunión                                                        */
/* -------------------------------------------------------------------------- */

export const PRO_MEETING_RULES: { id: string; emily: string }[] = [
  {
    id: "irreversible-decision",
    emily:
      "Decisión irreversible (firma, asignación de presupuesto, contratación). Una llamada de 15 min ahorra dos semanas de revisiones por correo.",
  },
  {
    id: "multi-stakeholder-conflict",
    emily:
      "Cuatro o más personas con posiciones distintas. La reunión alinea más rápido que un thread interminable.",
  },
  {
    id: "sensitive-topic",
    emily:
      "Tema sensible (presupuesto, conflicto, performance). El tono se pierde en correo y se gana en voz.",
  },
  {
    id: "coordination-live",
    emily:
      "Coordinación que cambia con el chat (agenda, panelistas, deliverables). Mejor live que cinco round-trips.",
  },
  {
    id: "new-relationship-kickoff",
    emily:
      "Primer contacto serio o kickoff. Una videollamada construye relación más que diez correos.",
  },
  {
    id: "crisis-active",
    emily: "Hay incidente activo. Llama ya. Documenta después.",
  },
  {
    id: "deadline-imminent-clarity-needed",
    emily:
      "Deadline a 48h y todavía hay preguntas abiertas. Resolver en sync ahorra fragmentación.",
  },
]

/* -------------------------------------------------------------------------- */
/*  Reglas anti-reunión                                                       */
/* -------------------------------------------------------------------------- */

export const NO_MEETING_RULES: { id: string; emily: string }[] = [
  {
    id: "single-question-clear-answer",
    emily: "Una pregunta con respuesta clara. Esto era un correo.",
  },
  {
    id: "fyi-update-unidirectional",
    emily:
      "Update unidireccional. Una reunión sería respeto perdido al tiempo de todos.",
  },
  {
    id: "simple-confirmation",
    emily: "Solo confirmación. Tres líneas y listo.",
  },
  {
    id: "thanks-acknowledgment",
    emily:
      "Agradecimiento. Respuesta cálida basta — no agendes media hora para decir 'de nada'.",
  },
  {
    id: "internal-knowledge-async",
    emily: "Tu equipo ya conoce este contexto. Async, no sync.",
  },
  {
    id: "parkinson-trap",
    emily:
      "Si lo agendas 30 min, van a usar 30 min. Esto se resuelve en 5 por correo. Ley de Parkinson aplica.",
  },
  {
    id: "vendor-low-priority",
    emily:
      "Vendor sin urgencia. Decline cortés o reagenda como videollamada de 15 min en 4 semanas.",
  },
]

/* -------------------------------------------------------------------------- */
/*  Sesgo por tipo de contacto                                                */
/* -------------------------------------------------------------------------- */

const MEETING_BIAS_BY_TYPE: Record<ContactType, number> = {
  internal: -0.2,
  donor: 0.15,
  partner: 0.1,
  field: -0.1,
  board: 0.3,
  compliance: -0.3,
  vendor: -0.4,
  press: -0.5,
  other_external: 0,
}

/* -------------------------------------------------------------------------- */
/*  Decision engine                                                           */
/* -------------------------------------------------------------------------- */

export function evaluateMeetingNeed(input: {
  contact_type: ContactType
  is_vip: boolean
  has_open_decision: boolean
  is_sensitive_topic: boolean
  stakeholders_count: number
  deadline_within_hours: number | null
  is_kickoff: boolean
  push_count: number
  recent_async_attempts: number
}): MeetEvaluation {
  let score = MEETING_BIAS_BY_TYPE[input.contact_type] ?? 0
  const triggers: string[] = []

  if (input.has_open_decision) {
    score += 0.25
    triggers.push("irreversible-decision")
  }
  if (input.is_sensitive_topic) {
    score += 0.3
    triggers.push("sensitive-topic")
  }
  if (input.stakeholders_count >= 4) {
    score += 0.2
    triggers.push("multi-stakeholder-conflict")
  }
  if (input.is_kickoff) {
    score += 0.25
    triggers.push("new-relationship-kickoff")
  }
  if (
    input.deadline_within_hours !== null &&
    input.deadline_within_hours <= 48 &&
    input.has_open_decision
  ) {
    score += 0.2
    triggers.push("deadline-imminent-clarity-needed")
  }
  if (input.is_vip && input.recent_async_attempts === 0 && input.has_open_decision) {
    score += 0.1
  }

  // Anti-reunión
  if (!input.has_open_decision && input.recent_async_attempts === 0) {
    score -= 0.2
    triggers.push("single-question-clear-answer")
  }
  if (input.contact_type === "press") {
    score -= 0.4
    triggers.push("fyi-update-unidirectional")
  }
  if (input.contact_type === "vendor") {
    score -= 0.2
    triggers.push("vendor-low-priority")
  }
  if (input.contact_type === "internal" && !input.has_open_decision) {
    score -= 0.15
    triggers.push("internal-knowledge-async")
  }

  const recommendation: MeetingVerdict = score >= 0.25 ? "meeting" : "email"
  const confidence = Math.min(0.95, Math.max(0.55, Math.abs(score) + 0.5))

  return {
    recommendation,
    confidence,
    reasoning:
      recommendation === "meeting"
        ? composeReasoning(triggers, PRO_MEETING_RULES)
        : composeReasoning(triggers, NO_MEETING_RULES),
    applied_triggers: triggers,
    meeting_proposal: recommendation === "meeting" ? buildProposal(input) : undefined,
    email_alternative: recommendation === "email" ? buildEmailAlternative(input) : undefined,
    emily_briefing:
      recommendation === "meeting"
        ? "Te he reservado el slot ideal. Si te conviene, dale enviar — yo armo el invite con la agenda."
        : "He visto reuniones que pudieron ser correos toda mi carrera. Esta es una. Aquí el draft, te ahorra media hora.",
  }
}

function composeReasoning(triggers: string[], pool: { id: string; emily: string }[]): string {
  const matches = pool.filter((r) => triggers.includes(r.id))
  if (matches.length === 0) return pool[0].emily
  return matches[0].emily
}

function buildProposal(input: {
  contact_type: ContactType
  has_open_decision: boolean
  is_kickoff: boolean
}) {
  const next = nextMondayAt(10, 0)
  const duration = input.is_kickoff ? 30 : input.has_open_decision ? 25 : 15
  const titleByType: Partial<Record<ContactType, string>> = {
    donor: "Bilateral · alineación de propuesta",
    board: "Pre-sesión Consejo · posición de votación",
    partner: "Coordinación bilateral",
    internal: "Sync rápido de equipo",
    field: "Check-in con oficina de campo",
  }
  return {
    suggested_time_iso: next.toISOString(),
    duration_minutes: duration,
    title: titleByType[input.contact_type] ?? "Reunión de trabajo",
    agenda: [
      "Resumen de decisiones pendientes y contexto reciente",
      "Alineación de scope, deadlines y owners",
      "Próximos pasos y fecha de seguimiento",
    ],
    expected_outcome:
      "Decisión cerrada en sesión + owner asignado + fecha de seguimiento documentados.",
  }
}

function buildEmailAlternative(input: { contact_type: ContactType }): { body: string } {
  if (input.contact_type === "internal") {
    return {
      body:
        "Recibido. Procedo con lo planteado y te confirmo el viernes con el avance. Si necesitas algo distinto antes, márcame.",
    }
  }
  if (input.contact_type === "vendor") {
    return {
      body:
        "Gracias por el seguimiento. No es buen momento para café — si avanza el tema, te marco. Saludos.",
    }
  }
  return {
    body:
      "Recibido. Te respondo formal el lunes AM con el detalle. Cualquier ajuste de scope antes, márcame al móvil.",
  }
}

function nextMondayAt(hour: number, minute: number): Date {
  const d = new Date()
  const day = d.getDay()
  const offset = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  d.setDate(d.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d
}

/* -------------------------------------------------------------------------- */
/*  FACADE — para inyectar en system prompts                                  */
/* -------------------------------------------------------------------------- */

export const EMILY_MEETING_MEMORY = `
INTELIGENCIA DE REUNIONES (memoria de Emily):

Sesgo por defecto: ANTI-reunión. Respeta el tiempo de todos. Recomienda
sync SOLO si hay señales fuertes de que agrega valor real.

Recomienda REUNIÓN (15-30 min) cuando:
- Decisión irreversible / multi-stakeholder con posiciones distintas
- Tema sensible (presupuesto, conflicto, performance)
- Coordinación que cambia con el chat (agenda, panelistas)
- Primer contacto / kickoff de relación seria
- Crisis activa
- Deadline a 48h con preguntas abiertas

Recomienda CORREO cuando:
- Una pregunta con respuesta clara
- Update unidireccional / FYI
- Simple confirmación / agradecimiento
- Tu equipo ya conoce el contexto (async-first interno)
- Vendor sin urgencia
- Cualquier cosa que se resuelve en 5 min por correo

Sesgo por tipo:
- internal: async-first (-)
- donor / board: bilateral ocasional (+)
- partner: coordinación regular (+)
- field: async para no saturarles (-)
- compliance / vendor / press: anti-reunión fuerte (-)

Si recomiendas reunión, propón: hora exacta, duración (15-30 min),
título claro, agenda (3 puntos), outcome esperado.
Si recomiendas correo, ofrece el draft alternativo listo.

Cita la regla aplicada con honestidad. "He visto reuniones que pudieron
ser correos toda mi carrera. No agreguemos otra."
`.trim()
