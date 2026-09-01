/**
 * Integration tests for DrizzleUserRepository against an in-memory Postgres
 * (pg-mem). Uses the real repository implementation against the real query
 * builder and a real in-memory database, so no mocking is needed.
 */
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { DrizzleUserRepository, IUserRepository } from "./user.repository";
import { getTestDb, resetDb } from "@/test/db";
import { users } from "@/lib/db/schema";

const TEST_EMAIL = "repo-test@example.com";

beforeEach(async () => {
  await resetDb();
});

function makeRepo(): IUserRepository {
  return new DrizzleUserRepository(getTestDb());
}

describe("DrizzleUserRepository.create", () => {
  it("persists a user and returns the created record", async () => {
    const repo = makeRepo();

    const result = await repo.create({
      email: TEST_EMAIL,
      name: "Repo Test User",
      password: "hashed_password",
    });

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(result.email).toBe(TEST_EMAIL);
    expect(result.role).toBe("CUSTOMER");
    expect(result.password).toBe("hashed_password");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("stores the requested role when provided", async () => {
    const repo = makeRepo();

    const result = await repo.create({
      email: "admin-repo@example.com",
      name: "Admin",
      password: "hashed_password",
      role: "ADMIN",
    });

    expect(result.role).toBe("ADMIN");
  });
});

describe("DrizzleUserRepository.findByEmail", () => {
  it("returns the user when found", async () => {
    const repo = makeRepo();
    await repo.create({
      email: TEST_EMAIL,
      name: "Repo Test User",
      password: "hashed_password",
    });

    const found = await repo.findByEmail(TEST_EMAIL);

    expect(found).not.toBeNull();
    expect(found!.email).toBe(TEST_EMAIL);
    expect(found!.name).toBe("Repo Test User");
  });

  it("returns null when no user matches the email", async () => {
    const repo = makeRepo();
    const found = await repo.findByEmail("nobody@example.com");
    expect(found).toBeNull();
  });
});

describe("DrizzleUserRepository.findById", () => {
  it("returns the user when found by id", async () => {
    const repo = makeRepo();
    const created = await repo.create({
      email: TEST_EMAIL,
      name: "Repo Test User",
      password: "hashed_password",
    });

    const found = await repo.findById(created.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it("returns null for a non-existent id", async () => {
    const repo = makeRepo();
    const found = await repo.findById("99999999-9999-4999-8999-999999999999");
    expect(found).toBeNull();
  });
});

describe("DrizzleUserRepository default role", () => {
  it("stores CUSTOMER as the default role when none is provided", async () => {
    const db = getTestDb();
    const created = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: "default-role@example.com",
        name: "Default",
        password: "hash",
      })
      .returning();
    const [row] = created;
    const [fetched] = await db.select().from(users).where(eq(users.id, row.id));
    expect(fetched.role).toBe("CUSTOMER");
  });
});
