/** Generic labelled text input wired to react-hook-form. */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

/** Renders a label + input pair with an inline validation message. */
export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            className={cn(fieldState.error && "border-destructive")}
            {...field}
          />
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
