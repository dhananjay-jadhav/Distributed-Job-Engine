import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@jobber/users';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('AUTH_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('AUTH_JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthServiceModule {}
