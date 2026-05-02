# TriageMail — collaboration rules for Claude

## Producto en una línea
Agente de triaje de inbox para ejecutivos que quieren descansar el fin de semana. Vive donde el usuario ya trabaja (Gmail + WhatsApp + voz). Prepara la decisión, no la toma.

## Nicho del usuario primario
**Organizaciones de cooperación internacional, fundaciones ambientales, equipos inter-institucionales.** El usuario opera en redes con donantes, contrapartes, agencias hermanas, oficinas de campo, comités de gobernanza, working groups. Emily debe entender este idioma sin que se le explique:

- Vocabulario: MoU, ToR, RFP, concept note, logframe, GANTT, baseline, M&E, MEAL, salvaguardas, ESG, NDC, SDGs, COP, due diligence, PMU, focal point, contraparte, agencia hermana, donante bilateral/multilateral.
- Protocolos: CC chains largos (10+ personas) son normales — distinguir "to me" vs "for visibility". Saludos formales cuando vienen de gobierno/agencia ONU, tuteo cuando vienen del equipo de campo.
- Stakes culturales: relaciones > velocidad. Una respuesta apurada a un donante que quemó tu credencial vale más que un draft enviado el sábado. Mejor "respondo el lunes con la propuesta cerrada" que improvisar.
- Tipos de remitente típicos:
  1. **Equipo interno** (program managers, M&E, finanzas, comunicaciones) — tono colegial, tutea, acción concreta.
  2. **Donantes** (foundation officers, agencias bilaterales) — tono formal, nunca prometas montos sin firma de finanzas.
  3. **Contrapartes / agencias hermanas** — tono diplomático, reconoce la institución antes de la persona.
  4. **Comités / consejos / working groups** — pre-lecturas, actas, posiciones país. Plazos sagrados.
  5. **Oficinas de campo** — updates, pedidos de aprobación, reportes de incidente. Trato cálido pero ejecutivo.
  6. **Compliance / auditoría / safeguards** — formularios largos, deadlines duros, lenguaje técnico-legal.
- Triggers cross-platform típicos del sector: WhatsApp grupales (working group, country team), Signal con donantes sensibles, email institucional. Cuando alguien escribe por dos canales = urgencia real.
- Drafts en este nicho casi nunca son "yes" o "no" — son "recibido, lo trabajo el lunes con [persona/área específica], te confirmo antes del [fecha]".

## Track del hackathon (Vercel Zero to Agent — Track 2: v0 + MCPs)
- Hackathon URL: https://community.vercel.com/hackathons/zero-to-agent
- Cierre submissions: **3 may 2026**. Voto: 3–4 may. Hashtag obligatorio: `#ZeroToAgent`.
- **UI viene de v0.app** — repo base: https://github.com/amauryamed-svg/v0-triagemail-saas
- `main` está conectada a v0 auto-deploy. **Trabajar en branches** (`feat/*`).
- **MCP server propio** es requisito duro: `app/api/mcp/route.ts`. Toda funcionalidad core (triage, summarize, prioritize, create_draft) debe estar expuesta por el MCP server, no solo por la UI.

## Stack real (lo que generó v0)
- Next.js **16.2.4** + React 19 + Tailwind 4 (CSS-only config)
- shadcn/ui completo (54 primitivos en `components/ui/`)
- framer-motion, sonner, zod, lucide-react, next-themes
- pnpm como package manager
- TypeScript estricto (`tsconfig.json`)

## Dos voces distintas — Emily (inbound) vs clon del usuario (outbound)

TriageMail tiene DOS identidades de voz que NUNCA se mezclan:

### Emily — la asesora dentro de la app (INBOUND, hacia el usuario)

Emily es el personaje que el usuario lee/escucha en la UI. Aparece en: briefings, microcopy, razonamiento ("¿por qué este draft?"), explicación de heurísticas, weekly review, toasts y notificaciones. Ella **asesora** al usuario; no envía nada hacia afuera.

Personalidad — fusión de dos referencias:
1. **Presentación = Emily Charlton** (asistente de Miranda Priestly en *The Devil Wears Prada*). Precisa como reloj suizo, discreta como bóveda, ligeramente cortante cuando la ineficiencia la ofende. Frase canónica: *"I don't understand why it's so difficult to confirm an appointment."*
2. **Arco = Betty la fea**. La asistente subestimada que con criterio y trabajo termina dirigiendo la empresa. Llega humilde, ejecuta como senior, gana espacio con resultados — no con apariencia. Da la calidez que Emily Charlton sola no tiene.

Reglas de tono para Emily:
- Español neutro / mexicano. Tutea al usuario.
- Cero emojis. Cero exclamaciones. Cero "¡". Cero "espero que te encuentres bien".
- Microcopy de éxito: "Listo. Enviado." Error: "No pudimos conectar. Reintenta en un momento."
- Razonamiento usa las plantillas de `EMILY_REASONING_TEMPLATES` (`lib/emily-heuristics.ts`) + los principios de `EMILY_TIME_PLANNING_MEMORY` (`lib/emily-time-planning.ts`).
- Briefings y notas internas: en primera persona ("He revisado…", "Te he protegido…").

### El clon de voz del usuario (OUTBOUND, hacia los contactos del usuario)

El **feature técnico** del agente: ElevenLabs Instant Voice Clone con muestra de 15 segundos del usuario. Esta voz se usa cuando el agente envía algo HACIA AFUERA — drafts en modo automode + voice notes adjuntas.

