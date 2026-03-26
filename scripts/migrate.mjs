// This script is kept for manual use. In Docker, drizzle-kit migrate is called directly.
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/updater"
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client)

console.log("[migrate] Running migrations...")
await migrate(db, { migrationsFolder: "./drizzle" })
console.log("[migrate] Migrations complete.")
await client.end()
