import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthServiceModule } from '@jobber/auth-service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@jobber/users';
import { UserService } from '@jobber/users';
import { AuthDbService } from '@jobber/auth-db';
import { Response } from 'express';
import * as Express from 'express';
import { LoggerModule } from 'nestjs-pino';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let userService: UserService;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
        LoggerModule.forRoot({
          pinoHttp: {
            autoLogging: false,
          },
        }),
        AuthServiceModule,
      ],
      providers: [AuthResolver],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    userService = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Test@Pass123';

      // Create test user
      const createdUser = await userService.createUser({
        email,
        password,
      });

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const context = {
        req: {} as Express.Request,
        res: mockResponse,
      };

      const result = await resolver.login({ email, password }, context);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.id).toBe(createdUser.id);
      expect(mockResponse.cookie).toHaveBeenCalled();

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });
  });
});
