import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Mirrors config-sql/lang.sql — query only, no DDL. */
export const langEntity = pgTable("lang", {
  id: varchar("id", { length: 255 }).primaryKey(),
  lang: varchar("lang", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dir: varchar("dir", { length: 10 }).notNull(),
  locale: varchar("locale", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LangEntity = typeof langEntity.$inferSelect;
