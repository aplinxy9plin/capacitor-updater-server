import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"

export const appsTable = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  appId: text("app_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const appsInsertSchema = createInsertSchema(appsTable)
export const appsSelectSchema = createSelectSchema(appsTable)
export const appsUpdateSchema = createUpdateSchema(appsTable)

export type AppsSelect = typeof appsTable.$inferSelect
export type AppsInsert = typeof appsTable.$inferInsert
