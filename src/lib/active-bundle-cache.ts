import { sql } from "bun"

type CachedBundle = {
  id: string
  version: string
  checksumSha256: string | null
} | null

const cache = new Map<string, { data: CachedBundle; at: number }>()
const TTL_MS = 10_000

export async function getActiveBundleForApp(capacitorAppId: string): Promise<CachedBundle> {
  const now = Date.now()
  const cached = cache.get(capacitorAppId)
  if (cached && now - cached.at < TTL_MS) return cached.data

  const appRows = await sql`SELECT id FROM apps WHERE app_id = ${capacitorAppId} LIMIT 1`
  if (appRows.length === 0) {
    cache.set(capacitorAppId, { data: null, at: now })
    return null
  }

  const rows = await sql`
    SELECT id, version, checksum_sha256 as "checksumSha256"
    FROM bundles
    WHERE app_id = ${appRows[0].id} AND status = 'active'
    LIMIT 1
  `

  const data = rows.length > 0 ? (rows[0] as CachedBundle) : null
  cache.set(capacitorAppId, { data, at: now })
  return data
}

export function invalidateActiveBundleCache(capacitorAppId?: string) {
  if (capacitorAppId) {
    cache.delete(capacitorAppId)
  } else {
    cache.clear()
  }
}
