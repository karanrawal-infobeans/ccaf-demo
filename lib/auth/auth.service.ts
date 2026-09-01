/**
 * Authentication service: register, login, and logout business logic.
 */
import bcrypt from "bcryptjs";
import type { IUserRepository } from "./user.repository";
import type { AuthResult, LoginResult, RegisterDto, LoginDto } from "./types";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  ConfigurationError,
} from "./errors";
import { BCRYPT_ROUNDS } from "./constants";
import { signAccessToken } from "./jwt";
import { logger } from "@/lib/logger";

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResult>;
  login(dto: LoginDto): Promise<LoginResult>;
  logout(userId?: string): Promise<void>;
}

export class AuthService implements IAuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  /** Registers a new CUSTOMER. Throws if the email is already taken. */
  async register(dto: RegisterDto): Promise<AuthResult> {
    try {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing) {
        throw new EmailAlreadyRegisteredError();
      }
      const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      const user = await this.userRepo.create({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      });
      logger.info(
        { userId: user.id, email: user.email },
        "user.register.success"
      );
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (err) {
      if (err instanceof EmailAlreadyRegisteredError) {
        logger.warn({ email: dto.email }, "user.register.duplicate");
      } else {
        logger.error({ err, email: dto.email }, "user.register.failed");
      }
      throw err;
    }
  }

  /** Validates credentials and returns a signed JWT + user info. */
  async login(dto: LoginDto): Promise<LoginResult> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new ConfigurationError("JWT_SECRET is not set");

      const user = await this.userRepo.findByEmail(dto.email);
      if (!user) throw new InvalidCredentialsError();

      const valid = await bcrypt.compare(dto.password, user.password);
      if (!valid) throw new InvalidCredentialsError();

      const token = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      logger.info({ userId: user.id }, "user.login.success");
      return {
        token,
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        logger.warn({ email: dto.email }, "user.login.failed");
      } else if (err instanceof ConfigurationError) {
        logger.error({ err }, "user.login.misconfigured");
      } else {
        logger.error({ err, email: dto.email }, "user.login.error");
      }
      throw err;
    }
  }

  /** Invalidates the session server-side (stateless, no-op) and logs the event. */
  async logout(userId?: string): Promise<void> {
    logger.info({ userId }, "user.logout.success");
  }
}
