/** Auth-specific configuration constants. */
export const BCRYPT_ROUNDS = 12;
export const JWT_TOKEN_TTL = "7d";
export const AUTH_COOKIE_NAME = "token";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const AUTH_COOKIE_PATH = "/";

/** Shared cookie options applied to the auth cookie on set/clear. */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: AUTH_COOKIE_PATH,
} as const;
