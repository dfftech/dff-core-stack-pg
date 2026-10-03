import { boolean, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches menu_groups. No DDL. */
export const menuGroupEntity = pgTable("menu_groups", {
  id: varchar("id", { length: 255 }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  active: boolean("active").notNull().default(true),
  icon: varchar("icon", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  name_lang: jsonb("name_lang").notNull().$type<Record<string, string>>(),
  priority: integer("priority").notNull().default(0),
  persona: varchar("persona", { length: 255 }).notNull(),
});

export type MenuGroupEntity = typeof menuGroupEntity.$inferSelect;
