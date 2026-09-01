import { HTTP_STATUS } from "@/lib/constants/http";
import { AppError } from "@/lib/errors";

export class EmailAlreadyRegisteredError extends AppError {
  readonly statusCode = HTTP_STATUS.CONFLICT;
  constructor() {
    super("Email already registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class InvalidCredentialsError extends AppError {
  readonly statusCode = HTTP_STATUS.UNAUTHORIZED;
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

/** Thrown when a required server-side configuration value (e.g. JWT_SECRET) is absent. */
export class ConfigurationError extends AppError {
  readonly statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}
