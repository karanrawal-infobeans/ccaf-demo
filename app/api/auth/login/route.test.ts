/**
 * Tests for POST /api/auth/login.
 * Uses an in-memory Postgres (pg-mem) and mocks bcrypt comparison.
 */
jest.mock("@/lib/db", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/test/db")
);

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(true),
}));

import { POST } from "./route";
import { randomUUID } from "crypto";
import { HTTP_STATUS } from "@/lib/constants/http";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getTestDb, resetDb } from "@/test/db";
import { users } from "@/lib/db/schema";

function makeReq(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
    nextUrl: {
      searchParams: new URLSearchParams(),
      pathname: "/api/auth/login",
    },
    method: "POST",
  } as unknown as Parameters<typeof POST>[0];
}

/** Seeds a customer user directly into the in-memory database. */
async function seedUser(email: string) {
  await getTestDb().insert(users).values({
    id: randomUUID(),
    email,
    name: "User",
    password: "hashed-password",
    role: "CUSTOMER",
  });
}

beforeEach(async () => {
  await resetDb();
  process.env.JWT_SECRET = "login-test-secret";
});

describe("POST /api/auth/login", () => {
  it("sets the auth cookie on successful login", async () => {
    await seedUser("user@example.com");

    const res = await POST(
      makeReq({ email: "user@example.com", password: "password123" }),
      {}
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(/SameSite=strict/i.test(setCookie)).toBe(true);
  });

  it("returns 401 for unknown credentials", async () => {
    const res = await POST(
      makeReq({ email: "nobody@example.com", password: "password123" }),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
