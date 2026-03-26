import { Elysia } from "elysia"
import { auth } from "@/lib/auth"
import { authEnsureSession } from "@/lib/auth-ensure-session"
import { AnalyticsService } from "./service"

export const analyticsRoutes = new Elysia({ prefix: "/v1/analytics" })
  .get("/", async ({ request }) => {
    const session = await authEnsureSession(request.headers, auth.api.getSession)
    const url = new URL(request.url)
    const appIdFilter = url.searchParams.get("appId") ?? undefined
    return await AnalyticsService.getAnalytics(session.user.id, appIdFilter)
  })
