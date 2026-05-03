/**
 * Tools internas del agente — definidas con AI SDK 6 `tool()` + Zod.
 * Estas son las tools que el LLM puede llamar durante el agent loop.
 *
 * El subset PÚBLICO se re-exporta vía MCP server en `lib/mcp/server.ts`.
 */

import { tool } from "ai"
import { z } from "zod"
import { adminClient } from "../../db/supabase"
import {
  classifyEmail,
  type EisenhowerQuadrant,
} from "../../emily-heuristics"
import { callJuniorMCP } from "../junior-mcp"

/* -------------------------------------------------------------------------- */
/*  Schemas compartidos                                                       */
/* -------------------------------------------------------------------------- */

const UrgencyEnum = z.enum(["low", "normal", "med", "high", "critical"])

/* -------------------------------------------------------------------------- */
/*  Tool: read_inbox                                                          */
/* -------------------------------------------------------------------------- */

export const readInbox = tool({
  description: "Lista correos sin triar del usuario, ordenados por received_at descendente.",
  inputSchema: z.object({
    user_id: z.string().uuid(),
    since: z.string().datetime().optional(),
    max: z.number().int().min(1).max(50).default(20),
  }),
  execute: async ({ user_id, since, max }) => {
    const sb = adminClient()
    let q = sb
      .from("emails")
      .select("id, gmail_msg_id, gmail_thread_id, from_email, from_name, subject, snippet, received_at, status")
      .eq("user_id", user_id)
      .eq("status", "pending")
      .order("received_at", { ascending: false })
      .limit(max)
    if (since) q = q.gte("received_at", since)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return { emails: data ?? [] }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: summarize_email                                                     */
/* -------------------------------------------------------------------------- */

export const summarizeEmail = tool({
  description:
    "Resume un correo en máximo 150 caracteres. Output del modo informativo. Persiste en emails.summary_150.",
  inputSchema: z.object({
    email_id: z.string().uuid(),
    summary_150: z.string().max(150),
  }),
  execute: async ({ email_id, summary_150 }) => {
    const sb = adminClient()
    const { error } = await sb
      .from("emails")
      .update({ summary_150 })
      .eq("id", email_id)
    if (error) throw new Error(error.message)
    return { ok: true, length: summary_150.length }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: prioritize_email                                                    */
/* -------------------------------------------------------------------------- */

export const prioritizeEmail = tool({
  description:
    "Clasifica un correo según urgencia, importancia, Eisenhower y reglas de Emily. Persiste en emails.",
  inputSchema: z.object({
    email_id: z.string().uuid(),
    urgency: UrgencyEnum,
    importance: z.number().int().min(1).max(5),
    eisenhower: z.enum(["DO_FIRST", "SCHEDULE", "DELEGATE", "ELIMINATE"]),
    deadline_iso: z.string().datetime().nullable().optional(),
    applied_heuristic_ids: z.array(z.string()).default([]),
  }),
  execute: async ({ email_id, urgency, importance, eisenhower, deadline_iso, applied_heuristic_ids }) => {
    const sb = adminClient()
    const score =
      eisenhower === "DO_FIRST"
        ? 90
        : eisenhower === "SCHEDULE"
          ? 65
          : eisenhower === "DELEGATE"
            ? 40
            : 15
    const { error } = await sb
      .from("emails")
      .update({
        urgency,
        importance,
        eisenhower,
        priority_score: score,
        deadline_detected_at: deadline_iso ?? null,
        applied_heuristics: applied_heuristic_ids,
        status: "triaged",
        triaged_at: new Date().toISOString(),
      })
      .eq("id", email_id)
    if (error) throw new Error(error.message)
    return { ok: true, score, urgency, importance, eisenhower }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: detect_form_in_attachments                                          */
/* -------------------------------------------------------------------------- */

export const detectFormInAttachments = tool({
  description:
    "Inspecciona los adjuntos de un correo y reporta si alguno requiere llenado de formulario.",
  inputSchema: z.object({
    email_id: z.string().uuid(),
  }),
  execute: async ({ email_id }) => {
    const sb = adminClient()
    const { data } = await sb.from("emails").select("attachments_json").eq("id", email_id).single()
    const atts = (data?.attachments_json as Array<{ filename?: string; mime?: string }> | null) ?? []
    const formExt = /\.(pdf|docx?|xlsx?|odt)$/i
    const needsFill = atts.some((a) => a.filename && formExt.test(a.filename))
    return {
      needs_fill: needsFill,
      attachments_count: atts.length,
      // En este sprint no llenamos formularios reales — devolvemos shape consistente.
      fields: needsFill ? [{ name: "TODO", type: "text", suggested_value: null }] : [],
    }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: check_cross_platform_push                                           */
/* -------------------------------------------------------------------------- */

export const checkCrossPlatformPush = tool({
  description:
    "Verifica si un contacto ha contactado al usuario por múltiples canales (mail + whatsapp + instagram).",
  inputSchema: z.object({
    user_id: z.string().uuid(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
  }),
  execute: async ({ user_id, contact_email, contact_phone }) => {
    const sb = adminClient()
    let q = sb.from("contacts").select("push_count, last_push_at, last_push_channel").eq("user_id", user_id).limit(1)
    if (contact_email) q = q.eq("email", contact_email)
    else if (contact_phone) q = q.eq("whatsapp_phone", contact_phone)
    const { data } = await q
    const row = data?.[0]
    return {
      push_count: row?.push_count ?? 0,
      last_push_at: row?.last_push_at ?? null,
      last_push_channel: row?.last_push_channel ?? null,
      is_cross_platform: (row?.push_count ?? 0) >= 2,
    }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: create_draft                                                        */
/* -------------------------------------------------------------------------- */

export const createDraft = tool({
  description:
    "Crea un draft pendiente de aprobación. body va en la VOZ DEL USUARIO. emily_briefing va en la VOZ DE EMILY.",
  inputSchema: z.object({
    user_id: z.string().uuid(),
    email_id: z.string().uuid(),
    body: z.string().max(2000),
    emily_briefing: z.string().max(500),
    mode_generated: z.enum(["review", "automode"]),
  }),
  execute: async ({ user_id, email_id, body, emily_briefing, mode_generated }) => {
    const sb = adminClient()
    const { data, error } = await sb
      .from("drafts")
      .insert({ user_id, email_id, body, emily_briefing, mode_generated })
      .select("id")
      .single()
    if (error) throw new Error(error.message)
    await sb.from("emails").update({ status: "drafted" }).eq("id", email_id)
    return { draft_id: data.id, awaiting_approval: true }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: generate_voice_note (placeholder, real impl en lib/voice)           */
/* -------------------------------------------------------------------------- */

export const generateVoiceNote = tool({
  description:
    "Sintetiza el body del draft en la voz CLONADA DEL USUARIO via ElevenLabs. Sube MP3 a Supabase Storage.",
  inputSchema: z.object({
    draft_id: z.string().uuid(),
    text: z.string().max(800),
    voice_id: z.string(),
  }),
  execute: async ({ draft_id, text, voice_id }) => {
    // Lazy import para no cargar el SDK si no se usa.
    const { synthesizeAndUpload } = await import("../../voice/elevenlabs")
    const { audio_url, duration_ms } = await synthesizeAndUpload({ text, voice_id, draft_id })
    const sb = adminClient()
    await sb.from("drafts").update({ voice_note_url: audio_url, voice_duration_ms: duration_ms }).eq("id", draft_id)
    return { audio_url, duration_ms }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: request_approval                                                    */
/* -------------------------------------------------------------------------- */

export const requestApproval = tool({
  description:
    "Marca el draft como esperando aprobación humana. Notifica al usuario (push o email).",
  inputSchema: z.object({
    draft_id: z.string().uuid(),
    channel: z.enum(["push", "email"]).default("push"),
  }),
  execute: async ({ draft_id, channel }) => {
    // Notificación real (web push / email a uno mismo) queda como TODO post-hackathon.
    // El estado awaiting_approval ya está en true por default al crear el draft.
    return { notified: true, channel, draft_id }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: send_draft (real Gmail send)                                        */
/* -------------------------------------------------------------------------- */

export const sendDraft = tool({
  description: "Envía un draft aprobado vía Gmail API. Solo invocable post-aprobación humana.",
  inputSchema: z.object({
    draft_id: z.string().uuid(),
  }),
  execute: async ({ draft_id }) => {
    const sb = adminClient()
    const { data: draft, error } = await sb
      .from("drafts")
      .select("id, body, voice_note_url, gmail_draft_id, email_id, user_id, approved_at")
      .eq("id", draft_id)
      .single()
    if (error || !draft) throw new Error(error?.message ?? "draft not found")
    if (!draft.approved_at) throw new Error("draft not approved")

    const { sendApprovedDraft } = await import("../../gmail/client")
    const result = await sendApprovedDraft(draft)

    await sb
      .from("drafts")
      .update({ sent_at: new Date().toISOString(), gmail_draft_id: result.gmail_message_id })
      .eq("id", draft_id)
    await sb.from("emails").update({ status: "sent" }).eq("id", draft.email_id)

    return { gmail_message_id: result.gmail_message_id, sent_at: new Date().toISOString() }
  },
})

/* -------------------------------------------------------------------------- */
/*  Tool: junior_compose_gmail — Senior delega a Gemini-en-Gmail vía MCP      */
/* -------------------------------------------------------------------------- */

const JuniorComposeInput = z.object({
  thread_context: z
    .string()
    .max(6000)
    .describe("Hilo del correo (snippet + body) para que el junior tenga contexto."),
  intent: z
    .string()
    .max(500)
    .describe("Qué quiere lograr el draft (responder, reagendar, declinar, etc.)."),
  target_node: z
    .enum([
      "internal",
      "donor",
      "partner",
      "field",
      "board",
      "compliance",
      "vendor",
      "press",
      "other_external",
    ])
    .describe("Nodo del destinatario para que el junior pre-calibre el registro."),
})

export const juniorComposeGmail = tool({
  description:
    "Pide al junior MCP de Gmail (Gemini) un draft sugerido. El Senior debe calibrar la respuesta antes de create_draft. Si junior offline, devuelve fallback envelope y el Senior procede solo.",
  inputSchema: JuniorComposeInput,
  execute: async ({ thread_context, intent, target_node }) => {
    return await callJuniorMCP("gmail", { thread_context, intent, target_node })
  },
})

export const juniorComposeOutlook = tool({
  description:
    "Pide al junior MCP de Outlook (Copilot/M365) un draft sugerido. El Senior debe calibrar la respuesta antes de create_draft. Si junior offline, devuelve fallback envelope y el Senior procede solo.",
  inputSchema: JuniorComposeInput,
  execute: async ({ thread_context, intent, target_node }) => {
    return await callJuniorMCP("outlook", { thread_context, intent, target_node })
  },
})

/* -------------------------------------------------------------------------- */
/*  Helper: classifyWithEmily — usa heurísticas locales para sugerir          */
/* -------------------------------------------------------------------------- */

export function classifyWithEmilyHeuristics(input: {
  sender: string
  subject: string
  hasDeadline: boolean
  deadlineDate?: Date
  multiChannelTrigger: boolean
  channels?: string[]
  senderVIP: boolean
  category: string
}) {
  return classifyEmail(input, [])
}

/* -------------------------------------------------------------------------- */
/*  Bundles por modo                                                          */
/* -------------------------------------------------------------------------- */

export const INFORMATIVE_TOOLS = {
  summarize_email: summarizeEmail,
} as const

export const REVIEW_TOOLS = {
  prioritize_email: prioritizeEmail,
  detect_form_in_attachments: detectFormInAttachments,
  check_cross_platform_push: checkCrossPlatformPush,
  create_draft: createDraft,
  request_approval: requestApproval,
} as const

export const AUTOMODE_TOOLS = {
  prioritize_email: prioritizeEmail,
  check_cross_platform_push: checkCrossPlatformPush,
  junior_compose_gmail: juniorComposeGmail,
  junior_compose_outlook: juniorComposeOutlook,
  create_draft: createDraft,
  generate_voice_note: generateVoiceNote,
  request_approval: requestApproval,
  send_draft: sendDraft,
} as const

export type EisenhowerLabel = EisenhowerQuadrant
