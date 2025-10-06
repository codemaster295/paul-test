import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { RegisterDTO, LoginDTO, AuthResponse, User } from '../core/users/types';
import { AUTH, ERROR_MESSAGES } from '../config/constants';
import { env } from '../config/environment';
import { ApiError } from '../infrastructure/errors/ApiError';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, ERROR_MESSAGES.USER_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, AUTH.SALT_ROUNDS);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.INVALID_TOKEN);
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new ApiError(401, ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  private generateToken(user: User): string {
    return jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: AUTH.TOKEN_EXPIRY,
    });
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user as any;
    return sanitizedUser;
  }
}
