"use client"

import { useState } from "react"
import useSWR from "swr"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

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
    <div>
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <div className="border border-border rounded-lg p-4 max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Registration</Label>
            <p className="text-sm text-muted-foreground mt-0.5">
              {settings.registration_enabled === "true" ? "New users can register." : "Registration disabled."}
            </p>
          </div>
          <Button size="sm" variant={settings.registration_enabled === "true" ? "destructive" : "default"} onClick={toggleRegistration} disabled={saving}>
            {settings.registration_enabled === "true" ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    </div>
  )
}
