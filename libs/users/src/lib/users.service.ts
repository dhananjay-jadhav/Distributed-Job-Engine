import { Injectable } from '@nestjs/common';
import { AuthDbService } from '@jobber/auth-db';
import { Prisma } from '@prisma-clients/auth-db';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly authDbService: AuthDbService) {}

  async createUser(user: Prisma.UserCreateInput): Promise<Prisma.UserGetPayload<object>> {
    return this.authDbService.user.create({
      data: {
        ...user,
        password: await hash(user.password, 10),
      },
    });
  }

  async getUserbyId(userId: string): Promise<{ id: string; email: string } | null> {
    return this.authDbService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async getUser(userInput: Prisma.UserWhereUniqueInput): Promise<Prisma.UserGetPayload<object>> {
    return this.authDbService.user.findUniqueOrThrow({
      where: {
        ...userInput,
      },
    });
  }
}
