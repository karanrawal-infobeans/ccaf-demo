import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { HTTP_STATUS } from "@/lib/constants/http";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  getAuthenticatedUser,
  assertRole,
  type AuthenticatedUser,
} from "@/lib/auth/jwt";
import type { IUserRepository } from "@/lib/auth/user.repository";
import { DrizzleUserRepository } from "@/lib/auth/user.repository";
import db from "@/lib/db";
import type { Role } from "@/lib/db/schema";

type HandlerContext<B, Q, P> = {
  req: NextRequest;
  body: B;
  query: Q;
  params: P;
  user?: AuthenticatedUser;
};

type ApiHandlerOptions<B, Q, P> = {
  bodySchema?: ZodSchema<B>;
  querySchema?: ZodSchema<Q>;
  pathParamsSchema?: ZodSchema<P>;
  /** Require a valid JWT; pass a Role to restrict access to that role. */
  requireAuth?: boolean | Role;
  /** Repository used to resolve the authenticated user (defaults to Drizzle). */
  userRepo?: IUserRepository;
  handler: (ctx: HandlerContext<B, Q, P>) => Promise<NextResponse>;
};

/** Determines the required role, if any, from the requireAuth option. */
function requiredRole(requireAuth: boolean | Role | undefined): Role | null {
  if (requireAuth === undefined || requireAuth === false) return null;
  if (requireAuth === true) return null;
  return requireAuth;
}

/**
 * Express-style route wrapper for Next.js API routes.
 *
 * Validates request body, query params, and path params against optional Zod schemas,
 * resolves the authenticated user when requireAuth is set, then passes the typed,
 * parsed values into the handler. All error handling is centralised here:
 * - Malformed JSON → 400
 * - Schema validation failure → 400 with field-level details
 * - Missing/invalid token or removed user → 401
 * - Role mismatch → 403
 * - AppError subclasses → their own statusCode
 * - Unexpected errors → 500 (logged with method + path)
 */
export function withApiHandler<B = undefined, Q = undefined, P = undefined>(
  options: ApiHandlerOptions<B, Q, P>
) {
  const repo = options.userRepo ?? new DrizzleUserRepository(db);
  const role = requiredRole(options.requireAuth);

  return async (
    req: NextRequest,
    context: { params?: unknown } = { params: undefined }
  ): Promise<NextResponse> => {
    try {
      const body = options.bodySchema
        ? options.bodySchema.parse(await req.json())
        : (undefined as B);

      const query = options.querySchema
        ? options.querySchema.parse(
            Object.fromEntries(req.nextUrl.searchParams)
          )
        : (undefined as Q);

      const pathParams = options.pathParamsSchema
        ? options.pathParamsSchema.parse(context.params)
        : (undefined as P);

      let user: AuthenticatedUser | undefined;
      if (options.requireAuth !== undefined && options.requireAuth !== false) {
        user = await getAuthenticatedUser(req, repo);
        if (role) assertRole(user, role);
      }

      return await options.handler({
        req,
        body,
        query,
        params: pathParams,
        user,
      });
    } catch (err) {
      if (err instanceof SyntaxError) {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.issues },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (err instanceof AppError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode }
        );
      }
      logger.error(
        { err, method: req.method, path: req.nextUrl.pathname },
        "unhandled error"
      );
      return NextResponse.json(
        { error: "Internal server error" },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  };
}
