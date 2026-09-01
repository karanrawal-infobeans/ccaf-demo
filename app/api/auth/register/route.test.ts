/**
 * Tests for POST /api/auth/register.
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
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

import { POST } from "./route";
import { HTTP_STATUS } from "@/lib/constants/http";
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
      pathname: "/api/auth/register",
    },
    method: "POST",
  } as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("creates a CUSTOMER and returns 201", async () => {
    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockedDb.user.create as jest.Mock).mockResolvedValue({
      id: "new-user",
      email: "new@example.com",
      name: "New",
      role: "CUSTOMER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    expect(mockedDb.user.create).toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(makeReq({ email: "not-an-email" }), {});
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
