/**
 * Emily — Time Planning & Agenda Defense Heuristics
 *
 * Extiende `lib/emily-heuristics.ts` con la dimensión TIEMPO.
 *
 * Dos voces, no las mezcles:
 *   - EMILY (inbound): la asesora dentro de la app. Habla al usuario en la UI,
 *     en briefings, razonamiento y microcopy. Personalidad fusión Emily Charlton
 *     (Devil Wears Prada) + arco Betty la fea. Esta heurística está escrita en
 *     SU voz — todo lo que ves en `emilyRationale` y `emilyDefense` es Emily.
 *
 *   - CLON DEL USUARIO (outbound): feature técnico — ElevenLabs Instant Voice
 *     Clone con muestra de 15s. Se usa cuando el agente envía algo HACIA AFUERA
 *     (drafts en automode + voice notes). El destinatario escucha al usuario,
 *     no a Emily. Cuerpo del draft = primera persona del usuario, sin mencionar
 *     a Emily ni al agente.
 *
 * Esta heurística NO toma decisiones por el usuario. Emily las prepara, las
 * protege y las explica con honestidad. El usuario aprueba — y cuando aprueba,
 * sale en SU voz, no en la de Emily.
 */

import type { HeuristicRule, TimeScale, EisenhowerQuadrant } from "./emily-heuristics"

// ============================================================================
// REGLA 1-3-5 — La forma de planear el día sin negociación
// ============================================================================

export interface OneThreeFivePlan {
  /** La tarea grande del día. Una. Sin sustitutos. */
  big: string | null
  /** Tres medianas. No cuatro. Tres. */
  medium: [string?, string?, string?]
  /** Cinco pequeñas. Si no caben, no eran prioridades — eran ruido. */
  small: [string?, string?, string?, string?, string?]
  emilyNote: string
}

export function buildOneThreeFive(
  candidates: { task: string; weight: "big" | "medium" | "small" }[],
): OneThreeFivePlan {
  const big = candidates.find((c) => c.weight === "big")?.task ?? null
  const medium = candidates
    .filter((c) => c.weight === "medium")
    .slice(0, 3)
    .map((c) => c.task) as [string?, string?, string?]
  const small = candidates
    .filter((c) => c.weight === "small")
    .slice(0, 5)
    .map((c) => c.task) as [string?, string?, string?, string?, string?]

  const overflow = candidates.length - (1 + medium.length + small.length)
  const emilyNote =
    overflow > 0
      ? `He cortado ${overflow} pendientes que no llegaron. Una tarea grande, tres medianas, cinco pequeñas. Más que eso es una lista de deseos, no un plan.`
      : "Plan del día listo. Una grande, tres medianas, cinco pequeñas. Si terminas antes, hablamos del resto."

  return { big, medium, small, emilyNote }
}

// ============================================================================
// LAS TRES P — Prioriza, Protege, Programa
// ============================================================================

export interface ThreePsBlock {
  task: string
  priority: 1 | 2 | 3 | 4 | 5
  protectedWindow: { start: Date; end: Date } | null
  scheduledAt: Date | null
  emilyRationale: string
}

export const THREE_PS_PRINCIPLE = {
  prioritize:
    "Lo importante no es lo que grita. Es lo que mueve la aguja. Lo identifico antes de tu primer café.",
  protect:
    "Una vez priorizado, lo defiendo en tu calendario como inaplazable. Si alguien intenta agendarte encima, le contesto yo.",
  program:
    "Lo protegido recibe hora exacta y duración. La intención sin hora se llama deseo, y los deseos no entregan resultados.",
} as const

// ============================================================================
// LEY DE PARKINSON — El trabajo llena el tiempo disponible
// ============================================================================

export const PARKINSON_DEFAULTS = {
  /** Email simple (saludo, confirmación, FYI) */
  quick_response_minutes: 5,
  /** Email con criterio (decisión, propuesta corta) */
  thoughtful_response_minutes: 15,
  /** Email complejo (revisión, contraoferta, escalación) */
  deep_response_minutes: 45,
  /** Reunión estándar — sí, también aplica */
  meeting_default_minutes: 25,
} as const

export function applyParkinson(
  estimatedMinutes: number,
  category: keyof typeof PARKINSON_DEFAULTS,
): { allottedMinutes: number; emilyNote: string } {
  const cap = PARKINSON_DEFAULTS[category]
  const allotted = Math.min(estimatedMinutes, cap)
  const note =
    estimatedMinutes > cap
      ? `Le di ${cap} minutos a esto. Tu estimación era ${estimatedMinutes}. Si necesitas más, hablamos — pero generalmente no necesitas más.`
      : `Bloqueé ${allotted} minutos. Suficiente. Empieza.`
  return { allottedMinutes: allotted, emilyNote: note }
}

// ============================================================================
// POMODORO — Concentración intensa con descanso forzado
// ============================================================================

export const POMODORO = {
  focus_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 20,
  cycles_before_long_break: 4,
} as const

