import { Injectable } from '@nestjs/common';
import { AuthDbService } from '@jobber/auth-db';
import { Prisma } from '@prisma-clients/auth-db';

@Injectable()
export class UserService {
  constructor(private readonly authDbService: AuthDbService) {}

  async createUser(user: Prisma.UserCreateInput) {
    return this.authDbService.user.create({
      data: user,
    });
  }

  async getUserbyId(userId: string) {
    return this.authDbService.user.findFirst({
      where: {
        id: userId,
      },
    });
  }
}
