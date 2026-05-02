import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"
import { runTriageForUser } from "@/lib/agent/runner"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Cron entry — corre cada 5 min via vercel.json.
 * Para cada usuario con agent_active=true:
 *   1. Sincroniza inbox de Gmail (placeholder en este sprint — usa los emails ya seedeados).
 *   2. Corre el agente en su modo default (informative + review/automode).
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`
  if (process.env.NODE_ENV === "production" && (!process.env.CRON_SECRET || auth !== expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const sb = adminClient()
  const { data: activeUsers } = await sb
    .from("users")
    .select("id")
    .eq("agent_active", true)

  const results: Array<{ user_id: string; processed: number; drafts_created: number }> = []
  for (const user of activeUsers ?? []) {
    try {
      const r = await runTriageForUser({ user_id: user.id, max_emails: 10 })
      results.push({ user_id: user.id, processed: r.processed, drafts_created: r.drafts_created })
    } catch (err) {
      results.push({ user_id: user.id, processed: 0, drafts_created: 0 })
    }
  }

  return NextResponse.json({ ok: true, users: results.length, results })
}
