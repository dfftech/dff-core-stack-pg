import { boolean, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const queryLoadEntity = pgTable("query_loads", {
  id: varchar("id", { length: 255 }).primaryKey(),
  query: text("query").notNull(),
  params: jsonb("params").notNull().$type<Record<string, unknown>>(),
  useCache: boolean("use_cache").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  isData: boolean("is_data").notNull().default(false),
  createdBy: varchar("created_by", { length: 127 }).notNull().default("System"),
  createdOn: timestamp("created_on", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 127 }).notNull().default("System"),
  updatedOn: timestamp("updated_on", { withTimezone: true }).defaultNow(),
});

export type QueryLoadEntity = typeof queryLoadEntity.$inferSelect;
