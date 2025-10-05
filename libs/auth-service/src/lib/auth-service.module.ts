import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@jobber/users';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthServiceModule {}
