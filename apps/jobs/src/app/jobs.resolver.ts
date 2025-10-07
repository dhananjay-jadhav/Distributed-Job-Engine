import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JobsService } from '@jobber/jobs-service';
import { JobsFilter, JobType } from '@jobber/common-utils';

@Resolver(() => JobType)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [JobType], { name: 'jobs' })
  jobs(
    @Args('jobsFilter', { nullable: true }) jobsFilter?: JobsFilter
  ): JobType[] {
    return this.jobsService.getJobs(jobsFilter);
  }

  @Mutation(() => JobType)
  async executeJob(@Args('jobName') jobName: string): Promise<JobType> {
    return this.jobsService.executeJob(jobName);
  }
}
