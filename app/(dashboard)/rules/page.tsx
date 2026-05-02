"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X, MessageCircle, Zap, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RuleRow } from "@/components/rule-row"
import { toast } from "sonner"

interface Rule {
  id: string
  title: string
  description?: string
  isEnabled: boolean
  stat: string
  type: "multichannel" | "deadline" | "attachment" | "sender"
  isPriority?: boolean
}

const initialRules: Rule[] = [
  {
    id: "cross-platform",
    title: "Multi-trigger: WhatsApp + Instagram + Email",
    description: "Escala automáticamente cuando un contacto te escribe por múltiples canales",
    isEnabled: true,
    stat: "disparada 12 veces este mes",
    type: "multichannel",
    isPriority: true,
  },
  {
    id: "deadline",
    title: "Detecto deadline en el cuerpo",
    isEnabled: true,
    stat: "disparada 15 veces este mes",
    type: "deadline",
  },
  {
    id: "attachment",
    title: "Adjunto requiere llenar formulario",
    isEnabled: false,
    stat: "disparada 2 veces este mes",
    type: "attachment",
  },
  {
    id: "important-sender",
    title: "Remitente importante",
    isEnabled: true,
    stat: "disparada 12 veces este mes",
    type: "sender",
  },
]

export default function RulesPage() {
  const [rules, setRules] = useState(initialRules)
  const [pushThreshold, setPushThreshold] = useState("2")
  const [deadlineWindow, setDeadlineWindow] = useState("48h")
  const [importantEmails, setImportantEmails] = useState(["ceo@acme.com", "finance@acme.com"])
  const [newEmail, setNewEmail] = useState("")

  const toggleRule = (ruleId: string, enabled: boolean) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, isEnabled: enabled } : rule
    ))
    const rule = rules.find(r => r.id === ruleId)
    toast(enabled 
      ? `Listo. Regla "${rule?.title}" activada.` 
      : `Regla "${rule?.title}" desactivada.`
    )
  }

  const addEmail = () => {
    if (newEmail && !importantEmails.includes(newEmail)) {
      setImportantEmails([...importantEmails, newEmail])
      setNewEmail("")
      toast("Listo. Email agregado.")
    }
  }

  const removeEmail = (email: string) => {
    setImportantEmails(importantEmails.filter(e => e !== email))
    toast("Email eliminado.")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Cuándo escalar un correo
        </h1>
        <p className="text-muted-foreground">
          Configura las reglas que determinan cuándo Emily te notifica de inmediato.
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <RuleRow
              title={rule.title}
              description={rule.description}
              isEnabled={rule.isEnabled}
              onToggle={(enabled) => toggleRule(rule.id, enabled)}
              stat={rule.stat}
              isPriority={rule.isPriority}
            >
              {/* Multi-channel trigger settings */}
              {rule.type === "multichannel" && (
                <div className="space-y-4">
                  {/* Connected channels */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#25D366]/5 border border-[#25D366]/20">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">WhatsApp</p>
                        <p className="text-xs text-muted-foreground truncate">+52 55 1234 5678</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#833AB4]/5 via-[#FD1D1D]/5 to-[#F77737]/5 border border-[#E1306C]/20">
                      <Instagram className="w-5 h-5 text-[#E1306C]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">Instagram</p>
                        <p className="text-xs text-muted-foreground truncate">@amaury_ceo</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Ventana de coincidencia:</span>
                    <Select defaultValue="30min">
                      <SelectTrigger className="w-32 bg-white/[0.02] border-white/[0.06]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">15 minutos</SelectItem>
                        <SelectItem value="30min">30 minutos</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="2h">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-urgent/5 border border-urgent/20">
                    <Zap className="w-4 h-4 text-urgent shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Si el mismo contacto te escribe por WhatsApp, Instagram o ambos <strong className="text-foreground">+</strong> email dentro de esta ventana, se escala como urgente.
                    </p>
                  </div>
                </div>
              )}

              {/* Deadline settings */}
              {rule.type === "deadline" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Ventana:</span>
                  <Select value={deadlineWindow} onValueChange={setDeadlineWindow}>
                    <SelectTrigger className="w-32 bg-white/[0.02] border-white/[0.06]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="48h">48 horas</SelectItem>
                      <SelectItem value="72h">72 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Important sender settings */}
              {rule.type === "sender" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {importantEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="outline"
                        className="border-white/[0.06] bg-white/[0.02] gap-1.5 pr-1"
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(email)}
                          className="ml-1 hover:bg-white/10 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="agregar email..."
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addEmail()}
                      className="flex-1 h-9 bg-white/[0.02] border-white/[0.06]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addEmail}
                      className="h-9"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}
            </RuleRow>
          </motion.div>
        ))}
      </div>

      {/* Add Custom Rule Button */}
      <Button
        variant="outline"
        disabled
        className="w-full border-white/[0.06] border-dashed text-muted-foreground gap-2"
      >
        <Plus className="w-4 h-4" />
        Agregar regla custom
        <Badge variant="outline" className="ml-2 border-white/[0.06] text-muted-foreground">
          Próximamente
        </Badge>
      </Button>
    </div>
  )
}
