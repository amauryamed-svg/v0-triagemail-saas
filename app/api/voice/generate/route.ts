import { NextResponse } from "next/server"
import { z } from "zod"
import { synthesizeAndUpload } from "@/lib/voice/elevenlabs"

export const runtime = "nodejs"
export const maxDuration = 30

const Body = z.object({
  draft_id: z.string().uuid(),
  text: z.string().max(800),
  voice_id: z.string(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}))
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await synthesizeAndUpload(parsed.data)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
