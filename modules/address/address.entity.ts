import { doublePrecision, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const addressEntity = pgTable("addresses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  address: text("address").notNull(),
  area: varchar("area", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  zipcode: varchar("zipcode", { length: 32 }),
  type: varchar("type", { length: 100 }).notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AddressEntity = typeof addressEntity.$inferSelect;
