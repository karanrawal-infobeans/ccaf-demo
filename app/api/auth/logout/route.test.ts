/**
 * Tests for POST /api/auth/logout.
 * Uses an in-memory Postgres (pg-mem) so no live DB is required.
 */
jest.mock("@/lib/db", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/test/db")
);

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { POST } from "./route";
import { HTTP_STATUS } from "@/lib/constants/http";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { resetDb } from "@/test/db";

function makeReq() {
  return {
    json: jest.fn().mockResolvedValue({}),
    nextUrl: {
      searchParams: new URLSearchParams(),
      pathname: "/api/auth/logout",
    },
    method: "POST",
  } as unknown as Parameters<typeof POST>[0];
}

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/logout", () => {
  it("clears the auth cookie (maxAge 0)", async () => {
    const res = await POST(makeReq(), {});
    expect(res.status).toBe(HTTP_STATUS.OK);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(setCookie).toContain("Max-Age=0");
  });
});
