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
import {
  LANGUAGE_REGISTER_BY_NODE,
  CONTACT_TYPE_TONE,
  type ContactType,
} from "../emily-contact-treatment"

const NODE_VALUES = [
  "internal",
  "donor",
  "partner",
  "field",
  "board",
  "compliance",
  "vendor",
  "press",
  "other_external",
] as const satisfies readonly ContactType[]

function readOrgPurposesPublic(): string[] {
  const raw = process.env.ORG_PURPOSES_JSON
  if (!raw) {
    return [
      "Fortalecer redes inter-institucionales de cooperación.",
      "Mantener cadencia honesta con donantes y contrapartes.",
      "Proteger plazos y compromisos formales.",
    ]
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed
    }
  } catch {
    // ignore
  }
  return []
}

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

  /* ----------------------------------------------------------------------- */
  /*  translate_for_node — devuelve registro + reglas para el nodo destinatario */
  /* ----------------------------------------------------------------------- */
  translate_for_node: {
    description:
      "Devuelve el registro lingüístico y las reglas de sintaxis del nodo destinatario para que el cliente LLM reescriba el draft sin alterar la sustancia. Sustancia inmutable; envoltorio (apertura, sintaxis, léxico, cierre) calibrado al nodo.",
    schema: z.object({
      source_text: z
        .string()
        .max(4000)
        .describe("Texto original (cualquier registro)."),
      target_node: z
        .enum(NODE_VALUES)
        .describe("Nodo destinatario: internal, donor, partner, field, board, compliance, vendor, press, other_external."),
    }),
    handler: async (args: { source_text: string; target_node: ContactType }) => {
      const register = LANGUAGE_REGISTER_BY_NODE[args.target_node]
      const tone = CONTACT_TYPE_TONE[args.target_node]
      return {
        target_node: args.target_node,
        register,
        tone,
        source_text: args.source_text,
        instruction:
          "Reescribe source_text aplicando el register: usa la apertura y cierre dados, respeta syntaxRules, conserva acrónimos en acronymsAllowed, evita lo listado en avoid. NO cambies hechos, fechas, montos, nombres ni compromisos.",
        contract: {
          preserve_facts: true,
          preserve_numbers: true,
          rewrite_envelope_only: true,
        },
      }
    },
  },

  /* ----------------------------------------------------------------------- */
  /*  align_to_purpose — valida draft contra propósitos org                 */
  /* ----------------------------------------------------------------------- */
  align_to_purpose: {
    description:
      "Devuelve los propósitos organizacionales declarados (vía env ORG_PURPOSES_JSON o defaults) junto con instrucción para que el cliente LLM detecte drift en un draft. Output estructurado para que el cliente decida.",
    schema: z.object({
      draft_text: z
        .string()
        .max(4000)
        .describe("Texto del draft a validar."),
      target_node: z
        .enum(NODE_VALUES)
        .optional()
        .describe("Opcional: nodo destinatario para contexto."),
    }),
    handler: async (args: { draft_text: string; target_node?: ContactType }) => {
      const purposes = readOrgPurposesPublic()
      return {
        purposes,
        draft_text: args.draft_text,
        target_node: args.target_node ?? null,
        instruction:
          "Verifica si el draft promete o sugiere algo fuera de los purposes. Si sí, devuelve { aligned: false, drift: <razón corta>, recalibration_hint: <qué quitar/cambiar> }. Si está dentro, devuelve { aligned: true }. NO recalibres tú; solo flagéalo.",
        contract: {
          must_check_promises: true,
          must_not_invent_facts: true,
        },
      }
    },
  },

  /* ----------------------------------------------------------------------- */
  /*  relationship_pulse — 360 feed + relevance/coherence scores            */
  /* ----------------------------------------------------------------------- */
  relationship_pulse: {
    description:
      "Devuelve un feed 360 de la relación: timeline de touchpoints por canal (email, WhatsApp, Instagram), relevance_score (0-100, separado de urgency) y coherence_score (consistencia cross-canal aproximada). Las redes sociales son retroalimentadores de relevancia, no disparadores de urgencia.",
    schema: z.object({
      user_token: z.string(),
      contact_email: z.string().email().optional(),
      contact_id: z.string().uuid().optional(),
    }),
    handler: async (args: {
      user_token: string
      contact_email?: string
      contact_id?: string
    }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      if (!args.contact_email && !args.contact_id) {
        return { error: "provide contact_email or contact_id" }
      }
      const sb = adminClient()
      let q = sb
        .from("contacts")
        .select(
          "id, name, email, contact_type, organization, role, is_vip, push_count, last_push_at, last_push_channel, last_interaction_at, inbound_count, outbound_count, relationship_strength, suggested_cadence, next_touchpoint_suggested_at, emily_treatment_note",
        )
        .eq("user_id", user_id)
        .limit(1)
      if (args.contact_id) q = q.eq("id", args.contact_id)
      else if (args.contact_email) q = q.eq("email", args.contact_email)
      const { data, error } = await q.maybeSingle()
      if (error || !data) return { error: error?.message ?? "contact not found" }

      const now = Date.now()
      const lastInteractionMs = data.last_interaction_at
        ? new Date(data.last_interaction_at).getTime()
        : null
      const daysSince = lastInteractionMs
        ? Math.floor((now - lastInteractionMs) / 86_400_000)
        : null

      // relevance_score: combina relationship_strength (0-100), VIP bonus,
      // multi-canal bonus y recencia. Saturado a 100.
      const recencyBonus =
        daysSince === null ? 0 : daysSince <= 3 ? 20 : daysSince <= 14 ? 10 : 0
      const multiChannelBonus = data.push_count >= 2 ? 15 : data.push_count >= 1 ? 7 : 0
      const vipBonus = data.is_vip ? 8 : 0
      const relevance_score = Math.min(
        100,
        (data.relationship_strength ?? 0) + recencyBonus + multiChannelBonus + vipBonus,
      )

      // coherence_score (heurístico para el slice): si el contacto tiene
      // touchpoints recientes en múltiples canales pero zero outbound, hay
      // riesgo de incongruencia (no respondiste por uno y se acumula otro).
      const ratioOutbound =
        data.inbound_count > 0
          ? data.outbound_count / Math.max(1, data.inbound_count)
          : 1
      const coherenceBase = ratioOutbound >= 0.5 ? 80 : ratioOutbound >= 0.25 ? 60 : 40
      const multiChannelPenalty = data.push_count >= 2 && ratioOutbound < 0.3 ? -20 : 0
      const coherence_score = Math.max(0, Math.min(100, coherenceBase + multiChannelPenalty))

      // Feed 360 — para el slice usamos la última huella registrada por canal
      // (un timeline persistente cross-canal queda en roadmap).
      const feed: Array<{
        channel: string
        kind: "inbound" | "outbound" | "push"
        at: string | null
        note?: string
      }> = []
      if (data.last_interaction_at) {
        feed.push({ channel: "email", kind: "inbound", at: data.last_interaction_at })
      }
      if (data.last_push_at && data.last_push_channel) {
        feed.push({
          channel: data.last_push_channel,
          kind: "push",
          at: data.last_push_at,
          note: "Pulso cross-canal — leerlo como relación viva, no como urgencia.",
        })
      }

      return {
        contact: {
          id: data.id,
          name: data.name,
          email: data.email,
          type: data.contact_type,
          organization: data.organization,
          role: data.role,
          is_vip: data.is_vip,
        },
        feed,
        relevance_score,
        coherence_score,
        days_since_last_interaction: daysSince,
        push_count: data.push_count,
        cadence_hint: data.suggested_cadence,
        next_touchpoint_suggested_at: data.next_touchpoint_suggested_at,
        emily_note: data.emily_treatment_note,
        framing:
          "Las señales cross-canal son retroalimentadores de relevancia. Verifica congruencia antes de responder; solo escala a urgencia si hay deadline explícito en el mensaje.",
      }
    },
  },

  /* ----------------------------------------------------------------------- */
  /*  check_cross_channel_coherence — flagea contradicciones cross-canal    */
  /* ----------------------------------------------------------------------- */
  check_cross_channel_coherence: {
    description:
      "Dado un draft propuesto y un contacto, devuelve los últimos N touchpoints registrados cross-canal y una instrucción para que el cliente LLM detecte contradicciones entre el draft y lo dicho previamente en otros canales.",
    schema: z.object({
      user_token: z.string(),
      contact_email: z.string().email().optional(),
      contact_id: z.string().uuid().optional(),
      draft_text: z.string().max(4000),
    }),
    handler: async (args: {
      user_token: string
      contact_email?: string
      contact_id?: string
      draft_text: string
    }) => {
      const user_id = await resolveUserId(args.user_token)
      if (!user_id) return { error: "user not found" }
      if (!args.contact_email && !args.contact_id) {
        return { error: "provide contact_email or contact_id" }
      }
      const sb = adminClient()
      let q = sb
        .from("contacts")
        .select("id, push_count, last_push_at, last_push_channel, last_interaction_at, emily_treatment_note")
        .eq("user_id", user_id)
        .limit(1)
      if (args.contact_id) q = q.eq("id", args.contact_id)
      else if (args.contact_email) q = q.eq("email", args.contact_email)
      const { data, error } = await q.maybeSingle()
      if (error || !data) return { error: error?.message ?? "contact not found" }

      const recentTouchpoints: Array<{ channel: string; at: string | null; kind: string }> = []
      if (data.last_interaction_at) {
        recentTouchpoints.push({
          channel: "email",
          at: data.last_interaction_at,
          kind: "inbound",
        })
      }
      if (data.last_push_at && data.last_push_channel) {
        recentTouchpoints.push({
          channel: data.last_push_channel,
          at: data.last_push_at,
          kind: "push",
        })
      }

      return {
        recent_touchpoints: recentTouchpoints,
        push_count: data.push_count,
        emily_note: data.emily_treatment_note,
        draft_text: args.draft_text,
        instruction:
          "Compara draft_text contra los recent_touchpoints. Detecta contradicciones (ej: el draft dice 'no pude el lunes' pero por WhatsApp ya confirmaste asistir). Si encuentras contradicción, devuelve { coherent: false, conflicts: [{ channel, conflict, fix_hint }] }. Si no, devuelve { coherent: true }.",
        contract: {
          must_check_facts: true,
          must_check_commitments: true,
          must_check_dates: true,
        },
      }
    },
  },

  /* ----------------------------------------------------------------------- */
  /*  draft_for_step — guía de drafting step-aware (escape-hatch freeform) */
  /* ----------------------------------------------------------------------- */
  draft_for_step: {
    description:
      "Devuelve el registro lingüístico y las reglas de sintaxis combinadas (nodo + step freeform) para que el cliente LLM redacte un draft consciente del paso del workflow. Step se pasa como string libre tipo 'financiera-presupuesto-q1' (escape-hatch — la tabla estructurada queda en roadmap).",
    schema: z.object({
      target_node: z.enum(NODE_VALUES),
      workflow_step_freeform: z
        .string()
        .max(120)
        .describe("Tag freeform del paso del workflow. Ej: 'financiera-presupuesto-q1', 'contratos-bilaterales', 'salvaguardas-anexo2'."),
      intent: z
        .string()
        .max(500)
        .describe("Qué quiere lograr el draft (responder, reagendar, declinar, confirmar entregable, etc.)."),
    }),
    handler: async (args: {
      target_node: ContactType
      workflow_step_freeform: string
      intent: string
    }) => {
      const register = LANGUAGE_REGISTER_BY_NODE[args.target_node]
      const tone = CONTACT_TYPE_TONE[args.target_node]
      const stepSlug = args.workflow_step_freeform.toLowerCase()

      // Hints específicos por familia de step (escape-hatch — patterns
      // comunes en el nicho cooperación).
      const stepHints: string[] = []
      if (/financ|presupuesto|desembolso|pago/.test(stepSlug)) {
        stepHints.push("Registro numérico-formal: cifras con moneda y año fiscal, fechas explícitas, cero ambigüedad.")
      }
      if (/contrato|mou|convenio|bilateral/.test(stepSlug)) {
        stepHints.push("Registro diplomático-contractual: cita el marco compartido (MoU/convenio), reconoce a las dos partes, tiempos verbales formales.")
      }
      if (/salvaguard|safeguards|due-?diligence|kyc|compliance/.test(stepSlug)) {
        stepHints.push("Registro técnico-legal: referencia anexo y artículo cuando aplique, fechas en formato completo, sujeto-verbo-objeto.")
      }
      if (/m&e|meal|reporte|baseline|indicadores/.test(stepSlug)) {
        stepHints.push("Registro de M&E: dato con fuente, periodo de reporte explícito, evita aspiraciones sin métrica.")
      }
      if (/board|consejo|comite|comité|working[-_ ]group/.test(stepSlug)) {
        stepHints.push("Registro consejo: contexto → posición → recomendación → riesgos → entregable. Una decisión solicitada por mensaje.")
      }
      if (stepHints.length === 0) {
        stepHints.push("Step desconocido: aplica solo el registro del nodo destinatario y mantén respuesta breve.")
      }

      return {
        target_node: args.target_node,
        workflow_step: args.workflow_step_freeform,
        intent: args.intent,
        node_register: register,
        node_tone: tone,
        step_hints: stepHints,
        instruction:
          "Redacta el draft aplicando node_register + step_hints. Mantén máximo 4 líneas (email) o 60 palabras (voice note). NO cites el step al destinatario — es contexto interno.",
        contract: {
          rewrite_envelope: true,
          preserve_facts: true,
          observe_step_hints: true,
        },
      }
    },
  },
} as const
