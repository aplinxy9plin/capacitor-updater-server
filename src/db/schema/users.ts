import { pgTable, text } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
})
