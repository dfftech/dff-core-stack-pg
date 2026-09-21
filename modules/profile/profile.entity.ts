import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const profileEntity = pgTable("profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  active: boolean("active").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  name_lang: jsonb("name_lang").notNull().$type<Record<string, string>>(),
  pic: text("pic"),
  email: varchar("email", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 255 }).notNull(),
  tel_code: varchar("tel_code", { length: 255 }).notNull(),
  persona: varchar("persona", { length: 255 }).notNull(),
  is_email_verified: boolean("is_email_verified").notNull(),
  is_mobile_verified: boolean("is_mobile_verified").notNull(),
  roles: varchar("roles", { length: 255 }).array().notNull(),
  is_archived: boolean("is_archived").notNull().default(false),
  archived_reason: text("archived_reason"),
  archived_by: varchar("archived_by", { length: 255 }),
  archived_at: timestamp("archived_at", { withTimezone: true }),
});

export type ProfileEntity = typeof profileEntity.$inferSelect;
