import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersModule } from '@jobber/users';
import { UserService } from '@jobber/users';
import { AuthDbService } from '@jobber/auth-db';
import { LoggerModule } from 'nestjs-pino';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        LoggerModule.forRoot({
          pinoHttp: {
            autoLogging: false,
          },
        }),
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid userId', async () => {
      const email = `test-${Date.now()}@example.com`;
      const createdUser = await userService.createUser({
        email,
        password: 'Test@Pass123',
      });

      const request = {
        token: 'test-token',
        user: {
          userId: createdUser.id,
        },
      };

      const result = await controller.authenticate(request);
      const user = result instanceof Promise ? await result : result;

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBe(createdUser.id);

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should throw error for non-existent user', async () => {
      const request = {
        token: 'test-token',
        user: {
          userId: '00000000-0000-0000-0000-000000000000',
        },
      };

      const result = controller.authenticate(request);
      await expect(result).rejects.toThrow();
    });
  });
});
