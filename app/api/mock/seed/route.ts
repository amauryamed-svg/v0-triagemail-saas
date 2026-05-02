import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

/**
 * Seed demo data para grabar el video del hackathon.
 * POST /api/mock/seed?email=amauryamed@gmail.com
 *
 * Crea: 1 user (si no existe) + 8 contacts + 8 emails + 4 triage_rules.
 * Idempotente — no duplica.
 */
export async function POST(req: Request) {
  const url = new URL(req.url)
  const userEmail = url.searchParams.get("email") ?? "demo@triagemail.app"

  const sb = adminClient()

  // 1. User
  const { data: user, error: userErr } = await sb
    .from("users")
    .upsert(
      {
        email: userEmail,
        name: "Demo User",
        mode_default: "review",
        agent_active: true,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single()
  if (userErr || !user) return NextResponse.json({ error: userErr?.message ?? "user upsert failed" }, { status: 500 })

  const user_id = user.id

  // 2. Contacts (8) — incluye 2 con push_count >= 2 para trigger cross-platform.
  const contacts = [
    { email: "ana@acmecorp.com", name: "Ana Velasco", whatsapp_phone: "+525512345678", is_vip: true, push_count: 3, last_push_channel: "whatsapp" },
    { email: "carlos@biggerco.io", name: "Carlos Hernández", whatsapp_phone: "+525587654321", push_count: 2, last_push_channel: "instagram" },
    { email: "investor@vc-fund.com", name: "María Pichardo", is_vip: true, push_count: 0 },
    { email: "vendor@saas-tools.com", name: "Vendor Bot" },
    { email: "team@notifications.slack.com", name: "Slack Notifications" },
    { email: "newsletter@product-hunt.com", name: "Product Hunt Daily" },
    { email: "legal@compliance-firm.com", name: "Despacho Legal" },
    { email: "client@longtail-customer.mx", name: "Cliente Cola Larga" },
  ]
  for (const c of contacts) {
    await sb
      .from("contacts")
      .upsert(
        {
          user_id,
          ...c,
          last_push_at: c.push_count ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,email" } as any,
      )
  }

  // 3. Emails (8) con variedad de urgencia.
  const emails = [
    {
      gmail_msg_id: "demo-msg-001",
      gmail_thread_id: "demo-thread-001",
      from_email: "ana@acmecorp.com",
      from_name: "Ana Velasco",
      subject: "Propuesta — necesito tu OK hoy",
      snippet: "Hola, necesito que revises la propuesta antes del lunes 9am. También te escribí por WhatsApp. Es urgente para el cierre.",
      urgency: "critical",
      importance: 5,
      eisenhower: "DO_FIRST",
      priority_score: 95,
      deadline_detected_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
      status: "triaged",
      summary_150: "Propuesta urgente Acme, deadline lunes 9am, Ana también escribió por WhatsApp.",
      received_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-002",
      gmail_thread_id: "demo-thread-002",
      from_email: "carlos@biggerco.io",
      from_name: "Carlos Hernández",
      subject: "Follow-up cotización Q2",
      snippet: "Carlos te dio un ping en Instagram también. Espera respuesta sobre el SOW.",
      urgency: "high",
      importance: 4,
      eisenhower: "SCHEDULE",
      priority_score: 75,
      status: "triaged",
      summary_150: "Follow-up SOW Q2 BiggerCo, también escribió por Instagram.",
      received_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-003",
      gmail_thread_id: "demo-thread-003",
      from_email: "investor@vc-fund.com",
      from_name: "María Pichardo",
      subject: "Term sheet revisión",
      snippet: "Adjunto el term sheet revisado. Necesita tu firma. Llámame si dudas.",
      urgency: "high",
      importance: 5,
      eisenhower: "SCHEDULE",
      priority_score: 80,
      attachments_json: [{ filename: "term-sheet-v3.pdf", mime: "application/pdf", size: 184000 }],
      status: "triaged",
      summary_150: "Term sheet v3 firma pendiente, María Pichardo VC.",
      received_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-004",
      gmail_thread_id: "demo-thread-004",
      from_email: "client@longtail-customer.mx",
      from_name: "Cliente Cola Larga",
      subject: "¿Sigue disponible la promo de marzo?",
      snippet: "Solo confirmo si todavía aplica el descuento que me pasaron en marzo.",
      urgency: "low",
      importance: 2,
      eisenhower: "DELEGATE",
      priority_score: 30,
      status: "triaged",
      summary_150: "Cliente pregunta por promo de marzo. Decisión simple.",
      received_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-005",
      gmail_thread_id: "demo-thread-005",
      from_email: "vendor@saas-tools.com",
      from_name: "Vendor Sales",
      subject: "¿Café la próxima semana?",
      snippet: "Me encantaría platicar 30 min sobre cómo podemos apoyarte con observability.",
      urgency: "low",
      importance: 1,
      eisenhower: "ELIMINATE",
      priority_score: 10,
      status: "triaged",
      summary_150: "Vendor pide café. Decline o reagendar.",
      received_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-006",
      gmail_thread_id: "demo-thread-006",
      from_email: "newsletter@product-hunt.com",
      from_name: "Product Hunt",
      subject: "Top launches today",
      snippet: "AI tools, productivity apps, and more.",
      urgency: "low",
      importance: 1,
      eisenhower: "ELIMINATE",
      priority_score: 5,
      status: "triaged",
      summary_150: "Promocional, ignorar.",
      received_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-007",
      gmail_thread_id: "demo-thread-007",
      from_email: "legal@compliance-firm.com",
      from_name: "Despacho Legal",
      subject: "Forma SAT por llenar",
      snippet: "Adjunto la forma. Por favor completar y firmar.",
      urgency: "med",
      importance: 4,
      eisenhower: "SCHEDULE",
      priority_score: 65,
      attachments_json: [{ filename: "forma-sat-2026.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 45000 }],
      status: "triaged",
      summary_150: "Forma SAT por llenar, despacho legal.",
      received_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    },
    {
      gmail_msg_id: "demo-msg-008",
      gmail_thread_id: "demo-thread-008",
      from_email: "team@notifications.slack.com",
      from_name: "Slack",
      subject: "You have 12 unread messages",
      snippet: "Catch up on what you missed in #general, #engineering, #ops.",
      urgency: "low",
      importance: 1,
      eisenhower: "ELIMINATE",
      priority_score: 5,
      status: "triaged",
      summary_150: "Notificación Slack. FYI, sin acción.",
      received_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ]
  for (const e of emails) {
    await sb.from("emails").upsert(
      { user_id, ...e } as any,
      { onConflict: "user_id,gmail_msg_id" } as any,
    )
  }

  // 4. Triage rules — los 4 default toggles que muestra la UI.
  const rules = [
    { name: "Mismo contacto en WhatsApp + Mail", trigger_type: "cross_platform_push", conditions: { min_push_count: 2 }, priority_boost: 20, trigger_count: 3 },
    { name: "Deadline detectado en cuerpo", trigger_type: "deadline", conditions: { window_hours: 48 }, priority_boost: 15, trigger_count: 1 },
    { name: "Adjunto requiere llenar formulario", trigger_type: "attachment_form", conditions: {}, priority_boost: 10, trigger_count: 2 },
    { name: "Remitente importante", trigger_type: "vip_sender", conditions: { vip_emails: ["ana@acmecorp.com", "investor@vc-fund.com"] }, priority_boost: 25, trigger_count: 4 },
  ]
  for (const r of rules) {
    await sb.from("triage_rules").upsert(
      { user_id, ...r, enabled: true } as any,
      { onConflict: "user_id,name" } as any,
    )
  }

  // 5. Crear 1 draft pendiente de aprobación (para demo del flujo approve).
  const { data: anaEmail } = await sb
    .from("emails")
    .select("id")
    .eq("user_id", user_id)
    .eq("gmail_msg_id", "demo-msg-001")
    .single()
  if (anaEmail) {
    await sb.from("drafts").upsert(
      {
        user_id,
        email_id: anaEmail.id,
        body:
          "Recibido. Te respondo formal el lunes AM con la propuesta cerrada y la calendarizamos para que firmemos esa misma tarde. Si urge antes, márcame.",
        emily_briefing:
          "Cross-platform push detectado (whatsapp + mail). Subí urgencia a critical. Deadline lunes — protegí tu lunes 9-11am en calendario para esto.",
        mode_generated: "review",
        awaiting_approval: true,
      } as any,
      { onConflict: "email_id" } as any,
    )
  }

  return NextResponse.json({
    ok: true,
    user_id,
    seeded: { contacts: contacts.length, emails: emails.length, rules: rules.length, draft: !!anaEmail },
  })
}
