/**
 * Backoffice registration page (admin-only).
 *
 * Middleware ensures only authenticated admins can reach this page.
 */
import { SystemRegistrationForm } from "@/components/organisms/SystemRegistrationForm";

export const dynamic = "force-dynamic";

export default async function SystemRegistrationPage(): Promise<React.JSX.Element> {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <SystemRegistrationForm />
    </main>
  );
}
