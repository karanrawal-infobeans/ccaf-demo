/**
 * Unit tests for JWT signing/verification and request authentication helpers.
 */
import {
  signAccessToken,
  verifyAccessToken,
  assertRole,
  getAuthenticatedUser,
} from "./jwt";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { IUserRepository } from "./user.repository";
import type { User } from "@/lib/db/schema";
import { AUTH_COOKIE_NAME } from "./constants";

const JWT_SECRET = "jwt-test-secret";

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

function makeReq(cookieValue?: string) {
  // Minimal stand-in for NextRequest: exposes an http cookie bag.
  return {
    cookies: {
      get: jest
        .fn()
        .mockReturnValue(cookieValue ? { value: cookieValue } : undefined),
    },
  } as unknown as Parameters<typeof getAuthenticatedUser>[0];
}

describe("signAccessToken / verifyAccessToken", () => {
  it("round-trips claims through a signed token", () => {
    const token = signAccessToken({
      userId: "11111111-1111-4111-8111-111111111111",
      email: "user@example.com",
      role: "CUSTOMER",
    });
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe("11111111-1111-4111-8111-111111111111");
    expect(decoded.email).toBe("user@example.com");
    expect(decoded.role).toBe("CUSTOMER");
  });

  it("throws UnauthorizedError for a tampered or invalid token", () => {
    expect(() => verifyAccessToken("not.a.valid.token")).toThrow(
      UnauthorizedError
    );
  });
});

describe("assertRole", () => {
  it("does not throw when the user holds the required role", () => {
    expect(() =>
      assertRole(makeUser({ role: "ADMIN" }), "ADMIN")
    ).not.toThrow();
  });

  it("throws ForbiddenError when the role does not match", () => {
    expect(() => assertRole(makeUser({ role: "CUSTOMER" }), "ADMIN")).toThrow(
      ForbiddenError
    );
  });
});

describe("getAuthenticatedUser", () => {
  it("throws UnauthorizedError when no cookie is present", async () => {
    const repo: IUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    await expect(
      getAuthenticatedUser(makeReq(undefined), repo)
    ).rejects.toThrow(UnauthorizedError);
  });

  it("returns the resolved user for a valid token", async () => {
    const token = signAccessToken({
      userId: "11111111-1111-4111-8111-111111111111",
      email: "user@example.com",
      role: "CUSTOMER",
    });
    const repo: IUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue(makeUser()),
    };
    const req = makeReq(token);
    const cookies = req.cookies as unknown as { get: jest.Mock };

    const user = await getAuthenticatedUser(req, repo);
    expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
    expect(user.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(user.role).toBe("CUSTOMER");
  });

  it("throws UnauthorizedError when the user no longer exists", async () => {
    const token = signAccessToken({
      userId: "11111111-1111-4111-8111-111111111111",
      email: "user@example.com",
      role: "CUSTOMER",
    });
    const repo: IUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
    };
    await expect(getAuthenticatedUser(makeReq(token), repo)).rejects.toThrow(
      UnauthorizedError
    );
  });
});
