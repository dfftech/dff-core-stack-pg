import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches mappings. No DDL here; see docs/sql/mappings.sql. */
export const mappingEntity = pgTable("mappings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  entity_field: varchar("entity_field", { length: 255 }).notNull(),
  input_field: varchar("input_field", { length: 255 }),
  is_required: boolean("is_required").notNull().default(false),
  compute: text("compute").array(),
  ai_summary: text("ai_summary"),
  active: boolean("active").notNull().default(true),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MappingEntity = typeof mappingEntity.$inferSelect;
