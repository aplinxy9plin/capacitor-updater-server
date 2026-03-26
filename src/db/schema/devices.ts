import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"

export const devicesTable = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: text("device_id").notNull(),
  platform: text("platform"),
  appId: text("app_id"),
  currentVersion: text("current_version"),
  versionOs: text("version_os"),
  isEmulator: text("is_emulator"),
  isProd: text("is_prod"),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_devices_device_app").on(table.deviceId, table.appId),
])

export const devicesInsertSchema = createInsertSchema(devicesTable)
export const devicesSelectSchema = createSelectSchema(devicesTable)
export const devicesUpdateSchema = createUpdateSchema(devicesTable)

export type DevicesSelect = typeof devicesTable.$inferSelect
export type DevicesInsert = typeof devicesTable.$inferInsert
