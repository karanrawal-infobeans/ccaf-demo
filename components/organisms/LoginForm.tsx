/** Login form supporting customer and system variants. */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginFormSchema, type LoginFormValues } from "@/lib/validators/auth";
import {
  LOGIN_TITLES,
  LOGIN_SUBTITLES,
  LOGIN_REDIRECTS,
} from "@/lib/constants/login";
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
import Link from "next/link";

const LOGIN_API = "/api/auth/login";

type LoginVariant = "customer" | "system";

interface LoginFormProps {
  variant: LoginVariant;
}

type ApiResponse = { user?: { email?: string } };

/** Authenticates a user and redirects based on the variant. */
export function LoginForm({ variant }: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiResponse = await res.json().catch(() => ({}));
        throw new Error(
          body.user?.email ? "Invalid credentials" : "Login failed"
        );
      }
      return (await res.json()) as ApiResponse;
    },
    onSuccess: () => {
      router.push(LOGIN_REDIRECTS[variant]);
      router.refresh();
    },
    onError: (err: unknown) => {
      setServerError(err instanceof Error ? err.message : "Login failed");
    },
  });

  const registerLink =
    variant === "customer" ? "/registration" : "/system/registration";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{LOGIN_TITLES[variant]}</CardTitle>
        <CardDescription>{LOGIN_SUBTITLES[variant]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="flex flex-col gap-4"
          noValidate
        >
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Login error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <FormField
            name="email"
            control={form.control}
            label="Email"
            type="email"
            autoComplete="email"
            disabled={mutation.isPending}
          />
          <PasswordField
            name="password"
            control={form.control}
            label="Password"
            autoComplete="current-password"
            disabled={mutation.isPending}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={registerLink}
              className="underline hover:text-foreground"
            >
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
