/**
 * POST /api/auth/login — authenticates a user and sets an httpOnly JWT cookie.
 */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { PrismaUserRepository } from "@/lib/auth/user.repository";
import { AuthService } from "@/lib/auth/auth.service";
import { LoginSchema } from "@/lib/auth/types";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { HTTP_STATUS } from "@/lib/constants/http";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/constants";

export const POST = withApiHandler({
  bodySchema: LoginSchema,
  handler: async ({ body }) => {
    const repo = new PrismaUserRepository(db);
    const service = new AuthService(repo);
    const { token, user } = await service.login(body);

    const response = NextResponse.json({ user }, { status: HTTP_STATUS.OK });
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  },
});
