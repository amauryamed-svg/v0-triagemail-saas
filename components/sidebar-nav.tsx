"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Inbox, 
  FileEdit, 
  Layers, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Bandeja", icon: Inbox },
  { href: "/drafts", label: "Borradores", icon: FileEdit },
  { href: "/modes", label: "Modos", icon: Layers },
  { href: "/rules", label: "Reglas", icon: Filter },
  { href: "/settings", label: "Ajustes", icon: Settings },
]

export function SidebarNav() {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen border-r border-white/[0.06] bg-background flex flex-col z-50"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-sm font-semibold text-white">T</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-foreground"
              >
                TriageMail
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    "hover:bg-white/[0.04]",
                    "active:scale-[0.98] transition-transform duration-120",
                    isActive && "bg-white/[0.06] text-foreground",
                    !isActive && "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/[0.06] bg-surface flex items-center justify-center hover:bg-white/[0.04] transition-colors"
      >
        {isExpanded ? (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src="/avatar.jpg" alt="Amaury" />
            <AvatarFallback className="bg-brand/20 text-brand text-sm">AM</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">Amaury</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-calm" />
                  <span className="text-xs text-muted-foreground truncate">
                    Agente activo · Sábado
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
