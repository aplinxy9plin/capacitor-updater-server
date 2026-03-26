import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"
import { usersTable } from "./users"

export const apiKeysTable = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull().unique(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const apiKeysInsertSchema = createInsertSchema(apiKeysTable)
export const apiKeysSelectSchema = createSelectSchema(apiKeysTable)
export const apiKeysUpdateSchema = createUpdateSchema(apiKeysTable)

export type ApiKeysSelect = typeof apiKeysTable.$inferSelect
export type ApiKeysInsert = typeof apiKeysTable.$inferInsert
