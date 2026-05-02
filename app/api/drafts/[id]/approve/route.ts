import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sb = adminClient()
  const { data, error } = await sb
    .from("drafts")
    .update({ awaiting_approval: false, approved_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, email_id, body, voice_note_url, gmail_draft_id, user_id")
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? "draft not found" }, { status: 404 })

  // Si tiene gmail_draft_id, intentamos enviar real. Si no, solo marcamos como sent (demo).
  if (data.gmail_draft_id) {
    try {
      const { sendApprovedDraft } = await import("@/lib/gmail/client")
      const r = await sendApprovedDraft(data as any)
      await sb
        .from("drafts")
        .update({ sent_at: new Date().toISOString(), gmail_draft_id: r.gmail_message_id })
        .eq("id", id)
      await sb.from("emails").update({ status: "sent" }).eq("id", data.email_id)
      return NextResponse.json({ ok: true, sent: true, gmail_message_id: r.gmail_message_id })
    } catch (err) {
      // No interrumpimos el demo si Gmail falla.
      await sb.from("drafts").update({ sent_at: new Date().toISOString() }).eq("id", id)
      await sb.from("emails").update({ status: "sent" }).eq("id", data.email_id)
      return NextResponse.json({ ok: true, sent: false, gmail_error: err instanceof Error ? err.message : String(err) })
    }
  }

  // Demo path: no hay Gmail real — marcamos como enviado igual.
  await sb.from("drafts").update({ sent_at: new Date().toISOString() }).eq("id", id)
  await sb.from("emails").update({ status: "sent" }).eq("id", data.email_id)
  return NextResponse.json({ ok: true, sent: true, mode: "demo" })
}
