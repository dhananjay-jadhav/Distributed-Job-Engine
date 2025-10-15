import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client, Producer } from 'pulsar-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PulsarProducerClient implements OnModuleDestroy {
  private readonly client!: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      serviceUrl: configService.getOrThrow('PULSAR_SERVICE_URLS'),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  async createProducer(topicName: string): Promise<Producer> {
    return await this.client.createProducer({
      topic: topicName,
    });
  }
}
