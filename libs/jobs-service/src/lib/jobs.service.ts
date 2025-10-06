import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DiscoveredClassWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { JOBS_METADATA_KEY } from './decorator/jobs.decortor';
import { AbstractJob } from './jobs/abstract.job';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<AbstractJob>[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.jobs = await this.discoveryService.providersWithMetaAtKey<AbstractJob>(
      JOBS_METADATA_KEY
    );
  }
}
