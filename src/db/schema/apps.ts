import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"
import { usersTable } from "./users"

export const appsTable = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  appId: text("app_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_apps_user_id").on(table.userId),
])

export const appsInsertSchema = createInsertSchema(appsTable)
export const appsSelectSchema = createSelectSchema(appsTable)
export const appsUpdateSchema = createUpdateSchema(appsTable)

export type AppsSelect = typeof appsTable.$inferSelect
export type AppsInsert = typeof appsTable.$inferInsert
