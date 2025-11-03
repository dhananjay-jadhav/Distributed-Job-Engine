import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '../health/health.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import createPlugin = require('@newrelic/apollo-server-plugin');
import { ApolloServerPlugin } from '@apollo/server';
import { LoggerModule } from 'nestjs-pino';

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
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        path: '/api/graphql',
        playground: false,
        plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        createPlugin<ApolloServerPlugin>({}),
      ],
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'auth',
              url: process.env.AUTH_SUBGRAPH_URL || 'http://localhost:3000/api/graphql',
            },
            {
              name: 'jobs',
              url: process.env.JOBS_SUBGRAPH_URL || 'http://localhost:3001/api/graphql',
            },
          ],
        }),
        debug: false,
      },
    }),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


