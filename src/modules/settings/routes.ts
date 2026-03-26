import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { SettingsService } from "./service"
import { updateSettingsBodySchema } from "./model"

export const settingsRoutes = new Elysia({ prefix: "/v1/settings" })
  .get("/", async ({ request }) => {
    await authEnsureSession(request.headers, auth.api.getSession)
    return await SettingsService.getSettings()
  })
  .put(
    "/",
    async ({ body, request }) => {
      await authEnsureSession(request.headers, auth.api.getSession)
      const updated = await SettingsService.updateSettings(body as Record<string, string>)
      return { updated }
    },
    { body: updateSettingsBodySchema },
  )
