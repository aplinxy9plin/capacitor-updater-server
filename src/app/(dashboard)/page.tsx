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
import { Plus, Trash2, Box } from "lucide-react"

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Apps</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New App</Button>
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
        <div className="border border-dashed border-border rounded-lg p-10 text-center">
          <Box className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-muted-foreground">No apps yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create an app to start uploading bundles</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Bundles</TableHead>
                <TableHead className="text-right">Devices</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Link href={`/apps/${app.id}`} className="font-medium hover:underline">{app.name}</Link>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{app.appId}</TableCell>
                  <TableCell>
                    {app.activeVersion
                      ? <Badge>{app.activeVersion}</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{app.bundleCount}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{app.deviceCount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteApp(app.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
