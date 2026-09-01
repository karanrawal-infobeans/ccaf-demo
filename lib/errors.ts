import { HTTP_STATUS } from "@/lib/constants/http";

/**
 * Base class for all application domain errors.
 * Carry an HTTP status code so route handlers can respond without string-matching.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
}

export class BadRequestError extends AppError {
  readonly statusCode = HTTP_STATUS.BAD_REQUEST;
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = HTTP_STATUS.UNAUTHORIZED;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = HTTP_STATUS.FORBIDDEN;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = HTTP_STATUS.NOT_FOUND;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}
