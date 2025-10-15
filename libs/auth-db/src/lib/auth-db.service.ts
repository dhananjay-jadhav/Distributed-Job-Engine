import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/auth-db';

@Injectable()
export class AuthDbService extends PrismaClient implements OnModuleInit {
    async onModuleInit(): Promise<void> {
        await this.$connect();
    }
}
