/**
 * JWT signing/verification helpers and request authentication utilities.
 */
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { ConfigurationError } from "@/lib/auth/errors";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { JWT_TOKEN_TTL, AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import type { Role, User } from "@/lib/db/schema";
import type { IUserRepository } from "@/lib/auth/user.repository";

/** Claims embedded in an access token. */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
}

/** Authenticated principal attached to a request by the auth middleware. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Loads the JWT secret from the environment, failing fast if absent. */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ConfigurationError("JWT_SECRET is not set");
  return secret;
}

/** Signs an access token for the given principal. */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_TOKEN_TTL });
}

/** Verifies a token string and returns its parsed claims. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

/** Resolves the authenticated user from a request, or throws UnauthorizedError. */
export async function getAuthenticatedUser(
  req: NextRequest,
  repo: IUserRepository
): Promise<AuthenticatedUser> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) throw new UnauthorizedError("Authentication required");

  const payload = verifyAccessToken(token);
  const user = await repo.findById(payload.userId);
  if (!user) throw new UnauthorizedError("User no longer exists");

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Throws ForbiddenError if the user does not hold the required role. */
export function assertRole(user: Pick<User, "role">, required: Role): void {
  if (user.role !== required)
    throw new ForbiddenError("Insufficient permissions");
}
