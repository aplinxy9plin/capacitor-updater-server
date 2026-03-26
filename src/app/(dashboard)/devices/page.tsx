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
    <div>
      <h2 className="text-lg font-semibold mb-4">Devices</h2>
      {devices.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center">
          <Smartphone className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-muted-foreground">No devices yet. They appear after checking for updates.</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
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
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.deviceId.slice(0, 16)}...</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{d.appId || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{d.platform || "—"}</Badge></TableCell>
                  <TableCell className="font-mono">{d.currentVersion || "builtin"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(d.lastSeenAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
