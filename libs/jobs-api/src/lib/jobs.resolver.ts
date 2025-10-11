import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JobsService } from '@jobber/jobs-service';
import { GqlAuthGuardService, JobsFilter, JobType } from '@jobber/common-utils';
import { UseGuards } from '@nestjs/common';

@Resolver(() => JobType)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [JobType], { name: 'jobs' })
  @UseGuards(GqlAuthGuardService)
  jobs(
    @Args('jobsFilter', { nullable: true }) jobsFilter?: JobsFilter
  ): JobType[] {
    return this.jobsService.getJobs(jobsFilter);
  }

  @Mutation(() => JobType)
  @UseGuards(GqlAuthGuardService)
  async executeJob(@Args('jobName') jobName: string): Promise<JobType> {
    return this.jobsService.executeJob(jobName);
  }
}
