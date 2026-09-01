/**
 * Shared application logger (pino).
 * Emits structured JSON to stdout. Level is configurable via LOG_LEVEL.
 */
import pino from "pino";

const DEFAULT_LOG_LEVEL = "info";

/** Environment variable that controls the pino log level. */
export const LOG_LEVEL_ENV = "LOG_LEVEL";

export const logger = pino({
  level: process.env[LOG_LEVEL_ENV] ?? DEFAULT_LOG_LEVEL,
});
