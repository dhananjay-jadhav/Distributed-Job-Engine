import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@jobber/users';
import { LoginInput, LoginPayload } from '@jobber/common-utils';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginInput: LoginInput, res: Response) {
    const { email, password } = loginInput;
    const user = await this.verifyUser(email, password);
    const expires = new Date();
    expires.setMilliseconds(
      expires.getTime() +
        parseInt(this.configService.getOrThrow('AUTH_JWT_EXPIRES_IN'))
    );
    const payload: LoginPayload = {
      userId: user.id,
    };
    const accesstoken = await this.jwtService.sign(payload);

    // Sending Back Auth token as http only cookie
    res.cookie('Authentication', accesstoken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      // sameSite: 'lax', // or 'strict'
      expires,
    });
    return {
      id: user.id,
      email: user.email,
    };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('User credentials are not valid!!');
    }
  }
}
