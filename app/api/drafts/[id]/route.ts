import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

/**
 * GET /api/drafts/[id]
 *
 * El parámetro [id] aquí es el EMAIL_ID (porque la UI navega por email_id).
 * Devuelve el draft pendiente del email + el thread completo del email.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sb = adminClient()

  // Try lookup as email_id first (UI nav uses email_id).
  let { data: email } = await sb
    .from("emails")
    .select(
      "id, gmail_msg_id, gmail_thread_id, from_email, from_name, subject, snippet, urgency, importance, eisenhower, deadline_detected_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (!email) {
    // Fallback: lookup as gmail_msg_id (defensive).
    const { data: emailByMsg } = await sb
      .from("emails")
      .select(
        "id, gmail_msg_id, gmail_thread_id, from_email, from_name, subject, snippet, urgency, importance, eisenhower, deadline_detected_at",
      )
      .eq("gmail_msg_id", id)
      .maybeSingle()
    email = emailByMsg ?? null
  }

  if (!email) return NextResponse.json({ error: "email not found" }, { status: 404 })

  const { data: draft } = await sb
    .from("drafts")
    .select("id, body, emily_briefing, mode_generated, voice_note_url, voice_duration_ms, awaiting_approval, approved_at")
    .eq("email_id", email.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Cross-platform push for badge / reasoning.
  const { data: contact } = email.from_email
    ? await sb
        .from("contacts")
        .select("push_count, last_push_channel")
        .eq("email", email.from_email)
        .maybeSingle()
    : { data: null }

  return NextResponse.json({
    email,
    draft,
    push_count: contact?.push_count ?? 0,
    push_channel: contact?.last_push_channel ?? null,
  })
}
