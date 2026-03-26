import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const settingsInsertSchema = createInsertSchema(settingsTable)
export const settingsSelectSchema = createSelectSchema(settingsTable)
export const settingsUpdateSchema = createUpdateSchema(settingsTable)

export type SettingsSelect = typeof settingsTable.$inferSelect
export type SettingsInsert = typeof settingsTable.$inferInsert
