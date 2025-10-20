import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthModule } from '@jobber/auth';
import { AuthController } from './auth.controller';
import { UsersModule } from '@jobber/users';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [AuthResolver],
  controllers: [AuthController],
})
export class AuthApiModule {}
