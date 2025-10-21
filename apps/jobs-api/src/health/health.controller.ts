import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @InjectPinoLogger(HealthController.name)
    private readonly logger: PinoLogger
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    this.logger.debug('Health check requested');
    try {
      const result = await this.health.check([]);
      this.logger.debug({ status: result.status }, 'Health check completed');
      return result;
    } catch (error) {
      this.logger.error({ error }, 'Health check failed');
      throw error;
    }
  }
}
