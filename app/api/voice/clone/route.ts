import { NextResponse } from "next/server"
import { cloneInstantVoice } from "@/lib/voice/elevenlabs"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * POST /api/voice/clone
 * multipart/form-data:
 *   user_id: uuid
 *   audio: Blob (mp3/wav, idealmente 15-30s)
 *
 * Clona la voz del usuario en ElevenLabs y guarda voice_id en users.elevenlabs_voice_id.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 })

  const user_id = form.get("user_id")?.toString()
  const name = form.get("name")?.toString() ?? "TriageMail user voice"
  const audio = form.get("audio")
  if (!user_id || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "user_id and audio (blob) required" }, { status: 400 })
  }

  try {
    const { voice_id } = await cloneInstantVoice({ user_id, name, audio_blob: audio })
    return NextResponse.json({ ok: true, voice_id })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
