/**
 * Orchestrator del agente — entry point para cron / manual triage / MCP calls.
 * Lee inbox del usuario, corre informativo + review (o automode) por cada email.
 */

import { adminClient } from "../db/supabase"
import { runInformative } from "./modes/informative"
import { runReview } from "./modes/review"
import { runAutomode } from "./modes/automode"

export type AgentMode = "informative" | "review" | "automode"

export async function runTriageForUser(args: {
  user_id: string
  mode_override?: AgentMode
  max_emails?: number
}) {
  const sb = adminClient()
  const startedAt = Date.now()

  // 1. Lee user para saber su modo default + voice_id.
  const { data: user, error: userErr } = await sb
    .from("users")
    .select("id, mode_default, elevenlabs_voice_id")
    .eq("id", args.user_id)
    .single()
  if (userErr || !user) throw new Error(userErr?.message ?? "user not found")

  const mode: AgentMode = (args.mode_override ?? user.mode_default ?? "review") as AgentMode

  // 2. Lee correos pending (los que el cron ya parseó de Gmail y guardó).
  const { data: pendingEmails } = await sb
    .from("emails")
    .select("id, gmail_msg_id, gmail_thread_id, subject, from_email, from_name, snippet, attachments_json")
    .eq("user_id", args.user_id)
    .eq("status", "pending")
    .order("received_at", { ascending: false })
    .limit(args.max_emails ?? 20)

  const emails = pendingEmails ?? []
  let processed = 0
  let draftsCreated = 0
  const errors: { email_id: string; error: string }[] = []

  for (const email of emails) {
    try {
      const bodyText = email.snippet ?? ""

      // Step 1: informative summary (siempre corre — alimenta la UI rápido).
      const { summary } = await runInformative({
        subject: email.subject,
        from: email.from_email,
        body_text: bodyText,
        snippet: email.snippet,
      })
      await sb.from("emails").update({ summary_150: summary }).eq("id", email.id)

      // Step 2: review or automode con tools (puede crear draft).
      if (mode === "review") {
        await runReview({
          user_id: args.user_id,
          email_id: email.id,
          subject: email.subject,
          from_email: email.from_email,
          from_name: email.from_name,
          snippet: email.snippet,
          body_text: bodyText,
        })
      } else if (mode === "automode") {
        await runAutomode({
          user_id: args.user_id,
          email_id: email.id,
          voice_id: user.elevenlabs_voice_id,
          subject: email.subject,
          from_email: email.from_email,
          from_name: email.from_name,
          snippet: email.snippet,
          body_text: bodyText,
        })
      }

      // Cuento drafts creados después de la corrida.
      const { count } = await sb
        .from("drafts")
        .select("id", { count: "exact", head: true })
        .eq("email_id", email.id)
      if ((count ?? 0) > 0) draftsCreated += 1

      processed += 1
    } catch (err) {
      errors.push({ email_id: email.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  const durationMs = Date.now() - startedAt
  await sb.from("agent_runs").insert({
    user_id: args.user_id,
    run_type: args.mode_override ? "manual_triage" : "cron_triage",
    status: errors.length === 0 ? "success" : errors.length < emails.length ? "partial" : "error",
    emails_processed: processed,
    drafts_created: draftsCreated,
    duration_ms: durationMs,
    details: { mode, errors },
  })

  return {
    mode,
    processed,
    drafts_created: draftsCreated,
    errors,
    duration_ms: durationMs,
  }
}
