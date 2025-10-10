import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthServiceModule } from '@jobber/auth-service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@jobber/users';

@Module({
  imports: [AuthServiceModule, UsersModule],
  providers: [AuthResolver],
  controllers: [AuthController],
})
export class AuthApiModule {}
