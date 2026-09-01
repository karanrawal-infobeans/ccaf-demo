/**
 * Tests for POST /api/system/auth/register.
 * Validates admin-only access and role-aware user creation.
 */
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findById: jest.fn(),
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
import { signAccessToken } from "@/lib/auth/jwt";

const JWT_SECRET = "system-register-test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

const mockedDb = db as unknown as {
  user: {
    create: jest.Mock;
    findUnique: jest.Mock;
  };
};

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

function adminToken(): string {
  return signAccessToken({
    userId: "admin-1",
    email: "a@b.com",
    role: "ADMIN",
  });
}

/** Signs a token for the given mock user. */
function tokenFor(user: { id: string; email: string; role: string }): string {
  return signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as never,
  });
}

/** Mocks findUnique to resolve users by id and emails by their where clause. */
function mockUsersByIdAndByEmail(users: Record<string, unknown>) {
  (mockedDb.user.findUnique as jest.Mock).mockImplementation(
    ({ where }: { where: Record<string, string> }) => {
      const key =
        "id" in where ? where.id : "email" in where ? where.email : "";
      return Promise.resolve(users[key] ?? null);
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/system/auth/register", () => {
  it("returns 401 when not authenticated", async () => {
    mockUsersByIdAndByEmail({});
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
    const customer = {
      id: "c-1",
      email: "c@b.com",
      name: "Cust",
      role: "CUSTOMER",
    };
    mockUsersByIdAndByEmail({ "c-1": customer });
    const res = await POST(
      makeReq(
        {
          email: "new@example.com",
          name: "New",
          password: "password123",
          role: "ADMIN",
        },
        tokenFor(customer)
      ),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it("creates a backoffice user with the requested role for an admin", async () => {
    mockUsersByIdAndByEmail({
      "admin-1": {
        id: "admin-1",
        email: "a@b.com",
        name: "Admin",
        role: "ADMIN",
      },
    });
    (mockedDb.user.create as jest.Mock).mockResolvedValue({
      id: "new-user",
      email: "support@example.com",
      name: "Support",
      role: "CUSTOMER_SUPPORT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(
      makeReq(
        {
          email: "support@example.com",
          name: "Support",
          password: "password123",
          role: "CUSTOMER_SUPPORT",
        },
        adminToken()
      ),
      {}
    );

    expect(res.status).toBe(HTTP_STATUS.CREATED);
    const body = await res.json();
    expect(body.user.role).toBe("CUSTOMER_SUPPORT");
    const createArg = (mockedDb.user.create as jest.Mock).mock.calls[0][0];
    expect(createArg.data.role).toBe("CUSTOMER_SUPPORT");
  });

  it("returns 400 for an invalid role", async () => {
    mockUsersByIdAndByEmail({
      "admin-1": {
        id: "admin-1",
        email: "a@b.com",
        name: "Admin",
        role: "ADMIN",
      },
    });
    const res = await POST(
      makeReq(
        {
          email: "new@example.com",
          name: "New",
          password: "password123",
          role: "SUPERUSER",
        },
        adminToken()
      ),
      {}
    );
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
