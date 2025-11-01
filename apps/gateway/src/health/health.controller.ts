import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HttpHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const authUrl = this.configService.get('AUTH_SUBGRAPH_URL') || 'http://localhost:3000/api/graphql';
    const jobsUrl = this.configService.get('JOBS_SUBGRAPH_URL') || 'http://localhost:3001/api/graphql';

    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.http.pingCheck('auth-subgraph', authUrl),
      (): Promise<HealthIndicatorResult> => this.http.pingCheck('jobs-subgraph', jobsUrl),
    ]);
  }
}
