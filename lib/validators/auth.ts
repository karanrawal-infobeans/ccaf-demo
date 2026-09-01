/**
 * Frontend registration form Zod schemas and derived types.
 *
 * These extend the API-facing schemas with the confirm-password field that is
 * a UI-only concern and should never be sent to the server.
 */
import { z } from "zod";
import type { Role } from "@prisma/client";

export const BACKOFFICE_ROLES = ["ADMIN", "CUSTOMER_SUPPORT"] as const;
export type BackofficeRole = (typeof BACKOFFICE_ROLES)[number];

export const RegisterFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const SystemRegisterFormSchema = RegisterFormSchema.extend({
  role: z.enum(BACKOFFICE_ROLES, {
    error: "Select a role",
  }),
});

export type SystemRegisterFormValues = z.infer<typeof SystemRegisterFormSchema>;

/** Backoffice roles that an admin is allowed to create. */
export const ALLOWED_BACKOFFICE_ROLES: readonly Role[] = BACKOFFICE_ROLES;

export const LoginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
