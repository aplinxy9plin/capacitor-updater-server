import { sql } from "bun"
import { createHash } from "crypto"
import { uploadBundle, deleteBundle } from "@/lib/storage"
import { invalidateActiveBundleCache } from "@/lib/active-bundle-cache"

export const BundlesService = {
  async listBundles(appId: string) {
    const rows = await sql`
      SELECT id, app_id as "appId", version, status, storage_path as "storagePath",
        file_size as "fileSize", checksum_sha256 as "checksumSha256", notes,
        uploaded_at as "uploadedAt", activated_at as "activatedAt", created_at as "createdAt"
      FROM bundles WHERE app_id = ${appId}
      ORDER BY created_at DESC
    `
    return Array.isArray(rows) ? rows : []
  },

  async createBundle(appId: string, version: string, notes?: string) {
    const [row] = await sql`
      INSERT INTO bundles (app_id, version, notes)
      VALUES (${appId}, ${version}, ${notes ?? null})
      RETURNING id, app_id as "appId", version, status, storage_path as "storagePath",
        file_size as "fileSize", checksum_sha256 as "checksumSha256", notes,
        uploaded_at as "uploadedAt", activated_at as "activatedAt", created_at as "createdAt"
    `
    return row
  },

  async getBundleById(bundleId: string) {
    const [row] = await sql`
      SELECT id, app_id as "appId", version, status, storage_path as "storagePath",
        file_size as "fileSize", checksum_sha256 as "checksumSha256", notes,
        uploaded_at as "uploadedAt", activated_at as "activatedAt", created_at as "createdAt"
      FROM bundles WHERE id = ${bundleId}
    `
    return row ?? null
  },

  async deleteBundle(bundleId: string) {
    const bundle = await this.getBundleById(bundleId)
    if (!bundle) return { error: "not_found" }
    if (bundle.status === "active") return { error: "cannot_delete_active" }
    if (bundle.storagePath) await deleteBundle(bundle.storagePath)
    await sql`DELETE FROM bundles WHERE id = ${bundleId}`
    return { ok: true }
  },

  async uploadFile(bundleId: string, buffer: Buffer) {
    const bundle = await this.getBundleById(bundleId)
    if (!bundle) return { error: "not_found" }
    if (bundle.status !== "draft") return { error: "not_draft" }

    const hash = createHash("sha256").update(buffer).digest("hex")
    const storageKey = `bundles/${crypto.randomUUID()}.zip`

    if (bundle.storagePath) await deleteBundle(bundle.storagePath)
    await uploadBundle(storageKey, buffer, buffer.length)

    const [updated] = await sql`
      UPDATE bundles SET storage_path = ${storageKey}, file_size = ${buffer.length},
        checksum_sha256 = ${hash}, uploaded_at = NOW()
      WHERE id = ${bundleId}
      RETURNING id, app_id as "appId", version, status, storage_path as "storagePath",
        file_size as "fileSize", checksum_sha256 as "checksumSha256", notes,
        uploaded_at as "uploadedAt", activated_at as "activatedAt", created_at as "createdAt"
    `
    return { ok: true, bundle: updated }
  },

  async activateBundle(appDbId: string, bundleId: string) {
    const bundle = await this.getBundleById(bundleId)
    if (!bundle) return { error: "not_found" }
    if (!bundle.checksumSha256 || !bundle.storagePath) return { error: "no_file" }
    if (bundle.status === "active") return { ok: true, bundle }

    // Archive current active, then activate this one
    await sql`UPDATE bundles SET status = 'archived' WHERE app_id = ${appDbId} AND status = 'active' AND id != ${bundleId}`
    const [updated] = await sql`
      UPDATE bundles SET status = 'active', activated_at = NOW()
      WHERE id = ${bundleId}
      RETURNING id, app_id as "appId", version, status, storage_path as "storagePath",
        file_size as "fileSize", checksum_sha256 as "checksumSha256", notes,
        uploaded_at as "uploadedAt", activated_at as "activatedAt", created_at as "createdAt"
    `

    // Invalidate cache
    const [app] = await sql`SELECT app_id as "appId" FROM apps WHERE id = ${appDbId}`
    if (app) invalidateActiveBundleCache(app.appId)

    return { ok: true, bundle: updated }
  },

  async appExists(appId: string): Promise<boolean> {
    const rows = await sql`SELECT 1 FROM apps WHERE id = ${appId} LIMIT 1`
    return rows.length > 0
  },
}
