import { Module } from '@nestjs/common';
import { JobsResolver } from './jobs.resolver';
import { JobsServiceModule } from '@jobber/jobs-service';
import { GqlAuthGuardService } from '@jobber/common-utils';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/proto';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, 'protos/auth.proto'),
        },
      },
    ]),
    JobsServiceModule,
  ],
  providers: [JobsResolver, GqlAuthGuardService],
  exports: [],
})
export class JobsApiModule {}
