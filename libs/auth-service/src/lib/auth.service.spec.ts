import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@jobber/users';
import { UserService } from '@jobber/users';
import { AuthDbService } from '@jobber/auth-db';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        UsersModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
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

      const result = await service.login({ email, password }, mockResponse);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.id).toBe(createdUser.id);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
        })
      );

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        service.login(
          { email: 'nonexistent@example.com', password: 'wrongpassword' },
          mockResponse
        )
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
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

      await expect(
        service.login({ email, password: 'wrongpassword' }, mockResponse)
      ).rejects.toThrow(UnauthorizedException);

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });
  });

  describe('verifyUser', () => {
    it('should verify user with correct credentials', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Test@Pass123';

      // Create test user
      const createdUser = await userService.createUser({
        email,
        password,
      });

      const user = await service.verifyUser(email, password);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBe(createdUser.id);

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should throw UnauthorizedException for wrong credentials', async () => {
      await expect(
        service.verifyUser('nonexistent@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
