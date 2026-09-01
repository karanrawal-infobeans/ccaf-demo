/** Password input with a show/hide toggle, wired to react-hook-form. */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface PasswordFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  autoComplete?: string;
  disabled?: boolean;
}

/** Renders a labelled password input with a visibility toggle and error. */
export function PasswordField<T extends FieldValues>({
  name,
  control,
  label,
  autoComplete,
  disabled,
}: PasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <div className="relative">
            <Input
              id={name}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
              className={cn("pr-9", fieldState.error && "border-destructive")}
              {...field}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {fieldState.error && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
