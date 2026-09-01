/**
 * Tests for POST /api/auth/login.
 * Mocks the database and hashing so no live DB is required.
 */
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(true),
}));

import { POST } from "./route";
import { HTTP_STATUS } from "@/lib/constants/http";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import db from "@/lib/db";

const mockedDb = db as unknown as {
  user: {
    create: jest.Mock;
    findUnique: jest.Mock;
  };
};

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

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "login-test-secret";
});

describe("POST /api/auth/login", () => {
  it("sets the auth cookie on successful login", async () => {
    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      name: "User",
      role: "CUSTOMER",
      password: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(
      makeReq({ email: "nobody@example.com", password: "password123" }),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
