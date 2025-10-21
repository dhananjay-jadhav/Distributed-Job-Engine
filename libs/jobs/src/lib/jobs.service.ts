import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DiscoveredClassWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { JOBS_METADATA_KEY } from './decorator/jobs.decortor';
import { JobsFilter, JobsMetaData } from '@jobber/common-utils';
import { AbstractJob } from './jobs/abstract.job';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobsMetaData>[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    @InjectPinoLogger(JobsService.name)
    private readonly logger: PinoLogger
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.info('Initializing JobsService and discovering jobs');
    this.jobs =
      await this.discoveryService.providersWithMetaAtKey<JobsMetaData>(
        JOBS_METADATA_KEY
      );
    this.logger.info({ jobCount: this.jobs.length, jobs: this.jobs.map(j => j.meta.name) }, 'Jobs discovered successfully');
  }

  findJobByName = (
    jobName: string
  ): DiscoveredClassWithMeta<JobsMetaData> | undefined => {
    this.logger.debug({ jobName }, 'Searching for job by name');
    return this.jobs.find(
      (job) => job.meta.name.toLowerCase() === jobName?.toLowerCase()
    );
  };

  findOrFailJobByName = (
    jobName: string
  ): DiscoveredClassWithMeta<JobsMetaData> => {
    const job = this.findJobByName(jobName);
    if (!job) {
      this.logger.warn({ jobName }, 'Job not found');
      throw new Error(`Did not found the Job : ${jobName}`);
    }
    this.logger.debug({ jobName, jobDescription: job.meta.description }, 'Job found');
    return job;
  };

  getJobs(input?: JobsFilter): JobsMetaData[] {
    this.logger.debug({ input }, 'Getting jobs list');
    if (input && input?.name) {
      const job = this.findOrFailJobByName(input.name);
      return [job.meta];
    }
    this.logger.debug({ jobCount: this.jobs.length }, 'Returning all jobs');
    return this.jobs.map((job) => job.meta);
  }

  async executeJob(jobName: string): Promise<JobsMetaData> {
    this.logger.info({ jobName }, 'Executing job');
    try {
      const job = this.findOrFailJobByName(jobName);
      await (job.discoveredClass.instance as AbstractJob).execute({}, jobName);
      this.logger.info({ jobName }, 'Job executed successfully');
      return job.meta;
    } catch (error) {
      this.logger.error({ jobName, error }, 'Job execution failed');
      throw error;
    }
  }
}
