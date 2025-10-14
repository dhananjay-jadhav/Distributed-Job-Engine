import { Module } from '@nestjs/common';
import { AuthDbModule } from '@jobber/auth-db';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { UsersApiModule } from '@jobber/users-api';
import { ConfigModule } from '@nestjs/config';
import { AuthApiModule } from '@jobber/auth-api';
import { LoggerModule } from 'nestjs-pino';
import createPlugin = require('@newrelic/apollo-server-plugin');
import { ApolloServerPlugin } from '@apollo/server';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    LoggerModule.forRoot(),
    AuthDbModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      path: 'api/graphql',
      autoSchemaFile: {
        path: join(process.cwd(), 'apps/auth/src/schema.gql'),
        federation: 2,
      },
      sortSchema: true,
      playground: false,
      context: ({ req, res }) => ({ req, res }),
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        createPlugin<ApolloServerPlugin>({}),
      ],
    }),
    UsersApiModule,
    AuthApiModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
