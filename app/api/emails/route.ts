import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

/**
 * GET /api/emails?email=demo@triagemail.app
 *
 * Lista emails triados/pending del usuario, junto con el push_count del contacto
 * remitente (para el badge de cross-platform en EmailCard).
 *
 * Devuelve siempre array (vacío si no hay seed) — el dashboard hace fallback a
 * mock data si el array viene vacío.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const userEmail = url.searchParams.get("email") ?? "demo@triagemail.app"

  const sb = adminClient()
  const { data: user } = await sb.from("users").select("id").eq("email", userEmail).maybeSingle()
  if (!user) return NextResponse.json({ emails: [] })

  const { data: emails } = await sb
    .from("emails")
    .select(
      "id, gmail_msg_id, gmail_thread_id, from_email, from_name, subject, snippet, summary_150, urgency, importance, eisenhower, deadline_detected_at, status, received_at",
    )
    .eq("user_id", user.id)
    .order("received_at", { ascending: false })
    .limit(40)

  // Pull push counts for senders (for cross-platform badge).
  const senders = Array.from(new Set((emails ?? []).map((e) => e.from_email).filter(Boolean))) as string[]
  const pushMap = new Map<string, { count: number; channel: string | null }>()
  if (senders.length > 0) {
    const { data: contacts } = await sb
      .from("contacts")
      .select("email, push_count, last_push_channel")
      .eq("user_id", user.id)
      .in("email", senders)
    for (const c of contacts ?? []) {
      if (c.email) pushMap.set(c.email, { count: c.push_count, channel: c.last_push_channel })
    }
  }

  // Pull pending drafts to mark hasDraft.
  const { data: pendingDrafts } = await sb
    .from("drafts")
    .select("email_id")
    .eq("user_id", user.id)
    .eq("awaiting_approval", true)
  const draftSet = new Set((pendingDrafts ?? []).map((d) => d.email_id))

  const mapped = (emails ?? []).map((e) => {
    const push = e.from_email ? pushMap.get(e.from_email) : null
    const hasDraft = draftSet.has(e.id)
    const urgencyMap: Record<string, "urgent" | "medium" | "low"> = {
      critical: "urgent",
      high: "urgent",
      med: "medium",
      normal: "medium",
      low: "low",
    }
    return {
      id: e.id,
      senderName: e.from_name ?? e.from_email ?? "(desconocido)",
      senderEmail: e.from_email ?? "",
      subject: e.subject ?? "(sin asunto)",
      summary: e.summary_150 ?? e.snippet ?? "",
      timestamp: e.received_at ? relativeTime(e.received_at) : "",
      urgency: urgencyMap[e.urgency] ?? "medium",
      importance: Math.max(1, Math.min(5, e.importance)) as 1 | 2 | 3 | 4 | 5,
      hasDraft,
      crossPlatformPushes: push?.count ?? 0,
      whatsappDoubleTrigger: push?.channel === "whatsapp" && (push?.count ?? 0) >= 2,
      instagramDoubleTrigger: push?.channel === "instagram" && (push?.count ?? 0) >= 2,
      multiChannelTrigger: (push?.count ?? 0) >= 3,
    }
  })

  return NextResponse.json({ emails: mapped, processed_count: emails?.length ?? 0 })
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return "hace minutos"
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
