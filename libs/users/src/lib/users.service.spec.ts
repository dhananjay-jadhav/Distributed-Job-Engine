import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { AuthDbService } from '@jobber/auth-db';

describe('UserService', () => {
  let service: UserService;
  let authDbService: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, AuthDbService],
    }).compile();

    service = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const email = `test-${Date.now()}@example.com`;
      const user = await service.createUser({
        email,
        password: 'Test@Pass123',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
      expect(user.password).not.toBe('Test@Pass123'); // password should be hashed

      // Cleanup
      await authDbService.user.delete({ where: { id: user.id } });
    });
  });

  describe('getUserbyId', () => {
    it('should return user without password', async () => {
      const email = `test-${Date.now()}@example.com`;
      const createdUser = await service.createUser({
        email,
        password: 'Test@Pass123',
      });

      const user = await service.getUserbyId(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
      expect(user?.id).toBe(createdUser.id);
      expect((user as any).password).toBeUndefined();

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should return null for non-existent user', async () => {
      const user = await service.getUserbyId(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(user).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user by email', async () => {
      const email = `test-${Date.now()}@example.com`;
      const createdUser = await service.createUser({
        email,
        password: 'Test@Pass123',
      });

      const user = await service.getUser({ email });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBe(createdUser.id);
      expect(user.password).toBeDefined(); // getUser returns password for authentication

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        service.getUser({ email: 'nonexistent@example.com' })
      ).rejects.toThrow();
    });
  });
});
