import { sql } from "bun"

// Seed registration_enabled
const regRows = await sql`SELECT key FROM settings WHERE key = 'registration_enabled'`
if (regRows.length === 0) {
  const allowReg = process.env.ALLOW_REGISTRATION !== "false" ? "true" : "false"
  await sql`INSERT INTO settings (key, value) VALUES ('registration_enabled', ${allowReg})`
  console.log(`[seed] registration_enabled = ${allowReg}`)
}

console.log("[seed] Done.")
