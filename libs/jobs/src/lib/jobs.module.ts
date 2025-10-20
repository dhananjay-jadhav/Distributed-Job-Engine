import { Module } from '@nestjs/common';
import { FibonacciJob } from './jobs/fibonacci.job';
import { JobsService } from './jobs.service';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { ApachePulsarModule } from '@jobber/apache-pulsar';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ApachePulsarModule,
    DiscoveryModule,
  ],
  providers: [FibonacciJob, JobsService],
  exports: [JobsService],
})
export class JobsModule {}
