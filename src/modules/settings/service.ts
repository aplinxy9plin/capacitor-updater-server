import { sql } from "bun"

export const SettingsService = {
  async getSettings() {
    const rows = await sql`SELECT key, value FROM settings`
    const map: Record<string, string> = {}
    for (const row of rows) {
      map[row.key] = row.value
    }
    return map
  },

  async updateSettings(updates: Record<string, string>) {
    const allowedKeys = ["registration_enabled"]
    const updated: string[] = []
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        await sql`UPDATE settings SET value = ${String(updates[key])}, updated_at = NOW() WHERE key = ${key}`
        updated.push(key)
      }
    }
    return updated
  },
}
