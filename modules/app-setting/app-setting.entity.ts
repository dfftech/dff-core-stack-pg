import { boolean, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Mirrors config-sql/app_settings.sql — query only, no DDL. */
export const appSettingEntity = pgTable("app_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  active: boolean("active").notNull().default(true),
  is_public: boolean("is_public").notNull().default(false),
  name: varchar("name", { length: 255 }),
  data: jsonb("data").notNull().default({}).$type<Record<string, unknown>>(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AppSettingEntity = typeof appSettingEntity.$inferSelect;
