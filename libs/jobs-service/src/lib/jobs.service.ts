import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DiscoveredClassWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { JOBS_METADATA_KEY } from './decorator/jobs.decortor';
import { JobsFilter, JobsMetaData } from '@jobber/common-utils';
import { AbstractJob } from './jobs/abstract.job';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobsMetaData>[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit(): Promise<void> {
    this.jobs =
      await this.discoveryService.providersWithMetaAtKey<JobsMetaData>(
        JOBS_METADATA_KEY
      );
  }

  findJobByName = (jobName: string): DiscoveredClassWithMeta<JobsMetaData> | undefined => {
    return this.jobs.find(
      (job) => job.meta.name.toLowerCase() === jobName?.toLowerCase()
    );
  };

  findOrFailJobByName = (
    jobName: string
  ): DiscoveredClassWithMeta<JobsMetaData> => {
    const job = this.findJobByName(jobName);
    if (!job) {
      throw new Error(`Did not found the Job : ${jobName}`);
    }
    return job;
  };

  getJobs(input?: JobsFilter): JobsMetaData[] {
    if (input && input?.name) {
      const job = this.findOrFailJobByName(input.name);
      return [job.meta];
    }
    return this.jobs.map((job) => job.meta);
  }

  async executeJob(jobName: string): Promise<JobsMetaData> {
    const job = this.findOrFailJobByName(jobName);
    await (job.discoveredClass.instance as AbstractJob).execute();
    return job.meta;
  }
}
