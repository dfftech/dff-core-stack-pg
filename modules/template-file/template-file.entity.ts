import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const templateFileEntity = pgTable("template_files", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  lang: varchar("lang", { length: 255 }).notNull().default("en-US"),
  channel: varchar("channel", { length: 32 }).notNull().default("email"),
  subject: varchar("subject", { length: 255 }),
  template: text("template").notNull(),
  active: boolean("active").notNull().default(true),
  createdBy: varchar("created_by", { length: 127 }).notNull().default("System"),
  createdOn: timestamp("created_on", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 127 }).notNull().default("System"),
  updatedOn: timestamp("updated_on", { withTimezone: true }).defaultNow(),
});

export type TemplateFileEntity = typeof templateFileEntity.$inferSelect;
