import { generateText, stepCountIs } from "ai"
import { MODELS } from "../../ai/providers"
import { AUTOMODE_SYSTEM_PROMPT } from "../prompts"
import { AUTOMODE_TOOLS } from "../tools"

/**
 * Modo Automode — Opus 4.7 (Senior) + tools + voz clonada.
 *
 * Senior/Junior:
 *   - El Senior (este modelo) decide tono, estrategia, y aprobación final.
 *   - Los Juniors (Gemini Gmail / Copilot Outlook) viven detrás de MCPs
 *     externos y proponen cuerpos de draft. El Senior los calibra.
 *
 * Hoy `provider` está hardcoded a "gmail" porque la ingestión de Outlook no
 * existe. La tool `junior_compose_outlook` queda definida pero unreachable
 * — demuestra la arquitectura sin mentir sobre cobertura de Outlook.
 *
 * Aún requiere aprobación humana para enviar (send_draft solo post-aprobación).
 */
export async function runAutomode(args: {
  user_id: string
  email_id: string
  voice_id: string | null
  subject: string | null
  from_email: string | null
  from_name: string | null
  snippet: string | null
  body_text: string
  /** "gmail" | "outlook"; default "gmail" (único provider con ingest hoy). */
  provider?: "gmail" | "outlook"
  /** Tag escape-hatch del workflow step si lo asignó el usuario. */
  workflow_step_freeform?: string | null
  /** Tipo del nodo destinatario si ya se conoce; ayuda al junior y al Senior. */
  target_node?: string | null
}) {
  const provider = args.provider ?? "gmail"
  const userPayload = [
    `user_id: ${args.user_id}`,
    `email_id: ${args.email_id}`,
    `provider: ${provider}`,
    `target_node: ${args.target_node ?? "(desconocido — derívalo del remitente)"}`,
    `workflow_step_freeform: ${args.workflow_step_freeform ?? "(sin tag)"}`,
    `voice_id: ${args.voice_id ?? "(no clonada — saltarse generate_voice_note)"}`,
    `Asunto: ${args.subject ?? "(sin asunto)"}`,
    `De: ${args.from_name ?? ""} <${args.from_email ?? ""}>`,
    `Snippet: ${args.snippet ?? ""}`,
    "---",
    args.body_text.slice(0, 6000),
  ].join("\n")

  const result = await generateText({
    model: MODELS.automode,
    system: AUTOMODE_SYSTEM_PROMPT,
    prompt: userPayload,
    tools: AUTOMODE_TOOLS,
    stopWhen: stepCountIs(8),
    temperature: 0.5,
  })

  return {
    finishReason: result.finishReason,
    steps: result.steps.length,
    text: result.text,
  }
}
