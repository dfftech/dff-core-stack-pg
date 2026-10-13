import { boolean, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const appConstantEntity = pgTable("app_constants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  active: boolean("active").notNull().default(true),
  name: varchar("name", { length: 255 }),
  data: jsonb("data").notNull().default({}).$type<Record<string, unknown>>(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AppConstantEntity = typeof appConstantEntity.$inferSelect;
