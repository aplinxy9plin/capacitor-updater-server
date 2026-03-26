"use client"

import { useState } from "react"
import useSWR from "swr"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings, Shield } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SettingsPage() {
  const { data: settings = {}, isLoading, mutate } = useSWR<Record<string, string>>("/api/v1/settings", fetcher)
  const [saving, setSaving] = useState(false)

  async function toggleRegistration() {
    setSaving(true)
    const v = settings.registration_enabled === "true" ? "false" : "true"
    await fetch("/api/v1/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registration_enabled: v }) })
    mutate({ ...settings, registration_enabled: v }, false)
    setSaving(false)
  }

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Server configuration</p>
      </div>

      <div className="max-w-lg rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <Label className="text-sm font-semibold text-foreground">User Registration</Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {settings.registration_enabled === "true"
                ? "New users can create accounts."
                : "Registration is disabled. Only existing users can sign in."}
            </p>
          </div>
          <Button
            size="sm"
            variant={settings.registration_enabled === "true" ? "destructive" : "default"}
            onClick={toggleRegistration}
            disabled={saving}
          >
            {settings.registration_enabled === "true" ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    </div>
  )
}
