import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { adminClient } from "../db/supabase"

/**
 * ElevenLabs Voice Clone + TTS wrapper.
 *
 * El feature de "voz clonada" del agente: muestra de 15s del USUARIO →
 * voice_id permanente → TTS para drafts outbound. La voz que sale es la del usuario.
 */

const STORAGE_BUCKET = "voice-notes"

function client() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set")
  return new ElevenLabsClient({ apiKey })
}

export async function cloneInstantVoice(args: {
  user_id: string
  name: string
  audio_blob: Blob
}): Promise<{ voice_id: string }> {
  const eleven = client()
  // El SDK acepta File-like; convertimos Blob → File.
  const file = new File([args.audio_blob], `${args.user_id}-sample.mp3`, { type: "audio/mpeg" })
  const created = await eleven.voices.ivc.create({
    name: args.name,
    files: [file],
    description: `TriageMail voice clone for user ${args.user_id}`,
  })
  const voice_id = created.voiceId
  if (!voice_id) throw new Error("ElevenLabs did not return voice_id")

  await adminClient().from("users").update({ elevenlabs_voice_id: voice_id }).eq("id", args.user_id)
  return { voice_id }
}

export async function synthesizeAndUpload(args: {
  text: string
  voice_id: string
  draft_id: string
}): Promise<{ audio_url: string; duration_ms: number }> {
  const eleven = client()
  const audioStream = await eleven.textToSpeech.convert(args.voice_id, {
    text: args.text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  })

  // Acumular el stream a un Buffer.
  const chunks: Uint8Array[] = []
  const reader = (audioStream as ReadableStream<Uint8Array>).getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const audioBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)))

  // Subir a Supabase Storage (bucket privado, signed URL 24h).
  const sb = adminClient()
  const path = `drafts/${args.draft_id}.mp3`
  const { error: uploadErr } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true })
  if (uploadErr) throw new Error(uploadErr.message)

  const { data: signed, error: signErr } = await sb.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24)
  if (signErr || !signed) throw new Error(signErr?.message ?? "failed to sign URL")

  // Estimación: ~15 chars/sec en español neutro.
  const duration_ms = Math.round((args.text.length / 15) * 1000)
  return { audio_url: signed.signedUrl, duration_ms }
}
