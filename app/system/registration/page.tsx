/**
 * Backoffice registration page (admin-only).
 *
 * Guards the route server-side: non-admin visitors are redirected to the
 * backoffice login page. Only authenticated admins may create backoffice users.
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SystemRegistrationForm } from "@/components/organisms/SystemRegistrationForm";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

export default async function SystemRegistrationPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  let isAdmin = false;
  if (token) {
    try {
      isAdmin = verifyAccessToken(token).role === "ADMIN";
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    redirect("/system/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <SystemRegistrationForm />
    </main>
  );
}
