import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"
import {
  CONTACT_TYPE_LABEL,
  CONTACT_TYPE_TONE,
  CADENCE_LABEL,
  type ContactType,
  type Cadence,
} from "@/lib/emily-contact-treatment"

export const runtime = "nodejs"

/**
 * GET /api/contacts?email=demo@triagemail.app[&type=internal]
 *
 * Devuelve contactos enriquecidos del usuario, ordenados por:
 *   1. relationship_strength DESC (los fuertes primero)
 *   2. last_interaction_at DESC (los recientes después)
 *
 * Cada contacto incluye etiquetas humanas para tipo/cadencia y la nota de
 * tratamiento de Emily.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const userEmail = url.searchParams.get("email") ?? "demo@triagemail.app"
  const typeFilter = url.searchParams.get("type") as ContactType | null

  const sb = adminClient()
  const { data: user } = await sb.from("users").select("id").eq("email", userEmail).maybeSingle()
  if (!user) return NextResponse.json({ contacts: [], totals: {} })

  let q = sb
    .from("contacts")
    .select(
      "id, name, email, whatsapp_phone, instagram_handle, contact_type, organization, role, is_vip, push_count, last_push_channel, inbound_count, outbound_count, last_interaction_at, relationship_strength, suggested_cadence, next_touchpoint_suggested_at, emily_treatment_note",
    )
    .eq("user_id", user.id)
    .order("relationship_strength", { ascending: false })
    .order("last_interaction_at", { ascending: false, nullsFirst: false })

  if (typeFilter) q = q.eq("contact_type", typeFilter)

  const { data: contacts } = await q

  const enriched = (contacts ?? []).map((c) => {
    const type = (c.contact_type ?? "other_external") as ContactType
    const cadence = (c.suggested_cadence ?? null) as Cadence | null
    return {
      ...c,
      type_label: CONTACT_TYPE_LABEL[type] ?? type,
      tone_hint: CONTACT_TYPE_TONE[type] ?? "",
      cadence_label: cadence ? CADENCE_LABEL[cadence] : "Según se necesite",
      last_interaction_relative: c.last_interaction_at ? relativeTime(c.last_interaction_at) : "—",
      next_touchpoint_relative: c.next_touchpoint_suggested_at
        ? relativeTime(c.next_touchpoint_suggested_at, true)
        : null,
    }
  })

  // Totals por tipo (para los filter chips)
  const totals: Record<string, number> = {}
  for (const c of contacts ?? []) {
    totals[c.contact_type] = (totals[c.contact_type] ?? 0) + 1
  }
  totals._all = contacts?.length ?? 0

  return NextResponse.json({ contacts: enriched, totals })
}

function relativeTime(iso: string, future = false): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  const hours = Math.floor(absMs / (1000 * 60 * 60))
  const isFuture = diffMs > 0
  if (hours < 1) return isFuture ? "en minutos" : "hace minutos"
  if (hours < 24) return isFuture ? `en ${hours}h` : `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (future) return isFuture ? `en ${days}d` : `hace ${days}d`
  return `hace ${days}d`
}
