import { sql } from "bun"
import { generateApiKey } from "@/lib/api-key"

export const ApiKeysService = {
  async listKeys(userId: string) {
    const rows = await sql`
      SELECT id, name, key_prefix as "keyPrefix", last_used_at as "lastUsedAt", created_at as "createdAt"
      FROM api_keys
      WHERE user_id = ${userId}
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

  async deleteKey(id: string, userId: string) {
    const rows = await sql`DELETE FROM api_keys WHERE id = ${id} AND user_id = ${userId} RETURNING id`
    return rows.length > 0
  },
}
