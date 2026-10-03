import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches contact_us. No DDL. */
export const contactUsEntity = pgTable("contact_us", {
  id: varchar("id", { length: 255 }).primaryKey(),
  active: boolean("active").notNull().default(true),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  summary: text("summary"),
  file_url: text("file_url"),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContactUsEntity = typeof contactUsEntity.$inferSelect;
