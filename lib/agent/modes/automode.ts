import { generateText, stepCountIs } from "ai"
import { MODELS } from "../../ai/providers"
import { AUTOMODE_SYSTEM_PROMPT } from "../prompts"
import { AUTOMODE_TOOLS } from "../tools"

/**
 * Modo Automode — Opus 4.7 + tools + voz clonada.
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
}) {
  const userPayload = [
    `user_id: ${args.user_id}`,
    `email_id: ${args.email_id}`,
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
