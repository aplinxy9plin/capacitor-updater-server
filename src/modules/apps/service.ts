import { sql } from "bun"
import { deleteBundle } from "@/lib/storage"

export const AppsService = {
  async listApps() {
    const rows = await sql`
      SELECT
        a.id, a.name, a.app_id as "appId", a.created_at as "createdAt",
        (SELECT count(*)::int FROM bundles WHERE app_id = a.id) as "bundleCount",
        (SELECT count(*)::int FROM devices WHERE app_id = a.app_id) as "deviceCount",
        (SELECT version FROM bundles WHERE app_id = a.id AND status = 'active' LIMIT 1) as "activeVersion"
      FROM apps a
      ORDER BY a.created_at DESC
    `
    return Array.isArray(rows) ? rows : []
  },

  async getAppById(id: string) {
    const [row] = await sql`SELECT id, name, app_id as "appId", created_at as "createdAt" FROM apps WHERE id = ${id}`
    return row ?? null
  },

  async createApp(name: string, appId: string) {
    const [row] = await sql`
      INSERT INTO apps (name, app_id)
      VALUES (${name.trim()}, ${appId.trim()})
      RETURNING id, name, app_id as "appId", created_at as "createdAt"
    `
    return row
  },

  async deleteApp(id: string) {
    // Delete bundle files from MinIO first
    const bundles = await sql`SELECT storage_path FROM bundles WHERE app_id = ${id}`
    for (const b of bundles) {
      if (b.storage_path) await deleteBundle(b.storage_path)
    }
    await sql`DELETE FROM apps WHERE id = ${id}`
  },
}
