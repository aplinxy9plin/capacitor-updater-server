import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"
import { devicesTable } from "./devices"

export const updateLogsTable = pgTable("update_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: uuid("device_id").references(() => devicesTable.id, { onDelete: "cascade" }),
  fromVersion: text("from_version"),
  toVersion: text("to_version"),
  action: text("action", { enum: ["download_complete", "update_success", "update_fail"] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_update_logs_created_at").on(table.createdAt),
])

export const updateLogsInsertSchema = createInsertSchema(updateLogsTable)
export const updateLogsSelectSchema = createSelectSchema(updateLogsTable)
export const updateLogsUpdateSchema = createUpdateSchema(updateLogsTable)

export type UpdateLogsSelect = typeof updateLogsTable.$inferSelect
export type UpdateLogsInsert = typeof updateLogsTable.$inferInsert
