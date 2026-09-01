/**
 * POST /api/auth/register — creates a new user account.
 */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { PrismaUserRepository } from "@/lib/auth/user.repository";
import { AuthService } from "@/lib/auth/auth.service";
import { RegisterSchema } from "@/lib/auth/types";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { HTTP_STATUS } from "@/lib/constants/http";

export const POST = withApiHandler({
  bodySchema: RegisterSchema,
  handler: async ({ body }) => {
    const repo = new PrismaUserRepository(db);
    const service = new AuthService(repo);
    const user = await service.register(body);
    return NextResponse.json({ user }, { status: HTTP_STATUS.CREATED });
  },
});
