import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { FibonacciJob } from './jobs/fibonacci.job';
import { ConfigModule } from '@nestjs/config';
import { ApachePulsarModule } from '@jobber/apache-pulsar';
import { LoggerModule } from 'nestjs-pino';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
        }),
        LoggerModule.forRoot({
          pinoHttp: {
            autoLogging: false,
          },
        }),
        ApachePulsarModule,
        DiscoveryModule,
      ],
      providers: [JobsService, FibonacciJob],
    }).compile();

    service = module.get<JobsService>(JobsService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJobs', () => {
    it('should return all registered jobs', () => {
      const jobs = service.getJobs();
      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0]).toHaveProperty('name');
      expect(jobs[0]).toHaveProperty('description');
    });

    it('should filter jobs by name', () => {
      const jobs = service.getJobs({ name: 'Fibonacci' });
      expect(jobs).toBeDefined();
      expect(jobs.length).toBe(1);
      expect(jobs[0].name).toBe('Fibonacci');
    });

    it('should throw error for non-existent job', () => {
      expect(() => service.getJobs({ name: 'NonExistentJob' })).toThrow();
    });
  });

  describe('findJobByName', () => {
    it('should find job by name (case insensitive)', () => {
      const job = service.findJobByName('fibonacci');
      expect(job).toBeDefined();
      expect(job?.meta.name).toBe('Fibonacci');
    });

    it('should return undefined for non-existent job', () => {
      const job = service.findJobByName('NonExistent');
      expect(job).toBeUndefined();
    });
  });

  describe('findOrFailJobByName', () => {
    it('should find job by name', () => {
      const job = service.findOrFailJobByName('Fibonacci');
      expect(job).toBeDefined();
      expect(job.meta.name).toBe('Fibonacci');
    });

    it('should throw error for non-existent job', () => {
      expect(() => service.findOrFailJobByName('NonExistent')).toThrow(
        'Did not found the Job : NonExistent'
      );
    });
  });

  describe('executeJob', () => {
    it('should execute a job by name', async () => {
      const result = await service.executeJob('Fibonacci');
      expect(result).toBeDefined();
      expect(result.name).toBe('Fibonacci');
    });

    it('should throw error for non-existent job', async () => {
      await expect(service.executeJob('NonExistent')).rejects.toThrow();
    });
  });
});