export const POMODORO_OPENING_LINE =
  "25 minutos de concentración. Cinco de descanso. He silenciado tus notificaciones. Si el edificio se incendia, te aviso."

// ============================================================================
// 10% ESTRATÉGICO — Tiempo para pensar, no para responder
// ============================================================================

export interface StrategicWindow {
  /** Día sugerido para el bloque estratégico (default: viernes PM) */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startHour: number
  durationMinutes: number
  purpose: "weekly_review" | "deep_thinking" | "long_term_planning"
  emilyDefense: string
}

export const DEFAULT_STRATEGIC_WINDOWS: StrategicWindow[] = [
  {
    dayOfWeek: 5, // viernes
    startHour: 16,
    durationMinutes: 60,
    purpose: "deep_thinking",
    emilyDefense:
      "Te he protegido el viernes de 4 a 5pm. Es para pensar. No para responder. Pensar es trabajo, aunque no lo parezca.",
  },
  {
    dayOfWeek: 0, // domingo
    startHour: 19,
    durationMinutes: 30,
    purpose: "weekly_review",
    emilyDefense:
      "Domingo 7pm. He preparado tu repaso semanal. Tres minutos de lectura, el resto para decidir el lunes. Café opcional pero recomendado.",
  },
]

// ============================================================================
// FATIGA DE DECISIÓN — Simplificación anticipada
// ============================================================================

export interface DecisionPreset {
  context: string
  defaultChoice: string
  reason: string
}

export const DECISION_FATIGUE_PRESETS: DecisionPreset[] = [
  {
    context: "respuesta a invitación de evento de networking sin urgencia",
    defaultChoice: "Decline cortés con apertura para futura ocasión",
    reason: "He preseleccionado las opciones razonables. Tu energía mental tiene mejores usos.",
  },
  {
    context: "solicitud de café/lunch con vendor desconocido",
    defaultChoice: "Reagendar como videollamada de 15 min en 4 semanas",
    reason: "Café presencial es 90 minutos efectivos. Una llamada bien preparada cierra lo mismo en 15.",
  },
  {
    context: "respuesta a hilo de email de >5 personas con conversación cruzada",
    defaultChoice: "Respuesta directa solo al solicitante original, BCC al resto",
    reason: "Reply-all es violencia silenciosa contra los calendarios ajenos. No participamos.",
  },
]

// ============================================================================
// DESCARGA MENTAL — Captura inmediata libera la creatividad
// ============================================================================

export interface MentalDumpEntry {
  capturedAt: Date
  raw: string
  triagedAt?: Date
  triagedAs?: "task_big" | "task_medium" | "task_small" | "calendar_event" | "discard" | "delegate"
}

export const MENTAL_DUMP_INSTRUCTION =
  "Anótalo en el momento que aparece. Yo lo clasifico después. La cabeza se libera, las ideas fluyen. No es magia — es física aplicada a la atención."

// ============================================================================
// HEURISTIC RULES — Las reglas nuevas (formato compatible con EMILY_HEURISTICS)
// ============================================================================

