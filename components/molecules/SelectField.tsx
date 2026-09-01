/** Labelled select control wired to react-hook-form. */
import { Label } from "@/components/ui/label";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  disabled?: boolean;
}

/** Renders a labelled native select with an option list and error message. */
export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <select
            id={name}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            className={cn(
              "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              fieldState.error && "border-destructive"
            )}
            {...field}
            value={field.value ?? ""}
          >
            <option value="" disabled>
              Select a role
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
