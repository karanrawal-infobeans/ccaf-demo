/**
 * Zod schemas and derived TypeScript types for auth DTOs.
 */
import { z } from "zod";
import type { Role } from "@prisma/client";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

export interface AuthResult {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResult {
  token: string;
  user: AuthResult;
}
