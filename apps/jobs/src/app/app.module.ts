import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JobsServiceModule } from '@jobber/jobs-service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    JobsServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
