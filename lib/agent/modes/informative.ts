import { generateText } from "ai"
import { MODELS } from "../../ai/providers"
import { INFORMATIVE_SYSTEM_PROMPT } from "../prompts"

/**
 * Modo Informativo — solo lectura. Resume un correo en ≤150 chars.
 * Modelo: claude-haiku-4-5. Sin tools (output directo).
 */
export async function runInformative(args: {
  subject: string | null
  from: string | null
  body_text: string
  snippet?: string | null
}): Promise<{ summary: string }> {
  const userPayload = [
    `Asunto: ${args.subject ?? "(sin asunto)"}`,
    `De: ${args.from ?? "(desconocido)"}`,
    `Snippet: ${args.snippet ?? ""}`,
    "---",
    args.body_text.slice(0, 4000),
  ].join("\n")

  const { text } = await generateText({
    model: MODELS.informative,
    system: INFORMATIVE_SYSTEM_PROMPT,
    prompt: userPayload,
    temperature: 0.2,
  })

  // Defensive cap: el modelo a veces excede 150 chars.
  const summary = text.trim().slice(0, 150)
  return { summary }
}
