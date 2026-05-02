import { google } from "googleapis"
import { adminClient } from "../db/supabase"

/**
 * Gmail API helpers usando googleapis + tokens guardados en users.gmail_*.
 *
 * Scopes mínimos requeridos (configurados en NextAuth GoogleProvider):
 *   - gmail.readonly
 *   - gmail.modify
 *   - gmail.compose
 *   - gmail.labels
 * NO usar gmail.send — envío via users.drafts.send post-aprobación.
 */

function getOauth2Client(access_token: string, refresh_token: string | null) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  client.setCredentials({
    access_token,
    refresh_token: refresh_token ?? undefined,
  })
  return client
}

async function getUserGmail(user_id: string) {
  const sb = adminClient()
  const { data: user, error } = await sb
    .from("users")
    .select("id, gmail_access_token, gmail_refresh_token, gmail_token_expires_at")
    .eq("id", user_id)
    .single()
  if (error || !user) throw new Error(error?.message ?? "user not found")
  if (!user.gmail_access_token) throw new Error("user has no gmail_access_token — login required")
  const auth = getOauth2Client(user.gmail_access_token, user.gmail_refresh_token)
  return google.gmail({ version: "v1", auth })
}

export async function listRecentThreads(args: { user_id: string; max?: number; sinceDays?: number }) {
  const gmail = await getUserGmail(args.user_id)
  const sinceDays = args.sinceDays ?? 1
  const q = `newer_than:${sinceDays}d -in:chats -category:promotions`
  const res = await gmail.users.threads.list({
    userId: "me",
    q,
    maxResults: args.max ?? 20,
  })
  return res.data.threads ?? []
}

export async function fetchMessage(args: { user_id: string; message_id: string }) {
  const gmail = await getUserGmail(args.user_id)
  const res = await gmail.users.messages.get({
    userId: "me",
    id: args.message_id,
    format: "full",
  })
  const msg = res.data
  const headers = msg.payload?.headers ?? []
  const get = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null

  return {
    id: msg.id ?? "",
    thread_id: msg.threadId ?? "",
    snippet: msg.snippet ?? "",
    subject: get("Subject"),
    from: get("From"),
    to: get("To"),
    date: get("Date"),
    body_text: extractPlainText(msg.payload),
    attachments: extractAttachments(msg.payload),
  }
}

function extractPlainText(part: any): string {
  if (!part) return ""
  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64").toString("utf-8")
  }
  if (Array.isArray(part.parts)) {
    return part.parts.map(extractPlainText).join("\n")
  }
  return ""
}

function extractAttachments(part: any): Array<{ filename: string; mime: string; size: number }> {
  if (!part) return []
  const out: Array<{ filename: string; mime: string; size: number }> = []
  const visit = (p: any) => {
    if (p.filename && p.body?.attachmentId) {
      out.push({ filename: p.filename, mime: p.mimeType ?? "application/octet-stream", size: p.body.size ?? 0 })
    }
    if (Array.isArray(p.parts)) p.parts.forEach(visit)
  }
  visit(part)
  return out
}

export async function ensureLabel(args: { user_id: string; name: string }) {
  const gmail = await getUserGmail(args.user_id)
  const list = await gmail.users.labels.list({ userId: "me" })
  const existing = list.data.labels?.find((l) => l.name === args.name)
  if (existing) return existing.id!
  const created = await gmail.users.labels.create({
    userId: "me",
    requestBody: { name: args.name, labelListVisibility: "labelShow", messageListVisibility: "show" },
  })
  return created.data.id!
}

export async function createDraftInGmail(args: {
  user_id: string
  thread_id: string
  to: string
  subject: string
  body: string
}) {
  const gmail = await getUserGmail(args.user_id)
  const raw = Buffer.from(
    [
      `To: ${args.to}`,
      `Subject: ${args.subject.startsWith("Re:") ? args.subject : "Re: " + args.subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      args.body,
    ].join("\r\n"),
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw, threadId: args.thread_id } },
  })
  return { gmail_draft_id: res.data.id! }
}

export async function sendApprovedDraft(draft: {
  user_id: string
  email_id: string
  body: string
  voice_note_url: string | null
  gmail_draft_id: string | null
}): Promise<{ gmail_message_id: string }> {
  const gmail = await getUserGmail(draft.user_id)
  if (draft.gmail_draft_id) {
    const res = await gmail.users.drafts.send({
      userId: "me",
      requestBody: { id: draft.gmail_draft_id },
    })
    return { gmail_message_id: res.data.id ?? "" }
  }
  // Fallback: si no hay draft preexistente en Gmail, lo creamos y enviamos.
  // Necesitaríamos to/subject — por ahora retornamos error explícito.
  throw new Error("draft has no gmail_draft_id — create draft in Gmail first")
}
