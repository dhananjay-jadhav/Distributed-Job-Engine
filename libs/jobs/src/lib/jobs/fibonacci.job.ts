import { PulsarProducerClient } from '@jobber/apache-pulsar';
import { Jobs } from '../decorator/jobs.decortor';
import { AbstractJob } from './abstract.job';

@Jobs({
  name: 'Fibonacci',
  description: 'Generate a Fibonacci sequence and store it in DB',
})
export class FibonacciJob extends AbstractJob {
  constructor(pulsarProducerClient: PulsarProducerClient) {
    super(pulsarProducerClient);
  }
}
