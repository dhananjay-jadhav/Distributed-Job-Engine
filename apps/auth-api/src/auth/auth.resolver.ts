import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GQLContext, LoginInput, UserType } from '@jobber/common-utils';
import { AuthService } from '@jobber/auth';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    @InjectPinoLogger(AuthResolver.name)
    private readonly logger: PinoLogger
  ) {}

  @Mutation(() => UserType)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: GQLContext
  ): Promise<UserType> {
    this.logger.info({ email: loginInput.email }, 'Login mutation called');
    try {
      const result = await this.authService.login(loginInput, context.res);
      this.logger.info({ userId: result.id }, 'Login mutation completed');
      return result;
    } catch (error) {
      this.logger.error({ email: loginInput.email, error }, 'Login mutation failed');
      throw error;
    }
  }
}
