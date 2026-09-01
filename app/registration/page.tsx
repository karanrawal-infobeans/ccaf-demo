/**
 * Customer-facing registration page.
 *
 * Renders the shared registration form in customer mode.
 */
import { RegistrationForm } from "@/components/organisms/RegistrationForm";

export default function RegistrationPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <RegistrationForm />
    </main>
  );
}
