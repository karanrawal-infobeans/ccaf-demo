/**
 * Drizzle ORM schema definitions for the application.
 *
 * Source of truth for the database layout: tables, columns, enums, and indexes.
 * Imported by drizzle-kit for migrations and by the app for typed queries.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** User roles supported by the application. */
export const roleEnum = pgEnum("role", [
  "CUSTOMER",
  "ADMIN",
  "CUSTOMER_SUPPORT",
]);

/** Users of the system, both customers and backoffice staff. */
export const users = pgTable("users", {
  /** Primary key as a UUID (v4) value, generated app-side. */
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").default("CUSTOMER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** Row type returned by SELECT queries against the users table. */
export type User = typeof users.$inferSelect;

/** Row type accepted by INSERT queries against the users table. */
export type NewUser = typeof users.$inferInsert;

/** Valid role values for a user. */
export type Role = User["role"];
