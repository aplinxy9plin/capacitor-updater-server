"use client"

import { useState } from "react"
import useSWR from "swr"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Key, Plus, Trash2, Copy, AlertTriangle } from "lucide-react"

interface ApiKey { id: string; name: string; keyPrefix: string; lastUsedAt: string | null; createdAt: string }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ApiKeysPage() {
  const { data: keys = [], isLoading, mutate } = useSWR<ApiKey[]>("/api/v1/api-keys", fetcher, { refreshInterval: 30_000 })
  const [name, setName] = useState("")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function createKey() {
    if (!name) return
    const r = await fetch("/api/v1/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    if (r.ok) { const d = await r.json(); setCreatedKey(d.key); setName(""); mutate() }
  }

  async function deleteKey(id: string) {
    if (!confirm("Delete this API key?")) return
    await fetch(`/api/v1/api-keys?id=${id}`, { method: "DELETE" }); mutate()
  }

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setCreatedKey(null) }}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{createdKey ? "Key Created" : "Create API Key"}</DialogTitle></DialogHeader>
            {createdKey ? (
              <div className="space-y-3 pt-2">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all flex items-start gap-2">
                  <span className="flex-1">{createdKey}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => navigator.clipboard.writeText(createdKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Copy this key now. It won't be shown again.
                </p>
                <Button onClick={() => { setDialogOpen(false); setCreatedKey(null) }} className="w-full">Done</Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Name</Label>
                  <Input placeholder="e.g. Production" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <Button onClick={createKey} disabled={!name} className="w-full">Create</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center">
          <Key className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-muted-foreground">No API keys. Create one for your Capacitor app.</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map(k => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{k.keyPrefix}...</TableCell>
                  <TableCell className="text-muted-foreground">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteKey(k.id)}>
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
