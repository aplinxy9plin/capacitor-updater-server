import { pgTable, uuid, text, timestamp, integer, uniqueIndex, index } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox"
import { appsTable } from "./apps"

export const bundlesTable = pgTable("bundles", {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: uuid("app_id").notNull().references(() => appsTable.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  status: text("status", { enum: ["draft", "active", "archived"] }).notNull().default("draft"),
  storagePath: text("storage_path"),
  fileSize: integer("file_size"),
  checksumSha256: text("checksum_sha256"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_bundles_app_version").on(table.appId, table.version),
  index("idx_bundles_status").on(table.status),
])

export const bundlesInsertSchema = createInsertSchema(bundlesTable)
export const bundlesSelectSchema = createSelectSchema(bundlesTable)
export const bundlesUpdateSchema = createUpdateSchema(bundlesTable)

export type BundlesSelect = typeof bundlesTable.$inferSelect
export type BundlesInsert = typeof bundlesTable.$inferInsert
