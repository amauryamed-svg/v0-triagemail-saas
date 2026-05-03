"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MessageCircle, Instagram, Mail, Sparkles, PhoneCall } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SyncActionsSheet } from "@/components/triagemail/sync-actions-sheet"
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
  suggested_cadence: string | null
  next_touchpoint_suggested_at: string | null
  emily_treatment_note: string | null
  type_label: string
  tone_hint: string
  cadence_label: string
  last_interaction_relative: string
  next_touchpoint_relative: string | null
}

const TYPE_FILTERS: { id: string; label: string; tone: string }[] = [
  { id: "all", label: "Todos", tone: "" },
  { id: "internal", label: "Equipo interno", tone: "rgb(124, 122, 237)" },
  { id: "donor", label: "Donantes", tone: "rgb(245, 165, 36)" },
  { id: "partner", label: "Contrapartes", tone: "rgb(61, 214, 140)" },
  { id: "field", label: "Campo", tone: "rgb(229, 72, 77)" },
  { id: "board", label: "Consejo", tone: "rgb(229, 72, 77)" },
  { id: "compliance", label: "Compliance", tone: "rgb(161, 161, 170)" },
  { id: "vendor", label: "Vendors", tone: "rgb(161, 161, 170)" },
]

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

export default function ContactsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [syncContact, setSyncContact] = useState<Contact | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/contacts?email=${encodeURIComponent(DEMO_USER_EMAIL)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : { contacts: [], totals: {} }))
      .then((data) => {
        if (cancelled) return
        setContacts(data.contacts ?? [])
        setTotals(data.totals ?? {})
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered =
    activeFilter === "all"
      ? contacts
      : contacts.filter((c) => c.contact_type === activeFilter)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Relacionamiento institucional · Inbound + Outbound
        </p>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Relaciones
        </h1>
        <p className="text-muted-foreground">
          Los nodos con los que Emily organiza tu inbox. Equipo, donantes, contrapartes, comités, campo y compliance — cada uno con su propio idioma.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => {
          const count = f.id === "all" ? totals._all ?? contacts.length : totals[f.id] ?? 0
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors active:scale-[0.98]",
                activeFilter === f.id
                  ? "bg-white/10 text-foreground"
                  : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Contacts list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground py-12 text-center">Cargando contactos…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-12 text-center">
            Sin contactos en esta categoría.
          </div>
        ) : (
          filtered.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-xl border border-white/[0.06] bg-surface p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-white/5 text-muted-foreground text-sm">
                    {(contact.name ?? contact.email ?? "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top row */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">{contact.name ?? "(sin nombre)"}</span>
                    {contact.is_vip && (
                      <Badge variant="outline" className="border-[#F5A524]/40 text-[#F5A524] text-[10px] px-1.5 py-0">
                        VIP
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        borderColor: `${TYPE_BADGE_COLOR[contact.contact_type] ?? "rgba(255,255,255,0.2)"}40`,
                        color: TYPE_BADGE_COLOR[contact.contact_type] ?? "rgb(161, 161, 170)",
                      }}
                    >
                      {contact.type_label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Última interacción: {contact.last_interaction_relative}
                    </span>
                  </div>

                  {/* Org + role */}
                  {(contact.organization || contact.role) && (
                    <div className="text-xs text-muted-foreground">
                      {[contact.organization, contact.role].filter(Boolean).join(" · ")}
                    </div>
                  )}

                  {/* Channels + counters */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {contact.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.whatsapp_phone && (
                      <span className="inline-flex items-center gap-1.5 text-[#25D366]">
                        <MessageCircle className="w-3 h-3" />
                        {contact.whatsapp_phone}
                      </span>
                    )}
                    {contact.instagram_handle && (
                      <span className="inline-flex items-center gap-1.5 text-[#E1306C]">
                        <Instagram className="w-3 h-3" />
                        {contact.instagram_handle}
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Inbound <span className="text-foreground font-medium">{contact.inbound_count}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Outbound <span className="text-foreground font-medium">{contact.outbound_count}</span>
                    </span>
                    <span className="text-muted-foreground inline-flex items-center gap-2">
                      Relación
                      <span className="inline-flex items-center gap-1.5">
                        <span className="relative w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <span
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{
                              width: `${contact.relationship_strength}%`,
                              background:
                                contact.relationship_strength >= 75
                                  ? "rgb(61, 214, 140)"
                                  : contact.relationship_strength >= 45
                                    ? "rgb(245, 165, 36)"
                                    : "rgb(229, 72, 77)",
                            }}
                          />
                        </span>
                        <span className="text-foreground font-medium">{contact.relationship_strength}%</span>
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Cadencia <span className="text-foreground font-medium">{contact.cadence_label}</span>
                    </span>
                    {contact.next_touchpoint_relative && (
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Próximo {contact.next_touchpoint_relative}
                      </span>
                    )}
                  </div>

                  {/* Emily treatment note */}
                  {contact.emily_treatment_note && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand/20 bg-brand/[0.04] p-3">
                      <Sparkles className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-brand font-medium mb-1">
                          Emily sugiere
                        </p>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {contact.emily_treatment_note}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                          Tono recomendado: {contact.tone_hint}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <Button
                      onClick={() => setSyncContact(contact)}
                      size="sm"
                      className="h-7 text-xs bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30 gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Acciones sync · Emily
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Bloquear próximo touchpoint
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Ver historial
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Sync Actions Sheet — Reunión + OnCall en voz clonada */}
      <SyncActionsSheet
        open={syncContact !== null}
        onOpenChange={(v) => {
          if (!v) setSyncContact(null)
        }}
        contact={syncContact}
      />
    </div>
  )
}
