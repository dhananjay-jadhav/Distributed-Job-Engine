import { Test, TestingModule } from '@nestjs/testing';
import { PulsarProducerClient } from './pulsar-producer.client';
import { ConfigModule } from '@nestjs/config';

describe('PulsarProducerClient', () => {
  let service: PulsarProducerClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
      ],
      providers: [PulsarProducerClient],
    }).compile();

    service = module.get<PulsarProducerClient>(PulsarProducerClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
