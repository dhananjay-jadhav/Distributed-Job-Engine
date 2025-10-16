import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JobsService } from '@jobber/jobs-service';
import { GqlAuthGuardService, JobsFilter, JobType } from '@jobber/common-utils';
import { UseGuards } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Resolver(() => JobType)
export class JobsResolver {
  constructor(
    private readonly jobsService: JobsService,
    @InjectPinoLogger(JobsResolver.name)
    private readonly logger: PinoLogger
  ) {}

  @Query(() => [JobType], { name: 'jobs' })
  @UseGuards(GqlAuthGuardService)
  jobs(
    @Args('jobsFilter', { nullable: true }) jobsFilter?: JobsFilter
  ): JobType[] {
    this.logger.info({ jobsFilter }, 'Jobs query called');
    try {
      const jobs = this.jobsService.getJobs(jobsFilter);
      this.logger.info({ jobCount: jobs.length }, 'Jobs query completed');
      return jobs;
    } catch (error) {
      this.logger.error({ jobsFilter, error }, 'Jobs query failed');
      throw error;
    }
  }

  @Mutation(() => JobType)
  @UseGuards(GqlAuthGuardService)
  async executeJob(@Args('jobName') jobName: string): Promise<JobType> {
    this.logger.info({ jobName }, 'ExecuteJob mutation called');
    try {
      const result = await this.jobsService.executeJob(jobName);
      this.logger.info({ jobName }, 'ExecuteJob mutation completed');
      return result;
    } catch (error) {
      this.logger.error({ jobName, error }, 'ExecuteJob mutation failed');
      throw error;
    }
  }
}
