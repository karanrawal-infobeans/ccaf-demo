/**
 * Tests for the admin seeder script.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { users } from "@/lib/db/schema";
import { getTestDb, resetDb, closeDb } from "@/test/db";
import { seedAdmin } from "./seed-admin";
import { BCRYPT_ROUNDS } from "@/lib/auth/constants";

const ADMIN_EMAIL = "admin@yopmail.com";
const ADMIN_PASSWORD = "admin@123";
const ADMIN_ROLE = "ADMIN";

describe("seedAdmin", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("creates an admin user with the expected fields", async () => {
    const database = getTestDb();

    const created = await seedAdmin(database);

    expect(created).not.toBeNull();
    expect(created.email).toBe(ADMIN_EMAIL);
    expect(created.name).toBe("Admin");
    expect(created.role).toBe(ADMIN_ROLE);

    const valid = await bcrypt.compare(ADMIN_PASSWORD, created.password);
    expect(valid).toBe(true);
  });

  it("is idempotent and does not create duplicate admins", async () => {
    const database = getTestDb();

    await seedAdmin(database);
    const second = await seedAdmin(database);

    const all = await database.select().from(users);
    expect(all).toHaveLength(1);
    expect(second.email).toBe(ADMIN_EMAIL);
  });

  it("records the admin password with BCRYPT_ROUNDS cost", async () => {
    const database = getTestDb();

    const created = await seedAdmin(database);

    const stored = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
    const storedCost = stored.split("$")[2];
    const createdCost = created.password.split("$")[2];

    expect(createdCost).toBe(storedCost);
  });

  it("leaves existing admin email untouched", async () => {
    const database = getTestDb();
    await database.insert(users).values({
      id: randomUUID(),
      email: ADMIN_EMAIL,
      name: "Pre-existing",
      password: "old-hash",
      role: ADMIN_ROLE,
    });

    await seedAdmin(database);

    const [row] = await database
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL));
    expect(row.name).toBe("Pre-existing");
    expect(row.password).toBe("old-hash");
  });
});
