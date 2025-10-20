import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersModule } from '@jobber/users';

@Module({
  imports: [UsersModule],
  providers: [UsersResolver],
  exports: [],
})
export class UsersApiModule {}
