/**
 * Backoffice login page.
 *
 * Middleware handles redirecting already-authenticated admins to /system.
 */
import { LoginForm } from "@/components/organisms/LoginForm";

export default function SystemLoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <LoginForm variant="system" />
    </main>
  );
}
