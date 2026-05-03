/**
 * Junior MCP client — JSON-RPC over HTTP a MCP servers EXTERNOS.
 *
 * Arquitectura Senior/Junior:
 *   - Senior = Claude Opus 4.7 dentro de Emily (lib/agent/modes/automode.ts).
 *   - Juniors = Gemini-en-Gmail y Copilot-en-Outlook expuestos vía MCP server
 *     comunitario open-source (la autoridad OAuth vive en el junior MCP, no
 *     en TriageMail). Esto permite swap de junior sin tocar código de Emily.
 *
 * Patrón replicado del que ya validamos contra mcp.higgsfield.ai/mcp:
 *   POST {url}
 *   Authorization: Bearer {token}
 *   Accept: application/json, text/event-stream
 *   Content-Type: application/json
 *
 * Si las env vars no están configuradas, las tools que usen este client
 * devuelven una offline envelope. El Senior la lee y procede a redactar él
 * mismo. Build y Automode no rompen.
 *
 * Footgun documentado: en producción cada usuario necesita su propio OAuth
 * a Gmail/MS Graph. En el slice del 3 may usamos bearer single-tenant via
 * env — multi-tenant pass-through queda en roadmap.
 */

export type JuniorChannel = "gmail" | "outlook"

export interface JuniorComposeRequest {
  thread_context: string
  intent: string
  target_node: string
}

export interface JuniorComposeOk {
  ok: true
  suggested_body: string
  raw?: unknown
}

export interface JuniorComposeOffline {
  ok: false
  error: "junior offline" | "junior failed" | "junior timeout"
  fallback_handled_by_senior: true
  detail?: string
}

export type JuniorComposeResult = JuniorComposeOk | JuniorComposeOffline

interface ChannelConfig {
  url: string | undefined
  token: string | undefined
}

function configFor(channel: JuniorChannel): ChannelConfig {
  if (channel === "gmail") {
    return {
      url: process.env.JUNIOR_MCP_GMAIL_URL,
      token: process.env.JUNIOR_MCP_GMAIL_TOKEN,
    }
  }
  return {
    url: process.env.JUNIOR_MCP_OUTLOOK_URL,
    token: process.env.JUNIOR_MCP_OUTLOOK_TOKEN,
  }
}

const TIMEOUT_MS = 15_000

/**
 * Llama a la tool `compose_email` del junior MCP. El junior decide cómo
 * implementarla — por convención esperamos `{ suggested_body: string }` en
 * el output.
 */
export async function callJuniorMCP(
  channel: JuniorChannel,
  payload: JuniorComposeRequest,
): Promise<JuniorComposeResult> {
  const cfg = configFor(channel)
  if (!cfg.url || !cfg.token) {
    return {
      ok: false,
      error: "junior offline",
      fallback_handled_by_senior: true,
      detail: `Env vars JUNIOR_MCP_${channel.toUpperCase()}_URL/_TOKEN no configuradas`,
    }
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `junior-${channel}-${Date.now()}`,
        method: "tools/call",
        params: {
          name: "compose_email",
          arguments: payload,
        },
      }),
    })

    if (!res.ok) {
      return {
        ok: false,
        error: "junior failed",
        fallback_handled_by_senior: true,
        detail: `HTTP ${res.status} desde ${channel} junior`,
      }
    }

    // El response puede venir como JSON o como SSE event-stream. Intentamos
    // parsearlo robustamente: leemos texto, removemos prefijos `event:` y
    // `data:`, y parseamos el primer JSON válido que aparezca.
    const text = await res.text()
    const cleaned = text
      .split("\n")
      .map((line) => (line.startsWith("data: ") ? line.slice(6) : line))
      .filter((line) => line && !line.startsWith("event:"))
      .join("\n")
      .trim()

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        ok: false,
        error: "junior failed",
        fallback_handled_by_senior: true,
        detail: "Respuesta del junior no contiene JSON parseable",
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      result?: {
        structuredContent?: { suggested_body?: string }
        content?: Array<{ type: string; text?: string }>
      }
      error?: { message?: string }
    }

    if (parsed.error) {
      return {
        ok: false,
        error: "junior failed",
        fallback_handled_by_senior: true,
        detail: parsed.error.message ?? "junior returned an error",
      }
    }

    const structured = parsed.result?.structuredContent?.suggested_body
    const fromText = parsed.result?.content?.find((c) => c.type === "text")?.text
    const suggested = (structured ?? fromText ?? "").toString().trim()

    if (!suggested) {
      return {
        ok: false,
        error: "junior failed",
        fallback_handled_by_senior: true,
        detail: "Junior MCP respondió sin suggested_body",
      }
    }

    return { ok: true, suggested_body: suggested, raw: parsed.result }
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError"
    return {
      ok: false,
      error: aborted ? "junior timeout" : "junior failed",
      fallback_handled_by_senior: true,
      detail: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Lectura sintética del estado de los juniors. Útil para logs y para el UI
 * del Rolodex (mostrar qué juniors están conectados).
 */
export function juniorMcpStatus(): Record<JuniorChannel, "online" | "offline"> {
  return {
    gmail:
      process.env.JUNIOR_MCP_GMAIL_URL && process.env.JUNIOR_MCP_GMAIL_TOKEN
        ? "online"
        : "offline",
    outlook:
      process.env.JUNIOR_MCP_OUTLOOK_URL && process.env.JUNIOR_MCP_OUTLOOK_TOKEN
        ? "online"
        : "offline",
  }
}
