"use client"

import { motion } from "framer-motion"
import { Mail, Mic, Shield, Bell, Globe, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const settingsSections = [
  {
    title: "Conexiones",
    items: [
      {
        icon: Mail,
        title: "Gmail",
        description: "amaury@company.com",
        status: "connected",
        action: "Desconectar",
      },
      {
        icon: MessageCircle,
        title: "WhatsApp",
        description: "+52 55 1234 5678",
        status: "connected",
        action: "Cambiar",
        color: "#25D366",
      },
      {
        icon: Mic,
        title: "Voz clonada",
        description: "Grabada el 15 de enero, 2026",
        status: "connected",
        action: "Regrabar",
      },
    ],
  },
  {
    title: "Notificaciones",
    items: [
      {
        icon: Bell,
        title: "Notificaciones push",
        description: "Recibe alertas cuando lleguen correos críticos",
        toggle: true,
        defaultValue: true,
      },
      {
        icon: Globe,
        title: "Resumen diario",
        description: "Email con resumen de actividad del agente",
        toggle: true,
        defaultValue: true,
      },
    ],
  },
  {
    title: "Privacidad",
    items: [
      {
        icon: Shield,
        title: "Datos de entrenamiento",
        description: "Permitir uso anónimo para mejorar el modelo",
        toggle: true,
        defaultValue: false,
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Ajustes
        </h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y preferencias de TriageMail.
        </p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {section.title}
          </h2>
          
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface",
                  "hover:bg-white/[0.02] transition-colors"
                )}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: item.color ? `${item.color}15` : (item.status === "connected" ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.04)"),
                    color: item.color || (item.status === "connected" ? "rgb(34, 197, 94)" : "rgb(161, 161, 170)")
                  }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                {item.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {item.action}
                  </Button>
                )}

                {item.toggle && (
                  <Switch defaultChecked={item.defaultValue} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 pt-4"
      >
        <h2 className="text-sm font-medium text-destructive uppercase tracking-wider">
          Zona de peligro
        </h2>
        
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground">Eliminar cuenta</h3>
              <p className="text-sm text-muted-foreground">
                Esta acción es irreversible. Se borrarán todos tus datos.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
