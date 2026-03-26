"use client"

import useSWR from "swr"
import { BarChart3, Smartphone, TrendingUp, Layers } from "lucide-react"

interface VersionDist { version: string | null; count: number }
interface Data { totalDevices: number; versionDistribution: VersionDist[]; updateSuccessRate: string | null }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AnalyticsPage() {
  const { data, isLoading } = useSWR<Data>("/api/v1/analytics", fetcher, { refreshInterval: 30_000 })

  if (isLoading) return <div className="text-muted-foreground p-4">Loading...</div>
  if (!data) return null

  const maxCount = Math.max(...data.versionDistribution.map(v => Number(v.count)), 1)

  const stats = [
    {
      label: "Total Devices",
      value: data.totalDevices,
      icon: Smartphone,
      color: "blue",
    },
    {
      label: "Success Rate (7d)",
      value: data.updateSuccessRate ? `${data.updateSuccessRate}%` : "\u2014",
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Active Versions",
      value: data.versionDistribution.length,
      icon: Layers,
      color: "purple",
    },
  ]

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Device and update statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colors = colorMap[stat.color]
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`rounded-full p-2.5 ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Version Distribution */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Version Distribution</h2>
        {data.versionDistribution.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.versionDistribution.map(v => (
              <div key={v.version} className="flex items-center gap-4">
                <span className="w-24 text-right font-mono text-sm text-muted-foreground">{v.version || "builtin"}</span>
                <div className="flex-1">
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-secondary">
                    <div
                      className="flex h-full items-center rounded-lg bg-primary/15 transition-all duration-500"
                      style={{ width: `${Math.max((Number(v.count) / maxCount) * 100, 4)}%` }}
                    >
                      <span className="px-2 text-xs font-medium text-foreground">{v.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
