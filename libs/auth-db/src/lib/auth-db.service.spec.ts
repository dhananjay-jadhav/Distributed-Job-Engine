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

  afterAll(async () => {
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to database', async () => {
    await expect(service.$connect()).resolves.not.toThrow();
  });

  it('should execute raw queries', async () => {
    const result = await service.$queryRaw`SELECT 1 as value`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
