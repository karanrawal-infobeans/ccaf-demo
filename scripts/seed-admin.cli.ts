/**
 * CLI entry point for the admin seeder.
 *
 * Loads environment variables from .env, connects to the configured PostgreSQL
 * database, and seeds the admin user.
 * Run via: npm run db:seed:admin
 *
 * Uses a dynamic import for the DB client so that .env is loaded before the
 * database connection is created (static imports are hoisted above dotenv).
 */
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const { default: db } = await import("@/lib/db");
  const { seedAdmin } = await import("./seed-admin");

  await seedAdmin(db);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed admin user:", err);
  process.exit(1);
});
