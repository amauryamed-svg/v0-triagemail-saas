import { anthropic } from "@ai-sdk/anthropic"

/**
 * Model registry. Direct Anthropic provider for simplicity in hackathon sprint.
 *
 * Para migrar a Vercel AI Gateway (1 sola key, fallbacks built-in):
 *   import { gateway } from "ai"
 *   informative: gateway("anthropic/claude-haiku-4-5"),
 *   ...
 *
 * En Vercel deployment, OIDC auto-resuelve la auth del Gateway sin AI_GATEWAY_API_KEY.
 */
export const MODELS = {
  informative: anthropic("claude-haiku-4-5"),
  review: anthropic("claude-sonnet-4-6"),
  automode: anthropic("claude-opus-4-7"),
} as const

export type AgentMode = keyof typeof MODELS
