import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/auth-db';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthDbService extends PrismaClient implements OnModuleInit {
    constructor(
        @InjectPinoLogger(AuthDbService.name)
        private readonly logger: PinoLogger
    ) {
        super();
    }

    async onModuleInit(): Promise<void> {
        this.logger.info('Connecting to database');
        try {
            await this.$connect();
            this.logger.info('Database connected successfully');
        } catch (error) {
            this.logger.error({ error }, 'Failed to connect to database');
            throw error;
        }
    }
}
