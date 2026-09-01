/**
 * User repository interface and Prisma-backed implementation.
 */
import type { PrismaClient, Role, User } from "@prisma/client";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  /** @inheritdoc */
  create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data });
  }

  /** @inheritdoc */
  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  /** @inheritdoc */
  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }
}
