"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Instagram, Mail, Sparkles, Network, Activity } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DEMO_USER_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? "demo@triagemail.app"

type Contact = {
  id: string
  name: string | null
  email: string | null
  whatsapp_phone: string | null
  instagram_handle: string | null
  contact_type: string
  organization: string | null
  role: string | null
  is_vip: boolean
  push_count: number
  last_push_channel: string | null
  inbound_count: number
  outbound_count: number
  last_interaction_at: string | null
  relationship_strength: number
  emily_treatment_note: string | null
  type_label: string
  last_interaction_relative: string
}

const TYPE_BADGE_COLOR: Record<string, string> = {
  internal: "rgb(124, 122, 237)",
  donor: "rgb(245, 165, 36)",
  partner: "rgb(61, 214, 140)",
  field: "rgb(229, 72, 77)",
  board: "rgb(229, 72, 77)",
  compliance: "rgb(161, 161, 170)",
  vendor: "rgb(161, 161, 170)",
  press: "rgb(161, 161, 170)",
  other_external: "rgb(161, 161, 170)",
}

/**
 * Rolodex — vista paralela que integra Inbox + Borradores + señales 360.
 * Cada fila es una relación con su pulse score (relevance + coherence + recencia).
 *
 * Reusa /api/contacts (no endpoint nuevo). Las redes sociales aquí se leen como
 * retroalimentadores de relevancia, no como disparadores de urgencia — el push_count
 * suma a "qué tan viva está la relación", separado de "qué tan urgente es responder".
 */
export default function RolodexPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/contacts?email=${encodeURIComponent(DEMO_USER_EMAIL)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : { contacts: [] }))
      .then((data) => {
        if (cancelled) return
        setContacts(data.contacts ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Pulse score derivado: relevance + coherence + recencia (sin DB nueva).
  const enriched = contacts
    .map((c) => {
      const lastMs = c.last_interaction_at ? new Date(c.last_interaction_at).getTime() : null
      const daysSince = lastMs ? Math.floor((Date.now() - lastMs) / 86_400_000) : null
      const recencyBonus = daysSince === null ? 0 : daysSince <= 3 ? 20 : daysSince <= 14 ? 10 : 0
      const multiBonus = c.push_count >= 2 ? 15 : c.push_count >= 1 ? 7 : 0
      const vipBonus = c.is_vip ? 8 : 0
      const relevance = Math.min(100, (c.relationship_strength ?? 0) + recencyBonus + multiBonus + vipBonus)
      const ratioOutbound =
        c.inbound_count > 0 ? c.outbound_count / Math.max(1, c.inbound_count) : 1
      const coherenceBase = ratioOutbound >= 0.5 ? 80 : ratioOutbound >= 0.25 ? 60 : 40
      const multiPenalty = c.push_count >= 2 && ratioOutbound < 0.3 ? -20 : 0
      const coherence = Math.max(0, Math.min(100, coherenceBase + multiPenalty))
      return { ...c, relevance, coherence, daysSince }
    })
    .sort((a, b) => b.relevance - a.relevance)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Rolodex · Mejoramiento continuo
        </p>
        <h1 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Network className="w-6 h-6 text-brand" />
          Rolodex
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Cada relación con su pulso 360. Las señales por WhatsApp e Instagram se leen como
          retroalimentadores de relevancia — relación viva — no como disparadores de urgencia.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground py-12 text-center">Cargando rolodex…</div>
        ) : enriched.length === 0 ? (
          <div className="text-sm text-muted-foreground py-12 text-center">
            Sin relaciones cargadas todavía.
          </div>
        ) : (
          enriched.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/[0.06] bg-surface p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-white/5 text-muted-foreground text-sm">
                    {(c.name ?? c.email ?? "?")
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">
                      {c.name ?? "(sin nombre)"}
                    </span>
                    {c.is_vip && (
                      <Badge
                        variant="outline"
                        className="border-[#F5A524]/40 text-[#F5A524] text-[10px] px-1.5 py-0"
                      >
                        VIP
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        borderColor: `${TYPE_BADGE_COLOR[c.contact_type] ?? "rgba(255,255,255,0.2)"}40`,
                        color: TYPE_BADGE_COLOR[c.contact_type] ?? "rgb(161, 161, 170)",
                      }}
                    >
                      {c.type_label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Última huella: {c.last_interaction_relative}
                    </span>
                  </div>

                  {(c.organization || c.role) && (
                    <div className="text-xs text-muted-foreground">
                      {[c.organization, c.role].filter(Boolean).join(" · ")}
                    </div>
                  )}

                  {/* Canales — lectura "qué canales están vivos" */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {c.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        Email
                      </span>
                    )}
                    {c.whatsapp_phone && (
                      <span className="inline-flex items-center gap-1.5 text-[#25D366]">
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </span>
                    )}
                    {c.instagram_handle && (
                      <span className="inline-flex items-center gap-1.5 text-[#E1306C]">
                        <Instagram className="w-3 h-3" />
                        Instagram
                      </span>
                    )}
                    {c.push_count > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-amber-400">
                        <Activity className="w-3 h-3" />
                        Pulso cross-canal · {c.push_count}
                      </span>
                    )}
                  </div>

                  {/* Scores 360 */}
                  <div className="flex items-center gap-6 pt-1">
                    <PulseBar label="Relevancia" value={c.relevance} hint="Qué tan viva está la relación (no urgencia)." />
                    <PulseBar label="Coherencia" value={c.coherence} hint="Consistencia entre lo dicho cross-canal." />
                  </div>

                  {c.emily_treatment_note && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand/20 bg-brand/[0.04] p-3">
                      <Sparkles className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/90 leading-relaxed flex-1">
                        {c.emily_treatment_note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function PulseBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color =
    value >= 75 ? "rgb(61, 214, 140)" : value >= 45 ? "rgb(245, 165, 36)" : "rgb(229, 72, 77)"
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground" title={hint}>
      <span>{label}</span>
      <span className="relative w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <span
          className={cn("absolute left-0 top-0 h-full rounded-full")}
          style={{ width: `${value}%`, background: color }}
        />
      </span>
      <span className="text-foreground font-medium tabular-nums">{value}%</span>
    </span>
  )
}
