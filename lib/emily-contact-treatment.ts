/**
 * Emily — Contact Treatment Heuristics (CRM relacional ligero)
 *
 * Cómo Emily decide tratar a cada contacto según su tipo, fuerza de relación,
 * cadencia esperada y señales recientes (inbound/outbound, push count, silencio).
 *
 * Estas reglas alimentan dos cosas:
 *   1. La columna `emily_treatment_note` que se renderiza en /contacts.
 *   2. Sugerencias de calendario (`next_touchpoint_suggested_at`) basadas en
 *      la cadencia ideal del tipo de contacto + lo que ya está en la agenda.
 *
 * Los tipos de contacto del nicho (cooperación internacional + fundaciones):
 *   internal | donor | partner | field | board | compliance | vendor | press | other_external
 */

import type { HeuristicRule } from "./emily-heuristics"

/* -------------------------------------------------------------------------- */
/*  Cadencia ideal por tipo de contacto                                       */
/* -------------------------------------------------------------------------- */

export type ContactType =
  | "internal"
  | "donor"
  | "partner"
  | "field"
  | "board"
  | "compliance"
  | "vendor"
  | "press"
  | "other_external"

export type Cadence = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "as_needed"

/**
 * Cadencia recomendada por defecto. Un valor explícito en
 * `contacts.suggested_cadence` la sobrescribe.
 */
export const DEFAULT_CADENCE_BY_TYPE: Record<ContactType, Cadence> = {
  internal: "weekly",
  donor: "monthly",
  partner: "biweekly",
  field: "biweekly",
  board: "quarterly",
  compliance: "as_needed",
  vendor: "as_needed",
  press: "as_needed",
  other_external: "as_needed",
}

/**
 * Días entre touchpoints sugeridos por cadencia.
 */
export const DAYS_BETWEEN_TOUCHPOINTS: Record<Cadence, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  as_needed: 0, // sin programación automática
}

/* -------------------------------------------------------------------------- */
/*  Etiquetas humanas en español (para UI)                                    */
/* -------------------------------------------------------------------------- */

export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  internal: "Equipo interno",
  donor: "Donante",
  partner: "Contraparte",
  field: "Oficina de campo",
  board: "Consejo / Board",
  compliance: "Compliance / Auditoría",
  vendor: "Proveedor / Vendor",
  press: "Prensa / Newsletter",
  other_external: "Externo",
}

export const CONTACT_TYPE_TONE: Record<ContactType, string> = {
  internal: "Colegial. Tutea. Async-first. Sync solo si escala.",
  donor: "Formal. Nunca prometas montos sin firma de finanzas. Cuida cadencia.",
  partner: "Diplomático. Reconoce la institución antes de la persona.",
  field: "Cálido pero ejecutivo. Reportes de incidente requieren acción rápida.",
  board: "Pre-lecturas con buffer. Plazos sagrados. Posición clara.",
  compliance: "Técnico-legal. Deadlines duros. Bloque concentrado, no fragmentes.",
  vendor: "Cortés. Decline o reagendar como videollamada de 15 min.",
  press: "Solo lectura. Sin necesidad de respuesta a menos que sea press release activo.",
  other_external: "Evalúa caso a caso.",
}

export const CADENCE_LABEL: Record<Cadence, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  as_needed: "Según se necesite",
}

/* -------------------------------------------------------------------------- */
/*  Heurísticas relacionales — alimentan emily_treatment_note                 */
/* -------------------------------------------------------------------------- */

