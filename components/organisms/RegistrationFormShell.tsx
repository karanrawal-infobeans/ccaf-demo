/** Shared presentational shell for registration forms. */
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/molecules/FormField";
import { PasswordField } from "@/components/molecules/PasswordField";
import { SelectField } from "@/components/molecules/SelectField";
import { CONFIRM_PASSWORD_LABEL } from "@/lib/constants/registration";

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
] as const;

interface RegistrationFormShellProps<T extends FieldValues> {
  control: Control<T>;
  title: string;
  subtitle: string;
  isSystem: boolean;
  isPending: boolean;
  serverError: string | null;
  successEmail: string | null;
  submitLabel: string;
  onSubmit: () => void;
}

/** Renders the shared field set, alerts and submit button for a form. */
export function RegistrationFormShell<T extends FieldValues>({
  control,
  title,
  subtitle,
  isSystem,
  isPending,
  serverError,
  successEmail,
  submitLabel,
  onSubmit,
}: RegistrationFormShellProps<T>) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Registration error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          {successEmail && isSystem && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {successEmail} has been registered as a backoffice user.
              </AlertDescription>
            </Alert>
          )}
          <FormField
            name={"name" as Path<T>}
            control={control}
            label="Name"
            autoComplete="name"
            disabled={isPending}
          />
          <FormField
            name={"email" as Path<T>}
            control={control}
            label="Email"
            type="email"
            autoComplete="email"
            disabled={isPending}
          />
          {isSystem && (
            <SelectField
              name={"role" as Path<T>}
              control={control}
              label="Role"
              options={ROLE_OPTIONS}
              disabled={isPending}
            />
          )}
          <PasswordField
            name={"password" as Path<T>}
            control={control}
            label="Password"
            autoComplete="new-password"
            disabled={isPending}
          />
          <PasswordField
            name={"confirmPassword" as Path<T>}
            control={control}
            label={CONFIRM_PASSWORD_LABEL}
            autoComplete="new-password"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
