import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UserService } from '@jobber/users';
import { AuthDbService } from '@jobber/auth-db';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
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
      ],
      providers: [UsersResolver, UserService, AuthDbService],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    userService = module.get<UserService>(UserService);
    authDbService = module.get<AuthDbService>(AuthDbService);
  });

  afterAll(async () => {
    await authDbService.$disconnect();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const email = `test-${Date.now()}@example.com`;
      const createUserInput = {
        email,
        password: 'password123',
      };

      const user = await resolver.createUser(createUserInput);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();

      // Cleanup
      await authDbService.user.delete({ where: { id: user.id } });
    });
  });

  describe('getUser', () => {
    it('should get user by id', async () => {
      const email = `test-${Date.now()}@example.com`;
      const createdUser = await userService.createUser({
        email,
        password: 'password123',
      });

      const currentUser = { userId: createdUser.id };
      const user = await resolver.getUser(createdUser.id, currentUser);

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
      expect(user?.id).toBe(createdUser.id);

      // Cleanup
      await authDbService.user.delete({ where: { id: createdUser.id } });
    });

    it('should return null for non-existent user', async () => {
      const currentUser = { userId: '00000000-0000-0000-0000-000000000000' };
      const user = await resolver.getUser(
        '00000000-0000-0000-0000-000000000000',
        currentUser
      );

      expect(user).toBeNull();
    });
  });
});
