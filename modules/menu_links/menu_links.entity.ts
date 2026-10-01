import { boolean, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches menu_links. No DDL. */
export const menuLinkEntity = pgTable("menu_links", {
  id: varchar("id", { length: 255 }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  active: boolean("active").notNull().default(true),
  href: varchar("href", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  menu_group_id: varchar("menu_group_id", { length: 255 }).notNull().default("ROOT"),
  name: varchar("name", { length: 255 }).notNull(),
  name_lang: jsonb("name_lang").notNull().$type<Record<string, string>>(),
  priority: integer("priority").notNull().default(0),
  persona: varchar("persona", { length: 255 }),
});

export type MenuLinkEntity = typeof menuLinkEntity.$inferSelect;
