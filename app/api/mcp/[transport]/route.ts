import { createMcpHandler } from "mcp-handler"
import { MCP_TOOLS } from "@/lib/mcp/server"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * MCP server endpoint para TriageMail.
 *
 * Este endpoint cumple el REQUISITO DURO de Track 2 del hackathon (v0 + MCPs).
 *
 * Estructura de archivo: app/api/mcp/[transport]/route.ts
 * Endpoints reales:
 *   - POST /api/mcp/mcp  → Streamable HTTP (recomendado)
 *   - GET  /api/mcp/sse  → Server-Sent Events (legacy)
 *
 * Para usar desde Claude Desktop u otro cliente MCP:
 *   {
 *     "mcpServers": {
 *       "triagemail": {
 *         "url": "https://v0-triagemail-saas.vercel.app/api/mcp/mcp"
 *       }
 *     }
 *   }
 */
const handler = createMcpHandler(
  (server) => {
    for (const [name, def] of Object.entries(MCP_TOOLS)) {
      server.tool(
        name,
        def.description,
        // mcp-handler espera el shape de Zod (no el objeto Zod completo).
        (def.schema as any)._def.shape() ?? {},
        async (args: any) => {
          const result = await (def.handler as any)(args)
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result) }],
          }
        },
      )
    }
  },
  {},
  { basePath: "/api/mcp" },
)

export { handler as GET, handler as POST, handler as DELETE }
