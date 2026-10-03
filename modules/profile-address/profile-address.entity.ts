import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { addressEntity } from "../address/address.entity";
import { profileEntity } from "../profile/profile.entity";

export const profileAddressEntity = pgTable("profile_addresses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  profile_id: varchar("profile_id", { length: 255 })
    .notNull()
    .references(() => profileEntity.id),
  address_id: varchar("address_id", { length: 255 })
    .notNull()
    .references(() => addressEntity.id),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProfileAddressEntity = typeof profileAddressEntity.$inferSelect;
