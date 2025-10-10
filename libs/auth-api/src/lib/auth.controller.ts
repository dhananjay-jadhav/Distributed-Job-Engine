import { Controller, UseGuards } from '@nestjs/common';
import {
  AuthenticateRequest,
  AuthSericeController,
  User,
  AuthSericeControllerMethods,
} from '@jobber/proto';
import { Observable } from 'rxjs';
import { JWTAuthGuard } from '@jobber/auth-service';
import { UserService } from '@jobber/users';
import { LoginPayload } from '@jobber/common-utils';

@Controller('auth')
@AuthSericeControllerMethods()
export class AuthController implements AuthSericeController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JWTAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: LoginPayload }
  ): Promise<User> | Observable<User> | User {
    return this.userService.getUser({ id: request?.user?.userId });
  }
}
