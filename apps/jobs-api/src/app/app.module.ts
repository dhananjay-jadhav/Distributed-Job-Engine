import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from '@jobber/jobs';
import { JobsApiModule } from '../api/jobs-api.module';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import createPlugin = require('@newrelic/apollo-server-plugin');
import { LoggerModule } from 'nestjs-pino';
import { ApolloServerPlugin } from '@apollo/server';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        quietReqLogger: true,
        quietResLogger: true,
      },
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      path: 'api/graphql',
      autoSchemaFile: {
        path: join(process.cwd(), 'apps/jobs-api/src/schema.gql'),
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
    JobsModule,
    JobsApiModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
