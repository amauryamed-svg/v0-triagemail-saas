import { NextResponse } from "next/server"
import { z } from "zod"
import { generateText } from "ai"
import { MODELS } from "@/lib/ai/providers"
import { INFORMATIVE_SYSTEM_PROMPT } from "@/lib/agent/prompts"

export const runtime = "nodejs"
export const maxDuration = 30

const Body = z.object({
  text: z.string().min(20).max(8000),
})

/**
 * POST /api/quickwin/summarize
 *
 * Quick win del Screen 7 del landing viral. Toma cualquier texto del usuario,
 * lo pasa a Claude Haiku 4.5 con el system prompt informativo de Emily, y
 * devuelve summary ≤150 chars.
 *
 * Si ANTHROPIC_API_KEY no está configurado en Vercel, fallback a respuesta
 * canned con delay artificial (mantiene el flow del demo aunque pierde
 * realismo).
 *
 * Rate-limit naive: cada call es ~500 tokens = $0.0005 con Haiku 4.5.
 * Si recibimos abuso, agregar Vercel KV / Upstash Redis para limit.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "El correo es muy corto o muy largo." }, { status: 400 })
  }

  const start = Date.now()

  // Si no hay API key, respuesta canned con delay para mantener UX
  if (!process.env.ANTHROPIC_API_KEY && !process.env.AI_GATEWAY_API_KEY) {
    await new Promise((r) => setTimeout(r, 2800))
    return NextResponse.json({
      summary: cannedSummary(parsed.data.text),
      durationMs: Date.now() - start,
      cached: true,
    })
  }

  try {
    const { text } = await generateText({
      model: MODELS.informative,
      system: INFORMATIVE_SYSTEM_PROMPT,
      prompt: parsed.data.text,
      temperature: 0.2,
    })
    const summary = text.trim().slice(0, 150)
    return NextResponse.json({
      summary,
      durationMs: Date.now() - start,
      cached: false,
    })
  } catch (err) {
    // Fallback gracioso si el modelo falla
    await new Promise((r) => setTimeout(r, 1500))
    return NextResponse.json({
      summary: cannedSummary(parsed.data.text),
      durationMs: Date.now() - start,
      cached: true,
    })
  }
}

/**
 * Heurística básica para producir un summary plausible cuando no hay LLM.
 * Toma las primeras palabras significativas del correo + detecta keywords
 * de urgencia para que el output suene "Emily".
 */
function cannedSummary(input: string): string {
  const lower = input.toLowerCase()
  const isUrgent = /urgente|deadline|lunes|hoy|ya|antes|mañana|cierre/.test(lower)
  const isDonor = /bezos|fund|donante|propuesta|grant|convocatoria/.test(lower)
  const isMye = /reporte|m&e|baseline|salvaguardas|indicadores|firma/.test(lower)
  const isCompliance = /audit|kpmg|formulario|anexo|due diligence|firmado/.test(lower)

  if (isDonor && isUrgent) {
    return "Donante con deadline próximo. Concept note pendiente, requiere respuesta hoy o mañana AM."
  }
  if (isMye) {
    return "Reporte M&E por firma para liberar desembolso. Bloquea 30 min antes del cierre."
  }
  if (isCompliance) {
    return "Auditoría con formularios anexos. Bloque continuo de 2h sugerido, no fragmentes."
  }
  if (isUrgent) {
    return "Deadline próximo detectado. Sube prioridad y prepara respuesta antes de hoy 5pm."
  }

  // Default: truncate first 140 chars
  const clean = input.replace(/\s+/g, " ").trim()
  return clean.length > 140 ? clean.slice(0, 137) + "..." : clean
}
