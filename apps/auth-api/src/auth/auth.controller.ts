import { Controller, UseGuards } from '@nestjs/common';
import {
  AuthenticateRequest,
  AuthSericeController,
  User,
  AuthSericeControllerMethods,
} from '@jobber/proto';
import { Observable } from 'rxjs';
import { JWTAuthGuard } from '@jobber/auth';
import { UserService } from '@jobber/users';
import { LoginPayload } from '@jobber/common-utils';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller('auth')
@AuthSericeControllerMethods()
export class AuthController implements AuthSericeController {
  constructor(
    private readonly userService: UserService,
    @InjectPinoLogger(AuthController.name)
    private readonly logger: PinoLogger
  ) {}

  @UseGuards(JWTAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: LoginPayload }
  ): Promise<User> | Observable<User> | User {
    this.logger.debug({ userId: request?.user?.userId }, 'Authenticate gRPC request received');
    try {
      const user = this.userService.getUser({ id: request?.user?.userId });
      this.logger.debug({ userId: request?.user?.userId }, 'Authenticate gRPC request completed');
      return user;
    } catch (error) {
      this.logger.error({ userId: request?.user?.userId, error }, 'Authenticate gRPC request failed');
      throw error;
    }
  }
}
