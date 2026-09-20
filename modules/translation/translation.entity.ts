import { boolean, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Mirrors config-sql/translation.sql — query only, no DDL. */
export const translationEntity = pgTable("translation", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  data: jsonb("data").notNull().default({}).$type<Record<string, string>>(),
  active: boolean("active").notNull().default(true),
  createdBy: varchar("created_by", { length: 127 }).notNull().default("System"),
  createdOn: timestamp("created_on", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 127 }).notNull().default("System"),
  updatedOn: timestamp("updated_on", { withTimezone: true }).defaultNow(),
});

export type TranslationEntity = typeof translationEntity.$inferSelect;
