import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { LoginPayload } from '@jobber/common-utils';
import { UserService } from '@jobber/users';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies.Authentication,
      ]),
      secretOrKey: configService.getOrThrow('AUTH_JWT_SECRET'),
    });
  }

  async validate(payload: LoginPayload): Promise<LoginPayload> {
    const validateUser = await this.userService.getUserbyId(payload.userId);
    if (validateUser?.email) {
      return payload;
    }
    throw new UnauthorizedException();
  }
}
