import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** upload_files (plural table name) — docs/sql/upload_files.sql — id = `${provider}-${type}-${name}-${random}` via dff-util AppRandomString */
export const uploadFileEntity = pgTable("upload_files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull().default("active"),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  active: boolean("active").default(true),
  created_by: text("created_by").default("System"),
  updated_by: text("updated_by").default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type UploadFileEntity = typeof uploadFileEntity.$inferSelect;
export type NewUploadFile = typeof uploadFileEntity.$inferInsert;
