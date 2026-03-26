"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Upload, Play, Trash2, Plus, Package } from "lucide-react"
import Link from "next/link"

interface Bundle {
  id: string; version: string; status: string; fileSize: number | null
  notes: string | null; checksumSha256: string | null; createdAt: string
}
interface App { id: string; name: string; appId: string }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: app, isLoading: appLoading } = useSWR<App>(`/api/v1/apps/${id}`, fetcher, { refreshInterval: 30_000 })
  const { data: bundles = [], isLoading: bundlesLoading, mutate } = useSWR<Bundle[]>(`/api/v1/apps/${id}/bundles`, fetcher, { refreshInterval: 30_000 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [version, setVersion] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function uploadBundle() {
    if (!version || !file) return
    setUploading(true); setError("")
    try {
      const cr = await fetch(`/api/v1/apps/${id}/bundles`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: version.trim(), notes: notes.trim() || undefined }),
      })
      if (!cr.ok) { setError((await cr.json()).message); setUploading(false); return }
      const bundle = await cr.json()
      const ur = await fetch(`/api/v1/apps/${id}/bundles/${bundle.id}/upload`, { method: "POST", body: file })
      if (!ur.ok) { setError((await ur.json()).message); setUploading(false); return }
      setDialogOpen(false); setVersion(""); setNotes(""); setFile(null); mutate()
    } catch { setError("Upload failed") }
    setUploading(false)
  }

  async function activate(bundleId: string) {
    await fetch(`/api/v1/apps/${id}/bundles/${bundleId}/activate`, { method: "POST" }); mutate()
  }
  async function del(bundleId: string) {
    if (!confirm("Delete this bundle?")) return
    await fetch(`/api/v1/apps/${id}/bundles/${bundleId}`, { method: "DELETE" }); mutate()
  }

  function fmtSize(b: number | null) {
    if (!b) return "\u2014"
    return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  if (appLoading || bundlesLoading) return <div className="text-muted-foreground p-4">Loading...</div>
  if (!app) return <div className="text-destructive p-4">App not found</div>

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{app.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">{app.appId}</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setError(""); setFile(null) } }}>
          <DialogTrigger>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Upload Bundle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Bundle</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label>Version</Label>
                <Input placeholder="1.0.0" value={version} onChange={e => setVersion(e.target.value)} className="font-mono" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="What changed..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>Zip file</Label>
                <div
                  className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted"
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                  {file
                    ? <p className="text-sm"><span className="font-medium">{file.name}</span> — {fmtSize(file.size)}</p>
                    : <p className="text-muted-foreground"><Upload className="h-5 w-5 mx-auto mb-1" />Select .zip file</p>}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={uploadBundle} disabled={uploading || !version || !file} className="w-full">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bundles */}
      {bundles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No bundles yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload your first bundle</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((b) => (
                <TableRow key={b.id} className="transition-colors hover:bg-accent/50">
                  <TableCell className="font-mono font-medium">{b.version}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "active" ? "default" : b.status === "draft" ? "outline" : "secondary"}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtSize(b.fileSize)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-40 truncate">{b.notes || "\u2014"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {b.status === "draft" && b.checksumSha256 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => activate(b.id)} title="Activate">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {b.status !== "active" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => del(b.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
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
