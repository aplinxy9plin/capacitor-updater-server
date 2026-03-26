import { sql } from "bun"

export const PluginService = {
  async upsertDevice(data: {
    device_id: string
    platform?: string
    app_id?: string
    version_name?: string
    version_os?: string
    is_emulator?: string
    is_prod?: string
  }) {
    await sql`
      INSERT INTO devices (device_id, platform, app_id, current_version, version_os, is_emulator, is_prod, last_seen_at)
      VALUES (${data.device_id}, ${data.platform ?? null}, ${data.app_id ?? null}, ${data.version_name ?? null}, ${data.version_os ?? null}, ${data.is_emulator ?? ""}, ${data.is_prod ?? ""}, NOW())
      ON CONFLICT (device_id, app_id)
      DO UPDATE SET current_version = ${data.version_name ?? null}, platform = ${data.platform ?? null}, version_os = ${data.version_os ?? null}, last_seen_at = NOW()
    `
  },

  async upsertDeviceReturningId(data: {
    device_id: string
    platform?: string
    app_id?: string
    version_name?: string
  }): Promise<string | null> {
    const rows = await sql`
      INSERT INTO devices (device_id, platform, app_id, current_version, last_seen_at)
      VALUES (${data.device_id}, ${data.platform ?? null}, ${data.app_id ?? null}, ${data.version_name ?? null}, NOW())
      ON CONFLICT (device_id, app_id)
      DO UPDATE SET current_version = ${data.version_name ?? null}, platform = ${data.platform ?? null}, last_seen_at = NOW()
      RETURNING id
    `
    return rows.length > 0 ? rows[0].id : null
  },

  async insertUpdateLog(data: {
    deviceId: string
    fromVersion?: string
    toVersion?: string
    action: string
  }) {
    await sql`
      INSERT INTO update_logs (device_id, from_version, to_version, action)
      VALUES (${data.deviceId}, ${data.fromVersion ?? null}, ${data.toVersion ?? null}, ${data.action})
    `
  },

  async getBundleById(bundleId: string) {
    const rows = await sql`
      SELECT id, version, status, storage_path as "storagePath", file_size as "fileSize", checksum_sha256 as "checksumSha256"
      FROM bundles WHERE id = ${bundleId} LIMIT 1
    `
    return rows.length > 0 ? rows[0] : null
  },

  async checkDbHealth(): Promise<boolean> {
    try {
      await sql`SELECT 1`
      return true
    } catch {
      return false
    }
  },
}
