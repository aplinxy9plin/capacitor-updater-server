"use client"

import useSWR from "swr"
import { BarChart3 } from "lucide-react"

interface VersionDist { version: string | null; count: number }
interface Data { totalDevices: number; versionDistribution: VersionDist[]; updateSuccessRate: string | null }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AnalyticsPage() {
  const { data, isLoading } = useSWR<Data>("/api/v1/analytics", fetcher, { refreshInterval: 30_000 })

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>
  if (!data) return null

  const maxCount = Math.max(...data.versionDistribution.map(v => Number(v.count)), 1)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Analytics</h2>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">Devices</div>
          <div className="text-2xl font-bold mt-1">{data.totalDevices}</div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">Success Rate (7d)</div>
          <div className="text-2xl font-bold mt-1">{data.updateSuccessRate ? `${data.updateSuccessRate}%` : "—"}</div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">Active Versions</div>
          <div className="text-2xl font-bold mt-1">{data.versionDistribution.length}</div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Version Distribution</h3>
        {data.versionDistribution.length === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.versionDistribution.map(v => (
              <div key={v.version} className="flex items-center gap-3">
                <span className="w-20 text-right font-mono text-muted-foreground">{v.version || "builtin"}</span>
                <div className="flex-1 bg-secondary rounded-full h-5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(Number(v.count) / maxCount) * 100}%` }} />
                </div>
                <span className="w-10 text-muted-foreground text-right">{v.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
