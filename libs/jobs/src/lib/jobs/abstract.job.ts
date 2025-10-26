import { PulsarProducerClient } from '@jobber/apache-pulsar';
import { OnModuleDestroy } from '@nestjs/common';
import { Producer } from 'pulsar-client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export abstract class AbstractJob implements OnModuleDestroy {
  private producer!: Producer;

  @InjectPinoLogger()
  protected readonly logger!: PinoLogger;

  constructor(private readonly pulsarProducerClient: PulsarProducerClient) {}

  async execute(data: object, topicName: string): Promise<void> {
    this.logger.info({ topicName, data }, 'Executing job and publishing to Apache Pulsar');
    try {
      if (!this.producer) {
        this.logger.debug({ topicName }, 'Creating new Pulsar producer');
        this.producer = await this.pulsarProducerClient.createProducer(topicName);
      }
      const messageId = await this.producer.send({
        data: Buffer.from(JSON.stringify(data)),
      });

      this.logger.info({ topicName, messageId: messageId.toString() }, 'Event published to Apache Pulsar successfully');
    } catch (error) {
      this.logger.error({ topicName, data, error }, 'Failed to publish event to Apache Pulsar');
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      this.logger.info('Closing Pulsar producer');
      try {
        await this.producer.close();
        this.logger.info('Pulsar producer closed successfully');
      } catch (error) {
        this.logger.error({ error }, 'Failed to close Pulsar producer');
      }
    }
  }
}
