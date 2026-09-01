/**
 * Unit tests for AuthService with a mocked IUserRepository.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import { EmailAlreadyRegisteredError, InvalidCredentialsError } from "./errors";
import type { IUserRepository } from "./user.repository";
import type { User } from "@prisma/client";

const JWT_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "abc123",
    email: "user@example.com",
    name: "User",
    password: bcrypt.hashSync("password123", 1),
    role: "CUSTOMER",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMockRepo(user: User | null = null): IUserRepository {
  return {
    create: jest.fn().mockResolvedValue(user ?? makeUser()),
    findByEmail: jest.fn().mockResolvedValue(user),
    findById: jest.fn().mockResolvedValue(user),
  };
}

describe("AuthService.register", () => {
  it("hashes password and returns AuthResult without password", async () => {
    const createdUser = makeUser({ email: "new@example.com", name: "New" });
    const repo: IUserRepository = {
      create: jest.fn().mockResolvedValue(createdUser),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
    };
    const service = new AuthService(repo);

    const result = await service.register({
      email: "new@example.com",
      name: "New",
      password: "password123",
    });

    expect(result.userId).toBeDefined();
    expect(result.email).toBe("new@example.com");
    expect(
      (result as unknown as { password?: string }).password
    ).toBeUndefined();
    expect(repo.create).toHaveBeenCalledTimes(1);
    const callArg = (repo.create as jest.Mock).mock.calls[0][0];
    expect(callArg.password).not.toBe("password123");
    expect(bcrypt.compareSync("password123", callArg.password)).toBe(true);
  });

  it("throws EmailAlreadyRegisteredError if email is already registered", async () => {
    const repo = makeMockRepo(makeUser());
    const service = new AuthService(repo);

    await expect(
      service.register({
        email: "user@example.com",
        name: "X",
        password: "password123",
      })
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });
});

describe("AuthService.login", () => {
  it("returns a signed JWT and AuthResult for valid credentials", async () => {
    const user = makeUser();
    const repo = makeMockRepo(user);
    const service = new AuthService(repo);

    const result = await service.login({
      email: user.email,
      password: "password123",
    });

    expect(result.user.email).toBe(user.email);
    const decoded = jwt.verify(result.token, JWT_SECRET) as { userId: string };
    expect(decoded.userId).toBe(user.id);
  });

  it("throws InvalidCredentialsError for unknown email", async () => {
    const repo = makeMockRepo(null);
    const service = new AuthService(repo);

    await expect(
      service.login({ email: "nobody@example.com", password: "password123" })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError for wrong password", async () => {
    const user = makeUser();
    const repo = makeMockRepo(user);
    const service = new AuthService(repo);

    await expect(
      service.login({ email: user.email, password: "wrongpass" })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("includes the user role in the JWT payload", async () => {
    const user = makeUser({ role: "ADMIN" });
    const repo = makeMockRepo(user);
    const service = new AuthService(repo);

    const result = await service.login({
      email: user.email,
      password: "password123",
    });

    const decoded = jwt.verify(result.token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    expect(decoded.userId).toBe(user.id);
    expect(decoded.role).toBe("ADMIN");
  });
});

describe("AuthService.registerWithRole", () => {
  it("passes the requested role to the repository", async () => {
    const createdUser = makeUser({
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    const repo: IUserRepository = {
      create: jest.fn().mockResolvedValue(createdUser),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
    };
    const service = new AuthService(repo);

    const result = await service.registerWithRole({
      email: "admin@example.com",
      name: "Admin",
      password: "password123",
      role: "ADMIN",
    });

    expect(result.role).toBe("ADMIN");
    const callArg = (repo.create as jest.Mock).mock.calls[0][0];
    expect(callArg.role).toBe("ADMIN");
  });

  it("throws EmailAlreadyRegisteredError for a duplicate email", async () => {
    const repo = makeMockRepo(makeUser());
    const service = new AuthService(repo);

    await expect(
      service.registerWithRole({
        email: "user@example.com",
        name: "X",
        password: "password123",
        role: "CUSTOMER_SUPPORT",
      })
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });
});

describe("AuthService.logout", () => {
  it("resolves without error for an anonymous user", async () => {
    const repo = makeMockRepo(null);
    const service = new AuthService(repo);

    await expect(service.logout(undefined)).resolves.toBeUndefined();
  });
});
