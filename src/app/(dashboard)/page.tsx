"use client"

import { useState } from "react"
import useSWR from "swr"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { Plus, Trash2, Box, Package, Smartphone, ChevronRight } from "lucide-react"

interface App {
  id: string; name: string; appId: string; bundleCount: number
  deviceCount: number; activeVersion: string | null; createdAt: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AppsPage() {
  const { data: apps = [], isLoading, mutate } = useSWR<App[]>("/api/v1/apps", fetcher, { refreshInterval: 30_000 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [appId, setAppId] = useState("")
  const [error, setError] = useState("")

  async function createApp() {
    setError("")
    const res = await fetch("/api/v1/apps", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, appId }),
    })
    if (!res.ok) { setError((await res.json()).message); return }
    setDialogOpen(false); setName(""); setAppId(""); mutate()
  }

  async function deleteApp(id: string) {
    if (!confirm("Delete this app and all its bundles?")) return
    await fetch(`/api/v1/apps/${id}`, { method: "DELETE" }); mutate()
  }

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apps</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your Capacitor applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New App
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add App</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label>App Name</Label>
                <Input placeholder="My App" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label>App ID</Label>
                <Input placeholder="com.example.myapp" value={appId} onChange={e => setAppId(e.target.value)} className="font-mono" />
                <p className="text-xs text-muted-foreground mt-1">Must match appId in capacitor.config.ts</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={createApp} disabled={!name || !appId} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Box className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No apps yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create an app to start uploading bundles</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <div key={app.id} className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Link href={`/apps/${app.id}`} className="font-semibold text-foreground hover:underline">
                      {app.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{app.appId}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteApp(app.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  <span>{app.bundleCount} bundles</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{app.deviceCount} devices</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div>
                  {app.activeVersion
                    ? <Badge>{app.activeVersion}</Badge>
                    : <span className="text-xs text-muted-foreground">No active version</span>}
                </div>
                <Link
                  href={`/apps/${app.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Manage <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
