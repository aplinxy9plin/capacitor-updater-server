import { createHash, randomBytes } from "crypto"
import { sql } from "bun"

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = randomBytes(32).toString("hex")
  const prefix = `sk_${raw.slice(0, 8)}`
  const fullKey = `sk_${raw}`
  const hash = hashApiKey(fullKey)
  return { fullKey, prefix, hash }
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export async function validateApiKey(key: string): Promise<{ valid: boolean; keyId?: string }> {
  if (!key || !key.startsWith("sk_")) {
    return { valid: false }
  }

  const prefix = key.slice(0, 11) // "sk_" + 8 chars
  const rows = await sql`SELECT id, key_hash FROM api_keys WHERE key_prefix = ${prefix} LIMIT 1`

  if (rows.length === 0) {
    return { valid: false }
  }

  const stored = rows[0]
  const incomingHash = hashApiKey(key)

  if (incomingHash !== stored.key_hash) {
    return { valid: false }
  }

  // Update last_used_at (fire and forget)
  sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${stored.id}`.catch(() => {})

  return { valid: true, keyId: stored.id }
}
