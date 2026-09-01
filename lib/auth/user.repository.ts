/**
 * User repository interface and Drizzle-backed implementation.
 */
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { users, type User, type NewUser } from "@/lib/db/schema";
import type { DrizzleDb } from "@/lib/db";

/** Data required to create a new user record. */
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: NewUser["role"];
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleDb) {}

  /** @inheritdoc */
  async create(data: CreateUserData): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({ id: randomUUID(), ...data })
      .returning();
    return user;
  }

  /** @inheritdoc */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  }

  /** @inheritdoc */
  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }
}
