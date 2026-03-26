import { sql } from "bun"

export const DevicesService = {
  async listDevices() {
    const rows = await sql`
      SELECT id, device_id as "deviceId", platform, app_id as "appId",
        current_version as "currentVersion", last_seen_at as "lastSeenAt"
      FROM devices
      ORDER BY last_seen_at DESC
    `
    return Array.isArray(rows) ? rows : []
  },
}
