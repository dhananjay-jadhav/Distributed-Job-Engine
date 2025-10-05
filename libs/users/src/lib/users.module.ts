import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthDbModule } from '@jobber/auth-db';

@Module({
  imports: [AuthDbModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [],
})
export class UsersModule {}
