import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { profileEntity } from "../profile/profile.entity";

export const profileHashEntity = pgTable("profile_hashes", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .references(() => profileEntity.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
  provider: varchar("provider", { length: 255 }).notNull().default("password"),
  hash_data: varchar("hash_data", { length: 255 }),
  hash_salt: varchar("hash_salt", { length: 255 }),
});

export type ProfileHashEntity = typeof profileHashEntity.$inferSelect;
