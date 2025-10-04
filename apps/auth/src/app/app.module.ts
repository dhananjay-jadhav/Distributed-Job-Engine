import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthDbModule } from '@distributed-job-engine-with-g-rpc/auth-db';

@Module({
  imports: [AuthDbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
