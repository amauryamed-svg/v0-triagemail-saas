import { NextResponse } from "next/server"
import { z } from "zod"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

const Body = z.object({
  user_id: z.string().uuid(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  contact_name: z.string().optional(),
  channel: z.enum(["whatsapp", "instagram"]).default("whatsapp"),
  message: z.string().optional(),
})

/**
 * Mock cross-platform push — incrementa push_count del contacto.
 * Cuando push_count >= 2, el agente sube urgencia del próximo correo del mismo contacto.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { user_id, contact_email, contact_phone, contact_name, channel } = parsed.data

  if (!contact_email && !contact_phone) {
    return NextResponse.json({ error: "contact_email or contact_phone required" }, { status: 400 })
  }

  const sb = adminClient()
  const matchKey = contact_email
    ? { user_id, email: contact_email }
    : { user_id, whatsapp_phone: contact_phone! }

  const { data: existing } = await sb
    .from("contacts")
    .select("id, push_count")
    .match(matchKey)
    .limit(1)
    .maybeSingle()

  const now = new Date().toISOString()
  if (existing) {
    await sb
      .from("contacts")
      .update({
        push_count: existing.push_count + 1,
        last_push_at: now,
        last_push_channel: channel,
      })
      .eq("id", existing.id)
    return NextResponse.json({ ok: true, contact_id: existing.id, push_count: existing.push_count + 1 })
  }

  const { data: created, error } = await sb
    .from("contacts")
    .insert({
      user_id,
      email: contact_email ?? null,
      whatsapp_phone: contact_phone ?? null,
      name: contact_name ?? null,
      push_count: 1,
      last_push_at: now,
      last_push_channel: channel,
    })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, contact_id: created.id, push_count: 1 })
}
