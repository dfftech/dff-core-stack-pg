import { integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const queryListEntity = pgTable("query_lists", {
  id: varchar("id", { length: 255 }).primaryKey(),
  col: jsonb("col").notNull().default({}).$type<unknown>(),
  query: text("query").notNull(),
  defaultOrder: varchar("default_order", { length: 255 }).notNull().default("updated_at desc"),
  defaultLimit: integer("default_limit").notNull().default(10),
  params: jsonb("params").notNull().default({}).$type<Record<string, unknown>>(),
  createdBy: varchar("created_by", { length: 127 }).notNull().default("System"),
  createdOn: timestamp("created_on", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 127 }).notNull().default("System"),
  updatedOn: timestamp("updated_on", { withTimezone: true }).defaultNow(),
});

export type QueryListEntity = typeof queryListEntity.$inferSelect;
