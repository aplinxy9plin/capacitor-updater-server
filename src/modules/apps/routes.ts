import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { AppsService } from "./service"
import { appIdParamsSchema, createAppBodySchema } from "./model"

export const appsRoutes = new Elysia({ prefix: "/v1/apps" })
  .get("/", async ({ request }) => {
    const session = await authEnsureSession(request.headers, auth.api.getSession)
    return await AppsService.listApps(session.user.id)
  })
  .post(
    "/",
    async ({ body, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      try {
        const app = await AppsService.createApp(session.user.id, body.name, body.appId)
        set.status = 201
        return app
      } catch (err: any) {
        if (err.code === "23505") {
          set.status = 409
          return { error: "app_exists", message: `App with ID ${body.appId} already exists` }
        }
        throw err
      }
    },
    { body: createAppBodySchema },
  )
  .get(
    "/:id",
    async ({ params: { id }, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const app = await AppsService.getAppById(id, session.user.id)
      if (!app) {
        set.status = 404
        return { error: "not_found", message: "App not found" }
      }
      return app
    },
    { params: appIdParamsSchema },
  )
  .delete(
    "/:id",
    async ({ params: { id }, request }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      await AppsService.deleteApp(id, session.user.id)
      return { deleted: true }
    },
    { params: appIdParamsSchema },
  )
