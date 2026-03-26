import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { ApiKeysService } from "./service"
import { createApiKeyBodySchema } from "./model"

export const apiKeysRoutes = new Elysia({ prefix: "/v1/api-keys" })
  .get("/", async ({ request }) => {
    await authEnsureSession(request.headers, auth.api.getSession)
    return await ApiKeysService.listKeys()
  })
  .post(
    "/",
    async ({ body, request, set }) => {
      const session = await authEnsureSession(request.headers, auth.api.getSession)
      const result = await ApiKeysService.createKey(session.user.id, body.name)
      set.status = 201
      return result
    },
    { body: createApiKeyBodySchema },
  )
  .delete("/", async ({ request, set }) => {
    await authEnsureSession(request.headers, auth.api.getSession)
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) { set.status = 400; return { error: "missing_id", message: "API key id is required" } }
    const deleted = await ApiKeysService.deleteKey(id)
    if (!deleted) { set.status = 404; return { error: "not_found", message: "API key not found" } }
    return { deleted: true }
  })
