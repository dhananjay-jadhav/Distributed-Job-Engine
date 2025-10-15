import { PulsarProducerClient } from '@jobber/apache-pulsar';
import { OnModuleDestroy } from '@nestjs/common';
import { Producer } from 'pulsar-client';

export abstract class AbstractJob implements OnModuleDestroy {
  private producer!: Producer;

  constructor(private readonly pulsarProducerClient: PulsarProducerClient) {}

  async execute(data: object, topicName: string): Promise<void> {
    if (!this.producer) {
      this.producer = await this.pulsarProducerClient.createProducer(topicName);
    }
    await this.producer.send({
      data: Buffer.from(JSON.stringify(data)),
    });
    console.log('Published event to the Apache pulsar....!!!');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.close();
    }
  }
}