export const CONTACT_TREATMENT_HEURISTICS: HeuristicRule[] = [
  {
    id: "donor-cooldown",
    name: "Cooldown de donante VIP",
    condition: "Más de 2 outbound al mismo donante VIP en una semana sin que él haya respondido aún",
    action: "Pausar outbound; esperar respuesta antes de seguir",
    emilyRationale:
      "Cuando le escribes tres veces a un donante en una semana sin respuesta, no se ve diligente — se ve ansioso. Espera. Si urge, llama. No multiplique correos.",
    priority: 9,
  },
  {
    id: "internal-async-first",
    name: "Equipo interno async-first",
    condition: "Pedido del equipo interno que cabe en mensaje + adjunto, sin requerir decisión irreversible",
    action: "Resolver async; bloquear sync semanal recurrente solo si la persona aparece >3 veces/semana",
    emilyRationale:
      "Si lo puedes responder en cuatro líneas, no agendes una reunión. Tu equipo te respeta más cuando les devuelves su tiempo, no cuando se los llenas.",
    priority: 8,
  },
  {
    id: "vip-quarterly-checkin",
    name: "Check-in trimestral con VIPs sin agenda activa",
    condition: "Contacto VIP sin interacción en 60+ días y sin convocatoria/proyecto activo",
    action: "Sugerir mensaje breve de check-in (3-4 líneas, sin pedido)",
    emilyRationale:
      "Las relaciones que más rinden son las que cultivas cuando no necesitas nada. Un check-in trimestral cuesta tres minutos y rinde por años.",
    priority: 8,
  },
  {
    id: "field-weak-signal",
    name: "Señal débil de oficina de campo",
    condition: "Contacto field tipo 'gap' (silencio inusual) tras patrón regular previo",
    action: "Sugerir mensaje breve preguntando si necesita apoyo, no asumir indiferencia",
    emilyRationale:
      "El silencio del campo casi nunca es indiferencia — suele ser saturación o problema sin reportar. No esperes el reporte; pregunta tú primero.",
    priority: 7,
  },
  {
    id: "compliance-block-not-fragment",
    name: "Compliance se trabaja en bloque",
    condition: "Tarea de compliance recibida (formularios, due diligence)",
    action: "Bloquear 1-2h continuas en calendario, no fragmentar",
    emilyRationale:
      "Llenar formularios de auditoría en pedacitos entre reuniones es la mejor forma de cometer un error. Bloquéalo, ciérralo de una, no vuelvas.",
    priority: 7,
  },
  {
    id: "partner-deadline-buffer",
    name: "Buffer pre-acta para contrapartes",
    condition: "Acta o documento de working group con deadline de observaciones",
    action: "Bloquear 30-60min de revisión 24h antes del deadline + 15min para coordinación interna previa",
    emilyRationale:
      "Las observaciones a un acta multilateral nunca se mandan apuradas. Reserva tiempo para leerla bien y coordinar con tu equipo antes de responder.",
    priority: 7,
  },
  {
    id: "board-pre-lectura-bilateral",
    name: "Llamada bilateral pre-Consejo",
    condition: "Pre-lectura recibida con punto de votación importante para tu posición",
    action: "Sugerir llamada bilateral con miembro relevante 24-48h antes de la sesión",
    emilyRationale:
      "Las decisiones del Consejo se toman antes del Consejo. Una llamada de 20 minutos con la persona correcta vale más que tres horas de plenaria.",
    priority: 8,
  },
  {
    id: "vendor-sleeping-decline",
    name: "Vendor durmiente — decline cortés o silencio",
    condition: "Vendor sin respuesta tuya en 60+ días con 3+ follow-ups suyos",
    action: "Sugerir decline cortés definitivo o aceptar el silencio como respuesta",
    emilyRationale:
      "Si llevas dos meses sin contestarle a un vendor, ya respondiste — solo no se lo dijiste. Mejor un decline cortés que dejarlo persiguiendo fantasmas.",
    priority: 5,
  },
  {
    id: "press-newsletter-eliminate",
    name: "Newsletter automatizada va a ELIMINATE",
    condition: "Remitente es newsletter o auto-digest sin acción requerida",
    action: "No crear draft; sugerir unsubscribe si frecuencia >1/día",
    emilyRationale:
      "He leído esto por ti. La novedad de hoy es la novedad de ayer en cinco días. Solo te muestro lo que cambia tu lunes.",
    priority: 4,
  },
  {
    id: "cross-platform-relationship-signal",
    name: "Cross-platform = señal de relación real",
    condition: "Mismo contacto te escribe en 2+ canales en ventana corta",
    action: "Subir prioridad y sugerir consolidar conversación en un solo canal preferido",
    emilyRationale:
      "Cuando alguien te busca por tres canales, no es ruido — es relación viva. No la dejes fragmentada; consolídala en el canal que ambos prefieren.",
    priority: 9,
  },
]

/* -------------------------------------------------------------------------- */
/*  Helper — recomienda próximo touchpoint                                    */
/* -------------------------------------------------------------------------- */

export function suggestNextTouchpoint(args: {
  contact_type: ContactType
  cadence?: Cadence | null
  last_interaction_at?: Date | null
}): Date | null {
  const cadence = args.cadence ?? DEFAULT_CADENCE_BY_TYPE[args.contact_type]
  const days = DAYS_BETWEEN_TOUCHPOINTS[cadence]
  if (days === 0) return null
  const base = args.last_interaction_at ?? new Date()
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

/* -------------------------------------------------------------------------- */
/*  FACADE — bloque para inyectar en system prompts                           */
/* -------------------------------------------------------------------------- */

export const EMILY_CONTACT_TREATMENT_MEMORY = `
TRATAMIENTO DE CONTACTOS (memoria CRM relacional de Emily):

Distingue 9 tipos de contacto y aplica el tono/cadencia correspondiente:
- internal (equipo): colegial, async-first, sync solo si escala. Cadencia weekly.
- donor (donante): formal, cooldown si no responde. Cadencia monthly.
- partner (contraparte): diplomático, reconoce institución antes de persona. Biweekly.
- field (oficina de campo): cálido pero ejecutivo. Biweekly.
- board (consejo): pre-lecturas + buffer + bilateral pre-sesión. Quarterly.
- compliance (auditoría): bloque concentrado 1-2h, no fragmentar. As needed.
- vendor (proveedor): decline cortés o silencio. As needed.
- press (newsletter): solo lectura, ELIMINATE. As needed.
- other_external: evalúa caso a caso.

Reglas relacionales (no comerciales):
- Cooldown de donante: si escribiste 2x esta semana sin respuesta, NO escribas más — espera o llama.
- Internal async-first: si cabe en mensaje + adjunto, no agendes reunión.
- VIP check-in trimestral sin pedido: cultivar relación cuesta menos que repararla.
- Señal débil de campo: silencio inusual = pregunta tú primero, no asumas indiferencia.
- Compliance en bloque: 1-2h continuas, no fragmentes.
- Cross-platform = relación viva: consolida en un canal preferido.
- Vendor durmiente 60+ días: decline cortés o silencio definitivo.

Cuando sugieras tratamiento de contacto, cita el tipo y la regla aplicada.
`.trim()
