/**
 * POST /api/system/auth/register — creates a backoffice user (ADMIN or
 * CUSTOMER_SUPPORT). Requires an authenticated ADMIN.
 */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { PrismaUserRepository } from "@/lib/auth/user.repository";
import { AuthService } from "@/lib/auth/auth.service";
import { SystemRegisterSchema } from "@/lib/auth/types";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { HTTP_STATUS } from "@/lib/constants/http";

export const POST = withApiHandler({
  bodySchema: SystemRegisterSchema,
  requireAuth: "ADMIN",
  handler: async ({ body }) => {
    const repo = new PrismaUserRepository(db);
    const service = new AuthService(repo);
    const user = await service.registerWithRole(body);
    return NextResponse.json({ user }, { status: HTTP_STATUS.CREATED });
  },
});
