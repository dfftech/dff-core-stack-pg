import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Query only — matches menu_access. No DDL. */
export const menuAccessEntity = pgTable("menu_access", {
  id: varchar("id", { length: 255 }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  menu_role_id: varchar("menu_role_id", { length: 255 }).notNull(),
  menu_link_id: varchar("menu_link_id", { length: 255 }).notNull(),
  read: boolean("read").notNull(),
  create: boolean("create").notNull(),
  update: boolean("update").notNull(),
  delete: boolean("delete").notNull(),
  persona: varchar("persona", { length: 255 }),
});

export type MenuAccessEntity = typeof menuAccessEntity.$inferSelect;
