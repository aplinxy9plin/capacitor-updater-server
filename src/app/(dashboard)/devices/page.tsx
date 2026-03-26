"use client"

import useSWR from "swr"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Smartphone } from "lucide-react"

interface Device {
  id: string; deviceId: string; platform: string | null; appId: string | null
  currentVersion: string | null; lastSeenAt: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DevicesPage() {
  const { data: devices = [], isLoading } = useSWR<Device[]>("/api/v1/devices", fetcher, { refreshInterval: 30_000 })

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Devices</h1>
        <p className="mt-1 text-sm text-muted-foreground">Devices that have checked for updates</p>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Smartphone className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No devices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">They appear after checking for updates</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>App</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map(d => (
                <TableRow key={d.id} className="transition-colors hover:bg-accent/50">
                  <TableCell className="font-mono text-sm">{d.deviceId.slice(0, 16)}...</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{d.appId || "\u2014"}</TableCell>
                  <TableCell><Badge variant="outline">{d.platform || "\u2014"}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{d.currentVersion || "builtin"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(d.lastSeenAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
