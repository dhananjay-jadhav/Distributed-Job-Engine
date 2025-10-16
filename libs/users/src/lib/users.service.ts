import { Injectable } from '@nestjs/common';
import { AuthDbService } from '@jobber/auth-db';
import { Prisma } from '@prisma-clients/auth-db';
import { hash } from 'bcrypt';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    private readonly authDbService: AuthDbService,
    @InjectPinoLogger(UserService.name)
    private readonly logger: PinoLogger
  ) {}

  async createUser(user: Prisma.UserCreateInput): Promise<Prisma.UserGetPayload<object>> {
    this.logger.info({ email: user.email }, 'Creating new user');
    try {
      const createdUser = await this.authDbService.user.create({
        data: {
          ...user,
          password: await hash(user.password, 10),
        },
      });
      this.logger.info({ userId: createdUser.id, email: createdUser.email }, 'User created successfully');
      return createdUser;
    } catch (error) {
      this.logger.error({ email: user.email, error }, 'Failed to create user');
      throw error;
    }
  }

  async getUserbyId(userId: string): Promise<{ id: string; email: string } | null> {
    this.logger.debug({ userId }, 'Fetching user by ID');
    try {
      const user = await this.authDbService.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
        },
      });
      if (user) {
        this.logger.debug({ userId, email: user.email }, 'User found by ID');
      } else {
        this.logger.warn({ userId }, 'User not found by ID');
      }
      return user;
    } catch (error) {
      this.logger.error({ userId, error }, 'Error fetching user by ID');
      throw error;
    }
  }

  async getUser(userInput: Prisma.UserWhereUniqueInput): Promise<Prisma.UserGetPayload<object>> {
    this.logger.debug({ userInput }, 'Fetching user');
    try {
      const user = await this.authDbService.user.findUniqueOrThrow({
        where: {
          ...userInput,
        },
      });
      this.logger.debug({ userId: user.id, email: user.email }, 'User found');
      return user;
    } catch (error) {
      this.logger.error({ userInput, error }, 'Error fetching user');
      throw error;
    }
  }
}
