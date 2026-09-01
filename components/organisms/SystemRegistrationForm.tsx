/** Backoffice registration form (admin-only). */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  SystemRegisterFormSchema,
  type SystemRegisterFormValues,
} from "@/lib/validators/auth";
import { RegistrationFormShell } from "./RegistrationFormShell";
import {
  REGISTRATION_TITLES,
  REGISTRATION_SUBTITLES,
} from "@/lib/constants/registration";

const SYSTEM_REGISTER_API = "/api/system/auth/register";

type ApiResponse = { user?: { email?: string } };

/** Creates a backoffice user via the admin-protected endpoint. */
export function SystemRegistrationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const form = useForm<SystemRegisterFormValues>({
    resolver: zodResolver(SystemRegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SystemRegisterFormValues) => {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      const res = await fetch(SYSTEM_REGISTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(
          body.user?.email ? "Email already registered" : "Registration failed"
        );
      }
      return (await res.json()) as ApiResponse;
    },
    onSuccess: () => {
      setServerError(null);
      setSuccessEmail(String(form.getValues("email")));
      form.reset();
    },
    onError: (err: unknown) => {
      setSuccessEmail(null);
      setServerError(
        err instanceof Error ? err.message : "Registration failed"
      );
    },
  });

  return (
    <RegistrationFormShell
      control={form.control}
      title={REGISTRATION_TITLES.system}
      subtitle={REGISTRATION_SUBTITLES.system}
      isSystem
      isPending={mutation.isPending}
      serverError={serverError}
      successEmail={successEmail}
      submitLabel={mutation.isPending ? "Creating account…" : "Create account"}
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
    />
  );
}
