import { boolean, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { APP_SCHEMA } from "./db-url";

const tenantColumns = {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  createdBy: text("created_by").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  updatedBy: text("updated_by").notNull(),
  active: boolean("active").notNull().default(true),
  name: text("name").notNull(),
  db: text("db").notNull(), // PostgreSQL connection URL for this tenant
};

/**
 * Tenant registry mapping.
 * Drizzle forbids pgSchema("public") — for public, pool search_path + raw SQL is used.
 * For any other schema, use pgSchema(APP_SCHEMA).
 */
export const tenantEntity =
  APP_SCHEMA === "public"
    ? undefined
    : pgSchema(APP_SCHEMA).table("tenants", tenantColumns);

export { APP_SCHEMA };
