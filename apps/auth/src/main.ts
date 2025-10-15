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
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/proto';
import { join } from 'path';
import { Logger } from 'nestjs-pino';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const globalPrefix = 'api';
  const logger = app.get(Logger);

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(new ValidationPipe({}));

  app.use(cookieParser());

  app.useLogger(logger);

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, 'protos/auth.proto'),
    },
  });

  await app.startAllMicroservices();

  const port = app.get(ConfigService).getOrThrow('USER_PORT') || 3000;
  await app.listen(port);
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
