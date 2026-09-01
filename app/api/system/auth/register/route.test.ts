/**
 * Tests for POST /api/system/auth/register.
 * Validates admin-only access and role-aware user creation against an
 * in-memory Postgres (pg-mem). bcrypt is mocked for speed.
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
import { signAccessToken } from "@/lib/auth/jwt";

const JWT_SECRET = "system-register-test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

beforeEach(async () => {
  await resetDb();
});

function makeReq(body: unknown, cookie?: string) {
  return {
    json: jest.fn().mockResolvedValue(body),
    nextUrl: {
      searchParams: new URLSearchParams(),
      pathname: "/api/system/auth/register",
    },
    cookies: {
      get: jest.fn().mockReturnValue(cookie ? { value: cookie } : undefined),
    },
    method: "POST",
  } as unknown as Parameters<typeof POST>[0];
}

/** Seeds a user directly into the in-memory database. */
async function seedUser(user: {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN" | "CUSTOMER_SUPPORT";
}) {
  await getTestDb().insert(users).values({
    id: user.id,
    email: user.email,
    name: user.name,
    password: "hashed-password",
    role: user.role,
  });
}

type UsersRole = "CUSTOMER" | "ADMIN" | "CUSTOMER_SUPPORT";

/** Builds a valid JWT for a seeded user id. */
function tokenForUser(id: string, email: string, role: UsersRole): string {
  return signAccessToken({ userId: id, email, role });
}

describe("POST /api/system/auth/register", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await POST(
      makeReq({
        email: "new@example.com",
        name: "New",
        password: "password123",
        role: "ADMIN",
      }),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("returns 403 for a non-admin user", async () => {
    await seedUser({
      id: "11111111-1111-4111-8111-111111111111",
      email: "c@b.com",
      name: "Cust",
      role: "CUSTOMER",
    });
    const res = await POST(
      makeReq(
        {
          email: "new@example.com",
          name: "New",
          password: "password123",
          role: "ADMIN",
        },
        tokenForUser(
          "11111111-1111-4111-8111-111111111111",
          "c@b.com",
          "CUSTOMER"
        )
      ),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it("creates a backoffice user with the requested role for an admin", async () => {
    await seedUser({
      id: "22222222-2222-4222-8222-222222222222",
      email: "a@b.com",
      name: "Admin",
      role: "ADMIN",
    });

    const res = await POST(
      makeReq(
        {
          email: "support@example.com",
          name: "Support",
          password: "password123",
          role: "CUSTOMER_SUPPORT",
        },
        tokenForUser("22222222-2222-4222-8222-222222222222", "a@b.com", "ADMIN")
      ),
      {}
    );

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    const body = await res.json();
    expect(body.user.role).toBe("CUSTOMER_SUPPORT");
  });

  it("returns 400 for an invalid role", async () => {
    await seedUser({
      id: "33333333-3333-4333-8333-333333333333",
      email: "a2@b.com",
      name: "Admin",
      role: "ADMIN",
    });
    const res = await POST(
      makeReq(
        {
          email: "new@example.com",
          name: "New",
          password: "password123",
          role: "SUPERUSER",
        },
        tokenForUser(
          "33333333-3333-4333-8333-333333333333",
          "a2@b.com",
          "ADMIN"
        )
      ),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
