/**
 * MCP server tools — el subset PÚBLICO que TriageMail expone vía MCP.
 *
 * Cualquier cliente AI (Claude Desktop, Cursor, ChatGPT con MCP, otro agente)
 * puede agregar este server y triarse su inbox a través de las tools de TriageMail.
 *
 * REQUISITO DURO de Track 2 del hackathon (v0 + MCPs).
 *
 * Auth: este sprint el server es público (MCP_PUBLIC=true). Para producir,
 * agregar JWT Supabase derivado del user_token param.
 */

import { z } from "zod"
import { adminClient } from "../db/supabase"
import { runTriageForUser } from "../agent/runner"

async function resolveUserId(user_token: string): Promise<string | null> {
  // En este sprint user_token = email del usuario. En prod sería JWT verificado.
  const sb = adminClient()
  const { data } = await sb.from("users").select("id").eq("email", user_token).maybeSingle()
  return data?.id ?? null
}

/**
 * Define cada tool MCP como objeto plano. El endpoint route.ts las registra
 * con el SDK de mcp-handler.
 */
export const MCP_TOOLS = {
  triage_inbox: {
    description:
      "Corre el agente de TriageMail sobre el inbox del usuario y devuelve métricas. Usa el modo default del usuario.",
    schema: z.object({
      user_token: z.string().describe("Email del usuario (en este sprint = email; en prod = JWT)"),
      max_emails: z.number().int().min(1).max(20).default(10).optional(),
    }),
    handler: async (args: { user_token: string; max_emails?: number }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      const result = await runTriageForUser({ user_id, max_emails: args.max_emails })
      return {
        triaged_count: result.processed,
        drafts_pending: result.drafts_created,
        mode: result.mode,
        duration_ms: result.duration_ms,
      }
    },
  },
  summarize_email: {
    description: "Devuelve el resumen de 150 caracteres de un email del usuario.",
    schema: z.object({
      user_token: z.string(),
      msg_id: z.string().describe("gmail_msg_id del email"),
    }),
    handler: async (args: { user_token: string; msg_id: string }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      const sb = adminClient()
      const { data } = await sb
        .from("emails")
        .select("summary_150, urgency, importance, eisenhower")
        .eq("user_id", user_id)
        .eq("gmail_msg_id", args.msg_id)
        .maybeSingle()
      if (!data) return { error: "email not found" }
      return data
    },
  },
  prioritize_email: {
    description: "Devuelve la priorización (urgency, importance, score, eisenhower) de un email.",
    schema: z.object({
      user_token: z.string(),
      msg_id: z.string(),
    }),
    handler: async (args: { user_token: string; msg_id: string }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      const sb = adminClient()
      const { data } = await sb
        .from("emails")
        .select("urgency, importance, priority_score, eisenhower, deadline_detected_at, applied_heuristics")
        .eq("user_id", user_id)
        .eq("gmail_msg_id", args.msg_id)
        .maybeSingle()
      if (!data) return { error: "email not found" }
      return data
    },
  },
  list_pending_approvals: {
    description: "Lista los drafts del usuario que están pendientes de aprobación humana.",
    schema: z.object({
      user_token: z.string(),
    }),
    handler: async (args: { user_token: string }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      const sb = adminClient()
      const { data } = await sb
        .from("drafts")
        .select("id, body, emily_briefing, mode_generated, voice_note_url, created_at, email_id")
        .eq("user_id", user_id)
        .eq("awaiting_approval", true)
        .order("created_at", { ascending: false })
        .limit(20)
      return { drafts: data ?? [] }
    },
  },
  create_draft_for_thread: {
    description:
      "Crea un draft pendiente de aprobación para un thread específico. body en voz del usuario, emily_briefing en voz Emily.",
    schema: z.object({
      user_token: z.string(),
      thread_id: z.string().describe("gmail_thread_id"),
      body: z.string().max(2000),
      emily_briefing: z.string().max(500).optional(),
    }),
    handler: async (args: {
      user_token: string
      thread_id: string
      body: string
      emily_briefing?: string
    }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      const sb = adminClient()
      const { data: email } = await sb
        .from("emails")
        .select("id")
        .eq("user_id", user_id)
        .eq("gmail_thread_id", args.thread_id)
        .order("received_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!email) return { error: "no email found for thread" }
      const { data: draft, error } = await sb
        .from("drafts")
        .insert({
          user_id,
          email_id: email.id,
          body: args.body,
          emily_briefing: args.emily_briefing ?? null,
          mode_generated: "review",
          awaiting_approval: true,
        })
        .select("id")
        .single()
      if (error) return { error: error.message }
      return { draft_id: draft.id, awaiting_approval: true }
    },
  },
} as const
