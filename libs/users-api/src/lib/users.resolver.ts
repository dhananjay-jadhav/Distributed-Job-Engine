import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserType, CreateUserInput, LoginPayload } from '@jobber/common-utils';
import { UserService } from '@jobber/users';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, GQLAuthGuard } from '@jobber/auth-service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Resolver(UserType)
export class UsersResolver {
  constructor(
    private readonly userService: UserService,
    @InjectPinoLogger(UsersResolver.name)
    private readonly logger: PinoLogger
  ) {}

  @Mutation(() => UserType, { name: 'createUser' })
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput
  ): Promise<UserType> {
    this.logger.info({ email: createUserInput.email }, 'CreateUser mutation called');
    try {
      const user = await this.userService.createUser(createUserInput);
      this.logger.info({ userId: user.id, email: user.email }, 'CreateUser mutation completed');
      return user;
    } catch (error) {
      this.logger.error({ email: createUserInput.email, error }, 'CreateUser mutation failed');
      throw error;
    }
  }

  @UseGuards(GQLAuthGuard)
  @Query(() => UserType, { name: 'user' })
  async getUser(
    @Args('userId') userId: string,
    @CurrentUser() _currentUser: LoginPayload
  ): Promise<UserType | null> {
    this.logger.info({ userId, currentUserId: _currentUser.userId }, 'GetUser query called');
    try {
      const user = await this.userService.getUserbyId(userId);
      this.logger.info({ userId, found: !!user }, 'GetUser query completed');
      return user;
    } catch (error) {
      this.logger.error({ userId, error }, 'GetUser query failed');
      throw error;
    }
  }
}
