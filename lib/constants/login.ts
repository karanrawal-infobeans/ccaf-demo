/** Constants for the login forms. */

export const LOGIN_TITLES = {
  customer: "Sign in to your account",
  system: "Backoffice login",
} as const;

export const LOGIN_SUBTITLES = {
  customer: "Welcome back! Enter your credentials to continue.",
  system: "Access the backoffice dashboard.",
} as const;

export const LOGIN_REDIRECTS = {
  customer: "/",
  system: "/system",
} as const;
