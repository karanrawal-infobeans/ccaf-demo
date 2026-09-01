/**
 * Drizzle Kit configuration.
 *
 * Tells drizzle-kit where the schema lives, where to write migrations, and how
 * to connect to the database for generate/push/migrate/studio commands.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
