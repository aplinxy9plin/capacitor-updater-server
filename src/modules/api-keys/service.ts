import { sql } from "bun"
import { generateApiKey } from "@/lib/api-key"

export const ApiKeysService = {
  async listKeys() {
    const rows = await sql`
      SELECT id, name, key_prefix as "keyPrefix", last_used_at as "lastUsedAt", created_at as "createdAt"
      FROM api_keys
    `
    return Array.isArray(rows) ? rows : []
  },

  async createKey(userId: string, name: string) {
    const { fullKey, prefix, hash } = generateApiKey()
    const [row] = await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
      VALUES (${userId}, ${name}, ${hash}, ${prefix})
      RETURNING id, name, key_prefix as "keyPrefix", created_at as "createdAt"
    `
    return { ...row, key: fullKey }
  },

  async deleteKey(id: string) {
    const rows = await sql`DELETE FROM api_keys WHERE id = ${id} RETURNING id`
    return rows.length > 0
  },
}
