import { Elysia } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { authView } from "@/lib/auth-view"
import { pluginRoutes } from "@/modules/plugin/routes"
import { appsRoutes } from "@/modules/apps/routes"
import { bundlesRoutes } from "@/modules/bundles/routes"
import { apiKeysRoutes } from "@/modules/api-keys/routes"
import { devicesRoutes } from "@/modules/devices/routes"
import { analyticsRoutes } from "@/modules/analytics/routes"
import { settingsRoutes } from "@/modules/settings/routes"

export const api = new Elysia({ prefix: "/api" })
  .use(swagger({
    documentation: {
      info: {
        title: "Capacitor Updater Server",
        description: "Self-hosted OTA bundle update server for Capacitor apps",
        version: "0.1.0",
      },
    },
    path: "/docs",
  }))
  .use(pluginRoutes)
  .use(appsRoutes)
  .use(bundlesRoutes)
  .use(apiKeysRoutes)
  .use(devicesRoutes)
  .use(analyticsRoutes)
  .use(settingsRoutes)
  .all("/auth/*", authView)
