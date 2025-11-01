/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'newrelic';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser = require('cookie-parser');
import { Logger } from 'nestjs-pino';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  
  app.useGlobalPipes(new ValidationPipe({}));
  app.use(cookieParser());
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get('GATEWAY_PORT') || 4000;

  await app.listen(port);
  logger.log(
    `🚀 Apollo Gateway is running on: http://localhost:${port}/api/graphql`
  );
  logger.log(
    `🔗 Connecting to subgraphs:\n` +
    `   - Auth: ${configService.get('AUTH_SUBGRAPH_URL') || 'http://localhost:3000/api/graphql'}\n` +
    `   - Jobs: ${configService.get('JOBS_SUBGRAPH_URL') || 'http://localhost:3001/api/graphql'}`
  );
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
