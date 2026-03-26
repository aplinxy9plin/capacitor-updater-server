import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"
import { appConfig } from "@/app.config"
import { ensureUserInAppDb } from "@/lib/auth-ensure-session"

export const auth = betterAuth({
  database: new Pool({
    connectionString: appConfig.BETTER_AUTH_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensureUserInAppDb(user.id)
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
})
