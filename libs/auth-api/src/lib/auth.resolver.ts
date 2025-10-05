import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GQLContext, LoginInput, UserType } from '@jobber/common-utils';
import { AuthService } from '@jobber/auth-service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserType)
  login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: GQLContext
  ): Promise<UserType> {
    return this.authService.login(loginInput, context.res);
  }
}
