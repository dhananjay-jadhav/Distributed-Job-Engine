import { Test, TestingModule } from '@nestjs/testing';
import { JobsResolver } from './jobs.resolver';
import { JobsServiceModule } from '@jobber/jobs-service';
import { AUTH_PACKAGE_NAME } from '@jobber/proto';
import { ClientsModule } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';

describe('JobsResolver', () => {
  let resolver: JobsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        JobsServiceModule,
        ClientsModule.register([
          {
            name: AUTH_PACKAGE_NAME,
          },
        ]),
      ],
      providers: [JobsResolver],
    }).compile();

    resolver = module.get<JobsResolver>(JobsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
