/**
 * Unit tests for PrismaUserRepository using a mocked PrismaClient.
 */
import { PrismaUserRepository, CreateUserData } from "./user.repository";
import type { PrismaClient, User } from "@prisma/client";

function createMockDb() {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as PrismaClient;
}

const TEST_EMAIL = "repo-test@example.com";
const SAMPLE_USER: User = {
  id: "user-1",
  email: TEST_EMAIL,
  name: "Repo Test User",
  password: "hashed_password",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaUserRepository.create", () => {
  it("persists a user and returns the created record", async () => {
    const db = createMockDb();
    (db.user.create as jest.Mock).mockResolvedValue(SAMPLE_USER);
    const repo = new PrismaUserRepository(db);

    const result = await repo.create({
      email: TEST_EMAIL,
      name: "Repo Test User",
      password: "hashed_password",
    });

    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: TEST_EMAIL,
        name: "Repo Test User",
        password: "hashed_password",
      },
    });
    expect(result.id).toBe("user-1");
    expect(result.email).toBe(TEST_EMAIL);
  });
});

describe("PrismaUserRepository.findByEmail", () => {
  it("returns the user when found", async () => {
    const db = createMockDb();
    (db.user.findUnique as jest.Mock).mockResolvedValue(SAMPLE_USER);
    const repo = new PrismaUserRepository(db);

    const found = await repo.findByEmail(TEST_EMAIL);

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: TEST_EMAIL },
    });
    expect(found).not.toBeNull();
    expect(found!.email).toBe(TEST_EMAIL);
  });

  it("returns null when no user matches the email", async () => {
    const db = createMockDb();
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);
    const repo = new PrismaUserRepository(db);

    const found = await repo.findByEmail("nobody@example.com");
    expect(found).toBeNull();
  });
});

describe("PrismaUserRepository.findById", () => {
  it("returns the user when found by id", async () => {
    const db = createMockDb();
    (db.user.findUnique as jest.Mock).mockResolvedValue(SAMPLE_USER);
    const repo = new PrismaUserRepository(db);

    const found = await repo.findById("user-1");

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(found).not.toBeNull();
    expect(found!.id).toBe("user-1");
  });

  it("returns null for a non-existent id", async () => {
    const db = createMockDb();
    (db.user.findUnique as jest.Mock).mockResolvedValue(null);
    const repo = new PrismaUserRepository(db);

    const found = await repo.findById("000000000000000000000000");
    expect(found).toBeNull();
  });
});
