/**
 * POST /api/auth/logout — clears the JWT cookie.
 */
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/lib/constants/http";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth/constants";
import { withApiHandler } from "@/lib/api/with-api-handler";
import db from "@/lib/db";
import { PrismaUserRepository } from "@/lib/auth/user.repository";
import { AuthService } from "@/lib/auth/auth.service";

export const POST = withApiHandler({
  handler: async () => {
    const repo = new PrismaUserRepository(db);
    const service = new AuthService(repo);
    await service.logout();

    const response = NextResponse.json(
      { message: "Logged out" },
      { status: HTTP_STATUS.OK }
    );
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 0,
    });
    return response;
  },
});
