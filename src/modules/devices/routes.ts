import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { DevicesService } from "./service"

export const devicesRoutes = new Elysia({ prefix: "/v1/devices" })
  .get("/", async ({ request }) => {
    await authEnsureSession(request.headers, auth.api.getSession)
    return await DevicesService.listDevices()
  })
