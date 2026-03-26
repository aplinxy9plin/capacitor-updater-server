import { sql } from "bun"

export const AnalyticsService = {
  async getAnalytics(userId: string, appIdFilter?: string) {
    const totalDevices = appIdFilter
      ? await sql`SELECT count(*)::int as count FROM devices WHERE app_id = ${appIdFilter} AND app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})`
      : await sql`SELECT count(*)::int as count FROM devices WHERE app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})`

    const versionDistribution = appIdFilter
      ? await sql`
          SELECT current_version as "version", count(*)::int as count
          FROM devices WHERE app_id = ${appIdFilter} AND app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})
          GROUP BY current_version ORDER BY count DESC
        `
      : await sql`
          SELECT current_version as "version", count(*)::int as count
          FROM devices WHERE app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})
          GROUP BY current_version ORDER BY count DESC
        `

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentLogs = await sql`
      SELECT ul.action, count(*)::int as count
      FROM update_logs ul
      JOIN devices d ON d.id = ul.device_id
      WHERE ul.created_at > ${sevenDaysAgo}::timestamp
        AND d.app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})
      GROUP BY ul.action
    `

    const successCount = Number((recentLogs as any[]).find((r: any) => r.action === "update_success")?.count ?? 0)
    const failCount = Number((recentLogs as any[]).find((r: any) => r.action === "update_fail")?.count ?? 0)
    const total = successCount + failCount
    const successRate = total > 0 ? (successCount / total * 100).toFixed(1) : null

    return {
      totalDevices: totalDevices[0]?.count ?? 0,
      versionDistribution: Array.isArray(versionDistribution) ? versionDistribution : [],
      updateSuccessRate: successRate,
      recentActivity: Array.isArray(recentLogs) ? recentLogs : [],
    }
  },
}
