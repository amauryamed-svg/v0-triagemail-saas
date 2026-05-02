import { NextResponse } from "next/server"
import { z } from "zod"
import { adminClient } from "@/lib/db/supabase"
import { evaluateMeetingNeed } from "@/lib/emily-meeting-intelligence"
import type { ContactType } from "@/lib/emily-contact-treatment"

export const runtime = "nodejs"

const Body = z.object({
  contact_id: z.string().uuid(),
  email_id: z.string().uuid().optional(),
})

/**
 * POST /api/meet/evaluate
 * { contact_id, email_id? } → MeetEvaluation
 *
 * Combina señales del contacto (tipo, VIP, push count) + opcional contexto
 * del email (urgency, deadline, importance) para que Emily decida si vale
 * más reunión o correo.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const sb = adminClient()
  const { data: contact } = await sb
    .from("contacts")
    .select("id, name, contact_type, is_vip, push_count")
    .eq("id", parsed.data.contact_id)
    .single()
  if (!contact) return NextResponse.json({ error: "contact not found" }, { status: 404 })

  let has_open_decision = false
  let is_sensitive_topic = false
  let deadline_within_hours: number | null = null
  const stakeholders_count = 1
  let is_kickoff = false

  if (parsed.data.email_id) {
    const { data: email } = await sb
      .from("emails")
      .select("urgency, importance, eisenhower, deadline_detected_at, subject")
      .eq("id", parsed.data.email_id)
      .single()
    if (email) {
      has_open_decision = email.eisenhower === "DO_FIRST" || email.importance >= 4
      const subjectLow = (email.subject ?? "").toLowerCase()
      is_sensitive_topic = /contrato|presupuesto|conflicto|performance|firma|term sheet|despido|salario/.test(subjectLow)
      is_kickoff = /kickoff|primera reunión|onboarding/.test(subjectLow)
      if (email.deadline_detected_at) {
        deadline_within_hours =
          (new Date(email.deadline_detected_at).getTime() - Date.now()) / (3600 * 1000)
      }
    }
  } else {
    // Heurística sin email específico — basada en tipo de contacto
    has_open_decision = contact.contact_type === "board" || contact.contact_type === "donor"
  }

  const evaluation = evaluateMeetingNeed({
    contact_type: contact.contact_type as ContactType,
    is_vip: contact.is_vip,
    has_open_decision,
    is_sensitive_topic,
    stakeholders_count,
    deadline_within_hours,
    is_kickoff,
    push_count: contact.push_count,
    recent_async_attempts: 0,
  })

  return NextResponse.json(evaluation)
}
