import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { BundlesService } from "./service"
import { AppsService } from "../apps/service"
import { bundleParamsSchema, appBundlesParamsSchema, createBundleBodySchema } from "./model"

export const bundlesRoutes = new Elysia({ prefix: "/v1/apps" })
  .get(
    "/:id/bundles",
    async ({ params: { id }, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) { set.status = 404; return { error: "not_found", message: "App not found" } }
      return await BundlesService.listBundles(id)
    },
    { params: appBundlesParamsSchema },
  )
  .post(
    "/:id/bundles",
    async ({ params: { id }, body, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) { set.status = 404; return { error: "not_found", message: "App not found" } }

      const trimmed = body.version.trim()
      if (!/^\d+\.\d+\.\d+/.test(trimmed)) {
        set.status = 400
        return { error: "invalid_version", message: "Version must be semver (e.g. 1.0.0)" }
      }

      try {
        const bundle = await BundlesService.createBundle(id, trimmed, body.notes?.trim() || undefined)
        set.status = 201
        return bundle
      } catch (err: any) {
        if (err.code === "23505") {
          set.status = 409
          return { error: "version_exists", message: `Version ${trimmed} already exists for this app` }
        }
        throw err
      }
    },
    { params: appBundlesParamsSchema, body: createBundleBodySchema },
  )
  .delete(
    "/:id/bundles/:bundleId",
    async ({ params: { id, bundleId }, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) { set.status = 404; return { error: "not_found", message: "App not found" } }
      const result = await BundlesService.deleteBundle(bundleId)
      if (result.error === "not_found") { set.status = 404; return { error: "not_found", message: "Bundle not found" } }
      if (result.error === "cannot_delete_active") { set.status = 409; return { error: "cannot_delete_active", message: "Cannot delete active bundle" } }
      return { deleted: true }
    },
    { params: bundleParamsSchema },
  )
  .post(
    "/:id/bundles/:bundleId/upload",
    async ({ params: { id, bundleId }, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) { set.status = 404; return { error: "not_found", message: "App not found" } }

      const arrayBuffer = await request.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      if (buffer.length === 0) { set.status = 400; return { error: "empty_upload", message: "Upload body is empty" } }

      const result = await BundlesService.uploadFile(bundleId, buffer)
      if (result.error === "not_found") { set.status = 404; return { error: "not_found", message: "Bundle not found" } }
      if (result.error === "not_draft") { set.status = 409; return { error: "not_draft", message: "Can only upload to draft bundles" } }
      return result.bundle
    },
    { params: bundleParamsSchema },
  )
  .post(
    "/:id/bundles/:bundleId/activate",
    async ({ params: { id, bundleId }, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) { set.status = 404; return { error: "not_found", message: "App not found" } }
      const result = await BundlesService.activateBundle(id, bundleId)
      if (result.error === "not_found") { set.status = 404; return { error: "not_found", message: "Bundle not found" } }
      if (result.error === "no_file") { set.status = 400; return { error: "no_file", message: "Upload a file before activating" } }
      return result.bundle
    },
    { params: bundleParamsSchema },
  )
