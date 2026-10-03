import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches site_contents. No DDL. */
export const siteContentEntity = pgTable("site_contents", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 64 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  lang: varchar("lang", { length: 255 }).notNull().default("en-US"),
  content: text("content").notNull(),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(false),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteContentEntity = typeof siteContentEntity.$inferSelect;
