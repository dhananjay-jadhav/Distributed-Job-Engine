import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { AuthDbService } from '@jobber/auth-db';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, AuthDbService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
