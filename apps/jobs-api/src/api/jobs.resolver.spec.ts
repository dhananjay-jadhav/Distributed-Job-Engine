import { Test, TestingModule } from '@nestjs/testing';
import { JobsResolver } from './jobs.resolver';
import { JobsModule } from '@jobber/jobs';
import { AUTH_PACKAGE_NAME } from '@jobber/proto';
import { ClientsModule } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { JobsService } from '@jobber/jobs';

describe('JobsResolver', () => {
  let resolver: JobsResolver;
  let jobsService: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        JobsModule,
        ClientsModule.register([
          {
            name: AUTH_PACKAGE_NAME,
          },
        ]),
      ],
      providers: [JobsResolver],
    }).compile();

    resolver = module.get<JobsResolver>(JobsResolver);
    jobsService = module.get<JobsService>(JobsService);
    await jobsService.onModuleInit();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('jobs', () => {
    it('should return all jobs', () => {
      const jobs = resolver.jobs();
      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('should filter jobs by name', () => {
      const jobs = resolver.jobs({ name: 'Fibonacci' });
      expect(jobs).toBeDefined();
      expect(jobs.length).toBe(1);
      expect(jobs[0].name).toBe('Fibonacci');
    });
  });

  describe('executeJob', () => {
    it('should execute a job', async () => {
      const result = await resolver.executeJob('Fibonacci');
      expect(result).toBeDefined();
      expect(result.name).toBe('Fibonacci');
    });

    it('should throw error for non-existent job', async () => {
      await expect(resolver.executeJob('NonExistent')).rejects.toThrow();
    });
  });
});
