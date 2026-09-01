/** Customer registration form. */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  RegisterFormSchema,
  type RegisterFormValues,
} from "@/lib/validators/auth";
import { RegistrationFormShell } from "./RegistrationFormShell";
import {
  REGISTRATION_TITLES,
  REGISTRATION_SUBTITLES,
} from "@/lib/constants/registration";

const REGISTER_API = "/api/auth/register";
const LOGIN_API = "/api/auth/login";

type ApiResponse = { user?: { email?: string } };

/** Registers a customer, then auto-logs-in and redirects to the home page. */
export function RegistrationForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const res = await fetch(REGISTER_API, {
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
    onSuccess: async () => {
      await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.getValues("email"),
          password: form.getValues("password"),
        }),
      });
      router.push("/");
      router.refresh();
    },
    onError: (err: unknown) => {
      setServerError(
        err instanceof Error ? err.message : "Registration failed"
      );
    },
  });

  return (
    <RegistrationFormShell
      control={form.control}
      title={REGISTRATION_TITLES.customer}
      subtitle={REGISTRATION_SUBTITLES.customer}
      isSystem={false}
      isPending={mutation.isPending}
      serverError={serverError}
      successEmail={null}
      submitLabel={mutation.isPending ? "Creating account…" : "Create account"}
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
    />
  );
}
