import { boolean, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import type { JsonValueType } from "../../utils/app-types";

/** Query only — matches legal_documents. No DDL. */
export const legalDocumentEntity = pgTable("legal_documents", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 64 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  content: jsonb("content").notNull().$type<JsonValueType>(),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(false),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LegalDocumentEntity = typeof legalDocumentEntity.$inferSelect;
