import { Test, TestingModule } from '@nestjs/testing';
import { AuthDbService } from './auth-db.service';

describe('AuthDbService', () => {
  let service: AuthDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthDbService],
    }).compile();

    service = module.get<AuthDbService>(AuthDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
