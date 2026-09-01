/**
 * Backoffice landing page (admin-only).
 *
 * Middleware ensures only authenticated admins can reach this page.
 * The logout button is temporary and will be replaced by a proper nav bar.
 */
import { LogoutButton } from "@/components/molecules/LogoutButton";

export const dynamic = "force-dynamic";

export default function SystemPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Backoffice</h1>
      <p className="text-muted-foreground">
        Welcome to the backoffice dashboard.
      </p>
      <LogoutButton />
    </main>
  );
}