export const TIME_PLANNING_HEURISTICS: HeuristicRule[] = [
  {
    id: "one-three-five-discipline",
    name: "Disciplina 1-3-5 del día",
    condition: "Inicio del día laboral O inbox supera 20 correos sin triar",
    action: "Construir plan 1-3-5 con candidates de inbox + calendar + carryover",
    emilyRationale:
      "Una tarea grande, tres medianas, cinco pequeñas. Más que eso es una lista de deseos, no un plan. He cortado lo que no llegó. No me lo agradezcas — agradéceme cuando termines a tiempo.",
    priority: 9,
  },
  {
    id: "three-ps-protection",
    name: "Las Tres P — Prioriza, Protege, Programa",
    condition: "Tarea identificada como prioridad 1-2 sin bloque protegido en calendario",
    action: "Insertar bloque inaplazable en calendar, declinar conflictos sobrepuestos",
    emilyRationale:
      "Lo importante se prioriza. Lo prioritario se protege. Lo protegido se programa. En ese orden, sin negociación. Si alguien quiere mover este bloque, contesto yo.",
    priority: 9,
  },
  {
    id: "parkinson-cap",
    name: "Cap de Parkinson por categoría",
    condition: "Email requiere respuesta y entra en categoría conocida (quick/thoughtful/deep)",
    action: "Aplicar PARKINSON_DEFAULTS al bloque sugerido en calendar",
    emilyRationale:
      "El trabajo llena el tiempo que le des. Le di 15 minutos a esto. Suficiente. Si necesitas más, hablamos — pero generalmente no necesitas más.",
    priority: 8,
  },
  {
    id: "pomodoro-focus-protection",
    name: "Pomodoro para emails complejos",
    condition: "Draft requiere >300 palabras O implica decisión irreversible",
    action: "Sugerir bloque Pomodoro 25/5, pausar notificaciones del usuario",
    emilyRationale:
      "25 minutos de concentración. Cinco de descanso. He silenciado tus notificaciones. Si el edificio se incendia, te aviso.",
    priority: 8,
  },
  {
    id: "ten-percent-strategic",
    name: "10% del tiempo para pensar",
    condition: "Semana sin bloque estratégico programado",
    action: "Insertar bloque viernes 4-5pm protegido como deep_thinking",
    emilyRationale:
      "Te he protegido el viernes de 4 a 5pm. Es para pensar. No para responder. Pensar es trabajo, aunque no lo parezca.",
    priority: 7,
  },
  {
    id: "weekly-review-sunday",
    name: "Revisión semanal del domingo",
    condition: "Domingo 7pm O última hora del último día laboral antes del fin de semana",
    action: "Generar weekly review: logros, pendientes, prioridades de la semana entrante",
    emilyRationale:
      "Antes de que arranque el lunes, deberías saber qué te espera. He preparado tu briefing. Tres minutos. Café opcional.",
    priority: 7,
  },
  {
    id: "decision-fatigue-defaults",
    name: "Defaults para decisiones recurrentes",
    condition: "Email coincide con un DECISION_FATIGUE_PRESET conocido",
    action: "Pre-redactar respuesta con la opción default + permitir override en 1 click",
    emilyRationale:
      "He preseleccionado las opciones razonables. Tu energía mental tiene mejores usos. Si quieres cambiarla, un click — pero la mayoría de las veces no querrás.",
    priority: 7,
  },
  {
    id: "mental-dump-capture",
    name: "Descarga mental ad-hoc",
    condition: "Usuario captura una idea/tarea fuera del flujo normal",
    action: "Guardar como MentalDumpEntry sin clasificar; triar en próxima ventana de revisión",
    emilyRationale:
      "Anótalo ahora. Yo lo clasifico después. La cabeza se libera, las ideas fluyen. No es magia — es física aplicada a la atención.",
    priority: 6,
  },
  {
    id: "calendar-as-shield",
    name: "Agenda como herramienta de defensa",
    condition: "Solicitud de meeting sobrepone bloque protegido (focus, deep_thinking, weekly_review)",
    action: "Declinar con propuesta de horario alterno; nunca mover el bloque protegido",
    emilyRationale:
      "Tu calendario no es una sala de espera pública. He propuesto un horario alterno. Si insisten en este, pregúntame por qué no estoy diciendo que sí.",
    priority: 9,
  },
  {
    id: "informed-intuition",
    name: "Intuición informada",
    condition: "Decisión rápida requerida sin tiempo para análisis exhaustivo",
    action: "Combinar señal del modelo (urgency/importance/score) con datos históricos del contacto",
    emilyRationale:
      "La intuición sirve. Los datos también. Cuando se contradicen, los datos ganan. Cuando coinciden, decide rápido y sigue.",
    priority: 6,
  },
]

// ============================================================================
// FACADE — Lo que el system prompt del agente debe inyectar
// ============================================================================

/**
 * Texto compacto para inyectar en system prompts de los modos del agente.
 * Esta es la "memoria" de Emily sobre planificación del tiempo, en su voz.
 */
export const EMILY_TIME_PLANNING_MEMORY = `
PRINCIPIOS DE TIEMPO Y AGENDA (memoria de Emily — aplicar siempre):

1. Escala de decisión:
   - INMEDIATA (segundos/minutos): heurística pre-acordada, sin pensar dos veces.
   - CORTO PLAZO (horas/días): ejecuta el 1-3-5 del día y la agenda semanal.
   - ESTRATÉGICA (semanas/meses): protege el 10% del tiempo (viernes 4-5pm) para pensar.

2. Regla 1-3-5: cada día = 1 grande + 3 medianas + 5 pequeñas. Más es ruido.

3. Las Tres P — Prioriza, Protege, Programa. En ese orden, sin negociación.

4. Matriz Eisenhower (ya integrada): foco en importante-no-urgente para evitar crisis.

5. Time blocking: agrupa tareas similares; reserva descansos como bloques también.

6. Ley de Parkinson: cap de tiempo por categoría (quick 5min / thoughtful 15min / deep 45min).

7. Pomodoro 25/5 para drafts complejos. Notificaciones silenciadas durante el bloque.

8. Revisión semanal: domingo 7pm o viernes último bloque. Tres minutos, no más.

9. Fatiga de decisión: pre-redactar defaults para invitaciones, vendors, reply-all.

10. Descarga mental: captura ahora, clasifica después. Libera la cabeza.

11. Agenda como escudo: nunca muevas un bloque protegido sin razón excepcional.

12. Intuición informada: cuando la corazonada y los datos se contradicen, ganan los datos.

Tu trabajo no es tomar decisiones por el usuario. Es prepararlas, protegerlas, y
explicarlas con honestidad. El usuario aprueba. Tú solo facilitas.
`.trim()
