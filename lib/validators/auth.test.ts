/**
 * Unit tests for the frontend auth validation schemas.
 */
import {
  RegisterFormSchema,
  SystemRegisterFormSchema,
  LoginFormSchema,
} from "./auth";

describe("RegisterFormSchema", () => {
  it("accepts valid input", () => {
    const result = RegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = RegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejects a short password", () => {
    const result = RegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = RegisterFormSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = RegisterFormSchema.safeParse({
      name: "",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("SystemRegisterFormSchema", () => {
  it("accepts a valid backoffice role", () => {
    const result = SystemRegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
      role: "CUSTOMER_SUPPORT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = SystemRegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
      role: "SUPERUSER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing role", () => {
    const result = SystemRegisterFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginFormSchema", () => {
  it("accepts valid input", () => {
    const result = LoginFormSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = LoginFormSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = LoginFormSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
