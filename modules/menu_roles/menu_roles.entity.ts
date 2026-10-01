import { boolean, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches menu_roles. No DDL. */
export const menuRoleEntity = pgTable("menu_roles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  name: varchar("name", { length: 255 }).notNull(),
  name_lang: jsonb("name_lang").notNull().$type<Record<string, string>>(),
  persona: varchar("persona", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
});

export type MenuRoleEntity = typeof menuRoleEntity.$inferSelect;
