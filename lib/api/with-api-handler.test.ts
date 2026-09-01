/**
 * Unit tests for the withApiHandler route wrapper (auth + validation).
 * The real DB is never queried here (a userRepo is always injected), so we
 * alias @/lib/db to the in-memory test database to avoid a live connection.
 */
jest.mock("@/lib/db", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/test/db")
);

import { withApiHandler } from "./with-api-handler";
import { NextResponse } from "next/server";
import { z } from "zod";
import { HTTP_STATUS } from "@/lib/constants/http";
import type { IUserRepository } from "@/lib/auth/user.repository";
import type { User } from "@/lib/db/schema";
import { signAccessToken } from "@/lib/auth/jwt";

const JWT_SECRET = "handler-test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    email: "user@example.com",
    name: "User",
    password: "hashed",
    role: "CUSTOMER",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRepo(user: User | null = null): IUserRepository {
  return {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn().mockResolvedValue(user),
  };
}

function makeReq(body: unknown, cookie?: string) {
  return {
    json: jest.fn().mockResolvedValue(body),
    nextUrl: { searchParams: new URLSearchParams() },
    cookies: {
      get: jest.fn().mockReturnValue(cookie ? { value: cookie } : undefined),
    },
    method: "POST",
    nextUrlPathname: "/api/test",
  } as unknown as Parameters<ReturnType<typeof withApiHandler>>[0];
}

function tokenFor(user: User): string {
  return signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

describe("withApiHandler validation", () => {
  it("returns 400 with field details on schema validation failure", async () => {
    const handler = withApiHandler({
      bodySchema: z.object({ name: z.string().min(3) }),
      userRepo: makeRepo(),
      handler: async () => NextResponse.json({ ok: true }),
    });

    const res = await handler(makeReq({ name: "x" }), {});
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toMatchObject({ error: "Validation failed" });
  });

  it("returns 500 for unexpected errors in the handler", async () => {
    const handler = withApiHandler({
      handler: async () => {
        throw new Error("boom");
      },
      userRepo: makeRepo(),
    });

    const res = await handler(makeReq({}), {});
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});

describe("withApiHandler requireAuth", () => {
  it("attaches the authenticated user to the handler context", async () => {
    const repo = makeRepo(makeUser());
    const handler = withApiHandler<undefined, undefined, undefined>({
      requireAuth: true,
      userRepo: repo,
      handler: async ({ user }) => {
        return NextResponse.json({ userId: user?.id, role: user?.role });
      },
    });

    const res = await handler(makeReq({}, tokenFor(makeUser())), {});
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({
      userId: "11111111-1111-4111-8111-111111111111",
      role: "CUSTOMER",
    });
  });

  it("returns 401 when the auth cookie is missing", async () => {
    const handler = withApiHandler({
      requireAuth: true,
      userRepo: makeRepo(makeUser()),
      handler: async () => NextResponse.json({ ok: true }),
    });

    const res = await handler(makeReq({}), {});
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("returns 401 when the token does not match a known user", async () => {
    const repo = makeRepo(null);
    const handler = withApiHandler({
      requireAuth: true,
      userRepo: repo,
      handler: async () => NextResponse.json({ ok: true }),
    });

    const res = await handler(makeReq({}, tokenFor(makeUser())), {});
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("returns 403 when the user lacks the required role", async () => {
    const repo = makeRepo(makeUser({ role: "CUSTOMER" }));
    const handler = withApiHandler({
      requireAuth: "ADMIN",
      userRepo: repo,
      handler: async () => NextResponse.json({ ok: true }),
    });

    const res = await handler(makeReq({}, tokenFor(makeUser())), {});
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it("permits a request when the user has the required role", async () => {
    const admin = makeUser({ role: "ADMIN" });
    const repo = makeRepo(admin);
    const handler = withApiHandler({
      requireAuth: "ADMIN",
      userRepo: repo,
      handler: async () => NextResponse.json({ ok: true }),
    });

    const res = await handler(makeReq({}, tokenFor(admin)), {});
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ ok: true });
    expect(repo.findById).toHaveBeenCalled();
  });
});
