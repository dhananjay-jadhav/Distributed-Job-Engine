import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@jobber/users';
import { LoginInput, LoginPayload } from '@jobber/common-utils';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma-clients/auth-db';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger
  ) {}

  async login(loginInput: LoginInput, res: Response): Promise<{ id: string; email: string }> {
    const { email, password } = loginInput;
    this.logger.info({ email }, 'Login attempt');
    
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
    
    this.logger.info({ userId: user.id, email: user.email }, 'Login successful');
    return {
      id: user.id,
      email: user.email,
    };
  }

  async verifyUser(email: string, password: string): Promise<Prisma.UserGetPayload<object>> {
    try {
      this.logger.debug({ email }, 'Verifying user credentials');
      const user = await this.userService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        this.logger.warn({ email }, 'Invalid password provided');
        throw new UnauthorizedException();
      }
      this.logger.debug({ email }, 'User credentials verified successfully');
      return user;
    } catch (error) {
      this.logger.error({ email, error }, 'User verification failed');
      throw new UnauthorizedException('User credentials are not valid!!');
    }
  }
}
