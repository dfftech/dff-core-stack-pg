import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches upload_validations. No DDL here; see docs/sql/upload_validations.sql. */
export const uploadValidationEntity = pgTable("upload_validations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  entity_field: varchar("entity_field", { length: 255 }).notNull(),
  file_field: varchar("file_field", { length: 255 }).notNull(),
  is_required: boolean("is_required").notNull().default(false),
  compute: text("compute"),
  ai_summary: text("ai_summary"),
  active: boolean("active").notNull().default(true),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UploadValidationEntity = typeof uploadValidationEntity.$inferSelect;
