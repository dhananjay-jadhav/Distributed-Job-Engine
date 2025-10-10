import { Test, TestingModule } from '@nestjs/testing';
import { GqlAuthGuardService } from './gql-auth.guard.service';
import { LoggerModule } from 'nestjs-pino';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/proto';

describe('GqlAuthGuardService', () => {
  let service: GqlAuthGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: AUTH_PACKAGE_NAME,
          },
        ]),
        LoggerModule.forRoot(),
      ],
      providers: [GqlAuthGuardService],
    }).compile();

    service = module.get<GqlAuthGuardService>(GqlAuthGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
