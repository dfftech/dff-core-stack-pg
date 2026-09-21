import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const otpEntity = pgTable("otp_verifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  is_verified: boolean("is_verified").notNull(),
  otp: varchar("otp", { length: 255 }).notNull(),
  uid: varchar("uid", { length: 255 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  created_by: varchar("created_by", { length: 255 }).notNull().default("System"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updated_by: varchar("updated_by", { length: 255 }).notNull().default("System"),
});

export type OtpEntity = typeof otpEntity.$inferSelect;
