import { sql } from "bun"

export const DevicesService = {
  async listDevices(userId: string) {
    const rows = await sql`
      SELECT d.id, d.device_id as "deviceId", d.platform, d.app_id as "appId",
        d.current_version as "currentVersion", d.last_seen_at as "lastSeenAt"
      FROM devices d
      WHERE d.app_id IN (SELECT app_id FROM apps WHERE user_id = ${userId})
      ORDER BY d.last_seen_at DESC
    `
    return Array.isArray(rows) ? rows : []
  },
}
