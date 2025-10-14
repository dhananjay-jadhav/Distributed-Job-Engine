/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'newrelic';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const logger = app.get(Logger);

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(new ValidationPipe({}));

  app.use(cookieParser());

  app.useLogger(logger);

  const port = app.get(ConfigService).get('JOBS_PORT') || 3000;

  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
