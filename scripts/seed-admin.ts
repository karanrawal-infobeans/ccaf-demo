/**
 * Seeds an admin user into a given database.
 *
 * Idempotent: skips if the admin email already exists.
 * Intentionally database-agnostic so tests can inject an in-memory instance.
 */
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { users } from "@/lib/db/schema";
import { BCRYPT_ROUNDS } from "@/lib/auth/constants";
import type { DrizzleDb } from "@/lib/db";

const ADMIN_SEED_EMAIL = "admin@yopmail.com";
const ADMIN_SEED_NAME = "Admin";
const ADMIN_SEED_PASSWORD = "admin@123";

/**
 * Inserts an admin user into the provided database connection.
 * Returns the existing user if one with the same email already exists.
 */
export async function seedAdmin(database: DrizzleDb) {
  const [existing] = await database
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_SEED_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`Admin user already exists (${ADMIN_SEED_EMAIL}). Skipping.`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_SEED_PASSWORD, BCRYPT_ROUNDS);

  const [user] = await database
    .insert(users)
    .values({
      id: randomUUID(),
      email: ADMIN_SEED_EMAIL,
      name: ADMIN_SEED_NAME,
      password: hashedPassword,
      role: "ADMIN",
    })
    .returning();

  console.log(`Admin user created: ${user.email} (id: ${user.id})`);
  return user;
}