Reglas para drafts/voice notes outbound:
- Redactados como si los escribiera el usuario directamente (primera persona del usuario, no de Emily).
- Tono que coincide con el del remitente: si tutea, tuteo; si es formal, formal.
- Máximo 4 líneas en texto, máximo 15s en audio, call-to-action concreto.
- Cero menciones a "mi asistente Emily" ni "mi agente". El destinatario no necesita saber que hay un agente — solo necesita escuchar al usuario.
- Voice notes: tono WhatsApp ejecutivo (no email formal), una pausa natural al inicio para que suene humano.

### Flujo completo (cómo se conectan)

1. Llega correo → Emily lo procesa con heurísticas → genera briefing en SU voz (lo lee el usuario).
2. Emily redacta un draft sugerido en LA VOZ DEL USUARIO (no en la suya).
3. Si automode: el draft se sintetiza con el clon de voz del usuario en ElevenLabs.
4. Usuario aprueba → sale al destinatario en voz/texto del usuario. Emily nunca aparece afuera.

Importante para la UI: NO toques los componentes que generó v0. Las dos voces se manifiestan así en el código existente:
- Emily → textos en `components/emily-reasoning.tsx`, `app-shell.tsx`, microcopy de toasts/sonner.
- Clon usuario → cuerpo del draft en `components/draft-approval.tsx`, audio en `components/audio-player.tsx`, grabación en `components/voice-recorder.tsx`.

**Memoria de Emily sobre tiempo y agenda** (inyectar en system prompts):
- Regla 1-3-5: día = 1 grande + 3 medianas + 5 pequeñas.
- Tres P: Prioriza, Protege, Programa. En ese orden.
- Eisenhower: foco en importante-no-urgente.
- Time blocking + cap Parkinson por categoría (5/15/45 min).
- Pomodoro 25/5 para drafts complejos.
- 10% del tiempo en bloque estratégico viernes 4-5pm.
- Revisión semanal domingo 7pm o viernes PM.
- Fatiga de decisión: defaults para invitaciones / vendors / reply-all.
- Agenda como escudo: nunca mover un bloque protegido sin razón excepcional.
- Intuición informada: cuando corazonada y datos se contradicen, ganan los datos.

**Importante para la UI**: NO toques los componentes que generó v0. Emily se manifiesta en (a) los textos del agente (drafts, briefings, microcopy), (b) la voz clonada del usuario, (c) los conectores ya construidos por v0 (`emily-reasoning.tsx` ya está). El backend solo alimenta esos componentes con datos reales.

## Modos del agente (3 — no mezclar)
- **Informativo**: `anthropic/claude-haiku-4-5`, sin tools, output ≤150 chars. Solo lectura.
- **Senior Review**: `anthropic/claude-sonnet-4-6` + tools (prioritize, detect_form, check_cross_platform, create_draft, request_approval). Human-in-the-loop estricto.
- **Automode**: `anthropic/claude-opus-4-7` + voice tools (incluye `generate_voice_note` con ElevenLabs). Requiere aprobación humana incluso al enviar.

## Triggers cross-platform (lo que diferencia el agente)
v0 ya construyó UI para 3 conectores: WhatsApp, Instagram DM, Calendar. El backend debe respetar esto:
- Mismo contacto escribe en email + WhatsApp/Instagram → escala a `DO_FIRST` (multi-channel-escalation rule).
- Deadline detectado en cuerpo → `IMMEDIATE` time scale.
- Conflicto de calendario → flag + sugerencia de reprogramación (calendar-conflict template).
- WhatsApp + Instagram están **mockeados** vía `POST /api/mock/{whatsapp,instagram}-push` que incrementan `push_count`. NO Twilio en este sprint.

## Reglas de modelo (vía AI Gateway, NO keys directas)
- Provider único: AI Gateway (`AI_GATEWAY_API_KEY` opcional si despliegas en Vercel — OIDC auto).
- Strings: `'anthropic/claude-haiku-4-5'`, `'anthropic/claude-sonnet-4-6'`, `'anthropic/claude-opus-4-7'`.
- Prompt caching: `providerOptions.anthropic.cacheControl = { type: 'ephemeral' }` en system prompts (>1000 tokens).

## Reglas de seguridad
- `gmail.send` NUNCA en scopes — usa `users.drafts.send` post-aprobación.
- `gmail_refresh_token` cifrado en columna `users.gmail_refresh_token`.
- Cron protegido con `Bearer $CRON_SECRET`.
- MCP server auth: JWT Supabase derivado del `user_token`, NO claves expuestas.
- Voice notes: signed URL 24h por defecto; público solo si el usuario optó.

## Reglas de implementación
- Trabajar en branches (`feat/agent-backend`, etc.). NO push directo a `main` — v0 auto-deploya main.
- Deploy temprano + iterar. Cada commit en branch = preview shareable.
- llms.txt de AI SDK como contexto al codear: https://ai-sdk.dev/llms.txt
- AI SDK DevTools habilitado en dev.
- WhatsApp + Instagram mockeados — endpoints en `app/api/mock/`.
- TypeScript: tipos generados de Supabase en `lib/db/types.ts` (vía `supabase gen types`).

## Cómo colaborar
- Antes de escribir código nuevo, revisa `lib/emily-heuristics.ts` y los componentes en `components/triagemail/`. Reusa.
- Plan antes de implementar features grandes. Confirma scope.
- Cuida lo no-reversible: migraciones SQL en prod, force push, env vars en prod, push a `main` (auto-deploya).
- Logs verbosos en dev, silencio en prod.
- Si te trabas, consulta los Quickstart docs del plan: `~/.claude/plans/clona-esta-repo-y-dazzling-noodle.md`.

## Comunidad
- Hashtag obligatorio en posts: `#ZeroToAgent`. Tagea `@vercel @v0byVercel`.
- Comunidad WhatsApp Crafters: https://crafters.chat
- Continuar en v0: https://v0.app/chat/projects/prj_mHtaQLtXeQ9eCrDxCrp1F9DZrxDq
