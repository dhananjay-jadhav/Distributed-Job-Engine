import { Module } from '@nestjs/common';
import { FibonacciJob } from './jobs/fibonacci.job';
import { JobsService } from './jobs.service';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';

@Module({
  imports: [DiscoveryModule],
  providers: [FibonacciJob, JobsService],
  exports: [JobsService],
})
export class JobsServiceModule {}
