import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthServiceModule } from '@jobber/auth-service';

@Module({
  imports: [AuthServiceModule],
  providers: [AuthResolver],
})
export class AuthApiModule {}
