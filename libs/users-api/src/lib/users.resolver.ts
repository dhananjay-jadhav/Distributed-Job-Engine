import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserType, CreateUserInput } from '@jobber/common-utils';
import { UserService } from '@jobber/users';
import { UseGuards } from '@nestjs/common';
import { GQLAuthGuard } from '@jobber/auth-service';

@Resolver(UserType)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserType, { name: 'createUser' })
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput
  ): Promise<UserType> {
    return this.userService.createUser(createUserInput);
  }

  @UseGuards(GQLAuthGuard)
  @Query(() => UserType, { name: 'user' })
  async getUser(@Args('userId') userId: string): Promise<UserType | null> {
    return this.userService.getUserbyId(userId);
  }
}
