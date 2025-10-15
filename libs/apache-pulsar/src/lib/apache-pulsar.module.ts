import { Module } from '@nestjs/common';
import { PulsarProducerClient } from './pulsar-producer.client';

@Module({
  controllers: [],
  providers: [PulsarProducerClient],
  exports: [PulsarProducerClient],
})
export class ApachePulsarModule {}
