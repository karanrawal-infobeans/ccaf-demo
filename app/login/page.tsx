/**
 * Customer-facing login page.
 */
import { LoginForm } from "@/components/organisms/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <LoginForm variant="customer" />
    </main>
  );
}
