import { Elysia } from "elysia"
import { validateApiKey } from "@/lib/api-key"
import { getActiveBundleForApp } from "@/lib/active-bundle-cache"
import { rateLimit } from "@/lib/rate-limit"
import { downloadBundle, checkMinioHealth } from "@/lib/storage"
import { PluginService } from "./service"
import { updateBodySchema, statsBodySchema, downloadParamsSchema } from "./model"

export const pluginRoutes = new Elysia()
  .post(
    "/update",
    async ({ body, request }) => {
      const { device_id, app_id, platform, version_name, version_os, is_emulator, is_prod } = body

      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
      const { allowed } = rateLimit(`update:${ip}`, 30, 60_000)
      if (!allowed) {
        return new Response(JSON.stringify({ error: "rate_limited", message: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json" } })
      }

      const active = await getActiveBundleForApp(app_id)
      if (!active) {
        return { error: "no_new_version_available", message: "No active bundle" }
      }

      // Upsert device (fire and forget)
      PluginService.upsertDevice({
        device_id, platform, app_id, version_name,
        version_os, is_emulator: String(is_emulator ?? ""), is_prod: String(is_prod ?? ""),
      }).catch(() => {})

      if (version_name === active.version) {
        return { error: "no_new_version_available", message: "No new version available" }
      }

      const host = request.headers.get("host") || "localhost:3000"
      const proto = request.headers.get("x-forwarded-proto") || "http"
      return {
        version: active.version,
        url: `${proto}://${host}/api/download/${active.id}`,
        checksum: active.checksumSha256 || "",
      }
    },
    { body: updateBodySchema },
  )
  .post(
    "/stats",
    async ({ body, request }) => {
      const apiKey = request.headers.get("x-api-key") || ""
      const { valid } = await validateApiKey(apiKey)
      if (!valid) {
        return new Response(JSON.stringify({ error: "unauthorized", message: "Invalid API key" }), { status: 401, headers: { "Content-Type": "application/json" } })
      }

      const { device_id, app_id, platform, action, version_build, version_name } = body

      const deviceId = await PluginService.upsertDeviceReturningId({
        device_id, platform, app_id, version_name,
      })

      if (deviceId) {
        await PluginService.insertUpdateLog({
          deviceId, fromVersion: version_build, toVersion: version_name, action,
        }).catch(() => {})
      }

      return { status: "ok" }
    },
    { body: statsBodySchema },
  )
  .get(
    "/download/:bundleId",
    async ({ params: { bundleId } }) => {
      const bundle = await PluginService.getBundleById(bundleId)
      if (!bundle || !bundle.storagePath) {
        return new Response(JSON.stringify({ error: "not_found", message: "Bundle not found" }), { status: 404, headers: { "Content-Type": "application/json" } })
      }

      const stream = await downloadBundle(bundle.storagePath)
      if (!stream) {
        return new Response(JSON.stringify({ error: "storage_error", message: "Failed to retrieve bundle from storage" }), { status: 500, headers: { "Content-Type": "application/json" } })
      }

      return new Response(stream, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${bundle.version}.zip"`,
          ...(bundle.fileSize ? { "Content-Length": String(bundle.fileSize) } : {}),
        },
      })
    },
    { params: downloadParamsSchema },
  )
  .get("/health", async () => {
    const dbOk = await PluginService.checkDbHealth()
    let minioOk = false
    try { minioOk = await checkMinioHealth() } catch {}

    const status = dbOk && minioOk ? "ok" : "degraded"
    const statusCode = status === "ok" ? 200 : 503

    return new Response(JSON.stringify({
      status,
      db: dbOk ? "connected" : "disconnected",
      minio: minioOk ? "connected" : "disconnected",
      version: process.env.npm_package_version || "dev",
    }), { status: statusCode, headers: { "Content-Type": "application/json" } })
  })
