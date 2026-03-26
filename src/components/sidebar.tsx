"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Box, Smartphone, BarChart3, Key, Settings, LogOut, Moon, Sun, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

const nav = [
  { href: "/", label: "Apps", icon: Box },
  { href: "/devices", label: "Devices", icon: Smartphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <aside className="w-52 bg-card border-r border-border flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold tracking-tight">Cap Updater</span>
      </div>
      <nav className="flex-1 py-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm border-l-2 transition-colors",
                active
                  ? "text-foreground bg-accent border-l-primary font-medium"
                  : "text-muted-foreground border-l-transparent hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-2 border-t border-border flex gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={async () => { await authClient.signOut(); window.location.href = "/login" }} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
