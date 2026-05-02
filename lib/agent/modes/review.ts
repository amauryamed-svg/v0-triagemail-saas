import { generateText, stepCountIs } from "ai"
import { MODELS } from "../../ai/providers"
import { REVIEW_SYSTEM_PROMPT } from "../prompts"
import { REVIEW_TOOLS } from "../tools"

/**
 * Modo Senior Review — Sonnet 4.6 + tools.
 * Human-in-the-loop estricto: NUNCA envía. Solo crea drafts pendientes de aprobación.
 */
export async function runReview(args: {
  user_id: string
  email_id: string
  subject: string | null
  from_email: string | null
  from_name: string | null
  snippet: string | null
  body_text: string
}) {
  const userPayload = [
    `user_id: ${args.user_id}`,
    `email_id: ${args.email_id}`,
    `Asunto: ${args.subject ?? "(sin asunto)"}`,
    `De: ${args.from_name ?? ""} <${args.from_email ?? ""}>`,
    `Snippet: ${args.snippet ?? ""}`,
    "---",
    args.body_text.slice(0, 6000),
  ].join("\n")

  const result = await generateText({
    model: MODELS.review,
    system: REVIEW_SYSTEM_PROMPT,
    prompt: userPayload,
    tools: REVIEW_TOOLS,
    stopWhen: stepCountIs(6),
    temperature: 0.4,
  })

  return {
    finishReason: result.finishReason,
    steps: result.steps.length,
    text: result.text,
  }
}
