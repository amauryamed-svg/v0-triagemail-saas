"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { SidebarNav } from "./sidebar-nav"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarWidth] = useState(240)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      
      {/* Top bar */}
      <header 
        className="fixed top-0 right-0 h-16 border-b border-white/[0.06] bg-background/80 backdrop-blur-sm z-40 flex items-center justify-end px-6 gap-4"
        style={{ left: sidebarWidth }}
      >
        <Link href="/modes">
          <Badge 
            variant="outline" 
            className="border-brand/30 text-brand bg-brand/10 hover:bg-brand/15 transition-colors cursor-pointer"
          >
            Modo: Senior Review
          </Badge>
        </Link>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
      </header>

      {/* Main content */}
      <main 
        className="pt-16 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
