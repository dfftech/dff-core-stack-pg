import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Mirrors config-sql/query_reports.sql — query only, no DDL. */
export const queryReportEntity = pgTable("query_reports", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  query: text("query").notNull(),
  params: jsonb("params").notNull().default({}).$type<Record<string, unknown>>(),
  createdBy: varchar("created_by", { length: 127 }).notNull().default("System"),
  createdOn: timestamp("created_on", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 127 }).notNull().default("System"),
  updatedOn: timestamp("updated_on", { withTimezone: true }).defaultNow(),
});

export type QueryReportEntity = typeof queryReportEntity.$inferSelect;
