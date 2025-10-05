import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@jobber/users';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UsersModule],
  providers: [AuthService, JwtService, ConfigService],
  exports: [AuthService],
})
export class AuthServiceModule {}
