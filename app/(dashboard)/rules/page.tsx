"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
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
  type: "push" | "deadline" | "attachment" | "sender"
}

const initialRules: Rule[] = [
  {
    id: "cross-platform",
    title: "Mismo contacto me escribe en WhatsApp + Mail",
    isEnabled: true,
    stat: "disparada 8 veces este mes",
    type: "push",
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
          Configura las reglas que determinan cuándo el agente te notifica de inmediato.
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
              isEnabled={rule.isEnabled}
              onToggle={(enabled) => toggleRule(rule.id, enabled)}
              stat={rule.stat}
            >
              {/* Cross-platform push settings */}
              {rule.type === "push" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Umbral de pushes:</span>
                  <Input
                    type="number"
                    value={pushThreshold}
                    onChange={(e) => setPushThreshold(e.target.value)}
                    className="w-20 h-9 bg-white/[0.02] border-white/[0.06]"
                    min={1}
                    max={10}
                  />
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
