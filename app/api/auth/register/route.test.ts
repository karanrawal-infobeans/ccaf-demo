/**
 * Tests for POST /api/auth/register.
 * Uses an in-memory Postgres (pg-mem) so no live DB is required. bcrypt is
 * mocked to keep hashing instant.
 */
jest.mock("@/lib/db", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/test/db")
);

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

import { POST } from "./route";
import { HTTP_STATUS } from "@/lib/constants/http";
import { getTestDb, resetDb } from "@/test/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function makeReq(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
    nextUrl: {
      searchParams: new URLSearchParams(),
      pathname: "/api/auth/register",
    },
    method: "POST",
  } as unknown as Parameters<typeof POST>[0];
}

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/register", () => {
  it("creates a CUSTOMER and returns 201", async () => {
    const res = await POST(
      makeReq({
        email: "new@example.com",
        name: "New",
        password: "password123",
      }),
      {}
    );

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    const body = await res.json();
    expect(body.user.role).toBe("CUSTOMER");
    expect(body.user.email).toBe("new@example.com");

    const [persisted] = await getTestDb()
      .select()
      .from(users)
      .where(eq(users.email, "new@example.com"))
      .limit(1);
    expect(persisted).toBeDefined();
    expect(persisted.name).toBe("New");
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(makeReq({ email: "not-an-email" }), {});
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
